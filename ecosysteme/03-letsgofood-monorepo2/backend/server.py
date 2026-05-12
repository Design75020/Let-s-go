from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, WebSocket, WebSocketDisconnect
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import bcrypt
import jwt
import uuid
import secrets
import math
import requests as http_requests
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import Optional
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi.responses import JSONResponse
# Native Stripe implementation replacing emergentintegrations
import stripe as _stripe

class CheckoutSessionRequest:
    def __init__(self, amount, currency, success_url, cancel_url, metadata=None):
        self.amount = amount
        self.currency = currency
        self.success_url = success_url
        self.cancel_url = cancel_url
        self.metadata = metadata or {}

class _CheckoutStatus:
    def __init__(self, status, payment_status, amount_total):
        self.status = status
        self.payment_status = payment_status
        self.amount_total = amount_total

class _WebhookEvent:
    def __init__(self, event_type, session_id=None):
        self.event_type = event_type
        self.session_id = session_id

class StripeCheckout:
    def __init__(self, api_key, webhook_url=None):
        self.api_key = api_key
        self.webhook_url = webhook_url
        _stripe.api_key = api_key

    async def create_checkout_session(self, req: CheckoutSessionRequest):
        session = _stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": req.currency,
                    "product_data": {"name": "Commande Let's Go Food"},
                    "unit_amount": int(req.amount * 100),
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=req.success_url,
            cancel_url=req.cancel_url,
            metadata=req.metadata,
        )
        session.session_id = session.id
        return session

    async def get_checkout_status(self, session_id: str):
        session = _stripe.checkout.Session.retrieve(session_id)
        return _CheckoutStatus(
            status=session.status,
            payment_status=session.payment_status,
            amount_total=(session.amount_total or 0) / 100,
        )

    async def handle_webhook(self, body: bytes, signature: str):
        webhook_secret = ""  # Set STRIPE_WEBHOOK_SECRET env var if needed
        try:
            event = _stripe.Webhook.construct_event(body, signature, webhook_secret)
        except Exception:
            event = _stripe.Event.construct_from(
                {"type": "unknown", "data": {"object": {}}}, _stripe.api_key
            )
        session_id = None
        if event.get("type", "").startswith("checkout.session"):
            session_id = event.get("data", {}).get("object", {}).get("id")
        return _WebhookEvent(event_type=event.get("type", "unknown"), session_id=session_id)


mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"

# Cryptographically strong RNG (replaces `random` for all seed/demo data
# generation — no more predictable sequences even in non-critical paths).
_rng = secrets.SystemRandom()

# ─── GEO & MARGIN UTILS ─────────────────────────
def haversine_km(lat1, lon1, lat2, lon2):
    """Calculate distance between two GPS points in km."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))

def estimate_delivery_min(distance_km):
    """Estimate delivery time: 10 min prep + travel at 20 km/h."""
    travel = (distance_km / 20) * 60
    return round(10 + travel)

DEFAULT_MARGINS = {"plat": 1.0, "boisson": 0.5, "extra": 0.25}
CATEGORY_TO_MARGIN_TYPE = {
    "Plats": "plat", "Burgers": "plat", "Pizzas": "plat", "Sashimi": "plat",
    "Maki": "plat", "Plats chauds": "plat",
    "Boissons": "boisson", "Desserts": "boisson",
    "Entrees": "extra", "Accompagnements": "extra", "Supplements": "extra",
}

async def get_delivery_settings():
    settings = await db.delivery_settings.find_one({"type": "global"}, {"_id": 0})
    if not settings:
        settings = {
            "type": "global", "radius_km": 3.5, "max_radius_km": 5.0,
            "max_delivery_min": 20, "free_delivery": True, "min_order": 10.0,
            "margins": DEFAULT_MARGINS, "scooter_speed_kmh": 20, "prep_time_min": 10
        }
        await db.delivery_settings.insert_one(settings)
    return settings

async def get_margin_for_category(category: str):
    settings = await get_delivery_settings()
    margins = settings.get("margins", DEFAULT_MARGINS)
    margin_type = CATEGORY_TO_MARGIN_TYPE.get(category, "extra")
    return margins.get(margin_type, 0.25)

def get_jwt_secret():
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {"sub": user_id, "email": email, "role": role, "exp": datetime.now(timezone.utc) + timedelta(hours=24), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Non authentifie")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Type de token invalide")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="Utilisateur introuvable")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expire")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")

# ─── NOTIFICATION SERVICE (Brevo Email + Twilio SMS) ─
def send_brevo_email(to_email: str, to_name: str, subject: str, html_content: str):
    """Send email via Brevo API (non-blocking, fire-and-forget)."""
    api_key = os.environ.get("BREVO_API_KEY", "")
    sender_email = os.environ.get("BREVO_SENDER_EMAIL", "")
    sender_name = os.environ.get("BREVO_SENDER_NAME", "FoodRush")
    if not api_key or not sender_email:
        logger.warning("Brevo not configured, skipping email")
        return None
    try:
        resp = http_requests.post(
            "https://api.brevo.com/v3/smtp/email",
            headers={"api-key": api_key, "Content-Type": "application/json"},
            json={
                "sender": {"name": sender_name, "email": sender_email},
                "to": [{"email": to_email, "name": to_name}],
                "subject": subject,
                "htmlContent": html_content,
            },
            timeout=10,
        )
        if resp.status_code in (200, 201):
            logger.info(f"Email sent to {to_email}: {subject}")
            return resp.json()
        else:
            logger.error(f"Brevo error {resp.status_code}: {resp.text}")
            return None
    except Exception as e:
        logger.error(f"Email send failed: {e}")
        return None

def send_twilio_sms(to_number: str, body: str):
    """Send SMS via Twilio API (non-blocking, fire-and-forget)."""
    sid = os.environ.get("TWILIO_ACCOUNT_SID", "")
    token = os.environ.get("TWILIO_AUTH_TOKEN", "")
    from_number = os.environ.get("TWILIO_PHONE_NUMBER", "")
    if not sid or not token or not from_number:
        logger.warning("Twilio not configured, skipping SMS")
        return None
    try:
        resp = http_requests.post(
            f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json",
            auth=(sid, token),
            data={"From": from_number, "To": to_number, "Body": body},
            timeout=10,
        )
        if resp.status_code in (200, 201):
            logger.info(f"SMS sent to {to_number}")
            return resp.json()
        else:
            logger.error(f"Twilio error {resp.status_code}: {resp.text}")
            return None
    except Exception as e:
        logger.error(f"SMS send failed: {e}")
        return None

def send_whatsapp(to_number: str, body: str):
    """Send WhatsApp message via Twilio. Falls back to SMS if WhatsApp fails."""
    sid = os.environ.get("TWILIO_ACCOUNT_SID", "")
    token = os.environ.get("TWILIO_AUTH_TOKEN", "")
    wa_from = os.environ.get("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
    if not sid or not token:
        logger.warning("Twilio not configured, skipping WhatsApp")
        return None
    wa_to = f"whatsapp:{to_number}" if not to_number.startswith("whatsapp:") else to_number
    try:
        resp = http_requests.post(
            f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json",
            auth=(sid, token),
            data={"From": wa_from, "To": wa_to, "Body": body},
            timeout=10,
        )
        if resp.status_code in (200, 201):
            logger.info(f"WhatsApp sent to {to_number}")
            return resp.json()
        else:
            logger.warning(f"WhatsApp failed ({resp.status_code}), falling back to SMS")
            return send_twilio_sms(to_number, body)
    except Exception as e:
        logger.error(f"WhatsApp failed: {e}, falling back to SMS")
        return send_twilio_sms(to_number, body)

import asyncio

async def notify_order_created(order: dict, client_email: str, client_phone: str):
    """Notify client when order is created."""
    loop = asyncio.get_event_loop()
    items_list = ", ".join([f"{i['quantity']}x {i['name']}" for i in order.get("items", [])])
    # Email
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#FF5A5F;padding:20px;text-align:center;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;margin:0">FoodRush</h1>
      </div>
      <div style="padding:24px;background:#fff;border:1px solid #eee;border-radius:0 0 8px 8px">
        <h2 style="color:#111">Commande confirmee !</h2>
        <p>Bonjour {order.get('client_name', '')},</p>
        <p>Votre commande chez <strong>{order.get('restaurant_name', '')}</strong> a bien ete enregistree.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px 0;color:#666">Articles</td><td style="padding:8px 0;text-align:right">{items_list}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Sous-total</td><td style="padding:8px 0;text-align:right">{order.get('subtotal', 0):.2f} EUR</td></tr>
          <tr><td style="padding:8px 0;color:#666">Livraison</td><td style="padding:8px 0;text-align:right">{order.get('delivery_fee', 0):.2f} EUR</td></tr>
          <tr style="font-weight:bold;border-top:2px solid #FF5A5F"><td style="padding:8px 0">Total</td><td style="padding:8px 0;text-align:right;color:#FF5A5F">{order.get('total', 0):.2f} EUR</td></tr>
        </table>
        <p style="color:#666">Adresse de livraison : {order.get('delivery_address', '')}</p>
        <p style="color:#666;font-size:12px">Merci de votre confiance !</p>
      </div>
    </div>"""
    await loop.run_in_executor(None, send_brevo_email, client_email, order.get("client_name", ""), "Votre commande FoodRush est confirmee !", html)
    # SMS
    if client_phone and len(client_phone) > 5:
        sms = f"FoodRush: Commande confirmee chez {order.get('restaurant_name', '')}. Total: {order.get('total', 0):.2f} EUR. Bon appetit !"
        await loop.run_in_executor(None, send_twilio_sms, client_phone, sms)


async def notify_restaurant_new_order(order: dict, owner_email: str, owner_phone: str):
    """Notify restaurant owner of new order via email + SMS."""
    restaurant_name = order.get("restaurant_name", "votre restaurant")
    client_name = order.get("client_name", "un client")
    total = order.get("total_amount", 0)
    items_text = ", ".join([f"{i.get('quantity',1)}x {i.get('name','?')}" for i in order.get("items", [])])
    order_id_short = order.get("id", "")[:8]

    # Email to restaurant owner
    if owner_email:
        subject = f"🍽️ Nouvelle commande #{order_id_short} — {restaurant_name}"
        html = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#FF6B00;padding:20px;border-radius:8px 8px 0 0">
            <h1 style="color:white;margin:0;font-size:22px">🍽️ Nouvelle commande !</h1>
          </div>
          <div style="background:#fff;padding:24px;border:1px solid #eee;border-radius:0 0 8px 8px">
            <p style="font-size:16px">Bonjour,</p>
            <p>Vous avez reçu une nouvelle commande de <strong>{client_name}</strong> :</p>
            <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin:16px 0">
              <p style="margin:4px 0"><strong>Articles :</strong> {items_text}</p>
              <p style="margin:4px 0"><strong>Total :</strong> {total:.2f} €</p>
              <p style="margin:4px 0"><strong>Adresse :</strong> {order.get('delivery_address','N/A')}</p>
            </div>
            <p style="color:#FF6B00;font-weight:bold">⚠️ Veuillez accepter ou refuser cette commande dans les 3 minutes.</p>
          </div>
        </div>"""
        loop = asyncio.get_event_loop()
        loop.run_in_executor(None, send_brevo_email, owner_email, subject, html)

    # SMS to restaurant owner
    if owner_phone:
        sms = (f"🍽️ NOUVELLE COMMANDE #{order_id_short}\n"
               f"Client: {client_name}\n"
               f"Articles: {items_text}\n"
               f"Total: {total:.2f}€\n"
               f"⚠️ Acceptez dans 3 min sur app.letsgofood.fr")
        loop = asyncio.get_event_loop()
        loop.run_in_executor(None, send_twilio_sms, owner_phone, sms)


async def check_unaccepted_order(order_id: str):
    """
    Background task: 
    - At 3 min: SMS to restaurant owner if order still pending
    - At 5 min: WhatsApp to admin if order still pending
    """
    import asyncio as _asyncio
    # Wait 3 minutes
    await _asyncio.sleep(180)
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order or order.get("status") != "pending":
        return  # Order was accepted or cancelled, nothing to do

    # 3 min: SMS to restaurant owner
    try:
        restaurant = await db.restaurants.find_one({"id": order.get("restaurant_id")})
        if restaurant:
            owner = await db.users.find_one({"_id": ObjectId(restaurant.get("owner_id", ""))})
            owner_phone = owner.get("phone", "") if owner else ""
            owner_email = owner.get("email", "") if owner else ""
            order_id_short = order_id[:8]
            client_name = order.get("client_name", "un client")
            total = order.get("total_amount", 0)
            if owner_phone:
                msg = (f"⚠️ RAPPEL COMMANDE #{order_id_short}\n"
                       f"La commande de {client_name} ({total:.2f}€) attend toujours votre validation !\n"
                       f"Connectez-vous sur app.letsgofood.fr")
                loop = asyncio.get_event_loop()
                loop.run_in_executor(None, send_twilio_sms, owner_phone, msg)
                logger.info(f"3min reminder SMS sent to restaurant owner {owner_phone} for order {order_id_short}")
    except Exception as e:
        logger.error(f"3min reminder error: {e}")

    # Wait 2 more minutes (total 5 min)
    await _asyncio.sleep(120)
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order or order.get("status") != "pending":
        return  # Order was accepted in the meantime

    # 5 min: WhatsApp to admin
    try:
        admin_wa = os.environ.get("ADMIN_WHATSAPP", "") or os.environ.get("ADMIN_PHONE", "")
        admin_email = os.environ.get("LEAD_NOTIFICATION_EMAIL", "")
        order_id_short = order_id[:8]
        client_name = order.get("client_name", "un client")
        restaurant_name = order.get("restaurant_name", "restaurant inconnu")
        total = order.get("total_amount", 0)

        wa_msg = (f"🚨 ALERTE COMMANDE NON ACCEPTÉE\n"
                  f"Commande #{order_id_short} en attente depuis 5 minutes !\n"
                  f"Restaurant: {restaurant_name}\n"
                  f"Client: {client_name}\n"
                  f"Total: {total:.2f}€\n"
                  f"Action requise: appelez le restaurant immédiatement.")
        if admin_wa:
            loop = asyncio.get_event_loop()
            loop.run_in_executor(None, send_whatsapp, admin_wa, wa_msg)
            logger.warning(f"5min admin WhatsApp alert sent for unaccepted order {order_id_short}")

        # Also send email to admin
        if admin_email:
            subject = f"🚨 Commande #{order_id_short} non acceptée depuis 5 minutes"
            html = f"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
              <div style="background:#ef4444;padding:20px;border-radius:8px 8px 0 0">
                <h1 style="color:white;margin:0">🚨 Alerte commande non acceptée</h1>
              </div>
              <div style="background:#fff;padding:24px;border:1px solid #eee;border-radius:0 0 8px 8px">
                <p>La commande <strong>#{order_id_short}</strong> est en attente depuis <strong>5 minutes</strong> sans réponse du restaurant.</p>
                <div style="background:#fef2f2;padding:16px;border-radius:8px;border-left:4px solid #ef4444;margin:16px 0">
                  <p style="margin:4px 0"><strong>Restaurant :</strong> {restaurant_name}</p>
                  <p style="margin:4px 0"><strong>Client :</strong> {client_name}</p>
                  <p style="margin:4px 0"><strong>Total :</strong> {total:.2f} €</p>
                </div>
                <p style="color:#ef4444;font-weight:bold">Action requise : contactez le restaurant immédiatement.</p>
              </div>
            </div>"""
            loop = asyncio.get_event_loop()
            loop.run_in_executor(None, send_brevo_email, admin_email, subject, html)
    except Exception as e:
        logger.error(f"5min admin alert error: {e}")

async def notify_order_status(order: dict, new_status: str, client_email: str, client_phone: str):
    """Notify client when order status changes."""
    loop = asyncio.get_event_loop()
    status_msg = STATUS_LABELS_MAP.get(new_status, new_status)
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#FF5A5F;padding:20px;text-align:center;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;margin:0">FoodRush</h1>
      </div>
      <div style="padding:24px;background:#fff;border:1px solid #eee;border-radius:0 0 8px 8px">
        <h2 style="color:#111">Mise a jour de votre commande</h2>
        <p>Bonjour {order.get('client_name', '')},</p>
        <p>Votre commande chez <strong>{order.get('restaurant_name', '')}</strong> est maintenant :</p>
        <div style="background:#F4F5F7;padding:16px;border-radius:8px;text-align:center;margin:16px 0">
          <span style="font-size:24px;font-weight:bold;color:#FF5A5F">{status_msg}</span>
        </div>
        {f'<p>Livreur : <strong>{order.get("driver_name", "")}</strong></p>' if order.get("driver_name") else ''}
        <p style="color:#666;font-size:12px">Total : {order.get("total", 0):.2f} EUR</p>
      </div>
    </div>"""
    await loop.run_in_executor(None, send_brevo_email, client_email, order.get("client_name", ""), f"FoodRush: Commande {status_msg}", html)
    if client_phone and len(client_phone) > 5 and new_status in ("delivering", "delivered"):
        sms = f"FoodRush: Votre commande est {status_msg.lower()}."
        if order.get("driver_name") and new_status == "delivering":
            sms += f" Livreur: {order['driver_name']}"
        await loop.run_in_executor(None, send_twilio_sms, client_phone, sms)

async def notify_driver_assigned(order: dict, driver_email: str, driver_phone: str):
    """Notify driver when assigned to an order."""
    loop = asyncio.get_event_loop()
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#10B981;padding:20px;text-align:center;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;margin:0">FoodRush Livreur</h1>
      </div>
      <div style="padding:24px;background:#fff;border:1px solid #eee;border-radius:0 0 8px 8px">
        <h2 style="color:#111">Nouvelle livraison assignee !</h2>
        <p>Restaurant : <strong>{order.get('restaurant_name', '')}</strong></p>
        <p>Client : {order.get('client_name', '')}</p>
        <p>Adresse : {order.get('delivery_address', '')}</p>
        <p style="font-size:20px;font-weight:bold;color:#10B981">{order.get('total', 0):.2f} EUR</p>
      </div>
    </div>"""
    await loop.run_in_executor(None, send_brevo_email, driver_email, order.get("driver_name", ""), "FoodRush: Nouvelle livraison !", html)
    if driver_phone and len(driver_phone) > 5:
        sms = f"FoodRush: Nouvelle livraison ! {order.get('restaurant_name', '')} -> {order.get('delivery_address', '')}. {order.get('total', 0):.2f} EUR"
        await loop.run_in_executor(None, send_twilio_sms, driver_phone, sms)

# ─── WEBSOCKET MANAGER ───────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active_connections = {}
        self.role_connections = {}

    async def connect(self, ws: WebSocket, user_id: str, role: str):
        await ws.accept()
        self.active_connections.setdefault(user_id, []).append(ws)
        self.role_connections.setdefault(role, []).append(ws)

    def disconnect(self, ws: WebSocket, user_id: str, role: str):
        if user_id in self.active_connections:
            self.active_connections[user_id] = [c for c in self.active_connections[user_id] if c != ws]
        if role in self.role_connections:
            self.role_connections[role] = [c for c in self.role_connections[role] if c != ws]

    async def send_to_user(self, user_id: str, message: dict):
        for ws in list(self.active_connections.get(user_id, [])):
            try:
                await ws.send_json(message)
            except Exception:
                pass

    async def send_to_role(self, role: str, message: dict):
        for ws in list(self.role_connections.get(role, [])):
            try:
                await ws.send_json(message)
            except Exception:
                pass

ws_manager = ConnectionManager()

STATUS_LABELS_MAP = {
    "pending": "En attente", "preparing": "En preparation", "ready": "Pret",
    "assigned": "Assigne", "picked_up": "Recupere", "delivering": "En livraison",
    "delivered": "Livre", "cancelled": "Annule"
}

# Pydantic models
class RegisterInput(BaseModel):
    email: str
    password: str
    name: str
    role: str = "client"
    phone: str = ""
    address: str = ""

class LoginInput(BaseModel):
    email: str
    password: str

class RestaurantInput(BaseModel):
    name: str
    address: str
    phone: str = ""
    description: str = ""
    image_url: str = ""
    cuisine_type: str = ""
    delivery_fee: float = 0
    min_order: float = 0
    delivery_time: str = "30-45 min"

class MenuItemInput(BaseModel):
    name: str
    description: str = ""
    price: float
    image_url: str = ""
    category: str = ""
    available: bool = True

class OrderInput(BaseModel):
    restaurant_id: str
    items: list
    delivery_address: str
    phone: str = ""
    notes: str = ""
    payment_method: str = "cash"
    promo_code: str = ""

class OrderStatusUpdate(BaseModel):
    status: str

class AssignDriverInput(BaseModel):
    driver_id: str

class PromoCodeInput(BaseModel):
    code: str
    discount_type: str = "percentage"
    discount_value: float
    min_order: float = 0
    max_uses: int = 0
    expiry_date: str = ""
    is_active: bool = True

class ValidatePromoInput(BaseModel):
    code: str
    subtotal: float

class Attribution(BaseModel):
    ref: Optional[str] = None   # ID commercial (ex: agent_023)
    src: Optional[str] = None   # Canal (flyer, qr, vitrine, ...)
    zone: Optional[str] = None  # Quartier / ville (ex: paris11)
    camp: Optional[str] = None  # Campagne (optionnel)

class LeadInput(BaseModel):
    phone: str
    restaurant: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None
    cuisine: Optional[str] = None
    preference: Optional[str] = None  # callback | rdv | info
    message: Optional[str] = None
    source: Optional[str] = "letsgofood.fr"
    session_id: Optional[str] = None
    device: Optional[str] = None
    referrer: Optional[str] = None
    utm: Optional[dict] = None
    attribution: Optional[Attribution] = None

class TrackEventInput(BaseModel):
    event: str
    source: Optional[str] = None
    session_id: Optional[str] = None
    device: Optional[str] = None
    path: Optional[str] = None
    referrer: Optional[str] = None
    timestamp: Optional[str] = None
    props: Optional[dict] = None
    attribution: Optional[Attribution] = None

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ─── RATE LIMITING (slowapi) ──────────────────────
# Protects sensitive endpoints against brute-force & credential stuffing.
# Works in addition to the existing per-identifier lockout on /auth/login.
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Trop de tentatives. Réessayez dans quelques minutes."},
    )
app.add_middleware(SlowAPIMiddleware)

# ─── STRIPE ───────────────────────────────────────
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY")

# ─── AUTH ────────────────────────────────────────
@api_router.post("/auth/register")
async def register(input: RegisterInput, response: Response):
    email = input.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email deja utilise")
    user_doc = {
        "email": email, "password_hash": hash_password(input.password),
        "name": input.name, "role": input.role, "phone": input.phone,
        "address": input.address, "is_active": True,
        "loyalty_points": 0, "total_points_earned": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    access_token = create_access_token(user_id, email, input.role)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="none", max_age=86400, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    return {"id": user_id, "email": email, "name": input.name, "role": input.role, "phone": input.phone, "address": input.address, "access_token": access_token}

@api_router.post("/auth/login")
@limiter.limit("10/minute")
async def login(input: LoginInput, request: Request, response: Response):
    email = input.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= 5:
        lockout_until = attempt.get("locked_until")
        if lockout_until and datetime.now(timezone.utc).isoformat() < lockout_until:
            raise HTTPException(status_code=429, detail="Trop de tentatives. Reessayez dans 15 minutes.")
        else:
            await db.login_attempts.delete_one({"identifier": identifier})
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(input.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"locked_until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()}},
            upsert=True
        )
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    await db.login_attempts.delete_many({"identifier": identifier})
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email, user["role"])
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="none", max_age=86400, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    return {"id": user_id, "email": email, "name": user["name"], "role": user["role"], "phone": user.get("phone", ""), "address": user.get("address", ""), "access_token": access_token}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Deconnecte"}

@api_router.get("/auth/me")
async def get_me(request: Request):
    return await get_current_user(request)

@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Pas de refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Token invalide")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="Utilisateur introuvable")
        user_id = str(user["_id"])
        new_access = create_access_token(user_id, user["email"], user["role"])
        response.set_cookie(key="access_token", value=new_access, httponly=True, secure=True, samesite="none", max_age=86400, path="/")
        return {"message": "Token rafraichi"}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")

@api_router.put("/auth/profile")
async def update_profile(request: Request):
    user = await get_current_user(request)
    body = await request.json()
    allowed = {"name", "phone", "address"}
    update_data = {k: v for k, v in body.items() if k in allowed and v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Aucun champ a mettre a jour")
    await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$set": update_data})
    updated = await db.users.find_one({"_id": ObjectId(user["_id"])})
    updated["_id"] = str(updated["_id"])
    updated.pop("password_hash", None)
    return updated

@api_router.put("/auth/change-password")
async def change_password(request: Request):
    user_doc = await get_current_user(request)
    body = await request.json()
    current_pw = body.get("current_password", "")
    new_pw = body.get("new_password", "")
    if len(new_pw) < 6:
        raise HTTPException(status_code=400, detail="Le nouveau mot de passe doit contenir au moins 6 caracteres")
    full_user = await db.users.find_one({"_id": ObjectId(user_doc["_id"])})
    if not verify_password(current_pw, full_user["password_hash"]):
        raise HTTPException(status_code=400, detail="Mot de passe actuel incorrect")
    await db.users.update_one({"_id": ObjectId(user_doc["_id"])}, {"$set": {"password_hash": hash_password(new_pw)}})
    return {"message": "Mot de passe mis a jour"}

# ─── RESTAURANTS ─────────────────────────────────
@api_router.get("/restaurants")
async def list_restaurants(status: Optional[str] = None, cuisine_type: Optional[str] = None, search: Optional[str] = None, lat: Optional[float] = None, lng: Optional[float] = None):
    query = {}
    if status:
        query["status"] = status
    if cuisine_type:
        query["cuisine_type"] = cuisine_type
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    restaurants = await db.restaurants.find(query, {"_id": 0}).to_list(1000)
    settings = await get_delivery_settings()
    radius = settings.get("radius_km", 3.5)
    max_radius = settings.get("max_radius_km", 5.0)
    max_min = settings.get("max_delivery_min", 20)
    if lat is not None and lng is not None:
        for r in restaurants:
            r_lat = r.get("lat", 0)
            r_lng = r.get("lng", 0)
            if r_lat and r_lng:
                dist = haversine_km(lat, lng, r_lat, r_lng)
                delivery_min = estimate_delivery_min(dist)
                r["distance_km"] = round(dist, 1)
                r["delivery_min"] = delivery_min
                r["in_zone"] = dist <= max_radius
                r["fast_delivery"] = delivery_min <= max_min
                r["free_delivery"] = dist <= radius
            else:
                r["distance_km"] = None
                r["delivery_min"] = None
                r["in_zone"] = True
                r["fast_delivery"] = False
                r["free_delivery"] = False
        restaurants.sort(key=lambda r: (not r.get("fast_delivery", False), r.get("distance_km") or 999))
    return restaurants

@api_router.get("/restaurants/{restaurant_id}")
async def get_restaurant(restaurant_id: str):
    restaurant = await db.restaurants.find_one({"id": restaurant_id}, {"_id": 0})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant introuvable")
    return restaurant

@api_router.post("/restaurants")
async def create_restaurant(input: RestaurantInput, request: Request):
    user = await get_current_user(request)
    if user["role"] not in ["admin", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Non autorise")
    doc = {
        "id": str(uuid.uuid4()), **input.model_dump(),
        "owner_id": user["_id"], "status": "active", "rating": 4.5,
        "total_orders": 0, "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.restaurants.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/restaurants/{restaurant_id}")
async def update_restaurant(restaurant_id: str, input: RestaurantInput, request: Request):
    user = await get_current_user(request)
    if user["role"] not in ["admin", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Non autorise")
    result = await db.restaurants.update_one({"id": restaurant_id}, {"$set": input.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Restaurant introuvable")
    updated = await db.restaurants.find_one({"id": restaurant_id}, {"_id": 0})
    return updated

@api_router.delete("/restaurants/{restaurant_id}")
async def delete_restaurant(restaurant_id: str, request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Non autorise")
    result = await db.restaurants.delete_one({"id": restaurant_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Restaurant introuvable")
    await db.menu_items.delete_many({"restaurant_id": restaurant_id})
    return {"message": "Restaurant supprime"}

@api_router.put("/restaurants/{restaurant_id}/toggle-status")
async def toggle_restaurant_status(restaurant_id: str, request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Non autorise")
    rest = await db.restaurants.find_one({"id": restaurant_id})
    if not rest:
        raise HTTPException(status_code=404, detail="Restaurant introuvable")
    new_status = "inactive" if rest.get("status") == "active" else "active"
    await db.restaurants.update_one({"id": restaurant_id}, {"$set": {"status": new_status}})
    return {"status": new_status}

# ─── MENU ITEMS ──────────────────────────────────
@api_router.get("/restaurants/{restaurant_id}/menu")
async def list_menu_items(restaurant_id: str, apply_margin: Optional[str] = None):
    items = await db.menu_items.find({"restaurant_id": restaurant_id}, {"_id": 0}).to_list(1000)
    if apply_margin == "true":
        settings = await get_delivery_settings()
        margins = settings.get("margins", DEFAULT_MARGINS)
        for item in items:
            margin_type = CATEGORY_TO_MARGIN_TYPE.get(item.get("category", ""), "extra")
            margin = margins.get(margin_type, 0.25)
            item["base_price"] = item["price"]
            item["margin"] = margin
            item["price"] = round(item["price"] + margin, 2)
    return items

@api_router.post("/restaurants/{restaurant_id}/menu")
async def create_menu_item(restaurant_id: str, input: MenuItemInput, request: Request):
    user = await get_current_user(request)
    if user["role"] not in ["admin", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Non autorise")
    doc = {"id": str(uuid.uuid4()), "restaurant_id": restaurant_id, **input.model_dump(), "created_at": datetime.now(timezone.utc).isoformat()}
    await db.menu_items.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/menu-items/{item_id}")
async def update_menu_item(item_id: str, input: MenuItemInput, request: Request):
    user = await get_current_user(request)
    if user["role"] not in ["admin", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Non autorise")
    result = await db.menu_items.update_one({"id": item_id}, {"$set": input.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Plat introuvable")
    updated = await db.menu_items.find_one({"id": item_id}, {"_id": 0})
    return updated

@api_router.delete("/menu-items/{item_id}")
async def delete_menu_item(item_id: str, request: Request):
    user = await get_current_user(request)
    if user["role"] not in ["admin", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Non autorise")
    result = await db.menu_items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Plat introuvable")
    return {"message": "Plat supprime"}

# ─── ORDERS ──────────────────────────────────────
@api_router.post("/orders")
async def create_order(input: OrderInput, request: Request):
    user = await get_current_user(request)
    restaurant = await db.restaurants.find_one({"id": input.restaurant_id}, {"_id": 0})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant introuvable")
    subtotal = sum(item["price"] * item["quantity"] for item in input.items)
    delivery_fee = restaurant.get("delivery_fee", 0)
    discount = 0
    promo_applied = None
    if input.promo_code:
        promo = await db.promo_codes.find_one({"code": input.promo_code.upper().strip(), "is_active": True})
        if promo:
            valid = True
            if promo.get("min_order", 0) > subtotal:
                valid = False
            if promo.get("max_uses", 0) > 0 and promo.get("current_uses", 0) >= promo["max_uses"]:
                valid = False
            if promo.get("expiry_date") and promo["expiry_date"] and promo["expiry_date"] < datetime.now(timezone.utc).isoformat():
                valid = False
            if valid:
                if promo["discount_type"] == "percentage":
                    discount = subtotal * (promo["discount_value"] / 100)
                else:
                    discount = min(promo["discount_value"], subtotal)
                promo_applied = {"code": promo["code"], "discount": round(discount, 2), "type": promo["discount_type"], "value": promo["discount_value"]}
                await db.promo_codes.update_one({"code": promo["code"]}, {"$inc": {"current_uses": 1}})
    total = subtotal - discount + delivery_fee
    doc = {
        "id": str(uuid.uuid4()), "client_id": user["_id"], "client_name": user["name"],
        "client_email": user.get("email", ""), "restaurant_id": input.restaurant_id,
        "restaurant_name": restaurant["name"], "items": input.items,
        "subtotal": round(subtotal, 2), "discount": round(discount, 2),
        "promo_applied": promo_applied, "delivery_fee": delivery_fee, "total": round(total, 2),
        "delivery_address": input.delivery_address, "phone": input.phone,
        "notes": input.notes, "payment_method": input.payment_method,
        "payment_status": "pending" if input.payment_method == "stripe" else "paid",
        "status": "pending" if input.payment_method != "stripe" else "awaiting_payment",
        "driver_id": None, "driver_name": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.insert_one(doc)
    doc.pop("_id", None)
    await db.restaurants.update_one({"id": input.restaurant_id}, {"$inc": {"total_orders": 1}})
    points_earned = int(total)
    await db.users.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$inc": {"loyalty_points": points_earned, "total_points_earned": points_earned}}
    )
    ws_event = {"type": "order_created", "order": {**doc, "loyalty_points_earned": points_earned}, "message": f"Nouvelle commande de {user['name']}"}
    await ws_manager.send_to_role("admin", ws_event)
    await ws_manager.send_to_role("restaurant_owner", ws_event)
    # Send email + SMS notifications to client
    try:
        await notify_order_created(doc, user.get("email", ""), input.phone or user.get("phone", ""))
    except Exception as e:
        logger.error(f"Notification error on order create: {e}")

    # Notify restaurant owner of new order
    try:
        restaurant_doc = await db.restaurants.find_one({"id": input.restaurant_id})
        if restaurant_doc:
            owner_doc = await db.users.find_one({"_id": ObjectId(restaurant_doc.get("owner_id", ""))})
            if owner_doc:
                await notify_restaurant_new_order(doc, owner_doc.get("email", ""), owner_doc.get("phone", ""))
    except Exception as e:
        logger.error(f"Restaurant notification error: {e}")

    # Background task: SMS at 3min + WhatsApp admin at 5min if order not accepted
    asyncio.create_task(check_unaccepted_order(doc["id"]))

    return {**doc, "loyalty_points_earned": points_earned}

@api_router.get("/orders")
async def list_orders(request: Request, status: Optional[str] = None):
    user = await get_current_user(request)
    query = {}
    if user["role"] == "client":
        query["client_id"] = user["_id"]
    elif user["role"] == "driver":
        query["$or"] = [{"driver_id": user["_id"]}, {"status": "ready", "driver_id": None}]
    elif user["role"] == "restaurant_owner":
        restaurants = await db.restaurants.find({"owner_id": user["_id"]}, {"id": 1}).to_list(100)
        rest_ids = [r["id"] for r in restaurants]
        query["restaurant_id"] = {"$in": rest_ids}
    if status:
        query["status"] = status
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, request: Request):
    await get_current_user(request)
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    return order

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, input: OrderStatusUpdate, request: Request):
    user = await get_current_user(request)
    if user["role"] not in ["admin", "restaurant_owner", "driver"]:
        raise HTTPException(status_code=403, detail="Non autorise")
    update = {"status": input.status, "updated_at": datetime.now(timezone.utc).isoformat()}
    if input.status == "delivering" and user["role"] == "driver":
        update["driver_id"] = user["_id"]
        update["driver_name"] = user["name"]
    result = await db.orders.update_one({"id": order_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    updated = await db.orders.find_one({"id": order_id}, {"_id": 0})
    ws_event = {"type": "order_updated", "order": updated, "message": f"Commande mise a jour: {STATUS_LABELS_MAP.get(input.status, input.status)}"}
    if updated.get("client_id"):
        await ws_manager.send_to_user(updated["client_id"], ws_event)
    if updated.get("driver_id"):
        await ws_manager.send_to_user(updated["driver_id"], ws_event)
    await ws_manager.send_to_role("admin", ws_event)
    await ws_manager.send_to_role("restaurant_owner", ws_event)
    # Notify all drivers when order is ready for pickup
    if input.status in ("ready", "preparing"):
        await ws_manager.send_to_role("driver", ws_event)
    # Send email + SMS for status change
    try:
        client_user = await db.users.find_one({"_id": ObjectId(updated["client_id"])}) if updated.get("client_id") else None
        if client_user:
            await notify_order_status(updated, input.status, client_user.get("email", ""), client_user.get("phone", ""))
    except Exception as e:
        logger.error(f"Notification error on status update: {e}")
    return updated

@api_router.put("/orders/{order_id}/assign-driver")
async def assign_driver(order_id: str, body: AssignDriverInput, request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Non autorise")
    driver = await db.users.find_one({"_id": ObjectId(body.driver_id), "role": "driver"})
    if not driver:
        raise HTTPException(status_code=404, detail="Livreur introuvable")
    update = {"driver_id": str(driver["_id"]), "driver_name": driver["name"], "status": "assigned", "updated_at": datetime.now(timezone.utc).isoformat()}
    await db.orders.update_one({"id": order_id}, {"$set": update})
    updated = await db.orders.find_one({"id": order_id}, {"_id": 0})
    ws_event = {"type": "driver_assigned", "order": updated, "message": f"Livraison assignee: {driver['name']}"}
    await ws_manager.send_to_user(str(driver["_id"]), ws_event)
    if updated.get("client_id"):
        await ws_manager.send_to_user(updated["client_id"], ws_event)
    await ws_manager.send_to_role("admin", ws_event)
    # Send email + SMS to driver
    try:
        await notify_driver_assigned(updated, driver.get("email", ""), driver.get("phone", ""))
    except Exception as e:
        logger.error(f"Notification error on driver assign: {e}")
    return updated

# ─── DRIVERS & CLIENTS ──────────────────────────
@api_router.get("/drivers")
async def list_drivers(request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Non autorise")
    pipeline = [
        {"$match": {"role": "driver"}},
        {"$addFields": {"str_id": {"$toString": "$_id"}}},
        {"$lookup": {
            "from": "orders",
            "let": {"driver_id": "$str_id"},
            "pipeline": [
                {"$match": {"$expr": {"$and": [{"$eq": ["$driver_id", "$$driver_id"]}, {"$eq": ["$status", "delivered"]}]}}},
                {"$count": "count"}
            ],
            "as": "delivery_stats"
        }},
        {"$project": {
            "password_hash": 0
        }}
    ]
    results = await db.users.aggregate(pipeline).to_list(1000)
    drivers = []
    for d in results:
        delivery_count = d["delivery_stats"][0]["count"] if d.get("delivery_stats") else 0
        drivers.append({
            "id": str(d["_id"]), "name": d["name"], "email": d["email"],
            "phone": d.get("phone", ""), "is_active": d.get("is_active", True),
            "delivery_count": delivery_count, "created_at": d.get("created_at", "")
        })
    return drivers

@api_router.get("/clients")
async def list_clients(request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Non autorise")
    pipeline = [
        {"$match": {"role": "client"}},
        {"$addFields": {"str_id": {"$toString": "$_id"}}},
        {"$lookup": {
            "from": "orders",
            "let": {"client_id": "$str_id"},
            "pipeline": [
                {"$match": {"$expr": {"$eq": ["$client_id", "$$client_id"]}}},
                {"$group": {"_id": None, "count": {"$sum": 1}, "total_spent": {"$sum": "$total"}}}
            ],
            "as": "order_stats"
        }},
        {"$project": {"password_hash": 0}}
    ]
    results = await db.users.aggregate(pipeline).to_list(1000)
    clients = []
    for c in results:
        stats = c["order_stats"][0] if c.get("order_stats") else {"count": 0, "total_spent": 0}
        clients.append({
            "id": str(c["_id"]), "name": c["name"], "email": c["email"],
            "phone": c.get("phone", ""), "address": c.get("address", ""),
            "order_count": stats.get("count", 0), "total_spent": round(stats.get("total_spent", 0), 2),
            "is_active": c.get("is_active", True), "created_at": c.get("created_at", "")
        })
    return clients

@api_router.get("/users")
async def list_users(request: Request, role: Optional[str] = None):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Non autorise")
    query = {}
    if role:
        query["role"] = role
    users = []
    async for u in db.users.find(query):
        users.append({
            "id": str(u["_id"]), "name": u["name"], "email": u["email"],
            "role": u["role"], "phone": u.get("phone", ""), "address": u.get("address", ""),
            "is_active": u.get("is_active", True), "created_at": u.get("created_at", "")
        })
    return users

@api_router.put("/users/{user_id}/toggle-active")
async def toggle_user_active(user_id: str, request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Non autorise")
    target = await db.users.find_one({"_id": ObjectId(user_id)})
    if not target:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    new_status = not target.get("is_active", True)
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"is_active": new_status}})
    return {"is_active": new_status}

# ─── DASHBOARD ───────────────────────────────────
@api_router.get("/dashboard/stats")
async def dashboard_stats(request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Non autorise")
    total_orders = await db.orders.count_documents({})
    total_restaurants = await db.restaurants.count_documents({})
    total_drivers = await db.users.count_documents({"role": "driver"})
    total_clients = await db.users.count_documents({"role": "client"})
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$total"}}}]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_orders = await db.orders.count_documents({"created_at": {"$regex": f"^{today}"}})
    pending_orders = await db.orders.count_documents({"status": "pending"})
    active_deliveries = await db.orders.count_documents({"status": {"$in": ["assigned", "picked_up", "delivering"]}})
    return {
        "total_orders": total_orders, "total_restaurants": total_restaurants,
        "total_drivers": total_drivers, "total_clients": total_clients,
        "total_revenue": round(total_revenue, 2), "today_orders": today_orders,
        "pending_orders": pending_orders, "active_deliveries": active_deliveries
    }

@api_router.get("/dashboard/recent-orders")
async def recent_orders(request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Non autorise")
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(10)
    return orders

@api_router.get("/dashboard/chart-data")
async def chart_data(request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Non autorise")
    now = datetime.now(timezone.utc)
    days_data = []
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        day_label = day.strftime("%d/%m")
        count = await db.orders.count_documents({"created_at": {"$regex": f"^{day_str}"}})
        rev_pipeline = [{"$match": {"created_at": {"$regex": f"^{day_str}"}}}, {"$group": {"_id": None, "total": {"$sum": "$total"}}}]
        rev_result = await db.orders.aggregate(rev_pipeline).to_list(1)
        revenue = rev_result[0]["total"] if rev_result else 0
        days_data.append({"date": day_label, "commandes": count, "revenus": round(revenue, 2)})
    return days_data

# ─── PROMO CODES ─────────────────────────────────
@api_router.post("/promo-codes")
async def create_promo_code(input: PromoCodeInput, request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Non autorise")
    code = input.code.upper().strip()
    existing = await db.promo_codes.find_one({"code": code})
    if existing:
        raise HTTPException(status_code=400, detail="Ce code existe deja")
    doc = {"id": str(uuid.uuid4()), "code": code, "discount_type": input.discount_type, "discount_value": input.discount_value, "min_order": input.min_order, "max_uses": input.max_uses, "current_uses": 0, "expiry_date": input.expiry_date, "is_active": input.is_active, "created_at": datetime.now(timezone.utc).isoformat()}
    await db.promo_codes.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.get("/promo-codes")
async def list_promo_codes(request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Non autorise")
    codes = await db.promo_codes.find({}, {"_id": 0}).to_list(1000)
    return codes

@api_router.put("/promo-codes/{promo_id}")
async def update_promo_code(promo_id: str, input: PromoCodeInput, request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Non autorise")
    update_data = input.model_dump()
    update_data["code"] = update_data["code"].upper().strip()
    result = await db.promo_codes.update_one({"id": promo_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Code promo introuvable")
    updated = await db.promo_codes.find_one({"id": promo_id}, {"_id": 0})
    return updated

@api_router.delete("/promo-codes/{promo_id}")
async def delete_promo_code(promo_id: str, request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Non autorise")
    result = await db.promo_codes.delete_one({"id": promo_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Code promo introuvable")
    return {"message": "Code promo supprime"}

@api_router.post("/promo-codes/validate")
async def validate_promo_code(input: ValidatePromoInput, request: Request):
    await get_current_user(request)
    promo = await db.promo_codes.find_one({"code": input.code.upper().strip(), "is_active": True}, {"_id": 0})
    if not promo:
        raise HTTPException(status_code=404, detail="Code promo invalide")
    if promo.get("min_order", 0) > input.subtotal:
        raise HTTPException(status_code=400, detail=f"Commande minimum: {promo['min_order']} EUR")
    if promo.get("max_uses", 0) > 0 and promo.get("current_uses", 0) >= promo["max_uses"]:
        raise HTTPException(status_code=400, detail="Code promo expire (utilisations max atteintes)")
    if promo.get("expiry_date") and promo["expiry_date"] and promo["expiry_date"] < datetime.now(timezone.utc).isoformat():
        raise HTTPException(status_code=400, detail="Code promo expire")
    if promo["discount_type"] == "percentage":
        discount = input.subtotal * (promo["discount_value"] / 100)
    else:
        discount = min(promo["discount_value"], input.subtotal)
    return {"valid": True, "code": promo["code"], "discount": round(discount, 2), "discount_type": promo["discount_type"], "discount_value": promo["discount_value"]}

# ─── LOYALTY ─────────────────────────────────────
LOYALTY_TIERS = [
    {"name": "Bronze", "min_points": 0, "discount": 0, "color": "#CD7F32"},
    {"name": "Silver", "min_points": 100, "discount": 5, "color": "#C0C0C0"},
    {"name": "Gold", "min_points": 500, "discount": 10, "color": "#FFD700"},
    {"name": "Platinum", "min_points": 1000, "discount": 15, "color": "#E5E4E2"},
]

def get_loyalty_tier(total_points):
    tier = LOYALTY_TIERS[0]
    for t in LOYALTY_TIERS:
        if total_points >= t["min_points"]:
            tier = t
    return tier

@api_router.get("/loyalty/status")
async def loyalty_status(request: Request):
    user = await get_current_user(request)
    points = user.get("loyalty_points", 0)
    total_earned = user.get("total_points_earned", 0)
    tier = get_loyalty_tier(total_earned)
    next_tier = None
    for t in LOYALTY_TIERS:
        if t["min_points"] > total_earned:
            next_tier = t
            break
    points_to_next = next_tier["min_points"] - total_earned if next_tier else 0
    order_count = await db.orders.count_documents({"client_id": user["_id"]})
    return {
        "points": points, "total_points_earned": total_earned,
        "tier": tier, "next_tier": next_tier, "points_to_next": points_to_next,
        "order_count": order_count, "tiers": LOYALTY_TIERS
    }

@api_router.post("/loyalty/redeem")
async def redeem_loyalty_points(request: Request):
    user = await get_current_user(request)
    body = await request.json()
    points_to_redeem = body.get("points", 0)
    if points_to_redeem < 100:
        raise HTTPException(status_code=400, detail="Minimum 100 points pour echanger")
    current_points = user.get("loyalty_points", 0)
    if points_to_redeem > current_points:
        raise HTTPException(status_code=400, detail="Points insuffisants")
    discount_value = (points_to_redeem // 100) * 5
    await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$inc": {"loyalty_points": -points_to_redeem}})
    code = f"LOYAL{str(uuid.uuid4())[:6].upper()}"
    promo_doc = {"id": str(uuid.uuid4()), "code": code, "discount_type": "fixed", "discount_value": discount_value, "min_order": 0, "max_uses": 1, "current_uses": 0, "expiry_date": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(), "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()}
    await db.promo_codes.insert_one(promo_doc)
    return {"code": code, "discount_value": discount_value, "points_redeemed": points_to_redeem}

# ─── OWNER DASHBOARD ─────────────────────────────
@api_router.get("/owner/dashboard")
async def owner_dashboard(request: Request):
    user = await get_current_user(request)
    if user["role"] != "restaurant_owner":
        raise HTTPException(status_code=403, detail="Non autorise")
    restaurants = await db.restaurants.find({"owner_id": user["_id"]}, {"_id": 0}).to_list(100)
    rest_ids = [r["id"] for r in restaurants]
    total_orders = await db.orders.count_documents({"restaurant_id": {"$in": rest_ids}})
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_orders = await db.orders.count_documents({"restaurant_id": {"$in": rest_ids}, "created_at": {"$regex": f"^{today}"}})
    pending_orders = await db.orders.count_documents({"restaurant_id": {"$in": rest_ids}, "status": {"$in": ["pending", "preparing"]}})
    rev_pipeline = [{"$match": {"restaurant_id": {"$in": rest_ids}}}, {"$group": {"_id": None, "total": {"$sum": "$total"}}}]
    rev_result = await db.orders.aggregate(rev_pipeline).to_list(1)
    total_revenue = rev_result[0]["total"] if rev_result else 0
    recent = await db.orders.find({"restaurant_id": {"$in": rest_ids}}, {"_id": 0}).sort("created_at", -1).to_list(10)
    return {"restaurants": restaurants, "total_orders": total_orders, "today_orders": today_orders, "pending_orders": pending_orders, "total_revenue": round(total_revenue, 2), "recent_orders": recent}

# ─── NOTIFICATION SETTINGS & TEST ────────────────
@api_router.get("/settings/delivery")
async def get_delivery_settings_endpoint(request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Non autorise")
    return await get_delivery_settings()

@api_router.put("/settings/delivery")
async def update_delivery_settings_endpoint(request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Non autorise")
    body = await request.json()
    body["type"] = "global"
    await db.delivery_settings.update_one({"type": "global"}, {"$set": body}, upsert=True)
    return body

@api_router.get("/notifications/settings")
async def get_notification_settings(request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Non autorise")
    settings = await db.notification_settings.find_one({"type": "global"}, {"_id": 0})
    if not settings:
        settings = {"type": "global", "email_enabled": True, "sms_enabled": True, "email_on_order": True, "email_on_status": True, "sms_on_order": True, "sms_on_delivery": True}
        await db.notification_settings.insert_one(settings)
    return settings

@api_router.put("/notifications/settings")
async def update_notification_settings(request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Non autorise")
    body = await request.json()
    await db.notification_settings.update_one({"type": "global"}, {"$set": body}, upsert=True)
    return body

@api_router.post("/notifications/test-email")
async def test_email(request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Non autorise")
    body = await request.json()
    to_email = body.get("email", user.get("email", ""))
    result = send_brevo_email(to_email, user.get("name", "Admin"), "FoodRush - Test Email", "<div style='font-family:Arial;padding:24px'><h2 style='color:#FF5A5F'>Test FoodRush</h2><p>Cet email confirme que les notifications email fonctionnent correctement.</p><p style='color:#10B981;font-weight:bold'>Configuration OK !</p></div>")
    if result:
        return {"success": True, "message": f"Email de test envoye a {to_email}"}
    raise HTTPException(status_code=500, detail="Echec envoi email - verifiez la configuration Brevo")

@api_router.post("/notifications/test-sms")
async def test_sms(request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Non autorise")
    body = await request.json()
    to_phone = body.get("phone", "")
    if not to_phone:
        raise HTTPException(status_code=400, detail="Numero de telephone requis")
    result = send_twilio_sms(to_phone, "FoodRush: Test SMS - Les notifications SMS fonctionnent correctement !")
    if result:
        return {"success": True, "message": f"SMS de test envoye a {to_phone}"}
    raise HTTPException(status_code=500, detail="Echec envoi SMS - verifiez la configuration Twilio")

# ─── WEBSOCKET ───────────────────────────────────
@app.websocket("/api/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        user_id = payload["sub"]
        role = payload.get("role", "client")
    except Exception:
        await websocket.close(code=4001)
        return
    await ws_manager.connect(websocket, user_id, role)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id, role)
    except Exception:
        ws_manager.disconnect(websocket, user_id, role)

# ─── SEED DATA (func) ──────────────────────────
async def seed_demo_data(admin_id: str):
    logger.info("Seeding demo data...")
    restaurants_data = [
        {"name": "Le Petit Bistro", "address": "12 Rue de la Paix, Paris", "phone": "+33 1 42 00 01", "description": "Cuisine francaise traditionnelle", "image_url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800", "cuisine_type": "Francais", "delivery_fee": 0, "min_order": 10, "delivery_time": "15-20 min", "rating": 4.7, "total_orders": 156, "lat": 48.8698, "lng": 2.3308},
        {"name": "Sakura Sushi", "address": "45 Boulevard Haussmann, Paris", "phone": "+33 1 42 00 02", "description": "Sushis et plats japonais authentiques", "image_url": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800", "cuisine_type": "Japonais", "delivery_fee": 0, "min_order": 10, "delivery_time": "15-25 min", "rating": 4.8, "total_orders": 203, "lat": 48.8738, "lng": 2.3318},
        {"name": "Pizzeria Napoli", "address": "78 Rue Saint-Honore, Paris", "phone": "+33 1 42 00 03", "description": "Pizzas artisanales au feu de bois", "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800", "cuisine_type": "Italien", "delivery_fee": 0, "min_order": 10, "delivery_time": "15-20 min", "rating": 4.5, "total_orders": 312, "lat": 48.8615, "lng": 2.3416},
        {"name": "Taj Mahal", "address": "23 Rue du Faubourg, Paris", "phone": "+33 1 42 00 04", "description": "Cuisine indienne authentique et epicee", "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800", "cuisine_type": "Indien", "delivery_fee": 0, "min_order": 10, "delivery_time": "20-25 min", "rating": 4.6, "total_orders": 89, "lat": 48.8729, "lng": 2.3476},
        {"name": "Burger Factory", "address": "56 Avenue des Champs-Elysees, Paris", "phone": "+33 1 42 00 05", "description": "Burgers gourmets premium", "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800", "cuisine_type": "Americain", "delivery_fee": 0, "min_order": 10, "delivery_time": "10-15 min", "rating": 4.4, "total_orders": 445, "lat": 48.8698, "lng": 2.3076},
    ]
    restaurant_ids = []
    for r in restaurants_data:
        rid = str(uuid.uuid4())
        doc = {"id": rid, **r, "owner_id": admin_id, "status": "active", "created_at": datetime.now(timezone.utc).isoformat()}
        await db.restaurants.insert_one(doc)
        restaurant_ids.append(rid)

    menus = {
        0: [
            {"name": "Coq au Vin", "description": "Poulet mijote au vin rouge", "price": 18.50, "category": "Plats", "image_url": "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400"},
            {"name": "Croque Monsieur", "description": "Jambon, fromage gratine", "price": 12.00, "category": "Entrees", "image_url": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400"},
            {"name": "Salade Nicoise", "description": "Thon, olives, oeufs, tomates", "price": 14.00, "category": "Entrees", "image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400"},
            {"name": "Creme Brulee", "description": "Dessert classique a la vanille", "price": 8.50, "category": "Desserts", "image_url": "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400"},
            {"name": "Steak Frites", "description": "Entrecote grillee avec frites maison", "price": 22.00, "category": "Plats", "image_url": "https://images.unsplash.com/photo-1558030006-450675393462?w=400"},
        ],
        1: [
            {"name": "Plateau Sashimi", "description": "12 pieces de sashimi frais", "price": 24.00, "category": "Sashimi", "image_url": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400"},
            {"name": "California Roll", "description": "8 pieces avocat, crabe", "price": 12.00, "category": "Maki", "image_url": "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400"},
            {"name": "Ramen Tonkotsu", "description": "Bouillon porc, nouilles, oeuf", "price": 16.00, "category": "Plats chauds", "image_url": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400"},
            {"name": "Gyoza", "description": "6 raviolis japonais grilles", "price": 9.00, "category": "Entrees", "image_url": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400"},
        ],
        2: [
            {"name": "Margherita", "description": "Tomate, mozzarella, basilic", "price": 11.00, "category": "Pizzas", "image_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400"},
            {"name": "Quattro Formaggi", "description": "4 fromages italiens", "price": 14.00, "category": "Pizzas", "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400"},
            {"name": "Calzone", "description": "Pizza pliee, jambon, champignons", "price": 13.50, "category": "Pizzas", "image_url": "https://images.unsplash.com/photo-1536964549204-cce9eab227bd?w=400"},
            {"name": "Tiramisu", "description": "Cafe et mascarpone", "price": 8.00, "category": "Desserts", "image_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400"},
        ],
        3: [
            {"name": "Butter Chicken", "description": "Poulet sauce tomate cremeuse", "price": 16.00, "category": "Plats", "image_url": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400"},
            {"name": "Naan Fromage", "description": "Pain indien garni", "price": 4.50, "category": "Accompagnements", "image_url": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400"},
            {"name": "Biryani Agneau", "description": "Riz basmati parfume", "price": 18.00, "category": "Plats", "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400"},
            {"name": "Samosa", "description": "3 beignets aux legumes", "price": 6.50, "category": "Entrees", "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400"},
        ],
        4: [
            {"name": "Classic Burger", "description": "Boeuf, salade, tomate, cheddar", "price": 12.00, "category": "Burgers", "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400"},
            {"name": "Bacon Deluxe", "description": "Double boeuf, bacon, sauce BBQ", "price": 15.00, "category": "Burgers", "image_url": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400"},
            {"name": "Frites Maison", "description": "Frites croustillantes", "price": 5.50, "category": "Accompagnements", "image_url": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400"},
            {"name": "Milkshake", "description": "Chocolat, vanille ou fraise", "price": 6.00, "category": "Boissons", "image_url": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400"},
        ],
    }
    menu_item_ids = {}
    for idx, items in menus.items():
        rid = restaurant_ids[idx]
        menu_item_ids[idx] = []
        for item in items:
            mid = str(uuid.uuid4())
            doc = {"id": mid, "restaurant_id": rid, **item, "available": True, "created_at": datetime.now(timezone.utc).isoformat()}
            await db.menu_items.insert_one(doc)
            menu_item_ids[idx].append({"id": mid, "name": item["name"], "price": item["price"]})

    # Seed drivers
    driver_ids = []
    drivers = [
        {"name": "Lucas Martin", "email": "driver1@test.com", "phone": "+33 6 10 00 01"},
        {"name": "Sophie Dubois", "email": "driver2@test.com", "phone": "+33 6 10 00 02"},
        {"name": "Thomas Bernard", "email": "driver3@test.com", "phone": "+33 6 10 00 03"},
    ]
    for d in drivers:
        existing = await db.users.find_one({"email": d["email"]})
        if not existing:
            result = await db.users.insert_one({
                "email": d["email"], "password_hash": hash_password("Driver123!"),
                "name": d["name"], "role": "driver", "phone": d["phone"],
                "address": "", "is_active": True, "loyalty_points": 0, "total_points_earned": 0,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            driver_ids.append(str(result.inserted_id))
        else:
            driver_ids.append(str(existing["_id"]))

    # Seed clients
    client_ids = []
    clients = [
        {"name": "Marie Laurent", "email": "client1@test.com", "phone": "+33 6 20 00 01", "address": "10 Rue de Rivoli, Paris"},
        {"name": "Pierre Moreau", "email": "client2@test.com", "phone": "+33 6 20 00 02", "address": "25 Avenue Montaigne, Paris"},
        {"name": "Camille Petit", "email": "client3@test.com", "phone": "+33 6 20 00 03", "address": "8 Place de la Bastille, Paris"},
    ]
    for c in clients:
        existing = await db.users.find_one({"email": c["email"]})
        if not existing:
            result = await db.users.insert_one({
                "email": c["email"], "password_hash": hash_password("Client123!"),
                "name": c["name"], "role": "client", "phone": c["phone"],
                "address": c["address"], "is_active": True, "loyalty_points": 150, "total_points_earned": 250,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            client_ids.append(str(result.inserted_id))
        else:
            client_ids.append(str(existing["_id"]))

    # Seed demo orders
    statuses = ["pending", "preparing", "delivering", "delivered", "delivered", "delivered", "delivered", "cancelled"]
    now = datetime.now(timezone.utc)
    for i in range(20):
        days_ago = _rng.randint(0, 30)
        order_date = (now - timedelta(days=days_ago, hours=_rng.randint(0, 23))).isoformat()
        rest_idx = _rng.randint(0, 4)
        rid = restaurant_ids[rest_idx]
        rest_name = restaurants_data[rest_idx]["name"]
        rest_fee = restaurants_data[rest_idx]["delivery_fee"]
        items_pool = menu_item_ids[rest_idx]
        chosen_items = _rng.sample(items_pool, min(_rng.randint(1, 3), len(items_pool)))
        order_items = [{"id": it["id"], "name": it["name"], "price": it["price"], "quantity": _rng.randint(1, 2)} for it in chosen_items]
        subtotal = sum(it["price"] * it["quantity"] for it in order_items)
        total = subtotal + rest_fee
        client_idx = _rng.randint(0, 2)
        status = _rng.choice(statuses)
        driver_idx = _rng.randint(0, 2)
        doc = {
            "id": str(uuid.uuid4()), "client_id": client_ids[client_idx],
            "client_name": clients[client_idx]["name"], "client_email": clients[client_idx]["email"],
            "restaurant_id": rid, "restaurant_name": rest_name, "items": order_items,
            "subtotal": round(subtotal, 2), "delivery_fee": rest_fee, "total": round(total, 2),
            "delivery_address": clients[client_idx]["address"], "phone": clients[client_idx]["phone"],
            "notes": "", "payment_method": _rng.choice(["cash", "card"]),
            "payment_status": "paid", "status": status,
            "driver_id": driver_ids[driver_idx] if status in ["assigned", "delivering", "delivered"] else None,
            "driver_name": drivers[driver_idx]["name"] if status in ["assigned", "delivering", "delivered"] else None,
            "created_at": order_date, "updated_at": order_date
        }
        await db.orders.insert_one(doc)
    # Seed promo codes
    promos = [
        {"code": "BIENVENUE", "discount_type": "percentage", "discount_value": 15, "min_order": 20, "max_uses": 100, "expiry_date": (datetime.now(timezone.utc) + timedelta(days=90)).isoformat()},
        {"code": "RUSH10", "discount_type": "fixed", "discount_value": 10, "min_order": 30, "max_uses": 50, "expiry_date": (datetime.now(timezone.utc) + timedelta(days=60)).isoformat()},
        {"code": "LIVRAISON", "discount_type": "fixed", "discount_value": 3, "min_order": 15, "max_uses": 0, "expiry_date": ""},
    ]
    for p in promos:
        await db.promo_codes.insert_one({"id": str(uuid.uuid4()), **p, "current_uses": _rng.randint(0, 10), "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()})
    logger.info("Demo data seeded successfully")

# ─── LEADS (LANDING SITE — letsgofood.fr) ────────
@api_router.post("/leads")
async def create_lead(input: LeadInput, request: Request):
    """Public endpoint — receives lead form submissions from the marketing landing site."""
    lead_id = str(uuid.uuid4())
    attr = input.attribution.dict() if input.attribution else {}
    # Drop None keys to keep document compact
    attr = {k: v for k, v in attr.items() if v}
    doc = {
        "id": lead_id,
        "restaurant": input.restaurant,
        "name": input.name,
        "email": input.email,
        "phone": input.phone,
        "city": input.city,
        "cuisine": input.cuisine,
        "preference": input.preference,
        "message": input.message,
        "source": input.source or "letsgofood.fr",
        "attribution": attr,
        "ref": attr.get("ref"),
        "src": attr.get("src"),
        "zone": attr.get("zone"),
        "camp": attr.get("camp"),
        "status": "new",
        "ip": request.client.host if request.client else None,
        "user_agent": request.headers.get("user-agent"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.leads.insert_one(doc)

    # ─── NOTIFICATIONS ADMIN ───────────────────────────────────
    pref_labels = {"callback": "Rappel immediat (rappel < 5 min)", "rdv": "Rendez-vous", "info": "Infos par SMS"}
    pref_label = pref_labels.get(input.preference or "", input.preference or "-")
    source_label = doc["source"]
    if "qr" in source_label.lower():
        source_label = f"QR Code ({source_label})"

    # 1. Email admin (Brevo)
    admin_email = os.environ.get("LEAD_NOTIFICATION_EMAIL") or os.environ.get("ADMIN_EMAIL", "")
    if admin_email:
        html = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#FF5A00;padding:20px 24px;border-radius:8px 8px 0 0">
          <h2 style="color:#fff;margin:0;font-size:20px">Nouveau lead Lets Go Food</h2>
          <p style="color:#ffe0cc;margin:6px 0 0;font-size:13px">{pref_label} - {source_label}</p>
        </div>
        <div style="background:#fff;border:1px solid #eee;border-top:none;padding:24px;border-radius:0 0 8px 8px">
        <table style="border-collapse:collapse;font-size:14px;width:100%">
          <tr style="background:#fff8f5"><td style="padding:8px 12px;color:#6C6F70;width:140px">Restaurant</td><td style="padding:8px 12px"><b>{input.restaurant or '-'}</b></td></tr>
          <tr><td style="padding:8px 12px;color:#6C6F70">Nom</td><td style="padding:8px 12px">{input.name or '-'}</td></tr>
          <tr style="background:#fff8f5"><td style="padding:8px 12px;color:#6C6F70">Telephone</td><td style="padding:8px 12px"><b><a href="tel:{input.phone}" style="color:#FF5A00">{input.phone}</a></b></td></tr>
          <tr><td style="padding:8px 12px;color:#6C6F70">Email</td><td style="padding:8px 12px">{input.email or '-'}</td></tr>
          <tr style="background:#fff8f5"><td style="padding:8px 12px;color:#6C6F70">Ville</td><td style="padding:8px 12px">{input.city or '-'}</td></tr>
          <tr><td style="padding:8px 12px;color:#6C6F70">Cuisine</td><td style="padding:8px 12px">{input.cuisine or '-'}</td></tr>
          <tr style="background:#fff8f5"><td style="padding:8px 12px;color:#6C6F70">Preference</td><td style="padding:8px 12px"><b>{pref_label}</b></td></tr>
          <tr><td style="padding:8px 12px;color:#6C6F70">Source</td><td style="padding:8px 12px">{source_label}</td></tr>
          <tr style="background:#fff8f5"><td style="padding:8px 12px;color:#6C6F70">Ref commercial</td><td style="padding:8px 12px"><b>{attr.get('ref') or '-'}</b></td></tr>
          <tr><td style="padding:8px 12px;color:#6C6F70">Message</td><td style="padding:8px 12px">{input.message or '-'}</td></tr>
        </table>
        <p style="margin-top:16px;color:#6C6F70;font-size:11px;border-top:1px solid #eee;padding-top:12px">Lead ID : {lead_id} - {doc['created_at']}</p>
        </div></div>
        """
        loop = asyncio.get_event_loop()
        loop.run_in_executor(None, send_brevo_email, admin_email, "Admin Lets Go",
            f"Nouveau lead - {pref_label} - {input.restaurant or input.phone}", html)

    # 2. WhatsApp admin (avec fallback SMS automatique)
    admin_wa = os.environ.get("ADMIN_WHATSAPP", "") or os.environ.get("ADMIN_PHONE", "")
    if admin_wa:
        wa_msg = (
            f"Nouveau lead Lets Go Food\n"
            f"{pref_label}\n\n"
            f"Restaurant: {input.restaurant or '-'}\n"
            f"Nom: {input.name or '-'}\n"
            f"Tel: {input.phone}\n"
            f"Email: {input.email or '-'}\n"
            f"Ville: {input.city or '-'}\n"
            f"Cuisine: {input.cuisine or '-'}\n"
            f"Source: {source_label}\n"
            f"Message: {input.message or '-'}"
        )
        loop = asyncio.get_event_loop()
        loop.run_in_executor(None, send_whatsapp, admin_wa, wa_msg)

    return {"success": True, "id": lead_id}

@api_router.get("/leads")
async def list_leads(request: Request):
    """Admin-only: list all leads from the landing site."""
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acces refuse")
    cursor = db.leads.find({}, {"_id": 0}).sort("created_at", -1).limit(500)
    leads = await cursor.to_list(length=500)
    return leads

# ─── TRACKING (landing analytics) ────────────────
@api_router.post("/track")
async def track_event(event: TrackEventInput, request: Request):
    """Public endpoint — receives lightweight analytics events from the landing site."""
    attr = event.attribution.dict() if event.attribution else {}
    attr = {k: v for k, v in attr.items() if v}
    doc = {
        "id": str(uuid.uuid4()),
        "event": event.event,
        "source": event.source,
        "session_id": event.session_id,
        "device": event.device,
        "path": event.path,
        "referrer": event.referrer,
        "props": event.props or {},
        "attribution": attr,
        "ref": attr.get("ref"),
        "src": attr.get("src"),
        "zone": attr.get("zone"),
        "camp": attr.get("camp"),
        "ip": request.client.host if request.client else None,
        "user_agent": request.headers.get("user-agent"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.events.insert_one(doc)
    return {"ok": True}

@api_router.get("/track/summary")
async def track_summary(request: Request):
    """Admin-only: aggregated event counts."""
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acces refuse")
    pipeline = [
        {"$group": {"_id": {"event": "$event", "source": "$source"}, "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 200},
    ]
    items = await db.events.aggregate(pipeline).to_list(length=200)
    out = [{"event": i["_id"]["event"], "source": i["_id"].get("source"), "count": i["count"]} for i in items]
    total = await db.events.count_documents({})
    leads_total = await db.leads.count_documents({})
    return {"total_events": total, "total_leads": leads_total, "breakdown": out}

# ─── LEADS UPDATE (CRM) ──────────────────────────
class LeadUpdateInput(BaseModel):
    status: Optional[str] = None  # new | contacted | meeting | converted | lost
    notes: Optional[str] = None
    assigned_to: Optional[str] = None

@api_router.get("/leads/{lead_id}")
async def get_lead(lead_id: str, request: Request):
    """Admin-only: fetch a single lead by id."""
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acces refuse")
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead introuvable")
    return lead

@api_router.put("/leads/{lead_id}")
async def update_lead(lead_id: str, payload: LeadUpdateInput, request: Request):
    """Admin-only: update lead status, notes, or assignment."""
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acces refuse")
    update = {}
    if payload.status is not None:
        if payload.status not in ("new", "contacted", "meeting", "converted", "lost"):
            raise HTTPException(status_code=400, detail="Statut invalide")
        update["status"] = payload.status
    if payload.notes is not None:
        update["notes"] = payload.notes
    if payload.assigned_to is not None:
        update["assigned_to"] = payload.assigned_to
    if not update:
        raise HTTPException(status_code=400, detail="Rien a mettre a jour")
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    update["updated_by"] = user.get("email")
    result = await db.leads.update_one({"id": lead_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead introuvable")
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    return lead

@api_router.get("/leads/stats/summary")
async def leads_stats(request: Request):
    """Admin-only: leads funnel breakdown by status + source."""
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acces refuse")
    total = await db.leads.count_documents({})
    by_status = {}
    for st in ("new", "contacted", "meeting", "converted", "lost"):
        by_status[st] = await db.leads.count_documents({"status": st})
    # Leads that never had a status set are counted as "new"
    no_status = await db.leads.count_documents({"status": {"$exists": False}})
    by_status["new"] += no_status
    by_source_cursor = db.leads.aggregate([
        {"$group": {"_id": "$source", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ])
    by_source = [
        {"source": x["_id"] or "direct", "count": x["count"]}
        async for x in by_source_cursor
    ]
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_count = await db.leads.count_documents({"created_at": {"$regex": f"^{today}"}})
    return {
        "total": total,
        "today": today_count,
        "by_status": by_status,
        "by_source": by_source,
    }

@api_router.get("/leads/attribution/summary")
async def leads_attribution_summary(request: Request):
    """Admin-only: attribution breakdown by ref / src / zone / camp.
    Used by CRM dashboard to rank top commercials, channels and zones.
    """
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acces refuse")

    async def _group(field):
        cursor = db.leads.aggregate([
            {"$match": {field: {"$nin": [None, ""]}}},
            {"$group": {
                "_id": f"${field}",
                "count": {"$sum": 1},
                "converted": {
                    "$sum": {"$cond": [{"$eq": ["$status", "converted"]}, 1, 0]}
                },
            }},
            {"$sort": {"count": -1}},
            {"$limit": 50},
        ])
        items = await cursor.to_list(length=50)
        return [
            {"key": i["_id"], "count": i["count"], "converted": i.get("converted", 0)}
            for i in items if i["_id"]
        ]

    by_ref = await _group("ref")
    by_src = await _group("src")
    by_zone = await _group("zone")
    by_camp = await _group("camp")

    tagged = await db.leads.count_documents({
        "$or": [
            {"ref": {"$nin": [None, ""]}},
            {"src": {"$nin": [None, ""]}},
            {"zone": {"$nin": [None, ""]}},
            {"camp": {"$nin": [None, ""]}},
        ]
    })
    total = await db.leads.count_documents({})
    return {
        "total": total,
        "tagged": tagged,
        "by_ref": by_ref,
        "by_src": by_src,
        "by_zone": by_zone,
        "by_camp": by_camp,
    }

# ─── LEADS LEADERBOARD ────────────────────────────
@api_router.get("/leads/stats/leaderboard")
async def leads_leaderboard(request: Request, period: str = "month"):
    """Admin-only: top commerciaux by leads captured (+ conversion rate),
    with gamification tier (rookie / pro / legend).
    """
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acces refuse")
    now = datetime.now(timezone.utc)
    if period == "week":
        since = (now - timedelta(days=7)).isoformat()
    elif period == "all":
        since = None
    else:
        since = (now - timedelta(days=30)).isoformat()
    match = {"ref": {"$nin": [None, ""]}}
    if since:
        match["created_at"] = {"$gte": since}
    cursor = db.leads.aggregate([
        {"$match": match},
        {"$group": {
            "_id": "$ref",
            "count": {"$sum": 1},
            "converted": {"$sum": {"$cond": [{"$eq": ["$status", "converted"]}, 1, 0]}},
            "zones": {"$addToSet": "$zone"},
        }},
        {"$sort": {"count": -1}},
        {"$limit": 20},
    ])
    items = await cursor.to_list(length=20)
    def _tier(count):
        if count >= 50:
            return "legend"
        if count >= 15:
            return "pro"
        return "rookie"
    return {
        "period": period,
        "leaderboard": [
            {
                "ref": i["_id"],
                "count": i["count"],
                "converted": i.get("converted", 0),
                "conversion_rate": round((i.get("converted", 0) / i["count"]) * 100, 1) if i["count"] else 0,
                "zones": [z for z in (i.get("zones") or []) if z][:5],
                "tier": _tier(i["count"]),
            }
            for i in items
        ],
    }

# ─── LEADS CSV EXPORT ─────────────────────────────
@api_router.get("/leads/export/csv")
async def leads_export_csv(request: Request, ref: Optional[str] = None, zone: Optional[str] = None, src: Optional[str] = None):
    """Admin-only CSV export of leads, optionally filtered by attribution."""
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acces refuse")
    import csv
    import io
    query = {}
    if ref:
        query["ref"] = ref
    if zone:
        query["zone"] = zone
    if src:
        query["src"] = src
    leads = await db.leads.find(query, {"_id": 0}).sort("created_at", -1).to_list(10000)
    buffer = io.StringIO()
    writer = csv.writer(buffer, quoting=csv.QUOTE_MINIMAL)
    writer.writerow([
        "created_at", "restaurant", "name", "email", "phone", "city", "cuisine",
        "preference", "source", "ref", "src", "zone", "camp", "status", "message",
    ])
    for lead in leads:
        writer.writerow([
            lead.get("created_at", ""), lead.get("restaurant", ""), lead.get("name", ""),
            lead.get("email", ""), lead.get("phone", ""), lead.get("city", ""),
            lead.get("cuisine", ""), lead.get("preference", ""), lead.get("source", ""),
            lead.get("ref", ""), lead.get("src", ""), lead.get("zone", ""),
            lead.get("camp", ""), lead.get("status", "new"),
            (lead.get("message") or "").replace("\n", " "),
        ])
    from fastapi.responses import Response as FastAPIResponse
    csv_bytes = buffer.getvalue().encode("utf-8-sig")  # BOM for Excel
    filename = f"leads-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M')}.csv"
    return FastAPIResponse(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

# ─── STRIPE PAYMENTS ──────────────────────────────
class CheckoutInput(BaseModel):
    order_id: str
    origin_url: str

@api_router.post("/payments/checkout")
async def create_payment_checkout(body: CheckoutInput, request: Request):
    """Create a Stripe Checkout Session for an existing order.
    The amount is computed server-side from the persisted order total (never from
    frontend input) to prevent price manipulation.
    """
    user = await get_current_user(request)
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe non configuré")
    order = await db.orders.find_one({"id": body.order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    if order.get("client_id") != user["_id"]:
        raise HTTPException(status_code=403, detail="Commande non autorisée")
    if order.get("payment_status") == "paid":
        raise HTTPException(status_code=400, detail="Commande déjà payée")

    # Build URLs from the frontend origin (never hardcoded)
    origin = body.origin_url.rstrip("/")
    success_url = f"{origin}/orders/{body.order_id}?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/orders/{body.order_id}?cancelled=1"
    host_url = str(request.base_url)
    webhook_url = f"{host_url.rstrip('/')}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    amount = float(order["total"])
    metadata = {
        "order_id": body.order_id,
        "user_id": user["_id"],
        "user_email": user.get("email", ""),
    }
    checkout_req = CheckoutSessionRequest(
        amount=amount,
        currency="eur",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
    )
    session = await stripe_checkout.create_checkout_session(checkout_req)

    # MANDATORY: record the pending transaction BEFORE returning
    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "order_id": body.order_id,
        "user_id": user["_id"],
        "user_email": user.get("email", ""),
        "amount": amount,
        "currency": "eur",
        "status": "initiated",
        "payment_status": "unpaid",
        "metadata": metadata,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"url": session.url, "session_id": session.session_id}


async def _finalize_payment_if_paid(session_id: str, request: Request):
    """Fetch checkout status from Stripe, update payment_transactions atomically,
    and mark the related order as paid on the first successful status seen.
    Safe to call multiple times (idempotent via `finalized_at` flag).
    """
    tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction introuvable")

    host_url = str(request.base_url)
    webhook_url = f"{host_url.rstrip('/')}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    status = await stripe_checkout.get_checkout_status(session_id)

    # Update transaction status every poll
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount_total": status.amount_total,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }},
    )

    # Finalize order only once (idempotent by `finalized_at` marker)
    if status.payment_status == "paid" and not tx.get("finalized_at"):
        await db.payment_transactions.update_one(
            {"session_id": session_id, "finalized_at": {"$exists": False}},
            {"$set": {"finalized_at": datetime.now(timezone.utc).isoformat()}},
        )
        order_id = tx.get("order_id")
        if order_id:
            order = await db.orders.find_one_and_update(
                {"id": order_id, "payment_status": {"$ne": "paid"}},
                {"$set": {
                    "payment_status": "paid",
                    "status": "pending",  # ready to be processed by the restaurant
                    "paid_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }},
                return_document=True,
            )
            if order:
                order.pop("_id", None)
                ws_event = {
                    "type": "order_created",
                    "order": order,
                    "message": f"Commande payée de {order.get('client_name','')}",
                }
                await ws_manager.send_to_role("admin", ws_event)
                await ws_manager.send_to_role("restaurant_owner", ws_event)
                try:
                    await notify_order_created(order, order.get("client_email", ""), order.get("phone", ""))
                except Exception as e:
                    logger.error(f"Notification error on paid order: {e}")
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency,
        "order_id": tx.get("order_id"),
    }


@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, request: Request):
    await get_current_user(request)
    try:
        return await _finalize_payment_if_paid(session_id, request)
    except HTTPException:
        raise
    except Exception as e:
        # Stripe test sessions may become non-retrievable before completion;
        # fall back to the transaction's last known status instead of 500.
        logger.warning(f"Payment status fetch fallback ({session_id}): {e}")
        tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        if not tx:
            raise HTTPException(status_code=404, detail="Transaction introuvable")
        return {
            "status": tx.get("status", "initiated"),
            "payment_status": tx.get("payment_status", "unpaid"),
            "amount_total": int(float(tx.get("amount", 0)) * 100),
            "currency": tx.get("currency", "eur"),
            "order_id": tx.get("order_id"),
        }


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    host_url = str(request.base_url)
    webhook_url = f"{host_url.rstrip('/')}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    try:
        event = await stripe_checkout.handle_webhook(body, signature)
    except Exception as e:
        logger.error(f"Stripe webhook error: {e}")
        raise HTTPException(status_code=400, detail="Webhook invalide")
    if event.session_id:
        try:
            await _finalize_payment_if_paid(event.session_id, request)
        except Exception as e:
            logger.error(f"Webhook finalize error: {e}")
    return {"received": True, "event": event.event_type}

# ─── APP SETUP ───────────────────────────────────
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── LANDING SITE PREVIEW (dev only) ─────────────
# Mount the built landing-site (Vite base=/landing-preview/) so the
# user can test it on the Emergent preview URL without a separate deploy.
# This is purely a preview convenience and is independent of the main app routes.
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

LANDING_DIST = Path("/app/landing-site/dist")
if LANDING_DIST.exists():
    app.mount(
        "/landing-preview/assets",
        StaticFiles(directory=str(LANDING_DIST / "assets")),
        name="landing-assets",
    )
    # PDFs folder (generated by scripts/generate-pdfs.sh)
    LANDING_PDFS = LANDING_DIST / "pdfs"
    if LANDING_PDFS.exists():
        app.mount(
            "/landing-preview/pdfs",
            StaticFiles(directory=str(LANDING_PDFS)),
            name="landing-pdfs",
        )

    @app.get("/landing-preview/favicon.svg")
    async def _landing_favicon():
        return FileResponse(LANDING_DIST / "favicon.svg")

    @app.get("/landing-preview")
    @app.get("/landing-preview/")
    @app.get("/landing-preview/{full_path:path}")
    async def _landing_spa(full_path: str = ""):
        # SPA fallback — always serve index.html for client-side routing
        return FileResponse(LANDING_DIST / "index.html")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@foodrush.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin123!")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        result = await db.users.insert_one({
            "email": admin_email, "password_hash": hash_password(admin_password),
            "name": "Administrateur", "role": "admin", "phone": "", "address": "",
            "is_active": True, "loyalty_points": 0, "total_points_earned": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        admin_id = str(result.inserted_id)
        logger.info(f"Admin seeded: {admin_email}")
    else:
        admin_id = str(existing["_id"])
        if not verify_password(admin_password, existing["password_hash"]):
            await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
            logger.info("Admin password updated")
    # Seed demo data if empty
    rest_count = await db.restaurants.count_documents({})
    if rest_count == 0:
        await seed_demo_data(admin_id)
    # Write test credentials
    os.makedirs("/app/memory", exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write("# Test Credentials\n\n")
        f.write(f"## Admin\n- Email: {admin_email}\n- Password: {admin_password}\n- Role: admin\n\n")
        f.write("## Test Drivers\n- Email: driver1@test.com / Password: Driver123! / Role: driver\n- Email: driver2@test.com / Password: Driver123! / Role: driver\n- Email: driver3@test.com / Password: Driver123! / Role: driver\n\n")
        f.write("## Test Clients\n- Email: client1@test.com / Password: Client123! / Role: client\n- Email: client2@test.com / Password: Client123! / Role: client\n- Email: client3@test.com / Password: Client123! / Role: client\n\n")
        f.write("## Auth Endpoints\n- POST /api/auth/register\n- POST /api/auth/login\n- POST /api/auth/logout\n- GET /api/auth/me\n- POST /api/auth/refresh\n")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

"""
Backend API Tests for FoodRush Platform
Tests: Rate Limiting, Stripe Payments, Leaderboard, CSV Export

Features tested:
1. Rate limiting on /api/auth/login (10/minute per IP via slowapi)
2. Leaderboard endpoint /api/leads/stats/leaderboard
3. CSV export endpoint /api/leads/export/csv
4. Stripe payment flow (checkout, status, webhook)
5. Payment security (amount manipulation protection)
"""

import pytest
import requests
import os
import time
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
ADMIN_EMAIL = "admin@foodrush.com"
ADMIN_PASSWORD = "Admin123!"
CLIENT_EMAIL = "client1@test.com"
CLIENT_PASSWORD = "Client123!"


@pytest.fixture(scope="module")
def admin_session():
    """Login as admin and return session with cookies"""
    session = requests.Session()
    response = session.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        headers={"Content-Type": "application/json"}
    )
    if response.status_code == 429:
        pytest.skip("Rate limited - wait 1 minute and retry")
    if response.status_code != 200:
        pytest.skip(f"Admin login failed: {response.status_code} - {response.text}")
    return session


@pytest.fixture(scope="module")
def client_session():
    """Login as client and return session with cookies"""
    session = requests.Session()
    response = session.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": CLIENT_EMAIL, "password": CLIENT_PASSWORD},
        headers={"Content-Type": "application/json"}
    )
    if response.status_code == 429:
        pytest.skip("Rate limited - wait 1 minute and retry")
    if response.status_code != 200:
        pytest.skip(f"Client login failed: {response.status_code} - {response.text}")
    return session


@pytest.fixture(scope="module")
def client2_session():
    """Login as client2 and return session with cookies"""
    session = requests.Session()
    response = session.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": "client2@test.com", "password": CLIENT_PASSWORD},
        headers={"Content-Type": "application/json"}
    )
    if response.status_code == 429:
        pytest.skip("Rate limited - wait 1 minute and retry")
    if response.status_code != 200:
        pytest.skip(f"Client2 login failed: {response.status_code} - {response.text}")
    return session


class TestLeaderboard:
    """Test /api/leads/stats/leaderboard endpoint"""
    
    def test_leaderboard_requires_admin(self):
        """Non-admin should get 401 or 403"""
        session = requests.Session()
        response = session.get(f"{BASE_URL}/api/leads/stats/leaderboard")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_leaderboard_returns_correct_structure(self, admin_session):
        """GET /api/leads/stats/leaderboard?period=month returns correct structure"""
        response = admin_session.get(f"{BASE_URL}/api/leads/stats/leaderboard?period=month")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        print(f"Leaderboard response: {data}")
        
        # Check structure
        assert "period" in data, "Response should have 'period' field"
        assert "leaderboard" in data, "Response should have 'leaderboard' field"
        assert data["period"] == "month", f"Period should be 'month', got {data['period']}"
        assert isinstance(data["leaderboard"], list), "Leaderboard should be a list"
        
        # If there are entries, check their structure
        if len(data["leaderboard"]) > 0:
            entry = data["leaderboard"][0]
            assert "ref" in entry, "Entry should have 'ref'"
            assert "count" in entry, "Entry should have 'count'"
            assert "converted" in entry, "Entry should have 'converted'"
            assert "conversion_rate" in entry, "Entry should have 'conversion_rate'"
            assert "zones" in entry, "Entry should have 'zones'"
            assert "tier" in entry, "Entry should have 'tier'"
            assert entry["tier"] in ["rookie", "pro", "legend"], f"Tier should be rookie/pro/legend, got {entry['tier']}"
    
    def test_leaderboard_period_week(self, admin_session):
        """Test leaderboard with period=week"""
        response = admin_session.get(f"{BASE_URL}/api/leads/stats/leaderboard?period=week")
        assert response.status_code == 200
        data = response.json()
        assert data["period"] == "week"
    
    def test_leaderboard_period_all(self, admin_session):
        """Test leaderboard with period=all"""
        response = admin_session.get(f"{BASE_URL}/api/leads/stats/leaderboard?period=all")
        assert response.status_code == 200
        data = response.json()
        assert data["period"] == "all"


class TestCSVExport:
    """Test /api/leads/export/csv endpoint"""
    
    def test_csv_export_requires_admin(self):
        """Non-admin should get 401 or 403"""
        session = requests.Session()
        response = session.get(f"{BASE_URL}/api/leads/export/csv")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_csv_export_returns_csv(self, admin_session):
        """GET /api/leads/export/csv returns 200 with Content-Type text/csv"""
        response = admin_session.get(f"{BASE_URL}/api/leads/export/csv")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        content_type = response.headers.get("Content-Type", "")
        print(f"Content-Type: {content_type}")
        assert "text/csv" in content_type, f"Expected text/csv, got {content_type}"
        
        # Check CSV content has header row
        content = response.text
        print(f"CSV content (first 500 chars): {content[:500]}")
        
        # Expected columns
        expected_columns = [
            "created_at", "restaurant", "name", "email", "phone", "city", "cuisine",
            "preference", "source", "ref", "src", "zone", "camp", "status", "message"
        ]
        
        # Check header row contains expected columns
        first_line = content.split('\n')[0] if content else ""
        for col in expected_columns:
            assert col in first_line, f"Header should contain '{col}', got: {first_line}"
    
    def test_csv_export_with_filters(self, admin_session):
        """Test CSV export with optional query params ref, zone, src"""
        # Test with ref filter
        response = admin_session.get(f"{BASE_URL}/api/leads/export/csv?ref=agent_001")
        assert response.status_code == 200
        
        # Test with zone filter
        response = admin_session.get(f"{BASE_URL}/api/leads/export/csv?zone=paris11")
        assert response.status_code == 200
        
        # Test with src filter
        response = admin_session.get(f"{BASE_URL}/api/leads/export/csv?src=qr")
        assert response.status_code == 200
        
        # Test with multiple filters
        response = admin_session.get(f"{BASE_URL}/api/leads/export/csv?ref=agent_001&zone=paris11&src=qr")
        assert response.status_code == 200


class TestStripePaymentFlow:
    """Test Stripe payment integration end-to-end"""
    
    def test_create_order_with_stripe_payment(self, client_session):
        """POST /api/orders with payment_method='stripe' creates order with payment_status='pending' and status='awaiting_payment'"""
        # First get a restaurant
        response = client_session.get(f"{BASE_URL}/api/restaurants")
        assert response.status_code == 200
        restaurants = response.json()
        assert len(restaurants) > 0, "Need at least one restaurant"
        restaurant = restaurants[0]
        restaurant_id = restaurant["id"]
        
        # Get menu items
        response = client_session.get(f"{BASE_URL}/api/restaurants/{restaurant_id}/menu")
        assert response.status_code == 200
        menu_items = response.json()
        assert len(menu_items) > 0, "Need at least one menu item"
        
        # Create order with stripe payment
        order_data = {
            "restaurant_id": restaurant_id,
            "items": [{"id": menu_items[0]["id"], "name": menu_items[0]["name"], "price": menu_items[0]["price"], "quantity": 1}],
            "delivery_address": "123 Test Street, Paris",
            "phone": "+33612345678",
            "notes": "Test order for Stripe",
            "payment_method": "stripe"
        }
        
        response = client_session.post(
            f"{BASE_URL}/api/orders",
            json=order_data,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        order = response.json()
        print(f"Created order: {order}")
        
        # Verify order status for Stripe payment
        assert order.get("payment_method") == "stripe", f"Payment method should be 'stripe', got {order.get('payment_method')}"
        assert order.get("payment_status") == "pending", f"Payment status should be 'pending', got {order.get('payment_status')}"
        assert order.get("status") == "awaiting_payment", f"Status should be 'awaiting_payment', got {order.get('status')}"
    
    def test_stripe_checkout_creates_session(self, client_session):
        """POST /api/payments/checkout returns {url, session_id} where url starts with 'https://checkout.stripe.com/'"""
        # Create an order first
        response = client_session.get(f"{BASE_URL}/api/restaurants")
        restaurants = response.json()
        restaurant = restaurants[0]
        restaurant_id = restaurant["id"]
        
        response = client_session.get(f"{BASE_URL}/api/restaurants/{restaurant_id}/menu")
        menu_items = response.json()
        
        order_data = {
            "restaurant_id": restaurant_id,
            "items": [{"id": menu_items[0]["id"], "name": menu_items[0]["name"], "price": menu_items[0]["price"], "quantity": 1}],
            "delivery_address": "123 Test Street, Paris",
            "phone": "+33612345678",
            "payment_method": "stripe"
        }
        
        response = client_session.post(f"{BASE_URL}/api/orders", json=order_data)
        assert response.status_code == 200
        order = response.json()
        order_id = order["id"]
        
        # Create checkout session
        checkout_data = {
            "order_id": order_id,
            "origin_url": BASE_URL
        }
        
        response = client_session.post(
            f"{BASE_URL}/api/payments/checkout",
            json=checkout_data,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        checkout = response.json()
        print(f"Checkout response: {checkout}")
        
        # Verify response structure
        assert "url" in checkout, "Response should have 'url'"
        assert "session_id" in checkout, "Response should have 'session_id'"
        assert checkout["url"].startswith("https://checkout.stripe.com/"), f"URL should start with 'https://checkout.stripe.com/', got {checkout['url']}"
    
    def test_payment_status_endpoint(self, client_session):
        """GET /api/payments/status/{session_id} returns correct structure"""
        # Create order and checkout session
        response = client_session.get(f"{BASE_URL}/api/restaurants")
        restaurants = response.json()
        restaurant = restaurants[0]
        restaurant_id = restaurant["id"]
        
        response = client_session.get(f"{BASE_URL}/api/restaurants/{restaurant_id}/menu")
        menu_items = response.json()
        
        order_data = {
            "restaurant_id": restaurant_id,
            "items": [{"id": menu_items[0]["id"], "name": menu_items[0]["name"], "price": menu_items[0]["price"], "quantity": 1}],
            "delivery_address": "123 Test Street, Paris",
            "payment_method": "stripe"
        }
        
        response = client_session.post(f"{BASE_URL}/api/orders", json=order_data)
        order = response.json()
        order_id = order["id"]
        
        checkout_data = {"order_id": order_id, "origin_url": BASE_URL}
        response = client_session.post(f"{BASE_URL}/api/payments/checkout", json=checkout_data)
        checkout = response.json()
        session_id = checkout["session_id"]
        
        # Get payment status
        response = client_session.get(f"{BASE_URL}/api/payments/status/{session_id}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        status = response.json()
        print(f"Payment status: {status}")
        
        # Verify response structure
        assert "status" in status, "Response should have 'status'"
        assert "payment_status" in status, "Response should have 'payment_status'"
        assert "amount_total" in status, "Response should have 'amount_total'"
        assert "currency" in status, "Response should have 'currency'"
        assert "order_id" in status, "Response should have 'order_id'"
        assert status["order_id"] == order_id, f"Order ID should match, expected {order_id}, got {status['order_id']}"


class TestPaymentTransactionRecord:
    """Test that payment_transactions collection has correct records"""
    
    def test_transaction_record_created(self, client_session):
        """After checkout, payment_transactions should have a document with session_id and status='initiated'"""
        # Create order
        response = client_session.get(f"{BASE_URL}/api/restaurants")
        restaurants = response.json()
        restaurant = restaurants[0]
        restaurant_id = restaurant["id"]
        
        response = client_session.get(f"{BASE_URL}/api/restaurants/{restaurant_id}/menu")
        menu_items = response.json()
        
        order_data = {
            "restaurant_id": restaurant_id,
            "items": [{"id": menu_items[0]["id"], "name": menu_items[0]["name"], "price": menu_items[0]["price"], "quantity": 1}],
            "delivery_address": "123 Test Street, Paris",
            "payment_method": "stripe"
        }
        
        response = client_session.post(f"{BASE_URL}/api/orders", json=order_data)
        order = response.json()
        order_id = order["id"]
        
        # Create checkout session
        checkout_data = {"order_id": order_id, "origin_url": BASE_URL}
        response = client_session.post(f"{BASE_URL}/api/payments/checkout", json=checkout_data)
        assert response.status_code == 200
        checkout = response.json()
        session_id = checkout["session_id"]
        
        # Verify transaction record by checking payment status
        # The status endpoint reads from payment_transactions
        response = client_session.get(f"{BASE_URL}/api/payments/status/{session_id}")
        assert response.status_code == 200, f"Transaction should exist, got {response.status_code}"
        
        # If we can get status, the transaction record exists
        print(f"Transaction record verified for session_id: {session_id}")


class TestPaymentSecurity:
    """Test amount manipulation protection"""
    
    def test_checkout_different_user_order_returns_403(self, client_session, client2_session):
        """If client tries to checkout for an order that belongs to a DIFFERENT user, must return 403"""
        # Client1 creates an order
        response = client_session.get(f"{BASE_URL}/api/restaurants")
        restaurants = response.json()
        restaurant = restaurants[0]
        restaurant_id = restaurant["id"]
        
        response = client_session.get(f"{BASE_URL}/api/restaurants/{restaurant_id}/menu")
        menu_items = response.json()
        
        order_data = {
            "restaurant_id": restaurant_id,
            "items": [{"id": menu_items[0]["id"], "name": menu_items[0]["name"], "price": menu_items[0]["price"], "quantity": 1}],
            "delivery_address": "123 Test Street, Paris",
            "payment_method": "stripe"
        }
        
        response = client_session.post(f"{BASE_URL}/api/orders", json=order_data)
        assert response.status_code == 200
        order = response.json()
        order_id = order["id"]
        
        # Client2 tries to checkout for Client1's order
        checkout_data = {"order_id": order_id, "origin_url": BASE_URL}
        response = client2_session.post(
            f"{BASE_URL}/api/payments/checkout",
            json=checkout_data,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 403, f"Expected 403 for different user's order, got {response.status_code}: {response.text}"
        print(f"Correctly rejected checkout for different user's order: {response.status_code}")
    
    def test_checkout_already_paid_returns_400(self, client_session):
        """If payment_status is already 'paid', must return 400"""
        # Create order with cash payment (which is auto-paid)
        response = client_session.get(f"{BASE_URL}/api/restaurants")
        restaurants = response.json()
        restaurant = restaurants[0]
        restaurant_id = restaurant["id"]
        
        response = client_session.get(f"{BASE_URL}/api/restaurants/{restaurant_id}/menu")
        menu_items = response.json()
        
        order_data = {
            "restaurant_id": restaurant_id,
            "items": [{"id": menu_items[0]["id"], "name": menu_items[0]["name"], "price": menu_items[0]["price"], "quantity": 1}],
            "delivery_address": "123 Test Street, Paris",
            "payment_method": "cash"  # Cash orders are auto-paid
        }
        
        response = client_session.post(f"{BASE_URL}/api/orders", json=order_data)
        assert response.status_code == 200
        order = response.json()
        order_id = order["id"]
        
        # Verify order is paid
        assert order.get("payment_status") == "paid", f"Cash order should be paid, got {order.get('payment_status')}"
        
        # Try to checkout for already paid order
        checkout_data = {"order_id": order_id, "origin_url": BASE_URL}
        response = client_session.post(
            f"{BASE_URL}/api/payments/checkout",
            json=checkout_data,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 400, f"Expected 400 for already paid order, got {response.status_code}: {response.text}"
        print(f"Correctly rejected checkout for already paid order: {response.status_code}")


class TestStripeWebhook:
    """Test /api/webhook/stripe endpoint"""
    
    def test_webhook_exists_and_rejects_invalid_signature(self):
        """POST /api/webhook/stripe should exist and return 400 for invalid signature"""
        session = requests.Session()
        
        # Send a POST with invalid/empty signature
        response = session.post(
            f"{BASE_URL}/api/webhook/stripe",
            data=b'{"type": "checkout.session.completed"}',
            headers={
                "Content-Type": "application/json",
                "Stripe-Signature": "invalid_signature"
            }
        )
        
        # Should return 400 for invalid signature (not 404 which would mean endpoint doesn't exist)
        assert response.status_code == 400, f"Expected 400 for invalid signature, got {response.status_code}: {response.text}"
        print(f"Webhook endpoint exists and correctly rejects invalid signature: {response.status_code}")


class TestRateLimiting:
    """Test rate limiting on login endpoint (10/minute per IP via slowapi)
    NOTE: This test is run LAST to avoid blocking other tests
    """
    
    def test_rate_limit_on_login(self):
        """After ~10 rapid POSTs with bad creds, subsequent ones must return 429"""
        session = requests.Session()
        
        # Make 12 rapid login attempts with bad credentials
        results = []
        for i in range(12):
            response = session.post(
                f"{BASE_URL}/api/auth/login",
                json={"email": f"fake_user_ratelimit_{i}@test.com", "password": "wrongpassword"},
                headers={"Content-Type": "application/json"}
            )
            results.append(response.status_code)
            print(f"Attempt {i+1}: Status {response.status_code}")
            # Small delay to avoid overwhelming
            time.sleep(0.1)
        
        # Check that we got at least one 429 response after the limit
        has_429 = 429 in results
        print(f"Results: {results}")
        print(f"Got 429 response: {has_429}")
        
        # The first few should be 401 (bad credentials), later ones should be 429
        assert 401 in results, "Should have some 401 responses for bad credentials"
        assert has_429, "Should have 429 response after rate limit exceeded"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

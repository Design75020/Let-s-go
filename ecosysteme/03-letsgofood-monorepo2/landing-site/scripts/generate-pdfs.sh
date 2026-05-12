#!/bin/bash
# ═══════════════════════════════════════════════════════════
# Génère les 4 PDFs A4 de la landing page letsgofood.fr + ZIP
#
# Les PDFs sont écrits dans 2 emplacements :
#   1. landing-site/public/pdfs/        → bundlé lors du build Vercel
#   2. frontend/public/landing-preview/ → accessible depuis le preview Emergent
#
# Usage : ./scripts/generate-pdfs.sh
# ═══════════════════════════════════════════════════════════

set -e
cd "$(dirname "$0")/.."

# Source of truth : le dossier public de landing-site (Vercel friendly)
SRC_DIR="/app/landing-site/public/pdfs"
# Mirror : preview Emergent
MIRROR_DIR="/app/frontend/public/landing-preview/pdfs"

mkdir -p "$SRC_DIR" "$MIRROR_DIR"

# Build landing-site (sans base path → pour preview local)
echo "▶ Building landing site…"
yarn build > /dev/null

# Kill previous preview if any
pkill -f "vite preview" 2>/dev/null || true
sleep 1

# Start preview server
echo "▶ Starting preview server on :4173…"
nohup yarn preview > /tmp/landing-preview.log 2>&1 &
sleep 4

# Generate PDFs
PAGES=(
  "accueil:/"
  "restaurants:/pour-restaurants"
  "livreurs:/pour-livreurs"
  "clients:/pour-clients"
)

for entry in "${PAGES[@]}"; do
  NAME="${entry%%:*}"
  PATH_="${entry##*:}"
  echo "▶ Generating letsgofood-$NAME.pdf ($PATH_)"
  google-chrome \
    --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
    --virtual-time-budget=10000 \
    --run-all-compositor-stages-before-draw \
    --no-pdf-header-footer \
    --print-to-pdf="$SRC_DIR/letsgofood-$NAME.pdf" \
    "http://localhost:4173$PATH_" 2>&1 | grep -E "bytes|ERROR" | head -1 || true
done

pkill -f "vite preview" 2>/dev/null || true

# Pack complet ZIP (4 PDFs groupés pour téléchargement unique)
echo "▶ Building ZIP bundle…"
cd "$SRC_DIR"
rm -f letsgofood-pack-complet.zip
zip -j letsgofood-pack-complet.zip \
  letsgofood-accueil.pdf \
  letsgofood-restaurants.pdf \
  letsgofood-livreurs.pdf \
  letsgofood-clients.pdf > /dev/null

# Mirror all files to the preview directory
echo "▶ Mirroring to preview dir…"
cp -f "$SRC_DIR"/letsgofood-*.pdf "$MIRROR_DIR/"
cp -f "$SRC_DIR"/letsgofood-pack-complet.zip "$MIRROR_DIR/"

# Generate SPA fallback copies of index.html for each React Router sub-route
# (required on static servers without a catch-all rewrite — production Vercel
# handles this natively via `framework: vite` + `cleanUrls: true`).
PREVIEW_DIR="/app/frontend/public/landing-preview"
if [ -f "$PREVIEW_DIR/index.html" ]; then
  echo "▶ Creating SPA fallback for sub-routes…"
  for path in pour-restaurants pour-livreurs pour-clients onboarding \
             brochure/accueil brochure/restaurateur brochure/livreur brochure/client; do
    mkdir -p "$PREVIEW_DIR/$path"
    cp -f "$PREVIEW_DIR/index.html" "$PREVIEW_DIR/$path/index.html"
  done
fi

echo ""
echo "✅ PDFs source de vérité : $SRC_DIR"
ls -lh "$SRC_DIR"
echo ""
echo "✅ Miroir preview Emergent : $MIRROR_DIR"
ls -lh "$MIRROR_DIR"

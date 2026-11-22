#!/usr/bin/env bash
# Regenerates the iOS and Android app icons and splash screens from one source image.
#
#   ./scripts/generate-native-assets.sh [path/to/logo.png]
#
# Requires ImageMagick (`convert`). The source should be a square image, ideally
# 1024x1024 or larger, with the mark centred on the brand background colour.
# The current source (src/assets/logo-icon.png) is only 512x512, so the 1024px
# App Store icon is upscaled: replace it with full-resolution artwork and re-run.
set -euo pipefail
cd "$(dirname "$0")/.."

SRC="${1:-src/assets/logo-icon.png}"
BG="#051920"                       # matches the logo's own background
RES=android/app/src/main/res
IOS=ios/App/App/Assets.xcassets
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

# Logo with softly faded edges, so it sits on the background without a visible square.
convert "$SRC" -filter Lanczos -resize 1024x1024 -alpha off "$TMP/logo.png"
convert -size 1024x1024 radial-gradient:white-black -level 0%,30% "$TMP/mask.png"
convert "$TMP/logo.png" "$TMP/mask.png" -alpha off -compose CopyOpacity -composite "$TMP/logo-soft.png"

# Canvas W x H in the background colour with the logo centred at LOGO px.
splash() { # out width height logo_px
  convert -size "${2}x${3}" "xc:$BG" \( "$TMP/logo-soft.png" -resize "${4}x${4}" \) \
    -gravity center -compose over -composite -alpha off -strip "PNG24:$1"
}

# --- iOS -------------------------------------------------------------------
convert "$TMP/logo.png" -alpha off -strip "PNG24:$IOS/AppIcon.appiconset/AppIcon-512@2x.png"
for f in splash-2732x2732.png splash-2732x2732-1.png splash-2732x2732-2.png; do
  splash "$IOS/Splash.imageset/$f" 2732 2732 900
done

# --- Android launcher icons ---------------------------------------------------
for spec in mdpi:48:108 hdpi:72:162 xhdpi:96:216 xxhdpi:144:324 xxxhdpi:192:432; do
  IFS=: read -r density legacy adaptive <<<"$spec"
  dir="$RES/mipmap-$density"
  # Legacy square icon
  convert "$TMP/logo.png" -resize "${legacy}x${legacy}" -strip "PNG32:$dir/ic_launcher.png"
  # Legacy round icon
  convert "$TMP/logo.png" -resize "${legacy}x${legacy}" \
    \( -size "${legacy}x${legacy}" xc:black -fill white -draw "circle $((legacy/2)),$((legacy/2)) $((legacy/2)),0" \) \
    -alpha off -compose CopyOpacity -composite -strip "PNG32:$dir/ic_launcher_round.png"
  # Adaptive foreground: transparent canvas, mark kept inside the launcher's safe zone
  inner=$((adaptive * 88 / 100))
  convert -size "${adaptive}x${adaptive}" xc:none \( "$TMP/logo-soft.png" -resize "${inner}x${inner}" \) \
    -gravity center -compose over -composite -strip "PNG32:$dir/ic_launcher_foreground.png"
done

# --- Android splash screens -----------------------------------------------------
while read -r path w h; do
  short=$(( w < h ? w : h ))
  splash "$RES/$path/splash.png" "$w" "$h" $(( short * 55 / 100 ))
done <<'SIZES'
drawable 480 320
drawable-land-mdpi 480 320
drawable-land-hdpi 800 480
drawable-land-xhdpi 1280 720
drawable-land-xxhdpi 1600 960
drawable-land-xxxhdpi 1920 1280
drawable-port-mdpi 320 480
drawable-port-hdpi 480 800
drawable-port-xhdpi 720 1280
drawable-port-xxhdpi 960 1600
drawable-port-xxxhdpi 1280 1920
SIZES

echo "Generated native icons and splash screens from $SRC"

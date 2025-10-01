#!/bin/bash

# Image Optimization Script
# This script converts JPG images to WebP format for better performance

echo "🖼️  Image Optimization Script"
echo "================================"
echo ""

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo "❌ cwebp is not installed"
    echo "📦 Install with:"
    echo "   macOS: brew install webp"
    echo "   Ubuntu/Debian: sudo apt-get install webp"
    echo "   Windows: Download from https://developers.google.com/speed/webp/download"
    exit 1
fi

# Directory containing images
ASSETS_DIR="./src/assets"

echo "📁 Processing images in: $ASSETS_DIR"
echo ""

# Convert all JPG files to WebP
for img in "$ASSETS_DIR"/*.jpg; do
    if [ -f "$img" ]; then
        filename=$(basename "$img" .jpg)
        output="$ASSETS_DIR/$filename.webp"
        
        echo "🔄 Converting: $filename.jpg → $filename.webp"
        
        # Convert with 80% quality (good balance of size and quality)
        cwebp -q 80 "$img" -o "$output"
        
        # Show file size comparison
        original_size=$(du -h "$img" | cut -f1)
        new_size=$(du -h "$output" | cut -f1)
        echo "   Original: $original_size | WebP: $new_size"
        echo ""
    fi
done

echo "✅ Optimization complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Update image imports in your components to use .webp files"
echo "   2. Or use the OptimizedImage component with <picture> element"
echo "   3. Keep original JPGs as fallback for older browsers"
echo ""
echo "Example usage:"
echo "   import heroBannerWebP from '@/assets/hero-banner.webp';"
echo "   import heroBannerJPG from '@/assets/hero-banner.jpg';"
echo ""
echo "   <picture>"
echo "     <source srcset={heroBannerWebP} type=\"image/webp\" />"
echo "     <img src={heroBannerJPG} alt=\"...\" />"
echo "   </picture>"


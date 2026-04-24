#!/usr/bin/env python3
"""Genera icone placeholder PWA per ListinoHub.
Output in public/icons/: icon-192, icon-512, icon-maskable-512, apple-touch-icon (180).
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "icons"
OUT.mkdir(parents=True, exist_ok=True)

NAV = (21, 23, 28)       # #15171c
ACCENT = (200, 16, 46)   # #c8102e
WHITE = (255, 255, 255)


def load_font(size: int) -> ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/HelveticaNeue.ttc",
        "/Library/Fonts/Arial Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    for p in candidates:
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size=size)
            except Exception:
                pass
    return ImageFont.load_default()


def draw_icon(size: int, maskable: bool = False) -> Image.Image:
    img = Image.new("RGB", (size, size), NAV)
    d = ImageDraw.Draw(img)

    if not maskable:
        border = max(2, size // 32)
        inset = border // 2
        d.rectangle(
            [inset, inset, size - 1 - inset, size - 1 - inset],
            outline=ACCENT,
            width=border,
        )

    # Safe zone del 80% per maskable, 100% normale
    glyph_size = int(size * (0.55 if maskable else 0.65))
    font = load_font(glyph_size)
    bbox = d.textbbox((0, 0), "L", font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = (size - tw) // 2 - bbox[0]
    ty = (size - th) // 2 - bbox[1]
    d.text((tx, ty), "L", font=font, fill=WHITE)
    return img


def save(img: Image.Image, name: str) -> None:
    path = OUT / name
    img.save(path, "PNG", optimize=True)
    print(f"  {path.relative_to(ROOT)} ({img.size[0]}x{img.size[1]})")


if __name__ == "__main__":
    print("ListinoHub — genero icone placeholder in public/icons/")
    save(draw_icon(192), "icon-192.png")
    save(draw_icon(512), "icon-512.png")
    save(draw_icon(512, maskable=True), "icon-maskable-512.png")
    save(draw_icon(180), "apple-touch-icon.png")
    print("Fatto.")

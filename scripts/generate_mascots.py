import os
import math
from PIL import Image, ImageDraw

OUTPUT_DIRS = [
    os.path.join(os.path.dirname(__file__), '..', 'public', 'mascot'),
    os.path.join(os.path.dirname(__file__), '..', 'dist', 'mascot')
]

for d in OUTPUT_DIRS:
    os.makedirs(d, exist_ok=True)

W, H = 400, 440
RENDER_W, RENDER_H = 200, 220

def draw_pixar_base(draw, t, cx, cy, bob, head_tilt=0.0, eye_mode='normal', core_glow=True):
    """Draws the core Pixar robot chassis with glossy ceramic finish and glowing OLED eyes."""
    # 1. Ground contact shadow
    shadow_w = 75 + math.cos(t * math.pi * 2) * 6
    draw.ellipse([cx - shadow_w, H - 32, cx + shadow_w, H - 16], fill=(15, 23, 42, 65))
    
    # 2. Magnetic hovering boots
    foot_bob_l = math.sin(t * math.pi * 2) * 3
    foot_bob_r = math.cos(t * math.pi * 2) * 3
    # Left boot
    draw.rounded_rectangle([cx - 48, H - 65 + foot_bob_l, cx - 18, H - 45 + foot_bob_l], radius=10, fill=(241, 245, 249, 255), outline=(148, 163, 184, 255), width=3)
    draw.ellipse([cx - 38, H - 52 + foot_bob_l, cx - 28, H - 46 + foot_bob_l], fill=(56, 189, 248, 220))
    # Right boot
    draw.rounded_rectangle([cx + 18, H - 65 + foot_bob_r, cx + 48, H - 45 + foot_bob_r], radius=10, fill=(241, 245, 249, 255), outline=(148, 163, 184, 255), width=3)
    draw.ellipse([cx + 28, H - 52 + foot_bob_r, cx + 38, H - 46 + foot_bob_r], fill=(56, 189, 248, 220))

    # 3. Floating Body (Pearlescent White Ceramic)
    body_y = cy + bob
    # Shadow under neck
    draw.ellipse([cx - 30, body_y - 25, cx + 30, body_y - 12], fill=(51, 65, 85, 255))
    draw.ellipse([cx - 24, body_y - 23, cx + 24, body_y - 14], fill=(56, 189, 248, 180))
    
    # Torso
    draw.rounded_rectangle([cx - 56, body_y - 18, cx + 56, body_y + 72], radius=34, fill=(248, 250, 252, 255), outline=(203, 213, 225, 255), width=4)
    # Shading gradient line
    draw.arc([cx - 50, body_y - 10, cx + 50, body_y + 60], start=160, end=270, fill=(255, 255, 255, 240), width=6)
    draw.arc([cx - 48, body_y + 15, cx + 48, body_y + 66], start=20, end=90, fill=(148, 163, 184, 180), width=3)
    
    # Glowing Chest Reactor
    if core_glow:
        r_pulse = 15 + math.sin(t * math.pi * 2) * 2
        draw.ellipse([cx - r_pulse - 4, body_y + 26 - r_pulse - 4, cx + r_pulse + 4, body_y + 26 + r_pulse + 4], fill=(56, 189, 248, 70))
        draw.ellipse([cx - r_pulse, body_y + 26 - r_pulse, cx + r_pulse, body_y + 26 + r_pulse], fill=(14, 165, 233, 220))
        draw.ellipse([cx - 6, body_y + 26 - 6, cx + 6, body_y + 26 + 6], fill=(255, 255, 255, 255))

    # 4. Floating Head
    head_y = body_y - 88
    hx = cx + head_tilt * 10
    draw.rounded_rectangle([hx - 66, head_y - 48, hx + 66, head_y + 36], radius=38, fill=(255, 255, 255, 255), outline=(203, 213, 225, 255), width=4)
    # Head highlight
    draw.arc([hx - 58, head_y - 42, hx + 58, head_y + 20], start=190, end=330, fill=(255, 255, 255, 255), width=5)
    
    # Antenna / Signal Fin
    draw.rounded_rectangle([hx - 4, head_y - 62, hx + 4, head_y - 46], radius=2, fill=(148, 163, 184, 255))
    draw.ellipse([hx - 8, head_y - 72, hx + 8, head_y - 58], fill=(56, 189, 248, 255), outline=(255, 255, 255, 255), width=2)
    draw.ellipse([hx - 3, head_y - 68, hx + 3, head_y - 62], fill=(255, 255, 255, 255))

    # Glass Visor (Glossy Obsidian)
    draw.rounded_rectangle([hx - 52, head_y - 32, hx + 52, head_y + 22], radius=22, fill=(15, 23, 42, 255))
    # Visor reflections
    draw.line([hx - 42, head_y - 25, hx - 30, head_y - 25], fill=(255, 255, 255, 90), width=2)
    
    # OLED Cyan Eyes
    eye_dx = 21
    if eye_mode == 'happy': # Arched ^ ^ eyes
        draw.arc([hx - eye_dx - 13, head_y - 15, hx - eye_dx + 13, head_y + 7], start=190, end=350, fill=(56, 189, 248, 255), width=6)
        draw.arc([hx + eye_dx - 13, head_y - 15, hx + eye_dx + 13, head_y + 7], start=190, end=350, fill=(56, 189, 248, 255), width=6)
    elif eye_mode == 'blink': # Closed flat lines
        draw.line([hx - eye_dx - 12, head_y - 4, hx - eye_dx + 12, head_y - 4], fill=(56, 189, 248, 255), width=4)
        draw.line([hx + eye_dx - 12, head_y - 4, hx + eye_dx + 12, head_y - 4], fill=(56, 189, 248, 255), width=4)
    elif eye_mode == 'rest': # Soft serene downward curves (20-20-20 eye rest)
        draw.arc([hx - eye_dx - 14, head_y - 20, hx - eye_dx + 14, head_y - 2], start=10, end=170, fill=(56, 189, 248, 255), width=5)
        draw.arc([hx + eye_dx - 14, head_y - 20, hx + eye_dx + 14, head_y - 2], start=10, end=170, fill=(56, 189, 248, 255), width=5)
    else: # Large lively expressive round eyes
        draw.ellipse([hx - eye_dx - 11, head_y - 16, hx - eye_dx + 11, head_y + 6], fill=(56, 189, 248, 255))
        draw.ellipse([hx - eye_dx - 5, head_y - 13, hx - eye_dx + 3, head_y - 5], fill=(255, 255, 255, 255))
        draw.ellipse([hx + eye_dx - 11, head_y - 16, hx + eye_dx + 11, head_y + 6], fill=(56, 189, 248, 255))
        draw.ellipse([hx + eye_dx - 5, head_y - 13, hx + eye_dx + 3, head_y - 5], fill=(255, 255, 255, 255))

    return body_y, hx, head_y


# -------------------------------------------------------------
# 1. DRINK WATER (Bottle with glug glug, bubbles, drinking motion)
# -------------------------------------------------------------
def frame_drink(t):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = W // 2, H // 2 + 15
    bob = math.sin(t * math.pi * 2) * 5
    
    is_drinking = 0.22 < t < 0.78
    eye_mode = 'happy' if is_drinking else 'normal'
    head_tilt = math.sin(t * math.pi * 2) * 0.15 if is_drinking else 0.0

    body_y, hx, head_y = draw_pixar_base(draw, t, cx, cy, bob, head_tilt=head_tilt, eye_mode=eye_mode)

    # Water Bottle animation
    # Bottle raises up to mouth at t ~ 0.35 to 0.65
    raise_factor = math.sin((t - 0.2) / 0.6 * math.pi) if is_drinking else 0.0
    raise_factor = max(0.0, min(1.0, raise_factor))
    
    bx = cx + 38 - raise_factor * 26
    by = body_y + 36 - raise_factor * 68
    
    # Left arm relaxed
    draw.line([cx - 48, body_y + 12, cx - 74, body_y + 40], fill=(241, 245, 249, 255), width=16)
    draw.circle((cx - 74, body_y + 40), radius=9, fill=(241, 245, 249, 255), outline=(56, 189, 248, 255), width=2)
    
    # Right arm holding bottle up to mouth
    draw.line([cx + 48, body_y + 12, bx + 10, by + 30], fill=(241, 245, 249, 255), width=16)
    draw.line([cx + 48, body_y + 12, bx + 10, by + 30], fill=(148, 163, 184, 255), width=2)
    draw.circle((bx + 10, by + 30), radius=10, fill=(241, 245, 249, 255), outline=(56, 189, 248, 255), width=2)

    # High-Tech Translucent Bottle
    # Body
    draw.rounded_rectangle([bx, by, bx + 32, by + 56], radius=9, fill=(186, 230, 253, 235), outline=(2, 132, 199, 255), width=3)
    # Sloshing Blue Water
    water_h = 32 - raise_factor * 8
    draw.rounded_rectangle([bx + 4, by + 54 - water_h, bx + 28, by + 52], radius=6, fill=(14, 165, 233, 230))
    # Cap & Straw
    draw.rounded_rectangle([bx + 8, by - 8, bx + 24, by], radius=3, fill=(15, 23, 42, 255))
    draw.line([bx + 16, by - 8, bx + 16, by - 20], fill=(244, 63, 94, 255), width=4)
    draw.line([bx + 16, by - 20, bx + 6, by - 26], fill=(244, 63, 94, 255), width=4)

    # Bubbles & Drink sparkles
    if is_drinking:
        b1_y = by + 38 - int(t * 60) % 24
        draw.circle((bx + 18, b1_y), radius=3, fill=(255, 255, 255, 230))
        b2_y = by + 46 - int((t + 0.4) * 60) % 24
        draw.circle((bx + 11, b2_y), radius=2, fill=(255, 255, 255, 230))
        # Refreshing cyan splash droplet
        draw.circle((bx - 8, by - 12 + math.sin(t * 20) * 4), radius=3, fill=(56, 189, 248, 220))

    return img.resize((RENDER_W, RENDER_H), Image.Resampling.LANCZOS)


# -------------------------------------------------------------
# 2. STRETCH & EXERCISE (Arms overhead, workout energy arcs)
# -------------------------------------------------------------
def frame_stretch(t):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = W // 2, H // 2 + 15
    bob = math.sin(t * math.pi * 2) * 8
    
    # Glowing stretch energy rings
    stretch_phase = (math.sin(t * math.pi * 2) + 1) / 2
    arc_rad = 70 + stretch_phase * 20
    draw.arc([cx - arc_rad, cy - 80 - arc_rad, cx + arc_rad, cy - 80 + arc_rad], start=210, end=330, fill=(56, 189, 248, 140), width=4)
    draw.arc([cx - arc_rad + 15, cy - 80 - arc_rad + 15, cx + arc_rad - 15, cy - 80 + arc_rad - 15], start=220, end=320, fill=(14, 165, 233, 90), width=3)

    body_y, hx, head_y = draw_pixar_base(draw, t, cx, cy, bob, head_tilt=0.0, eye_mode='happy')

    # Both Arms reaching high up overhead
    arm_ext = 35 + stretch_phase * 25
    # Left Arm
    draw.line([cx - 48, body_y + 10, cx - 55, body_y - arm_ext], fill=(241, 245, 249, 255), width=16)
    draw.line([cx - 48, body_y + 10, cx - 55, body_y - arm_ext], fill=(148, 163, 184, 255), width=2)
    draw.circle((cx - 55, body_y - arm_ext), radius=10, fill=(241, 245, 249, 255), outline=(56, 189, 248, 255), width=3)
    
    # Right Arm
    draw.line([cx + 48, body_y + 10, cx + 55, body_y - arm_ext], fill=(241, 245, 249, 255), width=16)
    draw.line([cx + 48, body_y + 10, cx + 55, body_y - arm_ext], fill=(148, 163, 184, 255), width=2)
    draw.circle((cx + 55, body_y - arm_ext), radius=10, fill=(241, 245, 249, 255), outline=(56, 189, 248, 255), width=3)

    # Sparkling exercise stars
    star_y = head_y - 45 - stretch_phase * 15
    draw.circle((cx - 75, star_y), radius=4, fill=(250, 204, 21, 255))
    draw.circle((cx + 75, star_y), radius=4, fill=(250, 204, 21, 255))

    return img.resize((RENDER_W, RENDER_H), Image.Resampling.LANCZOS)


# -------------------------------------------------------------
# 3. WALKING (Smooth walking strides, alternating feet, arm swings)
# -------------------------------------------------------------
def frame_walk(t):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = W // 2, H // 2 + 15
    bob = abs(math.sin(t * math.pi * 2)) * 9 # Walking bounce
    
    # Stride stride
    stride = math.sin(t * math.pi * 2) * 26

    # Ground shadow
    shadow_w = 70 + math.cos(t * math.pi * 2) * 4
    draw.ellipse([cx - shadow_w, H - 32, cx + shadow_w, H - 16], fill=(15, 23, 42, 65))

    # Stepping Feet
    foot_l_x = cx - 28 + stride
    foot_l_y = H - 55 - max(0, -stride * 0.4)
    draw.rounded_rectangle([foot_l_x - 14, foot_l_y - 8, foot_l_x + 14, foot_l_y + 8], radius=8, fill=(241, 245, 249, 255), outline=(148, 163, 184, 255), width=3)
    draw.ellipse([foot_l_x - 5, foot_l_y - 2, foot_l_x + 5, foot_l_y + 3], fill=(56, 189, 248, 220))

    foot_r_x = cx + 28 - stride
    foot_r_y = H - 55 - max(0, stride * 0.4)
    draw.rounded_rectangle([foot_r_x - 14, foot_r_y - 8, foot_r_x + 14, foot_r_y + 8], radius=8, fill=(241, 245, 249, 255), outline=(148, 163, 184, 255), width=3)
    draw.ellipse([foot_r_x - 5, foot_r_y - 2, foot_r_x + 5, foot_r_y + 3], fill=(56, 189, 248, 220))

    # Torso & Head
    body_y = cy - bob
    draw.ellipse([cx - 28, body_y - 23, cx + 28, body_y - 12], fill=(51, 65, 85, 255))
    draw.rounded_rectangle([cx - 54, body_y - 18, cx + 54, body_y + 68], radius=32, fill=(248, 250, 252, 255), outline=(203, 213, 225, 255), width=4)
    draw.arc([cx - 48, body_y - 10, cx + 48, body_y + 55], start=160, end=270, fill=(255, 255, 255, 240), width=5)

    # Core
    draw.ellipse([cx - 14, body_y + 24 - 14, cx + 14, body_y + 24 + 14], fill=(14, 165, 233, 220))
    draw.ellipse([cx - 5, body_y + 24 - 5, cx + 5, body_y + 24 + 5], fill=(255, 255, 255, 255))

    # Arms swinging opposite legs
    # Left arm
    arm_l_swing = -stride * 1.1
    draw.line([cx - 48, body_y + 12, cx - 62 + arm_l_swing, body_y + 45], fill=(241, 245, 249, 255), width=15)
    draw.circle((cx - 62 + arm_l_swing, body_y + 45), radius=8, fill=(241, 245, 249, 255), outline=(56, 189, 248, 255), width=2)
    # Right arm
    arm_r_swing = stride * 1.1
    draw.line([cx + 48, body_y + 12, cx + 62 + arm_r_swing, body_y + 45], fill=(241, 245, 249, 255), width=15)
    draw.circle((cx + 62 + arm_r_swing, body_y + 45), radius=8, fill=(241, 245, 249, 255), outline=(56, 189, 248, 255), width=2)

    # Head
    head_y = body_y - 88
    draw.rounded_rectangle([cx - 64, head_y - 46, cx + 64, head_y + 36], radius=38, fill=(255, 255, 255, 255), outline=(203, 213, 225, 255), width=4)
    # Visor
    draw.rounded_rectangle([cx - 50, head_y - 30, cx + 50, head_y + 22], radius=22, fill=(15, 23, 42, 255))
    # Eyes
    eye_dx = 20
    draw.ellipse([cx - eye_dx - 10, head_y - 15, cx - eye_dx + 10, head_y + 5], fill=(56, 189, 248, 255))
    draw.ellipse([cx - eye_dx - 4, head_y - 12, cx - eye_dx + 3, head_y - 5], fill=(255, 255, 255, 255))
    draw.ellipse([cx + eye_dx - 10, head_y - 15, cx + eye_dx + 10, head_y + 5], fill=(56, 189, 248, 255))
    draw.ellipse([cx + eye_dx - 4, head_y - 12, cx + eye_dx + 3, head_y - 5], fill=(255, 255, 255, 255))

    return img.resize((RENDER_W, RENDER_H), Image.Resampling.LANCZOS)


# -------------------------------------------------------------
# 4. IDLE (Gentle floating breathing, blinking, pulsing core)
# -------------------------------------------------------------
def frame_idle(t):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = W // 2, H // 2 + 15
    bob = math.sin(t * math.pi * 2) * 6
    
    # Blink around t = 0.8 to 0.95
    eye_mode = 'blink' if 0.78 < t < 0.92 else 'normal'

    body_y, hx, head_y = draw_pixar_base(draw, t, cx, cy, bob, head_tilt=0.0, eye_mode=eye_mode)

    # Friendly relaxed arms floating alongside
    arm_float = math.cos(t * math.pi * 2) * 3
    # Left Arm
    draw.line([cx - 48, body_y + 12, cx - 66, body_y + 44 + arm_float], fill=(241, 245, 249, 255), width=15)
    draw.circle((cx - 66, body_y + 44 + arm_float), radius=9, fill=(241, 245, 249, 255), outline=(56, 189, 248, 255), width=2)
    # Right Arm
    draw.line([cx + 48, body_y + 12, cx + 66, body_y + 44 - arm_float], fill=(241, 245, 249, 255), width=15)
    draw.circle((cx + 66, body_y + 44 - arm_float), radius=9, fill=(241, 245, 249, 255), outline=(56, 189, 248, 255), width=2)

    return img.resize((RENDER_W, RENDER_H), Image.Resampling.LANCZOS)


# -------------------------------------------------------------
# 5. 20-20-20 EYE REST (Calm relaxation, resting eyes, gentle glow)
# -------------------------------------------------------------
def frame_eyes(t):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = W // 2, H // 2 + 15
    bob = math.sin(t * math.pi * 2) * 4 # very calm breathing

    # Soft glowing ocular relaxation waves
    wave_rad = 60 + math.sin(t * math.pi * 2) * 8
    draw.ellipse([cx - wave_rad, cy - 90 - wave_rad * 0.4, cx + wave_rad, cy - 90 + wave_rad * 0.4], outline=(56, 189, 248, 80), width=3)

    body_y, hx, head_y = draw_pixar_base(draw, t, cx, cy, bob, head_tilt=0.0, eye_mode='rest')

    # Hands resting gently across lap
    draw.line([cx - 48, body_y + 12, cx - 22, body_y + 48], fill=(241, 245, 249, 255), width=14)
    draw.circle((cx - 22, body_y + 48), radius=8, fill=(241, 245, 249, 255), outline=(56, 189, 248, 255), width=2)
    
    draw.line([cx + 48, body_y + 12, cx + 22, body_y + 48], fill=(241, 245, 249, 255), width=14)
    draw.circle((cx + 22, body_y + 48), radius=8, fill=(241, 245, 249, 255), outline=(56, 189, 248, 255), width=2)

    # 20-20-20 Badge floating gently above
    badge_y = head_y - 65 + math.sin(t * math.pi * 2) * 3
    draw.rounded_rectangle([cx - 44, badge_y - 12, cx + 44, badge_y + 12], radius=10, fill=(15, 23, 42, 230), outline=(56, 189, 248, 255), width=2)
    # text dot indicators
    draw.circle((cx - 24, badge_y), radius=3, fill=(56, 189, 248, 255))
    draw.circle((cx, badge_y), radius=3, fill=(56, 189, 248, 255))
    draw.circle((cx + 24, badge_y), radius=3, fill=(56, 189, 248, 255))

    return img.resize((RENDER_W, RENDER_H), Image.Resampling.LANCZOS)


# -------------------------------------------------------------
# 6. CELEBRATING (Victory bounce, raised arms, confetti, gold star)
# -------------------------------------------------------------
def frame_celebrate(t):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = W // 2, H // 2 + 15
    bob = -abs(math.sin(t * math.pi * 2)) * 22 # high jump

    # Confetti particles
    for i in range(8):
        cp_angle = (i / 8.0) * math.pi * 2 + t * 4
        cp_dist = 85 + (i % 3) * 15
        cpx = cx + math.cos(cp_angle) * cp_dist
        cpy = cy - 70 + math.sin(cp_angle) * (cp_dist * 0.7)
        colors = [(250, 204, 21), (56, 189, 248), (244, 63, 94), (168, 85, 247)]
        draw.circle((cpx, cpy), radius=4, fill=(*colors[i % 4], 255))

    body_y, hx, head_y = draw_pixar_base(draw, t, cx, cy, bob, head_tilt=0.0, eye_mode='happy')

    # Both Arms thrown in the air in victory \o/
    draw.line([cx - 48, body_y + 10, cx - 68, body_y - 36], fill=(241, 245, 249, 255), width=16)
    draw.circle((cx - 68, body_y - 36), radius=10, fill=(241, 245, 249, 255), outline=(56, 189, 248, 255), width=2)

    draw.line([cx + 48, body_y + 10, cx + 68, body_y - 36], fill=(241, 245, 249, 255), width=16)
    draw.circle((cx + 68, body_y - 36), radius=10, fill=(241, 245, 249, 255), outline=(56, 189, 248, 255), width=2)

    # Gold Victory Star
    star_y = head_y - 55 + math.sin(t * math.pi * 4) * 4
    draw.circle((cx, star_y), radius=12, fill=(250, 204, 21, 255), outline=(255, 255, 255, 255), width=2)
    draw.circle((cx, star_y), radius=5, fill=(255, 255, 255, 255))

    return img.resize((RENDER_W, RENDER_H), Image.Resampling.LANCZOS)


# -------------------------------------------------------------
# GENERATOR PIPELINE
# -------------------------------------------------------------
ANIMATIONS = {
    'drink': (frame_drink, 18, 70),       # 18 frames @ 70ms = ~1.26s loop
    'stretch': (frame_stretch, 18, 70),   # 18 frames @ 70ms
    'walk': (frame_walk, 16, 65),         # 16 frames @ 65ms = ~1.04s loop
    'idle': (frame_idle, 20, 80),         # 20 frames @ 80ms = ~1.60s loop
    'eyes': (frame_eyes, 18, 75),         # 18 frames @ 75ms
    'celebrate': (frame_celebrate, 16, 65) # 16 frames @ 65ms
}

def to_gif_p_frame(rgba_im):
    """Converts RGBA frame to P mode with designated transparent index to prevent flickering."""
    alpha = rgba_im.split()[-1]
    rgb = rgba_im.convert('RGB')
    p = rgb.convert('P', palette=Image.Palette.ADAPTIVE, colors=254)
    # Mask transparent pixels (alpha < 64)
    mask = Image.eval(alpha, lambda a: 255 if a < 64 else 0)
    p.paste(255, mask)
    p.info['transparency'] = 255
    p.info['disposal'] = 2
    return p

def generate_all():
    for name, (frame_func, num_frames, duration_ms) in ANIMATIONS.items():
        print(f"Generating {name} ({num_frames} frames)...")
        rgba_frames = [frame_func(i / float(num_frames)) for i in range(num_frames)]
        
        # Prepare palette-mode GIF frames
        gif_frames = [to_gif_p_frame(f) for f in rgba_frames]

        for out_dir in OUTPUT_DIRS:
            # 1. Save 32-bit RGBA hardware-accelerated animated WebP (zero flicker, true alpha)
            webp_path = os.path.join(out_dir, f"{name}.webp")
            rgba_frames[0].save(
                webp_path,
                'WEBP',
                save_all=True,
                append_images=rgba_frames[1:],
                duration=duration_ms,
                loop=0,
                quality=95,
                method=4
            )
            print(f"  -> Saved WebP {webp_path} ({os.path.getsize(webp_path)} bytes)")

            # 2. Save GIF with clean palette transparency
            gif_path = os.path.join(out_dir, f"{name}.gif")
            gif_frames[0].save(
                gif_path,
                save_all=True,
                append_images=gif_frames[1:],
                duration=duration_ms,
                loop=0,
                transparency=255,
                disposal=2
            )
            print(f"  -> Saved GIF {gif_path} ({os.path.getsize(gif_path)} bytes)")

if __name__ == '__main__':
    generate_all()
    print("All Pixar Habit WebP & GIF animations generated successfully!")

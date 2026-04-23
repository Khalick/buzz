#!/usr/bin/env python3
"""
BizHub Network — Mind-Blowing Animated Explainer Video v3
Frame-by-frame animations: slide-ins, typing text, floating particles,
pulsing glows, animated transitions, parallax, 15 detailed scenes.
"""
import os, math, random, subprocess, textwrap
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from moviepy import VideoClip, AudioFileClip, concatenate_videoclips, vfx

# ─── Config ──────────────────────────────────────────────────────────────────
OUTPUT = "/home/peter/buzz/BizHub_Explainer_Video.mp4"
B = "/home/peter/.gemini/antigravity/brain/636a882d-2aba-4d3f-a0e9-080619d19f31"
W, H = 1920, 1080
FPS = 24

FEMALE_AVATAR = f"{B}/female_avatar_1776834805387.png"
MALE_AVATAR   = f"{B}/male_avatar_1776834819674.png"
FEMALE_VOICE  = "en-US-AriaNeural"
MALE_VOICE    = "en-US-AndrewMultilingualNeural"

IMG = {
    "community":    f"{B}/scene_happy_community_1776836815341.png",
    "frustrated":   f"{B}/scene_frustrated_search_1776836647574.png",
    "scam":         f"{B}/scene_online_scam_1776836663817.png",
    "broadcast":    f"{B}/scene_broadcast_request_1776836677201.png",
    "verification": f"{B}/scene_verification_agent_1776836706427.png",
    "ai_chat":      f"{B}/scene_ai_chat_1776836721371.png",
    "flash_deals":  f"{B}/scene_flash_deals_1776836740312.png",
    "ai_reviews":   f"{B}/scene_ai_reviews_1776838894041.png",
    "proof_visit":  f"{B}/scene_proof_visit_1776838977053.png",
    "gps":          f"{B}/scene_gps_navigation_1776836776056.png",
    "whatsapp":     f"{B}/scene_whatsapp_chat_1776838913599.png",
    "analytics":    f"{B}/scene_merchant_analytics_1776836795706.png",
    "events":       f"{B}/scene_events_calendar_1776838955728.png",
    "smart_alerts": f"{B}/scene_smart_alerts_1776839038546.png",
    "mobile_app":   f"{B}/scene_mobile_app_1776838992894.png",
}

# Colors
C_BG     = (10, 10, 18)
C_CARD   = (20, 24, 38)
C_GOLD   = (212, 175, 55)
C_WHITE  = (255, 255, 255)
C_GRAY   = (185, 185, 200)
C_TEAL   = (0, 210, 178)
C_RED    = (239, 68, 68)
C_PURPLE = (147, 51, 234)
C_GREEN  = (34, 197, 94)

# ─── 15 SCENES ───────────────────────────────────────────────────────────────
SCENES = [
    ("female", "Welcome to BizHub Network",
     "BizHub is an AI-powered platform that digitally replicates physical towns online. "
     "Think of it as a complete digital ecosystem for every town in Kenya. "
     "We give local sellers professional online profiles, and let buyers connect with them "
     "using cutting-edge artificial intelligence. Every business is physically verified, "
     "creating a trust economy that eliminates fraud completely.",
     "community", C_GOLD),

    ("male", "The Problem: Invisible Businesses",
     "Across Kenya, over 290 towns are left behind digitally. Picture this: "
     "A young woman walks through a crowded marketplace, searching her phone endlessly "
     "for a specific business. She finds nothing. No website, no listing, no reviews. "
     "Ninety percent of small enterprises are completely invisible online, and customers "
     "have zero way to discover or verify them before spending money.",
     "frustrated", C_RED),

    ("female", "The Scam Epidemic Destroying Trust",
     "It gets much worse. Every single day, online shoppers are being scammed "
     "by fake listings. Someone pays for a product through social media, and the seller "
     "simply vanishes. Money disappears from wallets. Sixty eight percent of consumers "
     "in smaller towns now actively fear online fraud. Trust in digital commerce "
     "is collapsing, and real legitimate businesses suffer because of it.",
     "scam", C_RED),

    ("male", "Smart Leads: The Reverse Marketplace",
     "This is our most revolutionary feature. It completely flips the traditional market. "
     "A buyer opens BizHub and describes exactly what they need in natural language. "
     "For example: I need a female plumber, aged 30 to 45, maximum 5 kilometers from me. "
     "The AI instantly matches them with verified sellers, broadcasts the request, "
     "and those sellers compete by submitting bids. The buyer chooses the best offer.",
     "broadcast", C_TEAL),

    ("female", "Physical Verification: Building Real Trust",
     "Here is what makes BizHub completely unique. We physically verify every single business. "
     "A BizHub agent literally walks into the real storefront, validates their credentials, "
     "checks their products, and awards a Verified badge. This means no more fake Instagram "
     "boutiques taking deposits and disappearing. When you see that green checkmark, "
     "you know the business is 100 percent real and trustworthy.",
     "verification", C_GOLD),

    ("male", "Ask BizHub: Your Personal AI Concierge",
     "Our AI search engine understands complete natural sentences, not just keywords. "
     "You can ask: Which coffee shop is open right now, has free Wi-Fi, serves vegan pastries, "
     "and is within walking distance? The AI instantly analyzes every verified business "
     "and returns the exact perfect match. It is like having a personal local guide "
     "who knows every single shop in town, available 24 hours a day.",
     "ai_chat", C_PURPLE),

    ("female", "Flash Deals: Happy Hour for Every Shop",
     "Imagine this: A bakery has excess cakes at 4 PM. They launch a 50 percent off flash deal "
     "with a 2-hour countdown timer. Instantly, every BizHub user within range receives "
     "a push notification. Excited shoppers rush to the bakery before the timer runs out. "
     "It gamifies saving money for consumers, and drives explosive foot traffic for sellers.",
     "flash_deals", C_GOLD),

    ("male", "AI Review Summaries: Instant Clarity",
     "Nobody has time to read one hundred individual reviews. Our AI automatically scans "
     "every review for a business and generates a crystal-clear two-line summary. "
     "For example: Highly praised for fast oil changes and friendly staff, but some customers "
     "note the waiting room is cramped. This eliminates decision fatigue completely "
     "and lets consumers make confident choices in seconds, not minutes.",
     "ai_reviews", C_PURPLE),

    ("female", "Photo Proof of Visit: Eliminating Fake Reviews",
     "Here is how we solve the fake review problem once and for all. Users can take a live photo "
     "inside a business to prove they actually visited. When other consumers see a review "
     "tagged with a Proof of Visit badge, they know it is one hundred percent authentic. "
     "This creates a layer of social proof that no competitor can replicate.",
     "proof_visit", C_GREEN),

    ("male", "GPS Navigation and WhatsApp: Instant Connection",
     "Every business pinpoints their exact GPS location on our map. Users tap Get Directions "
     "and their phone navigates them straight to the door. No more getting lost "
     "in confusing town layouts. And with one single tap on the WhatsApp button, "
     "a pre-filled message opens directly to the business owner. Zero friction, instant connection.",
     "gps", C_TEAL),

    ("female", "Direct WhatsApp Integration",
     "Communication should be effortless. When a consumer finds a business they love, "
     "they tap the green WhatsApp button and a chat opens instantly. The message is pre-filled: "
     "Hi, I found you on BizHub. No copying phone numbers, no saving contacts, no hunting "
     "for the right chat thread. It is the fastest path from discovery to conversation.",
     "whatsapp", C_GREEN),

    ("male", "Merchant Analytics: Data for Every Shop Owner",
     "We give small-town shop owners something they have never had before: "
     "enterprise-level analytics. They log in and see beautiful graphs showing exactly "
     "how many people viewed their profile this week, how many clicked the WhatsApp button, "
     "where their customers came from, and how they rank against local competitors. "
     "It is Google Analytics, but designed for a fruit stand or a salon.",
     "analytics", C_PURPLE),

    ("female", "Community Events Hub and Smart Alerts",
     "Every town has a pulse: church fundraisers, club nights, market days, workshops. "
     "BizHub centralizes all of them into one beautiful calendar with attendee counts "
     "and one-tap RSVPs. Plus, users set custom alerts: Notify me when a new gym opens "
     "within 2 kilometers. The system sends an automatic email the moment it happens, "
     "keeping users engaged even when they are not browsing.",
     "events", C_GOLD),

    ("male", "Premium Mobile Experience",
     "Our Flutter mobile app is built to feel like a world-class product. "
     "A sleek dark mode inspired by Spotify. Dynamic town-specific color theming "
     "that adapts the entire interface based on which town you are exploring. "
     "Silky-smooth animations and micro-interactions that make every tap feel premium. "
     "This is not a simple directory. This is a Tier-1 application.",
     "mobile_app", C_PURPLE),

    ("female", "Welcome to the Future of Local Commerce",
     "BizHub Network is not just a business directory. It is a complete intelligent, "
     "secure, and verified digital ecosystem for every town in Kenya. "
     "AI-powered search. Physical verification. A reverse marketplace. Flash deals. "
     "Community events. Merchant analytics. All working together to create a future "
     "where every local business thrives. Welcome to BizHub Network.",
     "community", C_GOLD),
]


# ─── Helpers ─────────────────────────────────────────────────────────────────
def get_font(sz, bold=False):
    p = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    if os.path.exists(p): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()

def ease_out_cubic(t):
    return 1 - (1 - t) ** 3

def ease_out_back(t):
    c1 = 1.70158; c3 = c1 + 1
    return 1 + c3 * pow(t - 1, 3) + c1 * pow(t - 1, 2)

def ease_in_out(t):
    return 3 * t * t - 2 * t * t * t

# ─── Particle System ─────────────────────────────────────────────────────────
class ParticleSystem:
    def __init__(self, count=40, accent=(212,175,55)):
        self.particles = []
        for _ in range(count):
            self.particles.append({
                'x': random.randint(0, W),
                'y': random.randint(0, H),
                'r': random.uniform(1.5, 4),
                'speed': random.uniform(15, 45),
                'phase': random.uniform(0, math.pi * 2),
                'alpha': random.randint(40, 120),
                'color': accent,
            })

    def draw(self, draw_ctx, t):
        for p in self.particles:
            x = p['x'] + math.sin(t * 0.8 + p['phase']) * 20
            y = (p['y'] - p['speed'] * t) % H
            alpha = int(p['alpha'] * (0.5 + 0.5 * math.sin(t * 2 + p['phase'])))
            c = (*p['color'], max(10, alpha))
            r = p['r']
            draw_ctx.ellipse((x-r, y-r, x+r, y+r), fill=c[:3])


# ─── Scene Frame Generator ──────────────────────────────────────────────────
def make_animated_frame(t, duration, scene_idx, total, speaker, title, body,
                        scene_img, accent, female_av, male_av, particles):
    """Generate a single animated frame at time t."""
    img = Image.new("RGB", (W, H), C_BG)
    draw = ImageDraw.Draw(img)

    # Animation progress values
    p_enter = min(1.0, t / 1.2)          # 0-1 over first 1.2s
    p_title = min(1.0, max(0, (t - 0.3)) / 0.8)
    p_body  = min(1.0, max(0, (t - 0.8)) / 1.0)
    p_avatar = min(1.0, max(0, (t - 0.5)) / 0.7)

    # Eased values
    e_enter = ease_out_cubic(p_enter)
    e_title = ease_out_cubic(p_title)
    e_body  = ease_out_cubic(p_body)
    e_avatar = ease_out_back(min(1.0, p_avatar))

    # ── Floating particles ──
    particles.draw(draw, t)

    # ── Top accent bar (slides in) ──
    bar_w = int(W * e_enter)
    draw.rectangle((0, 0, bar_w, 4), fill=accent)

    # ── Scene illustration (slides in from left) ──
    if scene_img is not None:
        art_h = H - 100
        art_w = int(art_h * (scene_img.width / scene_img.height))
        if art_w > int(W * 0.52):
            art_w = int(W * 0.52)
            art_h = int(art_w * (scene_img.height / scene_img.width))
        art_resized = scene_img.resize((art_w, art_h), Image.LANCZOS)

        # Ken Burns: subtle zoom
        kb_zoom = 1.0 + 0.04 * (t / duration)
        kb_w = int(art_w * kb_zoom)
        kb_h = int(art_h * kb_zoom)
        art_resized = art_resized.resize((kb_w, kb_h), Image.LANCZOS)
        # Center crop back
        cx = (kb_w - art_w) // 2
        cy = (kb_h - art_h) // 2
        art_resized = art_resized.crop((cx, cy, cx + art_w, cy + art_h))

        # Slide-in from left
        target_x = 40
        slide_offset = int((1 - e_enter) * -art_w)
        art_x = target_x + slide_offset
        art_y = (H - art_h) // 2

        # Rounded mask
        mask = Image.new("L", (art_w, art_h), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, art_w, art_h), radius=20, fill=255)
        img.paste(art_resized.convert("RGB"), (art_x, art_y), mask)

        # Border glow
        draw.rounded_rectangle(
            (art_x - 2, art_y - 2, art_x + art_w + 2, art_y + art_h + 2),
            radius=22, outline=accent, width=2
        )

    # ── Right panel card (fades in) ──
    panel_x = int(W * 0.55)
    panel_y = 50
    panel_w = W - panel_x - 35
    panel_h = H - 100
    panel_alpha = int(240 * e_enter)
    draw.rounded_rectangle(
        (panel_x, panel_y, panel_x + panel_w, panel_y + panel_h),
        radius=18, fill=C_CARD
    )
    draw.rounded_rectangle(
        (panel_x, panel_y, panel_x + panel_w, panel_y + panel_h),
        radius=18, outline=(45, 50, 65), width=1
    )

    # ── Scene badge (slides in from right) ──
    badge_font = get_font(13, bold=True)
    badge_text = f"SCENE {scene_idx + 1} OF {total}"
    badge_target = panel_x + 28
    badge_offset = int((1 - e_title) * 200)
    badge_x = badge_target + badge_offset
    badge_y = panel_y + 22
    bb = draw.textbbox((badge_x, badge_y), badge_text, font=badge_font)
    draw.rounded_rectangle((badge_x - 8, badge_y - 4, bb[2] + 8, bb[3] + 4), radius=8, fill=accent)
    draw.text((badge_x, badge_y), badge_text, fill=C_BG, font=badge_font)

    # ── Title (typing effect) ──
    title_font = get_font(30, bold=True)
    title_y = badge_y + 40
    title_wrapped = textwrap.fill(title, width=30)
    chars_to_show = int(len(title_wrapped) * e_title)
    visible_title = title_wrapped[:chars_to_show]

    # Add blinking cursor
    if p_title < 1.0 and int(t * 4) % 2 == 0:
        visible_title += "▌"

    for li, line in enumerate(visible_title.split("\n")):
        draw.text((panel_x + 28, title_y + li * 38), line, fill=C_WHITE, font=title_font)
    title_lines = title_wrapped.count("\n") + 1

    # ── Accent underline (animated width) ──
    ul_y = title_y + title_lines * 38 + 6
    ul_w = int(100 * e_title)
    draw.rectangle((panel_x + 28, ul_y, panel_x + 28 + ul_w, ul_y + 3), fill=accent)

    # ── Body text (line-by-line fade-in) ──
    body_font = get_font(18)
    body_y = ul_y + 20
    body_wrapped = textwrap.fill(body, width=45)
    body_lines = body_wrapped.split("\n")

    for li, line in enumerate(body_lines):
        line_progress = min(1.0, max(0, (p_body * len(body_lines) - li)))
        if line_progress > 0:
            # Slide in from right
            x_off = int((1 - ease_out_cubic(line_progress)) * 60)
            # Fade
            gray_val = int(185 * line_progress)
            color = (gray_val, gray_val, min(200, gray_val + 15))
            draw.text((panel_x + 28 + x_off, body_y + li * 28), line, fill=color, font=body_font)

    # ── Avatar section (bounce-in from bottom) ──
    av_area_y = panel_y + panel_h - 210
    av_size = 160

    active_av = female_av if speaker == "female" else male_av
    passive_av = male_av if speaker == "female" else female_av

    # Active avatar bounce-in
    av_target_y = av_area_y + 10
    av_bounce = int((1 - e_avatar) * 200)
    av_y = av_target_y + av_bounce

    active_resized = active_av.resize((av_size, av_size), Image.LANCZOS)
    av_mask = Image.new("L", (av_size, av_size), 0)
    ImageDraw.Draw(av_mask).ellipse((0, 0, av_size, av_size), fill=255)

    # Pulsing glow ring
    pulse = 0.7 + 0.3 * math.sin(t * 3)
    ring_pad = int(5 + 3 * pulse)
    glow_color = tuple(int(c * pulse) for c in accent)
    av_x = panel_x + 28
    draw.ellipse(
        (av_x - ring_pad, av_y - ring_pad,
         av_x + av_size + ring_pad, av_y + av_size + ring_pad),
        fill=glow_color
    )
    img.paste(active_resized, (av_x, av_y), av_mask)

    # Speaker label
    name_font = get_font(15, bold=True)
    sp_name = "Amara" if speaker == "female" else "James"
    draw.text((av_x + av_size + 14, av_y + 8), f"🎙️ {sp_name}", fill=accent, font=name_font)
    role_font = get_font(12)
    draw.text((av_x + av_size + 14, av_y + 30), "Speaking now", fill=C_GRAY, font=role_font)

    # Animated equalizer bars
    eq_x = av_x + av_size + 14
    eq_y = av_y + 55
    for bi in range(8):
        bar_h = int(8 + 18 * abs(math.sin(t * 6 + bi * 0.8)))
        bar_x = eq_x + bi * 10
        draw.rectangle((bar_x, eq_y + 25 - bar_h, bar_x + 5, eq_y + 25), fill=accent)

    # Passive avatar (small, dimmed)
    p_size = int(av_size * 0.5)
    passive_resized = passive_av.resize((p_size, p_size), Image.LANCZOS)
    p_mask = Image.new("L", (p_size, p_size), 0)
    ImageDraw.Draw(p_mask).ellipse((0, 0, p_size, p_size), fill=140)
    px = panel_x + panel_w - p_size - 28
    py = av_y + (av_size - p_size) // 2
    draw.ellipse((px-2, py-2, px+p_size+2, py+p_size+2), fill=(45, 45, 60))
    img.paste(passive_resized, (px, py), p_mask)

    # ── Animated progress bar (bottom) ──
    bar_total_progress = (scene_idx + t / duration) / total
    draw.rectangle((0, H - 5, W, H), fill=(25, 25, 35))
    draw.rectangle((0, H - 5, int(W * bar_total_progress), H), fill=accent)

    # ── Logo (top right) ──
    logo_font = get_font(16, bold=True)
    logo_alpha = int(255 * min(1.0, t / 0.5))
    draw.text((W - 190, 12), "BIZHUB NETWORK", fill=C_GOLD, font=logo_font)

    # ── Bottom accent bar ──
    draw.rectangle((0, H - 6, int(W * bar_total_progress), H - 1), fill=accent)

    return np.array(img)


def generate_audio(scenes):
    """Generate TTS audio for each scene."""
    paths = []
    for i, (speaker, title, body, _, _) in enumerate(scenes):
        p = f"/tmp/bh_v3_{i}.mp3"
        voice = FEMALE_VOICE if speaker == "female" else MALE_VOICE
        text = f"{title}. {body}"
        print(f"  🎤 Scene {i+1}/{len(scenes)}: {title} ({speaker})")
        subprocess.run(["edge-tts", "--voice", voice, "--text", text, "--write-media", p],
                        check=True, capture_output=True)
        paths.append(p)
    return paths


def build_video(scenes, audio_paths):
    """Build the final video with frame-by-frame animations."""
    print("\n🎬 Building animated video...")

    female_av = Image.open(FEMALE_AVATAR).convert("RGBA")
    male_av = Image.open(MALE_AVATAR).convert("RGBA")

    # Pre-load scene images
    scene_images = {}
    for key, path in IMG.items():
        if os.path.exists(path):
            scene_images[key] = Image.open(path).convert("RGBA")

    total = len(scenes)
    clips = []
    fade_dur = 0.6

    for i, (scene, audio_path) in enumerate(zip(scenes, audio_paths)):
        speaker, title, body, img_key, accent = scene
        print(f"  🖼️  Animating scene {i+1}/{total}: {title}")

        audio_clip = AudioFileClip(audio_path)
        duration = audio_clip.duration + 1.5

        scene_img = scene_images.get(img_key)
        particles = ParticleSystem(count=30, accent=accent)

        def make_frame_fn(t, _i=i, _dur=duration, _sp=speaker, _t=title,
                          _b=body, _si=scene_img, _ac=accent, _ps=particles):
            return make_animated_frame(
                t, _dur, _i, total, _sp, _t, _b, _si, _ac,
                female_av, male_av, _ps
            )

        clip = VideoClip(make_frame_fn, duration=duration)
        clip = clip.with_fps(FPS)
        clip = clip.with_effects([vfx.FadeIn(fade_dur), vfx.FadeOut(fade_dur)])
        clip = clip.with_audio(audio_clip)
        clips.append(clip)

    final = concatenate_videoclips(clips, method="compose")
    print(f"\n📹 Encoding to {OUTPUT}...")
    final.write_videofile(OUTPUT, fps=FPS, codec="libx264", audio_codec="aac",
                          threads=4, logger="bar")


if __name__ == "__main__":
    print("=" * 60)
    print("  BizHub — Mind-Blowing Animated Explainer v3")
    print("=" * 60)
    print("\n🎤 Step 1: Generating US English voiceovers...")
    audio_paths = generate_audio(SCENES)
    print("\n🎬 Step 2: Rendering animated video (this may take a while)...")
    build_video(SCENES, audio_paths)
    print(f"\n✅ Done! → {OUTPUT}")
    print("=" * 60)

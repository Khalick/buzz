import os
import fitz  # PyMuPDF
import subprocess
from moviepy import ImageClip, AudioFileClip, concatenate_videoclips

PDF_PATH = "/home/peter/buzz/BizHub_Network_Full_Pitch.pdf"
OUTPUT_MP4 = "/home/peter/buzz/BizHub_Pitch_Simulation.mp4"

# The powerful, professional English voiceover script for each slide
SCRIPT = [
    # 1. Cover
    "Welcome to BizHub Network. Every town in Africa deserves its own digital marketplace. Today, we present to you the Amazon of local commerce. One platform, total trust.",
    # 2. Why Now
    "Why now? The timing is perfect. Kenya has ninety three percent mobile internet penetration, a booming digital economy, and yet, zero full-stack competitors in the hyperlocal space.",
    # 3. The Problem
    "The local commerce crisis is incredibly painful. Ninety percent of small enterprises are invisible online. Customers fear fraud, and legitimate shops have zero affordable marketing channels.",
    # 4. The Solution
    "Enter BizHub: The Trust Layer for Local Commerce. A complete hyperlocal ecosystem powered by artificial intelligence, physical verification, and rich consumer discovery.",
    # 5. AI & Tech
    "Our technology is not just planned, it is already built and deployed. BizHub features 'Ask BizHub', a state of the art conversational AI search powered by OpenAI, offering instant, personalized recommendations.",
    # 6. Trust Engine
    "Trust is our ultimate moat. We physically verify businesses, creating a powerful network effect through reviews, proof-of-visit photos, and ultimate community confidence. We eliminate the fear of fraud.",
    # 7. Reverse Marketplace
    "Innovation drives our growth. Our Smart Leads reverse marketplace flips the model: customers broadcast their needs, and businesses compete to win them. We also track micro-influencer referrals and flash deals.",
    # 8. Product
    "This is a massive, full-stack product. Over twenty features are live right now, including interactive maps, smart directories, event hubs, and merchant analytics, all built on a highly scalable, multi-tenant architecture.",
    # 9. Business Model
    "Our business model is diversified, profitable, and highly scalable. A conservative mature town generates over two point six million Kenyan Shillings annually, driven by premium subscriptions with an eighty five percent gross margin.",
    # 10. Market & Traction
    "The market opportunity is enormous. We are targeting a thirty three million dollar Serviceable Market in Kenya alone, leveraging a capital-efficient, town-by-town expansion playbook that is already proving successful in our Thika pilot.",
    # 11. Competition
    "Our competitive advantage is distinct and defensible. While giants like Google and Facebook exist, absolutely no platform combines AI search, physical business verification, and hyperlocal network effects like BizHub does.",
    # 12. Team
    "Behind BizHub is a founder who intimately understands both the technology and the streets. Peter Agak, the Lead Architect, single-handedly designs and deploys the entire platform, from AI search to physical verification workflows.",
    # 13. Roadmap & Ask
    "We are raising five hundred thousand dollars in our pre-seed round to dominate ten key towns in the next twelve months. Join us as we build the digital infrastructure for Africa's local commerce. Thank you."
]

def generate_assets():
    print("Extracting PDF pages to images...")
    doc = fitz.open(PDF_PATH)
    image_paths = []
    
    # High resolution extraction
    zoom = 2.0
    mat = fitz.Matrix(zoom, zoom)

    for i in range(len(doc)):
        page = doc.load_page(i)
        pix = page.get_pixmap(matrix=mat)
        img_path = f"/tmp/slide_{i}.png"
        pix.save(img_path)
        image_paths.append(img_path)
        print(f"Saved {img_path}")

    print("Generating voiceover audio via edge-tts...")
    audio_paths = []
    # en-US-ChristopherNeural is a very professional, deep, authoritative voice
    voice = "en-US-ChristopherNeural"
    
    for i, text in enumerate(SCRIPT):
        audio_path = f"/tmp/audio_{i}.mp3"
        print(f"Generating audio for slide {i}...")
        cmd = ["edge-tts", "--voice", voice, "--text", text, "--write-media", audio_path]
        subprocess.run(cmd, check=True)
        audio_paths.append(audio_path)
        
    return image_paths, audio_paths

def build_video(image_paths, audio_paths):
    print("Stitching video with moviepy...")
    clips = []
    for img, aud in zip(image_paths, audio_paths):
        audio_clip = AudioFileClip(aud)
        # We set the image duration to match the audio exactly
        # plus a 0.5s pause to let the audience absorb
        img_clip = ImageClip(img).with_duration(audio_clip.duration + 0.5)
        img_clip = img_clip.with_audio(audio_clip)
        clips.append(img_clip)
        
    final_video = concatenate_videoclips(clips, method="compose")
    
    # We use 2 fps because it's a slideshow, rendering is much faster and smaller
    print(f"Writing final video to {OUTPUT_MP4}...")
    final_video.write_videofile(
        OUTPUT_MP4, 
        fps=24, # 24 for smoother transitions if adding them later, but 2 is fine for static. 24 is safer for web playback.
        codec="libx264", 
        audio_codec="aac"
    )

if __name__ == "__main__":
    images, audios = generate_assets()
    build_video(images, audios)
    print("Video generation complete!")

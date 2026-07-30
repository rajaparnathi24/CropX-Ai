"""
live_photo_shoot.py
-------------------------------------------------------------
"Live photo shoot" feature for CropX (Streamlit).

- Captures a photo from the browser webcam (st.camera_input)
- Pulls the user's real-time GPS location from the browser
- Fetches live temperature for that location from OpenWeatherMap
- Stamps date/time, place, and temperature onto the photo
- Lets the user download the stamped photo

Install:
    pip install streamlit-geolocation pillow requests

How to wire this into your existing app.py:
    from live_photo_shoot import render_live_photo_shoot
    ...
    render_live_photo_shoot()

Or add it as a page/tab, e.g.:
    tab1, tab2 = st.tabs(["Crop Analysis", "Live Photo Shoot"])
    with tab2:
        render_live_photo_shoot()

Get a free API key: https://openweathermap.org/api  (Current Weather Data)
-------------------------------------------------------------
"""

import io
from datetime import datetime

import requests
import streamlit as st
from PIL import Image, ImageDraw, ImageFont
from streamlit_geolocation import streamlit_geolocation

# ⚠️ Put your real key here (better: load from st.secrets["OPENWEATHER_API_KEY"])
OPENWEATHER_API_KEY = "YOUR_OPENWEATHERMAP_API_KEY"


def fetch_weather(lat: float, lon: float):
    """Fetch current temperature + condition + place name for given coords."""
    url = (
        "https://api.openweathermap.org/data/2.5/weather"
        f"?lat={lat}&lon={lon}&units=metric&appid={OPENWEATHER_API_KEY}"
    )
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    return {
        "temp_c": round(data["main"]["temp"]),
        "condition": data.get("weather", [{}])[0].get("main", ""),
        "place": data.get("name") or f"{lat:.4f}, {lon:.4f}",
    }


def stamp_photo(image: Image.Image, place: str, temp_text: str, timestamp: str) -> Image.Image:
    """Draw a semi-transparent info box with location/temp/time onto the photo."""
    image = image.convert("RGBA")
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    lines = [f"📍 {place}", f"🌡️ {temp_text}", f"🕒 {timestamp}"]

    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", size=max(14, image.width // 40))
    except OSError:
        font = ImageFont.load_default()

    padding = 10
    line_height = font.size + 6
    box_height = line_height * len(lines) + padding * 2
    box_width = max(draw.textlength(line, font=font) for line in lines) + padding * 2

    box_x0, box_y0 = 10, image.height - box_height - 10
    box_x1, box_y1 = box_x0 + box_width, image.height - 10
    draw.rectangle([box_x0, box_y0, box_x1, box_y1], fill=(0, 0, 0, 140))

    for i, line in enumerate(lines):
        draw.text(
            (box_x0 + padding, box_y0 + padding + i * line_height),
            line,
            font=font,
            fill=(255, 255, 255, 255),
        )

    return Image.alpha_composite(image, overlay).convert("RGB")


def render_live_photo_shoot():
    st.subheader("📸 Live Photo Shoot")
    st.caption("Capture a crop photo tagged with real-time location and temperature.")

    # 1. Get browser GPS location
    location = streamlit_geolocation()

    lat, lon = None, None
    if location and location.get("latitude") is not None:
        lat, lon = location["latitude"], location["longitude"]
        st.success(f"Location acquired: {lat:.5f}, {lon:.5f}")
    else:
        st.info("Click the location icon above and allow browser location access.")

    # 2. Capture photo from webcam
    photo_file = st.camera_input("Take a photo")

    if photo_file and lat is not None and lon is not None:
        if st.button("Tag & Save Photo", type="primary"):
            with st.spinner("Fetching live weather data..."):
                try:
                    weather = fetch_weather(lat, lon)
                except Exception as e:
                    st.error(f"Could not fetch weather data: {e}")
                    return

            timestamp = datetime.now().strftime("%d %b %Y, %I:%M %p")
            temp_text = f"{weather['temp_c']}°C · {weather['condition']}"

            image = Image.open(photo_file)
            stamped = stamp_photo(image, weather["place"], temp_text, timestamp)

            st.image(stamped, caption="Tagged photo", use_container_width=True)

            buf = io.BytesIO()
            stamped.save(buf, format="JPEG", quality=95)
            st.download_button(
                "Download Tagged Photo",
                data=buf.getvalue(),
                file_name=f"cropx_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg",
                mime="image/jpeg",
            )
    elif photo_file and (lat is None or lon is None):
        st.warning("Waiting for location before tagging the photo. Allow location access above.")


if __name__ == "__main__":
    render_live_photo_shoot()
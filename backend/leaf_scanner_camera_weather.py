"""
leaf_scanner_camera_weather.py
-------------------------------------------------------------
Adds "Live Camera" capture + a real-time weather badge to the
AI Crop Leaf Disease Scanner page.

Drop-in for the page shown in your screenshot:
  - "1. Select Target Crop"
  - "2. Upload Leaf Image"  <-- now has Upload / Live Camera tabs
  - "Run AI Disease Scan"   <-- works off whichever image was provided
  - "Diagnosis & Treatment Plan" panel
  - top-right "Season: Kharif" badge  <-- now sits next to a live weather badge

Install:
    pip install streamlit-geolocation pillow requests

Wire into app.py:
    from leaf_scanner_camera_weather import render_leaf_scanner_page
    render_leaf_scanner_page()

Get a free API key: https://openweathermap.org/api
-------------------------------------------------------------
"""

from datetime import datetime

import requests
import streamlit as st
from PIL import Image
from streamlit_geolocation import streamlit_geolocation

# ⚠️ Better: store this in .streamlit/secrets.toml as OPENWEATHER_API_KEY
OPENWEATHER_API_KEY = "YOUR_OPENWEATHERMAP_API_KEY"


# ---------------------------------------------------------------
# Styling — matches the card / badge look in your screenshot
# ---------------------------------------------------------------
def _inject_css():
    st.markdown(
        """
        <style>
        .cropx-card {
            background: #ffffff;
            border-radius: 16px;
            padding: 20px 24px;
            margin-bottom: 20px;
            border: 1px solid #e3ead9;
        }
        .cropx-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #eaf2e3;
            color: #3f6b4a;
            border: 1px solid #cfe0c4;
            padding: 6px 14px;
            border-radius: 999px;
            font-weight: 600;
            font-size: 13.5px;
        }
        .cropx-badge.weather {
            background: #eaf3f8;
            color: #2f5f74;
            border: 1px solid #c9e0ea;
        }
        div[data-testid="stCameraInput"] > label,
        div[data-testid="stFileUploader"] > label {
            display: none;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


# ---------------------------------------------------------------
# Weather
# ---------------------------------------------------------------
@st.cache_data(ttl=600, show_spinner=False)
def _fetch_weather(lat: float, lon: float):
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
        "place": data.get("name") or f"{lat:.3f}, {lon:.3f}",
    }


def _weather_badge():
    """Renders the live weather pill. Click the location icon once to grant access."""
    col_loc, col_badge = st.columns([1, 6])
    with col_loc:
        location = streamlit_geolocation()

    lat = lon = None
    if location and location.get("latitude") is not None:
        lat, lon = location["latitude"], location["longitude"]

    with col_badge:
        if lat is not None and lon is not None:
            try:
                w = _fetch_weather(lat, lon)
                st.markdown(
                    f'<span class="cropx-badge weather">🌦️ {w["place"]}: '
                    f'{w["temp_c"]}°C, {w["condition"]}</span>',
                    unsafe_allow_html=True,
                )
                return w, lat, lon
            except Exception as e:
                st.markdown(
                    f'<span class="cropx-badge weather">⚠️ Weather unavailable</span>',
                    unsafe_allow_html=True,
                )
                return None, lat, lon
        else:
            st.markdown(
                '<span class="cropx-badge weather">📍 Click icon to enable live weather</span>',
                unsafe_allow_html=True,
            )
            return None, None, None


# ---------------------------------------------------------------
# Image source: upload OR live camera, unified into one variable
# ---------------------------------------------------------------
def _leaf_image_input():
    st.markdown("**2. Upload Leaf Image**")
    tab_upload, tab_camera = st.tabs(["📁 Upload File", "📸 Live Camera"])

    leaf_image = None
    source = None

    with tab_upload:
        uploaded = st.file_uploader(
            "Drag and drop leaf image here",
            type=["jpg", "jpeg", "png", "webp"],
            label_visibility="collapsed",
        )
        if uploaded:
            leaf_image = Image.open(uploaded)
            source = "upload"

    with tab_camera:
        st.caption("Point your camera at the leaf and capture a live photo.")
        captured = st.camera_input("Take a leaf photo", label_visibility="collapsed")
        if captured:
            leaf_image = Image.open(captured)
            source = "camera"

    if leaf_image is not None:
        st.image(leaf_image, caption=f"Leaf image ({source})", width=280)

    return leaf_image, source


# ---------------------------------------------------------------
# Main page render
# ---------------------------------------------------------------
def render_leaf_scanner_page():
    _inject_css()

    header_left, header_right = st.columns([3, 2])
    with header_left:
        st.markdown("### 🌿 AI Crop Leaf Disease Scanner")
        st.caption(
            "Upload a leaf image to get instant AI disease diagnosis, "
            "severity score, and treatment plan."
        )
    with header_right:
        b1, b2 = st.columns(2)
        with b1:
            st.markdown(
                '<span class="cropx-badge">🌱 Season: Kharif (ખરીફ)</span>',
                unsafe_allow_html=True,
            )
        with b2:
            weather, lat, lon = _weather_badge()

    col_left, col_right = st.columns([3, 2])

    with col_left:
        with st.container():
            st.markdown('<div class="cropx-card">', unsafe_allow_html=True)
            st.markdown("**1. Select Target Crop**")
            crop_type = st.selectbox(
                "Crop type",
                ["✨ Auto-Detect Crop (Recommended - AI Model)", "Wheat", "Cotton", "Rice", "Maize"],
                label_visibility="collapsed",
            )
            st.markdown("</div>", unsafe_allow_html=True)

        with st.container():
            st.markdown('<div class="cropx-card">', unsafe_allow_html=True)
            leaf_image, source = _leaf_image_input()

            run_scan = st.button("🔍 Run AI Disease Scan", type="primary", use_container_width=True)
            st.markdown("</div>", unsafe_allow_html=True)

    with col_right:
        with st.container():
            st.markdown('<div class="cropx-card">', unsafe_allow_html=True)
            st.markdown("**✅ Diagnosis & Treatment Plan**")

            if not run_scan or leaf_image is None:
                st.markdown(
                    """
                    <div style="text-align:center; padding: 60px 10px; color:#888;">
                        <div style="font-size:32px;">⌗</div>
                        <b>No Diagnosis Generated Yet</b><br>
                        <span style="font-size:13px;">
                        Upload or capture a leaf photo and click "Run AI Disease Scan"
                        to see real-time predictions.
                        </span>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
            else:
                with st.spinner("Analyzing leaf image..."):
                    # -----------------------------------------------------
                    # TODO: replace this block with your actual model call, e.g.:
                    #   result = your_model.predict(leaf_image)
                    # -----------------------------------------------------
                    result = {
                        "disease": "Leaf Blight (example placeholder)",
                        "confidence": 0.0,
                        "severity": "N/A",
                        "treatment": "Connect your model here.",
                    }

                st.success(f"Diagnosis: **{result['disease']}**")
                st.write(f"Confidence: {result['confidence']*100:.1f}%")
                st.write(f"Severity: {result['severity']}")
                st.write(f"Treatment: {result['treatment']}")

                if weather:
                    st.caption(
                        f"📍 Captured at {weather['place']} · "
                        f"🌡️ {weather['temp_c']}°C · "
                        f"🕒 {datetime.now().strftime('%d %b %Y, %I:%M %p')}"
                    )

            st.markdown("</div>", unsafe_allow_html=True)


if __name__ == "__main__":
    st.set_page_config(page_title="CropX Leaf Scanner", layout="wide")
    render_leaf_scanner_page()

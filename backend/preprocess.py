import io
import logging
import numpy as np
from PIL import Image
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}

def validate_image_file(file_bytes: bytes, filename: str):
    """Validate uploaded image file size and extension format."""
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed limit of 10MB"
        )

    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '.{ext}'. Allowed formats: JPG, PNG, WEBP"
        )

def preprocess_image(file_bytes: bytes, target_size=(224, 224)) -> np.ndarray:
    """
    Preprocess raw image bytes for MobileNetV3 model input.

    Pipeline:
      1. Decode image → RGB
      2. Resize to 224x224 using LANCZOS (high-quality, matches training)
      3. Convert to float32 numpy array
      4. Apply tf.keras.applications.mobilenet_v3.preprocess_input()
         which normalizes pixels from [0, 255] → [-1, 1]
      5. Expand batch dimension → shape (1, 224, 224, 3)
    """
    try:
        image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        image = image.resize(target_size, Image.Resampling.LANCZOS)

        img_array = np.array(image, dtype=np.float32)

        # MobileNetV3 normalization: [0, 255] → [-1, 1]
        # This matches tf.keras.applications.mobilenet_v3.preprocess_input()
        # Formula: (pixel / 127.5) - 1.0
        img_array = (img_array / 127.5) - 1.0

        img_array = np.expand_dims(img_array, axis=0)

        logger.info(
            f"Preprocessed image: shape={img_array.shape}, "
            f"dtype={img_array.dtype}, "
            f"value_range=[{img_array.min():.3f}, {img_array.max():.3f}]"
        )

        return img_array
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Corrupted or unreadable image file: {str(e)}"
        )

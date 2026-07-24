import os
import logging
import numpy as np
from fastapi import HTTPException, status
from config import settings
from class_names import PLANT_57_CLASSES, get_disease_details
from preprocess import preprocess_image

logger = logging.getLogger(__name__)


class ModelService:
    """
    CropX AI Model Service — Ensemble MobileNetV3 Prediction Pipeline.

    Loads both CropX_MobileNetV3_Final.keras and CropX_MobileNetV3_Final1.keras
    and averages their softmax outputs for more robust predictions.
    """
    _instance = None
    _model_1 = None
    _model_2 = None
    _models_loaded = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelService, cls).__new__(cls)
            cls._instance._init_models()
        return cls._instance

    def _load_single_model(self, model_path: str, model_name: str):
        """Load a single Keras model file and return it, or None on failure."""
        import tensorflow as tf
        try:
            if os.path.exists(model_path):
                logger.info(f"Loading {model_name} from: {model_path}")
                model = tf.keras.models.load_model(model_path)
                logger.info(
                    f"  ✓ {model_name} loaded successfully | "
                    f"Input: {model.input_shape} | "
                    f"Output classes: {model.output_shape[1]}"
                )
                return model
            else:
                logger.error(f"  ✗ {model_name} file NOT FOUND at: {model_path}")
                return None
        except Exception as e:
            logger.error(f"  ✗ Failed to load {model_name}: {str(e)}")
            return None

    def _init_models(self):
        """Load both trained MobileNetV3 models at startup."""
        logger.info("=" * 60)
        logger.info("CropX AI Engine — Initializing Ensemble Model Pipeline")
        logger.info("=" * 60)

        self._model_1 = self._load_single_model(settings.MODEL_PATH, "Model-1 (CropX_MobileNetV3_Final)")
        self._model_2 = self._load_single_model(settings.MODEL_PATH_2, "Model-2 (CropX_MobileNetV3_Final1)")

        loaded_count = sum(1 for m in [self._model_1, self._model_2] if m is not None)
        self._models_loaded = loaded_count > 0

        if loaded_count == 2:
            logger.info(f"✓ Ensemble mode ACTIVE — Both models loaded successfully")
        elif loaded_count == 1:
            logger.warning(f"⚠ Single model mode — Only 1 of 2 models loaded")
        else:
            logger.error("✗ CRITICAL: No models loaded! Predictions will fail.")

        logger.info("=" * 60)

    def predict(self, file_bytes: bytes, target_crop: str = "Tomato") -> dict:
        """
        Run ensemble inference on a crop leaf image.

        Pipeline:
          1. Preprocess image → (1, 224, 224, 3) normalized [-1, 1]
          2. Run inference on all loaded models
          3. Average softmax outputs (ensemble)
          4. Extract top prediction with confidence
          5. Return structured disease details
        """
        if not self._models_loaded:
            logger.error("No AI models available for inference")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="CropX AI model is not available. Please ensure model files are present in backend/models/ and restart the server."
            )

        # Step 1: Preprocess
        img_array = preprocess_image(file_bytes)

        # Step 2 & 3: Run inference on each loaded model and collect predictions
        all_predictions = []
        model_details = []

        for model, name in [(self._model_1, "Model-1"), (self._model_2, "Model-2")]:
            if model is not None:
                try:
                    preds = model.predict(img_array, verbose=0)[0]
                    all_predictions.append(preds)
                    top_idx = int(np.argmax(preds))
                    top_conf = float(np.max(preds)) * 100
                    class_name = PLANT_57_CLASSES[top_idx] if top_idx < len(PLANT_57_CLASSES) else f"Class_{top_idx}"
                    model_details.append(f"{name}: idx={top_idx} ({class_name}) conf={top_conf:.1f}%")
                    logger.info(f"  {name} prediction: {class_name} ({top_conf:.1f}%)")
                except Exception as e:
                    logger.error(f"  {name} inference failed: {str(e)}")

        if not all_predictions:
            logger.error("All model inferences failed")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AI model inference failed. Please try again or contact support."
            )

        # Step 3: Ensemble — average softmax outputs
        if len(all_predictions) > 1:
            ensemble_preds = np.mean(all_predictions, axis=0)
            logger.info(f"  Ensemble: averaged {len(all_predictions)} model outputs")
        else:
            ensemble_preds = all_predictions[0]
            logger.info(f"  Single model prediction (no ensemble averaging)")

        # Step 4: Extract top prediction
        top_idx = int(np.argmax(ensemble_preds))
        confidence = float(ensemble_preds[top_idx]) * 100

        if top_idx < len(PLANT_57_CLASSES):
            raw_class_name = PLANT_57_CLASSES[top_idx]
        else:
            raw_class_name = f"Class_{top_idx}"
            logger.warning(f"Predicted index {top_idx} exceeds class list length {len(PLANT_57_CLASSES)}")

        # Log top-3 for debugging
        top3_indices = np.argsort(ensemble_preds)[-3:][::-1]
        top3_info = []
        for i, idx in enumerate(top3_indices):
            name = PLANT_57_CLASSES[idx] if idx < len(PLANT_57_CLASSES) else f"Class_{idx}"
            conf = float(ensemble_preds[idx]) * 100
            top3_info.append(f"  #{i+1}: [{idx}] {name} ({conf:.1f}%)")
        logger.info(f"Ensemble Top-3 Predictions:\n" + "\n".join(top3_info))

        # Step 5: Build response with disease details
        meta = get_disease_details(raw_class_name)

        return {
            "crop": target_crop if target_crop and target_crop.lower() != "other" else meta["crop"],
            "disease": meta["disease"],
            "confidence": round(confidence, 1),
            "severity": meta["severity"],
            "symptoms": meta["symptoms"],
            "recommendations": meta["recommendations"],
            "preventiveMeasures": meta["preventiveMeasures"],
        }


model_service = ModelService()

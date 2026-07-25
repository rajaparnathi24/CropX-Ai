import os
import tensorflow as tf
import numpy as np

m1_path = os.path.join("backend", "models", "CropX_MobileNetV3_Final.keras")
m2_path = os.path.join("backend", "models", "CropX_MobileNetV3_Final1.keras")

print("Checking Model 1:")
if os.path.exists(m1_path):
    try:
        m1 = tf.keras.models.load_model(m1_path)
        print("  Model 1 loaded. Input:", m1.input_shape, "Output:", m1.output_shape)
    except Exception as e:
        print("  Model 1 load failed:", e)

print("Checking Model 2:")
if os.path.exists(m2_path):
    try:
        m2 = tf.keras.models.load_model(m2_path)
        print("  Model 2 loaded. Input:", m2.input_shape, "Output:", m2.output_shape)
    except Exception as e:
        print("  Model 2 load failed:", e)

"""
CropX AI Model - EXACT 57-Class Label Mapping
==============================================
Extracted directly from TensorFlow's image_dataset_from_directory using the
actual training dataset at:
  C:\\Users\\91816\\CropX_Project\\flatten_dataset\\train

The class order is determined by TensorFlow's sorted() on directory names.
This is NOT simple alphabetical sort — it's Python's default string sort
which is case-sensitive (uppercase letters sort before lowercase).

IMPORTANT: Do NOT modify, reorder, or rename these labels.
The order corresponds 1:1 to the model's output indices [0..56].
Any change will cause wrong disease predictions.
"""

# EXACT class names from tf.keras.utils.image_dataset_from_directory
# Verified by running image_dataset_from_directory on the training dataset
# and reading train_ds.class_names directly.
PLANT_57_CLASSES = [
    "Cotton___Aphids",                                                  # 0
    "Cotton___Army_worm",                                               # 1
    "Cotton___Bacterial_Blight",                                        # 2
    "Cotton___Healthy",                                                 # 3
    "Cotton___Powdery_Mildew",                                          # 4
    "Cotton___Target_spot",                                             # 5
    "Groundnut___early_leaf_spot",                                      # 6
    "Groundnut___healthy leaf",                                         # 7
    "Groundnut___late leaf spot",                                       # 8
    "Groundnut___nutrition deficiency",                                 # 9
    "Groundnut___rust",                                                 # 10
    "Maize___Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",       # 11
    "Maize___Corn_(maize)___Common_rust_",                              # 12
    "Maize___Corn_(maize)___Northern_Leaf_Blight",                      # 13
    "Maize___Corn_(maize)___healthy",                                   # 14
    "Onion___Alternaria_D",                                             # 15
    "Onion___Botrytis Leaf Blight",                                     # 16
    "Onion___Bulb_blight-D",                                            # 17
    "Onion___Caterpillar-P",                                            # 18
    "Onion___Downy mildew",                                             # 19
    "Onion___Fusarium-D",                                               # 20
    "Onion___Healthy leaves",                                           # 21
    "Onion___Iris yellow virus_augment",                                # 22
    "Onion___Purple blotch",                                            # 23
    "Onion___Rust",                                                     # 24
    "Onion___Virosis-D",                                                # 25
    "Onion___Xanthomonas Leaf Blight",                                  # 26
    "Onion___onion1",                                                   # 27
    "Onion___stemphylium Leaf Blight",                                  # 28
    "Potato___Potato___Early_blight",                                   # 29
    "Potato___Potato___Late_blight",                                    # 30
    "Potato___Potato___healthy",                                        # 31
    "Tomato___Tomato___Bacterial_spot",                                 # 32
    "Tomato___Tomato___Early_blight",                                   # 33
    "Tomato___Tomato___Late_blight",                                    # 34
    "Tomato___Tomato___Leaf_Mold",                                      # 35
    "Tomato___Tomato___Septoria_leaf_spot",                             # 36
    "Tomato___Tomato___Spider_mites Two-spotted_spider_mite",           # 37
    "Tomato___Tomato___Target_Spot",                                    # 38
    "Tomato___Tomato___Tomato_Yellow_Leaf_Curl_Virus",                  # 39
    "Tomato___Tomato___Tomato_mosaic_virus",                            # 40
    "Tomato___Tomato___healthy",                                        # 41
    "Wheat___Aphid",                                                    # 42
    "Wheat___Black Rust",                                               # 43
    "Wheat___Blast",                                                    # 44
    "Wheat___Brown Rust",                                               # 45
    "Wheat___Common Root Rot",                                          # 46
    "Wheat___Fusarium Head Blight",                                     # 47
    "Wheat___Healthy",                                                  # 48
    "Wheat___Leaf Blight",                                              # 49
    "Wheat___Mildew",                                                   # 50
    "Wheat___Mite",                                                     # 51
    "Wheat___Smut",                                                     # 52
    "Wheat___Stem fly",                                                 # 53
    "Wheat___Tan spot",                                                 # 54
    "Wheat___Yellow Rust",                                              # 55
    "Wheat___septoria",                                                 # 56
]


def format_disease_name(raw_name: str) -> str:
    """
    Convert raw dataset class folder name into a clean, user-friendly label.
    
    Examples:
      "Cotton___Aphids"                              -> "Cotton - Aphids"
      "Groundnut___healthy leaf"                     -> "Healthy Groundnut"
      "Maize___Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot" -> "Maize - Cercospora Leaf Spot"
      "Potato___Potato___Early_blight"               -> "Potato - Early Blight"
      "Tomato___Tomato___Tomato_mosaic_virus"         -> "Tomato - Mosaic Virus"
    """
    parts = raw_name.split("___")
    crop = parts[0].strip()
    
    # Get the disease portion (last meaningful part)
    disease_raw = parts[-1].strip() if len(parts) >= 2 else "Unknown"
    
    # Clean up common suffixes/prefixes
    disease_clean = disease_raw
    
    # Remove trailing dash-letter suffixes like "-D", "-P"
    for suffix in ["-D", "-P", "_augment"]:
        if disease_clean.endswith(suffix):
            disease_clean = disease_clean[:-len(suffix)].strip()
    
    # Remove trailing underscore (e.g., "Common_rust_")
    disease_clean = disease_clean.rstrip("_")
    
    # Remove redundant crop prefix (e.g., "Tomato_mosaic_virus" -> "mosaic_virus")
    crop_lower = crop.lower()
    disease_lower = disease_clean.lower()
    if disease_lower.startswith(crop_lower + "_"):
        disease_clean = disease_clean[len(crop) + 1:]
    elif disease_lower.startswith(crop_lower + " "):
        disease_clean = disease_clean[len(crop) + 1:]
    
    # Replace underscores with spaces
    disease_clean = disease_clean.replace("_", " ").strip()
    
    # Clean up specific patterns
    if "Spider mites" in disease_clean:
        disease_clean = "Spider Mites"
    if "Corn (maize)" in disease_clean:
        disease_clean = disease_clean  # Keep as is, will be title-cased
    if disease_clean == "Gray leaf spot":
        disease_clean = "Cercospora Gray Leaf Spot"
    
    # Title case (but keep existing case for short words)
    disease_clean = disease_clean.title()
    
    # Handle healthy variants
    if disease_clean.lower() in ["healthy", "healthy leaf", "healthy leaves"]:
        return f"Healthy {crop}"
    
    # Handle ambiguous "onion1" case
    if disease_clean.lower() == "onion1":
        return f"{crop} - General Disease"
    
    return f"{crop} - {disease_clean}"


def get_crop_name(raw_name: str) -> str:
    """Extract the primary crop name from a dataset class string."""
    return raw_name.split("___")[0].strip()


def is_healthy(raw_name: str) -> bool:
    """Check if the predicted class represents a healthy plant."""
    return "healthy" in raw_name.lower()


def get_severity(raw_name: str) -> str:
    """Determine disease severity based on class name keywords."""
    if is_healthy(raw_name):
        return "low"
    
    lower = raw_name.lower()
    critical_keywords = [
        "blight", "rot", "virus", "wilt", "curl",
        "fusarium", "blast", "smut", "rust"
    ]
    moderate_keywords = [
        "spot", "mildew", "mold", "septoria",
        "alternaria", "deficiency"
    ]
    
    if any(kw in lower for kw in critical_keywords):
        return "critical"
    if any(kw in lower for kw in moderate_keywords):
        return "medium"
    return "medium"


def get_disease_details(class_name: str) -> dict:
    """Return detailed disease metadata for the predicted class."""
    formatted = format_disease_name(class_name)
    crop = get_crop_name(class_name)
    severity = get_severity(class_name)
    
    if is_healthy(class_name):
        return {
            "crop": crop,
            "disease": formatted,
            "severity": "low",
            "symptoms": [
                f"{crop} foliage appears healthy with uniform green color and no visible lesions or discoloration."
            ],
            "recommendations": [
                "Continue standard fertilization and irrigation schedule.",
                "Perform routine monitoring for early pest/disease detection.",
                "Maintain field hygiene and remove weeds regularly."
            ],
            "preventiveMeasures": [
                "Weekly field scouting during active growth stages.",
                "Maintain weed-free field perimeters.",
                "Use balanced NPK fertilizers as per soil test recommendations."
            ]
        }
    
    return {
        "crop": crop,
        "disease": formatted,
        "severity": severity,
        "symptoms": [
            f"Visible signs of {formatted.split(' - ')[-1].lower() if ' - ' in formatted else 'disease'} detected on {crop} leaf surface.",
            f"Pattern is consistent with {formatted}."
        ],
        "recommendations": [
            "Consult your local Krishi Vigyan Kendra (KVK) for region-specific treatment.",
            "Apply recommended fungicide/pesticide per agricultural extension guidelines.",
            "Remove and safely dispose of severely infected plant material.",
            "Avoid overhead irrigation to reduce moisture on foliage."
        ],
        "preventiveMeasures": [
            "Use certified disease-resistant seed varieties for next planting.",
            "Practice crop rotation with non-host species.",
            "Ensure proper field drainage and air circulation.",
            "Monitor weather forecasts for conditions favorable to disease spread."
        ]
    }

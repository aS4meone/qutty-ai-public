import io
from typing import List
import torch
from PIL import Image as PILImage
from fastapi import UploadFile
from transformers import ViTForImageClassification, ViTImageProcessor

model_path = "custom_hand_gestures_model_v2_28june"
model = ViTForImageClassification.from_pretrained(model_path)
processor = ViTImageProcessor.from_pretrained(model_path)
id2label = model.config.id2label


def load_images(image_files: List[UploadFile]) -> List[PILImage.Image]:
    images = []
    for image_file in image_files:
        image_bytes = image_file.file.read()
        image = PILImage.open(io.BytesIO(image_bytes)).convert("RGB")
        images.append(image)
    return images


def predict_batch(images: List[PILImage.Image]) -> List[str]:
    inputs = processor(images=images, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)

    logits = outputs.logits
    predicted_class_indices = logits.argmax(-1)
    predicted_labels = [id2label[idx.item()] for idx in predicted_class_indices]

    return predicted_labels


def correct_count(gesture_names_list: List[str], images: List[UploadFile], strict: bool = True,
                  group_size: int = 3) -> int:
    loaded_images = load_images(images)
    defined_gestures = predict_batch(loaded_images)

    count = 0

    for i in range(0, len(gesture_names_list), group_size):
        expected_gesture = gesture_names_list[i]
        gesture_group = defined_gestures[i:i + group_size]

        if strict:
            if expected_gesture in gesture_group:
                count += 1
        else:
            if any(gesture == expected_gesture for gesture in gesture_group):
                count += 1

    return count

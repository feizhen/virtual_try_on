import io
import hashlib
from typing import List

import numpy as np
from PIL import Image

try:
    import torch
except Exception:  # pragma: no cover - ComfyUI provides torch
    torch = None


def _ensure_torch_available():
    if torch is None:
        raise RuntimeError("PyTorch is required in ComfyUI runtime but was not found.")


def tensor_to_pil_list(image_tensor) -> List[Image.Image]:
    """Convert ComfyUI IMAGE tensor [B,H,W,C] float32(0..1) to list of PIL.Image (RGB).

    Supports batch processing; returns one PIL image per batch.
    """
    _ensure_torch_available()

    if image_tensor is None:
        raise ValueError("image_tensor is None")

    if not isinstance(image_tensor, torch.Tensor):
        raise TypeError("Expected image_tensor to be a torch.Tensor")

    if image_tensor.ndim != 4 or image_tensor.shape[-1] != 3:
        raise ValueError(
            f"Expected image tensor shape [B,H,W,3], got {tuple(image_tensor.shape)}"
        )

    images: List[Image.Image] = []
    batch, height, width, channels = image_tensor.shape

    image_tensor = image_tensor.detach().cpu().clamp(0.0, 1.0)
    np_images = (image_tensor.numpy() * 255.0).astype(np.uint8)
    for i in range(batch):
        arr = np_images[i]
        img = Image.fromarray(arr, mode="RGB")
        images.append(img)
    return images


def pil_list_to_tensor(images: List[Image.Image]):
    """Convert list of PIL.Image (RGB) to ComfyUI IMAGE tensor [B,H,W,C] float32(0..1)."""
    _ensure_torch_available()

    if not images:
        raise ValueError("images list is empty")

    tensors = []
    for img in images:
        if img.mode != "RGB":
            img = img.convert("RGB")
        arr = np.array(img).astype(np.float32) / 255.0
        t = torch.from_numpy(arr)
        tensors.append(t)

    # Stack along batch dimension; ComfyUI expects [B,H,W,C]
    batch_tensor = torch.stack(tensors, dim=0)
    return batch_tensor


def pil_to_png_bytes(img: Image.Image) -> bytes:
    if img.mode != "RGB":
        img = img.convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def bytes_to_pil_image(data: bytes) -> Image.Image:
    return Image.open(io.BytesIO(data)).convert("RGB")


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def hash_pil_image(img: Image.Image) -> str:
    return sha256_bytes(pil_to_png_bytes(img))


def hash_pil_images(images: List[Image.Image]) -> str:
    hasher = hashlib.sha256()
    for img in images:
        hasher.update(pil_to_png_bytes(img))
    return hasher.hexdigest()



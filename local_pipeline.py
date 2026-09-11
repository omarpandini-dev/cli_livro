#!/usr/bin/env python3
"""Deterministic local helpers for the fabrica-livros-json-local skill."""

from __future__ import annotations

import argparse
import csv
import json
import re
import unicodedata
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


REQUIRED_INPUT_FIELDS = {
    "titulo_da_historia",
    "quantidade_de_paginas",
    "limite_de_caracteres_por_pagina",
    "resumo_historia",
    "personagens",
    "viloes",
    "cenarios",
    "tem_bicho_estimacao",
}


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8-sig") as handle:
        value = json.load(handle)
    if not isinstance(value, dict):
        raise ValueError(f"{path} deve conter um objeto JSON.")
    return value


def save_json(path: Path, value: dict) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def strip_accents(value: str) -> str:
    return "".join(
        char for char in unicodedata.normalize("NFKD", value)
        if not unicodedata.combining(char)
    )


def folder_name(title: str) -> str:
    normalized = strip_accents(title)
    result = "".join(char for char in normalized if char.isalnum())
    if not result:
        raise ValueError("O título não produz um nome de pasta válido.")
    return result


def file_stem(title: str) -> str:
    normalized = strip_accents(title).lower()
    result = re.sub(r"[^a-z0-9]+", "-", normalized).strip("-")
    if not result:
        raise ValueError("O título não produz um nome de arquivo válido.")
    return result


def validate_initial(data: dict) -> None:
    missing = sorted(REQUIRED_INPUT_FIELDS - set(data))
    if missing:
        raise ValueError("Campos obrigatórios ausentes: " + ", ".join(missing))
    if not isinstance(data["titulo_da_historia"], str) or not data["titulo_da_historia"].strip():
        raise ValueError("titulo_da_historia deve ser um texto não vazio.")
    if not isinstance(data["quantidade_de_paginas"], int) or data["quantidade_de_paginas"] < 1:
        raise ValueError("quantidade_de_paginas deve ser um inteiro positivo.")
    if not isinstance(data["limite_de_caracteres_por_pagina"], int) or data["limite_de_caracteres_por_pagina"] < 1:
        raise ValueError("limite_de_caracteres_por_pagina deve ser um inteiro positivo.")
    if not isinstance(data["personagens"], list) or not data["personagens"]:
        raise ValueError("personagens deve conter ao menos um personagem.")
    if not isinstance(data["cenarios"], list) or not data["cenarios"]:
        raise ValueError("cenarios deve conter ao menos um cenário.")


def prepare(args: argparse.Namespace) -> None:
    input_path = args.input_json.resolve()
    root = args.root.resolve()
    data = load_json(input_path)
    validate_initial(data)

    book_dir = root / folder_name(data["titulo_da_historia"])
    canonical_path = book_dir / "json_historia.json"
    if canonical_path.exists():
        existing = load_json(canonical_path)
        if existing != data:
            raise FileExistsError(
                f"Conflito: {canonical_path} já existe com conteúdo diferente."
            )

    (book_dir / "output" / "csv").mkdir(parents=True, exist_ok=True)
    (book_dir / "output" / "img").mkdir(parents=True, exist_ok=True)
    save_json(canonical_path, data)

    report = {
        "json_historia": str(canonical_path),
        "nova_pasta": str(book_dir),
        "file_stem": file_stem(data["titulo_da_historia"]),
        "title": data["titulo_da_historia"],
        "pages": data["quantidade_de_paginas"],
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))


def resolve_font() -> str:
    candidates = [
        Path(r"C:\Windows\Fonts\trebuc.ttf"),
        Path(r"C:\Windows\Fonts\comic.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return str(candidate)
    return "DejaVuSans.ttf"


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    lines: list[str] = []
    current = ""
    for word in text.split():
        candidate = word if not current else f"{current} {word}"
        if draw.textlength(candidate, font=font) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def measure_text(draw: ImageDraw.ImageDraw, lines: list[str], font: ImageFont.FreeTypeFont, spacing: int) -> tuple[float, int, int]:
    bbox = draw.textbbox((0, 0), "Ágj", font=font)
    line_height = bbox[3] - bbox[1]
    height = line_height * len(lines) + spacing * max(0, len(lines) - 1)
    width = max(draw.textlength(line, font=font) for line in lines)
    return width, height, line_height


def fit_text(draw: ImageDraw.ImageDraw, text: str, max_width: int, max_height: int):
    font_path = resolve_font()
    low, high, best = 18, 96, None
    while low <= high:
        size = (low + high) // 2
        font = ImageFont.truetype(font_path, size=size)
        spacing = max(6, round(size * 0.16))
        lines = wrap_text(draw, text, font, max_width)
        width, height, line_height = measure_text(draw, lines, font, spacing)
        if width <= max_width and height <= max_height:
            best = (font, lines, spacing, height, line_height, size)
            low = size + 1
        else:
            high = size - 1
    if best is None:
        raise RuntimeError("Não foi possível ajustar o texto à textura.")
    return best


def render_text_page(texture: Image.Image, text: str, output_path: Path) -> dict:
    page = texture.convert("RGBA")
    width, height = page.size
    draw = ImageDraw.Draw(page)
    outer_margin = round(width * 0.035)
    text_margin_x = round(width * 0.085)
    text_margin_y = round(height * 0.075)
    max_width = width - 2 * text_margin_x
    max_height = height - 2 * text_margin_y

    draw.rounded_rectangle(
        (outer_margin, outer_margin, width - outer_margin, height - outer_margin),
        radius=28,
        outline=(166, 126, 71, 105),
        width=4,
    )
    draw.rounded_rectangle(
        (outer_margin + 12, outer_margin + 12, width - outer_margin - 12, height - outer_margin - 12),
        radius=22,
        outline=(206, 169, 111, 75),
        width=2,
    )

    font, lines, spacing, block_height, line_height, font_size = fit_text(
        draw, text, max_width, max_height
    )
    y = (height - block_height) / 2
    for line in lines:
        draw.text((text_margin_x + 1, y + 1), line, font=font, fill=(255, 252, 243, 170))
        draw.text((text_margin_x, y), line, font=font, fill=(37, 62, 78, 255))
        y += line_height + spacing

    page.convert("RGB").save(output_path, format="PNG", optimize=True)
    return {"file": output_path.name, "font_size": font_size, "lines": len(lines)}


def center_crop_1_1(path: Path) -> str:
    with Image.open(path) as source:
        width, height = source.size
        side = min(width, height)
        if side < 1:
            raise ValueError(f"Imagem pequena demais para 1:1: {path}")
        target_width, target_height = side, side
        left = (width - target_width) // 2
        top = (height - target_height) // 2
        cropped = source.crop((left, top, left + target_width, top + target_height)).convert("RGB")
        cropped.save(path, format="PNG", optimize=True)
        return f"{target_width}x{target_height}"


def validate_final(initial: dict, story: dict, prompts: dict, book_dir: Path, csv_path: Path) -> dict:
    expected_pages = initial["quantidade_de_paginas"]
    character_count = len(prompts.get("character_prompts", []))
    scene_count = len(prompts.get("scene_prompts", []))
    image_dir = book_dir / "output" / "img"

    checks = {
        "title_matches": story.get("title") == initial["titulo_da_historia"] == prompts.get("title"),
        "page_count": len(story.get("pages", [])) == expected_pages,
        "audio_count": len(story.get("roteiro_audio", [])) == expected_pages,
        "scene_count": scene_count == expected_pages,
        "character_images": all((image_dir / f"p{index}.png").exists() for index in range(1, character_count + 1)),
        "scene_images": all((image_dir / f"{index * 2}.png").exists() for index in range(1, expected_pages + 1)),
        "text_images": all((image_dir / f"{index * 2 - 1}.png").exists() for index in range(1, expected_pages + 1)),
        "covers": (image_dir / "cover_title.png").exists() and (image_dir / "cover.png").exists(),
        "csv_exists": csv_path.exists(),
    }
    checks["valid"] = all(checks.values())
    return checks


def finalize(args: argparse.Namespace) -> None:
    book_dir = args.book_dir.resolve()
    story_path = args.story_json.resolve()
    prompts_path = args.prompts_json.resolve()
    initial = load_json(book_dir / "json_historia.json")
    story = load_json(story_path)
    prompts = load_json(prompts_path)
    validate_initial(initial)

    pages = story.get("pages", [])
    if len(pages) != initial["quantidade_de_paginas"]:
        raise ValueError("O JSON final da história possui quantidade incorreta de páginas.")
    if len(prompts.get("scene_prompts", [])) != len(pages):
        raise ValueError("O JSON de prompts possui quantidade incorreta de cenas.")

    image_dir = book_dir / "output" / "img"
    csv_dir = book_dir / "output" / "csv"
    image_dir.mkdir(parents=True, exist_ok=True)
    csv_dir.mkdir(parents=True, exist_ok=True)
    stem = file_stem(initial["titulo_da_historia"])
    csv_path = csv_dir / f"{stem}-textos.csv"

    with csv_path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["Linha", "Texto"])
        writer.writerows((page["number"], page["text"]) for page in pages)

    texture_path = args.texture.resolve() if args.texture else None
    if texture_path is None:
        workspace_texture = book_dir.parent / "assets" / "textura.png"
        bundled_texture = Path(__file__).resolve().parent.parent / "assets" / "textura.png"
        texture_path = workspace_texture if workspace_texture.exists() else bundled_texture
    if not texture_path.exists():
        raise FileNotFoundError(f"Textura não encontrada: {texture_path}")

    text_page_report = []
    with Image.open(texture_path) as texture:
        for index, page in enumerate(pages, start=1):
            text_page_report.append(
                render_text_page(texture, page["text"], image_dir / f"{index * 2 - 1}.png")
            )

    visual_files = [
        *(image_dir / f"p{index}.png" for index in range(1, len(prompts.get("character_prompts", [])) + 1)),
        *(image_dir / f"{index * 2}.png" for index in range(1, len(pages) + 1)),
        image_dir / "cover_title.png",
        image_dir / "cover.png",
    ]
    missing_visuals = [str(path) for path in visual_files if not path.exists()]
    if missing_visuals:
        raise FileNotFoundError("Imagens visuais ausentes: " + ", ".join(missing_visuals))
    dimensions = {path.name: center_crop_1_1(path) for path in visual_files}

    checks = validate_final(initial, story, prompts, book_dir, csv_path)
    report = {
        **checks,
        "nova_pasta": str(book_dir),
        "csv_path": str(csv_path),
        "image_dir": str(image_dir),
        "visual_dimensions": dimensions,
        "text_pages": text_page_report,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if not checks["valid"]:
        raise RuntimeError("A validação final do pacote falhou.")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    prepare_parser = subparsers.add_parser("prepare", help="Valida o JSON inicial e cria a estrutura do livro.")
    prepare_parser.add_argument("--input-json", type=Path, required=True)
    prepare_parser.add_argument("--root", type=Path, required=True)
    prepare_parser.set_defaults(func=prepare)

    finalize_parser = subparsers.add_parser("finalize", help="Cria CSV e páginas de texto, normaliza imagens e valida o pacote.")
    finalize_parser.add_argument("--book-dir", type=Path, required=True)
    finalize_parser.add_argument("--story-json", type=Path, required=True)
    finalize_parser.add_argument("--prompts-json", type=Path, required=True)
    finalize_parser.add_argument("--texture", type=Path)
    finalize_parser.set_defaults(func=finalize)
    return parser


def main() -> None:
    args = build_parser().parse_args()
    args.func(args)


if __name__ == "__main__":
    main()

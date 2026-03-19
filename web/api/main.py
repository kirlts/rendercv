from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import subprocess
import tempfile
import pathlib
import os
import json
import yaml as pyyaml
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from rendercv.schema.rendercv_model_builder import build_rendercv_dictionary_and_model
from rendercv.renderer.typst import generate_typst
from rendercv.renderer.pdf_png import generate_pdf
from rendercv.exception import RenderCVUserValidationError, RenderCVUserError

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Default Theme Constant for this workspace
DEFAULT_THEME = "jpmr"
BUILT_IN_THEMES = {"classic", "engineeringclassic", "engineeringresumes", "moderncv", "sb2nov"}

def _adapt_typography_for_builtin(parsed: dict, theme: str) -> None:
    """Translate frontend typography fields to built-in theme schema.

    Built-in themes use `bold` (booleans) instead of `font_weight` (ints),
    and don't have `entry_title`/`entry_detail` in `font_size`.
    This mutates `parsed` in-place before YAML is sent to rendercv.
    """
    if theme not in BUILT_IN_THEMES:
        return
    design = parsed.get("design")
    if not isinstance(design, dict):
        return
    typo = design.get("typography")
    if not isinstance(typo, dict):
        return

    # font_weight → bold translation (>= 600 = bold)
    fw = typo.pop("font_weight", None)
    if isinstance(fw, dict):
        bold_map = {}
        for key in ("name", "headline", "connections", "section_titles"):
            if key in fw:
                val = fw[key]
                bold_map[key] = bool(isinstance(val, int) and val >= 600)
        if bold_map:
            existing_bold = typo.get("bold", {})
            if not isinstance(existing_bold, dict):
                existing_bold = {}
            existing_bold.update(bold_map)
            typo["bold"] = existing_bold

    # Strip entry_title/entry_detail from font_size
    fs = typo.get("font_size")
    if isinstance(fs, dict):
        fs.pop("entry_title", None)
        fs.pop("entry_detail", None)

class RenderRequest(BaseModel):
    yaml: str
    design: str = DEFAULT_THEME

@app.post("/api/render")
async def render_cv(request: RenderRequest):
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir_path = pathlib.Path(tmpdir)
            input_file_path = tmpdir_path / "cv.yaml"

            try:
                # Use ruamel.yaml instead of pyyaml for safer/better compatibility with rendercv syntax.
                from ruamel.yaml import YAML
                ruamel_yaml = YAML()
                ruamel_yaml.preserve_quotes = True
                parsed_yaml = ruamel_yaml.load(request.yaml)

                if not isinstance(parsed_yaml, dict):
                    parsed_yaml = {}

                # If they don't have a design block, create one
                if "design" not in parsed_yaml or parsed_yaml["design"] is None:
                    parsed_yaml["design"] = {}

                # Pass the theme straight through. We now use actual built-in permanent themes
                # in rendercv (systems_engineer, data_scientist, quant_developer, etc.)
                parsed_yaml["design"]["theme"] = request.design

                # Adapt frontend-injected typography for built-in themes
                _adapt_typography_for_builtin(parsed_yaml, request.design)

                # Dump it to a string
                import io
                string_stream = io.StringIO()
                ruamel_yaml.dump(parsed_yaml, string_stream)
                final_yaml = string_stream.getvalue()

            except Exception as parse_e:
                # If YAML is so invalid it can't be parsed safely, let rendercv handle it natively
                final_yaml = request.yaml

            input_file_path.write_text(final_yaml, encoding="utf-8")

            # For custom themes, symlink the theme folder into the tmpdir
            BUILT_IN_THEMES = {"classic", "engineeringclassic", "engineeringresumes", "moderncv", "sb2nov"}
            if request.design not in BUILT_IN_THEMES:
                themes_dir = pathlib.Path(__file__).parent.parent.parent / "themes"
                custom_theme_src = themes_dir / request.design
                if custom_theme_src.exists() and custom_theme_src.is_dir():
                    custom_theme_dst = tmpdir_path / request.design
                    if not custom_theme_dst.exists():
                        os.symlink(custom_theme_src, custom_theme_dst)

            # Use rendercv programmatic API
            _, rendercv_model = build_rendercv_dictionary_and_model(
                final_yaml,
                input_file_path=input_file_path,
                output_folder=tmpdir_path,
            )

            typst_path = generate_typst(rendercv_model)
            pdf_path = generate_pdf(rendercv_model, typst_path)

            with open(pdf_path, "rb") as f:
                pdf_bytes = f.read()

            from fastapi import Response
            return Response(content=pdf_bytes, media_type="application/pdf")

    except RenderCVUserValidationError as e:
        errors = [{"message": str(err), "loc": getattr(err, "loc", None)} for err in e.validation_errors] if e.validation_errors else [str(e)]
        return JSONResponse(status_code=400, content={"error": "validation", "details": errors})
    except RenderCVUserError as e:
        return JSONResponse(status_code=400, content={"error": "user", "details": str(e)})
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": "syntax", "details": str(e)})

@app.get("/api/examples")
async def get_examples():
    """Reads YAML examples from the /examples folder and returns their filenames."""
    examples_dir = pathlib.Path(__file__).parent.parent.parent / "examples"
    examples = []
    if examples_dir.exists():
        for file in examples_dir.glob("*.yaml"):
            examples.append({"name": file.name})
    return {"examples": sorted(examples, key=lambda x: x["name"])}

@app.get("/api/examples/{filename}")
async def get_example(filename: str):
    """Returns the content of a specific YAML example."""
    examples_dir = pathlib.Path(__file__).parent.parent.parent / "examples"
    file_path = examples_dir / filename
    if not file_path.exists() or not file_path.suffix == ".yaml":
        raise HTTPException(status_code=404, detail="Example not found")

    content = file_path.read_text(encoding="utf-8")
    return {"content": content}

@app.get("/api/schema")
async def get_schema():
    """Returns the JSON schema for validation in Monaco."""
    schema_path = pathlib.Path(__file__).parent.parent.parent / "schema.json"
    if schema_path.exists():
        return FileResponse(schema_path)
    raise HTTPException(status_code=404, detail="Schema not found")

@app.get("/api/themes")
async def get_themes():
    """Returns the list of available themes, including built-in and custom templates."""
    try:
        from rendercv.schema.models.design.built_in_design import available_themes
        themes_list = [{"id": t, "name": t.capitalize()} for t in available_themes]
    except Exception:
        # Fallback if rendercv internal API changes
        themes_list = [
            {"id": "classic", "name": "Classic"},
            {"id": "engineeringclassic", "name": "Engineering Classic"},
            {"id": "engineeringresumes", "name": "Engineering Resumes"},
            {"id": "moderncv", "name": "ModernCV"},
            {"id": "sb2nov", "name": "SB2Nov"},
        ]
        
    themes_dir = pathlib.Path(__file__).parent.parent.parent / "themes"
    if themes_dir.exists() and themes_dir.is_dir():
        for item in themes_dir.iterdir():
            if item.is_dir() and item.name not in ["__pycache__"] and not item.name.startswith("."):
                themes_list.append({"id": item.name, "name": f"{item.name} (Custom)"})
    
    return {"themes": themes_list}

@app.get("/api/fonts")
async def get_fonts():
    """Returns sorted list of available font families (system + RenderCV bundled)."""
    # RenderCV bundled fonts (always available for rendering)
    bundled_fonts = {
        "Source Sans 3", "Lato", "Raleway", "Roboto", "Poppins",
        "Open Sans", "Noto Sans", "Ubuntu", "Mukta", "EB Garamond",
        "Gentium Book Plus", "Open Sauce Sans", "Fontin", "XCharter",
        "Libertinus Serif", "New Computer Modern", "DejaVu Sans Mono",
    }
    try:
        result = subprocess.run(
            ["fc-list", ":", "family"],
            capture_output=True, text=True, timeout=5
        )
        raw_families = set(bundled_fonts)  # Start with bundled
        for line in result.stdout.strip().split("\n"):
            if not line.strip():
                continue
            primary = line.split(",")[0].strip()
            if primary:
                raw_families.add(primary)
        return {"fonts": sorted(raw_families)}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

DEFAULT_TEMPLATE_PATH = pathlib.Path(__file__).parent.parent.parent / "default_template.yaml"
DEFAULT_TEMPLATE_EN_PATH = pathlib.Path(__file__).parent.parent.parent / "default_template_english.yaml"

def _get_template_path(lang: str) -> pathlib.Path:
    if lang == "en":
        return DEFAULT_TEMPLATE_EN_PATH
    return DEFAULT_TEMPLATE_PATH

@app.get("/api/default-template")
async def get_default_template(lang: str = "es"):
    """Returns the contents of default_template.yaml or default_template_english.yaml."""
    path = _get_template_path(lang)
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Template for lang '{lang}' not found")
    return {"content": path.read_text(encoding="utf-8"), "lang": lang}

class TemplateUpdate(BaseModel):
    content: str

@app.put("/api/default-template")
async def update_default_template(body: TemplateUpdate, lang: str = "es"):
    """Overwrites default_template.yaml or default_template_english.yaml."""
    path = _get_template_path(lang)
    path.write_text(body.content, encoding="utf-8")
    return {"status": "ok", "lang": lang}

@app.get("/api/cvs")
async def get_cvs():
    """Returns the 10 most recently generated CV PDFs."""
    cvs_dir = pathlib.Path(__file__).parent.parent.parent / "CVs"
    cvs = []
    if cvs_dir.exists() and cvs_dir.is_dir():
        pdf_files = list(cvs_dir.rglob("*.pdf"))
        # Sort by modification time, most recent first
        pdf_files.sort(key=lambda f: f.stat().st_mtime, reverse=True)
        for file in pdf_files[:10]:
            # Convert absolute path to a relative path from the CVs directory for context
            rel_path = file.relative_to(cvs_dir)
            cvs.append({"name": file.name, "path": str(rel_path)})
    return {"cvs": cvs}

LANGUAGE_MAP = {
    "spanish": "Español",
    "english": "English",
    "portuguese": "Português",
    "french": "Français",
    "german": "Deutsch",
}

@app.post("/api/save-cv")
async def save_cv(request: RenderRequest):
    """Renders the CV and saves the PDF to the CVs/ folder.

    Filename pattern: Martin Gil CV - [Cargo] - [Idioma].pdf
    - Cargo: extracted from settings.render_command.output_folder
    - Idioma: extracted from locale.language
    """
    # Parse YAML to extract cargo and language
    try:
        from ruamel.yaml import YAML
        import io
        ruamel_yaml = YAML()
        ruamel_yaml.preserve_quotes = True
        parsed = ruamel_yaml.load(request.yaml)
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": "yaml_parse", "details": str(e)})

    if not isinstance(parsed, dict):
        return JSONResponse(status_code=400, content={"error": "validation", "details": "YAML inválido"})

    # Extract cargo from output_folder
    try:
        output_folder = parsed["settings"]["render_command"]["output_folder"]
        # Pattern: "../CVs/AI Specialist - ACL/" → "AI Specialist - ACL" → "AI Specialist"
        folder_name = pathlib.PurePosixPath(output_folder.rstrip("/")).name
        cargo = folder_name.split(" - ")[0].strip()
        # Strip experience level prefixes — the CV name should be role-only
        import re
        cargo = re.sub(
            r'^(Senior|Junior|Lead|Staff|Principal|Mid[- ]?Level|Entry[- ]?Level|Intern)\s+',
            '', cargo, flags=re.IGNORECASE
        ).strip()
        if not cargo or cargo == "CVs":
            raise ValueError("Cargo vacío")
    except (KeyError, TypeError, ValueError):
        return JSONResponse(status_code=400, content={
            "error": "missing_field",
            "details": "No se pudo extraer el cargo de settings.render_command.output_folder"
        })

    # Extract language
    try:
        language = parsed["locale"]["language"]
        idioma = LANGUAGE_MAP.get(language, language.capitalize())
    except (KeyError, TypeError):
        return JSONResponse(status_code=400, content={
            "error": "missing_field",
            "details": "No se encontró locale.language en el YAML"
        })

    # Render the PDF (same logic as /api/render)
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir_path = pathlib.Path(tmpdir)
            input_file_path = tmpdir_path / "cv.yaml"

            # Inject design theme
            if "design" not in parsed or parsed["design"] is None:
                parsed["design"] = {}
            parsed["design"]["theme"] = request.design

            # Adapt frontend-injected typography for built-in themes
            _adapt_typography_for_builtin(parsed, request.design)

            string_stream = io.StringIO()
            ruamel_yaml.dump(parsed, string_stream)
            final_yaml = string_stream.getvalue()
            input_file_path.write_text(final_yaml, encoding="utf-8")

            # Symlink custom themes
            BUILT_IN_THEMES = {"classic", "engineeringclassic", "engineeringresumes", "moderncv", "sb2nov"}
            if request.design not in BUILT_IN_THEMES:
                themes_dir = pathlib.Path(__file__).parent.parent.parent / "themes"
                custom_theme_src = themes_dir / request.design
                if custom_theme_src.exists() and custom_theme_src.is_dir():
                    custom_theme_dst = tmpdir_path / request.design
                    if not custom_theme_dst.exists():
                        os.symlink(custom_theme_src, custom_theme_dst)

            _, rendercv_model = build_rendercv_dictionary_and_model(
                final_yaml,
                input_file_path=input_file_path,
                output_folder=tmpdir_path,
            )
            typst_path = generate_typst(rendercv_model)
            pdf_path = generate_pdf(rendercv_model, typst_path)

            # Save to CVs/ folder
            cvs_dir = pathlib.Path(__file__).parent.parent.parent / "CVs"
            cvs_dir.mkdir(parents=True, exist_ok=True)
            filename = f"Martin Gil CV - {cargo} - {idioma}.pdf"
            dest_path = cvs_dir / filename

            import shutil
            shutil.copy2(str(pdf_path), str(dest_path))

            return {"status": "ok", "path": f"CVs/{filename}"}

    except RenderCVUserValidationError as e:
        errors = [{"message": str(err), "loc": getattr(err, "loc", None)} for err in e.validation_errors] if e.validation_errors else [str(e)]
        return JSONResponse(status_code=400, content={"error": "validation", "details": errors})
    except RenderCVUserError as e:
        return JSONResponse(status_code=400, content={"error": "user", "details": str(e)})
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": "render", "details": str(e)})

@app.get("/api/ofertas")
async def get_ofertas():
    """Returns the 5 most recently modified YAML files from the ofertas/ directory."""
    ofertas_dir = pathlib.Path(__file__).parent.parent.parent / "ofertas"
    ofertas = []
    if ofertas_dir.exists() and ofertas_dir.is_dir():
        yaml_files = list(ofertas_dir.glob("*.yaml")) + list(ofertas_dir.glob("*.yml"))
        # Sort by modification time, most recent first
        yaml_files.sort(key=lambda f: f.stat().st_mtime, reverse=True)
        for file in yaml_files[:5]:
            ofertas.append({"name": file.stem, "filename": file.name})
    return {"ofertas": ofertas}

@app.get("/api/ofertas/{filename}")
async def get_oferta(filename: str):
    """Returns the content of a specific oferta YAML, stripping design overrides.

    AI-generated YAMLs may include design overrides that should NOT be used;
    the frontend's theme selector controls the visual design instead.
    We strip everything under 'design' except 'theme' so the user can
    freely switch themes without the AI's overrides interfering.
    """
    ofertas_dir = pathlib.Path(__file__).parent.parent.parent / "ofertas"
    file_path = ofertas_dir / filename
    if not file_path.exists() or file_path.suffix not in (".yaml", ".yml"):
        raise HTTPException(status_code=404, detail="Oferta not found")

    content = file_path.read_text(encoding="utf-8")
    theme = DEFAULT_THEME

    # Strip design overrides but keep theme
    try:
        from ruamel.yaml import YAML
        import io
        ruamel_yaml = YAML()
        ruamel_yaml.preserve_quotes = True
        parsed = ruamel_yaml.load(content)
        if isinstance(parsed, dict) and "design" in parsed:
            theme = parsed["design"].get("theme", DEFAULT_THEME) if isinstance(parsed["design"], dict) else DEFAULT_THEME
            parsed["design"] = {"theme": theme}
            stream = io.StringIO()
            ruamel_yaml.dump(parsed, stream)
            content = stream.getvalue()
    except Exception:
        pass  # If parsing fails, return raw content

    return {"content": content, "theme": theme}

@app.put("/api/ofertas/{filename}")
async def update_oferta(filename: str, request: Request):
    """Saves updated YAML content back to an oferta file."""
    ofertas_dir = pathlib.Path(__file__).parent.parent.parent / "ofertas"
    file_path = ofertas_dir / filename
    if not file_path.exists() or file_path.suffix not in (".yaml", ".yml"):
        raise HTTPException(status_code=404, detail="Oferta not found")

    data = await request.json()
    content = data.get("content", "")
    if not content:
        raise HTTPException(status_code=400, detail="No content provided")

    file_path.write_text(content, encoding="utf-8")
    return {"status": "ok"}

@app.get("/api/theme-defaults/{theme_id}")
async def get_theme_defaults(theme_id: str, fresh: int = 0):
    """Returns the default font_size and font_weight values for the given theme."""
    try:
        # Check for saved overrides first (unless fresh=1)
        import json
        if not fresh:
            overrides_dir = pathlib.Path(__file__).parent.parent.parent / "themes" / ".overrides"
            overrides_file = overrides_dir / f"{theme_id}.json"
            if overrides_file.exists():
                saved = json.loads(overrides_file.read_text(encoding="utf-8"))
                if "font_size" in saved and "font_weight" in saved:
                    if "font_family" not in saved:
                        saved["font_family"] = "Source Sans 3"
                    return saved

        # Try custom themes first (e.g., jpmr)
        themes_dir = pathlib.Path(__file__).parent.parent.parent / "themes"
        custom_theme_dir = themes_dir / theme_id
        if custom_theme_dir.exists() and (custom_theme_dir / "__init__.py").exists():
            import importlib.util
            spec = importlib.util.spec_from_file_location(
                f"themes.{theme_id}", custom_theme_dir / "__init__.py"
            )
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            # Find the Design class (e.g., JpmrDesign)
            design_cls = None
            for attr_name in dir(mod):
                obj = getattr(mod, attr_name)
                if isinstance(obj, type) and hasattr(obj, 'model_fields') and 'typography' in obj.model_fields:
                    design_cls = obj
                    break
            if design_cls:
                instance = design_cls()
                typo = instance.typography
                font_size = typo.font_size
                font_family = getattr(typo, 'font_family', 'Source Sans 3') or 'Source Sans 3'
                return {
                    "font_family": font_family,
                    "font_size": {
                        "body": font_size.body,
                        "name": font_size.name,
                        "headline": font_size.headline,
                        "connections": font_size.connections,
                        "section_titles": font_size.section_titles,
                        "entry_title": getattr(font_size, 'entry_title', font_size.body),
                        "entry_detail": getattr(font_size, 'entry_detail', font_size.body),
                    },
                    "font_weight": {
                        "body": typo.font_weight.body if hasattr(typo.font_weight, 'body') else (typo.font_weight if isinstance(typo.font_weight, int) else 400),
                        "name": typo.font_weight.name if hasattr(typo.font_weight, 'name') else (typo.font_weight if isinstance(typo.font_weight, int) else 400),
                        "headline": typo.font_weight.headline if hasattr(typo.font_weight, 'headline') else (typo.font_weight if isinstance(typo.font_weight, int) else 400),
                        "connections": typo.font_weight.connections if hasattr(typo.font_weight, 'connections') else (typo.font_weight if isinstance(typo.font_weight, int) else 400),
                        "section_titles": typo.font_weight.section_titles if hasattr(typo.font_weight, 'section_titles') else (typo.font_weight if isinstance(typo.font_weight, int) else 400),
                        "entry_title": typo.font_weight.entry_title if hasattr(typo.font_weight, 'entry_title') else 700,
                        "entry_detail": typo.font_weight.entry_detail if hasattr(typo.font_weight, 'entry_detail') else 400,
                    },
                    "spacing": {
                        "body": '0.2cm',
                        "name": '0.7cm',
                        "headline": '0.7cm',
                        "connections": '0.7cm',
                        "section_titles": '0.5cm',
                        "entry_title": '0.4cm',
                        "entry_detail": '0.2cm',
                    },
                }

        # Built-in themes — use ClassicTheme or its variants
        from rendercv.schema.models.design.built_in_design import available_themes
        from typing import get_args
        from rendercv.schema.models.design.built_in_design import BuiltInDesign

        for ThemeClass in get_args(get_args(BuiltInDesign.__value__)[0]):
            theme_name = ThemeClass.model_fields["theme"].default
            if theme_name == theme_id:
                instance = ThemeClass()
                typo = instance.typography
                font_size = typo.font_size
                # Built-in themes use typography.bold (booleans) instead of font_weight
                bold = typo.bold
                def _weight(is_bold: bool) -> int:
                    return 700 if is_bold else 400
                return {
                    "font_family": "Source Sans 3",
                    "font_size": {
                        "body": font_size.body,
                        "name": font_size.name,
                        "headline": font_size.headline,
                        "connections": font_size.connections,
                        "section_titles": font_size.section_titles,
                        "entry_title": font_size.body,
                        "entry_detail": font_size.body,
                    },
                    "font_weight": {
                        "body": 400,
                        "name": _weight(bold.name),
                        "headline": _weight(bold.headline),
                        "connections": _weight(bold.connections),
                        "section_titles": _weight(bold.section_titles),
                        "entry_title": 700,
                        "entry_detail": 400,
                    },
                    "spacing": {
                        "body": '0.2cm',
                        "name": str(instance.header.space_below_name),
                        "headline": str(instance.header.space_below_headline),
                        "connections": str(instance.header.space_below_connections),
                        "section_titles": str(instance.section_titles.space_above),
                        "entry_title": '0.4cm',
                        "entry_detail": '0.2cm',
                    },
                }

        raise HTTPException(status_code=404, detail=f"Theme '{theme_id}' not found")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/theme-defaults/{theme_id}")
async def save_theme_defaults(theme_id: str, request: Request):
    """Saves user-customized font_size and font_weight as new theme defaults."""
    data = await request.json()
    overrides_dir = pathlib.Path(__file__).parent.parent.parent / "themes" / ".overrides"
    overrides_dir.mkdir(parents=True, exist_ok=True)
    overrides_file = overrides_dir / f"{theme_id}.json"

    import json
    overrides_file.write_text(json.dumps(data, indent=2), encoding="utf-8")

    return {"status": "ok"}

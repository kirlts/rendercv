from fastapi import FastAPI, HTTPException
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

class RenderRequest(BaseModel):
    yaml: str
    design: str = "classic"

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

                # Dump it to a string
                import io
                string_stream = io.StringIO()
                ruamel_yaml.dump(parsed_yaml, string_stream)
                final_yaml = string_stream.getvalue()

            except Exception as parse_e:
                # If YAML is so invalid it can't be parsed safely, let rendercv handle it natively
                final_yaml = request.yaml

            input_file_path.write_text(final_yaml, encoding="utf-8")

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
        import traceback
        return JSONResponse(status_code=400, content={"error": "syntax", "details": str(e) + "\n" + traceback.format_exc()})

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

import sys
import pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent.parent))

from fastapi.testclient import TestClient
from web.api.main import app

client = TestClient(app)

def test_render_cv_valid():
    yaml_content = """
cv:
  name: John Doe
"""
    response = client.post("/api/render", json={"yaml": yaml_content, "design": "classic"})
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"

def test_render_cv_invalid():
    yaml_content = """
invalid:
  - yaml
"""
    response = client.post("/api/render", json={"yaml": yaml_content, "design": "classic"})
    assert response.status_code == 400
    data = response.json()
    assert data["error"] == "validation"

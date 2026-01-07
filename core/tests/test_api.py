from fastapi.testclient import TestClient

from src.api.main import app

client = TestClient(app)


class TestHealthEndpoint:
    def test_health(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


class TestProjectsAPI:
    def test_start_project(self):
        response = client.post("/api/projects/start", json={
            "entity_name": "Test Company",
            "entity_type": "company",
        })
        assert response.status_code == 200
        data = response.json()
        assert "project_id" in data
        assert data["entity_name"] == "Test Company"
        assert data["project_id"].startswith("proj-")

    def test_get_project(self):
        start_response = client.post("/api/projects/start", json={
            "entity_name": "Another Company",
        })
        project_id = start_response.json()["project_id"]

        response = client.get(f"/api/projects/{project_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == project_id
        assert data["entity_name"] == "Another Company"
        assert data["status"] == "pending"

    def test_get_nonexistent_project(self):
        response = client.get("/api/projects/proj-nonexistent")
        assert response.status_code == 404

    def test_start_with_custom_tools(self):
        response = client.post("/api/projects/start", json={
            "entity_name": "Custom Tools Test",
            "tools": ["sanctions", "pep_check"],
        })
        assert response.status_code == 200
        data = response.json()
        assert data["tools"] == ["sanctions", "pep_check"]

def test_login_success(client):
    r = client.post("/auth/login", json={"username": "admin", "password": "admin"})
    assert r.status_code == 200
    assert r.json()["token_type"] == "bearer"
    assert r.json()["access_token"]


def test_login_bad_credentials_401(client):
    r = client.post("/auth/login", json={"username": "admin", "password": "wrong"})
    assert r.status_code == 401


def test_delete_without_token_403(client):
    tid = client.post("/tickets", json={"title": "x"}).json()["id"]
    assert client.delete(f"/tickets/{tid}").status_code == 403


def test_delete_with_bad_token_403(client):
    tid = client.post("/tickets", json={"title": "x"}).json()["id"]
    r = client.delete(f"/tickets/{tid}", headers={"Authorization": "Bearer not.a.jwt"})
    assert r.status_code == 403


def test_delete_with_admin_token_204(client, admin_headers):
    tid = client.post("/tickets", json={"title": "x"}).json()["id"]
    r = client.delete(f"/tickets/{tid}", headers=admin_headers)
    assert r.status_code == 204
    assert client.get(f"/tickets/{tid}").status_code == 404

def _create(client, title="My ticket", priority="medium"):
    return client.post("/tickets", json={"title": title, "priority": priority})


def test_create_returns_201(client):
    r = _create(client)
    assert r.status_code == 201
    body = r.json()
    assert body["status"] == "new"
    assert body["title"] == "My ticket"


def test_create_invalid_body_422(client):
    r = client.post("/tickets", json={"title": ""})  # empty title
    assert r.status_code == 422


def test_get_missing_404(client):
    assert client.get("/tickets/12345").status_code == 404


def test_status_change_flow(client):
    tid = _create(client).json()["id"]
    r = client.patch(f"/tickets/{tid}/status", json={"status": "in_progress"})
    assert r.status_code == 200 and r.json()["status"] == "in_progress"
    r = client.patch(f"/tickets/{tid}/status", json={"status": "done"})
    assert r.status_code == 200


def test_change_done_ticket_409(client):
    tid = _create(client).json()["id"]
    client.patch(f"/tickets/{tid}/status", json={"status": "done"})
    # status change on done
    assert client.patch(f"/tickets/{tid}/status", json={"status": "new"}).status_code == 409
    # edit on done
    assert client.patch(f"/tickets/{tid}", json={"title": "x"}).status_code == 409


def test_list_filters_and_pagination(client):
    _create(client, title="alpha bug", priority="low")
    _create(client, title="beta feature", priority="high")
    _create(client, title="gamma bug", priority="medium")

    r = client.get("/tickets", params={"search": "bug"})
    assert r.json()["total"] == 2

    r = client.get("/tickets", params={"priority": "high"})
    assert r.json()["total"] == 1

    r = client.get("/tickets", params={"sort_by": "priority", "order": "desc"})
    assert r.json()["items"][0]["priority"] == "high"

    r = client.get("/tickets", params={"page": 1, "page_size": 2})
    body = r.json()
    assert body["total"] == 3 and len(body["items"]) == 2


def test_invalid_status_value_422(client):
    tid = _create(client).json()["id"]
    assert client.patch(f"/tickets/{tid}/status", json={"status": "bogus"}).status_code == 422

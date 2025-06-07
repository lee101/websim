import os
os.environ.setdefault("DATASTORE_EMULATOR_HOST", "localhost:8787")
os.environ.setdefault("GOOGLE_CLOUD_PROJECT", "test")
import sys
sys.modules['sellerinfo'] = type('obj', (), {'CLAUDE_API_KEY': 'dummy'})

import pytest
from fastapi.testclient import TestClient
from main import app
import r2_client

@pytest.fixture
def app_fixture():
    return TestClient(app)

def test_get_signed_upload_url(monkeypatch, app_fixture):
    def dummy(user_id, filename, expiration=3600):
        return "http://signed-url"
    import uploads
    monkeypatch.setattr(uploads, "generate_presigned_upload_url", dummy)
    res = app_fixture.get('/api/uploads/sign?user_id=abc&filename=test.txt')
    assert res.status_code == 200
    assert res.json()['url'] == 'http://signed-url'

def test_list_uploads(monkeypatch, app_fixture):
    def dummy(user_id):
        return [{"key": f"uploads/{user_id}/test.txt", "size": 1, "last_modified": None}]
    import uploads
    monkeypatch.setattr(uploads, "list_user_objects", dummy)
    res = app_fixture.get('/api/uploads/list?user_id=abc')
    assert res.status_code == 200
    assert res.json()['files'][0]['key'] == 'uploads/abc/test.txt'

def test_delete_upload(monkeypatch, app_fixture):
    import uploads
    monkeypatch.setattr(uploads, 'delete_user_object', lambda u,f: None)
    res = app_fixture.post('/api/uploads/delete?user_id=abc&filename=test.txt')
    assert res.status_code == 200
    assert res.json()['status'] == 'deleted'

def test_rename_upload(monkeypatch, app_fixture):
    import uploads
    monkeypatch.setattr(uploads, 'rename_user_object', lambda u,o,n: None)
    res = app_fixture.post('/api/uploads/rename?user_id=abc&old_name=a.txt&new_name=b.txt')
    assert res.status_code == 200
    assert res.json()['status'] == 'renamed'

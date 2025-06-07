import os
os.environ.setdefault("DATASTORE_EMULATOR_HOST", "localhost:8787")
os.environ.setdefault("GOOGLE_CLOUD_PROJECT", "test")
import sys
sys.modules['sellerinfo'] = type('obj', (), {'CLAUDE_API_KEY': 'dummy'})
from main import app
from fastapi.testclient import TestClient

import pytest

@pytest.fixture
def app_fixture():
    return TestClient(app)


def test_mirror_handler(app_fixture):
    import mirror.ai_wrapper as aiw
    aiw.generate_with_claude = lambda *a, **k: "<body>ok</body>"
    import mirror.mirror as mm
    mm.generate_with_claude = aiw.generate_with_claude
    from models import Fiddle, default_fiddle
    Fiddle.byUrlKey = classmethod(lambda cls, key: default_fiddle)
    from models import CacheKey
    CacheKey.byKey = classmethod(lambda cls, key: None)
    CacheKey.save = classmethod(lambda cls, obj: None)
    mm.MirroredContent.save = staticmethod(lambda key_name, body: None)
    response = app_fixture.get('/cv-qkjf1d/www.google.com')
    assert response.status_code == 200
    assert '<body' in response.text

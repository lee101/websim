from main import app

import pytest
from webtest import TestApp

@pytest.fixture
def app_fixture():
    return TestApp(app)


def test_mirror_handler(app_fixture):
    response = app_fixture.get('/cv-qkjf1d/www.google.com')
    assert response.status_code == 200
    assert '<body' in response.text

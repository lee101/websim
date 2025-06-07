import pytest
import sys
sys.modules['sellerinfo'] = type('obj', (), {'CLAUDE_API_KEY': 'dummy'})
from mirror import ai_wrapper


class DummyResponse:
    def __init__(self):
        self.status_code = 200

    def raise_for_status(self):
        pass

    def json(self):
        return {"content": [{"text": "<body>hi</body>"}]}


generate_with_claude = ai_wrapper.generate_with_claude

def test_generate_with_claude_basic(monkeypatch):
    prompt = """ https://piano.com/playing-piano-online
Working on this, please provide the full comprehensive html for everything i should put in the body tag - everything inlined
Dont describe the html, just give me the full html only
"""
    monkeypatch.setattr(ai_wrapper, "requests", type("obj", (), {"post": lambda *a, **k: DummyResponse()}))
    response = generate_with_claude(prompt)
    assert isinstance(response, str)
    assert len(response) > 0
    print(response)

# def test_generate_with_claude_longer_prompt():
#     prompt = "Explain the process of photosynthesis in plants."
#     response = generate_with_claude(prompt)
#     assert isinstance(response, str)
#     assert len(response) > 100  # Expecting a longer response for this prompt
#     print(response)

# def test_generate_with_claude_error_handling():
#     with pytest.raises(Exception):
#         generate_with_claude("", retries=1)  # Empty prompt should raise an exception

# def test_generate_with_claude_multiple_calls():
#     prompts = [
#         "What is the largest planet in our solar system?",
#         "Who wrote the play 'Romeo and Juliet'?",
#         "What is the chemical symbol for gold?"
#     ]
#     for prompt in prompts:
#         response = generate_with_claude(prompt)
#         assert isinstance(response, str)
#         assert len(response) > 0
#         print(response)

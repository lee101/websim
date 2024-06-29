import pytest
from mirror.ai_wrapper import generate_with_claude

def test_generate_with_claude_basic():
    prompt = """ https://piano.com/playing-piano-online
Working on this, please provide the full comprehensive html for everything i should put in the body tag - everything inlined
Dont describe the html, just give me the full html only
"""
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

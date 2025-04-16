import requests
from sellerinfo import CLAUDE_API_KEY
from loguru import logger

def generate_with_claude(prompt, prefill="", retries=3):
    api_key = CLAUDE_API_KEY
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": api_key,
        "anthropic-version": "2023-06-01",
    }
    messages = [
        {"role": "user", "content": prompt}
    ]

    logger.info(f"Claude in: {prompt}")
    if prefill:
        messages.append({"role": "assistant", "content": prefill})
    data = {
        "messages": messages,
        "max_tokens": 7024,
        "model": "claude-3-7-sonnet-20250219"
    }

    for attempt in range(retries):
        try:
            response = requests.post(url, headers=headers, json=data)
            response.raise_for_status()  # Raises an HTTPError for bad responses
            generated_text = response.json()["content"][0]["text"]
            logger.info(f"Claude Generated text: {generated_text}")
            return generated_text
        except Exception as e:
            logger.error(f"Error calling Claude API (attempt {attempt + 1}/{retries}): {str(e)}")
            if attempt == retries - 1:
                logger.error("Max retries reached. Raising the last exception.")
                raise
    raise Exception("Failed to generate response from Claude after multiple retries")

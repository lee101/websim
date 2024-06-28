import requests
from sellerinfo import CLAUDE_API_KEY
import json
from loguru import logger

def generate_with_claude(prompt, retries=3):
    api_key = CLAUDE_API_KEY
    url = "https://api.anthropic.com/v1/completions"
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": api_key
    }
    data = {
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "max_tokens_to_sample": 1024,
        "model": "claude-3-5-sonnet-20240620"
    }
    
    for attempt in range(retries):
        try:
            response = requests.post(url, headers=headers, json=data)
            response.raise_for_status()  # Raises an HTTPError for bad responses
            return response.json()["completion"]
        except (requests.exceptions.RequestException, json.JSONDecodeError) as e:
            logger.error(f"Error calling Claude API (attempt {attempt + 1}/{retries}): {str(e)}")
            if attempt == retries - 1:
                logger.error("Max retries reached. Raising the last exception.")
                raise
    raise Exception("Failed to generate response from Claude after multiple retries")

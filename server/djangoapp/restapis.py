import os

import requests

DATABASE_URL = os.getenv("DATABASE_SERVICE_URL", "http://127.0.0.1:3030")
SENTIMENT_URL = os.getenv("SENTIMENT_SERVICE_URL", "http://127.0.0.1:5050")


def get_request(url, params=None):
    response = requests.get(url, params=params, timeout=5)
    response.raise_for_status()
    return response.json()


def post_review(url, review):
    response = requests.post(url, json=review, timeout=5)
    response.raise_for_status()
    return response.json()


def analyze_review_sentiments(text):
    response = requests.get(f"{SENTIMENT_URL}/analyze/{requests.utils.quote(text, safe='')}", timeout=5)
    response.raise_for_status()
    return response.json()

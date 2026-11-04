from flask import Flask, jsonify
from nltk.sentiment import SentimentIntensityAnalyzer

app = Flask(__name__)
analyzer = SentimentIntensityAnalyzer()


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/analyze/<path:text>")
def analyze(text):
    score = analyzer.polarity_scores(text)["compound"]
    sentiment = "positive" if score >= 0.05 else "negative" if score <= -0.05 else "neutral"
    return jsonify({"sentiment": sentiment})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050)

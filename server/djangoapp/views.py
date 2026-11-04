import json

import requests
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from . import restapis
from .models import CarModel


def _payload(request):
    if request.content_type == "application/json":
        try:
            return json.loads(request.body or b"{}")
        except json.JSONDecodeError:
            return None
    return request.POST


@csrf_exempt
@require_POST
def login_user(request):
    data = _payload(request)
    if not data:
        return JsonResponse({"user": None, "error": "Invalid request body"}, status=400)
    user = authenticate(request, username=data.get("username"), password=data.get("password"))
    if user is None:
        return JsonResponse({"user": None, "error": "Invalid credentials"}, status=401)
    login(request, user)
    return JsonResponse({"user": {"username": user.username, "email": user.email}})


@csrf_exempt
@require_POST
def logout_request(request):
    logout(request)
    return JsonResponse({"message": "Logged out"})


@csrf_exempt
@require_POST
def registration(request):
    data = _payload(request)
    if not data:
        return JsonResponse({"error": "Invalid request body"}, status=400)
    username = data.get("username", "").strip()
    password = data.get("password", "")
    email = data.get("email", "").strip()
    if not username or not password or not email:
        return JsonResponse({"error": "Username, email, and password are required"}, status=400)
    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "Username already exists"}, status=409)
    user = User.objects.create_user(
        username=username,
        password=password,
        email=email,
        first_name=data.get("firstName", ""),
        last_name=data.get("lastName", ""),
    )
    return JsonResponse({"user": {"username": user.username, "email": user.email}}, status=201)


@require_GET
def get_dealers(request, state=None):
    endpoint = f"{restapis.DATABASE_URL}/fetchDealers"
    if state:
        endpoint = f"{endpoint}/{requests.utils.quote(state, safe='')}"
    try:
        return JsonResponse(restapis.get_request(endpoint), safe=False)
    except requests.RequestException:
        return JsonResponse({"error": "Dealer service unavailable"}, status=503)


@require_GET
def get_dealer_details(request, dealer_id):
    try:
        return JsonResponse(restapis.get_request(f"{restapis.DATABASE_URL}/fetchDealer/{dealer_id}"))
    except requests.RequestException:
        return JsonResponse({"error": "Dealer service unavailable"}, status=503)


@require_GET
def get_dealer_reviews(request, dealer_id):
    try:
        return JsonResponse(
            restapis.get_request(f"{restapis.DATABASE_URL}/fetchReviews/dealer/{dealer_id}"), safe=False
        )
    except requests.RequestException:
        return JsonResponse({"error": "Review service unavailable"}, status=503)


@csrf_exempt
@require_POST
def add_review(request):
    data = _payload(request)
    if not data:
        return JsonResponse({"error": "Invalid request body"}, status=400)
    try:
        return JsonResponse(restapis.post_review(f"{restapis.DATABASE_URL}/insert_review", data), status=201)
    except requests.RequestException:
        return JsonResponse({"error": "Review service unavailable"}, status=503)


@require_GET
def get_cars(request):
    cars = CarModel.objects.select_related("car_make").all()
    return JsonResponse({"Cars": [
        {"CarModel": car.name, "CarMake": car.car_make.name} for car in cars
    ]})


@require_GET
def analyze_review_sentiments(request, text):
    try:
        return JsonResponse(restapis.analyze_review_sentiments(text))
    except requests.RequestException:
        return JsonResponse({"error": "Sentiment service unavailable"}, status=503)

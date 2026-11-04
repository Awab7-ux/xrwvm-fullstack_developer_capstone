from django.urls import path

from . import views

urlpatterns = [
    path("login", views.login_user, name="login"),
    path("logout", views.logout_request, name="logout"),
    path("register", views.registration, name="register"),
    path("get_dealers", views.get_dealers, name="get_dealers"),
    path("get_dealers/<str:state>", views.get_dealers, name="get_dealers_by_state"),
    path("dealer/<int:dealer_id>", views.get_dealer_details, name="dealer_details"),
    path("reviews/dealer/<int:dealer_id>", views.get_dealer_reviews, name="dealer_reviews"),
    path("add_review", views.add_review, name="add_review"),
    path("get_cars", views.get_cars, name="get_cars"),
    path("analyze/<str:text>", views.analyze_review_sentiments, name="analyze"),
]

from django.contrib import admin
from django.urls import include, path

from djangoapp import views

urlpatterns = [
    path("", views.home, name="home"),
    path("dealer/<int:dealer_id>", views.dealer_page, name="dealer_page"),
    path("postreview/<int:dealer_id>", views.post_review_page, name="post_review_page"),
    path("admin/", admin.site.urls),
    path("djangoapp/", include("djangoapp.urls")),
]

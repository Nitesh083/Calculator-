# backend/core/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('simulate', views.simulate),
    path('scenarios', views.scenarios),
    path('scenarios/<int:scenario_id>', views.scenarios),
    path('report/generate', views.generate_report),
]
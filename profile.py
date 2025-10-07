# backend/backend/urls.py (The project-level file)
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # THIS LINE CONNECTS YOUR API:
    path('api/', include('core.urls')), 
]
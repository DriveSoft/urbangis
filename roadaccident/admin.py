from django.contrib import admin
from .models import *

admin.site.register(City)
admin.site.register(Maneuver)
admin.site.register(Accident)
admin.site.register(TypeViolation)
admin.site.register(Violator)


from django.contrib import admin
from .models import *

admin.site.register(City)
admin.site.register(Tree)
admin.site.register(Inspection)

admin.site.register(Species)
admin.site.register(PlaceType)
admin.site.register(IrrigationMethod)
admin.site.register(Status)
admin.site.register(CareType)
admin.site.register(CareActivity)
admin.site.register(Remark)
admin.site.register(TypeSpec)
admin.site.register(GroupSpec)
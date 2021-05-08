from django import forms
from .models import Accident
from django.core.exceptions import ValidationError

class AccidentForm(forms.ModelForm):
    class Meta:
        model = Accident
        fields = ['latitude', 'longitude', 'description', 'datetime',
                  'red_light_running', 'priority_traffic_sign', 'lost_control_vehicle', 'alcohol_or_drug',
                  'maneuver',
                  'driver_violation', 'motorcyclist_violation', 'cyclist_violation', 'pedestrian_violation',
                  'drivers_injured', 'motorcyclists_injured', 'cyclists_injured', 'ped_injured', 'kids_injured', 'pubtr_passengers_injured',
                  'drivers_killed', 'motorcyclists_killed', 'cyclists_killed', 'ped_killed', 'kids_killed', 'pubtr_passengers_killed',
                  'puplic_transport_involved',
                  ]


        #widgets = {
        #    'city': forms.TextInput(attrs={'class': 'form-control'}),
        #    'latitude': forms.TextInput(attrs={'class': 'form-control'}),
        #}


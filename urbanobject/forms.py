from django import forms
from .models import urbanObject
from django.core.exceptions import ValidationError

class urbanObjectForm(forms.ModelForm):
    class Meta:
        model = urbanObject
        fields = ['latitude', 'longitude', 'category', 'subcategories', 'description', 'comment', 'googlestreeturl', 'rating', 'photo1', 'photo2', 'photo3']
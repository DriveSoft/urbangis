from django import forms
from .models import Tree, Inspection, CareActivity
from django.core.exceptions import ValidationError

class TreeFormNew(forms.ModelForm):
    class Meta:
        model = Tree
        fields = ['latitude', 'longitude', 'species', 'speciescomment', 'comment', 'placetype', 'irrigationmethod',
                  'dateplanted', 'googlestreeturl']




class IncpectionFormNew(forms.ModelForm):
    class Meta:
        model = Inspection
        fields = ['height', 'crowndiameter', 'trunkgirth', 'remarks',
                  'status', 'recommendations', 'comment', 'photo1', 'photo2', 'photo3']




class ActionFormNew(forms.ModelForm):
    class Meta:
        model = CareActivity
        fields = ['date', 'comment', 'executor', 'actions']




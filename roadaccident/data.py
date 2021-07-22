import json
from datetime import datetime
from django.conf import settings as djangoSettings
import os
from django.http import HttpResponse
from .models import *


# первоначальный импорт в базу из прошлого проекта
def import_ptp(request, city_name):


  with open(os.path.join(djangoSettings.BASE_DIR, 'data_ptp2.json'), encoding="utf8") as f:
    data = json.load(f)

    for item in data:
      lng = item["geometry"]["coordinates"][0]
      lat = item["geometry"]["coordinates"][1]
      lat = round(lat, 5)
      lng = round(lng, 5)

      date_time_obj = datetime.strptime(item["properties"]["DateTime"], '%Y-%m-%dT%H:%M:%S')

      maneuver = 1
      if item["properties"]["carTurnRight"] == 1:
        maneuver = 2
      if item["properties"]["carTurnLeft"] == 1:
        maneuver = 3

      drivers_injured = 0
      motorcyclists_injured=0
      cyclists_injured=0
      ped_injured = 0
      kids_injured = 0
      pubtr_passengers_injured = 0

      drivers_killed = 0
      motorcyclists_killed = 0
      cyclists_killed = 0
      ped_killed = 0
      kids_killed = 0
      pubtr_passengers_killed = 0

      if item["properties"]["ptptype"] == "car" and item["properties"]["danger"]==0:
        drivers_injured = 1
      if item["properties"]["ptptype"] == "pedestrian" and item["properties"]["danger"]==0 and item["properties"]["pedKid"] == 0:
        ped_injured = 1
      if item["properties"]["ptptype"] == "bicycle" and item["properties"]["danger"]==0:
        cyclists_injured = 1
      if item["properties"]["ptptype"] == "motorcycle" and item["properties"]["danger"]==0:
        motorcyclists_injured = 1

      if item["properties"]["pedKid"] == 1 and item["properties"]["danger"]==0:
        kids_injured = 1
      if item["properties"]["pedKid"] == 1 and item["properties"]["danger"]==1:
        kids_killed = 1


      if item["properties"]["ptptype"] == "car" and item["properties"]["danger"]==1:
        drivers_killed = 1
      if item["properties"]["ptptype"] == "pedestrian" and item["properties"]["danger"]==1:
        ped_killed = 1
      if item["properties"]["ptptype"] == "bicycle" and item["properties"]["danger"]==1:
        cyclists_killed = 1
      if item["properties"]["ptptype"] == "motorcycle" and item["properties"]["danger"]==1:
        motorcyclists_killed = 1




      acc_obj = Accident(city_id=1, latitude=lat, longitude=lng, datetime=date_time_obj, maneuver_id=maneuver,
                         description=item["properties"]["description"],
                         drivers_injured=drivers_injured, motorcyclists_injured=motorcyclists_injured, cyclists_injured=cyclists_injured, ped_injured=ped_injured, kids_injured=kids_injured, pubtr_passengers_injured=pubtr_passengers_injured,
                         drivers_killed=drivers_killed, motorcyclists_killed=motorcyclists_killed, cyclists_killed=cyclists_killed, ped_killed=ped_killed, kids_killed=kids_killed, pubtr_passengers_killed=pubtr_passengers_killed,
                         useradded_id=1)


      acc_obj.save()

      # violations_type: 1 - Red light running, 2 - Priority traffic sign, 3 - Lost control vehicle, 4- Alcohol or drug
      # viilators: 1- Driver, 2- Motorcyclist, 3- Cyclist, 4- Pedestrian
      if item["properties"]["carRedSignal"] == 1:
        acc_obj.violations_type.add(1)
        acc_obj.violators.add(1)

      if item["properties"]["pedRedSignal"] == 1:
        acc_obj.violations_type.add(1)
        acc_obj.violators.add(4)

      if item["properties"]["pedWrongCross"] == 1:
        acc_obj.violators.add(4)

      if item["properties"]["pedRedSignal"] == 0 and item["properties"]["pedWrongCross"] == 0:
        acc_obj.violators.add(1)



  return HttpResponse("done")





def DeleteAllPtp(request, city_name):
  Accident.objects.all().delete()
  return HttpResponse("done")



      #sDate = item["properties"]["DateTime"]
      #sDate = sDate[6:10] + '-' + sDate[3:5] +'-'+ sDate[0:2] + 'T' + sDate[11:16]+':00'
      #item["properties"]["DateTime"] = sDate




    #with open('data_ptp2.json', 'w', encoding="utf-8") as json_file:
    #  json.dump(data, json_file, ensure_ascii=False)



'''    
{
"type": "Feature",
 
"geometry": 
  {"type": "Point", "coordinates": [27.89719, 43.230751]},
   
"properties": 
  {"id": 1662, "city": 1, "DateTime": "2019-05-21T15:30:00", "ptptype": "car", "carRedSignal": 1, "carTurnLeft": 0, "carTurnRight": 0, "pedRedSignal": 0, "pedWrongCross": 0, "pedKid": 0, "danger": 0, "year": 2019, "month": 5, "hours": 15, "description": "На 21.05.2019.г., около 15:30 часа, в гр. Варна, на кръстовището на бул. «Цар Освободител» и ул. «Поп Димитър», е възникнал инцидент. Водачката на л.а. «Тойота» С.И. (47 г.), местен жител, по време на движение, преминава на червен забранителен сигнал на светофарната уредба, не пропуска и блъска л.а. «Мерцедес», който прави ляв завой. Вследствие на инцидента жената получава контузни наранявания, прегледана е и освободена за домашно лечение, няма опасност за живота й. "}

},


"ptptype": "car"
"ptptype": "pedestrian"   >   ped_injured = 1
"ptptype": "bicycle"      >   cyclists_injured = 1
"ptptype": "motorcycle"   >   motorcyclists_injured = 1

violators = models.ManyToManyField('Violator')  Driver, Motorcyclist, Cyclist, Pedestrian
делаем во всех записях нарушителя Driver


pedKid    kids_injured = 1


по умолчанию maneuver = ahead
"carTurnLeft":    maneuver = left 
"carTurnRight":   maneuver = right  


"carRedSignal":   violations_type = Red light running  
"pedRedSignal":   violators = Pedestrian
"pedWrongCross":  violators = Pedestrian



maneuver = models.ForeignKey(Maneuver) # right, left, ahead, backward



violations_type = models.ManyToManyField('TypeViolation')  #Red light running, Priority traffic sign, Lost control vehicle, Alcohol or drug




    drivers_injured = models.PositiveSmallIntegerField(default=0)
    motorcyclists_injured = models.PositiveSmallIntegerField(default=0)
    cyclists_injured = models.PositiveSmallIntegerField(default=0)
    ped_injured = models.PositiveSmallIntegerField(default=0)
    kids_injured = models.PositiveSmallIntegerField(default=0)
    pubtr_passengers_injured = models.PositiveSmallIntegerField(default=0)

    drivers_killed = models.PositiveSmallIntegerField(default=0)
    motorcyclists_killed = models.PositiveSmallIntegerField(default=0)
    cyclists_killed = models.PositiveSmallIntegerField(default=0)
    ped_killed = models.PositiveSmallIntegerField(default=0)
    kids_killed = models.PositiveSmallIntegerField(default=0)
    pubtr_passengers_killed = models.PositiveSmallIntegerField(default=0)





'''
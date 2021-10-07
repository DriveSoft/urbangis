#from rest_framework import serializers
from roadaccident.models import Accident

#class AccidentSerializer(serializers.ModelSerializer):
#    class Meta:
#        model = Accident
#        fields = '__all__'


def citydataToGeoJson(obj_city):

    accident_data = Accident.objects.filter(city_id=obj_city.id).filter(is_deleted=False)
                                                                #.values_list('id', 'latitude', 'longitude', 'datetime',
                                                                #     'maneuver_id', 'description', 'violations_type', 'violators',
                                                                #     'drivers_injured', 'motorcyclists_injured', 'cyclists_injured', 'ped_injured', 'kids_injured', 'pubtr_passengers_injured',
                                                                #     'drivers_killed', 'motorcyclists_killed', 'cyclists_killed', 'ped_killed', 'kids_killed', 'pubtr_passengers_killed',
                                                                #     'public_transport_involved'
                                                                #     , named=True)


    accidentJsonData = {
        "type": "FeatureCollection",
        "features": []  # сюда будем добавлять данные
    }

    if accident_data:
        for accidentItem in accident_data:

            if accidentItem.datetime:
                datetime = accidentItem.datetime.strftime("%Y-%m-%dT%H:%M")
            else:
                datetime = ""

            if accidentItem.description:
                description = accidentItem.description
            else:
                description = ""

            violations_type = []
            if accidentItem.violations_type:
                violations_type_Q = accidentItem.violations_type.values_list('id', flat=True)
                for item in violations_type_Q:
                    violations_type.append(str(item))

            violators = []
            if accidentItem.violators:
                violators_Q = accidentItem.violators.values_list('id', flat=True)
                for item in violators_Q:
                    violators.append(str(item))



            accidentJson = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [str(accidentItem.longitude), str(accidentItem.latitude)]
                },

                "properties": {
                    "coordinates": [str(accidentItem.longitude), str(accidentItem.latitude)],
                    "id": accidentItem.id,
                    "user_id": accidentItem.useradded_id,
                    "datetime": datetime,
                    "maneuver": accidentItem.maneuver_id,
                    "description": description,
                    "violations_type": violations_type,
                    "violators": violators,
                    "drivers_injured": accidentItem.drivers_injured,
                    "motorcyclists_injured": accidentItem.motorcyclists_injured,
                    "cyclists_injured": accidentItem.cyclists_injured,
                    "ped_injured": accidentItem.ped_injured,
                    "kids_injured": accidentItem.kids_injured,
                    "pubtr_passengers_injured": accidentItem.pubtr_passengers_injured,
                    "drivers_killed": accidentItem.drivers_killed,
                    "motorcyclists_killed": accidentItem.motorcyclists_killed,
                    "cyclists_killed": accidentItem.cyclists_killed,
                    "ped_killed": accidentItem.ped_killed,
                    "kids_killed": accidentItem.kids_killed,
                    "pubtr_passengers_killed": accidentItem.pubtr_passengers_killed,
                    "public_transport_involved": accidentItem.public_transport_involved

                }
            }


            # print(treeJson)
            # print(str(treeItem.lastinsp_recommendations_list).split(', '))
            accidentJsonData["features"].append(accidentJson)


    return accidentJsonData
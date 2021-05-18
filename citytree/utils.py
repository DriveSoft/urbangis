from django.core.serializers import serialize
import json

def serialize_bootstraptable(queryset, fields):
    json_data = serialize('json', queryset, fields=fields)
    json_final = {"total": queryset.count(), "rows": []}
    data = json.loads(json_data)
    for item in data:
        del item["model"]
        item["fields"].update({"id": item["pk"]})
        item = item["fields"]
        json_final['rows'].append(item)
    return json_final



def serialize_bootstraptable2(queryset, queryset2, fields1, fields2):
    qCount1 = 0
    qCount2 = 0
    json_data1 = None
    json_data2 = None

    if queryset is not None:
        json_data1 = serialize('json', queryset,)# fields=fields1
        qCount1 = queryset.count()

    if queryset2 is not None:
        json_data2 = serialize('json', queryset2,)# fields=fields2
        qCount2 = queryset2.count()

    json_final = {"total": qCount1 + qCount2, "rows": []}

    if json_data1 is not None:
        data1 = json.loads(json_data1)
        for item in data1:
            del item["model"]
            item["fields"].update({"id": item["pk"]})
            item["fields"].update({"type": "Inspection"})
            item = item["fields"]
            json_final['rows'].append(item)

    if json_data2 is not None:
        data2 = json.loads(json_data2)
        for item in data2:
            del item["model"]
            item["fields"].update({"id": item["pk"]})
            item["fields"].update({"type": "Action"})
            item = item["fields"]
            item["datetime"] = item.pop("date")
            json_final['rows'].append(item)

    #print(json_final)
    return json_final
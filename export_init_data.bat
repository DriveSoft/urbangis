python manage.py dumpdata --natural-foreign auth.group > 001auth.group.json
python manage.py dumpdata citytree.PlaceType citytree.IrrigationMethod citytree.Status citytree.CareType citytree.Remark citytree.groupspec citytree.typespec -o 002dict.json
python manage.py dumpdata citytree.species -o 003species.json
python manage.py dumpdata coregis.corecity -o 004city.json
python manage.py dumpdata roadaccident.Maneuver roadaccident.TypeViolation roadaccident.Violator -o 005roaddict.json
python manage.py dumpdata coregis.coreCatObject coregis.coreSubcatObject urbanobject.RadiusTransportMode -o 006urbanobjectdict.json




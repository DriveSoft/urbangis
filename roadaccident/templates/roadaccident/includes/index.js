{% load static %}

var HeatMapData = {
  max: 12,
  data: [
    {% if accident_data %}
        {% for accident in accident_data %}
            {lat: {{accident.latitude}}, lng: {{accident.longitude}}, count: 1},
        {% endfor %}
    {% endif %}
  ]
};




var cfg = {
  // radius should be small ONLY if scaleRadius is true (or small radius is intended)
  // if scaleRadius is false it will be the constant radius used in pixels
  "radius": 30,
  "maxOpacity": 1,
  // scales the radius based on map zoom
  "scaleRadius": false,
  // if set to false the heatmap uses the global maximum for colorization
  // if activated: uses the data maximum within the current map boundaries
  //   (there will always be a red spot with useLocalExtremas true)
  "useLocalExtrema": false,
  // which field name in your data represents the latitude - default "lat"
  latField: 'lat',
  // which field name in your data represents the longitude - default "lng"
  lngField: 'lng',
  // which field name in your data represents the data value - default "value"
  valueField: 'count',

  gradient: {
    // enter n keys between 0 and 1 here
    // for gradient color customization
    //'.5': 'blue',
    //'.8': 'red',
    //'.95': 'white'

    '.5': '#1E90FF',//5  7
    '.8': 'white',  //8  9
    '.95': 'red'    //95 99
  }
};


var heatmapLayer = new HeatmapOverlay(cfg);

//var map = new L.Map('map-canvas', {
//  center: new L.LatLng(25.6586, -80.3568),
//  zoom: 4,
//  layers: [baseLayer, heatmapLayer]
//});

heatmapLayer.setData(HeatMapData);








var mymap = L.map('mapid', { zoomControl: false }).setView(
    [
        {% if lat %}
            {{ lat }}
        {% else %}
            {{ obj_city.latitude }}
        {% endif %}
        ,
        {% if lng %}
            {{ lng }}
        {% else %}
            {{ obj_city.longitude }}
        {% endif %}

    ], {% if lat %} 17 {% else %} {{ obj_city.zoom }} {% endif %});



var tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 21,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZHJpdmVzb2Z0IiwiYSI6ImNqY3hkMzAwNTAwM2IzM28zajFoeG1pamYifQ.w5UaGnR0OMDIa6ARiyWoYQ'
}).addTo(mymap);

var tilesDark = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 21,
    id: 'mapbox/dark-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZHJpdmVzb2Z0IiwiYSI6ImNqY3hkMzAwNTAwM2IzM28zajFoeG1pamYifQ.w5UaGnR0OMDIa6ARiyWoYQ'
});//.addTo(mymap);









L.control.zoom({
    position: 'topright'
}).addTo(mymap);



//mymap.addLayer(heatmapLayer);

var baseMaps = {
    "Default": tiles,
    "Dark": tilesDark
};

var overlayMaps = {
    "Heatmap": heatmapLayer
};

L.control.layers(baseMaps, overlayMaps, {position: 'bottomleft'}).addTo(mymap);





// create a geoJson data from database
var accidentData = {
  "type": "FeatureCollection",
  "features": [

{% if accident_data %}
    {% for accident in accident_data %}
        {
            "type": "Feature",
            "properties": {
                "coordinates": [{{accident.longitude}}, {{accident.latitude}}], // сохраняем координаты в properties, т.к. в geometry они почему то меняются из за того, видимо из за того, что маркеры смещаются когда кластер раскрывается
                "id": {{accident.id}},
                "city": {{ accident.city_id }},
                "datetime": "{{accident.datetime|date:"Y-m-d\TH:i"}}",
                "description": "{{ accident.description|linebreaksbr }}",
                "maneuver": {% if not accident.maneuver_id %} 0 {% else %} {{ accident.maneuver_id }} {% endif %},
                "red_light_running": {{ accident.red_light_running|yesno:"1,0" }},
                "priority_traffic_sign": {{ accident.priority_traffic_sign|yesno:"1,0" }},
                "lost_control_vehicle": {{ accident.lost_control_vehicle|yesno:"1,0" }},
                "alcohol_or_drug": {{ accident.alcohol_or_drug|yesno:"1,0" }},
                "driver_violation": {{ accident.driver_violation|yesno:"1,0" }},
                "motorcyclist_violation": {{ accident.motorcyclist_violation|yesno:"1,0" }},
                "cyclist_violation": {{ accident.cyclist_violation|yesno:"1,0" }},
                "pedestrian_violation": {{ accident.pedestrian_violation|yesno:"1,0" }},
                "drivers_injured": {{ accident.drivers_injured }},
                "motorcyclists_injured": {{ accident.motorcyclists_injured }},
                "cyclists_injured": {{ accident.cyclists_injured }},
                "ped_injured": {{ accident.ped_injured }},
                "kids_injured": {{ accident.kids_injured }},
                "pubtr_passengers_injured": {{ accident.pubtr_passengers_injured }},
                "drivers_killed": {{ accident.drivers_killed }},
                "motorcyclists_killed": {{ accident.motorcyclists_killed }},
                "cyclists_killed": {{ accident.cyclists_killed }},
                "ped_killed": {{ accident.ped_killed }},
                "kids_killed": {{ accident.kids_killed}},
                "pubtr_passengers_killed": {{ accident.pubtr_passengers_killed }},
                "puplic_transport_involved": {{ accident.puplic_transport_involved|yesno:"1,0" }},
            },
            "geometry": {
                "type": "Point",
                "coordinates": [{{accident.longitude}}, {{accident.latitude}}]
            }
        },
    {% endfor %}
{% endif %}

]};





var geojsonMarkerOptions = {
    radius: 6, //6
    fillColor: "#402000",//"#ff7800",
    color: "#000",
    weight: 0, //2  сильно тормозит на мобильной версии если weight > 0
    opacity: 0.5,//0.7
    fillOpacity: 0.6//0.2
};



// loads geoJSON and finds max and min dates in geoJson to use it on filter form
var datefilter_Min = '2100-01-01';
var datefilter_Max = '1970-01-01';

// create circleMarker from geoJson
var markers = L.geoJSON(accidentData, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions).on('click', markerOnClick);//.addTo(mymap);
    },

    filter: function(feature, layer) {
        if (feature.properties.datetime > datefilter_Max ) { datefilter_Max = feature.properties.datetime }
        if (feature.properties.datetime < datefilter_Min ) { datefilter_Min = feature.properties.datetime }
        return true;
    }
});//.addTo(mymap);

document.getElementById("dateFrom").value = formatDate(datefilter_Min);
document.getElementById("dateTo").value = formatDate(datefilter_Max);





// create clusters from circleMarkers
var markersCluster = L.markerClusterGroup({
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    maxClusterRadius: 15, // default 80

    iconCreateFunction: function (cluster) {
      // get the number of items in the cluster
      var count = cluster.getChildCount();

      // figure out how many digits long the number is
      //var digits = (count + '').length;
      var digits;
      if (count == 2) { digits = '1'; }
      if (count >= 3 && count <=5) { digits = '2'; }
      if (count >= 6 && count <=9) { digits = '3'; }
      if (count >= 10 && count <=14) { digits = '4'; }
      if (count > 14) { digits = '5'; }

      return L.divIcon({
        html: count,
        className: 'cluster digits-' + digits,
        iconSize: null
      });
    },
});


markersCluster.addLayer(markers);

{% if hide_cluster_zoomout %}
    ZoomChangeCluster();
{% else %}
    mymap.addLayer(markersCluster);
{% endif %}

//mymap.fitBounds(markers.getBounds());





// create button to create a new marker
var but_newmarker = L.easyButton({
    position: 'topright',
    states:[
        {
            stateName: 'off',
            icon: '<i class="fas fa-map-marker-alt fa-lg"></i>',
            onClick: function(control){
                control.state('on');
                but_newmarker.button.style.backgroundColor = 'red';
                //document.getElementById('wrapper').classList.remove("toggled");
                //$('#myTab a[href="#accident"]').tab('show') // Select tab by name
                $('.leaflet-container').css('cursor','crosshair');


                mymap.removeLayer(markersCluster);
                mymap.addLayer(markers);


                document.getElementById("accidentId").value = '';
                document.getElementById("latitude").value = '';
                document.getElementById("longitude").value = '';
                document.getElementById("datetime").value = '';
                document.getElementById("description").value = '';
                document.getElementById("maneuver").value = 0;

                document.getElementById("red_light_running").checked = false;
                document.getElementById("priority_traffic_sign").checked = false;
                document.getElementById("lost_control_vehicle").checked = false;
                document.getElementById("alcohol_or_drug").checked = false;

                document.getElementById("driver_violation").checked = false;
                document.getElementById("motorcyclist_violation").checked = false;
                document.getElementById("cyclist_violation").checked = false;
                document.getElementById("pedestrian_violation").checked = false;

                document.getElementById("drivers_injured").value = 0;
                document.getElementById("motorcyclists_injured").value = 0;
                document.getElementById("cyclists_injured").value = 0;
                document.getElementById("ped_injured").value = 0;
                document.getElementById("kids_injured").value = 0;
                document.getElementById("pubtr_passengers_injured").value = 0;

                document.getElementById("drivers_killed").value = 0;
                document.getElementById("motorcyclists_killed").value = 0;
                document.getElementById("cyclists_killed").value = 0;
                document.getElementById("ped_killed").value = 0;
                document.getElementById("kids_killed").value = 0;
                document.getElementById("pubtr_passengers_killed").value = 0;
                document.getElementById("puplic_transport_involved").checked = 0;
                $('#deleteButton').prop('disabled',true);

            }
        },

        {
            stateName: 'on',
            icon: '<i class="fas fa-map-marker-alt fa-lg"></i>',
            onClick: function(control){
                control.state('off');
                but_newmarker.button.style.backgroundColor = 'white';
                $('.leaflet-container').css('cursor','');

                mymap.removeLayer(markers);
                {% if hide_cluster_zoomout %}
                    ZoomChangeCluster();
                {% else %}
                    mymap.addLayer(markersCluster);
                {% endif %}

            }
        }]
});

but_newmarker.addTo(mymap);




// create button to create a new marker
var but_heatmap = L.easyButton({
    position: 'topright',
    states:[
        {
            stateName: 'off',
            icon: '<span style="">H</span>',
            onClick: function(control){
                control.state('on');
                but_heatmap.button.style.backgroundColor = 'red';

                mymap.removeLayer(markersCluster);
                mymap.removeLayer(markers);
                if (!mymap.hasLayer(tilesDark)) { tilesDark.addTo(mymap) } else { tilesDark.bringToFront(); }
                mymap.addLayer(heatmapLayer);

            }
        },

        {
            stateName: 'on',
            icon: '<span class="star">H</span>',
            onClick: function(control){
                control.state('off');
                but_heatmap.button.style.backgroundColor = 'white';

                mymap.removeLayer(heatmapLayer);
                tiles.bringToFront();

                {% if hide_cluster_zoomout %}
                    ZoomChangeCluster();
                {% else %}
                    mymap.addLayer(markersCluster);
                {% endif %}

            }
        }]
});

but_heatmap.addTo(mymap);





//==== EVENTS ==========================================================================================================
heatmapLayer.on('add',(e)=>{
  mymap.removeLayer(markersCluster);
  mymap.removeLayer(markers);
  //mymap.addLayer(markers);
});

heatmapLayer.on('remove',(e)=>{

    {% if hide_cluster_zoomout %}
        ZoomChangeCluster();
    {% else %}
        mymap.addLayer(markersCluster);
    {% endif %}

  //mymap.removeLayer(markers);
  //mymap.addLayer(markersCluster);
});


//var markerCircle = new L.circleMarker(); // global variable to able to remove previous marker
var newMarker = new L.marker()
var redIcon = new L.Icon({ // https://github.com/pointhi/leaflet-color-markers
  iconUrl: '{% static 'icons/marker-red.png' %}',
  shadowUrl: '{% static 'icons/marker-shadow.png' %}',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});



// to create a new marker
function onMapClick(e) {

    if (but_newmarker.state() == 'on')
    {
        $('#tabAccident').show();
        $("#saveButton").html('Save');
        $('#myTab a[href="#accident"]').tab('show') // Select tab by name
        OpenSidebar();
        //sleep(500);
        //mymap.panTo(e.latlng);


        // delete previous marker if exists
        //mymap.removeLayer(markerCircle)

        //markerCircle = new L.circleMarker(e.latlng, {
        //    color: 'black',
        //    fillColor: 'black',
        //    fillOpacity: 1,
        //    radius: 5
        //}).addTo(mymap);

        // delete previous marker if exists
        mymap.removeLayer(newMarker)
        newMarker = new L.marker(e.latlng, {icon: redIcon, draggable:'true'}).addTo(mymap);

        newMarker.on('dragend', function (e) {
            document.getElementById('latitude').value = newMarker.getLatLng().lat.toFixed(5);
            document.getElementById('longitude').value = newMarker.getLatLng().lng.toFixed(5);
        });




        document.getElementById("accidentId").value = '';
        document.getElementById("latitude").value = e.latlng.lat.toFixed(5);
        document.getElementById("longitude").value = e.latlng.lng.toFixed(5);
        document.getElementById("datetime").value = '';
        document.getElementById("description").value = '';
        document.getElementById("maneuver").value = 0;

        document.getElementById("red_light_running").checked = false;
        document.getElementById("priority_traffic_sign").checked = false;
        document.getElementById("lost_control_vehicle").checked = false;
        document.getElementById("alcohol_or_drug").checked = false;

        document.getElementById("driver_violation").checked = false;
        document.getElementById("motorcyclist_violation").checked = false;
        document.getElementById("cyclist_violation").checked = false;
        document.getElementById("pedestrian_violation").checked = false;

        document.getElementById("drivers_injured").value = 0;
        document.getElementById("motorcyclists_injured").value = 0;
        document.getElementById("cyclists_injured").value = 0;
        document.getElementById("ped_injured").value = 0;
        document.getElementById("kids_injured").value = 0;
        document.getElementById("pubtr_passengers_injured").value = 0;

        document.getElementById("drivers_killed").value = 0;
        document.getElementById("motorcyclists_killed").value = 0;
        document.getElementById("cyclists_killed").value = 0;
        document.getElementById("ped_killed").value = 0;
        document.getElementById("kids_killed").value = 0;
        document.getElementById("pubtr_passengers_killed").value = 0;
        document.getElementById("puplic_transport_involved").checked = 0;


        but_newmarker.state('off');
        but_newmarker.button.style.backgroundColor = 'white';
        $('.leaflet-container').css('cursor','');
    }
}





function markerOnClick(e)
{
  let marker = e.target;
  let geojson = marker.toGeoJSON();



  // читаем координаты в properties, т.к. в geometry они почему то меняются из за того, видимо из за того, что маркеры смещаются когда кластер раскрывается
  document.getElementById("latitude").value = geojson.properties.coordinates[1];
  document.getElementById("longitude").value = geojson.properties.coordinates[0];

  document.getElementById("datetime").value = geojson.properties.datetime;
  document.getElementById("description").value = geojson.properties.description.replace(/<br\s*[\/]?>/gi, "\n");
  document.getElementById("maneuver").value = geojson.properties.maneuver;

  document.getElementById("red_light_running").checked = geojson.properties.red_light_running;
  document.getElementById("priority_traffic_sign").checked = geojson.properties.priority_traffic_sign;
  document.getElementById("lost_control_vehicle").checked = geojson.properties.lost_control_vehicle;
  document.getElementById("alcohol_or_drug").checked = geojson.properties.alcohol_or_drug;

  document.getElementById("driver_violation").checked = geojson.properties.driver_violation;
  document.getElementById("motorcyclist_violation").checked = geojson.properties.motorcyclist_violation;
  document.getElementById("cyclist_violation").checked = geojson.properties.cyclist_violation;
  document.getElementById("pedestrian_violation").checked = geojson.properties.pedestrian_violation;

  document.getElementById("drivers_injured").value = geojson.properties.drivers_injured;
  document.getElementById("motorcyclists_injured").value = geojson.properties.motorcyclists_injured;
  document.getElementById("cyclists_injured").value = geojson.properties.cyclists_injured;
  document.getElementById("ped_injured").value = geojson.properties.ped_injured;
  document.getElementById("kids_injured").value = geojson.properties.kids_injured;
  document.getElementById("pubtr_passengers_injured").value = geojson.properties.pubtr_passengers_injured;

  document.getElementById("drivers_killed").value = geojson.properties.drivers_killed;
  document.getElementById("motorcyclists_killed").value = geojson.properties.motorcyclists_killed;
  document.getElementById("cyclists_killed").value = geojson.properties.cyclists_killed;
  document.getElementById("ped_killed").value = geojson.properties.ped_killed;
  document.getElementById("kids_killed").value = geojson.properties.kids_killed;
  document.getElementById("pubtr_passengers_killed").value = geojson.properties.pubtr_passengers_killed;
  document.getElementById("puplic_transport_involved").checked = geojson.properties.puplic_transport_involved;

  document.getElementById("accidentId").value = geojson.properties.id;


  //if ($("#sidebar-wrapper").css("margin-left") != "0px" ) { $("#wrapper").toggleClass("toggled"); }

  //document.getElementById('wrapper').classList.remove("toggled");
  //$("#wrapper").toggleClass("toggled");
  //$("#wrapper").addClass( "toggled" );
  //$("#wrapper").removeClass( "toggled" );
  $("#saveButton").html('Update');
  $('#tabAccident').show();
  $('#myTab a[href="#accident"]').tab('show') // Select tab by name
  $('#deleteButton').prop('disabled',false);

  OpenSidebar();
}





// switch between markers and clusters if enabled option: hide_cluster_zoomout
{% if hide_cluster_zoomout %}
    mymap.on('zoomend', function() {
        if (but_newmarker.state() == 'off') {
            if (!mymap.hasLayer(heatmapLayer)) { ZoomChangeCluster(); }
        }
    });
{% endif %}








var button_filter = document.getElementById('apply_Filter');
var button_reset = document.getElementById('reset_Filter');
var button_closeTabAccident = document.getElementById('button_CloseTabAccident');

button_closeTabAccident.onclick = function() {
    // delete previous marker if exists
    //mymap.removeLayer(markerCircle);
    mymap.removeLayer(newMarker);

    $('#myTab a[href="#filter"]').tab('show'); // Select tab by name
    $('#tabAccident').hide();
}



button_filter.onclick = function() {

    {% if hide_cluster_zoomout %}
        mymap.removeLayer(markersCluster);
        mymap.removeLayer(markers);
    {% else %}
        mymap.removeLayer(markersCluster);
    {% endif %}

    // update dataset for heatmap
    HeatMapData.data.length = 0; // clear data array

    let heatItem = {};

    markers = L.geoJSON(accidentData, {

        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions).on('click', markerOnClick);//.addTo(mymap);
        },

        filter: function(feature, layer) {

            let dateFrom_value = document.getElementById("dateFrom").value;
            let dateTo_value = document.getElementById("dateTo").value;

            // filter markers by range date
            if (feature.properties.datetime.split('T')[0] >= dateFrom_value && feature.properties.datetime.split('T')[0] <=dateTo_value) {

                let maneuver_value = document.getElementById("maneuver_Filter").value;
                let description_value = document.getElementById("description_Filter").value;

                let red_light_running_value = document.getElementById("red_light_running_Filter").checked;
                let priority_traffic_sign_value = document.getElementById("priority_traffic_sign_Filter").checked;
                let lost_control_vehicle_value = document.getElementById("lost_control_vehicle_Filter").checked;
                let alcohol_or_drug_value = document.getElementById("alcohol_or_drug_Filter").checked;

                let driver_violation_value = document.getElementById("driver_violation_Filter").checked;
                let motorcyclist_violation_value = document.getElementById("motorcyclist_violation_Filter").checked;
                let cyclist_violation_value = document.getElementById("cyclist_violation_Filter").checked;
                let pedestrian_violation_value = document.getElementById("pedestrian_violation_Filter").checked;

                let drivers_injured_value = document.getElementById("drivers_injured_Filter").checked;
                let motorcyclists_injured_value = document.getElementById("motorcyclists_injured_Filter").checked;
                let cyclists_injured_value = document.getElementById("cyclists_injured_Filter").checked;
                let ped_injured_value = document.getElementById("ped_injured_Filter").checked;
                let kids_injured_value = document.getElementById("kids_injured_Filter").checked;
                let pubtr_passengers_injured_value = document.getElementById("pubtr_passengers_injured_Filter").checked;

                let drivers_killed_value = document.getElementById("drivers_killed_Filter").checked;
                let motorcyclists_killed_value = document.getElementById("motorcyclists_killed_Filter").checked;
                let cyclists_killed_value = document.getElementById("cyclists_killed_Filter").checked;
                let ped_killed_value = document.getElementById("ped_killed_Filter").checked;
                let kids_killed_value = document.getElementById("kids_killed_Filter").checked;
                let pubtr_passengers_killed_value = document.getElementById("pubtr_passengers_killed_Filter").checked;

                let puplic_transport_involved_value = document.getElementById("puplic_transport_involved_Filter").checked;


                let maneuver_Filter = true;
                let description_Filter = true;

                let red_light_running_Filter = true;
                let priority_traffic_sign_Filter = true;
                let lost_control_vehicle_Filter = true;
                let alcohol_or_drug_Filter = true;

                let driver_violation_Filter = true;
                let motorcyclist_violation_Filter = true;
                let cyclist_violation_Filter = true;
                let pedestrian_violation_Filter = true;

                let drivers_injured_Filter = true;
                let motorcyclists_injured_Filter = true;
                let cyclists_injured_Filter = true;
                let ped_injured_Filter = true;
                let kids_injured_Filter = true;
                let pubtr_passengers_injured_Filter = true;
                let drivers_killed_Filter = true;
                let motorcyclists_killed_Filter = true;
                let cyclists_killed_Filter = true;
                let ped_killed_Filter = true;
                let kids_killed_Filter = true;
                let pubtr_passengers_killed_Filter = true;
                let puplic_transport_involved_Filter = true;


                if (maneuver_value) {
                    maneuver_Filter = maneuver_value == feature.properties.maneuver;
                }

                if (description_value) {
                    if (feature.properties.description.toLowerCase().indexOf(description_value.toLowerCase()) == -1) { description_Filter = false; }
                }

                if (red_light_running_value) { red_light_running_Filter = red_light_running_value == feature.properties.red_light_running; }
                if (priority_traffic_sign_value) { priority_traffic_sign_Filter = priority_traffic_sign_value == feature.properties.priority_traffic_sign; }
                if (lost_control_vehicle_value) { lost_control_vehicle_Filter = lost_control_vehicle_value == feature.properties.lost_control_vehicle; }
                if (alcohol_or_drug_value) { alcohol_or_drug_Filter = alcohol_or_drug_value == feature.properties.alcohol_or_drug; }

                if (driver_violation_value) { driver_violation_Filter = driver_violation_value == feature.properties.driver_violation; }
                if (motorcyclist_violation_value) { motorcyclist_violation_Filter = motorcyclist_violation_value == feature.properties.motorcyclist_violation; }
                if (cyclist_violation_value) { cyclist_violation_Filter = cyclist_violation_value == feature.properties.cyclist_violation; }
                if (pedestrian_violation_value) { pedestrian_violation_Filter = pedestrian_violation_value == feature.properties.pedestrian_violation; }

                if (drivers_injured_value) { drivers_injured_Filter = feature.properties.drivers_injured > 0; }
                if (motorcyclists_injured_value) { motorcyclists_injured_Filter = feature.properties.motorcyclists_injured > 0; }
                if (cyclists_injured_value) { cyclists_injured_Filter = feature.properties.cyclists_injured > 0; }
                if (ped_injured_value) { ped_injured_Filter = feature.properties.ped_injured > 0; }
                if (kids_injured_value) { kids_injured_Filter = feature.properties.kids_injured > 0; }
                if (pubtr_passengers_injured_value) { pubtr_passengers_injured_Filter = feature.properties.pubtr_passengers_injured > 0; }
                if (drivers_killed_value) { drivers_killed_Filter = feature.properties.drivers_killed > 0; }
                if (motorcyclists_killed_value) { motorcyclists_killed_Filter = feature.properties.motorcyclists_killed > 0; }
                if (cyclists_killed_value) { cyclists_killed_Filter = feature.properties.cyclists_killed > 0; }
                if (ped_killed_value) { ped_killed_Filter = feature.properties.ped_killed > 0; }
                if (kids_killed_value) { kids_killed_Filter = feature.properties.kids_killed > 0; }
                if (pubtr_passengers_killed_value) { pubtr_passengers_killed_Filter = feature.properties.pubtr_passengers_killed > 0; }
                if (puplic_transport_involved_value) { puplic_transport_involved_Filter = feature.properties.puplic_transport_involved > 0; }

                let result = maneuver_Filter &&
                       description_Filter &&
                       red_light_running_Filter &&
                       priority_traffic_sign_Filter &&
                       lost_control_vehicle_Filter &&
                       alcohol_or_drug_Filter &&
                       driver_violation_Filter &&
                       motorcyclist_violation_Filter &&
                       cyclist_violation_Filter &&
                       pedestrian_violation_Filter &&

                       drivers_injured_Filter &&
                       motorcyclists_injured_Filter &&
                       cyclists_injured_Filter &&
                       ped_injured_Filter &&
                       kids_injured_Filter &&
                       pubtr_passengers_injured_Filter &&
                       drivers_killed_Filter &&
                       motorcyclists_killed_Filter &&
                       cyclists_killed_Filter &&
                       ped_killed_Filter &&
                       kids_killed_Filter &&
                       pubtr_passengers_killed_Filter &&
                       puplic_transport_involved_Filter;

                // update dataset for heatmap
                if (result) {
                    heatItem = {}
                    heatItem.lat = feature.properties.coordinates[1];
                    heatItem.lng = feature.properties.coordinates[0];
                    HeatMapData.data.push(heatItem);
                 }

                return result;


            } else {
                return false;
            }


        }
    });//.addTo(mymap);


    heatmapLayer.setData(HeatMapData);

    markersCluster.clearLayers();
    markersCluster.addLayer(markers);

    if (!mymap.hasLayer(heatmapLayer)){
        {% if hide_cluster_zoomout %}
            ZoomChangeCluster();
        {% else %}
            mymap.addLayer(markersCluster);
        {% endif %}
    }
}








button_reset.onclick = function() {

    mymap.removeLayer(markersCluster);
    mymap.removeLayer(markers);

    markers = L.geoJSON(accidentData, {
        pointToLayer: function (feature, latlng) {
         return L.circleMarker(latlng, geojsonMarkerOptions).on('click', markerOnClick);//.addTo(mymap);
        }
    });//.addTo(mymap);

    markersCluster.clearLayers();
    markersCluster.addLayer(markers);

    {% if hide_cluster_zoomout %}
        ZoomChangeCluster();
    {% else %}
        mymap.addLayer(markersCluster);
    {% endif %}


    document.getElementById("dateFrom").value = formatDate(datefilter_Min);
    document.getElementById("dateTo").value = formatDate(datefilter_Max);

    document.getElementById("maneuver_Filter").value = 0;
    document.getElementById("description_Filter").value = '';

    document.getElementById("red_light_running_Filter").checked = false;
    document.getElementById("priority_traffic_sign_Filter").checked = false;
    document.getElementById("lost_control_vehicle_Filter").checked = false;
    document.getElementById("alcohol_or_drug_Filter").checked = false;

    document.getElementById("driver_violation_Filter").checked = false;
    document.getElementById("motorcyclist_violation_Filter").checked = false;
    document.getElementById("cyclist_violation_Filter").checked = false;
    document.getElementById("pedestrian_violation_Filter").checked = false;

    document.getElementById("drivers_injured_Filter").checked = false;
    document.getElementById("motorcyclists_injured_Filter").checked = false;
    document.getElementById("cyclists_injured_Filter").checked = false;
    document.getElementById("ped_injured_Filter").checked = false;
    document.getElementById("kids_injured_Filter").checked = false;
    document.getElementById("pubtr_passengers_injured_Filter").checked = false;

    document.getElementById("drivers_killed_Filter").checked = false;
    document.getElementById("motorcyclists_killed_Filter").checked = false;
    document.getElementById("cyclists_killed_Filter").checked = false;
    document.getElementById("ped_killed_Filter").checked = false;
    document.getElementById("kids_killed_Filter").checked = false;
    document.getElementById("pubtr_passengers_killed_Filter").checked = false;
    document.getElementById("puplic_transport_involved_Filter").checked = false;
}







mymap.on('click', onMapClick);

//=== UTILS ============================================================================================================
{% if hide_cluster_zoomout %}
function ZoomChangeCluster() {
    if (mymap.getZoom() < 15){
            mymap.removeLayer(markersCluster);
            mymap.addLayer(markers);
    }
    else {
            mymap.removeLayer(markers);
            mymap.addLayer(markersCluster);
    }
}
{% endif %}

function formatDate(date) {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}


function OpenSidebar(){
    if ($("#sidebar-wrapper").css("margin-left") != "0px" ) {
        $("#wrapper").toggleClass("toggled");
    }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


document.onreadystatechange = function(){
   if(document.readyState === 'complete'){
        $('#tabAccident').hide();

   }
}

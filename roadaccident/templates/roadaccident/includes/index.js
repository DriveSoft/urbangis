{% load static %}
import {NewMap} from '{% static 'script/classLeafletMap.js' %}';

var markers;
var markersCluster;

var HeatMapData = {max: 8, data: []};




var cfg = {
  // radius should be small ONLY if scaleRadius is true (or small radius is intended)
  // if scaleRadius is false it will be the constant radius used in pixels
  "radius": 15,//30,
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








let mapName;
{% if request.session.mapname %}
    mapName = "{{ request.session.mapname }}";
{% else %}
    mapName = "Default";
{% endif %}


var mymap = new NewMap('mapid', { zoomControl: false }, mapName).setView(
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



mymap.onButNewMarkerClick = function (control) {
    if (control.state() === 'on') {

        $('.leaflet-container').css('cursor','crosshair');

        mymap.removeLayer(markersCluster);
        mymap.addLayer(markers);

        $('#deleteButton').prop('disabled',true);
        $('#deleteButton').prop('title','');

    } else if (control.state() === 'off') {

        mymap.removeLayer(newMarker);
        $('.leaflet-container').css('cursor','');

        mymap.removeLayer(markers);
        {% if hide_cluster_zoomout %}
            ZoomChangeCluster();
        {% else %}
            mymap.addLayer(markersCluster);
        {% endif %}
    }
};



mymap.onButHeatmapClick = function (control) {

    if (control.state() === 'on') {
        mymap.removeLayer(markersCluster);
        mymap.removeLayer(markers);
        //if (!mymap.hasLayer(tilesDark)) { tilesDark.addTo(mymap) } else { tilesDark.bringToFront(); }
        mymap.addLayer(heatmapLayer);
    } else if (control.state() === 'off') {
        mymap.removeLayer(heatmapLayer);

        {% if hide_cluster_zoomout %}
            ZoomChangeCluster();
        {% else %}
            mymap.addLayer(markersCluster);
        {% endif %}
    }

};



// create button to create a new marker
/*
var but_heatmap = L.easyButton({
    position: 'topright',
    states:[
        {
            stateName: 'off',
            icon: '<i class="fas fa-eye fa-lg"></i>',
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
            icon: '<i class="fas fa-eye fa-lg"></i>',
            onClick: function(control){
                control.state('off');
                but_heatmap.button.style.backgroundColor = 'white';

                mymap.removeLayer(heatmapLayer);
                mymap.removeLayer(tilesDark);

                tilesDefault.addTo(mymap);
                tilesDefault.bringToFront();

                {% if hide_cluster_zoomout %}
                    ZoomChangeCluster();
                {% else %}
                    mymap.addLayer(markersCluster);
                {% endif %}

            }
        }]
});

but_heatmap.addTo(mymap);
*/



// create button to create a new marker
/*
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

                $('#deleteButton').prop('disabled',true);
                $('#deleteButton').prop('title','');

            }
        },

        {
            stateName: 'on',
            icon: '<i class="fas fa-map-marker-alt fa-lg"></i>',
            onClick: function(control){
                control.state('off');
                but_newmarker.button.style.backgroundColor = 'white';

                mymap.removeLayer(newMarker);
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
*/



/*
var tilesDefault = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 21,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZHJpdmVzb2Z0IiwiYSI6ImNqY3hkMzAwNTAwM2IzM28zajFoeG1pamYifQ.w5UaGnR0OMDIa6ARiyWoYQ'
})//.addTo(mymap);

var tilesDark = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 21,
    id: 'mapbox/dark-v10', //
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZHJpdmVzb2Z0IiwiYSI6ImNqY3hkMzAwNTAwM2IzM28zajFoeG1pamYifQ.w5UaGnR0OMDIa6ARiyWoYQ'
});//.addTo(mymap);


var tilesSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri',
	maxZoom: 19
});//.addTo(mymap);


var tilesSat2 = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 21,
    id: 'mapbox/satellite-v9',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZHJpdmVzb2Z0IiwiYSI6ImNqY3hkMzAwNTAwM2IzM28zajFoeG1pamYifQ.w5UaGnR0OMDIa6ARiyWoYQ'
});//.addTo(mymap);


var tilesSatBing = L.tileLayer.bing('AniAD3xsGTaSbK1pa0_UkWS1CldG0nGI7r55MlVZqHhyKil9rD9dFK8536u8hTj1', {
    maxZoom: 22
});//.addTo(mymap);




{% if request.session.mapname %}

    {% if request.session.mapname == "Default" %}
        tilesDefault.addTo(mymap);
    {% elif request.session.mapname == "Dark" %}
        tilesDark.addTo(mymap);
    {% elif request.session.mapname == "Sat1" %}
        tilesSatBing.addTo(mymap);
    {% elif request.session.mapname == "Sat2" %}
        tilesSat.addTo(mymap);
    {% elif request.session.mapname == "Sat3" %}
        tilesSat2.addTo(mymap);
    {% else %}
        tilesDefault.addTo(mymap);
    {% endif %}

{% else %}
    tilesDefault.addTo(mymap);
{% endif %}




L.control.zoom({
    position: 'topright'
}).addTo(mymap);



//mymap.addLayer(heatmapLayer);

var baseMaps = {
    "Default": tilesDefault,
    "Dark": tilesDark,
    "Sat1": tilesSatBing,
    "Sat2": tilesSat,
    "Sat3": tilesSat2
};
*/

//var overlayMaps = {
//    "Heatmap": heatmapLayer
//};


//L.control.layers(baseMaps, overlayMaps, {position: 'topleft'}).addTo(mymap);


// save map tiles
mymap.on('baselayerchange', function(e) {
    $.ajax({
        url: "{% url 'set_mapname' %}",
        data: {'mapname': e.name}
    });
});





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

                "violations_type":[{% for rec in accident.violations_type.values_list %}"{{rec.0}}",{% endfor %}],
                "violators":[{% for rec in accident.violators.values_list %}"{{rec.0}}",{% endfor %}],

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

                "public_transport_involved": {{ accident.public_transport_involved|yesno:"1,0" }},
            },
            "geometry": {
                "type": "Point",
                "coordinates": [{{accident.longitude}}, {{accident.latitude}}]
            }
        },
    {% endfor %}
{% endif %}

]};






var myRenderer = L.canvas({ padding: 0.5 });

var geojsonMarkerOptions = {
    renderer: myRenderer,
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
//var markers = L.geoJSON(accidentData, {
//    pointToLayer: function (feature, latlng) {
//        return L.circleMarker(latlng, geojsonMarkerOptions).on('click', markerOnClick);//.addTo(mymap);
//    },

//    filter: function(feature, layer) {
//        if (feature.properties.datetime > datefilter_Max ) { datefilter_Max = feature.properties.datetime }
//        if (feature.properties.datetime < datefilter_Min ) { datefilter_Min = feature.properties.datetime }
//        return true;
//    }
//});//.addTo(mymap);

//document.getElementById("dateFrom").value = formatDate(datefilter_Min);
//document.getElementById("dateTo").value = formatDate(datefilter_Max);







//mymap.fitBounds(markers.getBounds());
















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
  iconUrl: '{% static 'markers/marker-red.png' %}',
  shadowUrl: '{% static 'markers/marker-shadow.png' %}',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});



// to create a new marker
function onMapClick(e) {

    if (mymap.but_newmarker.state() == 'on')
    {
        $('#tabAccident').show();

        $("#saveButton").html('Запази');
        $('#saveButton').prop('disabled', false);
        $('#saveButton').prop('title','');

        $('#myTab a[href="#accident"]').tab('show') // Select tab by name


        // delete previous marker if exists
        mymap.removeLayer(newMarker)
        newMarker = new L.marker(e.latlng, {icon: redIcon, draggable:'true'}).addTo(mymap);

        OpenSidebar();

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

        $('#accident_violations_type').selectpicker('deselectAll');
        $('#accident_violations_type').selectpicker('val', []);

        $('#accident_violators').selectpicker('deselectAll');
        $('#accident_violators').selectpicker('val', []);

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
        document.getElementById("public_transport_involved").checked = 0;


        mymap.but_newmarker.state('off');
        mymap.but_newmarker.button.style.backgroundColor = 'white';
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

  $('#accident_violations_type').selectpicker('val', geojson.properties.violations_type);
  $('#accident_violators').selectpicker('val', geojson.properties.violators);

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
  document.getElementById("public_transport_involved").checked = geojson.properties.public_transport_involved;

  document.getElementById("accidentId").value = geojson.properties.id;


  //if ($("#sidebar-wrapper").css("margin-left") != "0px" ) { $("#wrapper").toggleClass("toggled"); }

  //document.getElementById('wrapper').classList.remove("toggled");
  //$("#wrapper").toggleClass("toggled");
  //$("#wrapper").addClass( "toggled" );
  //$("#wrapper").removeClass( "toggled" );

  $("#saveButton").html('Актуализиране');

  {% if perms.roadaccident.change_accident and perms.roadaccident.can_change_not_own_accident_record %}
    $('#saveButton').prop('disabled',false);
    $('#saveButton').prop('title','');
  {% elif perms.roadaccident.change_accident and not perms.roadaccident.can_change_not_own_accident_record %}
    if (geojson.properties.user_id=={{user.id}}) {
        $('#saveButton').prop('disabled',false);
        $('#saveButton').prop('title','');
    } else {
        $('#saveButton').prop('disabled',true);
        $('#saveButton').prop('title','You cannot change information about the accident that was created by another user.');
    }
  {% else %}
    $('#saveButton').prop('disabled',true);
    $('#saveButton').prop('title','You do not have enough privileges to change the accident information.');
  {% endif %}


  {% if perms.roadaccident.delete_accident and perms.roadaccident.can_delete_not_own_accident_record %}
    $('#deleteButton').prop('disabled',false);
    $('#deleteButton').prop('title','');
  {% elif perms.roadaccident.delete_accident and not perms.roadaccident.can_delete_not_own_accident_record %}
    if (geojson.properties.user_id=={{user.id}}) {
        $('#deleteButton').prop('disabled',false);
        $('#deleteButton').prop('title','');
    } else {
        $('#deleteButton').prop('disabled',true);
        $('#deleteButton').prop('title','You cannot delete the accident that was created by another user.');
    }
  {% else %}
    $('#deleteButton').prop('disabled',true);
    $('#deleteButton').prop('title','You don\'t have enough privileges to remove the accident.');
  {% endif %}




  $('#tabAccident').show();
  $('#myTab a[href="#accident"]').tab('show') // Select tab by name


  OpenSidebar();
}





// switch between markers and clusters if enabled option: hide_cluster_zoomout
{% if hide_cluster_zoomout %}
    mymap.on('zoomend', function() {
        if (mymap.but_newmarker.state() == 'off') {
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
    LoadAccidentsToMap(false, true);
}








button_reset.onclick = function() {


    document.getElementById("dateFrom").value = formatDate(datefilter_Min);
    document.getElementById("dateTo").value = formatDate(datefilter_Max);

    document.getElementById("maneuver_Filter").value = 0;
    document.getElementById("description_Filter").value = '';

    $('#filter_violations_type').selectpicker('deselectAll');
    $('#filter_violations_type').selectpicker('val', []);

    $('#filter_violators').selectpicker('deselectAll');
    $('#filter_violators').selectpicker('val', []);

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
    document.getElementById("public_transport_involved_Filter").checked = false;
    document.getElementById("filter_showOnlyMyAccidents").checked = false;


    LoadAccidentsToMap(false, false);
}





document.getElementById("id_edit_coord").onclick = iEditCoordOnClick;
function iEditCoordOnClick(e) {
    // если в режиме редактирования дерева
    if (document.getElementById("accidentId").value) {

        //if (IS_MOBILE) {
        //    startEditMarkerMobile();
        //} else {

            // delete previous marker if exists
            mymap.removeLayer(newMarker);

            //but_newmarker.state('on');
            //but_newmarker.button.style.backgroundColor = 'red';
            mymap.removeLayer(markersCluster);
            mymap.addLayer(markers);


            let latlng = L.latLng(document.getElementById('latitude').value, document.getElementById('longitude').value);
            newMarker = new L.marker(latlng, {icon: redIcon, draggable: true}).addTo(mymap);

            newMarker.on('dragend', function (e) {
                document.getElementById('latitude').value = newMarker.getLatLng().lat.toFixed(5);
                document.getElementById('longitude').value = newMarker.getLatLng().lng.toFixed(5);
            });
        //}

    }

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

        PermissionsApply();
        $('#tabAccident').hide();

        $.getJSON("{% url 'roadaccident_geojson_get' city_name=obj_city.sysname %}", function(json) {
            accidentData = json;
            LoadAccidentsToMap(true, false);
        });

   }
}


function LoadAccidentsToMap(firsttime, filterEnabled) {
    if (!firsttime) {
        //mymap.removeLayer(markers);
        {% if hide_cluster_zoomout %}
            mymap.removeLayer(markersCluster);
            mymap.removeLayer(markers);
        {% else %}
            mymap.removeLayer(markersCluster);
        {% endif %}
    }
    // update dataset for heatmap
    HeatMapData.data.length = 0; // clear data array
    let heatItem = {};

    markers = L.geoJSON(accidentData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions).on('click', markerOnClick);//.addTo(mymap);
        },

        filter: function(feature, layer) {

            if (firsttime) {
                if (feature.properties.datetime > datefilter_Max ) { datefilter_Max = feature.properties.datetime }
                if (feature.properties.datetime < datefilter_Min ) { datefilter_Min = feature.properties.datetime }
            }

            if (filterEnabled) {

                let dateFrom_value = document.getElementById("dateFrom").value;
                let dateTo_value = document.getElementById("dateTo").value;

                // filter markers by range date
                if (feature.properties.datetime.split('T')[0] >= dateFrom_value && feature.properties.datetime.split('T')[0] <=dateTo_value) {

                    let maneuver_value = document.getElementById("maneuver_Filter").value;
                    let description_value = document.getElementById("description_Filter").value;

                    let violations_type_values = $('#filter_violations_type').val();
                    let violators_values = $('#filter_violators').val();

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

                    let public_transport_involved_value = document.getElementById("public_transport_involved_Filter").checked;

                    let showOnlyMyAccidents_value = document.getElementById("filter_showOnlyMyAccidents").checked;


                    let maneuver_Filter = true;
                    let description_Filter = true;
                    let violations_type_Filter = true;
                    let violators_Filter = true;

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

                    let public_transport_involved_Filter = true;

                    let showOnlyMyAccidents_Filter = true;


                    if (maneuver_value) {
                        maneuver_Filter = maneuver_value == feature.properties.maneuver;
                    }

                    if (description_value) {
                        if (feature.properties.description.toLowerCase().indexOf(description_value.toLowerCase()) == -1) { description_Filter = false; }
                    }

                    if (violations_type_values.length>0) {
                        // проверяем,пересекаются ли два массива
                        let intersection = violations_type_values.filter(x => feature.properties.violations_type.includes(x));
                        violations_type_Filter = intersection.length > 0;
                    }

                    if (violators_values.length>0) {
                        // проверяем,пересекаются ли два массива
                        let intersection = violators_values.filter(x => feature.properties.violators.includes(x));
                        violators_Filter = intersection.length > 0;
                    }

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

                    if (public_transport_involved_value) {
                        public_transport_involved_Filter = feature.properties.public_transport_involved;
                    }

                    if (showOnlyMyAccidents_value) {
                        showOnlyMyAccidents_Filter = feature.properties.user_id == {{user.id}};
                    }


                    let result = maneuver_Filter &&
                           description_Filter &&

                           violations_type_Filter &&

                           violators_Filter &&

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
                           public_transport_involved_Filter &&
                           showOnlyMyAccidents_Filter;

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




            } else {
                heatItem = {}
                heatItem.lat = feature.properties.coordinates[1];
                heatItem.lng = feature.properties.coordinates[0];
                HeatMapData.data.push(heatItem);

                return true; // если filterEnabled = False
            }


        }
    });//.addTo(mymap);



    if (firsttime) {
        document.getElementById("dateFrom").value = formatDate(datefilter_Min);
        document.getElementById("dateTo").value = formatDate(datefilter_Max);


        let dMin = new Date(datefilter_Min);
        let yearMin = dMin.getFullYear();
        $("#id_dateRange").prop("min", yearMin);

        let dMax = new Date(datefilter_Max);
        let yearMax = dMax.getFullYear();
        $("#id_dateRange").prop("max", yearMax);
        $("#id_dateRange").prop("value", yearMax);

    }

    heatmapLayer.setData(HeatMapData);
    //if (but_heatmap.state() == 'off') {
    //    mymap.addLayer(markers);
    //}
    //mymap.addLayer(markers);




    // create clusters from circleMarkers
    markersCluster = L.markerClusterGroup({
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


    //if (but_heatmap.state() == 'off') {
    //    markersCluster.addLayer(markers);
    //}
    markersCluster.addLayer(markers);

    {% if hide_cluster_zoomout %}
        if (mymap.but_heatmap.state() == 'off') { ZoomChangeCluster(); }
    {% else %}
        mymap.addLayer(markersCluster);
    {% endif %}
}

function PermissionsApply(){
    {% if not perms.roadaccident.add_accident %} mymap.but_newmarker.disable(); {% endif %}
}




function inputHandlerSlider() {
  let dateTo = this.value+'-12-31';

  if ( dateTo.substring(0,4) == datefilter_Max.substring(0,4) ) {
    document.getElementById("dateTo").value = formatDate(datefilter_Max);
  } else {
    document.getElementById("dateTo").value = dateTo;
  }

}

const sliderRangeDate = document.getElementById("id_dateRange");
sliderRangeDate.addEventListener("input", inputHandlerSlider);



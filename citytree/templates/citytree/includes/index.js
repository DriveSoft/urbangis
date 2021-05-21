{% load static %}

var IS_MOBILE = false;

var button_filter = document.getElementById('apply_Filter');
var button_reset = document.getElementById('reset_Filter');

var button_closeTabTree = document.getElementById('button_CloseTabTree');
var button_closeTabInsp = document.getElementById('button_CloseTabInsp');
var button_closeTabAct = document.getElementById('button_CloseTabAct');

var button_NewInspection = document.getElementById('id_button_NewInspection');
var button_NewAction = document.getElementById('id_button_NewAction');

var markers;
var ajax_geojson;
var idsFromDB = []; // храним id маркеров деревьев, которые пришли из базы, чтобы исключитть эти маркеры из ajax_geojson






var HeatMapData = {
  max: 10,
  data: [
    {% if tree_data %}
        {% for tree in tree_data %}
            {lat: {{tree.latitude}}, lng: {{tree.longitude}}, count: {{ tree.crowndiameter|add:"1" }} },
        {% endfor %}
    {% endif %}
  ]
};




var cfgHeatMap = {
  // radius should be small ONLY if scaleRadius is true (or small radius is intended)
  // if scaleRadius is false it will be the constant radius used in pixels
  "radius": 10,
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


var heatmapLayer = new HeatmapOverlay(cfgHeatMap);
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



{% if request.session.mapname %}

    {% if request.session.mapname == "Default" %}
        tilesDefault.addTo(mymap);
    {% elif request.session.mapname == "Dark" %}
        tilesDark.addTo(mymap);
    {% elif request.session.mapname == "Sat" %}
        tilesSat.addTo(mymap);
    {% elif request.session.mapname == "Sat2" %}
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
    "Sat": tilesSat,
    "Sat2": tilesSat2
};

var overlayMaps = {
    //"Heatmap": heatmapLayer
};

L.control.layers(baseMaps, overlayMaps, {position: 'bottomleft'}).addTo(mymap);

// save map tiles
mymap.on('baselayerchange', function(e) {
    $.ajax({
        url: "{% url 'set_mapname' %}",
        data: {'mapname': e.name}
    });
});



// create a geoJson data from database
var treeData = {
  "type": "FeatureCollection",
  "features": [

{% if tree_data %}
    {% for tree in tree_data %}
        {
            "type": "Feature",
            "properties": {
                "ajax": 0,
                "coordinates": [{{tree.longitude}}, {{tree.latitude}}], {# сохраняем координаты в properties, т.к. в geometry они почему то меняются из за того, видимо из за того, что маркеры смещаются когда кластер раскрывается #}
                "id": {{tree.id}},
                "user_id": {{tree.useradded_id}},
                "species": {% if not tree.species_id %} 0 {% else %} {{ tree.species_id }} {% endif %},
                "speciescomment": "{{ tree.speciescomment|default_if_none:"" }}",
                "comment": "{{ tree.comment|linebreaksbr|default_if_none:"" }}",
                "irrigationmethod": {{ tree.irrigationmethod_id|default_if_none:0 }},
                "dateplanted": "{{ tree.dateplanted|date:"Y-m-d"|default_if_none:"" }}",
                "datetimeadded": "{{ tree.datetimeadded|date:"Y-m-d"|default_if_none:"" }}",
                "googlestreeturl": "{{ tree.googlestreeturl|linebreaksbr|default_if_none:"" }}",
                "placetype": {% if not tree.placetype_id %} 0 {% else %} {{ tree.placetype_id }} {% endif %},

                "crowndiameter": {{tree.lastinsp_crowndiameter|default_if_none:0}},
                "trunkgirth": {{tree.lastinsp_trunkgirth|default_if_none:0}},
                "height": {{tree.lastinsp_height|default_if_none:0}},
                "status": {{tree.lastinsp_status_id|default_if_none:0}},
                "datetimeinsp": "{{tree.lastinsp_datetime}}",
                "recommendations": [{{tree.lastinsp_recommendations_list|default_if_none:""|safe}}],
                "remarks": [{{tree.lastinsp_remarks_list|default_if_none:""|safe}}],
                "photo1": "{{tree.lastinsp_photo1}}",
                "photo2": "{{tree.lastinsp_photo2}}",
                "photo3": "{{tree.lastinsp_photo3}}",
                "is_deleted": {{ tree.is_deleted|yesno:"1,0" }},
            },
            "geometry": {
                "type": "Point",
                "coordinates": [{{tree.longitude}}, {{tree.latitude}}]
            }
        },
    {% endfor %}
{% endif %}

]};





var myRenderer = L.canvas({ padding: 0.5 });

var geojsonMarkerOptions = {
    renderer: myRenderer,
    radius: 5,
    fillColor: "#008000",
    color: "#008000",
    weight: 0,
    opacity: 1,
    fillOpacity: 0.5
};




// loads geoJSON and finds max and min dates in geoJson to use it on filter form
var datefilter_Min = '2100-01-01';
var datefilter_Max = '1970-01-01';






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
                //$('#myTab a[href="#tree"]').tab('show') // Select tab by name

                if (IS_MOBILE) {
                    startNewMarkerMobile();
                } else {
                   $('.leaflet-container').css('cursor','crosshair');
                }

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
                $('.leaflet-container').css('cursor','');

                if (IS_MOBILE) {
                    $('#doneMarkerMobile').hide();
                    $('#cancelMarkerMobile').hide();

                    // delete previous marker if exists
                    mymap.removeLayer(newMarker);
                }
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
            icon: '<i class="fas fa-eye fa-lg"></i>',
            onClick: function(control){
                control.state('on');
                but_heatmap.button.style.backgroundColor = 'red';

                mymap.removeLayer(markers);
                mymap.removeLayer(tilesDefault);

                //if (!mymap.hasLayer(tilesDark)) {
                //    tilesDark.addTo(mymap);
                //} else {
                //    tilesDark.bringToFront();
                //}

                tilesDark.addTo(mymap);
                tilesDark.bringToFront();
                mymap.addLayer(heatmapLayer);

            }
        },

        {
            stateName: 'on',
            icon: '<i class="fas fa-eye-slash fa-lg"></i>',
            onClick: function(control){
                control.state('off');
                but_heatmap.button.style.backgroundColor = 'white';

                mymap.removeLayer(heatmapLayer);
                mymap.removeLayer(tilesDark);


                tilesDefault.addTo(mymap);
                //tilesDefault.bringToFront();

                mymap.addLayer(markers);
            }
        }]
});

but_heatmap.addTo(mymap);


// create button for geolocation
var but_geolocation = L.easyButton({
    position: 'topright',
    states:[
        {
            stateName: 'off',
            icon: '<i class="fas fa-satellite-dish fa-lg"></i>',
            onClick: function(control){
                control.state('on');
                but_geolocation.button.style.backgroundColor = 'red';
                mymap.locate({setView: true, maxZoom: 20});
            }
        },

        {
            stateName: 'on',
            icon: '<i class="fas fa-satellite-dish fa-lg"></i>',
            onClick: function(control){
                control.state('off');
                but_geolocation.button.style.backgroundColor = 'white';
                mymap.removeLayer(circle_geolocation);
            }
        }]
});

but_geolocation.addTo(mymap);





//==== EVENTS ==========================================================================================================
heatmapLayer.on('add',(e)=>{
  //mymap.removeLayer(markersCluster);
  //mymap.removeLayer(markers);
  //mymap.addLayer(markers);
});

heatmapLayer.on('remove',(e)=>{

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



// to create a new marker for desktop verion
function onMapClick(e) {

    if (!IS_MOBILE && but_newmarker.state() == 'on')
    {
        $('#tabTree').show();

        $('#height').prop('required', true);
        $('#crowndiameter').prop('required', true);
        $('#trunkgirth').prop('required', true);
        $('#divNewTree').show();
        $('#divExistsTree').hide();

        $("#saveButton").html('Save');
        $('#saveButton').prop('disabled',false);
        $('#saveButton').prop('title','');

        $('#myTab a[href="#tree"]').tab('show'); // Select tab by name



        // delete previous marker if exists
        mymap.removeLayer(newMarker)

        newMarker = new L.marker(e.latlng, {icon: redIcon, draggable: true}).addTo(mymap);
        OpenSidebar();

        newMarker.on('dragend', function (e) {
            document.getElementById('latitude').value = newMarker.getLatLng().lat.toFixed(5);
            document.getElementById('longitude').value = newMarker.getLatLng().lng.toFixed(5);
        });




        document.getElementById("treeId").value = '';
        document.getElementById("latitude").value = e.latlng.lat.toFixed(5);
        document.getElementById("longitude").value = e.latlng.lng.toFixed(5);

        //document.getElementById("species").value = 0;
        //$('#species').selectpicker('deselectAll');
        $('#species').selectpicker('val', []);
        document.getElementById("speciescomment").value = '';
        document.getElementById("comment").value = '';
        document.getElementById("placetype").value = 0;
        document.getElementById("irrigationmethod").value = 1;
        document.getElementById("dateplanted").value = '';
        document.getElementById("status").value = 0;

        but_newmarker.state('off');
        but_newmarker.button.style.backgroundColor = 'white';
        $('.leaflet-container').css('cursor','');
    }
}




function startNewMarkerMobile() {
    $('#doneMarkerMobile').show();
    $('#cancelMarkerMobile').show();
    let center = mymap.getCenter();
    newMarker = new L.marker(center, {icon: redIcon, draggable: false}).addTo(mymap);
}


document.getElementById("doneMarkerMobile").onclick = buttonDoneMarkerMobileOnClick;
document.getElementById("cancelMarkerMobile").onclick = buttonCancelMarkerMobileOnClick;

function buttonDoneMarkerMobileOnClick(e) {
    $('#doneMarkerMobile').hide();
    $('#cancelMarkerMobile').hide();
    $('#tabTree').show();

    $('#height').prop('required', true);
    $('#crowndiameter').prop('required', true);
    $('#trunkgirth').prop('required', true);
    $('#divNewTree').show();
    $('#divExistsTree').hide();
    $("#saveButton").html('Save');
    $('#myTab a[href="#tree"]').tab('show'); // Select tab by name


    document.getElementById("treeId").value = '';
    document.getElementById('latitude').value = newMarker.getLatLng().lat.toFixed(5);
    document.getElementById('longitude').value = newMarker.getLatLng().lng.toFixed(5);

    $('#species').selectpicker('val', []);
    document.getElementById("speciescomment").value = '';
    document.getElementById("comment").value = '';
    document.getElementById("placetype").value = 0;
    document.getElementById("irrigationmethod").value = 1;
    document.getElementById("dateplanted").value = '';
    document.getElementById("status").value = 0;

    but_newmarker.state('off');
    but_newmarker.button.style.backgroundColor = 'white';
    OpenSidebar();
}

function buttonCancelMarkerMobileOnClick(e) {
    $('#doneMarkerMobile').hide();
    $('#cancelMarkerMobile').hide();

    // delete previous marker if exists
    mymap.removeLayer(newMarker);
    but_newmarker.state('off');
    but_newmarker.button.style.backgroundColor = 'white';
}




function markerOnClick(e)
{
  let marker = e.target;
  let geojson = marker.toGeoJSON();

  // delete previous marker if exists
  mymap.removeLayer(newMarker);


    $.ajax({
        url: "{% url 'get_tree' %}",
        //data: {'idtree': document.getElementById("treeId").value},
        data: {'idtree': geojson.properties.id},
        dataType: 'json',
        success: function (jsonResult) {
            let obj_tree = jQuery.parseJSON(jsonResult);


            $("#id_treepreview_title_local_name").text(obj_tree.fields.localname);
            $("#id_treepreview_title_species_name").text(obj_tree.fields.species);
            $("#id_treepreview_status").text(obj_tree.fields.lastinsp_status);

            $("#id_treepreview_height").text(obj_tree.fields.lastinsp_height);
            $("#id_treepreview_crown").text(obj_tree.fields.lastinsp_crowndiameter);
            $("#id_treepreview_trunk").text(obj_tree.fields.lastinsp_trunkgirth);
            $("#id_treepreview_remarks").text(obj_tree.fields.lastinsp_remarks);
            $("#id_treepreview_recommends").text(obj_tree.fields.lastinsp_recommendations);

            //console.log(obj_tree.fields.species);
            //console.log(obj.fields.localname);

        }
      });


  $('#modalTreeInfo').modal('show');


  document.getElementById("treeId").value = geojson.properties.id;
  Show_Inspections_Actions_Table('PreviewTree', geojson.properties.id);


  let photo1 = "";
  let photo2 = "";
  let photo3 = "";

  if (geojson.properties.photo1 !== "") { photo1 = "{% get_media_prefix %}" + geojson.properties.photo1 }
  if (geojson.properties.photo2 !== "") { photo2 = "{% get_media_prefix %}" + geojson.properties.photo2 }
  if (geojson.properties.photo3 !== "") { photo3 = "{% get_media_prefix %}" + geojson.properties.photo3 }

  if (photo1 == "" && photo2 == "" && photo3 == "") { photo1 = "{% static 'images/no-photo.png' %}"}

  ShowSlideShow(photo1, photo2, photo3, "TreePreview")



  let editButton_TreePreview = document.getElementById('id_editButton_TreePreview');
  editButton_TreePreview.onclick = function() {
    $('#modalTreeInfo').modal('hide');
    EditTree (geojson);
  }


}


function EditTree (geojson) {

  let $table_InspActData = $('#table_InspActData');
  $table_InspActData.bootstrapTable('destroy');
  $('#button_show_inspact').show();
  $('#divTreeInspActData').hide();


  // читаем координаты в properties, т.к. в geometry они почему то меняются из за того, видимо из за того, что маркеры смещаются когда кластер раскрывается
  document.getElementById("latitude").value = geojson.properties.coordinates[1];
  document.getElementById("longitude").value = geojson.properties.coordinates[0];
  //document.getElementById("species").value = geojson.properties.species;
  $('#species').selectpicker('val', geojson.properties.species);

  document.getElementById("speciescomment").value = geojson.properties.speciescomment;
  document.getElementById("comment").value = geojson.properties.comment.replace(/<br\s*[\/]?>/gi, "\n");
  document.getElementById("placetype").value = geojson.properties.placetype;
  document.getElementById("irrigationmethod").value = geojson.properties.irrigationmethod;
  document.getElementById("dateplanted").value = geojson.properties.dateplanted;
  document.getElementById("googlestreeturl").value = geojson.properties.googlestreeturl;
  document.getElementById("treeId").value = geojson.properties.id;


  //document.getElementById('wrapper').classList.remove("toggled");
  $('#divNewTree').hide();
  $('#divExistsTree').show();

  $("#saveButton").html('Актуализиране');

  {% if perms.citytree.change_tree and perms.citytree.can_change_not_own_tree_record %}
    $('#saveButton').prop('disabled',false);
    $('#saveButton').prop('title','');
  {% elif perms.citytree.change_tree and not perms.citytree.can_change_not_own_tree_record %}
    if (geojson.properties.user_id=={{user.id}}) {
        $('#saveButton').prop('disabled',false);
        $('#saveButton').prop('title','');
    } else {
        $('#saveButton').prop('disabled',true);
        $('#saveButton').prop('title','You cannot change information about the tree that was created by another user.');
    }
  {% else %}
    $('#saveButton').prop('disabled',true);
    $('#saveButton').prop('title','You do not have enough privileges to change the tree information.');
  {% endif %}


  {% if perms.citytree.delete_tree and perms.citytree.can_delete_not_own_tree_record %}
    $('#deleteButton').prop('disabled',false);
    $('#deleteButton').prop('title','');
  {% elif perms.citytree.delete_tree and not perms.citytree.can_delete_not_own_tree_record %}
    if (geojson.properties.user_id=={{user.id}}) {
        $('#deleteButton').prop('disabled',false);
        $('#deleteButton').prop('title','');
    } else {
        $('#deleteButton').prop('disabled',true);
        $('#deleteButton').prop('title','You cannot delete the tree that was created by another user.');
    }
  {% else %}
    $('#deleteButton').prop('disabled',true);
    $('#deleteButton').prop('title','You don\'t have enough privileges to remove the tree.');
  {% endif %}




  $('#height').removeAttr('required');
  $('#crowndiameter').removeAttr('required');
  $('#trunkgirth').removeAttr('required');

  $('#tabTree').show();
  $('#myTab a[href="#tree"]').tab('show'); // Select tab by name



  document.getElementById("id_tree_photo1").value = geojson.properties.photo1;
  document.getElementById("id_tree_photo2").value = geojson.properties.photo2;
  document.getElementById("id_tree_photo3").value = geojson.properties.photo3;


  Show_Inspections_Actions_Table('EditTree', geojson.properties.id);
  OpenSidebar();
}




function ShowSlideShow(photo1, photo2, photo3, id_carousel_suffix) {
    // clear then populate slider
    $('#id_container_'+id_carousel_suffix+' .carousel-inner').html('');
    $('#id_container_'+id_carousel_suffix+' .carousel-indicators').html('');

    let i = 0;
    let result = false;

    if (photo1 != "") {
        $('<div class="carousel-item"><img class="d-block w-100" src="'+ photo1 +'"></div>').appendTo('#id_container_'+id_carousel_suffix+' .carousel-inner');
        $('<li data-target="#id_carousel_Modal" data-slide-to="'+i+'"></li>').appendTo('#id_container_'+id_carousel_suffix+' .carousel-indicators');
        result = true;
    }
    i = i + 1;

    if (photo2 != "") {
        $('<div class="carousel-item"><img class="d-block w-100" src="'+ photo2 +'"></div>').appendTo('#id_container_'+id_carousel_suffix+' .carousel-inner');
        $('<li data-target="#id_carousel_Modal" data-slide-to="'+i+'"></li>').appendTo('#id_container_'+id_carousel_suffix+' .carousel-indicators');
        result = true;
    }
    i = i + 1;

    if (photo3 != "") {
        $('<div class="carousel-item"><img class="d-block w-100" src="'+ photo3 +'"></div>').appendTo('#id_container_'+id_carousel_suffix+' .carousel-inner');
        $('<li data-target="#id_carousel_Modal" data-slide-to="'+i+'"></li>').appendTo('#id_container_'+id_carousel_suffix+' .carousel-indicators');
        result = true;
    }


    if (result) {
        $('#id_container_'+id_carousel_suffix+' .carousel-item').first().addClass('active');
        $('#id_container_'+id_carousel_suffix+' .carousel-indicators > li').first().addClass('active');
        $('#id_carousel_'+id_carousel_suffix).carousel();

        //$('#modalSlideShow').modal('show');
        if (id_carousel_suffix.includes('Modal')) // если в параметре есть слово Modal, значит нужно еще и вызвать модальное окно
        {
            $('#id_SlideShow_'+id_carousel_suffix).modal('show');
        }

    }

    return result;
}


/*
function ZoomToRadius (zoom, trunkgirth) {
    if (trunkgirth == 0) { trunkgirth = 100 };

    if (zoom >= 22) { k = 1.5;}
    if (zoom == 21) { k = 3;  }
    if (zoom == 20) { k = 6;  }
    if (zoom == 19) { k = 12; }
    if (zoom == 18) { k = 24; }
    if (zoom == 17) { k = 36; }
    if (zoom == 16) { k = 48; }
    if (zoom == 15) { k = 72; }
    if (zoom <= 14) { k = 96; }

    return trunkgirth / k;
}

mymap.on('zoomend', function() {

  let zoom = mymap.getZoom();
  console.log(zoom);
  markers.eachLayer(function (marker) {
    let geojson = marker.toGeoJSON();

    marker.setRadius(ZoomToRadius(zoom, geojson.properties.trunkgirth))

    //marker.setRadius( geojson.properties.trunkgirth * (zoom);

    //marker.setRadius(markerRadius(marker._price));
    //marker.setRadius();//mymap.getZoom()

    //marker.Radius = 5;
    //marker.setRadius(10);
  });
});
*/




function LoadTreesToMap(firsttime, filterEnabled) {
    if (!firsttime) {
        mymap.removeLayer(markers);
    }
    // update dataset for heatmap
    HeatMapData.data.length = 0; // clear data array
    let heatItem = {};

    markers = L.geoJSON(ajax_geojson, {
        pointToLayer: function (feature, latlng) {
            geojsonMarkerOptions.radius = feature.properties.crowndiameter;
            if (geojsonMarkerOptions.radius < 2) {
                geojsonMarkerOptions.radius = 2;
            }
            return L.circle(latlng, geojsonMarkerOptions).on('click', markerOnClick);//.addTo(mymap);
        },

        filter: function(feature, layer) {

            if (feature.properties.ajax == 1 && idsFromDB.includes(feature.properties.id)) {
                return false
            } else if (filterEnabled) {

                let species_values = $('#filter_species').val();
                let status_values = $('#filter_status').val();
                let recommendations_values = $('#filter_recommendations').val();
                let remarks_values = $('#filter_remarks').val();

                let placetype_value = document.getElementById("filter_placetype").value;
                let irrigationmethod_value = document.getElementById("filter_irrigationmethod").value;

                let plantedDateFrom_value = document.getElementById("filter_plantedDateFrom").value;
                let plantedDateTo_value = document.getElementById("filter_plantedDateTo").value;
                let addedDateFrom_value = document.getElementById("filter_addedDateFrom").value;
                let addedDateTo_value = document.getElementById("filter_addedDateTo").value;

                let comment_value = document.getElementById("filter_comment").value;

                let showOnlyMyTrees_value = document.getElementById("filter_showOnlyMyTrees").checked;




                let species_Filter = true;
                let status_Filter = true;
                let recommendations_Filter = true;
                let remarks_Filter = true;
                let placetype_Filter = true;
                let irrigationmethod_Filter = true;

                let plantedDateFrom_Filter = true;
                let plantedDateTo_Filter = true;
                let addedDateFrom_Filter = true;
                let addedDateTo_Filter = true;
                let comment_Filter = true;
                let showOnlyMyTrees_Filter = true;


                if (species_values.length>0) {
                    species_Filter = species_values.includes(feature.properties.species.toString());
                }

                if (status_values.length>0) {
                    status_Filter = status_values.includes(feature.properties.status.toString());
                }

                if (recommendations_values.length>0) {
                    // проверяем,пересекаются ли два массива
                    let intersection = recommendations_values.filter(x => feature.properties.recommendations.includes(x));
                    recommendations_Filter = intersection.length > 0;
                }

                if (remarks_values.length>0) {
                    // проверяем,пересекаются ли два массива
                    let intersection = remarks_values.filter(x => feature.properties.remarks.includes(x));
                    remarks_Filter = intersection.length > 0;
                }


                if (placetype_value) {
                    placetype_Filter = placetype_value == feature.properties.placetype;
                }

                if (irrigationmethod_value) {
                    irrigationmethod_Filter = irrigationmethod_value == feature.properties.irrigationmethod;
                }


                if (plantedDateFrom_value) {
                    plantedDateFrom_Filter = feature.properties.dateplanted >= plantedDateFrom_value;
                }
                if (plantedDateTo_value) {
                    plantedDateTo_Filter = feature.properties.dateplanted <= plantedDateTo_value;
                }

                if (addedDateFrom_value) {
                    addedDateFrom_Filter = feature.properties.datetimeadded >= addedDateFrom_value;
                }
                if (addedDateTo_value) {
                    addedDateTo_Filter = feature.properties.datetimeadded <= addedDateTo_value;
                }

                if (comment_value) {
                    if (feature.properties.comment.toLowerCase().indexOf(comment_value.toLowerCase()) == -1) { comment_Filter = false; }
                }


                if (showOnlyMyTrees_value == true) {
                    showOnlyMyTrees_Filter = feature.properties.user_id == {{user.id}};
                }




                let result = species_Filter && status_Filter && recommendations_Filter && remarks_Filter &&
                             placetype_Filter && irrigationmethod_Filter &&
                             plantedDateFrom_Filter && plantedDateTo_Filter && addedDateFrom_Filter && addedDateTo_Filter &&
                             comment_Filter && showOnlyMyTrees_Filter;


                // update dataset for heatmap
                if (result) {
                    heatItem = {}
                    heatItem.lat = feature.properties.coordinates[1];
                    heatItem.lng = feature.properties.coordinates[0];
                    HeatMapData.data.push(heatItem);
                 }

                return result;

            } else {
                heatItem = {}
                heatItem.lat = feature.properties.coordinates[1];
                heatItem.lng = feature.properties.coordinates[0];
                HeatMapData.data.push(heatItem);

                return true; // если filterEnabled = False
            }


        }
    });//.addTo(mymap);


    heatmapLayer.setData(HeatMapData);
    mymap.addLayer(markers);
}






button_filter.onclick = function() {
    LoadTreesToMap(false, true); // не первоначальная загрузка, фильтр задействован
}

button_reset.onclick = function() {
    $('#filter_species').selectpicker('deselectAll');
    $('#filter_status').selectpicker('deselectAll');
    $('#filter_recommendations').selectpicker('deselectAll');
    $('#filter_remarks').selectpicker('deselectAll');


    document.getElementById("filter_placetype").value = 0;
    document.getElementById("filter_irrigationmethod").value = 0;

    document.getElementById("filter_plantedDateFrom").value = '';
    document.getElementById("filter_plantedDateTo").value = '';
    document.getElementById("filter_addedDateFrom").value = '';
    document.getElementById("filter_addedDateTo").value = '';
    document.getElementById("filter_comment").value = '';
    document.getElementById("filter_showOnlyMyTrees").checked = false;


    LoadTreesToMap(false, false); // не первоначальная загрузка, фильтр отключен

}






button_closeTabTree.onclick = function() {
    // delete previous marker if exists
    mymap.removeLayer(newMarker);

    $('#myTab a[href="#filter"]').tab('show'); // Select tab by name
    $('#tabTree').hide();
}

button_closeTabInsp.onclick = function() {
    if($('#myTab a[href="#tree"]').is(":visible")) {
        $('#myTab a[href="#tree"]').tab('show'); // Select tab by name
    } else {
        $('#myTab a[href="#filter"]').tab('show');
    }


    $('#tabInspection').hide();
}

button_closeTabAct.onclick = function() {
    if($('#myTab a[href="#tree"]').is(":visible")) {
        $('#myTab a[href="#tree"]').tab('show'); // Select tab by name
    } else {
        $('#myTab a[href="#filter"]').tab('show');
    }

    $('#tabAction').hide();
}







function onMapDrag(e) {
    let center = mymap.getCenter();  //get map center
    newMarker.setLatLng(center);
}

function onMapZoom(e) {
    let center = mymap.getCenter();  //get map center
    newMarker.setLatLng(center);
}






function Show_Inspections_Actions_Table(id_suffix, idTree)
{
    let $table_InspActData = $('#table_InspActData_'+id_suffix)
    let $table_InspActDataPreview = $('#table_InspActData_'+id_suffix)
    $table_InspActData.bootstrapTable('destroy')

    $.ajax({
        url: "{% url 'get_inspact' %}",
        //data: {'idtree': document.getElementById("treeId").value},
        data: {'idtree': idTree},
        dataType: 'json',
        success: function (jsonResult) {
            //$('#button_show_inspact').hide();
            $('#divTreeInspActData_'+id_suffix).show();
            //$('#divTreeInspActDataPreview').show();
            //console.log(jsonResult);

            $(function() {
                let data = jsonResult
                $table_InspActData.bootstrapTable({data: data})
                //$table_InspActDataPreview.bootstrapTable({data: data})
            })

        }
      });
}



function button_show_inspact_OnClick() {
    let $table_InspActData = $('#table_InspActData')
    //$table_InspActData.bootstrapTable('destroy')

    $.ajax({
        url: "{% url 'get_inspact' %}",
        data: {'idtree': document.getElementById("treeId").value},
        dataType: 'json',
        success: function (jsonResult) {
            $('#button_show_inspact').hide();
            $('#divTreeInspActData').show();
            console.log(jsonResult);

            $(function() {
                let data = jsonResult
                $table_InspActData.bootstrapTable({data: data})
            })

        }
      });
}

// обработчик нажатия кнопок в bootstrap table
window.operateEventsTreeEdit = {
    'click .edit': function (e, value, row, index) {
        Edit_Inspection_or_Action_show(row);
    },


    'click .photos': function (e, value, row, index) {
        Slideshow_Inspection_show(row);
    }

}



window.operateEventsPreviewTree = {
    'click .edit': function (e, value, row, index) {
        $('#modalTreeInfo').modal('hide');
        Edit_Inspection_or_Action_show(row);
        OpenSidebar();
    },


    'click .photos': function (e, value, row, index) {
        Slideshow_Inspection_show(row);
    }

}



function Edit_Inspection_or_Action_show(row) {
        if (row.type=='Inspection') {
            document.getElementById("inspId").value = row.id;
            document.getElementById("inspTreeId").value = row.tree;

            document.getElementById("insp_height").value = row.height;
            document.getElementById("insp_crowndiameter").value = row.crowndiameter;
            document.getElementById("insp_trunkgirth").value = row.trunkgirth;
            $('#id_insp_remarks').selectpicker('val', row.remarks);
            document.getElementById("insp_status").value = row.status;
            $('#id_insp_recommendations').selectpicker('val', row.recommendations);


            if (row.photo1 !== "") {
                $("#id_insp_img_photo1").attr("src", "{% get_media_prefix%}"+row.photo1);
                document.getElementById("id_insp_photo1_filename").value = "{% get_media_prefix%}"+row.photo1;
            } else {
                $("#id_insp_img_photo1").attr("src", "{% static 'images/no-photo.png' %}");
                document.getElementById("id_insp_photo1_filename").value = "";
            }

            if (row.photo2 !== "") {
                $("#id_insp_img_photo2").attr("src", "{% get_media_prefix%}"+row.photo2);
                document.getElementById("id_insp_photo2_filename").value = "{% get_media_prefix%}"+row.photo2;
            } else {
                $("#id_insp_img_photo2").attr("src", "{% static 'images/no-photo.png' %}");
                document.getElementById("id_insp_photo2_filename").value = "";
            }

            if (row.photo3 !== "") {
                $("#id_insp_img_photo3").attr("src", "{% get_media_prefix%}"+row.photo3);
                document.getElementById("id_insp_photo3_filename").value = "{% get_media_prefix%}"+row.photo3;
            } else {
                $("#id_insp_img_photo3").attr("src", "{% static 'images/no-photo.png' %}");
                document.getElementById("id_insp_photo3_filename").value = "";
            }



            {% if perms.citytree.change_inspection and perms.citytree.can_change_not_own_insp_record %}
                $('#saveInspButton').prop('disabled',false);
                $('#saveInspButton').prop('title','');
            {% elif perms.citytree.change_inspection and not perms.citytree.can_change_not_own_insp_record %}
                if (row.user=={{user.id}}) {
                    $('#saveInspButton').prop('disabled',false);
                    $('#saveInspButton').prop('title','');
                } else {
                    $('#saveInspButton').prop('disabled',true);
                    $('#saveInspButton').prop('title','You cannot change information about the inspection that was created by another user.');
                }
            {% else %}
                $('#saveInspButton').prop('disabled',true);
                $('#saveInspButton').prop('title','You do not have enough privileges to change the inspection information.');
            {% endif %}


            {% if perms.citytree.delete_inspection and perms.citytree.can_delete_not_own_insp_record %}
                $('#insp_deleteButton').prop('disabled',false);
                $('#insp_deleteButton').prop('title','');
            {% elif perms.citytree.delete_inspection and not perms.citytree.can_delete_not_own_insp_record %}
                if (row.user=={{user.id}}) {
                    $('#insp_deleteButton').prop('disabled',false);
                    $('#insp_deleteButton').prop('title','');
                } else {
                    $('#insp_deleteButton').prop('disabled',true);
                    $('#insp_deleteButton').prop('title','You cannot delete information about the inspection that was created by another user.');
                }
            {% else %}
                $('#insp_deleteButton').prop('disabled',true);
                $('#insp_deleteButton').prop('title','You do not have enough privileges to delete the inspection information.');
            {% endif %}



            $('#tabInspection').show();
            $('#myTab a[href="#inspection"]').tab('show'); // Select tab by name
            //$('#insp_deleteButton').prop('disabled',false);
        }

        if (row.type=='Action') {
            document.getElementById("actionId").value = row.id;
            document.getElementById("actionTreeId").value = row.tree;

            document.getElementById("id_act_date").value = row.datetime;
            document.getElementById("id_act_executor").value = row.executor;
            $('#id_act_actions').selectpicker('val', row.actions);
            document.getElementById("id_act_comment").value = row.comment;


            {% if perms.citytree.change_careactivity and perms.citytree.can_change_not_own_action_record %}
                $('#saveActButton').prop('disabled',false);
                $('#saveActButton').prop('title','');
            {% elif perms.citytree.change_careactivity and not perms.citytree.can_change_not_own_action_record %}
                if (row.user=={{user.id}}) {
                    $('#saveActButton').prop('disabled',false);
                    $('#saveActButton').prop('title','');
                } else {
                    $('#saveActButton').prop('disabled',true);
                    $('#saveActButton').prop('title','You cannot change information about the action that was created by another user.');
                }
            {% else %}
                $('#saveActButton').prop('disabled',true);
                $('#saveActButton').prop('title','You do not have enough privileges to change the action information.');
            {% endif %}


            {% if perms.citytree.delete_careactivity and perms.citytree.can_delete_not_own_action_record %}
                $('#act_deleteButton').prop('disabled',false);
                $('#act_deleteButton').prop('title','');
            {% elif perms.citytree.delete_careactivity and not perms.citytree.can_delete_not_own_action_record %}
                if (row.user=={{user.id}}) {
                    $('#act_deleteButton').prop('disabled',false);
                    $('#act_deleteButton').prop('title','');
                } else {
                    $('#act_deleteButton').prop('disabled',true);
                    $('#act_deleteButton').prop('title','You cannot delete information about the action that was created by another user.');
                }
            {% else %}
                $('#act_deleteButton').prop('disabled',true);
                $('#act_deleteButton').prop('title','You do not have enough privileges to delete the action information.');
            {% endif %}




            $('#tabAction').show();
            $('#myTab a[href="#action"]').tab('show'); // Select tab by name
            //$('#act_deleteButton').prop('disabled',false);
        }
}



function Slideshow_Inspection_show(row) {
    let photo1 = "";
    let photo2 = "";
    let photo3 = "";
    if (row.photo1 !== "") { photo1 = "{% get_media_prefix %}" + row.photo1 }
    if (row.photo2 !== "") { photo2 = "{% get_media_prefix %}" + row.photo2 }
    if (row.photo3 !== "") { photo3 = "{% get_media_prefix %}" + row.photo3 }
    ShowSlideShow(photo1, photo2, photo3, "Modal")
}





button_NewInspection.onclick = function() {
    document.getElementById("inspTreeId").value = document.getElementById("treeId").value;
    document.getElementById("inspId").value = "";
    document.getElementById("insp_height").value = "";
    document.getElementById("insp_crowndiameter").value = "";
    document.getElementById("insp_trunkgirth").value = "";
    $('#id_insp_remarks').selectpicker('deselectAll');
    $('#id_insp_remarks').selectpicker('val', []);
    document.getElementById("insp_status").value = "";
    $('#id_insp_recommendations').selectpicker('deselectAll');
    $('#id_insp_recommendations').selectpicker('val', []);
    $("#id_insp_img_photo1").attr("src", "{% static 'images/no-photo.png' %}");
    document.getElementById("id_insp_photo1_filename").value = "";
    $("#id_insp_img_photo2").attr("src", "{% static 'images/no-photo.png' %}");
    document.getElementById("id_insp_photo2_filename").value = "";
    $("#id_insp_img_photo3").attr("src", "{% static 'images/no-photo.png' %}");
    document.getElementById("id_insp_photo3_filename").value = "";

    $('#tabInspection').show();
    $('#myTab a[href="#inspection"]').tab('show'); // Select tab by name
    $('#insp_deleteButton').prop('disabled',true);
}

button_NewAction.onclick = function() {
    document.getElementById("actionTreeId").value = document.getElementById("treeId").value;
    document.getElementById("actionId").value = "";
    document.getElementById("id_act_date").value = "";
    document.getElementById("id_act_executor").value = "";
    $('#id_act_actions').selectpicker('deselectAll');
    $('#id_act_actions').selectpicker('val', []);
    document.getElementById("id_act_comment").value = "";

    $('#tabAction').show();
    $('#myTab a[href="#action"]').tab('show'); // Select tab by name
    $('#act_deleteButton').prop('disabled',true);

}
















mymap.on('click', onMapClick);


//=== UTILS ============================================================================================================
var circle_geolocation = L.circle();
function onLocationFound(e) {
    var radius = e.accuracy;

    //L.marker(e.latlng).addTo(mymap)
    //    .bindPopup("You are within " + radius + " meters from this point").openPopup();

    circle_geolocation = L.circle(e.latlng, radius).addTo(mymap);
}

function onLocationError(e) {
    but_geolocation.state('off');
    but_geolocation.button.style.backgroundColor = 'white';
    alert(e.message);
}
mymap.on('locationfound', onLocationFound);
mymap.on('locationerror', onLocationError);




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


function images_inspection_click(){
        let photo1 = document.getElementById("id_insp_photo1_filename").value;
        let photo2 = document.getElementById("id_insp_photo2_filename").value;
        let photo3 = document.getElementById("id_insp_photo3_filename").value;
        console.log(photo1);
        ShowSlideShow(photo1, photo2, photo3, "Modal")
}

// для предпросмотра картинки при выборе фотки для загрузки
function readURL(input, idImg) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $(idImg).attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }
}






document.onreadystatechange = function(){
   if(document.readyState === 'complete'){
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
            IS_MOBILE = true;

            $('#id_recommendations').selectpicker('mobile');
            $('#id_remarks').selectpicker('mobile');
            //$('#species').selectpicker('mobile');

            //$('#filter_species').selectpicker('mobile');
            $('#filter_status').selectpicker('mobile');
            $('#filter_recommendations').selectpicker('mobile');
            $('#filter_remarks').selectpicker('mobile');

            $('#id_insp_remarks').selectpicker('mobile');
            $('#id_insp_recommendations').selectpicker('mobile');

            $('#id_act_actions').selectpicker('mobile');

            mymap.on('drag', onMapDrag);
            mymap.on('zoom', onMapZoom);

            $("#mapid").css("height", "calc(100vh - 113px)");

            $("#id_insp_img_photo1").css("max-width", "80px");
            $("#id_insp_img_photo2").css("max-width", "80px");
            $("#id_insp_img_photo3").css("max-width", "80px");

            $("#id_scrollbar_filter").css("height", "calc(100vh - 190px)");
            $("#id_scrollbar_tree").css("height", "calc(100vh - 160px)");
            $("#id_scrollbar_inspection").css("height", "calc(100vh - 160px)");


            //$('#id_recommendations').attr('data-mobile', true);
        }


    $('#tabTree').hide();
    $('#tabInspection').hide();
    $('#tabAction').hide();
    $('#doneMarkerMobile').hide();
    $('#cancelMarkerMobile').hide();
    $('#divTreeInspActData').hide();


    $( "#button_show_inspact" ).on( "click", button_show_inspact_OnClick );


    $("#id_insp_img_photo1").click(images_inspection_click);
    $("#id_insp_img_photo2").click(images_inspection_click);
    $("#id_insp_img_photo3").click(images_inspection_click);

    $("#id_insp_img_photo1").css('cursor','pointer');
    $("#id_insp_img_photo2").css('cursor','pointer');
    $("#id_insp_img_photo3").css('cursor','pointer');




    // чтобы на при добавлении нового дерева, при заполнении первой инспекции, в img загружался рисунок при его изменении в input type=file
    //$("#id_first_insp_photo1").change(function(){
    //    readURL(this, '#id_first_insp_img_photo1');
    //});

    //$("#id_first_insp_photo2").change(function(){
    //    readURL(this, '#id_first_insp_img_photo2');
    //});
    //$("#id_first_insp_photo3").change(function(){
    //    readURL(this, '#id_first_insp_img_photo3');
    //});



    // чтобы на вкладке Inspection в img загружался рисунок при его изменении в input type=file
    //$("#id_insp_photo1").change(function(){
        //readURL(this, '#id_insp_img_photo1');
        //document.getElementById("id_insp_photo1_filename").value = this.files[0].name;
    //});
    //$("#id_insp_photo2").change(function(){
    //    readURL(this, '#id_insp_img_photo2');
    //    document.getElementById("id_insp_photo2_filename").value = this.files[0].name;
    //});
    //$("#id_insp_photo3").change(function(){
    //     readURL(this, '#id_insp_img_photo3');
    //    document.getElementById("id_insp_photo3_filename").value = this.files[0].name;
    //});




    PermissionsApply();
    AjaxLoadJson();
   }
}


function AjaxLoadJson(){
    // Add AJAX request for data
    let treedata_ajax = $.ajax({
      //url:"{% static 'varna.json' %}",
      //url:"{% get_static_prefix %}citytree/geojson/{{obj_city.sysname}}.json",
      url: "{% url 'citytree_geojson_get' city_name=obj_city.sysname %}",


      dataType: "json",
      success: console.log("County data successfully loaded."),
      error: function (xhr) {
        //alert(xhr.statusText)
        // т.к. файла geojson файла пока нет, создаем
        ajax_geojson = {"type": "FeatureCollection", "features": []};

        // добавляем маркеры которые пришли из базы в json которые подгрузились из Ajax
        for (i in treeData.features) {
            if (treeData.features[i].properties.is_deleted == 0) {
                ajax_geojson.features.push(treeData.features[i]);
            }
            //idsFromDB.push(treeData.features[i].properties.id);
        }

        LoadTreesToMap(true, false); // нпервоначальная загрузка, фильтр отключен
      }
    })


    $.when(treedata_ajax).done(function() {
        ajax_geojson = treedata_ajax.responseJSON;

        // добавляем маркеры которые пришли из базы в json которые подгрузились из Ajax
        // также в массив добавляем id деревьев, которые нужно отфильтровать из ajax json, т.к. могут присутствовать маркеры, которые были отредактированы, соотвественно они измененные и пришли из БД, а файл geojson обновляетне только переодически
        for (i in treeData.features) {
            if (treeData.features[i].properties.is_deleted == 0) {
                ajax_geojson.features.push(treeData.features[i]);
            }
            idsFromDB.push(treeData.features[i].properties.id);
        }

        //LoadTreesToMap(true);
        LoadTreesToMap(true, false); // нпервоначальная загрузка, фильтр отключен

        //console.log(treeData)

        /*
        // create circleMarker from geoJson
        markers = L.geoJSON(ajax_geojson, {
            pointToLayer: function (feature, latlng) {
                //geojsonMarkerOptions.radius = ZoomToRadius(mymap.getZoom(), feature.properties.trunkgirth);
                geojsonMarkerOptions.radius = feature.properties.crowndiameter;
                return L.circle(latlng, geojsonMarkerOptions).on('click', markerOnClick);//.addTo(mymap);
            },
            filter: function(feature, layer) {

                //console.log(feature.properties.ajax)

                if (feature.properties.ajax == 1 && idsFromDB.includes(feature.properties.id)) {
                    return false
                } else {
                    return true;
                }
                //return true;

            }

        });

        //document.getElementById("dateFrom").value = formatDate(datefilter_Min);
        //document.getElementById("dateTo").value = formatDate(datefilter_Max);



        mymap.addLayer(markers);*/

    });



}




function PermissionsApply(){
    {% if not perms.citytree.add_tree %} but_newmarker.disable(); {% endif %}
    {% if not perms.citytree.add_inspection %} $('#id_button_NewInspection').prop('disabled',true); $('#id_button_NewInspection').prop('title','You don\'t have access to this action'); {% endif %}
    {% if not perms.citytree.add_careactivity %} $('#id_button_NewAction').prop('disabled',true); $('#id_button_NewAction').prop('title','You don\'t have access to this action'); {% endif %}
}





{% load static %}

let IS_MOBILE = false;

let button_filter = document.getElementById('apply_Filter');
let button_reset = document.getElementById('reset_Filter');
let button_closeTabUrbanObject = document.getElementById('button_CloseTabUrbanObject');

let input_photo1 = document.getElementById('id_photo1');
let input_photo2 = document.getElementById('id_photo2');
let input_photo3 = document.getElementById('id_photo3');

let markers;
let markers_is_dot

let isochronsLayer = L.layerGroup();







let mymap = L.map('mapid', { zoomControl: false }).setView(
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



let tilesDefault = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 21,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZHJpdmVzb2Z0IiwiYSI6ImNqY3hkMzAwNTAwM2IzM28zajFoeG1pamYifQ.w5UaGnR0OMDIa6ARiyWoYQ'
})//.addTo(mymap);

let tilesDark = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 21,
    id: 'mapbox/dark-v10', //
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZHJpdmVzb2Z0IiwiYSI6ImNqY3hkMzAwNTAwM2IzM28zajFoeG1pamYifQ.w5UaGnR0OMDIa6ARiyWoYQ'
});//.addTo(mymap);


let tilesSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri',
	maxZoom: 19
});//.addTo(mymap);


let tilesSat2 = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 21,
    id: 'mapbox/satellite-v9',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZHJpdmVzb2Z0IiwiYSI6ImNqY3hkMzAwNTAwM2IzM28zajFoeG1pamYifQ.w5UaGnR0OMDIa6ARiyWoYQ'
});//.addTo(mymap);


let tilesSatBing = L.tileLayer.bing('AniAD3xsGTaSbK1pa0_UkWS1CldG0nGI7r55MlVZqHhyKil9rD9dFK8536u8hTj1', {
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

let baseMaps = {
    "Default": tilesDefault,
    "Dark": tilesDark,
    "Sat1": tilesSatBing,
    "Sat2": tilesSat,
    "Sat3": tilesSat2
};

let overlayMaps = {
    //"Heatmap": heatmapLayer
};

L.control.layers(baseMaps, overlayMaps, {position: 'topleft'}).addTo(mymap);

// save map tiles
mymap.on('baselayerchange', function(e) {
    $.ajax({
        url: "{% url 'set_mapname' %}",
        data: {'mapname': e.name}
    });
});



// create a geoJson data from database
let urbanObjectsData = {
  "type": "FeatureCollection",
  "features": []
};


let myRenderer = L.canvas({ padding: 0.5 });




// create button to create a new marker
let but_newmarker = L.easyButton({
    position: 'topright',
    states:[
        {
            stateName: 'off',
            icon: '<i class="fas fa-map-marker-alt fa-lg"></i>',
            onClick: function(control){

                mymap.removeLayer(newMarker);
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




// create button for geolocation
let but_geolocation = L.easyButton({
    position: 'topright',
    states:[
        {
            stateName: 'off',
            icon: '<i class="fas fa-satellite-dish fa-lg"></i>',
            onClick: function(control){
                control.state('on');
                setView_nTimes_gps = 4;
                but_geolocation.button.style.backgroundColor = 'red';
                mymap.locate({/*setView: true, */maxZoom: 20, enableHighAccuracy: true, watch:true, maximumAge: 20000});
            }
        },

        {
            stateName: 'on',
            icon: '<i class="fas fa-satellite-dish fa-lg"></i>',
            onClick: function(control){
                control.state('off');
                but_geolocation.button.style.backgroundColor = 'white';
                mymap.stopLocate();
                mymap.removeLayer(circle_geolocation);
                setView_nTimes_gps = 4;
            }
        }]
});

but_geolocation.addTo(mymap);





//==== EVENTS ==========================================================================================================



let newMarker = new L.marker()
let redIcon = new L.Icon({ // https://github.com/pointhi/leaflet-color-markers
  iconUrl: '{% static 'markers/marker-red.png' %}',
  shadowUrl: '{% static 'markers/marker-shadow.png' %}',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});


let MarkersObject = {};




// генерируем маркеры для каждой категории
{% for cat in categories %}

    MarkersObject["{{ cat.icon }}"] = new L.divIcon({
   	    className: 'custom-div-icon',
        html: "<div style='background-color:#{{cat.markercolor}};' class='marker-pin'></div><i class='{{cat.icon}} awesome'>",
        iconSize: [30, 42],
        iconAnchor: [15, 42]
    });

    MarkersObject["{{ cat.icon }}_dot"] = new L.divIcon({
        className: '',
        html: '<span class="marker-dot" style="background-color: #{{cat.markercolor}};"></span>',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });

{% endfor %}





// to create a new marker for desktop verion
function onMapClick(e) {
    $('.navbar-collapse').collapse('hide'); // устраняет баг, если меню раскрыто при клике по карте оно закрывается
    //if (selectedMarker) {
    //    selectedMarker.setStyle({stroke: false, weight: 0, color: "#008000"});
    //}

    if (!IS_MOBILE && but_newmarker.state() == 'on')
    {
        $('#id_tabUrbanobject').show();

        $("#saveButton").html('Запази');
        $('#saveButton').prop('disabled', false);
        $('#saveButton').prop('title','');

        $('#myTab a[href="#id_urbanobject"]').tab('show'); // Select tab by name



        // delete previous marker if exists
        mymap.removeLayer(newMarker)
        newMarker = new L.marker(e.latlng, {icon: redIcon, draggable: true}).addTo(mymap);


        OpenSidebar();

        newMarker.on('dragend', function (e) {
            document.getElementById('id_latitude').value = newMarker.getLatLng().lat.toFixed(5);
            document.getElementById('id_longitude').value = newMarker.getLatLng().lng.toFixed(5);
        });




        document.getElementById("id_urbanObjectId").value = '';
        document.getElementById("id_latitude").value = e.latlng.lat.toFixed(5);
        document.getElementById("id_longitude").value = e.latlng.lng.toFixed(5);


        document.getElementById("id_category").value = 0;
        $('#id_subcategories').selectpicker('val', []);
        subcategoriesInputElementUpdate($('#id_category'), true); // чтобы скрыть items

        document.getElementById("id_description").value = '';
        document.getElementById("id_comment").value = '';
        document.getElementById("id_googlestreeturl").value = '';
        $('#id_rating').rating('clear');

        document.getElementById("id_photo1_new_name").value = '';
        document.getElementById("id_photo2_new_name").value = '';
        document.getElementById("id_photo3_new_name").value = '';


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

function startEditMarkerMobile() {
    CloseSidebar();
    but_newmarker.state('on');
    but_newmarker.button.style.backgroundColor = 'red';

    sleep(400).then(() => {
        $('#doneEditMarkerMobile').show();
        $('#cancelMarkerMobile').show();
        let latlng = L.latLng(document.getElementById('id_latitude').value, document.getElementById('id_longitude').value);
        mymap.panTo(latlng);
        newMarker = new L.marker(latlng, {icon: redIcon, draggable: false}).addTo(mymap);
    });


}





document.getElementById("doneMarkerMobile").onclick = buttonDoneMarkerMobileOnClick;
document.getElementById("doneEditMarkerMobile").onclick = buttonDoneEditMarkerMobileOnClick;
document.getElementById("cancelMarkerMobile").onclick = buttonCancelMarkerMobileOnClick;

function buttonDoneMarkerMobileOnClick(e) {
    $('#doneMarkerMobile').hide();
    $('#cancelMarkerMobile').hide();
    $('#id_tabUrbanobject').show();

    $("#saveButton").html('Запази');
    $('#myTab a[href="#id_urbanobject"]').tab('show'); // Select tab by name


    document.getElementById("id_urbanObjectId").value = '';
    document.getElementById('id_latitude').value = newMarker.getLatLng().lat.toFixed(5);
    document.getElementById('id_longitude').value = newMarker.getLatLng().lng.toFixed(5);


    document.getElementById("id_category").value = 0;
    $('#id_subcategories').selectpicker('val', []);
    subcategoriesInputElementUpdate($('#id_category'), true); // чтобы скрыть items

    document.getElementById("id_description").value = '';
    document.getElementById("id_comment").value = '';
    document.getElementById("id_googlestreeturl").value = '';

    document.getElementById("id_photo1_new_name").value = '';
    document.getElementById("id_photo2_new_name").value = '';
    document.getElementById("id_photo3_new_name").value = '';



    but_newmarker.state('off');
    but_newmarker.button.style.backgroundColor = 'white';
    OpenSidebar();
}


function buttonDoneEditMarkerMobileOnClick(e) {
    $('#doneEditMarkerMobile').hide();
    $('#cancelMarkerMobile').hide();
    document.getElementById('id_latitude').value = newMarker.getLatLng().lat.toFixed(5);
    document.getElementById('id_longitude').value = newMarker.getLatLng().lng.toFixed(5);
    OpenSidebar();
}

function buttonCancelMarkerMobileOnClick(e) {
    $('#doneMarkerMobile').hide();
    $('#doneEditMarkerMobile').hide();
    $('#cancelMarkerMobile').hide();

    // delete previous marker if exists
    mymap.removeLayer(newMarker);
    but_newmarker.state('off');
    but_newmarker.button.style.backgroundColor = 'white';
}



var selectedMarker; // выбранный маркер, чтобы сделать обводку
function markerOnClick(e)
{

  let marker = e.target;
  let geojson = marker.toGeoJSON();



  //if (selectedMarker) {
  //  selectedMarker.setStyle({stroke: false, weight: 0, color: "#008000", opacity: 1});
  //}

  //marker.setStyle({stroke: true, weight: 3, color: "#FFFFFF", opacity: 0.7}); // выделяем выбранный маркер
  //selectedMarker = marker;

  // delete previous marker if exists
  mymap.removeLayer(newMarker);


  $.ajax({
        url: "{% url 'get_urban_object' %}",
        //data: {'idtree': document.getElementById("treeId").value},
        data: {'idUrbanObject': geojson.properties.id},
        dataType: 'json',
        success: function (jsonResult) {
            let obj_UrbanObject = jQuery.parseJSON(jsonResult);


            $("#id_objectpreview_title_category").text(obj_UrbanObject.fields.category);
            $("#id_objectpreview_cat").text(obj_UrbanObject.fields.category);

            $("#id_objectpreview_subcats").text(obj_UrbanObject.fields.subcategories_text);
            if (obj_UrbanObject.fields.subcategories_text) {
                $("#id_div_objectpreview_subcats").show();
            } else {
                $("#id_div_objectpreview_subcats").hide();
            }

            $("#id_objectpreview_description").text(obj_UrbanObject.fields.description);
            if (obj_UrbanObject.fields.description) {
                $("#id_div_objectpreview_description").show();
            } else {
                $("#id_div_objectpreview_description").hide();
            }

            $("#id_objectpreview_comment").text(obj_UrbanObject.fields.comment);
            if (obj_UrbanObject.fields.comment) {
                $("#id_div_objectpreview_comment").show();
            } else {
                $("#id_div_objectpreview_comment").hide();
            }


            if (obj_UrbanObject.fields.googlestreeturl) {
                $("#id_objectpreview_googlestreetview").html('<a href="'+obj_UrbanObject.fields.googlestreeturl+'" target="_blank"><i class="fas fa-external-link-alt"></i>');
                $("#id_div_objectpreview_googlestreetview").show();
            } else {
                $("#id_objectpreview_googlestreetview").html('');
                $("#id_div_objectpreview_googlestreetview").hide();
            }

            if (obj_UrbanObject.fields.rating == 0) { // чтобы показывать надпись not rated
                $('#id_rating_preview').rating('refresh', {showCaption: true});
            } else {
                $('#id_rating_preview').rating('refresh', {showCaption: false});
            }

            $('#id_rating_preview').rating('update', obj_UrbanObject.fields.rating);

        }
  });


  $('#id_modalObjectInfo').modal('show');


  document.getElementById("id_urbanObjectId").value = geojson.properties.id;
  //Show_Inspections_Actions_Table('PreviewTree', geojson.properties.id);


  let photo1 = "";
  let photo2 = "";
  let photo3 = "";

  if (geojson.properties.photo1 !== "") { photo1 = "{% get_media_prefix %}" + geojson.properties.photo1 }
  if (geojson.properties.photo2 !== "") { photo2 = "{% get_media_prefix %}" + geojson.properties.photo2 }
  if (geojson.properties.photo3 !== "") { photo3 = "{% get_media_prefix %}" + geojson.properties.photo3 }


  if (photo1 == "" && photo2 == "" && photo3 == "") { photo1 = "{% static 'images/no-photo.png' %}"}

  ShowSlideShow(photo1, photo2, photo3, "ObjectPreview")



  let editButton_ObjectPreview = document.getElementById('id_editButton_ObjectPreview');
  editButton_ObjectPreview.onclick = function() {
    $('#id_modalObjectInfo').modal('hide');
    EditUrbanObject (geojson);
  }


}


$('#id_category').change(function() {
    subcategoriesInputElementUpdate(this, true);
})

// для связанного списка подкатегорий, показываем только дочерние подкатегории
function subcategoriesInputElementUpdate(catElement, clearSubcats) {
    if (clearSubcats) {
        $('#id_subcategories').selectpicker('val', []);
    }

    $("#id_subcategories").find('.subcat-items').hide();

    if ($(catElement).val()) {
        $("#id_subcategories").find('.cat_id_'+$(catElement).val()).show();
        if ($('.cat_id_'+$(catElement).val()).length == 0) {
            $("#id_subcategories").selectpicker({title: 'Няма подкатегории'});
        } else {
            $("#id_subcategories").selectpicker({title: 'Нищо не е избрано'});
        }
    } else {
        $("#id_subcategories").selectpicker({title: 'Няма подкатегории'});
    }

    $('#id_subcategories').selectpicker('refresh');
}



function EditUrbanObject (geojson) {

  //let $table_InspActData = $('#table_InspActData');
  //$table_InspActData.bootstrapTable('destroy');
  //$('#divTreeInspActData').hide();


  // читаем координаты в properties, т.к. в geometry они почему то меняются из за того, видимо из за того, что маркеры смещаются когда кластер раскрывается
  document.getElementById("id_latitude").value = geojson.properties.coordinates[1];
  document.getElementById("id_longitude").value = geojson.properties.coordinates[0];


  //$('#id_category').selectpicker('val', geojson.properties.category);
  document.getElementById("id_category").value = geojson.properties.category;
  $('#id_subcategories').selectpicker('val', geojson.properties.subcategories);
  subcategoriesInputElementUpdate($('#id_category'), false);


  document.getElementById("id_description").value = geojson.properties.description;
  document.getElementById("id_comment").value = geojson.properties.comment.replace(/<br\s*[\/]?>/gi, "\n");
  document.getElementById("id_googlestreeturl").value = geojson.properties.googlestreeturl;
  $('#id_rating').rating('update', geojson.properties.rating);
  document.getElementById("id_urbanObjectId").value = geojson.properties.id;

  $("#saveButton").html('Актуализиране');



    if (geojson.properties.photo1 !== "") {
        $("#id_img_photo1").attr("src", "{% get_media_prefix%}"+geojson.properties.photo1);
        //document.getElementById("id_photo1_filename").value = "{% get_media_prefix %}"+geojson.properties.photo1;
    } else {
        $("#id_img_photo1").attr("src", "{% static 'images/no-photo.png' %}");
        //document.getElementById("id_photo1_filename").value = "";
        document.getElementById("id_photo1_new_name").value = "";
    }

    if (geojson.properties.photo2 !== "") {
        $("#id_img_photo2").attr("src", "{% get_media_prefix%}"+geojson.properties.photo2);
        //document.getElementById("id_photo2_filename").value = "{% get_media_prefix %}"+geojson.properties.photo2;
    } else {
        $("#id_img_photo2").attr("src", "{% static 'images/no-photo.png' %}");
        //document.getElementById("id_photo2_filename").value = "";
        document.getElementById("id_photo2_new_name").value = "";
    }

    if (geojson.properties.photo3 !== "") {
        $("#id_img_photo3").attr("src", "{% get_media_prefix%}"+geojson.properties.photo3);
        //document.getElementById("id_photo3_filename").value = "{% get_media_prefix %}"+geojson.properties.photo3;
    } else {
        $("#id_img_photo3").attr("src", "{% static 'images/no-photo.png' %}");
        //document.getElementById("id_photo3_filename").value = "";
        document.getElementById("id_photo3_new_name").value = "";
    }





  {% if perms.coregis.change_coreurbanobject and perms.coregis.can_change_not_own_object_record %}
    $('#saveButton').prop('disabled',false);
    $('#saveButton').prop('title','');
  {% elif perms.coregis.change_coreurbanobject and not perms.coregis.can_change_not_own_object_record %}
    if (geojson.properties.user_id=={{user.id}}) {
        $('#saveButton').prop('disabled',false);
        $('#saveButton').prop('title','');
    } else {
        $('#saveButton').prop('disabled',true);
        $('#saveButton').prop('title','You cannot change information about the object that was created by another user.');
    }
  {% else %}
    $('#saveButton').prop('disabled',true);
    $('#saveButton').prop('title','You do not have enough privileges to change the object information.');
  {% endif %}


  {% if perms.coregis.delete_coreurbanobject and perms.coregis.can_delete_not_own_object_record %}
    $('#deleteButton').prop('disabled',false);
    $('#deleteButton').prop('title','');
  {% elif perms.coregis.delete_object and not perms.coregis.can_delete_not_own_object_record %}
    if (geojson.properties.user_id=={{user.id}}) {
        $('#deleteButton').prop('disabled',false);
        $('#deleteButton').prop('title','');
    } else {
        $('#deleteButton').prop('disabled',true);
        $('#deleteButton').prop('title','You cannot delete the object that was created by another user.');
    }
  {% else %}
    $('#deleteButton').prop('disabled',true);
    $('#deleteButton').prop('title','You don\'t have enough privileges to remove the object.');
  {% endif %}




  $('#id_tabUrbanobject').show();
  $('#myTab a[href="#id_urbanobject"]').tab('show'); // Select tab by name





  //Show_Inspections_Actions_Table('EditTree', geojson.properties.id);
  OpenSidebar();
}



document.getElementById("id_edit_coord").onclick = iEditCoordOnClick;
function iEditCoordOnClick(e) {
    // если в режиме редактирования дерева
    if (document.getElementById("id_urbanObjectId").value) {

        if (IS_MOBILE) {
            startEditMarkerMobile();
        } else {

            // delete previous marker if exists
            mymap.removeLayer(newMarker)

            let latlng = L.latLng(document.getElementById('id_latitude').value, document.getElementById('id_longitude').value);
            newMarker = new L.marker(latlng, {icon: redIcon, draggable: true}).addTo(mymap);

            newMarker.on('dragend', function (e) {
                document.getElementById('id_latitude').value = newMarker.getLatLng().lat.toFixed(5);
                document.getElementById('id_longitude').value = newMarker.getLatLng().lng.toFixed(5);
            });
        }

    }

}




function ShowSlideShow(photo1, photo2, photo3, id_carousel_suffix) {
    // clear then populate slider
    $('#id_container_'+id_carousel_suffix+' .carousel-inner').html('');
    $('#id_container_'+id_carousel_suffix+' .carousel-indicators').html('');

    let i = 0;
    let result = false;

    if (photo1 != "") {
        $('<div class="carousel-item"><img style="background: transparent url({% static 'images/loader_white.gif' %}) no-repeat scroll center center; min-height: 64px" class="d-block w-100" src="'+ photo1 +'"></div>').appendTo('#id_container_'+id_carousel_suffix+' .carousel-inner');
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



function ZoomToRadius (zoom, crowndiameter) {
    if (zoom > 17) {
        r = Math.floor(crowndiameter / 2);
    } else if (zoom == 17){
        r = 7;
    } else if (zoom == 16){
        r = 10;
    } else if (zoom == 15){
        r = 14;
    } else if (zoom == 14){
        r = 19
    } else if (zoom == 13){
        r = 24
    } else if (zoom == 12){
        r = 30
    } else if (zoom == 11){
        r = 37
    } else if (zoom < 11){
        r = 45
    }

    if (r < 2) { r = 2 }
    return r;
}

mymap.on('zoomend', function() {
    ChangeMarkerToDot(false);
});

// в зависимости от масштаба, показывает маркер или точки
function ChangeMarkerToDot(force){
    let zoom = mymap.getZoom();

    if (zoom > 13) {
        if (markers_is_dot || markers_is_dot === undefined || force) {
            markers.eachLayer(function (marker) {
                let geojson = marker.toGeoJSON();
                marker.setIcon(MarkersObject[geojson.properties.icon]);
            });
        }

        markers_is_dot = false;

    } else {

        if (!markers_is_dot || markers_is_dot === undefined || force) {
            markers.eachLayer(function (marker) {
                let geojson = marker.toGeoJSON();
                marker.setIcon(MarkersObject[geojson.properties.icon+'_dot']);
            });
        }

        markers_is_dot = true;

    }
}



function LoadUrbanObjectsToMap(firsttime, filterEnabled) {
    if (!firsttime) {
        mymap.removeLayer(markers);
        mymap.removeLayer(isochronsLayer);
        isochronsLayer = L.layerGroup();
    }


    markers = L.geoJSON(urbanObjectsData, {
        pointToLayer: function (feature, latlng) {
            //return L.marker(latlng, {icon: MarkersObject[feature.properties.icon]}).on('click', markerOnClick);
            return L.marker(latlng).on('click', markerOnClick);
        },

        filter: function(feature, layer) {

            if (filterEnabled) {

                //let catsubcategories_values = $('#id_filter_category').val();
                let catsubcategories_values = $('#id_filter_category').jstree(true).get_selected()

                let description_value = document.getElementById("id_filter_description").value;
                let comment_value = document.getElementById("id_filter_comment").value;
                let is_rating_object_involved = $('#id_filter_checkbox_rating_radius').prop('checked');

                let catsubcategories_values_Filter = true;
                let description_Filter = true;
                let comment_Filter = true;


                if (description_value) {
                    if (feature.properties.description.toLowerCase().indexOf(description_value.toLowerCase()) == -1) {
                        description_Filter = false;
                    }
                }

                if (comment_value) {
                    if (feature.properties.comment.toLowerCase().indexOf(comment_value.toLowerCase()) == -1) {
                        comment_Filter = false;
                    }
                }



                if (catsubcategories_values.length>0) {
                    // проверяем,пересекаются ли два массива
                    let intersection = catsubcategories_values.filter(x => feature.properties.catsubcategories.includes(x));
                    catsubcategories_values_Filter = intersection.length > 0;

                }

                let result = catsubcategories_values_Filter && description_Filter && comment_Filter;

                //alert(document.getElementById("id_filter_radius").value)
                if (result && document.getElementById("id_filter_radius").value) {
                    let latlng = L.latLng(feature.properties.coordinates[1], feature.properties.coordinates[0]);




                    if (feature.properties.rating > 0 || !is_rating_object_involved) {
                        let circleOpacity;

                        if (is_rating_object_involved) {
                            circleOpacity = (feature.properties.rating-1) * 0.17 + 0.1;
                        } else {
                            circleOpacity = 0.5;
                        }

                        let circle = L.circle(latlng, { radius: document.getElementById("id_filter_radius").value,
                                                        renderer: myRenderer,
                                                        fillColor: "#0095ff",
                                                        color: "#008000",
                                                        weight: 0,
                                                        opacity: 1,
                                                        fillOpacity: circleOpacity
                                                      });

                        isochronsLayer.addLayer(circle);
                    }
                }


                return result;

            } else {
                return true; // если filterEnabled = False
            }


        }
    });//.addTo(mymap);



    ChangeMarkerToDot(true); // в зависимости от масштаба, показывает маркер или точки
    mymap.addLayer(markers);
    mymap.addLayer(isochronsLayer);
}






button_filter.onclick = function() {
    LoadUrbanObjectsToMap(false, true); // не первоначальная загрузка, фильтр задействован
    if (IS_MOBILE) {
        CloseSidebar();
    }


}

button_reset.onclick = function() {
    //$('#id_filter_category').selectpicker('deselectAll');
    $('#id_filter_category').jstree(true).deselect_all();
    $('#id_filter_radius').value = 0;

    document.getElementById("id_filter_description").value = '';
    document.getElementById("id_filter_comment").value = '';
    document.getElementById("id_filter_radius").value = 0;
    $('#id_filter_checkbox_rating_radius').prop('checked', false);

    LoadUrbanObjectsToMap(false, false); // не первоначальная загрузка, фильтр отключен
    if (IS_MOBILE) {
        CloseSidebar();
    }
}






button_closeTabUrbanObject.onclick = function() {
    // delete previous marker if exists
    mymap.removeLayer(newMarker);

    $('#myTab a[href="#id_filter"]').tab('show'); // Select tab by name
    $('#id_tabUrbanobject').hide();
}










function onMapDrag(e) {
    let center = mymap.getCenter();  //get map center
    if (but_newmarker.state() == 'on') {
        newMarker.setLatLng(center);
    }

}

function onMapZoom(e) {
    let center = mymap.getCenter();  //get map center
    if (but_newmarker.state() == 'on') {
        newMarker.setLatLng(center);
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












mymap.on('click', onMapClick);





input_photo1.onchange = function() {
    OnChangeInputFileElementForResize(this, 1500, 'id_img_photo1', 'saveButton');
}

input_photo2.onchange = function() {
    OnChangeInputFileElementForResize(this, 1500, 'id_img_photo2', 'saveButton');
}

input_photo3.onchange = function() {
    OnChangeInputFileElementForResize(this, 1500, 'id_img_photo3', 'saveButton');
}


//=== UTILS ============================================================================================================
var circle_geolocation = L.circle();
var setView_nTimes_gps = 4; // чтобы только N раз установить центр карты по GPS локации, иначе карта будет двигаться переодически за gps координатами
function onLocationFound(e) {
    let radius = e.accuracy / 2;

    if (setView_nTimes_gps > 0) {
        mymap.setView(e.latlng, 20);
        setView_nTimes_gps = setView_nTimes_gps - 1;
    }

    if (mymap.hasLayer(circle_geolocation)) {
        circle_geolocation.setLatLng(e.latlng);
        circle_geolocation.setRadius(radius);
    } else {
        circle_geolocation = L.circle(e.latlng, radius).addTo(mymap);
    }
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

function CloseSidebar(){
    if ($("#sidebar-wrapper").css("margin-left") == "0px" ) {
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
        //console.log(photo1);
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

            //$('#id_filter_category').selectpicker('mobile');
            //$('#id_subcategories').selectpicker('mobile');


            mymap.on('drag', onMapDrag);
            mymap.on('zoom', onMapZoom);

            $("#mapid").css("height", "calc(100vh - 113px)");

            //$("#id_insp_img_photo1").css("max-width", "80px");
            //$("#id_insp_img_photo2").css("max-width", "80px");
            //$("#id_insp_img_photo3").css("max-width", "80px");

            $("#id_scrollbar_filter").css("height", "calc(100vh - 190px)");
            $("#id_scrollbar_urbanobject").css("height", "calc(100vh - 160px)");
            //$("#id_scrollbar_inspection").css("height", "calc(100vh - 160px)");


            //$('#id_recommendations').attr('data-mobile', true);
        }


    $('#id_tabUrbanobject').hide();
    //$('#tabInspection').hide();
    //$('#tabAction').hide();
    $('#doneMarkerMobile').hide();
    $('#cancelMarkerMobile').hide();


    //$("#id_insp_img_photo1").click(images_inspection_click);
    //$("#id_insp_img_photo2").click(images_inspection_click);
    //$("#id_insp_img_photo3").click(images_inspection_click);

    //$("#id_insp_img_photo1").css('cursor','pointer');
    //$("#id_insp_img_photo2").css('cursor','pointer');
    //$("#id_insp_img_photo3").css('cursor','pointer');

        //$('#id_urbanobject').hide();


        PermissionsApply();

        $.getJSON("{% url 'urbanobject_geojson_get' city_name=obj_city.sysname %}", function(json) {
            urbanObjectsData = json;
            LoadUrbanObjectsToMap(true, true);
        });






    $('#saveButton').click(function(){

        // Get the file from frontend
   	    let myFile1 = $('#id_photo1').prop('files');
   	    let myFile2 = $('#id_photo2').prop('files');
   	    let myFile3 = $('#id_photo3').prop('files');

        // если во всех нету файла или он уже загружен, тогда кликаем submit
        if ( (!myFile1[0] || $('#id_photo1_browse_button').text() === 'Done') &&
             (!myFile2[0] || $('#id_photo2_browse_button').text() === 'Done') &&
             (!myFile3[0] || $('#id_photo3_browse_button').text() === 'Done') ){

            $('#saveButtonSubmit').click();

        } else {

            if(myFile1[0] && $('#id_photo1_browse_button').text() !== 'Done'){
                let data1 = {file_name: myFile1[0].name};
                $('#id_photo1_loading').show();
                StartUpload(myFile1, data1, 'id_photo1');
            }

            if(myFile2[0] && $('#id_photo2_browse_button').text() !== 'Done'){
                let data2 = {file_name: myFile2[0].name};
                $('#id_photo2_loading').show();
                StartUpload(myFile2, data2, 'id_photo2');
            }

            if(myFile3[0] && $('#id_photo3_browse_button').text() !== 'Done'){
                let data3 = {file_name: myFile3[0].name};
                $('#id_photo3_loading').show();
                StartUpload(myFile3, data3, 'id_photo3');
            }
        }


        function StartUpload(fileObj, data, idElement) {
            //$("#saveButton").html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Запази');
            SetStateSaveButton('saveButton', false, 'Запази');
            $('#'+idElement+'_new_name').val(data.file_name);

            $.ajax({
                type: "GET",
                url: "{% url 'generate_signed_url_urbanobj' %}",
                data: data,
                timeout: 15000,
                async: true,
                success: function(response){
                    let responseData = jQuery.parseJSON(response);
                    if (responseData.file_exists === false) {
                        uploadFile(fileObj[0], responseData.data, responseData.final_file_name, idElement, 'saveButtonSubmit');
                    } else {
                        let rndStr = makeRandomStr(5);
                        //$('#'+idElement+'_new_name').val(rndStr+'_'+ fileObj[0].name);
                        let data_new = {file_name: rndStr + '_' + fileObj[0].name};
                        StartUpload(fileObj, data_new, idElement);
                    }

                },

                error: function(){
                    //$("#saveButton").html('Запази');
                    SetStateSaveButton('saveButton', true, 'Запази');
                    $('#'+idElement+'_loading').hide();
                    $('#'+idElement+'_browse_button').html('Browse...');
                    alert('Error: generate_presigned_post');
                },

            });
        }


   });


    //$('#jstree2').jstree(true).get_selected()
    $('#id_filter_category').jstree({'plugins':["wholerow","checkbox"], "checkbox":{"three_state": false, "keep_selected_style": false},
                            'core' : {
								'data' : [

                                    {% for cat in categories %}
                                    {
                                        "text" : "<big>{{ cat.catname }}</big>",  "icon": "{{ cat.icon }}", "id": "{{ cat.id }}", "state": {"selected": true},
                                        "children" : [
                                        {% for subcat in cat.subcats.all %}
                                            { "text" : "{{ subcat.subcatname }} <span style='color: #aaaaaa'><small>({{ subcat.comment }})</small></span>", "icon" : "{{ cat.icon }}", "id": "_{{ subcat.id }}" },
                                        {% endfor %}
                                        ]

                                    },
                                    {% endfor %}

								]
							}});


$('#id_filter_category')
  // listen for event
  .on('changed.jstree', function (e, data) {
        //alert('dfg')
  })

$('#id_filter_category')
    .on('loaded.jstree', function (e, data) {
        {% for cat in categories %}
        $("#{{ cat.id }}").css("background-color","#{{ cat.markercolor|truncatechars:6 }}40");
        {% endfor %}

        //data.instance.select_node('3');
        //data.instance.select_node('4');
    })



$('#id_filter_category')
  .on('select_node.jstree', function (e, data) {
          // снимаем чекбокс для родительского элемента, если чакаем дочерний
        if (data.node.id.charAt(0) === '_') {
            data.instance.deselect_node(data.node.parent);
        } else { // снимаем чекбоксы с дочерних элементов, если родительский чекнут
            data.instance.deselect_node(data.node.children);
        }
  })




   }
}












function PermissionsApply(){
    {% if not perms.coregis.add_coreurbanobject %}
    but_newmarker.disable();
    {% endif %}
}



function uploadFile(file, s3Data, final_file_name, idElement, id_SubmitButton){
  var xhr = new XMLHttpRequest();
  xhr.open("POST", s3Data.url);
  xhr.timeout = 30000;
  xhr.upload.onprogress = updateProgress;

  var postData = new FormData();
  for(key in s3Data.fields){
    postData.append(key, s3Data.fields[key]);
  }
  postData.append('file', file);


  xhr.onreadystatechange = function() {
    if(xhr.readyState === 4){
      if(xhr.status === 200 || xhr.status === 204){

      }
      else{
        SetStateSaveButton('saveButton', true, 'Запази');
        SetStateSaveButton('saveInspButton', true, 'Запази');
        $('#'+idElement+'_loading').hide();
        $('#'+idElement+'_browse_button').html('Browse...');
        alert('Error during file upload (status: '+xhr.status+'): ' + file.name);
      }
   }
  };


  xhr.onload = function () {
        //document.getElementById("preview").src = url;
        //document.getElementById("avatar-url").value = url;
        $('#'+idElement+'_loading').hide();
        $('#'+idElement+'_browse_button').html('Done');

        // чтобы определить, когда все файлы загрузились, значит можно нажимать кнопку Submit
        let myFile1 = $('#'+idElement.slice(0, -1)+'1').prop('files');
        let myFile2 = $('#'+idElement.slice(0, -1)+'2').prop('files');
        let myFile3 = $('#'+idElement.slice(0, -1)+'3').prop('files');

        let File1Done = false;
        let File2Done = false;
        let File3Done = false;

        if (!myFile1[0]) { File1Done = true; }
        if (!myFile2[0]) { File2Done = true; }
        if (!myFile3[0]) { File3Done = true; }

        if (myFile1[0] && $('#'+idElement.slice(0, -1)+'1_browse_button').text() === 'Done') { File1Done = true; }
        if (myFile2[0] && $('#'+idElement.slice(0, -1)+'2_browse_button').text() === 'Done') { File2Done = true; }
        if (myFile3[0] && $('#'+idElement.slice(0, -1)+'3_browse_button').text() === 'Done') { File3Done = true; }


        if ( File1Done && File2Done && File3Done ) {
            SetStateSaveButton('saveButton', true, 'Запази');
            SetStateSaveButton('saveInspButton', true, 'Запази');

            // очищаем елемент, в котором храняться фотки, чтобы POST запрос не передавал файлы на сервер, т.к. загрузка файлов идет напрямую в S3
            document.getElementById('id_photo1').value = null;
            document.getElementById('id_photo2').value = null;
            document.getElementById('id_photo3').value = null;

            document.getElementById('id_photo1').value = null;
            document.getElementById('id_photo2').value = null;
            document.getElementById('id_photo3').value = null;

            $('#'+id_SubmitButton).click();
        }
  };




  xhr.onerror = function () {
    SetStateSaveButton('saveButton', true, 'Запази');
    SetStateSaveButton('saveInspButton', true, 'Запази');
    $('#'+idElement+'_loading').hide();
    $('#'+idElement+'_browse_button').html('Browse...');
    alert('Error during file upload: ' + file.name);
  };


  xhr.send(postData);

  function updateProgress (ev) {
        if (ev.lengthComputable) {
            var percentComplete = Math.round((ev.loaded / ev.total) * 100);

            $('#'+idElement+'_browse_button').html(percentComplete+'%');
        }
  }
}


function makeRandomStr(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
 charactersLength));
   }
   return result;
}



function SetStateSaveButton (idName, enabled, caption) {
    if (enabled) {
        $('#'+idName).html(caption);
        $('#'+idName).prop('disabled', false);
    } else {
        $('#'+idName).prop('disabled', true);
        $('#'+idName).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'+caption);
    }
}
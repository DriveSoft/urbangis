{% load static %}
import {NewMap} from '{% static 'script/classLeafletMap.js' %}';


var IS_MOBILE = false;

var button_filter = document.getElementById('apply_Filter');
var button_reset = document.getElementById('reset_Filter');

var button_closeTabTree = document.getElementById('button_CloseTabTree');
var button_closeTabInsp = document.getElementById('button_CloseTabInsp');
var button_closeTabAct = document.getElementById('button_CloseTabAct');

var button_NewInspection = document.getElementById('id_button_NewInspection');
var button_NewAction = document.getElementById('id_button_NewAction');


let input_first_insp_photo1 = document.getElementById('id_first_insp_photo1');
let input_first_insp_photo2 = document.getElementById('id_first_insp_photo2');
let input_first_insp_photo3 = document.getElementById('id_first_insp_photo3');

let input_insp_photo1 = document.getElementById('id_insp_photo1');
let input_insp_photo2 = document.getElementById('id_insp_photo2');
let input_insp_photo3 = document.getElementById('id_insp_photo3');


var markers;
var ajax_geojson;
var idsFromDB = []; // храним id маркеров деревьев, которые пришли из базы, чтобы исключитть эти маркеры из ajax_geojson

let baseURL = '/citytree/{{obj_city.sysname}}/'; // for html5 history API


// geoJson data
let cityTreesData = {
    "type": "FeatureCollection",
    "features": []
  };



let HeatMapData = {
  max: 20,
  data: []
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




let mapName;
{% if request.session.mapname %}
    mapName = "{{ request.session.mapname }}";
{% else %}
    mapName = "Default";
{% endif %}



var mymap = new NewMap('mapid', { zoomControl: false }, mapName, {visible_ButtonInfo: true}).setView(
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

        mymap.removeLayer(newMarker);

        if (IS_MOBILE) {
            startNewMarkerMobile();
        } else {
           $('.leaflet-container').css('cursor','crosshair');
        }

        $('#deleteButton').prop('disabled',true);
        $('#deleteButton').prop('title','');


    } else if (control.state() === 'off') {

        $('.leaflet-container').css('cursor','');

        if (IS_MOBILE) {
            $('#doneMarkerMobile').hide();
            $('#cancelMarkerMobile').hide();

            // delete previous marker if exists
            mymap.removeLayer(newMarker);
        }
    }
};



mymap.onButHeatmapClick = function (control) {

    if (control.state() === 'on') {
        mymap.removeLayer(markers);
        mymap.addLayer(heatmapLayer);
    } else if (control.state() === 'off') {
        mymap.removeLayer(heatmapLayer);
        mymap.addLayer(markers);
    }

};


mymap.OnButInfoClick = function (control) {
    $("#id_statform_count").text('');
    $("#id_statform_died").text('');
    $("#id_statform_absent").text('');
    $('#accordionYearStat').html('');

    $("#id_spinner_stat").show();
    $('#id_Stat_Modal').modal('show');

    $.ajax({
        url: "{% url 'citytree_ajax_getstat' city_name=obj_city.sysname %}",
        //data: {'idtree': id},
        dataType: 'json',
        success: function (jsonResult) {
            FillStatForm(jsonResult);
            $("#id_spinner_stat").hide();
        }
  });
}
function FillStatForm(obj_stat) {

    $("#id_statform_count").text(obj_stat.count);
    $("#id_statform_died").text(obj_stat.died);
    $("#id_statform_absent").text(obj_stat.absent);


    let yearsStatHTML = '';
    let show = 'show';
    for (const yearStat of obj_stat.statYear) {
        yearsStatHTML += itemYearStat(yearStat.year, yearStat.alldied, yearStat.newdied, yearStat.planted, show);
        show = '';
    }

    $('#accordionYearStat').html(yearsStatHTML);
    $('[data-toggle="tooltip"]').tooltip();

    let dateUpdated = new Date(obj_stat.updated);
    $('#id_stat_updated').html('Създадено: ' + dateUpdated.toLocaleDateString() + ' ' + dateUpdated.toLocaleTimeString() + '  ('+obj_stat.execution_time+' sec)');


}

function itemYearStat(year, alldied, newdied, planted, show) {
    return `
    <div class="card">
        <div class="card-header" id="heading${year}">
            <h2 class="mb-0">
                <button class="btn btn-link btn-block text-left" type="button" data-toggle="collapse" data-target="#collapse${year}" aria-expanded="true" aria-controls="collapse${year}">
                    ${year}
                </button>
            </h2>
        </div>

        <div id="collapse${year}" class="collapse ${show}" aria-labelledby="heading${year}" data-parent="#accordionYearStat">
            <div class="card-body">
                <div class="row pb-2 pt-2" style="border-bottom: 1px solid #dddddd">
                    <div class="col-10 pl-1">Загинали дървета <i class="fa fa-question-circle" style="color: #56abb2" data-toggle="tooltip" data-original-title="Включва само дърветата, който преди са имали статус на здраво дърво."></i></div>
                    <div class="col-2 pr-1">${alldied}</div>
                </div>
                <div class="row pb-2 pt-2" style="border-bottom: 1px solid #dddddd">
                    <div class="col-10 pl-1">Загинали новозасадени <i class="fa fa-question-circle" style="color: #56abb2" data-toggle="tooltip" data-original-title="Включва само дърветата, който са загинали в рамки на 3 години след инспекция със статус 'Новозасадено'"></i></div>
                    <div class="col-2 pr-1">${newdied}</div>
                </div>
                <div class="row pb-2 pt-2">
                    <div class="col-10 pl-1">Засадени дървета <i class="fa fa-question-circle" style="color: #56abb2" data-toggle="tooltip" data-original-title="Включва само дърветата, за който е известна дата на засаждане."></i></div>
                    <div class="col-2 pr-1">${planted}</div>
                </div>
            </div>
        </div>
    </div>
    `
}



// save map tiles to session
mymap.on('baselayerchange', function(e) {
    console.log(e.name);
    $.ajax({
        url: "{% url 'set_mapname' %}",
        data: {'mapname': e.name}
    });

});



// create a geoJson data from database
//var treeData = {
//  "type": "FeatureCollection",
//  "features": [
{% comment %}
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
{% endcomment %}
//]};





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
  iconUrl: '{% static 'markers/marker-red.png' %}',
  shadowUrl: '{% static 'markers/marker-shadow.png' %}',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});



// to create a new marker for desktop verion
function onMapClick(e) {
    $('.navbar-collapse').collapse('hide'); // устраняет баг, если меню раскрыто при клике по карте оно закрывается
    //if (selectedMarker) {
    //    selectedMarker.setStyle({stroke: false, weight: 0, color: "#008000"});
    //}

    if (!IS_MOBILE && mymap.but_newmarker.state() == 'on')
    //if (!IS_MOBILE && NewMap.getNewMarkerButtonStatus() == 'on')
    {
        $('#tabTree').show();

        $('#height').prop('required', true);
        $('#crowndiameter').prop('required', true);
        $('#trunkgirth').prop('required', true);
        $('#divNewTree').show();
        $('#divExistsTree').hide();

        $("#saveButton").html('Запази');
        $('#saveButton').prop('disabled', false);
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

        clearNewTreeForm();

        document.getElementById("latitude").value = e.latlng.lat.toFixed(5);
        document.getElementById("longitude").value = e.latlng.lng.toFixed(5);

        mymap.but_newmarker.state('off');
        mymap.but_newmarker.button.style.backgroundColor = 'white';
        $('.leaflet-container').css('cursor','');
    }
}


function clearNewTreeForm() {
    document.getElementById("treeId").value = '';
    $('#species').selectpicker('val', []);
    document.getElementById("speciescomment").value = '';
    document.getElementById("comment").value = '';
    document.getElementById("placetype").value = 0;
    document.getElementById("irrigationmethod").value = 1;
    document.getElementById("dateplanted").value = '';
    document.getElementById("googlestreeturl").value = '';
    document.getElementById("height").value = '';
    document.getElementById("crowndiameter").value = '';
    document.getElementById("trunkgirth").value = '';
    document.getElementById("status").value = 0;
    $('#id_remarks').selectpicker('val', []);
    $('#id_recommendations').selectpicker('val', []);
    document.getElementById("id_first_insp_photo1_new_name").value = '';
    document.getElementById("id_first_insp_photo2_new_name").value = '';
    document.getElementById("id_first_insp_photo3_new_name").value = '';
}



function startNewMarkerMobile() {
    $('#doneMarkerMobile').show();
    $('#cancelMarkerMobile').show();
    let center = mymap.getCenter();
    newMarker = new L.marker(center, {icon: redIcon, draggable: false}).addTo(mymap);
}

function startEditMarkerMobile() {
    CloseSidebar();
    mymap.but_newmarker.state('on');
    mymap.but_newmarker.button.style.backgroundColor = 'red';

    sleep(400).then(() => {
        $('#doneEditMarkerMobile').show();
        $('#cancelMarkerMobile').show();
        let latlng = L.latLng(document.getElementById('latitude').value, document.getElementById('longitude').value);
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
    $('#tabTree').show();

    $('#height').prop('required', true);
    $('#crowndiameter').prop('required', true);
    $('#trunkgirth').prop('required', true);
    $('#divNewTree').show();
    $('#divExistsTree').hide();
    $("#saveButton").html('Запази');
    $('#myTab a[href="#tree"]').tab('show'); // Select tab by name

    clearNewTreeForm();

    document.getElementById('latitude').value = newMarker.getLatLng().lat.toFixed(5);
    document.getElementById('longitude').value = newMarker.getLatLng().lng.toFixed(5);

    mymap.but_newmarker.state('off');
    mymap.but_newmarker.button.style.backgroundColor = 'white';
    OpenSidebar();
}


function buttonDoneEditMarkerMobileOnClick(e) {
    $('#doneEditMarkerMobile').hide();
    $('#cancelMarkerMobile').hide();
    document.getElementById('latitude').value = newMarker.getLatLng().lat.toFixed(5);
    document.getElementById('longitude').value = newMarker.getLatLng().lng.toFixed(5);
    OpenSidebar();
}

function buttonCancelMarkerMobileOnClick(e) {
    $('#doneMarkerMobile').hide();
    $('#doneEditMarkerMobile').hide();
    $('#cancelMarkerMobile').hide();

    // delete previous marker if exists
    mymap.removeLayer(newMarker);
    mymap.but_newmarker.state('off');
    mymap.but_newmarker.button.style.backgroundColor = 'white';
}



var selectedMarker;
function markerOnClick(e)
{
    let marker = e.target;
    let geojson = marker.toGeoJSON();

    selectMarker(marker);
    //if (selectedMarker) { // снимаем выделение с предыдущего
    //    selectedMarker.setStyle({stroke: false, weight: 0, color: "#008000", opacity: 1});
    //}
    //marker.setStyle({stroke: true, weight: 3, color: "#FFFFFF", opacity: 0.7}); // выделяем выбранный маркер
    //selectedMarker = marker;

    // delete previous marker if exists
    mymap.removeLayer(newMarker);

    history.pushState({page: "treepreview", treeId: geojson.properties.id}, null, baseURL+"tree/"+geojson.properties.id+"/");
    //ShowTreePreview(geojson.properties.id);

    getAsyncObjectTree(geojson.properties.id, ShowTreePreview);
}


function selectMarker (markerOrID) {

    if (typeof markerOrID === 'undefined' ) {
        if (selectedMarker) { // снимаем выделение с предыдущего
            selectedMarker.setStyle({stroke: false, weight: 0, color: "#008000", opacity: 1});            
        }    
        return    
    }

    if (typeof markerOrID === 'number') {

        markers.eachLayer(function (marker) {
            let geojson = marker.toGeoJSON();

            if (geojson.properties.id == markerOrID) {
                if (selectedMarker) { // снимаем выделение с предыдущего
                    selectedMarker.setStyle({stroke: false, weight: 0, color: "#008000", opacity: 1});
                }

                marker.setStyle({stroke: true, weight: 3, color: "#FFFFFF", opacity: 0.7}); // выделяем выбранный маркер
                selectedMarker = marker;
            }
        });
    } else {

        if (selectedMarker) { // снимаем выделение с предыдущего
            selectedMarker.setStyle({stroke: false, weight: 0, color: "#008000", opacity: 1});
        }
    
        markerOrID.setStyle({stroke: true, weight: 3, color: "#FFFFFF", opacity: 0.7}); // выделяем выбранный маркер
        selectedMarker = markerOrID;        
    }
}



function getAsyncObjectTree(id, callback){
    $.getJSON("{% url 'citytree-restapi-treeitem' city=obj_city.sysname pk=12345 %}".replace(/12345/, id.toString()), function(json) {
        callback(json);
    });     
}

//function getAsyncObjectTree(id, callback){
//    $.ajax({
//        url: "{% url 'get_tree' %}",
//        data: {'idtree': id},
//        dataType: 'json',
//        success: function (jsonResult) {
//            let obj_tree = jQuery.parseJSON(jsonResult);
//            console.log(obj_tree)
//            callback(obj_tree);
//        }
//  });
//}



function ShowTreePreview(obj_tree) {
            $("#id_treepreview_title_local_name").text(obj_tree.localname);
            $("#id_treepreview_title_species_name").text(obj_tree.species);
            $("#id_treepreview_status").text(obj_tree.lastinsp_status);

            $("#id_treepreview_height").text(obj_tree.lastinsp_height);
            $("#id_treepreview_crown").text(obj_tree.lastinsp_crowndiameter);
            $("#id_treepreview_trunk").text(obj_tree.lastinsp_trunkgirth);


            $("#id_treepreview_remarks").text(obj_tree.lastinsp_remarks);
            if (obj_tree.lastinsp_remarks) {
                $("#id_div_treepreview_remarks").show();
            } else {
                $("#id_div_treepreview_remarks").hide();
            }

            $("#id_treepreview_recommends").text(obj_tree.lastinsp_recommendations);
            if (obj_tree.lastinsp_recommendations) {
                $("#id_div_treepreview_recommends").show();
            } else {
                $("#id_div_treepreview_recommends").hide();
            }

            if (obj_tree.googlestreeturl) {
                $("#id_treepreview_googlestreetview").html('<a href="'+obj_tree.googlestreeturl+'" target="_blank"><i class="fas fa-external-link-alt"></i>');
                $("#id_div_treepreview_googlestreetview").show();
            } else {
                $("#id_treepreview_googlestreetview").html('');
                $("#id_div_treepreview_googlestreetview").hide();
            }




            $('#modalTreeInfo').modal('show');


            document.getElementById("treeId").value = obj_tree.id;
            Show_Inspections_Actions_Table('PreviewTree', obj_tree.id);


            let photo1 = "";
            let photo2 = "";
            let photo3 = "";

            //if (geojson.properties.photo1 !== "") { photo1 = "{% get_media_prefix %}" + geojson.properties.photo1 }
            //if (geojson.properties.photo2 !== "") { photo2 = "{% get_media_prefix %}" + geojson.properties.photo2 }
            //if (geojson.properties.photo3 !== "") { photo3 = "{% get_media_prefix %}" + geojson.properties.photo3 }
            if (obj_tree.lastinsp_photo1) { photo1 = obj_tree.lastinsp_photo1 }
            if (obj_tree.lastinsp_photo2) { photo2 = obj_tree.lastinsp_photo2 }
            if (obj_tree.lastinsp_photo3) { photo3 = obj_tree.lastinsp_photo3 }

            if (photo1 == "" && photo2 == "" && photo3 == "") { photo1 = "{% static 'images/no-photo.png' %}"}

            ShowSlideShow(photo1, photo2, photo3, "TreePreview")


            let editButton_TreePreview = document.getElementById('id_editButton_TreePreview');
            editButton_TreePreview.onclick = function() {
                history.pushState(null, null, baseURL);
                $('#modalTreeInfo').modal('hide');
                EditTree(obj_tree);
            }

            let closeButton_TreePreview = document.getElementById('id_closeButton_TreePreview');
            closeButton_TreePreview.onclick = function() {
                history.pushState(null, null, baseURL);
            }

}




function EditTree(obj_tree) {

    console.log(obj_tree)

  let $table_InspActData = $('#table_InspActData');
  $table_InspActData.bootstrapTable('destroy');
  $('#button_show_inspact').show();
  $('#divTreeInspActData').hide();


  // читаем координаты в properties, т.к. в geometry они почему то меняются из за того, видимо из за того, что маркеры смещаются когда кластер раскрывается
  document.getElementById("latitude").value = obj_tree.latitude;
  document.getElementById("longitude").value = obj_tree.longitude;
  //document.getElementById("species").value = geojson.properties.species;
  $('#species').selectpicker('val', obj_tree.species_id);

  document.getElementById("speciescomment").value = obj_tree.speciescomment;
  document.getElementById("comment").value = obj_tree.comment.replace(/<br\s*[\/]?>/gi, "\n");
  document.getElementById("placetype").value = obj_tree.placetype;
  document.getElementById("irrigationmethod").value = obj_tree.irrigationmethod;
  document.getElementById("dateplanted").value = obj_tree.dateplanted;
  document.getElementById("googlestreeturl").value = obj_tree.googlestreeturl;
  document.getElementById("treeId").value = obj_tree.id;


  //document.getElementById('wrapper').classList.remove("toggled");
  $('#divNewTree').hide();
  $('#divExistsTree').show();

  $("#saveButton").html('Актуализиране');

  {% if perms.citytree.change_tree and perms.citytree.can_change_not_own_tree_record %}
    $('#saveButton').prop('disabled',false);
    $('#saveButton').prop('title','');
  {% elif perms.citytree.change_tree and not perms.citytree.can_change_not_own_tree_record %}
    if (obj_tree.useradded=={{user.id}}) {
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
    if (obj_tree.useradde=={{user.id}}) {
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


  Show_Inspections_Actions_Table('EditTree', obj_tree.id);
  OpenSidebar();
}



document.getElementById("id_edit_coord").onclick = iEditCoordOnClick;
function iEditCoordOnClick(e) {
    // если в режиме редактирования дерева
    if (document.getElementById("treeId").value) {

        if (IS_MOBILE) {
            startEditMarkerMobile();
        } else {

            // delete previous marker if exists
            mymap.removeLayer(newMarker)

            let latlng = L.latLng(document.getElementById('latitude').value, document.getElementById('longitude').value);
            newMarker = new L.marker(latlng, {icon: redIcon, draggable: true}).addTo(mymap);

            newMarker.on('dragend', function (e) {
                document.getElementById('latitude').value = newMarker.getLatLng().lat.toFixed(5);
                document.getElementById('longitude').value = newMarker.getLatLng().lng.toFixed(5);
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

    if (photo1) {
        $('<div class="carousel-item"><img style="background: transparent url({% static 'images/loader_white.gif' %}) no-repeat scroll center center; min-height: 64px" class="d-block w-100" src="'+ photo1 +'"></div>').appendTo('#id_container_'+id_carousel_suffix+' .carousel-inner');
        $('<li data-target="#id_carousel_Modal" data-slide-to="'+i+'"></li>').appendTo('#id_container_'+id_carousel_suffix+' .carousel-indicators');
        result = true;
    }
    i = i + 1;

    if (photo2) {
        $('<div class="carousel-item"><img class="d-block w-100" src="'+ photo2 +'"></div>').appendTo('#id_container_'+id_carousel_suffix+' .carousel-inner');
        $('<li data-target="#id_carousel_Modal" data-slide-to="'+i+'"></li>').appendTo('#id_container_'+id_carousel_suffix+' .carousel-indicators');
        result = true;
    }
    i = i + 1;

    if (photo3) {
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
    let r;
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

  let zoom = mymap.getZoom();

  markers.eachLayer(function (marker) {
    if (zoom > 17) {
        let geojson = marker.toGeoJSON();
        marker.setRadius( ZoomToRadius(zoom, geojson.properties.lastinsp_crowndiameter) );
    } else {
        marker.setRadius( ZoomToRadius(zoom, 0) );
    }

  });

  // снимаем выделение с выбранного маркера
  selectMarker();
  //if (selectedMarker) {
  //  selectedMarker.setStyle({stroke: false, weight: 0, color: "#008000", opacity: 1});
  //}

});





function LoadTreesToMap(firsttime, filterEnabled) {

    if (!firsttime) {
        mymap.removeLayer(markers);
    }
    // update dataset for heatmap
    HeatMapData.data.length = 0; // clear data array
    let heatItem = {};
    let zoom = mymap.getZoom();

    markers = L.geoJSON(cityTreesData, {
        pointToLayer: function (feature, latlng) {

            geojsonMarkerOptions.radius = ZoomToRadius(zoom, feature.properties.lastinsp_crowndiameter);

            if (geojsonMarkerOptions.radius < 2) {
                geojsonMarkerOptions.radius = 2;
            }

            {% if status %}
                {% for statusItem in status %}
                    if (feature.properties.lastinsp_status == "{{statusItem.id}}")
                    {
                        geojsonMarkerOptions.fillColor = "#{{statusItem.hexcolor}}";
                        geojsonMarkerOptions.color = "#{{statusItem.hexcolor}}";
                    }
                {% endfor %}
            {% endif %}

            return L.circle(latlng, geojsonMarkerOptions).on('click', markerOnClick);

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

                if (status_values.length>0 && feature.properties.lastinsp_status) {
                    status_Filter = status_values.includes(feature.properties.lastinsp_status.toString());
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
                    showOnlyMyTrees_Filter = feature.properties.useradded == {{user.id}};
                }




                let result = species_Filter && status_Filter && recommendations_Filter && remarks_Filter &&
                             placetype_Filter && irrigationmethod_Filter &&
                             plantedDateFrom_Filter && plantedDateTo_Filter && addedDateFrom_Filter && addedDateTo_Filter &&
                             comment_Filter && showOnlyMyTrees_Filter;


                // update dataset for heatmap, в heatmap не попадают деревья со статусом, Отсутствует, Сухое или пень
                if (result && (feature.properties.lastinsp_status != '6' && feature.properties.lastinsp_status != '7' && feature.properties.lastinsp_status != '8') ) {
                    heatItem = {}
                    heatItem.lat = feature.properties.coordinates[1];
                    heatItem.lng = feature.properties.coordinates[0];
                    heatItem.count = feature.properties.lastinsp_crowndiameter;
                    HeatMapData.data.push(heatItem);
                 }

                return result;

            } else {
                //в heatmap не попадают деревья со статусом, Отсутствует, Сухое или пень
                if (feature.properties.lastinsp_status != '6' && feature.properties.lastinsp_status != '7' && feature.properties.lastinsp_status != '8') {
                    heatItem = {}
                    heatItem.lat = feature.properties.coordinates[1];
                    heatItem.lng = feature.properties.coordinates[0];
                    heatItem.count = feature.properties.lastinsp_crowndiameter;
                    HeatMapData.data.push(heatItem);
                }

                return true; // если filterEnabled = False
            }


        }
    });//.addTo(mymap);


    heatmapLayer.setData(HeatMapData);
    if (mymap.but_heatmap.state() == 'off') {
        mymap.addLayer(markers);
    }

}






button_filter.onclick = function() {
    LoadTreesToMap(false, true); // не первоначальная загрузка, фильтр задействован
    if (IS_MOBILE) {
        CloseSidebar();
    }
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
    if (IS_MOBILE) {
        CloseSidebar();
    }
}






button_closeTabTree.onclick = function() {
    // delete previous marker if exists
    //mymap.removeLayer(newMarker);

    //$('#myTab a[href="#filter"]').tab('show'); // Select tab by name
    //$('#tabTree').hide();
    closeTabTree();
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
    if (mymap.but_newmarker.state() == 'on') {
        newMarker.setLatLng(center);
    }

}

function onMapZoom(e) {
    let center = mymap.getCenter();  //get map center
    if (mymap.but_newmarker.state() == 'on') {
        newMarker.setLatLng(center);
    }
}






function Show_Inspections_Actions_Table(id_suffix, idTree)
{
    let $table_InspActData = $('#table_InspActData_'+id_suffix)
    let $table_InspActDataPreview = $('#table_InspActData_'+id_suffix)
    let table_is_empty = true
    $table_InspActData.bootstrapTable('destroy')



    let urlInsp = "{% url 'citytree-restapi-inspections' city=obj_city.sysname treeid=12345 %}".replace(/12345/, idTree.toString());
    let urlsAct = "{% url 'citytree-restapi-actions' city=obj_city.sysname treeid=12345 %}".replace(/12345/, idTree.toString());

    console.log( $table_InspActData.bootstrapTable('getOptions').totalRows  )
    DataToTable(urlInsp, true)
    sleep(100)
    DataToTable(urlsAct, false)
    console.log( $table_InspActData.bootstrapTable('getOptions').totalRows  )



    function DataToTable(url, insp) {
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-type':'application/json',
                'X-CSRFToken':csrftoken,
            }
        }
        ).then(function(response){
            if (response.status >= 400) {

                response.json().then(data => {
                    alert(response.statusText+' ('+response.status+')\n\n'+data.errors);
                });
            
            } else {

                response.json().then(data => {

                    if (insp) {
                        data.forEach(element => element.type='Inspection');
                    } else {
                        data.forEach(element => element.type='Action');
                        data.forEach(element => element.datetime=element.date);
                    }


                    if (table_is_empty) {
                        console.log(data)
                        if (data.length > 0) { 
                            table_is_empty = false;
                            $table_InspActData.bootstrapTable({data: data}) 
                        }
                           
                    } else {
                        console.log(data)
                        $table_InspActData.bootstrapTable('append', data) 
                    }

                    /*
                    if ($table_InspActData.bootstrapTable('getData').length === 1) {  // if the table is empty                     
                        console.log(data)
                        console.log('empty1',  $table_InspActData.bootstrapTable('getData').length  ) 
                        $table_InspActData.bootstrapTable({data: data})
                        console.log('empty2',   $table_InspActData.bootstrapTable('getData').length  )                       
                    } else {
                        console.log(data)
                        console.log('not empty1',  $table_InspActData.bootstrapTable('getData').length  ) 
                        $table_InspActData.bootstrapTable('append', data) 
                        console.log('not empty2',  $table_InspActData.bootstrapTable('getData').length  )   
                    }    
                    */                         
                    
                });

            }
        })
    }



/*
    let finalResult;
    const urls = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    Promise.all(
        urls.map(url =>
            fetch('json/' + url + '.json')
                .then(e => e.json())
        )
    ).then(data => {
        finalResult = data.flat();
    });
*/





    return

    $.ajax({
        url: "{% url 'get_inspact' %}",
        //data: {'idtree': document.getElementById("treeId").value},
        data: {'idtree': idTree},
        dataType: 'json',
        success: function (jsonResult) {            
            $('#divTreeInspActData_'+id_suffix).show();            
            console.log(jsonResult);

            //$(function() {
                let data = jsonResult
                $table_InspActData.bootstrapTable({data: data})
            //})

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
                $("#id_insp_img_photo1").attr("src", row.photo1);
                //document.getElementById("id_insp_photo1_new_name").value = "{% get_media_prefix%}"+row.photo1;
            } else {
                $("#id_insp_img_photo1").attr("src", "{% static 'images/no-photo.png' %}");
                document.getElementById("id_insp_photo1_new_name").value = "";
            }

            if (row.photo2 !== "") {
                $("#id_insp_img_photo2").attr("src", row.photo2);
                //document.getElementById("id_insp_photo2_new_name").value = "{% get_media_prefix%}"+row.photo2;
            } else {
                $("#id_insp_img_photo2").attr("src", "{% static 'images/no-photo.png' %}");
                document.getElementById("id_insp_photo2_new_name").value = "";
            }

            if (row.photo3 !== "") {
                $("#id_insp_img_photo3").attr("src", row.photo3);
                //document.getElementById("id_insp_photo3_new_name").value = "{% get_media_prefix%}"+row.photo3;
            } else {
                $("#id_insp_img_photo3").attr("src", "{% static 'images/no-photo.png' %}");
                document.getElementById("id_insp_photo3_new_name").value = "";
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
    if (row.photo1 !== "") { photo1 = row.photo1 }
    if (row.photo2 !== "") { photo2 = row.photo2 }
    if (row.photo3 !== "") { photo3 = row.photo3 }
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
    document.getElementById("id_insp_photo1_new_name").value = "";
    $("#id_insp_img_photo2").attr("src", "{% static 'images/no-photo.png' %}");
    document.getElementById("id_insp_photo2_new_name").value = "";
    $("#id_insp_img_photo3").attr("src", "{% static 'images/no-photo.png' %}");
    document.getElementById("id_insp_photo3_new_name").value = "";

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



input_first_insp_photo1.onchange = function() {
    OnChangeInputFileElementForResize(this, 1280, 'id_first_insp_img_photo1', 'saveButton');
}

input_first_insp_photo2.onchange = function() {
    OnChangeInputFileElementForResize(this, 1280, 'id_first_insp_img_photo2', 'saveButton');
}

input_first_insp_photo3.onchange = function() {
    OnChangeInputFileElementForResize(this, 1280, 'id_first_insp_img_photo3', 'saveButton');
}


input_insp_photo1.onchange = function() {
    OnChangeInputFileElementForResize(this, 1280, 'id_insp_img_photo1', 'saveInspButton');
}

input_insp_photo2.onchange = function() {
    OnChangeInputFileElementForResize(this, 1280, 'id_insp_img_photo2', 'saveInspButton');
}

input_insp_photo3.onchange = function() {
    OnChangeInputFileElementForResize(this, 1280, 'id_insp_img_photo3', 'saveInspButton');
}



//=== UTILS ============================================================================================================


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


function closeTabTree() {
    // delete previous marker if exists
    mymap.removeLayer(newMarker);

    $('#myTab a[href="#filter"]').tab('show'); // Select tab by name
    $('#tabTree').hide();
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function images_inspection_click(){
        let photo1 = document.getElementById("id_insp_photo1_new_name").value;
        let photo2 = document.getElementById("id_insp_photo2_new_name").value;
        let photo3 = document.getElementById("id_insp_photo3_new_name").value;
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



    PermissionsApply();
    LoadGeoJsonData(true, true)




    $('#saveButton').click(function(){

        // Get the file from frontend
   	    let myFile1 = $('#id_first_insp_photo1').prop('files');
   	    let myFile2 = $('#id_first_insp_photo2').prop('files');
   	    let myFile3 = $('#id_first_insp_photo3').prop('files');

        // если во всех нету файла или он уже загружен, тогда кликаем submit
        if ( (!myFile1[0] || $('#id_first_insp_photo1_browse_button').text() === 'Done') &&
             (!myFile2[0] || $('#id_first_insp_photo2_browse_button').text() === 'Done') &&
             (!myFile3[0] || $('#id_first_insp_photo3_browse_button').text() === 'Done') ){

            $('#saveButtonSubmit').click();

        } else {
            if(myFile1[0] && $('#id_first_insp_photo1_browse_button').text() !== 'Done'){
                let data1 = {file_name: myFile1[0].name};
                $('#id_first_insp_photo1_loading').show();
                StartUpload(myFile1, data1, 'id_first_insp_photo1');
            }

            if(myFile2[0] && $('#id_first_insp_photo2_browse_button').text() !== 'Done'){
                let data2 = {file_name: myFile2[0].name};
                $('#id_first_insp_photo2_loading').show();
                StartUpload(myFile2, data2, 'id_first_insp_photo2');
            }

            if(myFile3[0] && $('#id_first_insp_photo3_browse_button').text() !== 'Done'){
                let data3 = {file_name: myFile3[0].name};
                $('#id_first_insp_photo3_loading').show();
                StartUpload(myFile3, data3, 'id_first_insp_photo3');
            }
        }


        function StartUpload(fileObj, data, idElement) {
            //$("#saveButton").html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Запази');
            SetStateSaveButton('saveButton', false, 'Запази');
            $('#'+idElement+'_new_name').val(data.file_name);

            $.ajax({
                type: "GET",
                url: "{% url 'generate_signed_url' %}",
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






    $('#saveInspButton').click(function(){

        // Get the file from frontend
   	    let myFile1 = $('#id_insp_photo1').prop('files');
   	    let myFile2 = $('#id_insp_photo2').prop('files');
   	    let myFile3 = $('#id_insp_photo3').prop('files');

   	    if ( $('#id_insp_photo1_new_name').val() === '*will_be_deleted*' ) {
   	        $('#id_insp_photo1').val('');
   	    }

   	    if ( $('#id_insp_photo2_new_name').val() === '*will_be_deleted*' ) {
   	        $('#id_insp_photo2').val('');
   	    }

   	    if ( $('#id_insp_photo3_new_name').val() === '*will_be_deleted*' ) {
   	        $('#id_insp_photo3').val('');
   	    }

        // если во всех нету файла или он уже загружен, тогда кликаем submit
        if ( (!myFile1[0] || $('#id_insp_photo1_browse_button').text() === 'Done') &&
             (!myFile2[0] || $('#id_insp_photo2_browse_button').text() === 'Done') &&
             (!myFile3[0] || $('#id_insp_photo3_browse_button').text() === 'Done') ){

            $('#saveInspButtonSubmit').click();

        } else {
            if(myFile1[0] && $('#id_insp_photo1_browse_button').text() !== 'Done'){
                let data1 = {file_name: myFile1[0].name};
                $('#id_insp_photo1_loading').show();
                StartUpload(myFile1, data1, 'id_insp_photo1');
            }

            if(myFile2[0] && $('#id_insp_photo2_browse_button').text() !== 'Done'){
                let data2 = {file_name: myFile2[0].name};
                $('#id_insp_photo2_loading').show();
                StartUpload(myFile2, data2, 'id_insp_photo2');
            }

            if(myFile3[0] && $('#id_insp_photo3_browse_button').text() !== 'Done'){
                let data3 = {file_name: myFile3[0].name};
                $('#id_first_insp_photo3_loading').show();
                StartUpload(myFile3, data3, 'id_insp_photo3');
            }
        }


        function StartUpload(fileObj, data, idElement) {
            SetStateSaveButton('saveInspButton', false, 'Запази');
            $('#'+idElement+'_new_name').val(data.file_name);

            $.ajax({
                type: "GET",
                url: "{% url 'generate_signed_url' %}",
                data: data,
                async: true,
                timeout: 15000,
                success: function(response){
                    let responseData = jQuery.parseJSON(response);
                    if (responseData.file_exists === false) {
                        uploadFile(fileObj[0], responseData.data, responseData.final_file_name, idElement, 'saveInspButtonSubmit');
                    } else {
                        let rndStr = makeRandomStr(5);
                        //$('#'+idElement+'_new_name').val(rndStr+'_'+ fileObj[0].name);
                        let data_new = {file_name: rndStr + '_' + fileObj[0].name};
                        StartUpload(fileObj, data_new, idElement);
                    }

                },

                error: function(){
                    SetStateSaveButton('saveInspButton', true, 'Запази');
                    $('#'+idElement+'_loading').hide();
                    $('#'+idElement+'_browse_button').html('Browse...');
                    alert('Error: generate_presigned_post');
                },


            });
        }


   });




    // если нужно показать preview конкретного дерева
    if ({{tree_id}} > 0) {
        getAsyncObjectTree({{tree_id}}, callback_ObjectTree); // ajax return object to callback function

        function callback_ObjectTree(object_tree) {
            ShowTreePreview(object_tree);
            let latlng = L.latLng(object_tree.latitude, object_tree.longitude);
            mymap.setView(latlng, 20);
            selectMarker({{tree_id}});
        }
    }




   }
}



function LoadGeoJsonData(firsttime, filterEnabled){
    $.getJSON("{% url 'citytree-restapi-trees' city=obj_city.sysname %}", function(json) {            
        cityTreesData = json;
        LoadTreesToMap(firsttime, filterEnabled);
    });
}





function PermissionsApply(){
    {% if not perms.citytree.add_tree %} mymap.but_newmarker.disable(); {% endif %}
    {% if not perms.citytree.add_inspection %} $('#id_button_NewInspection').prop('disabled',true); $('#id_button_NewInspection').prop('title','You don\'t have access to this action'); {% endif %}
    {% if not perms.citytree.add_careactivity %} $('#id_button_NewAction').prop('disabled',true); $('#id_button_NewAction').prop('title','You don\'t have access to this action'); {% endif %}
}



function uploadFile(file, s3Data, final_file_name, idElement, id_SubmitButton){
  var xhr = new XMLHttpRequest();
  xhr.open("POST", s3Data.url);
  xhr.timeout = 30000;
  xhr.upload.onprogress = updateProgress;

  var postData = new FormData();
  for(let key in s3Data.fields){
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
            //document.getElementById('id_first_insp_photo1').value = null;
            document.getElementById('id_first_insp_photo2').value = null;
            document.getElementById('id_first_insp_photo3').value = null;

            document.getElementById('id_insp_photo1').value = null;
            document.getElementById('id_insp_photo2').value = null;
            document.getElementById('id_insp_photo3').value = null;

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
            console.log(percentComplete);
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




// html5 history API
window.addEventListener('popstate', function(event) {
    if (event.state == null) {
        $('#modalTreeInfo').modal('hide')
        return;
    }

    if (event.state.page == "treepreview") {
        getAsyncObjectTree(event.state.treeId, ShowTreePreview); // ajax return object to callback function
    } else {
        $('#modalTreeInfo').modal('hide');
    }


});

//Enable tooltips everywhere
//$(function () {
//  $('[data-toggle="tooltip"]').tooltip()
//})





// REST API

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');


let formTreeWrapper = document.getElementById('id_scrollbar_tree')
formTreeWrapper.addEventListener('submit', function(e){
    e.preventDefault()
    let idTree = document.getElementById("treeId").value
    let url
    let method

    if (idTree) {
        url = "{% url 'citytree-restapi-treeitem' city=obj_city.sysname pk=12345 %}".replace(/12345/, idTree.toString());
        method = 'PUT'  
    } else {
        url = "{% url 'citytree-restapi-trees' city=obj_city.sysname %}"
        method = 'POST' 
    }


    let object = {}

    const dataForm = new FormData(e.target);  

    dataForm.forEach((value, key) => {
        // Reflect.has in favor of: object.hasOwnProperty(key)
        if(!Reflect.has(object, key)){
            object[key] = value;
            return;
        }
        if(!Array.isArray(object[key])){
            object[key] = [object[key]];    
        }
        object[key].push(value);
    });




    if (Reflect.has(object, 'dateplanted')){
        if (object['dateplanted'] == "") {
            object['dateplanted'] = null;    
        }
    }


    // null values don't append to dataForm automatically for selectpicker elements, so add them manually    
    if(!Reflect.has(object, 'remarks')){
        object['remarks'] = [];
    } else {
        // если у компонента только одно значение, тогда она передается в объект как обычное число, но нам нужен массив, поэтому проверяет это и преобразуем значение в массив
        if (!Array.isArray(object['remarks'])){
            object['remarks'] = [object['remarks']]    
        }          
    }
    
    // null values don't append to dataForm automatically for selectpicker elements, so add them manually    
    if(!Reflect.has(object, 'recommendations')){
        object['recommendations'] = [];
    } else {
        // если у компонента только одно значение, тогда она передается в объект как обычное число, но нам нужен массив, поэтому проверяет это и преобразуем значение в массив
        if (!Array.isArray(object['recommendations'])){
            object['recommendations'] = [object['recommendations']]    
        }          
    } 



    if (method == 'POST' ) { // create tree with first inspection
        object.inspection = {
            crowndiameter: object.crowndiameter,
            height: object.height, 
            trunkgirth: object.trunkgirth,
            photo1_newname: object.photo1_newname, 
            photo2_newname: object.photo2_newname,
            photo3_newname: object.photo3_newname,
            status: object.status,
            remarks: object.remarks,
            recommendations: object.recommendations,
            tree: 0, 
            user: 0
        }
        
        delete object.crowndiameter
        delete object.height
        delete object.trunkgirth
        delete object.photo1_newname
        delete object.photo2_newname
        delete object.photo3_newname
        delete object.status 
        delete object.remarks   
        delete object.recommendations
    }    

    console.log(object);


    fetch(url, {
        method: method,
        headers: {
            'Content-type':'application/json',
            'X-CSRFToken':csrftoken,
        },
        body: JSON.stringify(object)
    }
    ).then(function(response){
        if (response.status >= 400) {

            response.json().then(data => {
                alert(response.statusText+' ('+response.status+')\n\n'+data.errors);
              });
        
        } else {
            closeTabTree();
            if (IS_MOBILE) {
                CloseSidebar()         
            }                      
            
            // select the new/edited accident marker
            response.json().then(data => {
                console.log(data);
                LoadGeoJsonData(false, false);
                
            });
        }
    })


})



let button_deleteTree = document.getElementById('id_delete_tree');
button_deleteTree.onclick = function() {
    let idTree = document.getElementById("treeId").value
    let url = "{% url 'citytree-restapi-treeitem' city=obj_city.sysname pk=12345 %}".replace(/12345/, idTree.toString());   

    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-type':'application/json',
            'X-CSRFToken':csrftoken,
        }
    }
    ).then(function(response){
        if (response.status >= 400) {

            response.json().then(data => {
                alert(response.statusText+' ('+response.status+')\n\n'+data.detail);
              });            

        } else {
            LoadGeoJsonData(false, false);
            if (IS_MOBILE) {
                CloseSidebar()         
            }  
            closeTabTree();                       
        }
    })

}










let formInspectionWrapper = document.getElementById('id_scrollbar_inspection')
formInspectionWrapper.addEventListener('submit', function(e){
    e.preventDefault()
    let idInspection = document.getElementById("inspId").value
    let idTree = document.getElementById("inspTreeId").value
    let url
    let method

    if (idInspection) {
        url = "{% url 'citytree-restapi-inspection-item' city=obj_city.sysname treeid=54321 inspid=12345 %}".replace(/12345/, idInspection.toString()).replace(/54321/, idTree.toString());  
        method = 'PUT'
    } else {
        method = 'POST'
        url = "{% url 'citytree-restapi-inspections' city=obj_city.sysname treeid=12345 %}".replace(/12345/, idTree.toString());  
    }


    let object = {}

    const dataForm = new FormData(e.target);  

    dataForm.forEach((value, key) => {
        // Reflect.has in favor of: object.hasOwnProperty(key)
        if(!Reflect.has(object, key)){
            object[key] = value;
            return;
        }
        if(!Array.isArray(object[key])){
            object[key] = [object[key]];    
        }
        object[key].push(value);
    });



    // null values don't append to dataForm automatically for selectpicker elements, so add them manually    
    if(!Reflect.has(object, 'remarks')){
        object['remarks'] = [];
    } else {
        // если у компонента только одно значение, тогда она передается в объект как обычное число, но нам нужен массив, поэтому проверяет это и преобразуем значение в массив
        if (!Array.isArray(object['remarks'])){
            object['remarks'] = [object['remarks']]    
        }          
    }
    
    // null values don't append to dataForm automatically for selectpicker elements, so add them manually    
    if(!Reflect.has(object, 'recommendations')){
        object['recommendations'] = [];
    } else {
        // если у компонента только одно значение, тогда она передается в объект как обычное число, но нам нужен массив, поэтому проверяет это и преобразуем значение в массив
        if (!Array.isArray(object['recommendations'])){
            object['recommendations'] = [object['recommendations']]    
        }          
    }    


    console.log(object);


    fetch(url, {
        method: method,
        headers: {
            'Content-type':'application/json',
            'X-CSRFToken':csrftoken,
        },
        body: JSON.stringify(object)
    }
    ).then(function(response){
        if (response.status >= 400) {

            response.json().then(data => {
                alert(response.statusText+' ('+response.status+')\n\n'+data.detail);
              });
        
        } else {
            closeTabTree();
            if (IS_MOBILE) {
                CloseSidebar()         
            }                      
            
            // select the new/edited accident marker
            response.json().then(data => {
                console.log(data);
                LoadGeoJsonData(false, false);
                
            });
        }
    })


})


let button_deleteInsp = document.getElementById('id_delete_insp');
button_deleteInsp.onclick = function() {
    let idTree = document.getElementById("inspTreeId").value
    let idInsp = document.getElementById("inspId").value
    
    let url = "{% url 'citytree-restapi-inspection-item' city=obj_city.sysname treeid=12345 inspid=54321 %}".replace(/12345/, idTree.toString()).replace(/54321/, idInsp.toString());   

    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-type':'application/json',
            'X-CSRFToken':csrftoken,
        }
    }
    ).then(function(response){
        if (response.status >= 400) {

            response.json().then(data => {
                alert(response.statusText+' ('+response.status+')\n\n'+data.detail);
              });            

        } else {
            LoadGeoJsonData(false, false);
            if (IS_MOBILE) {
                CloseSidebar()         
            }  
            closeTabTree();                       
        }
    })

}








let formActionWrapper = document.getElementById('id_scrollbar_action')
formActionWrapper.addEventListener('submit', function(e){
    e.preventDefault()
    let idAction = document.getElementById("actionId").value
    let idTree = document.getElementById("actionTreeId").value
    let url
    let method

    if (idAction) {
        url = "{% url 'citytree-restapi-action-item' city=obj_city.sysname treeid=54321 actionid=12345 %}".replace(/12345/, idAction.toString()).replace(/54321/, idTree.toString());  
        method = 'PUT'
    } else {
        method = 'POST'
        url = "{% url 'citytree-restapi-actions' city=obj_city.sysname treeid=12345 %}".replace(/12345/, idTree.toString());  
    }


    let object = {}

    const dataForm = new FormData(e.target);  

    dataForm.forEach((value, key) => {
        // Reflect.has in favor of: object.hasOwnProperty(key)
        if(!Reflect.has(object, key)){
            object[key] = value;
            return;
        }
        if(!Array.isArray(object[key])){
            object[key] = [object[key]];    
        }
        object[key].push(value);
    });


    
    // null values don't append to dataForm automatically for selectpicker elements, so add them manually    
    if(!Reflect.has(object, 'actions')){
        object['actions'] = [];
    } else {
        // если у компонента только одно значение, тогда она передается в объект как обычное число, но нам нужен массив, поэтому проверяет это и преобразуем значение в массив
        if (!Array.isArray(object['actions'])){
            object['actions'] = [object['actions']]    
        }          
    }    


    console.log(object);


    fetch(url, {
        method: method,
        headers: {
            'Content-type':'application/json',
            'X-CSRFToken':csrftoken,
        },
        body: JSON.stringify(object)
    }
    ).then(function(response){
        if (response.status >= 400) {

            response.json().then(data => {
                alert(response.statusText+' ('+response.status+')\n\n'+data.detail);
              });
        
        } else {
            closeTabTree();
            if (IS_MOBILE) {
                CloseSidebar()         
            }                      
            
            // select the new/edited accident marker
            response.json().then(data => {
                console.log(data);
                LoadGeoJsonData(false, false);
                
            });
        }
    })


})


let button_deleteAction = document.getElementById('id_delete_action');
button_deleteAction.onclick = function() {
    let idTree = document.getElementById("actionTreeId").value
    let idAction = document.getElementById("actionId").value
    
    let url = "{% url 'citytree-restapi-action-item' city=obj_city.sysname treeid=12345 actionid=54321 %}".replace(/12345/, idTree.toString()).replace(/54321/, idAction.toString());   

    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-type':'application/json',
            'X-CSRFToken':csrftoken,
        }
    }
    ).then(function(response){
        if (response.status >= 400) {

            response.json().then(data => {
                alert(response.statusText+' ('+response.status+')\n\n'+data.detail);
              });            

        } else {
            LoadGeoJsonData(false, false);
            if (IS_MOBILE) {
                CloseSidebar()         
            }  
            closeTabTree();                       
        }
    })

}
export class NewMap extends L.map {

    #setView_nTimes_gps
    #circle_geolocation;


    baseLayerBeforeHeatmap // сохраняем карту, которая была перед тем, как включили режим карты для Heatmap в toggleMapForHeatmap
    activeBaseLayer

    tilesDefault = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 21,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZHJpdmVzb2Z0IiwiYSI6ImNqY3hkMzAwNTAwM2IzM28zajFoeG1pamYifQ.w5UaGnR0OMDIa6ARiyWoYQ'
    })//.addTo(mymap);

    tilesDark = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 21,
    id: 'mapbox/dark-v10', //
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZHJpdmVzb2Z0IiwiYSI6ImNqY3hkMzAwNTAwM2IzM28zajFoeG1pamYifQ.w5UaGnR0OMDIa6ARiyWoYQ'
    })//.addTo(mymap);


    tilesSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri',
	maxZoom: 19
    })//.addTo(mymap);


    tilesSat2 = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 21,
    id: 'mapbox/satellite-v9',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZHJpdmVzb2Z0IiwiYSI6ImNqY3hkMzAwNTAwM2IzM28zajFoeG1pamYifQ.w5UaGnR0OMDIa6ARiyWoYQ'
    })//.addTo(mymap);


    titlesGoogle = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    attribution: 'Google',
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
    })

    titlesGoogleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    attribution: 'Google',
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
    })

    tilesSatBing = L.tileLayer.bing('AniAD3xsGTaSbK1pa0_UkWS1CldG0nGI7r55MlVZqHhyKil9rD9dFK8536u8hTj1', {
    maxZoom: 22
    })//.addTo(mymap);



    baseMaps = {
    "Default": this.tilesDefault,
    "Dark": this.tilesDark,
    "Google": this.titlesGoogle,
    "Sat1": this.tilesSatBing,
    "Sat2": this.titlesGoogleSat,
    "Sat3": this.tilesSat,
    "Sat4": this.tilesSat2,
    }


    overlayMaps = {
        //"Heatmap": heatmapLayer
    }



    but_newmarker
    onButNewMarkerClick

    but_heatmap
    onButHeatmapClick

    but_geolocation
    OnButGeolocationClick

    but_info
    OnButInfoClick




    constructor(htmlEl, options, mapName, myOptions) {
        super(htmlEl, options); // вызывает конструктор super класса и передаёт параметр name


        if (mapName == "Default") {
            this.tilesDefault.addTo(this);
        } else if (mapName == "Dark") {
            this.tilesDark.addTo(this);
        } else if (mapName == "Google") {
            this.titlesGoogle.addTo(this);
        } else if (mapName == "Sat1") {
            this.tilesSatBing.addTo(this);
        } else if (mapName == "Sat2") {
            this.titlesGoogleSat.addTo(this);
        } else if (mapName == "Sat3") {
            this.tilesSat.addTo(this);
        } else if (mapName == "Sat4") {
            this.tilesSat2.addTo(this);
        } else {
            this.tilesDefault.addTo(this);
        }


        this.on('baselayerchange', function(e) {
            this.activeBaseLayer = e.layer;
        });



        L.control.zoom({
            position: 'topright'
        }).addTo(this);

        L.control.layers(this.baseMaps, this.overlayMaps, {position: 'topleft'}).addTo(this);






        let that = this;
        this.but_newmarker = L.easyButton({
            position: 'topright',
            states:[
                {
                    stateName: 'off',
                    icon: '<i class="fas fa-map-marker-alt fa-lg"></i>',
                    onClick: function(control){
                        control.state('on');
                        control.button.style.backgroundColor = 'red';

                        if (that.onButNewMarkerClick) {
                            that.onButNewMarkerClick(control);
                        }
                        //mymap.removeLayer(newMarker);
                    }
                },

                {
                    stateName: 'on',
                    icon: '<i class="fas fa-map-marker-alt fa-lg"></i>',
                    onClick: function(control){
                        control.state('off');
                        control.button.style.backgroundColor = 'white';

                        if (that.onButNewMarkerClick) {
                            that.onButNewMarkerClick(control);
                        }
                    }
                }]
        });
        this.but_newmarker.addTo(this);


        this.but_heatmap = L.easyButton({
            position: 'topright',
            states:[
                {
                    stateName: 'off',
                    icon: '<i class="fas fa-eye fa-lg"></i>',
                    onClick: function(control){
                        control.state('on');
                        control.button.style.backgroundColor = 'red';

                        that.toggleMapForHeatmap(true);

                        if (that.onButHeatmapClick) {
                            that.onButHeatmapClick(control);
                        }
                        //mymap.removeLayer(newMarker);
                    }
                },

                {
                    stateName: 'on',
                    icon: '<i class="fas fa-eye-slash fa-lg"></i>',
                    onClick: function(control){
                        control.state('off');
                        control.button.style.backgroundColor = 'white';

                        that.toggleMapForHeatmap(false);

                        if (that.onButHeatmapClick) {
                            that.onButHeatmapClick(control);
                        }
                    }
                }]
        });
        this.but_heatmap.addTo(this);



        this.but_geolocation = L.easyButton({
            position: 'topright',
            states:[
                {
                    stateName: 'off',
                    icon: '<i class="fas fa-satellite-dish fa-lg"></i>',
                    onClick: function(control){
                        control.state('on');
                        that.#setView_nTimes_gps = 4;
                        control.button.style.backgroundColor = 'red';
                        that.locate({maxZoom: 20, enableHighAccuracy: true, watch:true, maximumAge: 20000});

                        if (that.OnButGeolocationClick) {
                            that.OnButGeolocationClick(control);
                        }
                    }
                },

                {
                    stateName: 'on',
                    icon: '<i class="fas fa-satellite-dish fa-lg"></i>',
                    onClick: function(control){
                        control.state('off');
                        control.button.style.backgroundColor = 'white';
                        that.stopLocate();
                        that.removeLayer(that.#circle_geolocation);
                        that.#setView_nTimes_gps = 4;

                        if (that.OnButGeolocationClick) {
                            that.OnButGeolocationClick(control);
                        }
                    }
                }]
        });
        this.but_geolocation.addTo(this);

        this.on('locationfound', function(e) {

            let radius = e.accuracy / 2;

            if (that.#setView_nTimes_gps > 0) {
                that.setView(e.latlng, 20);
                that.#setView_nTimes_gps = that.#setView_nTimes_gps - 1;
            }

            if (that.hasLayer(that.#circle_geolocation)) {
                that.#circle_geolocation.setLatLng(e.latlng);
                that.#circle_geolocation.setRadius(radius);
            } else {
                that.#circle_geolocation = L.circle(e.latlng, radius).addTo(that);
            }



        });


        this.on('locationerror', function(e){
            that.but_geolocation.state('off');
            that.but_geolocation.button.style.backgroundColor = 'white';
            alert(e.message);
        });





        if (myOptions && myOptions.visible_ButtonInfo) {
            this.but_info = L.easyButton('fa-info-circle fa-lg', function(btn, map){
                if (that.OnButInfoClick) {
                    that.OnButInfoClick(btn);
                }
            }, {position: 'bottomleft'});
            this.but_info.addTo(this);
        }


    }


    // Methods =========================================================================================================
    toggleMapForHeatmap = (isHeatMap) => {

        if (isHeatMap) {
            this.baseLayerBeforeHeatmap = this.activeBaseLayer;
            this.tilesDark.addTo(this);
            this.tilesDark.bringToFront();
            if (this.baseLayerBeforeHeatmap !== this.tilesDark) {
                this.removeLayer(this.baseLayerBeforeHeatmap); // если не удалять, тогда не срабатывает событие baselayerchange, а на этом событии у нас сохраняется название карты в сессии, чтобы восстанавливать при следующем посещении пользователем
            }
        } else {
            this.removeLayer(this.tilesDark);
            this.baseLayerBeforeHeatmap.addTo(this);
            this.baseLayerBeforeHeatmap.bringToFront();
            this.activeBaseLayer = this.baseLayerBeforeHeatmap
        }

    }


}



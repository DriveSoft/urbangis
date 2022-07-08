import { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, LayersControl, TileLayer, ZoomControl, useMapEvents, GeoJSON, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import "leaflet.heat";
import "./Map.css";

//import ButtonMap from './ButtonMap'
import ButtonMap_ from './ButtonMap';
import MapTileLayers from '../components_hl/MapTileLayers';

import "leaflet/dist/leaflet.css";
import redIconFile from '../components/images/markers/marker-red.png';
import redIconShadowFile from '../components/images/markers/marker-shadow.png';

import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'react-leaflet-markercluster/dist/styles.min.css'; // sass
//require('leaflet/dist/leaflet.css'); // inside .js file
//require('react-leaflet-markercluster/dist/styles.min.css'); // inside .js file

import { useSelector, useDispatch } from 'react-redux';
import {
	actCheckButtonGPS,
	actCheckButtonHeatmap,
	actCheckButtonNewMarker,
	actMapBaseLayerName,
	actNewMarkerState,
	actShowOkCancelMobileMarker
    //actShowAccidentTab,
    //actActiveTabKey
} from "../actions";
import { RootState } from '../reducers/index';

// fix disapeared marker from map

//import icon from 'leaflet/dist/images/marker-icon.png';
//import iconShadow from 'leaflet/dist/images/marker-shadow.png';
//let DefaultIcon = L.icon({
//    iconAnchor: [12, 40],
//    iconUrl: icon,
//    shadowUrl: iconShadow
//});
//L.Marker.prototype.options.icon = DefaultIcon;





let redIcon = L.icon({ 
    iconUrl: redIconFile,
    shadowUrl: redIconShadowFile,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });








//let buttonNewMarker = null
//let buttonHeatmap = null
//let buttonGPS = null

let currentCitySysname = ''

let heatMapLayer: any;
let markersLayer

let setView_nTimes_gps: number;
let circle_geolocation: L.Circle<any>;





interface IStateCurrentCity {
    id: number
	sysname: string;
	cityname: string;
	latitude: string;
	longitude: string;
	population: number;	
    zoom: number;
}

interface MapProps {
    mainData: any;
    appname: string;
    dataHeatmapPoints: number[][]; // [[lat, lng, value],[lat, lng, value]...]
    currentCity: string;
    onDragEndNewMarker: (LatLng: {lon: number; lat: number}) => void;
    onClickMap: (e: any) => void;
    onZoomEnd?: (e: any) => void;
    onEachLayer?: (layer: L.Layer, zoom: number) => void;
    //onMarkerClick: (data: any) => void;
    pointToLayerCallback: (feature: any, latlng: L.LatLng) => any;
    filterMapCallback: (feature: any) => boolean;
}

function Map ({
                mainData,  
                appname,          
                dataHeatmapPoints, 
                currentCity,                 
                onDragEndNewMarker, 
                onClickMap, 
                onZoomEnd,  
                onEachLayer,                            
                //onMarkerClick,                 
                pointToLayerCallback,
                filterMapCallback               
            }: MapProps) {
               

    const dispatch = useDispatch()
    //const defaultZoom = 13;
    //const rxDataAccidents = useSelector((state: RootState) => state.dataReducer.dataAccidents)
    
    const rxMapBaseLayerName = useSelector((state: RootState) => state.uiReducer.mapBaseLayerName);
    const rxIsMobileDevice = useSelector((state: RootState) => state.uiReducer.isMobileDevice);
    const rxShowSidebar = useSelector((state: RootState) => state.uiReducer.showSidebar);
    const rxNewMarkerState = useSelector((state: RootState) => state.uiReducer.newMarkerState);
    const rxShowOkCancelMobileMarker = useSelector((state: RootState) => state.uiReducer.showOkCancelMobileMarker);
    
    const rxCheckButtonNewMarker = useSelector((state: RootState) => state.uiReducer.checkButtonNewMarker);
    const rxCheckButtonHeatmap = useSelector((state: RootState) => state.uiReducer.checkButtonHeatmap);
    const rxCheckButtonGPS = useSelector((state: RootState) => state.uiReducer.checkButtonGPS);

    //const [currentCityInfo, setCurrentCityInfo] = useState({latitude: "0", longitude: "0"})
    const [currentCityInfo, setCurrentCityInfo] = useState<IStateCurrentCity | null>(null);
    const [map, setMap] = useState<any>(null);  
    
    const [currentZoom, setCurrentZoom] = useState(13); 

    const [buttonNewMarker, setButtonNewMarker] = useState<any>(null);
    const [buttonHeatmap, setButtonHeatmap] = useState<any>(null);
    const [buttonGPS, setButtonGPS] = useState<any>(null);

    let mapname_ = document.cookie
    .split('; ')
    .find(row => row.startsWith('mapname='))

    let mapname
    if (mapname_) {
        mapname = mapname_.split('=')[1]    
    }


    let newMarkerRef = useRef(null)   
 

    // create buttons
    useEffect(() => {        
        if (map) {            
            setButtonNewMarker( ButtonMap_(map, 'fas fa-map-marker-alt fa-lg', 'fas fa-map-marker-alt fa-lg', onClickNewMarker) )
            setButtonHeatmap( ButtonMap_(map, 'fas fa-eye fa-lg', 'fas fa-eye-slash fa-lg', onClickHeatmap) )
            setButtonGPS( ButtonMap_(map, 'fas fa-satellite-dish fa-lg', 'fas fa-satellite-dish fa-lg', onClickGPS) )
            
            //setMapCurrentLatLng({lat: map.getCenter().lat, lng: map.getCenter().lng})                        

            let mapname_ = document.cookie
			.split("; ")
			.find((row) => row.startsWith("mapname="));

		    if (mapname_) {
                dispatch(actMapBaseLayerName(mapname_.split("=")[1]))
		    }            
        }        

        return () => { 
            buttonNewMarker && buttonNewMarker.remove()
            buttonHeatmap && buttonHeatmap.remove()
            buttonGPS && buttonGPS.remove()
        }  


      }, [map])  //<MapContainer whenCreated={setMap} ...


    // load data for the city
    useEffect(() => {

        const fetchCity = async () => {
            const res = await fetch(`${process.env.REACT_APP_API_URL}cities/${currentCity}`);
            const data = await res.json();
            setCurrentCityInfo(data);          
        }

        fetchCity();
        console.log('currentCity');
           
    }, [currentCity])  //[currentCity]
   

    //useEffect(() => {
    //    if (currentCityInfo && map) {
    //        //map.setZoom(currentCityInfo.zoom);
    //        if (onZoomEnd) onZoomEnd(currentCityInfo.zoom);          
    //    }    
    //
    //}, [currentCityInfo]);   
    
    


      // apply states for buttons
      
      useEffect(() => {        
        if (buttonNewMarker) {
            if (rxCheckButtonNewMarker) {
                buttonNewMarker.state('on');
                buttonNewMarker.button.style.backgroundColor = 'red';
            } else {
                buttonNewMarker.state('off');
                buttonNewMarker.button.style.backgroundColor = 'white';            
            }  
        }
      }, [rxCheckButtonNewMarker]);

      useEffect(() => {        
        if (buttonHeatmap) {
            if (rxCheckButtonHeatmap) {
                buttonHeatmap.state('on');
                buttonHeatmap.button.style.backgroundColor = 'red';
            } else {
                buttonHeatmap.state('off');
                buttonHeatmap.button.style.backgroundColor = 'white';            
            }  
        }
      }, [rxCheckButtonHeatmap])
      useEffect(() => {        
        if (buttonGPS) {
            if (rxCheckButtonGPS) {
                buttonGPS.state('on');
                buttonGPS.button.style.backgroundColor = 'red';
            } else {
                buttonGPS.state('off');
                buttonGPS.button.style.backgroundColor = 'white';            
            }  
        }
      }, [rxCheckButtonGPS])      


    
    useEffect(()=>{
        if (map && !rxIsMobileDevice) {
            if (rxCheckButtonNewMarker) {
                L.DomUtil.addClass(map._container,'crosshair-cursor-enabled');
            } else {
                L.DomUtil.removeClass(map._container,'crosshair-cursor-enabled');
            }    
        }
    }, [rxCheckButtonNewMarker]); 
      


    useEffect(()=>{
        if (map) {
            window.setTimeout(function(){map.invalidateSize({pan: false});}, 600)
        }        
    }, [rxShowSidebar])






    

	const onClickNewMarker = (state: boolean) => {        
        
        dispatch(actCheckButtonNewMarker(state));
        

		if (rxIsMobileDevice && state) {						
            dispatch(actNewMarkerState({ visible: true, position: {lat: 0, lng: 0} }));
            dispatch(actShowOkCancelMobileMarker(true));
		}
	};

	const onClickHeatmap = (state: boolean) => {		
        console.log("onClickHeatmap", state);

		if (state) {
            dispatch(actMapBaseLayerName('Dark'))
		} else {
            dispatch(actMapBaseLayerName('Default'))
		}
        dispatch(actCheckButtonHeatmap(state))
	};





    function SetPanToMap() {        
        const map = useMap();
        if (currentCityInfo) {
            // change map position when current city has been changed        
            if (currentCitySysname !== currentCityInfo["sysname"]) {
                map.panTo( [parseFloat(currentCityInfo["latitude"]), parseFloat(currentCityInfo["longitude"])] );
            }
            currentCitySysname = currentCityInfo["sysname"];

        }
        return null;
    }    


    function onClickGPS(state: boolean) {
        if (map) {
            if (state){
                setView_nTimes_gps = 4;
                map.locate({maxZoom: 20, enableHighAccuracy: true, watch:true, maximumAge: 20000});
            } else {
                map.stopLocate();
                map.removeLayer(circle_geolocation);
                setView_nTimes_gps = 4;
            }

        }
        dispatch(actCheckButtonGPS(state))
    }


    //function markerOnClick(e: any)
    //{
    //    let marker: L.Marker = e.target;
    //    let geojson = marker.toGeoJSON(); //: GeoJSON.FeatureCollection<any>
    //    onMarkerClick(geojson);
    //    //console.log(geojson)        
    //}


    //function pointToLayer_roadaccident(feature: GeoJSON.Point|GeoJSON.Feature<GeoJSON.Point>, latlng: L.LatLng): any 
    //{
    //    if (!rxCheckButtonHeatmap) {
    //        return L.circleMarker(latlng, geojsonMarkerOptions).on('click', markerOnClick)        
    //    }
    //    //return null;
    //}


    
    /*
    function ZoomToRadius (zoom: number, crowndiameter: number) {
        let r: number = Math.floor(crowndiameter / 2);

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
    */ 

    //function pointToLayer_citytree(feature: any, latlng: L.LatLng): any {   
    //    console.log('123') 
    //    return L.circleMarker(latlng, geojsonMarkerOptions_citytree).on('click', markerOnClick)
        /*
        if (!rxCheckButtonHeatmap && currentZoom !== null) {
            console.log('currentZoom', currentZoom)   
            console.log('lastinsp_crowndiameter', feature.properties.lastinsp_crowndiameter)

            geojsonMarkerOptions_citytree.radius = ZoomToRadius(currentZoom, feature.properties.lastinsp_crowndiameter);
            if (geojsonMarkerOptions_citytree.radius < 2) {
                geojsonMarkerOptions_citytree.radius = 2;
            }

            return L.circleMarker(latlng, geojsonMarkerOptions_citytree).on('click', markerOnClick)        
        }*/

/*

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

*/



    //}



    //function onEachFeaturePoint(feature, layer) {
    function onEachFeaturePoint(feature: any, layer: L.Layer) {        
        //console.log('feature: ', feature);
        //console.log('layer: ', layer);
        layer.on({
          'click': function (e) {
             console.log('e: ', e);
             console.log('click');
           }
        })
    }    





    function NewMarker({newMarkerState}: any) {          
        const visible = newMarkerState.visible;

        const map = useMap();

        const eventHandlers = useMemo(
            () => ({
                dragend() {
                    if (newMarkerRef.current) {
                        const marker: L.Marker = newMarkerRef.current;
                        if (!rxIsMobileDevice && marker != null) {
                            //onDragEndNewMarker(marker.getLatLng())                        
                            const LatLng = marker.getLatLng();
                            let coord = { lat: '0', lng: '0' };
                            coord.lat = LatLng.lat.toFixed(5);
                            coord.lng = LatLng.lng.toFixed(5);
                    
                            //setNewMarkerState({ visible: true, position: coord }); 
                            dispatch(actNewMarkerState({ visible: true, position: coord }));                       
                        }
                    }
                },
            }),
            [],
        );

        return (<>
                    {visible && <> 
                        {(!rxIsMobileDevice) 
                        ?
                            <Marker
                                icon={redIcon}
                                key='newMarker'
                                draggable={true}
                                position={newMarkerState.position}
                                ref={newMarkerRef}
                                eventHandlers={eventHandlers}                    
                            />                    
                        :
                            <Marker
                                icon={redIcon}
                                key='newMarker'
                                draggable={false}
                                //position={map.getCenter()}
                                position={newMarkerState.position.lat==0 ? map.getCenter() : newMarkerState.position }
                                ref={newMarkerRef}                 
                            />
                        } 
                </>}
                                         
        </>)
    }
    


    function MapEvents() {        
        const map = useMapEvents({
            baselayerchange(e) {
                document.cookie = 'mapname='+e.name
            }, 
            //baselayerchange: onBaselayerchange,

            move(e) {               
                
                if (rxShowOkCancelMobileMarker) {
                    if (newMarkerRef.current) {
                        const marker: L.Marker = newMarkerRef.current
                        marker.setLatLng({lat: e.target.getCenter().lat, lng: e.target.getCenter().lng})
                                        
                        //let coord = { lat: 0, lng: 0 }
                        //coord.lat = e.target.getCenter().lat.toFixed(5)
                        //coord.lng = e.target.getCenter().lng.toFixed(5)
                    }
                }    
            },

            moveend(e) {
                if (rxShowOkCancelMobileMarker) {
                    if (newMarkerRef.current) {
                        const marker: L.Marker = newMarkerRef.current
                        const LatLng = marker.getLatLng()
                        let coord = { lat: '0', lng: '0' };
                        coord.lat = LatLng.lat.toFixed(5);
                        coord.lng = LatLng.lng.toFixed(5);                   
                        //setNewMarkerState({visible: true, position: coord})                        
                        dispatch(actNewMarkerState({visible: true, position: coord}))
                    }
                }
                //setMapCurrentLatLng({lat: e.target.getCenter().lat, lng: e.target.getCenter().lng})


            },
            
            click(e) {
                onClickMap(e)
                /*
                if (rxCheckButtonNewMarker && !rxIsMobileDevice) {
                    //setCheckButtonNewMarker(false)
                    dispatch(actCheckButtonNewMarker(false));
        
                    let coord = { lat: '0', lng: '0' };
                    coord.lat = e.latlng.lat.toFixed(5);
                    coord.lng = e.latlng.lng.toFixed(5);
        
                    //setNewMarkerState({ visible: true, position: coord })
                    dispatch(actNewMarkerState({ visible: true, position: coord }));
        
                    //setShowAccidentTab(true)
                    dispatch(actShowAccidentTab(true));
                    //setActiveTabKey("accident")
                    dispatch(actActiveTabKey('accident'));
                } 
                */               
            }, 

            zoomend(e){                                
                if (onZoomEnd) onZoomEnd(e);

                setCurrentZoom(e.target._zoom)                 
                //dispatch(actCurrentMapZoom(e.target._zoom));               
            },

            locationfound(e){
                let radius = e.accuracy / 2;

                if (setView_nTimes_gps > 0) {
                    map.setView(e.latlng, 20);
                    setView_nTimes_gps = setView_nTimes_gps - 1;
                }
    
                if (map.hasLayer(circle_geolocation)) {
                    circle_geolocation.setLatLng(e.latlng);
                    circle_geolocation.setRadius(radius);
                } else {
                    circle_geolocation = L.circle(e.latlng, radius).addTo(map);
                }                
            },

            locationerror(e){
                //setCheckButtonGPS(false)
                dispatch(actCheckButtonGPS(false))
                alert(e.message)
            }
        })
      
        return null
      }



    function MarkersZoomAdjustment(){
        const map = useMap(); 
        const zoom = map.getZoom();
                 
        if (onEachLayer) {
            map.eachLayer(function (layer) {
                onEachLayer(layer, zoom);           
            });
        }

        return null
    }



      function HeatmapFunction(){
        const map = useMap();
        //useEffect(() => {
          //const points = addressPoints
          //? addressPoints.map((p) => {
          //  return [p[0], p[1], p[2]]; // lat lng intensity
          //  })
          //: [];
     
            const points = [
                [43.207650, 27.958490, 1.0]
            ]



            if (heatMapLayer) { 
                map.removeLayer(heatMapLayer)
            }

            if (rxCheckButtonHeatmap) {                
                if (dataHeatmapPoints) {
                    // @ts-ignore
                    heatMapLayer = L.heatLayer(dataHeatmapPoints, {
                        gradient: {0.4: '#1E90FF', 0.8: 'white', 1: 'red'},                        
                        //minOpacity: 0.1,
                        max: 1.5,
                        radius: 14,
                        blur: 10,
                        maxZoom: 6

                    })//.addTo(map);
                    map.addLayer(heatMapLayer)                
                }
            }


            //heatMap.addLatLng([43.207650, 27.998590])
            //heatMap.setLatLngs([])

            //L.heatLayer(points).redraw()
            //L.heatLayer(points).addLatLng([43.207650, 27.998590])

        //}, [dataHeatmapPoints]);

        return null
     }





    const createClusterCustomIcon  = function (cluster: L.MarkerCluster) {
        // get the number of items in the cluster
        let count = cluster.getChildCount();

        // figure out how many digits long the number is
        //var digits = (count + '').length;
        let digits;
        if (count == 2) { digits = '1'; }
        if (count >= 3 && count <=5) { digits = '2'; }
        if (count >= 6 && count <=9) { digits = '3'; }
        if (count >= 10 && count <=14) { digits = '4'; }
        if (count > 14) { digits = '5'; }

        return L.divIcon({
          html: count.toString(),
          className: 'cluster digits-' + digits,
          iconSize: undefined
        });
      }




    return (
        <>        
        {/* The map rendered before useEffect called, so first we need to load currentCityInfo before to show the map */}
        { currentCityInfo && currentCityInfo["longitude"] !== "0" && currentCityInfo["latitude"]!=="0" ? ( 

            <MapContainer whenCreated={setMap} center={[parseFloat(currentCityInfo["latitude"]), parseFloat(currentCityInfo["longitude"])]} zoom={currentCityInfo.zoom} zoomControl={false} scrollWheelZoom={true} style={{ height: 'calc(100vh - 60px)', width: '100%' }} >                
                <LayersControl position="topleft">                    
                    <MapTileLayers mapBaseLayerName={rxMapBaseLayerName} />                 
                </LayersControl>    

            
                {/* To change center of the map when current city will change */}
                {/*<SetViewMap center={[parseFloat(currentCityInfo["latitude"]), parseFloat(currentCityInfo["longitude"])]} />*/} 
                <SetPanToMap />



                {appname === 'roadaccident' && <> 
                    {currentZoom && currentZoom < 15 ? (
                        <GeoJSON key={mainData.dateTimeGenerated} data={mainData} pointToLayer={pointToLayerCallback} filter={filterMapCallback} onEachFeature={onEachFeaturePoint}/>  
                    ) : (
                        /* @ts-ignore */
                        <MarkerClusterGroup
                        spiderfyOnMaxZoom={true}
                        showCoverageOnHover={false}
                        zoomToBoundsOnClick={true}
                        maxClusterRadius={15}
                        iconCreateFunction={createClusterCustomIcon}>                
                            <GeoJSON key={mainData.dateTimeGenerated} data={mainData} pointToLayer={pointToLayerCallback} filter={filterMapCallback} onEachFeature={onEachFeaturePoint}/>                
                        </MarkerClusterGroup>
                    )}
                </>}


                {appname === 'citytree' && <>                     
                    <GeoJSON key={mainData.dateTimeGenerated} data={mainData} pointToLayer={pointToLayerCallback} filter={filterMapCallback} onEachFeature={onEachFeaturePoint}/>  
                </>}





                <NewMarker newMarkerState={rxNewMarkerState} onDragEndNewMarker={onDragEndNewMarker}/>
                
                <MapEvents />
                
                {!rxIsMobileDevice && <ZoomControl position='bottomright'/>}
                
   
                {/* <ButtonsControl /> */}

                <HeatmapFunction />
                
                {onEachLayer && <MarkersZoomAdjustment />}
                
            </MapContainer>
        ) : (
            <p>Loading...</p>
        )}    
            
        </>
        
    )
}

export default Map


//https://egghead.io/lessons/react-create-a-new-map-using-react-leaflet

//https://codesandbox.io/s/63wqz?file=/src/LeafletControlGeocoder.jsx
//https://www.npmjs.com/package/leaflet-control-geocoder

//https://codesandbox.io/s/how-to-add-a-legend-to-the-map-using-react-leaflet-useleaflet-hook-75jnp?file=/src/index.js

//https://newbedev.com/home-button-leaflet-map

//пример �
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
	actMapMarkerState,
	actShowOkCancelMobileMarker
    //actShowAccidentTab,
    //actActiveTabKey
} from "../actions";
import { RootState } from '../reducers/index';
import { ScriptElementKindModifier } from 'typescript';

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
    onDragEndNewMarker: (LatLng: {lat: number; lng: number}) => void;
    onClickMap: (e: any) => void;
    onClickCreateNewMarker?: (state: boolean) => boolean | void;
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
                onClickCreateNewMarker,
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
    const rxMapMarkerState = useSelector((state: RootState) => state.uiReducer.mapMarkerState);
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
        // if (onClickCreateNewMarker) {
        //     const preventDefault = onClickCreateNewMarker(state);            
        //     if (preventDefault === false) {            
        //         return
        //     }                
        // }
                        
		if (rxIsMobileDevice && state) {						
            dispatch(actMapMarkerState({ visible: true, position: {lat: 0, lng: 0} }));
            dispatch(actShowOkCancelMobileMarker(true));
		}

        dispatch(actCheckButtonNewMarker(state));
	};

	const onClickHeatmap = (state: boolean) => {		        		
        dispatch(actCheckButtonHeatmap(state));
        if (state) {
            dispatch(actMapBaseLayerName('Dark'));
		} else {
            dispatch(actMapBaseLayerName('Default'));
		}
        
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
                if (circle_geolocation && map.hasLayer(circle_geolocation)) map.removeLayer(circle_geolocation);
                setView_nTimes_gps = 4;
            }

        }
        dispatch(actCheckButtonGPS(state));
    }


    function NewMarker({mapMarkerState}: any) {  
        const visible = mapMarkerState.visible;
        const map = useMap();

        const eventHandlers = useMemo(
            () => ({
                dragend() {
                    
                    if (newMarkerRef.current) {
                        const marker: L.Marker = newMarkerRef.current;
                        if (!rxIsMobileDevice && marker != null) {                                                    
                            const LatLng = marker.getLatLng();
                            const coord = { lat: '0', lng: '0' };
                            coord.lat = LatLng.lat.toFixed(5);
                            coord.lng = LatLng.lng.toFixed(5);
                            
                            //const cordFloat = {lat: parseFloat(coord.lat), lng: parseFloat(coord.lng)}
                            //onDragEndNewMarker(cordFloat);
                            //setNewMarkerState({ visible: true, position: coord }); 
                            //console.log('123', { visible: true, position: coord });
                            
                            // I don't know why, but that prevent the error for citytree app, when user try to move the marker
                            sleep(0).then(() => {
                                //console.log('onDragEndNewMarker timer', { visible: true, position: coord });
                                    dispatch(actMapMarkerState({ visible: true, position: coord })); 
                            });

                                                                        
                        }
                    }
                }
            }),
            [],
        );
        function sleep (time: number) {
            return new Promise((resolve) => setTimeout(resolve, time));
        }          

         

        return (<>
                    {visible && <> 
                        {(!rxIsMobileDevice) 
                        ?
                            <Marker
                                icon={redIcon}
                                key='newMarker'
                                draggable={true}
                                position={mapMarkerState.position}                                                                
                                ref={newMarkerRef}
                                eventHandlers={eventHandlers}                    
                            />                    
                        :
                            <Marker
                                icon={redIcon}
                                key='newMarker'
                                draggable={false}
                                //position={map.getCenter()}
                                position={mapMarkerState.position.lat==0 ? map.getCenter() : mapMarkerState.position }
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
                        dispatch(actMapMarkerState({visible: true, position: coord}))
                    }
                }
                setView_nTimes_gps = 0;
                //setMapCurrentLatLng({lat: e.target.getCenter().lat, lng: e.target.getCenter().lng})


            },
            
            click(e) {
                onClickMap(e)              
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
    
                if (circle_geolocation && map.hasLayer(circle_geolocation)) {
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

    function onEachFeaturePoint(feature: any, layer: L.Layer) {               
        //@ts-ignore
        //layer.myTag = "myGeoJSON"
        // layer.on({
        //   'click': function (e) {
        //      console.log('e: ', e);
        //      console.log('click');
        //    }
        // })
    }  

    function HeatmapFunction(){
        const map = useMap();

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
                    map.addLayer(heatMapLayer);                
                }
            } 

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
                    {console.log('mainData.dateTimeGenerated', mainData.dateTimeGenerated)}
                    <GeoJSON key={mainData.dateTimeGenerated} data={mainData} pointToLayer={pointToLayerCallback} filter={filterMapCallback} onEachFeature={onEachFeaturePoint}/>                                       
                </>}

                <NewMarker mapMarkerState={rxMapMarkerState} onDragEndNewMarker={onDragEndNewMarker}/>
                
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

//пример 
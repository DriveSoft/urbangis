import { useState, useEffect, useRef, useMemo } from 'react'
import { MapContainer, LayersControl, TileLayer, ZoomControl, useMapEvents, GeoJSON, useMap, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import "leaflet.heat"

//import ButtonMap from './ButtonMap'
import ButtonMap_ from './ButtonMap_'
import MapTileLayers from './MapTileLayers'

import "leaflet/dist/leaflet.css";
import redIconFile from './images/markers/marker-red.png';
import redIconShadowFile from './images/markers/marker-shadow.png';

import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'react-leaflet-markercluster/dist/styles.min.css'; // sass
//require('leaflet/dist/leaflet.css'); // inside .js file
//require('react-leaflet-markercluster/dist/styles.min.css'); // inside .js file


import { useSelector, useDispatch } from 'react-redux'
import {
	actCheckButtonGPS,
	actCheckButtonHeatmap,
	actCheckButtonNewMarker,
	actMapBaseLayerName,
	actNewMarkerState,
	actShowOkCancelMobileMarker,
    actShowAccidentTab,
    actActiveTabKey
} from "../actions";


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


let geojsonMarkerOptions = {
    //renderer: myRenderer,
    radius: 6, //6
    fillColor: "#402000",//"#ff7800",
    color: "#000",
    weight: 0, //2  сильно тормозит на мобильной версии если weight > 0
    opacity: 0.5,//0.7
    fillOpacity: 0.6//0.2
};

//let buttonNewMarker = null
//let buttonHeatmap = null
//let buttonGPS = null

let currentCitySysname = ''

let heatMapLayer
let markersLayer

let setView_nTimes_gps
let circle_geolocation


function Map ({
                dataHeatmapPoints, 
                currentCity,                 
                onDragEndNewMarker,                                
                onMarkerClick,                 
                filterMapCallback                
            }) {

    const dispatch = useDispatch()

    const rxDataAccidents = useSelector(state => state.dataReducer.dataAccidents)
    
    const rxMapBaseLayerName = useSelector(state => state.uiReducer.mapBaseLayerName)
    const rxIsMobileDevice = useSelector(state => state.uiReducer.isMobileDevice)
    const rxShowSidebar = useSelector(state => state.uiReducer.showSidebar)
    const rxNewMarkerState = useSelector(state => state.uiReducer.newMarkerState)
    const rxShowOkCancelMobileMarker = useSelector(state => state.uiReducer.showOkCancelMobileMarker)
    
    const rxCheckButtonNewMarker = useSelector(state => state.uiReducer.checkButtonNewMarker)
    const rxCheckButtonHeatmap = useSelector(state => state.uiReducer.checkButtonHeatmap)
    const rxCheckButtonGPS = useSelector(state => state.uiReducer.checkButtonGPS)

    const [currentCityInfo, setCurrentCityInfo] = useState({latitude: "0", longitude: "0"})
    const [map, setMap] = useState(null);  
    const [currentZoom, setCurrentZoom] = useState(null)  
 

    const [buttonNewMarker, setButtonNewMarker] = useState(null);
    const [buttonHeatmap, setButtonHeatmap] = useState(null);
    const [buttonGPS, setButtonGPS] = useState(null);

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
          const res = await fetch(`${process.env.REACT_APP_API_URL}cities/${currentCity}`)
          const data = await res.json()
          setCurrentCityInfo(data)
        }
        fetchCity()        
   
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
      }, [rxCheckButtonNewMarker])
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
    }, [rxCheckButtonNewMarker])
      


    useEffect(()=>{
        if (map) {
            window.setTimeout(function(){map.invalidateSize({pan: false});}, 600)
        }        
    }, [rxShowSidebar])






    

	const onClickNewMarker = (state) => {
        dispatch(actCheckButtonNewMarker(state))

		if (rxIsMobileDevice && state) {						
            dispatch(actNewMarkerState({ visible: true, position: {lat: 0, lng: 0} }))
            dispatch(actShowOkCancelMobileMarker(true))
		}
	};

	const onClickHeatmap = (state) => {
		console.log("onClickHeatmap", state);

		if (state) {
            dispatch(actMapBaseLayerName('Dark'))
		} else {
            dispatch(actMapBaseLayerName('Default'))
		}
        dispatch(actCheckButtonHeatmap(state))
	};





    function SetPanToMap() {        
        const map = useMap()
        // change map position when current city has been changed
        if (currentCitySysname !== currentCityInfo["sysname"]) {
            map.panTo( [parseFloat(currentCityInfo["latitude"]), parseFloat(currentCityInfo["longitude"])] )
        }
        currentCitySysname = currentCityInfo["sysname"]

        return null
    }    


    function onClickGPS(state) {
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


    function markerOnClick(e)
    {
        let marker = e.target;
        let geojson = marker.toGeoJSON();
        onMarkerClick(geojson)
        //console.log(geojson)
        
        
    }

    function pointToLayer(feature, latlng) {
        //return L.circleMarker(latlng, geojsonMarkerOptions).bindPopup("MESSAGE")
        if (!rxCheckButtonHeatmap) {
            return L.circleMarker(latlng, geojsonMarkerOptions).on('click', markerOnClick)        
        }
        
    }


    function onEachFeaturePoint(feature, layer) {
        //console.log('feature: ', feature);
        //console.log('layer: ', layer);
        layer.on({
          'click': function (e) {
             console.log('e: ', e);
             console.log('click');
           }
        })
    }    





    function NewMarker({newMarkerState}) {          
        const visible = newMarkerState.visible

        const map = useMap()

        const eventHandlers = useMemo(
            () => ({
                dragend() {
                    const marker = newMarkerRef.current
                    if (!rxIsMobileDevice && marker != null) {
                        //onDragEndNewMarker(marker.getLatLng())                        
                        const LatLng = marker.getLatLng()
                        let coord = { lat: 0, lng: 0 };
                        coord.lat = LatLng.lat.toFixed(5);
                        coord.lng = LatLng.lng.toFixed(5);
                
                        //setNewMarkerState({ visible: true, position: coord }); 
                        dispatch(actNewMarkerState({ visible: true, position: coord }))                       
                    }
                },
            }),
            [],
        )





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

                    const marker = newMarkerRef.current
                    marker.setLatLng({lat: e.target.getCenter().lat, lng: e.target.getCenter().lng})
                                    
                    //let coord = { lat: 0, lng: 0 }
                    //coord.lat = e.target.getCenter().lat.toFixed(5)
                    //coord.lng = e.target.getCenter().lng.toFixed(5)
                }    
            },

            moveend(e) {
                if (rxShowOkCancelMobileMarker) {
                    
                    const marker = newMarkerRef.current
                    const LatLng = marker.getLatLng()
                    let coord = { lat: 0, lng: 0 };
                    coord.lat = LatLng.lat.toFixed(5);
                    coord.lng = LatLng.lng.toFixed(5);                   
                    //setNewMarkerState({visible: true, position: coord})                        
                    dispatch(actNewMarkerState({visible: true, position: coord}))
                }
                //setMapCurrentLatLng({lat: e.target.getCenter().lat, lng: e.target.getCenter().lng})


            },
            
            click(e) {
                //onClickMap(e)
                if (rxCheckButtonNewMarker && !rxIsMobileDevice) {
                    //setCheckButtonNewMarker(false)
                    dispatch(actCheckButtonNewMarker(false))
        
                    let coord = { lat: 0, lng: 0 }
                    coord.lat = e.latlng.lat.toFixed(5)
                    coord.lng = e.latlng.lng.toFixed(5)
        
                    //setNewMarkerState({ visible: true, position: coord })
                    dispatch(actNewMarkerState({ visible: true, position: coord }))
        
                    //setShowAccidentTab(true)
                    dispatch(actShowAccidentTab(true))
                    //setActiveTabKey("accident")
                    dispatch(actActiveTabKey('accident'))
                }                
            }, 

            zoomend(e){                
                setCurrentZoom(e.target._zoom)
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





      function HeatmapFunction(){
        const map = useMap()
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





    const createClusterCustomIcon  = function (cluster) {
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
          html: count,
          className: 'cluster digits-' + digits,
          iconSize: null
        });
      }




    return (
        <>        
        {/* The map rendered before useEffect called, so first we need to load currentCityInfo before to show the map */}
        { currentCityInfo["longitude"] !== "0" && currentCityInfo["latitude"]!=="0" ? ( 

            <MapContainer style={{cursor: "crosshair"}} whenCreated={setMap} center={[parseFloat(currentCityInfo["latitude"]), parseFloat(currentCityInfo["longitude"])]} zoom={13} zoomControl={false} scrollWheelZoom={true} style={{ height: 'calc(100vh - 60px)', width: '100%' }} >                
                <LayersControl position="topleft">                    
                    <MapTileLayers mapBaseLayerName={rxMapBaseLayerName} />                 
                </LayersControl>    

            
                {/* To change center of the map when current city will change */}
                {/*<SetViewMap center={[parseFloat(currentCityInfo["latitude"]), parseFloat(currentCityInfo["longitude"])]} />*/} 
                <SetPanToMap />


                {currentZoom < 15 ? (
                    <GeoJSON key={Date.now()} data={rxDataAccidents} pointToLayer={pointToLayer} filter={filterMapCallback} onEachFeature={onEachFeaturePoint}/>  
                ) : (
                    <MarkerClusterGroup
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={false}
                    zoomToBoundsOnClick={true}
                    maxClusterRadius={15}
                    iconCreateFunction={createClusterCustomIcon}>                
                        <GeoJSON key={Date.now()} data={rxDataAccidents} pointToLayer={pointToLayer} filter={filterMapCallback} onEachFeature={onEachFeaturePoint}/>                
                    </MarkerClusterGroup>
                )}


                <NewMarker newMarkerState={rxNewMarkerState} onDragEndNewMarker={onDragEndNewMarker}/>
                
                <MapEvents />
                
                {!rxIsMobileDevice && <ZoomControl position='bottomright'/>}
                
   
                {/* <ButtonsControl /> */}

                <HeatmapFunction />
                

                
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

//пример без React-Leaflet
//https://stackoverflow.com/questions/69697017/use-leaflet-map-object-outside-useeffect-in-react
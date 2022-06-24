import React from "react"
import { LayersControl, TileLayer } from "react-leaflet"
//@ts-ignore
import {BingLayer} from 'react-leaflet-bing-v2/src/index'


interface MapTileLayersProps {
	mapBaseLayerName: string;
}

function MapTileLayers({ mapBaseLayerName }: MapTileLayersProps) {
	return (
		<>
			<LayersControl.BaseLayer
				checked={mapBaseLayerName === "Default"}
				name="Default"
			>
				<TileLayer
					attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/">Mapbox</a>'
					url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
					accessToken="pk.eyJ1IjoiZHJpdmVzb2Z0IiwiYSI6ImNqY3hkMzAwNTAwM2IzM28zajFoeG1pamYifQ.w5UaGnR0OMDIa6ARiyWoYQ"
					id="mapbox/streets-v11"
					maxZoom={21}
					tileSize={512}
					zoomOffset={-1}
				/>
			</LayersControl.BaseLayer>

			<LayersControl.BaseLayer
				checked={mapBaseLayerName === "Dark"}
				name="Dark"
			>
				<TileLayer
					attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/">Mapbox</a>'
					url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
					accessToken="pk.eyJ1IjoiZHJpdmVzb2Z0IiwiYSI6ImNqY3hkMzAwNTAwM2IzM28zajFoeG1pamYifQ.w5UaGnR0OMDIa6ARiyWoYQ"
					id="mapbox/dark-v10"
					tileSize={512}
					zoomOffset={-1}
				/>
			</LayersControl.BaseLayer>


			<LayersControl.BaseLayer
				checked={mapBaseLayerName === "Google"}
				name="Google"
			>
				<TileLayer
					attribution='Google'
					url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    maxZoom={20}
                    subdomains={['mt0','mt1','mt2','mt3']}
				/>
			</LayersControl.BaseLayer>


			<LayersControl.BaseLayer
				checked={mapBaseLayerName === "Sat1"}
				name="Sat1"
			>
                <BingLayer  bingkey={'AniAD3xsGTaSbK1pa0_UkWS1CldG0nGI7r55MlVZqHhyKil9rD9dFK8536u8hTj1'} type="Aerial"/>
			</LayersControl.BaseLayer>


            
			<LayersControl.BaseLayer
				checked={mapBaseLayerName === "Sat2"}
				name="Sat2"
			>
				<TileLayer
					attribution='Google'
					url="http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                    maxZoom={20}
                    subdomains={['mt0','mt1','mt2','mt3']}
				/>
			</LayersControl.BaseLayer>




			<LayersControl.BaseLayer
				checked={mapBaseLayerName === "Sat3"}
				name="Sat3"
			>
				<TileLayer
					attribution='Tiles &copy; Esri'
					url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={19}                    
				/>
			</LayersControl.BaseLayer>



			<LayersControl.BaseLayer
				checked={mapBaseLayerName === "Sat4"}
				name="Sat4"
			>
				<TileLayer
					attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/">Mapbox</a>'
					url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
					accessToken="pk.eyJ1IjoiZHJpdmVzb2Z0IiwiYSI6ImNqY3hkMzAwNTAwM2IzM28zajFoeG1pamYifQ.w5UaGnR0OMDIa6ARiyWoYQ"
					id="mapbox/satellite-v9"
					tileSize={512}
					maxZoom={21}
                    zoomOffset={-1}
				/>
			</LayersControl.BaseLayer>


		</>
	);
}

export default MapTileLayers;

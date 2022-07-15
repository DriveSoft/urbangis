import "./App.css";
import L from 'leaflet'

import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import MenuGlobal from "./components_hl/MenuGlobal";
import Map from "./components_hl/Map";
import MainWrapper from "./components/MainWrapper";
import Sidebar from "./components/Sidebar";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import ButtonOkCancelMobileMarker from "./components/ButtonOkCancelMobileMarker";

import FormFilter from './components/FormFilter';
import FormTree from './components/FormTree';
import FormInspection from './components/FormInspection';
import ImageSlider from './components/ImageSlider';
import TreePreviewModal from "./components/TreePreviewModal";

import { useAuthToken, checkAuthToken, getNewAccessRefreshAuthToken } from "./useAuthToken";
import LoginModalForm from "./components/LoginModalForm";
import RegisterModalForm from "./components/RegisterModalForm";
import { useTranslation } from "react-i18next";

import { RootState, allReducers } from "./reducers/index";
import { useSelector, useDispatch } from "react-redux";
import {
	actMapMarkerState,
	actNewTreeCreation,
	actIsMobileDevice,
	actShowSidebar,
	actCheckButtonNewMarker,
	actShowOkCancelMobileMarker,
	actShowTreeTab,
	actActiveTabKey,
	actDictStatuses,
	actDictSpecieses,
	actDictCareTypes,
	actDictRemarks,
	actDictPlaceTypes,
	actDictIrrigationMethods,
	actDictGroupSpecs, 
	actDictTypeSpecs,
	actDataTrees,
	actDataFilters,
	actShowInspTab,
} from "./actions";
import { TreeItem, InspItem } from "./interfaces";

import { filterDataMap } from "./utils/filterDataMap"
import { getCookie } from "./utils/misc"
import { fetchAllDictionariesData } from "./utils/fetchAllDictionariesData"
import { 
	URL_REFRESH_TOKEN, 
	URL_VERIFY_TOKEN, 
	URL_GET_DICT_STATUSES, 
	URL_GENERATE_S3_URLKEY, 
	urlTreesByCity, 
	urlTreeByCityAndID 
} from './constants/urlsAPI';


let geojsonMarkerOptions_citytree = {
    //renderer: myRenderer,
    radius: 5,
    fillColor: "#008000",
    color: "#008000",
    weight: 0,
    opacity: 1,
    fillOpacity: 0.5
	};




function App() {
	const paramsRouter = useParams();
	const csrftoken = getCookie("csrftoken");

	// redux
	const dispatch = useDispatch();
	const rxDataTrees = useSelector((state: RootState) => state.dataReducer.dataTrees);
	const rxShowSidebar = useSelector((state: RootState) => state.uiReducer.showSidebar);
	const rxShowOkCancelMobileMarker = useSelector((state: RootState) => state.uiReducer.showOkCancelMobileMarker);
	const rxDataFilters = useSelector((state: RootState) => state.dataReducer.dataFilters);
	const rxActiveTabKey = useSelector((state: RootState) => state.uiReducer.activeTabKey);
	const rxShowTreeTab = useSelector((state: RootState) => state.uiReducer.showTreeTab);
	const rxShowInspTab = useSelector((state: RootState) => state.uiReducer.showInspTab);
	const rxDictStatuses = useSelector((state: RootState) => state.dataReducer.dictStatuses);
	const rxCheckButtonHeatmap = useSelector((state: RootState) => state.uiReducer.checkButtonHeatmap);

	const rxCheckButtonNewMarker = useSelector((state: RootState) => state.uiReducer.checkButtonNewMarker);
	const rxIsMobileDevice = useSelector((state: RootState) => state.uiReducer.isMobileDevice);

	const [currentZoomMap, setCurrentZoomMap] = useState(13);

	const { authToken, setAuthToken } = useAuthToken();
	const [screenWidth, setScreenWidth] = useState(window.innerWidth);
	//const [isMobileDevice, setIsMobileDevice] = useState(false)
	const isMobileView = screenWidth <= 768; // show or hide sidebar at startup


	const [dataTreeForm, setDataTreeForm] = useState<TreeItem | null>(null);
	const [dataInspForm, setDataInspForm] = useState<InspItem | {tree: number} | null>(null);
	const [imageSlider, setImageSlider] = useState<{visible: boolean; images: string[]}> ({visible: false, images: []});
	const [treePreview, setTreePreview] = useState<{visible: boolean; data: {}}>({visible: false, data:{}});
	const { t } = useTranslation();

	let dataHeatmapPoints: number[][] = []; // [[lat, lng, value],[lat, lng, value]...]	



	useEffect(() => {
		fetchAllDictionariesDataWrapper();
		userAuthentication();
		dispatch(actIsMobileDevice(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)));
		dispatch(actShowSidebar(!isMobileView));	
		
		window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);			
        }		
	}, []); /* useEffect triggers when route has been changed too */

	const fetchAllDictionariesDataWrapper = () => {
		fetchAllDictionariesData().then(([specieses, caretypes, remarks, placetypes, irrigationmethods, groupspecs, typespecs]) => {
			dispatch(actDictSpecieses(specieses));
			dispatch(actDictCareTypes(caretypes));
			dispatch(actDictRemarks(remarks));
			dispatch(actDictPlaceTypes(placetypes));
			dispatch(actDictIrrigationMethods(irrigationmethods));
			dispatch(actDictGroupSpecs(groupspecs));
			dispatch(actDictTypeSpecs(typespecs));
		}).catch(error => {			
			console.log('fetchAllDictionariesData error: ', error);
		});	
	}

    function handleWindowSizeChange() {
        setScreenWidth(window.innerWidth);
    }




	useEffect(() => {
		fetchTreesAndStatuses();
	}, [paramsRouter]); /* useEffect triggers when route has been changed too */

	const fetchTreesAndStatuses = async () => {
		//first of all, we must fetch dictionary with statuse, otherwise we can't draw points of trees in diferent color depends of them statuses.
		let res = await fetch(URL_GET_DICT_STATUSES);
		let data = await res.json();
		dispatch(actDictStatuses(data));
						
		if (paramsRouter.cityName) {
			const URL = urlTreesByCity(paramsRouter.cityName);//`${process.env.REACT_APP_API_URL}citytree/${paramsRouter.cityName}/trees/`;
			res = await fetch(URL);
			data = await res.json();
			data.dateTimeGenerated = Date.now();
			
			dispatch(actDataTrees(data));
		}
	};


    useEffect(() => {
        let periodUpdate = 240000 //4 min
        let interval = setInterval(() => {
            if (authToken) {    
				refreshTokens();
            }
        }, periodUpdate)

        return () => clearInterval(interval)
    }, [authToken]);

	async function userAuthentication() {
		if (authToken) {
			const isTokenValid = await checkAuthToken(URL_VERIFY_TOKEN, authToken.access);
			console.log('isTokenValid', isTokenValid);
			if (!isTokenValid) {
				refreshTokens();
			}

		}
	}	

	async function refreshTokens() {
		const accessRefreshToken = await getNewAccessRefreshAuthToken(URL_REFRESH_TOKEN, authToken.refresh);
		setAuthToken(accessRefreshToken);		
	}




	function markerOnClick(e: any) {
		// const fetchTreeData = async (idTree: number) => {
		// 	if (paramsRouter.cityName) {					
		// 		const url = urlTreeByCityAndID(paramsRouter.cityName, idTree);
		// 		let res = await fetch(url);
		// 		let data = await res.json();
	
		// 		console.log('markerOnClick',data);
		// 		//setTreePreview({visible: true, data: data});

		// 		setDataTreeForm(data);
		// 		dispatch(actShowTreeTab(true));
		// 		dispatch(actActiveTabKey('tree'));									
		// 		dispatch(actShowSidebar(true));			
		// 	}
		// }


		let marker: L.Marker = e.target;
		let geojson = marker.toGeoJSON(); //: GeoJSON.FeatureCollection<any>

		if (geojson?.properties?.id) {
			//fetchTreeData(geojson?.properties?.id);			
			showTreePreview(geojson?.properties?.id);
		}   
	}	

	// async function fetchTreeData (idTree: number) {
	// 	if (paramsRouter.cityName) {					
	// 		const url = urlTreeByCityAndID(paramsRouter.cityName, idTree);
	// 		let res = await fetch(url);
	// 		let data = await res.json();

	// 		console.log('markerOnClick',data);
	// 		setTreePreview({visible: true, data: data});

	// 		//setDataTreeForm(data);
	// 		//dispatch(actShowTreeTab(true));
	// 		//dispatch(actActiveTabKey('tree'));									
	// 		//dispatch(actShowSidebar(true));			
	// 	}
	// }
	
	const onButtonEditClick = (idTree: number) => {
		editTree(idTree);
	}

	const editTree = (idTree: number) => {
		fetchTreeData(idTree).then((data) => setDataTreeForm(data));		
		dispatch(actShowTreeTab(true));
		dispatch(actActiveTabKey('tree'));									
		dispatch(actShowSidebar(true));	
	}

	const showTreePreview = (idTree: number) => {
		fetchTreeData(idTree).then((data) =>
			setTreePreview({ visible: true, data: data })
		);
	};
	
	const onSubmitTree = (data: any) => {
		if (paramsRouter.cityName) {
			let method;
			let url;
			if (data.id) {
				//url = `${process.env.REACT_APP_API_URL}citytree/${paramsRouter.cityName}/trees/${data.id}/`;
				url = urlTreeByCityAndID(paramsRouter.cityName, data.id);
				method = "PUT";
			} else {
				//url = `${process.env.REACT_APP_API_URL}citytree/${paramsRouter.cityName}/trees/`;
				url = urlTreesByCity(paramsRouter.cityName);
				method = "POST";
			}

			const succeedCallBack = () => {
				fetchTreesAndStatuses();
				dispatch(actMapMarkerState({ visible: false, position: {} }));
				dispatch(actNewTreeCreation(false));
				dispatch(actActiveTabKey('filter'));
				dispatch(actShowTreeTab(false));

				if (isMobileView) {
					dispatch(actShowSidebar(false))
				}			
			}		
			fetchUrl(url, method, data, succeedCallBack);
		}
		
	};



	const onDeleteTree = (id: number) => {
		const succeedCallBack = () => {					
			dispatch(actActiveTabKey('filter'));
			dispatch(actShowTreeTab(false));						
			fetchTreesAndStatuses();				
		}

		//fetchUrl(`${process.env.REACT_APP_API_URL}citytree/${paramsRouter.cityName}/trees/${id}`, "DELETE", {}, succeedCallBack);
		if (paramsRouter.cityName) {
			fetchUrl(urlTreeByCityAndID(paramsRouter.cityName, id), "DELETE", {}, succeedCallBack);
		}
	};


	const onCloseTree = () => {	
		dispatch(actMapMarkerState({ visible: false, position: {} }));
		dispatch(actNewTreeCreation(false));
		dispatch(actActiveTabKey('filter'));
		dispatch(actShowTreeTab(false));
	};





	const fetchTreeData = async (idTree: number) => {			
		let url = `${process.env.REACT_APP_API_URL}citytree/${paramsRouter.cityName}/trees/${idTree}/`;
		let res = await fetch(url);
		let data = await res.json();
		return data;
		//setDataTreeForm(data);		
	}

	const onSubmitInsp = (data: any) => {
		let method;
		let url;
		if (data.id) {
			url = `${process.env.REACT_APP_API_URL}citytree/${paramsRouter.cityName}/trees/${data.treeId}/inspections/${data.id}/`;
			method = "PUT";
		} else {
			url = `${process.env.REACT_APP_API_URL}citytree/${paramsRouter.cityName}/trees/${data.treeId}/inspections/`;
			method = "POST";
		}

		const succeedCallBack = () => {
			fetchTreeData(data.treeId).then(data => setDataTreeForm(data));		
			fetchTreesAndStatuses();
			dispatch(actActiveTabKey('tree'));
			dispatch(actShowInspTab(false));			
		}

		console.log('insp', data, url);
		fetchUrl(url, method, data, succeedCallBack);
			
	};

	const onDeleteInsp = (data: InspItem | null) => {
		const succeedCallBack = () => {
			if (data) {
				fetchTreeData(data.tree).then(data => setDataTreeForm(data));	;
				dispatch(actActiveTabKey('tree'));
				dispatch(actShowInspTab(false));						
				fetchTreesAndStatuses();
			}		
		}

		if (data?.id) {
			console.log('DELETE', data)
			//path('citytree/<str:city>/trees/<str:treeid>/inspections/<str:inspid>/', views.citytreeInspectionItem, name="citytree-restapi-inspection-item"),
			fetchUrl(`${process.env.REACT_APP_API_URL}citytree/${paramsRouter.cityName}/trees/0/inspections/${data.id}`, "DELETE", {}, succeedCallBack);
		}	
	};	

	const onCloseInsp = () => {		
		dispatch(actShowInspTab(false));
		dispatch(actActiveTabKey('tree'));		
	};	

	const onNewInsp = (idTree: number) => {
		setDataInspForm({tree: idTree});
		dispatch(actShowInspTab(true));
		dispatch(actActiveTabKey('insp'));									
		dispatch(actShowSidebar(true));				

	}

	const onEditInsp = (data: any) => {
		console.log('onEditInsp', data);		
		setDataInspForm({...data}); //таким образом передается копия объекта, которая указывает на другой участок памяти, иначе useEffect не срабатывает у формы, а значит форма не перезаполняется, когда например чтото поменяли на форме, затем ее закрыли без сохранения и снова открыли, видим вместо актуальных данных, старые, которые не сохранялись
		dispatch(actShowInspTab(true));
		dispatch(actActiveTabKey('insp'));									
		dispatch(actShowSidebar(true));			
	}	

	const onClickInspPhotos = (data: any) => {
		console.log('onClickPhotos', data);		
		
		const images: string[] = [];
		if (data?.photo1) {
			images.push(`${data.photoServer}${data?.photo1}`);
		}
		if (data?.photo2) {
			images.push(`${data.photoServer}${data?.photo2}`);
		}
		if (data?.photo3) {
			images.push(`${data.photoServer}${data?.photo3}`);
		}				

		if (images.length > 0) {
			setImageSlider({visible: true, images: images});
		}					
	}		

	const onClickEditCoords = (coord: {lat: string; lng: string}) => {		
		dispatch(actMapMarkerState({ visible: true, position: coord }));
	}
		


	const onClickMap = (e: any) => {
		if (rxCheckButtonNewMarker && !rxIsMobileDevice) {
			dispatch(actCheckButtonNewMarker(false));

			let coord = { lat: '0', lng: '0' };
			coord.lat = e.latlng.lat.toFixed(5);
			coord.lng = e.latlng.lng.toFixed(5);
			
			dispatch(actMapMarkerState({ visible: true, position: coord }));
			dispatch(actNewTreeCreation(true));

			dispatch(actShowTreeTab(true));
			dispatch(actActiveTabKey('tree'));									
			dispatch(actShowSidebar(true));	
		}		
	}

	const onZoomEnd = (e: any) => {
		console.log('zoom', e.target._zoom);
		setCurrentZoomMap(e.target._zoom);
	}
	
	const onEachLayer = (layer: L.Layer, zoom: number) => {
		//@ts-ignore
		const crowndiameter = layer?.feature?.properties?.lastinsp_crowndiameter;
		if (crowndiameter) {
			//@ts-ignore
		    layer.setRadius(ZoomToRadius(zoom, crowndiameter));                    
			
		} 		
	}	
	

	const onDragEndNewMarker = (LatLng: { lat: number; lng: number }) => {
		//console.log('onDragEndNewMarker',LatLng);
		//let coord = { lat: '0', lng: '0' };
		//coord.lat = LatLng.lat.toFixed(5);
		//coord.lng = LatLng.lng.toFixed(5);
		//setNewMarkerState({ visible: true, position: coord });
		dispatch(actMapMarkerState({ visible: true, position: LatLng }));

	};

	const filterMapCallback = (feature: any): boolean => {
		return filterDataMap(feature, rxDataFilters, authToken);
	};


	const onSubmitFilter = (filter: {}) => {
		console.log(filter);
		dataHeatmapPoints = [];
		
		rxDataTrees.dateTimeGenerated = Date.now(); // dateTimeGenerated is used like key parameter to update data on map, when it changed. <GeoJSON key={mainData.dateTimeGenerated}...
		dispatch(actDataFilters(filter));	

		if (isMobileView) {
			dispatch(actShowSidebar(false))
		}
	};



	function pointToLayerTrees(feature: any, latlng: L.LatLng): any {   
		if (!rxCheckButtonHeatmap) {
			// change color of point depends on them status
			if (feature.properties.lastinsp_status) {
				if (Array.isArray(rxDictStatuses)) {
					rxDictStatuses.forEach(element => {
					if (element.id === feature.properties.lastinsp_status) {
						geojsonMarkerOptions_citytree.fillColor = `#${element.hexcolor}`;
						geojsonMarkerOptions_citytree.color = `#${element.hexcolor}`;
						geojsonMarkerOptions_citytree.radius = ZoomToRadius(currentZoomMap, feature.properties.lastinsp_crowndiameter);
					}	
				});
				}
			}
			 
			return L.circle(latlng, geojsonMarkerOptions_citytree).on('click', markerOnClick);
		}
			return null;
	};

	function ZoomToRadius (zoom: number, crowndiameter: number) {
		// + 21...13 -
		let r = Math.floor(crowndiameter / 2);
		if (zoom < 19) r = r + (18-zoom)*5;
		if (r < 2) r=2;
		return r; 		
	}	



	return (		
		<MainWrapper cityName={paramsRouter.cityName}>
			<>									
				<Sidebar>
					<Tabs
						id="controlled-tab-example"
						activeKey={rxActiveTabKey}
						onSelect={(k) => dispatch(actActiveTabKey(k))}								
						className="mb-3"
					>
						<Tab
							eventKey="filter"
							title={t<string>("sidebar.filterTab.title")}
						>
							<div className="form-wrapper">
								<FormFilter onSubmitFilter={onSubmitFilter}  
							/>
							</div>
						</Tab>

						<Tab
							eventKey="tree"
							title={t<string>(
								"sidebar.treeTab.title"
							)}
							tabClassName={
								!rxShowTreeTab ? "d-none" : ""
							}
						>
							<div className="form-wrapper">
								<FormTree 
									onSubmitTree={onSubmitTree}
									onDeleteTree={onDeleteTree}
									onCloseTree={onCloseTree} 
									onNewInsp={onNewInsp}
									onEditInsp={onEditInsp}
									onClickInspPhotos={onClickInspPhotos}
									onClickEditCoords={onClickEditCoords}
									dataTreeForm={dataTreeForm}											
									//@ts-ignore
									city={paramsRouter.cityName}
									signingS3Url={URL_GENERATE_S3_URLKEY}
									//currentCity={paramsRouter.cityName}
								/>										
							</div>
						</Tab>

						<Tab
							eventKey="insp"
							title={t<string>(
								"sidebar.inspTab.title"
							)}
							tabClassName={
								!rxShowInspTab ? "d-none" : ""
							}
						>
							<div className="form-wrapper">
								<FormInspection 
									onSubmitInsp={onSubmitInsp}
									onDeleteInsp={onDeleteInsp}
									onCloseInsp={onCloseInsp} 
									dataInspForm={dataInspForm}
									//@ts-ignore
									city={paramsRouter.cityName}
									signingS3Url={URL_GENERATE_S3_URLKEY}
									//currentCity={paramsRouter.cityName}
								/>										
							</div>
						</Tab>								
					</Tabs>
				</Sidebar>

				<div id="page-content-wrapper">
					<MenuGlobal
						//@ts-ignore
						currentCity={paramsRouter.cityName}
						//onClickShowMenu={ () => dispatch(actShowSidebar(!rxShowSidebar)) }
						authToken={authToken}
						setAuthToken={setAuthToken}
						appname="citytree"
					/>

					<div
						className="container-fluid"
						style={{
							paddingRight: "0px",
							paddingLeft: "0px",
						}}
					>
						<Map
							mainData={rxDataTrees}
							appname="citytree"
							dataHeatmapPoints={dataHeatmapPoints}
							//@ts-ignore
							currentCity={paramsRouter.cityName}
							onClickMap={onClickMap}
							onZoomEnd={onZoomEnd}
							onEachLayer={onEachLayer}
							//={onMarkerClick}
							onDragEndNewMarker={onDragEndNewMarker}
							pointToLayerCallback={pointToLayerTrees}
							filterMapCallback={filterMapCallback}
						/>

					</div>
				</div>


				{rxShowOkCancelMobileMarker && (
					<ButtonOkCancelMobileMarker/>
				)}

				<ImageSlider 
					visible={imageSlider.visible} 
					setVisible={setImageSlider} 
					images={imageSlider.images}
				/>

				<TreePreviewModal 
					visible={treePreview.visible} 
					data={treePreview.data}
					setTreePreview={setTreePreview}
					onButtonEditClick={onButtonEditClick} 					
				/>				

				<LoginModalForm setAuthToken={setAuthToken}/>
				<RegisterModalForm setAuthToken={setAuthToken}/> 			
			</>
		</MainWrapper>

	);









	function fetchUrl(url: string, method: string, bodyObject?: any, callBackSucceed?: () => void) {
		let myHeaders = new Headers();
		myHeaders.append("Content-type", "application/json");
		
		if (csrftoken) {
			myHeaders.append("X-CSRFToken", csrftoken);
		}	
		if (authToken?.access) {
			myHeaders.append("Authorization", "Bearer " + authToken.access);
		}


		console.log('myHeaders',myHeaders.get('Authorization'));

		fetch(url, {
			method: method,
			headers: myHeaders,
			body: JSON.stringify(bodyObject),
		}).then(function (response) {
			if (response.status >= 400) {
				response.json().then((data) => {
					alert(
						response.statusText +
							" (" +
							response.status +
							")\n\n" +
							data.detail
					);
				});
			} else {
				
				if (callBackSucceed) {
					callBackSucceed();
				}
			}
		});
	};
}


export default App;

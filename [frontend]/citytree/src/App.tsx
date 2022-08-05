import "./App.css";
import L from 'leaflet'

import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

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

import { useAuthToken } from "./auth/useAuthToken";
import LoginModalForm from "./components/LoginModalForm";
import RegisterModalForm from "./components/RegisterModalForm";
import { useTranslation } from "react-i18next";

import { RootState } from "./reducers/index";
import { useSelector, useDispatch } from "react-redux";
import {
	actMapMarkerState,
	actNewTreeCreation,
	actShowOkCancelMobileMarker,
	actIsMobileDevice,
	actShowSidebar,
	actCheckButtonNewMarker,
	actShowTreeTab,
	actActiveTabKey,
	actDataLastEditedTreeId,
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
	actDataPermissions
} from "./actions";
import { TreeItem, InspItem } from "./interfaces";

import { filterDataMap } from "./utils/filterDataMap"
import { fetchUrl2 } from "./utils/misc"
import { fetchAllDictionariesData } from "./utils/fetchAllDictionariesData"
import { 
	URL_GET_DICT_STATUSES, 
	URL_GENERATE_S3_URLKEY, 
	urlTreesByCity, 
	urlTreeByCityAndID 
} from './constants/urlsAPI';

import { getCurrentUserPermissions, has_perm } from './auth/permissions'
import { userAuthentication, refreshTokens } from './auth/useAuthToken';

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
	//const csrftoken = getCookie("csrftoken");

	// redux
	const dispatch = useDispatch();
	const rxDataPermissions = useSelector((state: RootState) => state.dataReducer.dataPermissions);
	const rxDataTrees = useSelector((state: RootState) => state.dataReducer.dataTrees);
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

	//const {authToken, setAuthToken} = useAuthToken();
	const [authToken, setAuthToken] = useAuthToken();
	const [screenWidth, setScreenWidth] = useState(window.innerWidth);
	//const [isMobileDevice, setIsMobileDevice] = useState(false)
	const isMobileView = screenWidth <= 768; // show or hide sidebar at startup


	const [dataTreeForm, setDataTreeForm] = useState<TreeItem | null>(null);
	const [dataInspForm, setDataInspForm] = useState<InspItem | {tree: number} | null>(null);
	const [imageSlider, setImageSlider] = useState<{visible: boolean; images: string[]}> ({visible: false, images: []});
	const [treePreview, setTreePreview] = useState<{visible: boolean; data: {}; idTree: number | null}>({visible: false, data:{}, idTree: null});
	const { t, i18n } = useTranslation();

	let dataHeatmapPoints: number[][] = []; // [[lat, lng, value],[lat, lng, value]...]	


	useEffect(() => {
		fetchAllDictionariesDataWrapper();		
		userAuthentication(authToken, setAuthToken);
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
        let periodUpdate = 240000;//240000 //4 min
        let interval = setInterval(() => {
            if (authToken) {    
				refreshTokens(setAuthToken, authToken.refresh).then((res)=> console.log('refreshTokens', res));
            }
        }, periodUpdate);

	
		// update permissions if permissions object still empty, it can happens when website is loading with expired access token
		if (Object.keys(rxDataPermissions).length === 0 && authToken?.user?.id) {
			getCurrentUserPermissions(authToken).then((permResult) => {
				if (permResult) {
					console.log('permResult useEffect authToken', permResult);
					dispatch(actDataPermissions(permResult));
				}	
			});			
		}		

        return () => clearInterval(interval)
    }, [authToken]);
	

    useEffect(() => {
		if (authToken?.user?.id) {
			getCurrentUserPermissions(authToken).then((permResult) => {				
				if (permResult) dispatch(actDataPermissions(permResult));
			});			
		}	
    }, [authToken?.user?.id]);



	useEffect(()=>{

		if (authToken?.user?.id) {
			getCurrentUserPermissions(authToken).then((permResult) => {				
				if (permResult) dispatch(actDataPermissions(permResult));
			});			
		}
		
		// const permsToTranslate = {...rxDataPermissions};
		
		// Object.entries(permsToTranslate).forEach(([keyModel, valueModel]) => {
		// 	if (typeof valueModel === 'object') {
		// 		//@ts-ignore
		// 		Object.entries(valueModel).forEach(([keyPerm, valuePerm]) => {
		// 			console.log(t(`permsMessages.${keyModel}.${keyPerm}`));
		// 		});
		// 	}			
		// });				
		// //dispatch(actDataPermissions(permsToTranslate));

	}, [i18n.language])


	function markerOnClick(e: any) {
		let marker: L.Marker = e.target;
		let geojson = marker.toGeoJSON(); //: GeoJSON.FeatureCollection<any>

		if (geojson?.properties?.id) {					
			showTreePreview(geojson?.properties?.id);
		}   
	}

	const showTreePreview = (idTree: number) => {
		//if (!has_perm(rxDataPermissions, 'tree', 'view_tree', authToken)) return; 

		setTreePreview({ visible: true, data: {}, idTree: idTree })
		//fetchTreeData(idTree).then((data) =>
		//	setTreePreview({ visible: true, data: data, idTree: null })
		//);		
	};

	// when event comes from markerOnClick, it comes from L.Circle which is not React component, therefore there is something wrong, because in this event you can't see current values in States and Redux (to check permissions using rxDataPermissions), so I used redux event to broke that chain
	useEffect(()=>{		
		if (treePreview?.visible === true && treePreview?.idTree) {
			// if (!has_perm(rxDataPermissions, 'tree', 'view_tree', authToken)) {
			// 	setTreePreview({ visible: false, data: {}, idTree: null })
			// 	return; 
			// }	

			fetchTreeData(treePreview.idTree).then((data) =>
				setTreePreview({ visible: true, data: data, idTree: null })
			);			
		}
	}, [treePreview]);

	

	const onButtonEditTreeClick = (idTree: number) => {
		editTree(idTree);
	}

	const editTree = (idTree: number) => {
		fetchTreeData(idTree).then((data) => setDataTreeForm(data));		
		dispatch(actShowTreeTab(true));
		dispatch(actActiveTabKey('tree'));									
		dispatch(actShowSidebar(true));	
	}
	
	const onSubmitTree = async (data: any) => {		
		if (!has_perm(rxDataPermissions, 'tree', 'change_tree', authToken)) return;
			
		
				
		if (paramsRouter.cityName) {
			let method;
			let url;
			if (data.id) {
				console.log(data, authToken.user.id);
				if (data.useradded !== authToken.user.id && !has_perm(rxDataPermissions, 'tree', 'can_change_not_own_tree_record', authToken) ) return; 
				//url = `${process.env.REACT_APP_API_URL}citytree/${paramsRouter.cityName}/trees/${data.id}/`;
				url = urlTreeByCityAndID(paramsRouter.cityName, data.id);
				method = "PUT";
			} else {
				//url = `${process.env.REACT_APP_API_URL}citytree/${paramsRouter.cityName}/trees/`;
				url = urlTreesByCity(paramsRouter.cityName);
				method = "POST";
			}

			// const succeedCallBack = () => {
			// 	fetchTreesAndStatuses();
			// 	dispatch(actMapMarkerState({ visible: false, position: {} }));
			// 	dispatch(actNewTreeCreation(false));
			// 	dispatch(actActiveTabKey('filter'));
			// 	dispatch(actShowTreeTab(false));

			// 	if (isMobileView) {
			// 		dispatch(actShowSidebar(false))
			// 	}			
			// }		
			
			try {
				await fetchUrl2(url, method, data, authToken.access);
				fetchTreesAndStatuses();
				dispatch(actMapMarkerState({ visible: false, position: {} }));
				dispatch(actNewTreeCreation(false));
				dispatch(actActiveTabKey('filter'));
				dispatch(actShowTreeTab(false));

				if (isMobileView) { 
					dispatch(actShowSidebar(false))
				}				
			} catch(err) {
				console.log('onSubmitTree', err);
				//@ts-ignore
				alert(err.detail);				
			}
			
		}
		
	};



	//const onDeleteTree = async (id: number) => {
	const onDeleteTree = async (data: TreeItem | null) => {
		if (!has_perm(rxDataPermissions, 'tree', 'delete_tree', authToken)) return;		
		if (!has_perm(rxDataPermissions, 'tree', 'can_delete_not_own_tree_record', authToken) && data?.useradded !== authToken.user.id) return;
		
		if (data?.id && paramsRouter.cityName) {
			await fetchUrl2(urlTreeByCityAndID(paramsRouter.cityName, data.id), "DELETE", {}, authToken.access);
			dispatch(actActiveTabKey('filter'));
			dispatch(actShowTreeTab(false));						
			fetchTreesAndStatuses();			
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
		console.log(data)
		return data;
		//setDataTreeForm(data);		
	}

	const onSubmitInsp = async (data: any) => {

		let method;
		let url;
		if (data.id) {

			if (!has_perm(rxDataPermissions, 'inspection', 'change_inspection', authToken)) return;
			if (data?.user !== authToken.user.id && !has_perm(rxDataPermissions, 'inspection', 'can_change_not_own_insp_record', authToken)) return;			

			url = `${process.env.REACT_APP_API_URL}citytree/${paramsRouter.cityName}/trees/${data.treeId}/inspections/${data.id}/`;
			method = "PUT";
		} else {						
			url = `${process.env.REACT_APP_API_URL}citytree/${paramsRouter.cityName}/trees/${data.treeId}/inspections/`;
			method = "POST";
		}


		console.log('insp', data, url);
		await fetchUrl2(url, method, data, authToken.access);
		fetchTreeData(data.treeId).then(data => setDataTreeForm(data));		
		fetchTreesAndStatuses();
		if (rxShowTreeTab === true) {
			dispatch(actActiveTabKey('tree'));				
		} else {
			dispatch(actActiveTabKey('filter'));	
		}
		dispatch(actShowInspTab(false));
		
		updateInspectionListsWithSpecificTreeId(data.treeId);		
			
	};

	const onDeleteInsp = async (data: InspItem | null) => {
		if (!has_perm(rxDataPermissions, 'inspection', 'delete_inspection', authToken)) return;		
		if (data?.user !== authToken.user.id && !has_perm(rxDataPermissions, 'inspection', 'can_delete_not_own_insp_record', authToken)) return;		

		if (data?.id) {
			console.log('DELETE', data)
			//path('citytree/<str:city>/trees/<str:treeid>/inspections/<str:inspid>/', views.citytreeInspectionItem, name="citytree-restapi-inspection-item"),
			await fetchUrl2(
				`${process.env.REACT_APP_API_URL}citytree/${paramsRouter.cityName}/trees/0/inspections/${data.id}`, 
				"DELETE", 
				{}, 
				authToken.access);

				if (data) {
					fetchTreeData(data.tree).then(data => setDataTreeForm(data));	;				
					if (rxShowTreeTab === true) {
						dispatch(actActiveTabKey('tree'));				
					} else {
						dispatch(actActiveTabKey('filter'));	
					}				
					dispatch(actShowInspTab(false));						
					fetchTreesAndStatuses();
					updateInspectionListsWithSpecificTreeId(data.tree);
				}				

		}	
	};	

	function updateInspectionListsWithSpecificTreeId (id: number) {
		dispatch(actDataLastEditedTreeId({treeId: id})); 
	}	

	const onCloseInsp = () => {		
		dispatch(actShowInspTab(false));
		if (rxShowTreeTab === true) {
			dispatch(actActiveTabKey('tree'));				
		} else {
			dispatch(actActiveTabKey('filter'));	
		}					
	};	

	const onNewInsp = (idTree: number) => {
		if (!has_perm(rxDataPermissions, 'inspection', 'add_inspection', authToken)) return; 

		setDataInspForm({tree: idTree});
		dispatch(actShowInspTab(true));
		dispatch(actActiveTabKey('insp'));									
		dispatch(actShowSidebar(true));				

	}

	const onClickInspEdit = (data: any) => {
		if (!has_perm(rxDataPermissions, 'inspection', 'view_inspection', authToken)) return; 

		//setDataInspForm({...data}); //таким образом передается копия объекта, которая указывает на другой участок памяти, иначе useEffect не срабатывает у формы, а значит форма не перезаполняется, когда например чтото поменяли на форме, затем ее закрыли без сохранения и снова открыли, видим вместо актуальных данных, старые, которые не сохранялись
		setDataInspForm(data);
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
		
		if (rxIsMobileDevice) {	
			dispatch(actShowSidebar(false));					            
            dispatch(actShowOkCancelMobileMarker(true));
		}
		
		dispatch(actMapMarkerState({ visible: true, position: coord }));						
	}
		


	const onClickMap = (e: any) => {
		if (rxCheckButtonNewMarker && !rxIsMobileDevice) {
			dispatch(actNewTreeCreation(true));
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

	const onClickCreateNewMarker = (state: boolean): boolean | void => {						
		//console.log('test', test);
		//console.log('rxDataPermissions', rxDataPermissions);
		//if (!has_perm(rxDataPermissions, 'tree', 'add_tree', authToken)) return false;							
	}
	useEffect(()=>{
		if (rxCheckButtonNewMarker) {
			if (!has_perm(rxDataPermissions, 'tree', 'add_tree', authToken)) {
				dispatch(actCheckButtonNewMarker(false));

				if (rxIsMobileDevice) {						
					dispatch(actMapMarkerState({ visible: false, position: {lat: 0, lng: 0} }));
					dispatch(actShowOkCancelMobileMarker(false));
				}				
			}						
		}	
	}, [rxCheckButtonNewMarker]);

	const onZoomEnd = (e: any) => {
		//console.log('zoom', e.target._zoom);
		setCurrentZoomMap(e.target._zoom);
	}
		

	const onDragEndNewMarker = (LatLng: { lat: number; lng: number }) => {
		dispatch(actMapMarkerState({ visible: true, position: LatLng }));
	};




	const onSubmitFilter = (filter: {}) => {		
		dataHeatmapPoints = [];
				
		rxDataTrees.dateTimeGenerated = Date.now(); // dateTimeGenerated is used like key parameter to update data on map, when it changed. <GeoJSON key={mainData.dateTimeGenerated}...
		dispatch(actDataFilters(filter));	

		if (isMobileView) {
			dispatch(actShowSidebar(false))
		}
		
	};



	const filterMapCallback = (feature: any): boolean => {
		
		// const date = new Date;
		// const ms = date.getMilliseconds();
		// if (ms % 5 === 0) console.log('onEachLayer', `${date.getSeconds()}.${ms}`);	
		
		const result = filterDataMap(feature, rxDataFilters, authToken);

		if (result && rxCheckButtonHeatmap) {
			let crowndiameter = feature?.properties?.lastinsp_crowndiameter;
			if (!crowndiameter) crowndiameter = 1;			
			const dot = [feature.properties.latitude, feature.properties.longitude, crowndiameter / 20];					
			dataHeatmapPoints.push(dot);
			//console.log(dataHeatmapPoints.length)
		}

		return result;
	};	
	
	
	useEffect(()=>{
		rxDataTrees.dateTimeGenerated = Date.now();	// you must change that key to force GEOJSON function to redraw point		
	}, [rxCheckButtonHeatmap]);

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
			
			//return L.circleMarker(latlng, geojsonMarkerOptions_citytree).on('click', markerOnClick);
			return L.circle(latlng, geojsonMarkerOptions_citytree).on('click', markerOnClick);			
		}			
		return null;
	}

	function ZoomToRadius (zoom: number, crowndiameter: number) {
		// + 21...13 -
		let r = Math.floor(crowndiameter / 2);
		if (zoom < 19) r = r + (18-zoom)*5;
		if (r < 2) r=2;
		return r; 		
	}	
	
	

	const onEachLayer = (layer: L.Layer, zoom: number) => {
		if (rxCheckButtonHeatmap) return;

		//@ts-ignore
		const crowndiameter = layer?.feature?.properties?.lastinsp_crowndiameter;
		if (crowndiameter) {
			//@ts-ignore
		    layer.setRadius(ZoomToRadius(zoom, crowndiameter));                    			
		} 		
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
									onClickInspEdit={onClickInspEdit}
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
							onClickCreateNewMarker={onClickCreateNewMarker}
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
					onButtonEditTreeClick={onButtonEditTreeClick}
					onClickInspEdit={onClickInspEdit} 
					onClickButtonEditInsp={onClickInspEdit}
					onClickButtonPhotosInsp={onClickInspPhotos}										
				/>				

				<LoginModalForm setAuthToken={setAuthToken}/>
				<RegisterModalForm setAuthToken={setAuthToken}/> 			
			</>
		</MainWrapper>

	);
}

export default App;

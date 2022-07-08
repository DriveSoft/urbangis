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
import Button from "react-bootstrap/Button";
import ButtonOkCancelMobileMarker from "./components/ButtonOkCancelMobileMarker";

import FormFilter from './components/FormFilter';
import FormTree from './components/FormTree';
import FormInspection from './components/FormInspection';
import ImageSlider from './components/ImageSlider';

import useAuthToken from "./useAuthToken";
import LoginModalForm from "./components/LoginModalForm";
import RegisterModalForm from "./components/RegisterModalForm";
import { useTranslation } from "react-i18next";

import { RootState, allReducers } from "./reducers/index";
import { useSelector, useDispatch } from "react-redux";
import {
	actNewMarkerState,
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

const signingS3Url = `${process.env.REACT_APP_API_URL}citytree/s3/generate_signed_url/`;

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
	const [imageSlider, setImageSlider] = useState<{visible: boolean; images: string[]}>({visible: false, images: []});
	const { t } = useTranslation();

	let dataHeatmapPoints: number[][] = []; // [[lat, lng, value],[lat, lng, value]...]	

	useEffect(() => {
		
		const fetchSpecieses = async () => {			
			const url = `${process.env.REACT_APP_API_URL}citytree/dictionary/specieses/`;
			const res = await fetch(url);
			const data = await res.json();
			dispatch(actDictSpecieses(data));
		}		

		const fetchCareTypes = async () => {			
			const url = `${process.env.REACT_APP_API_URL}citytree/dictionary/caretypes/`;
			const res = await fetch(url);
			const data = await res.json();
			dispatch(actDictCareTypes(data));
		}	

		const fetchRemarks = async () => {			
			const url = `${process.env.REACT_APP_API_URL}citytree/dictionary/remarks/`;
			const res = await fetch(url);
			const data = await res.json();
			dispatch(actDictRemarks(data));
		}	
		
		const fetchPlaceTypes = async () => {			
			const url = `${process.env.REACT_APP_API_URL}citytree/dictionary/placetypes/`;
			const res = await fetch(url);
			const data = await res.json();
			dispatch(actDictPlaceTypes(data));
		}		

		const fetchIrrigationMethods = async () => {			
			const url = `${process.env.REACT_APP_API_URL}citytree/dictionary/irrigationmethods/`;
			const res = await fetch(url);
			const data = await res.json();
			dispatch(actDictIrrigationMethods(data));
		}	
		
		const fetchGroupSpecs = async () => {			
			const url = `${process.env.REACT_APP_API_URL}citytree/dictionary/groupspecs/`;
			const res = await fetch(url);
			const data = await res.json();
			dispatch(actDictGroupSpecs(data));
		}	
		
		const fetchTypeSpecs = async () => {			
			const url = `${process.env.REACT_APP_API_URL}citytree/dictionary/typespecs/`;
			const res = await fetch(url);
			const data = await res.json();
			dispatch(actDictTypeSpecs(data));
		}		

		fetchSpecieses();
		fetchCareTypes();
		fetchRemarks();
		fetchPlaceTypes();
		fetchIrrigationMethods();
		fetchGroupSpecs();
		fetchTypeSpecs();

		if (authToken) {
            checkAuthToken()
        }	
		
		dispatch(actIsMobileDevice(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)))
		//dispatch(actIsMobileDevice(true))
		dispatch(actShowSidebar(!isMobileView))	
		
		window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);			
        }		

	}, []); /* useEffect triggers when route has been changed too */


	useEffect(() => {
		fetchTreesAndStatuses();
	}, [paramsRouter]); /* useEffect triggers when route has been changed too */

    useEffect(() => {
        let periodUpdate = 240000 //4 min
        let interval = setInterval(() => {
            if (authToken) {
                refreshAuthToken(authToken.refresh)    
            }
        }, periodUpdate)

        return ()=> clearInterval(interval)
    }, [authToken]);


    function handleWindowSizeChange() {
        setScreenWidth(window.innerWidth);
    }	


	const fetchTreesAndStatuses = async () => {
		//first of all, we must fetch dictionary with statuse, otherwise we can't draw points of trees in diferent color depends of them statuses.
		let url = `${process.env.REACT_APP_API_URL}citytree/dictionary/statuses`;
		let res = await fetch(url);
		let data = await res.json();
		dispatch(actDictStatuses(data));
						
		url = `${process.env.REACT_APP_API_URL}citytree/${paramsRouter.cityName}/trees/`;
		res = await fetch(url);
		data = await res.json();
		data.dateTimeGenerated = Date.now();
		
		dispatch(actDataTrees(data));
	};

	//const onMarkerClick = (data: AccidentItem) => {
		//console.log('data', data)
	//	dispatch(actShowAccidentTab(true));
	//	dispatch(actActiveTabKey("accident"));
	//	setDataAccidentForm(data);
	//	dispatch(actShowSidebar(true));
	//};

	function markerOnClick(e: any) {
		const fetchTreeData = async (idTree: number) => {
			
				let url = `${process.env.REACT_APP_API_URL}citytree/${paramsRouter.cityName}/trees/${idTree}/`;
				let res = await fetch(url);
				let data = await res.json();
	
				setDataTreeForm(data);
				dispatch(actShowTreeTab(true));
				dispatch(actActiveTabKey('tree'));									
				dispatch(actShowSidebar(true));			
				
				//onMarkerClick(geojson);
				//console.log(geojson) 
			
		}


		let marker: L.Marker = e.target;
		let geojson = marker.toGeoJSON(); //: GeoJSON.FeatureCollection<any>
		//console.log(geojson);
		if (geojson?.properties?.id) {
			fetchTreeData(geojson?.properties?.id);
		}   
	}	





	
	const onSubmitTree = (data: any) => {
		let method;
		let url;
		if (data.id) {
			url = `${process.env.REACT_APP_API_URL}citytree/${paramsRouter.cityName}/trees/${data.id}/`;
			method = "PUT";
		} else {
			url = `${process.env.REACT_APP_API_URL}citytree/${paramsRouter.cityName}/trees/`;
			method = "POST";
		}

		const succeedCallBack = () => {
			fetchTreesAndStatuses();
			dispatch(actNewMarkerState({ visible: false, position: {} }));
			dispatch(actActiveTabKey('filter'));
			dispatch(actShowTreeTab(false));

			if (isMobileView) {
				dispatch(actShowSidebar(false))
			}			
		}		
		fetchUrl(url, method, data, succeedCallBack);
		
		
	};



	const onDeleteTree = (id: number) => {
		const succeedCallBack = () => {					
			dispatch(actActiveTabKey('filter'));
			dispatch(actShowTreeTab(false));						
			fetchTreesAndStatuses();				
		}

		fetchUrl(`${process.env.REACT_APP_API_URL}citytree/${paramsRouter.cityName}/trees/${id}`, "DELETE", {}, succeedCallBack);
	};


	const onCloseTree = () => {
		dispatch(actNewMarkerState({ visible: false, position: {} }));
		dispatch(actActiveTabKey('filter'));
		dispatch(actShowTreeTab(false));
	};





	const fetchTreeData = async (idTree: number) => {			
		let url = `${process.env.REACT_APP_API_URL}citytree/${paramsRouter.cityName}/trees/${idTree}/`;
		let res = await fetch(url);
		let data = await res.json();
		setDataTreeForm(data);		
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
			fetchTreeData(data.treeId);		
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
				fetchTreeData(data.tree);
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

		


	const onClickMap = (e: any) => {
		if (rxCheckButtonNewMarker && !rxIsMobileDevice) {
			dispatch(actCheckButtonNewMarker(false));

			let coord = { lat: '0', lng: '0' };
			coord.lat = e.latlng.lat.toFixed(5);
			coord.lng = e.latlng.lng.toFixed(5);
			
			dispatch(actNewMarkerState({ visible: true, position: coord }));

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
	

	const onDragEndNewMarker = (LatLng: { lon: number; lat: number }) => {
		//let coord = { lat: 0, lng: 0 };
		//coord.lat = LatLng.lat.toFixed(5);
		//coord.lng = LatLng.lng.toFixed(5);
		//setNewMarkerState({ visible: true, position: coord });
	};

	const filterMapCallback = (feature: any): boolean => {
		
		const objectSearchResult = {
			species: true,
			status: true,
			recommendations: true,
			remarks: true,
			placetype: true,
			irrigationmethod: true,
	
			plantedDateFrom: true,
			plantedDateTo: true,
			addedDateFrom: true,
			addedDateTo: true,
			comment: true,
	
			heightFrom: true,
			heightTo: true,
			trunkGirthFrom: true,
			trunkGirthTo: true,
			crownDiameterFrom: true,
			crownDiameterTo: true,
	
			showOnlyMyTrees: true			
		}

		let valueFilter;

				
		valueFilter = rxDataFilters?.speciesFilter;
		if (Array.isArray(valueFilter)) {
			objectSearchResult.species = isFoundArrayInValue(valueFilter, feature.properties.species);			
		}

		valueFilter = rxDataFilters?.statusFilter;
		if (Array.isArray(valueFilter)) {
			objectSearchResult.status = isFoundArrayInValue(valueFilter, feature.properties.lastinsp_status);			
		}


		valueFilter = rxDataFilters?.careTypeFilter;
		if (Array.isArray(valueFilter)) {
			objectSearchResult.recommendations = isFoundArrayInArray(valueFilter, feature.properties.recommendations);
		}	
		
		valueFilter = rxDataFilters?.remarkFilter;
		if (Array.isArray(valueFilter)) {
			objectSearchResult.remarks = isFoundArrayInArray(valueFilter, feature.properties.remarks);
		}		



		valueFilter = rxDataFilters?.placeTypeFilter?.value;
		if (valueFilter) {
			objectSearchResult.placetype = valueFilter === feature.properties.placetype;
		}

		valueFilter = rxDataFilters?.irrigationMethodFilter?.value;
		if (valueFilter) {
			objectSearchResult.irrigationmethod = valueFilter === feature.properties.irrigationmethod;
		}	
		
		valueFilter = rxDataFilters?.datePlantedFromFilter;
		if (valueFilter) {
			objectSearchResult.plantedDateFrom =
				feature.properties.dateplanted >= valueFilter;
		}
		valueFilter = rxDataFilters?.datePlantedToFilter;
		if (valueFilter) {
			objectSearchResult.plantedDateTo =
				feature.properties.dateplanted <= valueFilter;
		}	
		
		valueFilter = rxDataFilters?.dateAddedFromFilter;
		if (valueFilter) {
			objectSearchResult.addedDateFrom =
				feature.properties.datetimeadded >= valueFilter;
		}
		valueFilter = rxDataFilters?.dateAddedToFilter;
		if (valueFilter) {
			objectSearchResult.addedDateTo =
				feature.properties.datetimeadded <= valueFilter;
		}	
		
		valueFilter = rxDataFilters?.commentFilter;
		if (valueFilter) {
			if (
				feature.properties.comment
					.toLowerCase()
					.indexOf(valueFilter.toLowerCase()) === -1
			) {
				objectSearchResult.comment = false;
			}
		}		


		
		valueFilter = rxDataFilters?.heightFromFilter;
		if (valueFilter) {
			objectSearchResult.heightFrom = feature.properties.lastinsp_height >= valueFilter;
		}
		valueFilter = rxDataFilters?.heightToFilter;
		if (valueFilter) {
			objectSearchResult.heightTo = feature.properties.lastinsp_height <= valueFilter;
		}	
		
		valueFilter = rxDataFilters?.trunkGirthFromFilter;
		if (valueFilter) {
			objectSearchResult.trunkGirthFrom = feature.properties.lastinsp_trunkgirth >= valueFilter;
		}
		valueFilter = rxDataFilters?.trunkGirthToFilter;
		if (valueFilter) {
			objectSearchResult.trunkGirthTo = feature.properties.lastinsp_trunkgirth <= valueFilter;
		}	
		
		valueFilter = rxDataFilters?.crownDiameterFromFilter;
		if (valueFilter) {
			objectSearchResult.crownDiameterFrom = feature.properties.lastinsp_crowndiameter >= valueFilter;
		}
		valueFilter = rxDataFilters?.crownDiameterToFilter;
		if (valueFilter) {
			objectSearchResult.crownDiameterTo = feature.properties.lastinsp_crowndiameter <= valueFilter;
		}		



		valueFilter = rxDataFilters?.showMyTreesFilter;
		if (valueFilter && authToken?.user) {
			objectSearchResult.showOnlyMyTrees = authToken.user.id === feature.properties.useradded;	
		}


		let result = true;
		for (const el in objectSearchResult) {
			//@ts-ignore
			if (objectSearchResult[el] === false) {
				result = false;
				break;
			}			
		}
			 		
		//rxDataTrees.dateTimeGenerated = Date.now(); // dateTimeGenerated is used like key parameter to update data on map, when it changed
		return result;
	};

	function isFoundArrayInValue(array: {value: number}[], value: number) {
		for (let el of array) {
			if (el.value === value) {
				return true;				
			}				
		}
		return false;
	}

	function isFoundArrayInArray(arraySearch: {value: number}[], arrayTree: string[]){
		const intersection = arraySearch.filter((x) => {
			return arrayTree.includes(String(x.value));
		});
		return intersection.length > 0;
	}	



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
									dataTreeForm={dataTreeForm}											
									//@ts-ignore
									city={paramsRouter.cityName}
									signingS3Url={signingS3Url}
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
									signingS3Url={signingS3Url}
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

				<LoginModalForm setAuthToken={setAuthToken}/>
				<RegisterModalForm setAuthToken={setAuthToken}/> 			
			</>
		</MainWrapper>

	);


	function getCookie(name: string) {
		var cookieValue = null;
		if (document.cookie && document.cookie !== "") {
			var cookies = document.cookie.split(";");
			for (var i = 0; i < cookies.length; i++) {
				var cookie = cookies[i].trim();
				// Does this cookie string begin with the name we want?
				if (cookie.substring(0, name.length + 1) === name + "=") {
					cookieValue = decodeURIComponent(
						cookie.substring(name.length + 1)
					);
					break;
				}
			}
		}
		return cookieValue;
	}






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



    function refreshAuthToken(refreshToken: string){
		let myHeaders = new Headers();
		myHeaders.append("Content-type", "application/json");
		if (csrftoken) {
			myHeaders.append("X-CSRFToken", csrftoken);
		}	

        fetch(`${process.env.REACT_APP_API_URL}token/refresh/`, {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({ refresh: refreshToken }),

        }).then(function (response) {
            if (response.status == 200) {
                response.json().then((data) => {    
                    //setAuthToken({access: data.access, refresh: authToken.refresh})
                    setAuthToken(data)
                });
            } else if (response.status >= 400) {
                setAuthToken(null)    
            }
        });
    };


    function checkAuthToken() {
		let body = { token: authToken.access }
		let url = `${process.env.REACT_APP_API_URL}token/verify/`;
		let myHeaders = new Headers();

		myHeaders.append("Content-type", "application/json");
		if (csrftoken) {
			myHeaders.append("X-CSRFToken", csrftoken);
		}	

		fetch(url, {
			method: "POST",
			headers: myHeaders,
			body: JSON.stringify(body),

		}).then(function (response) {
			if (response.status >= 400) {
				response.json().then((data) => {
					console.log(">= 400", data);

                    refreshAuthToken(authToken.refresh)

				});
			} else {
				response.json().then((data) => {
					console.log("ok", data);
				});
			}
		});

	};


}



export default App;

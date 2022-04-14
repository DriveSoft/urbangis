import "./App.css";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import MenuGlobal from "./components_hl/MenuGlobal";
import Sidebar from "./components/Sidebar";
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import FormFilter from './components/FormFilter'
import FormAccident from './components/FormAccident'
import Map from "./components/Map";
import LoginModalForm from "./components/LoginModalForm";
import RegisterModalForm from "./components/RegisterModalForm";
import Button from "react-bootstrap/Button";

import useAuthToken from "./useAuthToken";
import { useTranslation } from 'react-i18next'

import { RootState, allReducers } from './reducers/index'
import { useSelector, useDispatch } from 'react-redux'
import {
	actNewMarkerState,
	actIsMobileDevice,
	actShowSidebar,
	actCheckButtonNewMarker,
	actShowOkCancelMobileMarker,
	actShowAccidentTab,
	actActiveTabKey,
	actDictManeuvers,
	actDictTypeViolations,
	actDictViolators,
	actDataAccidents,
	actDataFilters,
	actMinMaxDateData
} from "./actions";
import { AccidentItem } from './interfaces'





function App() {
	const paramsRouter = useParams();
	const csrftoken = getCookie("csrftoken");

	// redux
	const dispatch = useDispatch()
	const rxShowSidebar = useSelector((state: RootState) => state.uiReducer.showSidebar)
	const rxShowOkCancelMobileMarker = useSelector((state: RootState) => state.uiReducer.showOkCancelMobileMarker)
	const rxDataFilters = useSelector((state: RootState) => state.dataReducer.dataFilters)
	const rxActiveTabKey = useSelector((state: RootState) => state.uiReducer.activeTabKey)
	const rxShowAccidentTab = useSelector((state: RootState) => state.uiReducer.showAccidentTab)

	const { authToken, setAuthToken } = useAuthToken();
	const [screenWidth, setScreenWidth] = useState(window.innerWidth);
	//const [isMobileDevice, setIsMobileDevice] = useState(false)
	const isMobileView = screenWidth <= 768; // show or hide sidebar at startup
	
	const [dataAccidentForm, setDataAccidentForm] = useState<AccidentItem | null>(null);
	const { t } = useTranslation()

	//let dataHeatmapPoints = [];
	let dataHeatmapPoints: number[][] = []; // [[lat, lng, value],[lat, lng, value]...]	


	useEffect(() => {
		//setUserAuthToken(getAuthToken())

		const fetchManeuvers = async () => {
			//const url = `http://127.0.0.1:8000/api/dictionary/roadaccident/maneuvers`;
			const url = `${process.env.REACT_APP_API_URL}dictionary/roadaccident/maneuvers`;
			const res = await fetch(url);
			const data = await res.json();
			dispatch(actDictManeuvers(data))
		};

		const fetchTypeViolations = async () => {
			const url = `${process.env.REACT_APP_API_URL}dictionary/roadaccident/typeviolations`;
			const res = await fetch(url);
			const data = await res.json();
			dispatch(actDictTypeViolations(data))
		};

		const fetchViolators = async () => {
			const url = `${process.env.REACT_APP_API_URL}dictionary/roadaccident/violators`;
			const res = await fetch(url);
			const data = await res.json();
			dispatch(actDictViolators(data))
		};

		fetchManeuvers();
		fetchTypeViolations();
		fetchViolators();

		if (authToken) {
            checkAuthToken()
        }

        
		dispatch(actIsMobileDevice(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)))
		dispatch(actShowSidebar(!isMobileView))	
		
		window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);			
        }		
		
	}, []); /* useEffect triggers when route has been changed too */


	useEffect(() => {
		fetchAccidents();
	}, [paramsRouter]); /* useEffect triggers when route has been changed too */

    useEffect(() => {
        let periodUpdate = 240000 //4 min
        let interval = setInterval(() => {
            if (authToken) {
                refreshAuthToken(authToken.refresh)    
            }
        }, periodUpdate)

        return ()=> clearInterval(interval)
    }, [authToken])



    function handleWindowSizeChange() {
        setScreenWidth(window.innerWidth);
    }


	const fetchAccidents = async () => {
		const url = `${process.env.REACT_APP_API_URL}roadaccident/${paramsRouter.cityName}/accidents/`;
		const res = await fetch(url);
		const data = await res.json();

		// find min and max dates
		let datefilter_Min = "2100-01-01";
		let datefilter_Max = "1970-01-01";
		for (let item of data.features) {
			console.log(item);
			if (item.properties.datetime > datefilter_Max) {
				datefilter_Max = item.properties.datetime;
			}
			if (item.properties.datetime < datefilter_Min) {
				datefilter_Min = item.properties.datetime;
			}
		}

		dispatch(actMinMaxDateData({
			minDate: datefilter_Min.slice(0, 10),
			maxDate: datefilter_Max.slice(0, 10),
		}))

		dispatch(actDataAccidents(data))
	};



	const onDragEndNewMarker = (LatLng: {lon: number; lat: number}) => {
		//let coord = { lat: 0, lng: 0 };
		//coord.lat = LatLng.lat.toFixed(5);
		//coord.lng = LatLng.lng.toFixed(5);

		//setNewMarkerState({ visible: true, position: coord });
	};

	const onMarkerClick = (data: AccidentItem) => {
		//console.log('data', data)
		dispatch(actShowAccidentTab(true))
		dispatch(actActiveTabKey('accident'))
		setDataAccidentForm(data);
		dispatch(actShowSidebar(true))
	};

	const onSubmitFilter = (filter: {}) => {
		console.log(filter)
		dataHeatmapPoints = [];
		dispatch(actDataFilters(filter))

		if (isMobileView) {
			dispatch(actShowSidebar(false))
		}
	};

	const onSubmitAccident = (data: any) => {
		console.log("onSubmitAccident", data);
		let method;
		let url;
		if (data.id) {
			url = `${process.env.REACT_APP_API_URL}roadaccident/${paramsRouter.cityName}/accidents/${data.id}/`;
			method = "PUT";
		} else {
			url = `${process.env.REACT_APP_API_URL}roadaccident/${paramsRouter.cityName}/accidents/`;
			method = "POST";
		}

		fetchUrl(url, method, data);
		
		if (isMobileView) {
			dispatch(actShowSidebar(false))
		}
	};

	const onDeleteAccident = (id: number) => {
		fetchUrl(
			`${process.env.REACT_APP_API_URL}roadaccident/${paramsRouter.cityName}/accidents/${id}/`,
			"DELETE"
		);
	};

	const onCloseAccident = () => {
		dispatch(actNewMarkerState({ visible: false, position: {} }))
		dispatch(actActiveTabKey('filter'))
		dispatch(actShowAccidentTab(false))
	};

	const filterMapCallback = (feature: any): boolean => {
		let dateFrom_Filter = true;
		let dateTo_Filter = true;

		let maneuver_Filter = true;
		let description_Filter = true;
		let violations_type_Filter = true;
		let violators_Filter = true;

		let drivers_injured_Filter = true;
		let motorcyclists_injured_Filter = true;
		let cyclists_injured_Filter = true;
		let ped_injured_Filter = true;
		let kids_injured_Filter = true;
		let pubtr_passengers_injured_Filter = true;

		let drivers_killed_Filter = true;
		let motorcyclists_killed_Filter = true;
		let cyclists_killed_Filter = true;
		let ped_killed_Filter = true;
		let kids_killed_Filter = true;
		let pubtr_passengers_killed_Filter = true;

		let public_transport_involved_Filter = true;
		let showOnlyMyAccidents_Filter = true;

		let valueFilter;

		valueFilter = rxDataFilters?.dateFromFilter;
		if (valueFilter) {
			dateFrom_Filter =
				feature.properties.datetime.split("T")[0] >= valueFilter;
		}
		valueFilter = rxDataFilters?.dateToFilter;
		if (valueFilter) {
			dateTo_Filter =
				feature.properties.datetime.split("T")[0] <= valueFilter;
		}

		valueFilter = rxDataFilters?.maneuverFilter?.value;
		if (valueFilter) {
			maneuver_Filter = valueFilter === feature.properties.maneuver;
		}

		valueFilter = rxDataFilters?.descFilter;
		if (valueFilter) {
			if (
				feature.properties.description
					.toLowerCase()
					.indexOf(valueFilter.toLowerCase()) === -1
			) {
				description_Filter = false;
			}
		}

		valueFilter = rxDataFilters?.violationsTypeFilter;
		if (Array.isArray(valueFilter)) {
			let intersection = valueFilter.filter((x) =>
				feature.properties.violations_type.includes(String(x.value))
			);
			violations_type_Filter = intersection.length > 0;
		}

		valueFilter = rxDataFilters?.violatorsFilter;
		if (Array.isArray(valueFilter)) {
			let intersection = valueFilter.filter((x) =>
				feature.properties.violators.includes(String(x.value))
			);
			violators_Filter = intersection.length > 0;
		}

		valueFilter = rxDataFilters?.driverInjuredFilter;
		if (valueFilter) {
			drivers_injured_Filter = feature.properties.drivers_injured > 0;
		}
		valueFilter = rxDataFilters?.motorcyclistInjuredFilter;
		if (valueFilter) {
			motorcyclists_injured_Filter =
				feature.properties.motorcyclists_injured > 0;
		}
		valueFilter = rxDataFilters?.cyclistInjuredFilter;
		if (valueFilter) {
			cyclists_injured_Filter = feature.properties.cyclists_injured > 0;
		}
		valueFilter = rxDataFilters?.pedestrianInjuredFilter;
		if (valueFilter) {
			ped_injured_Filter = feature.properties.ped_injured > 0;
		}
		valueFilter = rxDataFilters?.kidsInjuredFilter;
		if (valueFilter) {
			kids_injured_Filter = feature.properties.kids_injured > 0;
		}
		valueFilter = rxDataFilters?.pubtrPassengersInjuredFilter;
		if (valueFilter) {
			pubtr_passengers_injured_Filter =
				feature.properties.pubtr_passengers_injured > 0;
		}

		valueFilter = rxDataFilters?.driversKilledFilter;
		if (valueFilter) {
			drivers_killed_Filter = feature.properties.drivers_killed > 0;
		}
		valueFilter = rxDataFilters?.motorcyclistsKilledFilter;
		if (valueFilter) {
			motorcyclists_killed_Filter =
				feature.properties.motorcyclists_killed > 0;
		}
		valueFilter = rxDataFilters?.cyclistsKilledFilter;
		if (valueFilter) {
			cyclists_killed_Filter = feature.properties.cyclists_killed > 0;
		}
		valueFilter = rxDataFilters?.pedestrianKilledFilter;
		if (valueFilter) {
			ped_killed_Filter = feature.properties.ped_killed > 0;
		}
		valueFilter = rxDataFilters?.kidsKilledFilter;
		if (valueFilter) {
			kids_killed_Filter = feature.properties.kids_killed > 0;
		}
		valueFilter = rxDataFilters?.pubtrPassengersKilledFilter;
		if (valueFilter) {
			pubtr_passengers_killed_Filter =
				feature.properties.pubtr_passengers_killed > 0;
		}

		valueFilter = rxDataFilters?.publicTransportInvolvedFilter;
		if (valueFilter) {
			public_transport_involved_Filter =
				feature.properties.public_transport_involved > 0;
		}
		//valueFilter = dataFilters?.showOnlyMyAccidentsFilter

		let returnValue =
			dateFrom_Filter &&
			dateTo_Filter &&
			maneuver_Filter &&
			description_Filter &&
			violations_type_Filter &&
			violators_Filter &&
			drivers_injured_Filter &&
			motorcyclists_injured_Filter &&
			cyclists_injured_Filter &&
			ped_injured_Filter &&
			kids_injured_Filter &&
			pubtr_passengers_injured_Filter &&
			drivers_killed_Filter &&
			motorcyclists_killed_Filter &&
			cyclists_killed_Filter &&
			ped_killed_Filter &&
			kids_killed_Filter &&
			pubtr_passengers_killed_Filter &&
			public_transport_involved_Filter &&
			showOnlyMyAccidents_Filter;

		if (returnValue) {
			dataHeatmapPoints.push([
				feature.properties.latitude,
				feature.properties.longitude,
				0.1,
			]);
		}

		return returnValue;
	};

	function fetchUrl(url: string, method: string, bodyObject?: any) {
		let myHeaders = new Headers();
		myHeaders.append("Content-type", "application/json");
		if (csrftoken) {
			myHeaders.append("X-CSRFToken", csrftoken);
		}	
		if (authToken?.access) {
			myHeaders.append("Authorization", "Bearer " + authToken.access);
		}

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
				//closeTabAccident();
				//if (IS_MOBILE) {
				//    CloseSidebar()
				//}

				// select the new/edited accident marker
				response.json().then((data) => {
					console.log(data);
					fetchAccidents();
					dispatch(actNewMarkerState({ visible: false, position: {} }))
					dispatch(actActiveTabKey('filter'))
					dispatch(actShowAccidentTab(false))					
				});
			}
		});
	}







	return (
		<div className="main-wrapper">
		{paramsRouter.cityName ? 	
			<div id="app">
				<div className={`d-flex ${rxShowSidebar ? "showed" : "hided"}`} id="wrapper">
					
					<Sidebar>						
						<Tabs
							id="controlled-tab-example"
							activeKey={rxActiveTabKey}
							onSelect={ (k) => dispatch(actActiveTabKey(k)) }
							//onSelect={(k) => setKey(k)}
							className="mb-3"
						>
							<Tab eventKey="filter" title={t<string>('sidebar.filterTab.title')}>
								<div style={{overflowY: 'auto', overflowX: 'hidden', width: '100%', height: 'calc(100vh - 130px)'}}>
									<FormFilter 
										onSubmitFilter={onSubmitFilter}  
									/>
								</div>
							</Tab>

							<Tab eventKey="accident" title={t<string>('sidebar.accidentTab.title')} tabClassName={!rxShowAccidentTab ? 'd-none' : ''}>
								<div style={{overflowY: 'auto', overflowX: 'hidden', width: '100%', height: 'calc(100vh - 130px)'}}>
									<FormAccident 
										onSubmitAccident={onSubmitAccident}
										onDeleteAccident={onDeleteAccident}
										onCloseAccident={onCloseAccident} 
										dataAccidentForm={dataAccidentForm}
										//currentCity={paramsRouter.cityName}
									/>
								</div>
							</Tab>
						</Tabs>
					</Sidebar>

					

					<div id="page-content-wrapper">
						<MenuGlobal							
							currentCity={paramsRouter.cityName}
							//onClickShowMenu={ () => dispatch(actShowSidebar(!rxShowSidebar)) }
							authToken={authToken}
							setAuthToken={setAuthToken}
							appname="roadaccident"
						/>

						<div
							className="container-fluid"
							style={{ paddingRight: "0px", paddingLeft: "0px" }}
						>
							<Map
								dataHeatmapPoints={dataHeatmapPoints}
								currentCity={paramsRouter.cityName}
								onMarkerClick={onMarkerClick}
								onDragEndNewMarker={onDragEndNewMarker}
								filterMapCallback={filterMapCallback}
							/>

							{rxShowOkCancelMobileMarker && <> 
								<Button
									variant="success"
									id="doneEditMarkerMobile"
									onClick={()=>{										
										dispatch(actCheckButtonNewMarker(false))										
										dispatch(actShowOkCancelMobileMarker(false))										
										dispatch(actShowAccidentTab(true))										
										dispatch(actActiveTabKey('accident'))										
										dispatch(actShowSidebar(true))
									}}
								>
									{t<string>('words.done')}
								</Button>{" "}
								<Button
									variant="secondary"
									id="cancelMarkerMobile"
									onClick={() => {
										dispatch(actNewMarkerState({ visible: false, position: {lat: 0, lng: 0} }))
										dispatch(actShowOkCancelMobileMarker(false))
										dispatch(actCheckButtonNewMarker(false))
									}}									
								>
									&#x2715;
								</Button>{" "}
							</>}

						</div>
					</div>
				</div>
			</div>
			
			: 'You must select a city.'}

			<LoginModalForm setAuthToken={setAuthToken}/>
			<RegisterModalForm setAuthToken={setAuthToken}/>

		</div>
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
    }


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

	}



	//function setAuthToken(userToken) {
	//    localStorage.setItem('token', JSON.stringify(userToken));
	//    setUserAuthToken(JSON.stringify(userToken))
	//}

	//function getAuthToken () {
	//    const tokenString = localStorage.getItem('token')
	//    return JSON.parse(tokenString)
	//}
}

export default App;

// Code Splitting in React Using Lazy and Suspense | Code Splitting Made Easy
// https://www.youtube.com/watch?v=69Oj8JTYXZU

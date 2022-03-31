import "./App.css";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import MenuGlobal from "./components_hl/MenuGlobal";
import Sidebar from "./components/Sidebar";
import Map from "./components/Map";
import LoginModalForm from "./components/LoginModalForm";
import RegisterModalForm from "./components/RegisterModalForm";
import Button from "react-bootstrap/Button";

import useAuthToken from "./useAuthToken";
import { useTranslation } from 'react-i18next'



function App(props) {

	const { authToken, setAuthToken } = useAuthToken();

	const [screenWidth, setScreenWidth] = useState(window.innerWidth);
	const [isMobileDevice, setIsMobileDevice] = useState(false)
	const isMobileView = screenWidth <= 768;
	

	const paramsRouter = useParams();
	const csrftoken = getCookie("csrftoken");

	const [loginModalShow, setLoginModalShow] = useState(false);
    const [registerModalShow, setRegisterModalShow] = useState(false);

	const [mapBaseLayerName, setMapBaseLayerName] = useState("Default");
	//const [mapCurrentLatLng, setMapCurrentLatLng] = useState({lat: 0, lng: 0})
	

	const [dictManeuvers, setDictManeuvers] = useState({});
	const [dictTypeViolations, setTypeViolations] = useState({});
	const [dictViolators, setDictViolators] = useState({});

	const [dataAccidents, setDataAccidents] = useState([]);
	const [dataFilters, setDataFilters] = useState({});
	const [minMaxDateData, setMinMaxDateData] = useState({
		minDate: "",
		maxDate: "",
	});
	const [dataAccidentForm, setDataAccidentForm] = useState({});

	const [newMarkerState, setNewMarkerState] = useState({
		visible: false,
		position: {},
		isMobile: false
	});

	const [showSidebar, setShowSidebar] = useState(!isMobileView);
	const [showAccidentTab, setShowAccidentTab] = useState(false);
	const [activeTabKey, setActiveTabKey] = useState("filter");

	const [checkButtonNewMarker, setCheckButtonNewMarker] = useState(false);
	const [checkButtonHeatmap, setCheckButtonHeatmap] = useState(false);
	const [checkButtonGPS, setCheckButtonGPS] = useState(false);

	const [showOkCancelMobileMarker, setShowOkCancelMobileMarker] = useState(false)

	//const accidentId = parseInt(paramsRouter.accidentId, 10);

	const { t } = useTranslation()

	let dataHeatmapPoints = [];



	useEffect(() => {
		//setUserAuthToken(getAuthToken())

		const fetchManeuvers = async () => {
			//const url = `http://127.0.0.1:8000/api/dictionary/roadaccident/maneuvers`;
			const url = `${process.env.REACT_APP_API_URL}dictionary/roadaccident/maneuvers`;
			const res = await fetch(url);
			const data = await res.json();
			setDictManeuvers(data);
		};

		const fetchTypeViolations = async () => {
			const url = `${process.env.REACT_APP_API_URL}dictionary/roadaccident/typeviolations`;
			const res = await fetch(url);
			const data = await res.json();
			setTypeViolations(data);
		};

		const fetchViolators = async () => {
			const url = `${process.env.REACT_APP_API_URL}dictionary/roadaccident/violators`;
			const res = await fetch(url);
			const data = await res.json();
			setDictViolators(data);
		};

		fetchManeuvers();
		fetchTypeViolations();
		fetchViolators();

		let mapname_ = document.cookie
			.split("; ")
			.find((row) => row.startsWith("mapname="));

		if (mapname_) {
			setMapBaseLayerName(mapname_.split("=")[1]);
		}

		if (authToken) {
            checkAuthToken()
        }

        
		setIsMobileDevice( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) )		
		//setIsMobileDevice( true )		
		
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
		setMinMaxDateData({
			minDate: datefilter_Min.slice(0, 10),
			maxDate: datefilter_Max.slice(0, 10),
		});
		setDataAccidents(data);
	};









	const onClickMap = (e) => {
		if (checkButtonNewMarker && !isMobileDevice) {
			setCheckButtonNewMarker(false)

			let coord = { lat: 0, lng: 0 }
			coord.lat = e.latlng.lat.toFixed(5)
			coord.lng = e.latlng.lng.toFixed(5)

			setNewMarkerState({ visible: true, position: coord })

			setShowAccidentTab(true)
			setActiveTabKey("accident")
		}
	};

	const onDragEndNewMarker = (LatLng) => {
		//let coord = { lat: 0, lng: 0 };
		//coord.lat = LatLng.lat.toFixed(5);
		//coord.lng = LatLng.lng.toFixed(5);

		//setNewMarkerState({ visible: true, position: coord });
	};

	const onMarkerClick = (data) => {
		//console.log("makrer", data);
		setShowAccidentTab(true);
		setActiveTabKey("accident");
		setDataAccidentForm(data);
		setShowSidebar(true)
	};

	const onClickNewMarker = (state) => {
		setCheckButtonNewMarker(state);

		if (isMobileDevice && state) {			
			setNewMarkerState({ visible: true, position: {lat: 0, lng: 0} })
			setShowOkCancelMobileMarker(true)			
		}
	};

	const onClickHeatmap = (state) => {
		console.log("onClickHeatmap", state);

		if (state) {
			setMapBaseLayerName("Dark");
		} else {
			setMapBaseLayerName("Default");
		}
		setCheckButtonHeatmap(state);
	};

	const onClickGPS = (state) => {
		//console.log("onClickGPS", state);
		setCheckButtonGPS(state);
	};

	const onSubmitFilter = (filter) => {
		dataHeatmapPoints = [];
		setDataFilters(filter);

		if (isMobileView) {
			setShowSidebar(false)
		}
	};

	const onSubmitAccident = (data) => {
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
			setShowSidebar(false)
		}
	};

	const onDeleteAccident = (id) => {
		fetchUrl(
			`${process.env.REACT_APP_API_URL}roadaccident/${paramsRouter.cityName}/accidents/${id}/`,
			"DELETE"
		);
	};

	const onCloseAccident = () => {
		setNewMarkerState({ visible: false, position: {} });
		setActiveTabKey("filter");
		setShowAccidentTab(false);
	};

	const onBaselayerchange = (e) => {
		//console.log('onBaselayerchange', e.name)
		document.cookie = "mapname=" + e.name;

		//setMapBaseLayerName(e.name)

		//setMapname(e.name)
		//mapname = e.name
	};

	const filterMapCallback = (feature, layer) => {
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

		valueFilter = dataFilters?.dateFromFilter;
		if (valueFilter) {
			dateFrom_Filter =
				feature.properties.datetime.split("T")[0] >= valueFilter;
		}
		valueFilter = dataFilters?.dateToFilter;
		if (valueFilter) {
			dateTo_Filter =
				feature.properties.datetime.split("T")[0] <= valueFilter;
		}

		valueFilter = dataFilters?.maneuverFilter?.value;
		if (valueFilter) {
			maneuver_Filter = valueFilter === feature.properties.maneuver;
		}

		valueFilter = dataFilters?.descFilter;
		if (valueFilter) {
			if (
				feature.properties.description
					.toLowerCase()
					.indexOf(valueFilter.toLowerCase()) === -1
			) {
				description_Filter = false;
			}
		}

		valueFilter = dataFilters?.violationsTypeFilter;
		if (Array.isArray(valueFilter)) {
			let intersection = valueFilter.filter((x) =>
				feature.properties.violations_type.includes(String(x.value))
			);
			violations_type_Filter = intersection.length > 0;
		}

		valueFilter = dataFilters?.violatorsFilter;
		if (Array.isArray(valueFilter)) {
			let intersection = valueFilter.filter((x) =>
				feature.properties.violators.includes(String(x.value))
			);
			violators_Filter = intersection.length > 0;
		}

		valueFilter = dataFilters?.driverInjuredFilter;
		if (valueFilter) {
			drivers_injured_Filter = feature.properties.drivers_injured > 0;
		}
		valueFilter = dataFilters?.motorcyclistInjuredFilter;
		if (valueFilter) {
			motorcyclists_injured_Filter =
				feature.properties.motorcyclists_injured > 0;
		}
		valueFilter = dataFilters?.cyclistInjuredFilter;
		if (valueFilter) {
			cyclists_injured_Filter = feature.properties.cyclists_injured > 0;
		}
		valueFilter = dataFilters?.pedestrianInjuredFilter;
		if (valueFilter) {
			ped_injured_Filter = feature.properties.ped_injured > 0;
		}
		valueFilter = dataFilters?.kidsInjuredFilter;
		if (valueFilter) {
			kids_injured_Filter = feature.properties.kids_injured > 0;
		}
		valueFilter = dataFilters?.pubtrPassengersInjuredFilter;
		if (valueFilter) {
			pubtr_passengers_injured_Filter =
				feature.properties.pubtr_passengers_injured > 0;
		}

		valueFilter = dataFilters?.driversKilledFilter;
		if (valueFilter) {
			drivers_killed_Filter = feature.properties.drivers_killed > 0;
		}
		valueFilter = dataFilters?.motorcyclistsKilledFilter;
		if (valueFilter) {
			motorcyclists_killed_Filter =
				feature.properties.motorcyclists_killed > 0;
		}
		valueFilter = dataFilters?.cyclistsKilledFilter;
		if (valueFilter) {
			cyclists_killed_Filter = feature.properties.cyclists_killed > 0;
		}
		valueFilter = dataFilters?.pedestrianKilledFilter;
		if (valueFilter) {
			ped_killed_Filter = feature.properties.ped_killed > 0;
		}
		valueFilter = dataFilters?.kidsKilledFilter;
		if (valueFilter) {
			kids_killed_Filter = feature.properties.kids_killed > 0;
		}
		valueFilter = dataFilters?.pubtrPassengersKilledFilter;
		if (valueFilter) {
			pubtr_passengers_killed_Filter =
				feature.properties.pubtr_passengers_killed > 0;
		}

		valueFilter = dataFilters?.publicTransportInvolvedFilter;
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

	function fetchUrl(url, method, bodyObject) {
		let myHeaders = new Headers();
		myHeaders.append("Content-type", "application/json");
		myHeaders.append("X-CSRFToken", csrftoken);
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
					setNewMarkerState({ visible: false, position: {} });
					setActiveTabKey("filter");
					setShowAccidentTab(false);
				});
			}
		});
	}







	return (
		<div className="main-wrapper">
			<div id="app">

				<div
					className={`d-flex ${showSidebar ? "showed" : "hided"}`}
					id="wrapper"
				>
					{/* <DictionariesContext.Provider value={{dictManeuvers, dictTypeViolations, dictViolators}}> */}
					<Sidebar
						onSubmitFilter={onSubmitFilter}
						onSubmitAccident={onSubmitAccident}
						onDeleteAccident={onDeleteAccident}
						onCloseAccident={onCloseAccident}
						minMaxDateData={minMaxDateData}
						dataAccidentForm={dataAccidentForm}
						showAccidentTab={showAccidentTab}
						activeTabKey={activeTabKey}
						setActiveTabKey={setActiveTabKey}
						newMarkerState={newMarkerState}
						dictManeuvers={dictManeuvers}
						dictTypeViolations={dictTypeViolations}
						dictViolators={dictViolators}
						currentCity={paramsRouter.cityName}
					/>
					{/*</DictionariesContext.Provider> */}

					<div id="page-content-wrapper">
						<MenuGlobal
							currentCity={paramsRouter.cityName}
							onClickShowMenu={() => setShowSidebar(!showSidebar)}
							authToken={authToken}
							setLoginModalShow={setLoginModalShow}
							setAuthToken={setAuthToken}
							appname="roadaccident"
						/>

						<div
							className="container-fluid"
							style={{ paddingRight: "0px", paddingLeft: "0px" }}
						>
							<Map
								mapBaseLayerName={mapBaseLayerName}
								dataAccidents={dataAccidents}
								dataHeatmapPoints={dataHeatmapPoints}
								currentCity={paramsRouter.cityName}
								checkButtonNewMarker={checkButtonNewMarker}
								checkButtonHeatmap={checkButtonHeatmap}
								checkButtonGPS={checkButtonGPS}
								onClickNewMarker={onClickNewMarker}
								onClickHeatmap={onClickHeatmap}
								onClickGPS={onClickGPS}
								onClickMap={onClickMap}
								onMarkerClick={onMarkerClick}
								newMarkerState={newMarkerState}
								onDragEndNewMarker={onDragEndNewMarker}
								filterMapCallback={filterMapCallback}
								onBaselayerchange={onBaselayerchange}
								setNewMarkerState={setNewMarkerState}
								isMobileDevice={isMobileDevice}
								showOkCancelMobileMarker={showOkCancelMobileMarker}
								//setMapCurrentLatLng={setMapCurrentLatLng}
								setCheckButtonGPS={setCheckButtonGPS}
								showSidebar={showSidebar}
							/>

							{showOkCancelMobileMarker && <> 
								<Button
									variant="success"
									id="doneEditMarkerMobile"
									onClick={()=>{
										setCheckButtonNewMarker(false);
										setShowOkCancelMobileMarker(false)
										setShowAccidentTab(true)
										setActiveTabKey("accident")
										setShowSidebar(true)

										//setNewMarkerState({visible: true, position: mapCurrentLatLng})
									}}
								>
									{t('words.done')}
								</Button>{" "}
								<Button
									variant="secondary"
									id="cancelMarkerMobile"
									onClick={() => {
										setNewMarkerState({ visible: false, position: { lat: 0, lng: 0 } })
										setShowOkCancelMobileMarker(false)
										setCheckButtonNewMarker(false)										
									}}									
								>
									&#x2715;
								</Button>{" "}
							</>}

						</div>
					</div>
				</div>
			</div>

			<LoginModalForm
				setAuthToken={setAuthToken}
				show={loginModalShow}
				setLoginModalShow={setLoginModalShow}
                setRegisterModalShow={setRegisterModalShow}
				onHide={() => setLoginModalShow(false)}
			/>

			<RegisterModalForm
				setAuthToken={setAuthToken}
				show={registerModalShow}
				setRegisterModalShow={setRegisterModalShow}
                setLoginModalShow={setLoginModalShow}
				onHide={() => setRegisterModalShow(false)}
			/>
		</div>
	);

	function getCookie(name) {
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





    function refreshAuthToken(refreshToken){
		let myHeaders = new Headers();
		myHeaders.append("Content-type", "application/json");
		myHeaders.append("X-CSRFToken", csrftoken);

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
		myHeaders.append("X-CSRFToken", csrftoken);

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

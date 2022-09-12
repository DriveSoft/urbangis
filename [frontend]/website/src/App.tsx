import React from "react";
import { useEffect, useState } from "react";
import "./App.css";

import { Routes, Route, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import HomePage from "./routes/HomePage";
import CityTreePage from "./routes/CityTreePage";
import CityTreePageTrees from "./routes/CityTreePageTrees";
import RoadAccidentPage from "./routes/RoadAccidentPage";
import UrbanObjectPage from "./routes/UrbanObjectPage";

import Navbar from './components/Navbar'
import Header from './components/Header';
import Footer from './components/Footer'

import Modal from './components/Modal';

import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import { useAuthToken } from "./auth/useAuthToken";

import { CityItem } from './types';


const URL_GET_CITIES_WITH_COUNT_TREES = `${process.env.REACT_APP_API_URL}cities/with_count_trees`;

function App() {
	const [authToken, setAuthToken] = useAuthToken();

	const { t } = useTranslation();

	const [citiesWithCountTrees, setCitiesWithCountTrees] = useState<CityItem[] | undefined>(undefined); 
	const [citiesWithCountAccidents, setCitiesWithCountAccidents] = useState<CityItem[] | undefined>(undefined); 
	const [citiesWithCountUrbanObjects, setCitiesWithCountUranObjects] = useState<CityItem[] | undefined>(undefined); 

	const [showLoginModal, setShowLoginModal] = useState(false);
	const [showRegisterModal, setShowRegisterModal] = useState(false);

	return (
		<>
			{showLoginModal && (
				<Modal title={t('loginModalForm.title')} setShowModal={setShowLoginModal}>
					<LoginForm setAuthToken={setAuthToken} setShowLoginModal={setShowLoginModal} setShowRegisterModal={setShowRegisterModal} />
				</Modal>
			)}

			{showRegisterModal && (
				<Modal title={t('registerModalForm.title')} setShowModal={setShowRegisterModal}>
					<RegisterForm setAuthToken={setAuthToken} setShowRegisterModal={setShowRegisterModal} setShowLoginModal={setShowLoginModal} />
				</Modal>
			)}			

			<Navbar setShowLoginModal={setShowLoginModal} setShowRegisterModal={setShowRegisterModal} authToken={authToken} setAuthToken={setAuthToken} />
			<Header />

			<Routes>
				<Route path="/" element={<HomePage />}></Route>

				<Route
					path="/citytree"
					element={<CityTreePage cities={citiesWithCountTrees} setCities={setCitiesWithCountTrees} />}
				></Route>
				<Route
					path="/citytree/trees"
					element={<CityTreePageTrees />}
				></Route>

				<Route
					path="/roadaccident"
					element={<RoadAccidentPage cities={citiesWithCountAccidents} setCities={setCitiesWithCountAccidents} />}
				></Route>

				<Route
					path="/urbanobject"
					element={<UrbanObjectPage cities={citiesWithCountUrbanObjects} setCities={setCitiesWithCountUranObjects} />}
				></Route>
			</Routes>

			<Footer />
		</>
	);
}

export default App;

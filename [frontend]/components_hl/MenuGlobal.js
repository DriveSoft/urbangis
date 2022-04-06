import { useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

import { useDispatch, useSelector } from 'react-redux'
import { actLoginModalShow, actShowSidebar } from '../actions'

function MenuGlobal({
	currentCity,
	appname,
	authToken,
	setAuthToken,
}) {
	const dispatch = useDispatch();
	const rxShowSidebar = useSelector(state => state.uiReducer.showSidebar)
	const [cities, setCities] = useState([]);

	const { t, i18n } = useTranslation();

	useEffect(() => {
		const fetchCities = async () => {
			const res = await fetch(`${process.env.REACT_APP_API_URL}cities/`);
			const data = await res.json();
			setCities(data);
			console.log(data);
		};

		fetchCities();
	}, []);

	function changeLanguage(value) {
		i18n.changeLanguage(value);
		//localStorage.setItem('lng', value)
	}

	return (
		<Navbar bg="light" expand="lg">
			<Container>
				<Button
					className="start-0"
					variant="outline-primary"
					id="menu-toggle"
					//onClick={onClickShowMenu}
					onClick={() => dispatch(actShowSidebar(!rxShowSidebar))}
				>
					{t("menu.menu")}
				</Button>{" "}
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="ms-auto">
						<Nav.Link href="/">{t("menu.home")}</Nav.Link>

						<NavDropdown
							title={t("menu.appMaps.title")}
							id="basic-nav-dropdown"
						>
							<NavDropdown.Item
								href={`/roadaccident/${currentCity}`}
								key="1"
								active={appname === "roadaccident"}
							>
								{t("menu.appMaps.roadaccident")}
							</NavDropdown.Item>
							<NavDropdown.Item
								href={`/citytree/${currentCity}`}
								key="2"
								active={appname === "citytree"}
							>
								{t("menu.appMaps.citytree")}
							</NavDropdown.Item>
							<NavDropdown.Item
								href={`/urbanobject/${currentCity}`}
								key="3"
								active={appname === "urbanobject"}
							>
								{t("menu.appMaps.urbanobject")}
							</NavDropdown.Item>
						</NavDropdown>

						<NavDropdown
							title={t("menu.city")}
							id="basic-nav-dropdown"
						>
							{cities.map((city) => (
								<NavDropdown.Item
									as={Link}
									key={city.id}
									to={`/${city.sysname}`}
									active={currentCity === city.sysname}
								>
									{city.cityname}
								</NavDropdown.Item>
							))}
						</NavDropdown>

						<NavDropdown title="Lang" id="basic-nav-dropdown">
							<NavDropdown.Item
								key="1"
								active={
									"en" === i18n.language ||
									"en-US" === i18n.language ||
									"en-GB" === i18n.language
								}
								value="en"
								onClick={() => changeLanguage("en")}
							>
								English
							</NavDropdown.Item>

							<NavDropdown.Item
								key="2"
								active={"bg" === i18n.language}
								value="bg"
								onClick={() => changeLanguage("bg")}
							>
								Bulgarian
							</NavDropdown.Item>
						</NavDropdown>

						{authToken ? (
							<>
								<Nav.Link>
									{`${t("words.hello")}, ${
										authToken.username
									}`}
								</Nav.Link>

								<Nav.Link
									href="#"
									onClick={() => {
										setAuthToken(undefined);
									}}
								>
									{t("menu.logout")}
								</Nav.Link>
							</>
						) : (
							<Nav.Link
								href="#"
								//onClick={() => setLoginModalShow(true)}
								onClick={() =>
									dispatch(actLoginModalShow(true))
								}
							>
								{t("menu.signin")}
							</Nav.Link>
						)}
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}



export default MenuGlobal

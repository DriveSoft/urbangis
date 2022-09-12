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
import { RootState } from '../reducers/index'


interface IStateCities {
	cities: {
		id: number
		sysname: string;
		cityname: string;
		latitude: number;
		longitude: number;
		population: number;
	}[]
}

interface MenuGlobalProps {
	currentCity: string;
	appname: string;
	authToken: any;
	setAuthToken: (userToken: {access: string; refresh: string; user?: {id: number; name: string}} | null) => void;
  }



function MenuGlobal({
	currentCity,
	appname,
	authToken,
	setAuthToken,
}: MenuGlobalProps) {
	const dispatch = useDispatch();
	const rxShowSidebar = useSelector((state: RootState) => state.uiReducer.showSidebar)
	const [expanded, setExpanded] = useState(false);
	const [cities, setCities] = useState<IStateCities['cities']>([]);

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

	function changeLanguage(value: string) {
		i18n.changeLanguage(value);
		//localStorage.setItem('lng', value)
	}

	return (
		<Navbar bg="light" expand="lg" expanded={expanded} collapseOnSelect >
			<Container>
				<Button
					className="start-0"
					variant="outline-primary"
					id="menu-toggle"
					//onClick={onClickShowMenu}
					onClick={() => dispatch(actShowSidebar(!rxShowSidebar))}
				>
					{t<string>("menu.menu")}
				</Button>{" "}
				<Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(!expanded)} />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="ms-auto">
						<Nav.Link href="/">{t<string>("menu.home")}</Nav.Link>

						<NavDropdown
							title={t<string>("menu.appMaps.title")}
							id="basic-nav-dropdown"
						>
							<NavDropdown.Item
								href={`/roadaccident/${currentCity}`}
								key="1"
								active={appname === "roadaccident"}
							>
								{t<string>("menu.appMaps.roadaccident")}
							</NavDropdown.Item>
							<NavDropdown.Item
								href={`/citytree/${currentCity}`}
								key="2"
								active={appname === "citytree"}
							>
								{t<string>("menu.appMaps.citytree")}
							</NavDropdown.Item>
							<NavDropdown.Item
								href={`/urbanobject/${currentCity}`}
								key="3"
								active={appname === "urbanobject"}
							>
								{t<string>("menu.appMaps.urbanobject")}
							</NavDropdown.Item>
						</NavDropdown>

						<NavDropdown
							title={t<string>("menu.city")}
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
										authToken?.user?.name
									}`}
								</Nav.Link>

								<Nav.Link
									href="#"
									onClick={() => {
										setAuthToken(null);
									}}
								>
									{t<string>("menu.logout")}
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
								{t<string>("menu.signin")}
							</Nav.Link>
						)}
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}



export default MenuGlobal

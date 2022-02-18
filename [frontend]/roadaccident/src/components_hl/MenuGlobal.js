import { useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';
import { Link } from "react-router-dom";

function MenuGlobal({currentCity, appname, onClickShowMenu, setLoginModalShow, authToken, setAuthToken}) {
    const [cities, setCities] = useState([])    


    useEffect(() => {
        const fetchCities = async () => {
          const res = await fetch(`${process.env.REACT_APP_API_URL}cities/`)
          const data = await res.json()
          setCities(data)
          console.log(data)
        }
    
        fetchCities()
      }, [])  
      
      

    return (
		<Navbar bg="light" expand="lg">
			<Container>
				<Button
					className="start-0"
					variant="outline-primary"
					id="menu-toggle"
					onClick={onClickShowMenu}
				>
					Menu
				</Button>{" "}
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="ms-auto">
						<Nav.Link href="/">Начало</Nav.Link>

						<NavDropdown title="Карти" id="basic-nav-dropdown">
							<NavDropdown.Item
								href={`/roadaccident/${currentCity}`}
								key="1"
								active={appname === "roadaccident"}
							>
								Пътно транспортни произвешствия
							</NavDropdown.Item>
							<NavDropdown.Item
								href={`/citytree/${currentCity}`}
								key="2"
								active={appname === "citytree"}
							>
								Градска растителност
							</NavDropdown.Item>
							<NavDropdown.Item
								href={`/urbanobject/${currentCity}`}
								key="3"
								active={appname === "urbanobject"}
							>
								Градски обекти
							</NavDropdown.Item>
						</NavDropdown>

						<NavDropdown title="Град" id="basic-nav-dropdown">
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


						{authToken ? (	
							<>
								<Nav.Link>
									{`Hello, ${authToken.username}`}
								</Nav.Link>							

								<Nav.Link
									href="#"
									onClick={() => {
										setAuthToken(undefined);
									}}
								>
									Logout
								</Nav.Link>
							</>
						) : (
							<Nav.Link
								href="#"
								onClick={() => setLoginModalShow(true)}
							>
								Signin
							</Nav.Link>
						)}


					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}



export default MenuGlobal

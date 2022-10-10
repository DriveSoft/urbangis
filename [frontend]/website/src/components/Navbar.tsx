import { useState } from 'react'
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from './Navbar_logo.png';
import "./Navbar.css";

interface NavbarProps {
	setShowLoginModal: (b: boolean) => void;
  setShowRegisterModal: (b: boolean) => void;  
  authToken: any;
  setAuthToken: any;
}

const Navbar = ( {setShowLoginModal, setShowRegisterModal, authToken, setAuthToken }: NavbarProps ) => {

	const [menuOpen, setMenuOpen] = useState(false);
	const [openLangMenu, setOpenLangMenu] = useState(false);
  	const { t, i18n } = useTranslation(); //i18n.changeLanguage(value);

	const OnBarClick = () => {
    	setMenuOpen(!menuOpen);  
  	}

	function changeLanguage (e: any, lng: string) {
		i18n.changeLanguage(lng);
		setOpenLangMenu(false);	
		setMenuOpen(false);	
	}

	return (
		<nav className="navbar">
			<div className="container">
				<ul style={{userSelect: "none"}}>
					<li className="navbar-logo"><Link to="/"><img src={Logo} alt="" /></Link></li>
					<li className="navbar-toggle" onClick={OnBarClick}>
						<i className="fas fa-bars fa-xl"></i>
					</li>
					<li className={`navbar-links ${menuOpen ? 'activeMenuItem' : ''}`} ><Link to="/" onClick={()=>setMenuOpen(false)}>{t('menu.home')}</Link></li>                
					
					{ authToken ? (
					<>
					<li className={`navbar-links ${menuOpen ? 'activeMenuItem' : ''}`}><i className="fa-solid fa-user fa-xl" style={{marginRight:"10px"}}></i>{t('menu.words.hello')}, {authToken.user.name}</li>   
					<li className={`navbar-links signup-link ${menuOpen ? 'activeMenuItem' : ''}`}><a href="#" onClick={() => {setAuthToken(null); setMenuOpen(false);}}>{t('menu.logout')}</a></li> 
					</>
					) : (<>
					<li className={`navbar-links login-link ${menuOpen ? 'activeMenuItem' : ''}`}><a href="#" onClick={() => {setShowLoginModal(true); setMenuOpen(false);}}>{t('menu.login')}</a></li>
					<li className={`navbar-links signup-link ${menuOpen ? 'activeMenuItem' : ''}`}><a href="#" onClick={()=> {setShowRegisterModal(true); setMenuOpen(false);}}>{t('menu.signup')}</a></li>                                
					</>)}

					<li className={`navbar-links ${menuOpen ? 'activeMenuItem' : ''} dropdown`} style={{paddingLeft: "1rem"}}>
						<a href="javascript:void(0)" onClick={()=>setOpenLangMenu(!openLangMenu)}>
							<i className="fa-solid fa-language fa-xl"></i>
							<i className="fa-solid fa-chevron-down fa-2xs" style={{paddingLeft: "5px", paddingRight: "15px"}}></i>
						</a>
						<div className="dropdown-content" style={{display: openLangMenu ? "block" : "none"}}>
							<a href="#" className={`${i18n.language === 'en' ? "selectedItem" : ""}`} onClick={(e) => changeLanguage(e, 'en')}>English</a>
							<a href="#" className={`${i18n.language === 'bg' ? "selectedItem" : ""}`} onClick={(e) => changeLanguage(e, 'bg')}>Bulgarian</a>
						</div>
					</li>


				</ul>
			</div>
		</nav>     
	)
}

export default Navbar
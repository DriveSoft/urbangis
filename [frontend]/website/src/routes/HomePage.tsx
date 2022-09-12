import {useEffect} from "react"
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CitytreeLogo from '../images/citytree.svg';
import RoadAccidentLogo from '../images/roadaccident.svg';
import UrbanObjectLogo from '../images/urbanobject.svg';
import "./HomePage.css";


const HomePage = () => {
	const { t } = useTranslation();

	useEffect(() => {
		window.scrollTo(0, 0);
	  }, []);	

	return (
		<>			
			<section className="boxes">
				<div className="title" style={{textAlign: "center"}}>
					<h1>{t('homePage.title')}</h1>
				</div>
				
				<div className="container">					
					<div className="box">
						<img src={CitytreeLogo} alt="" />
						<h3>{t('homePage.citytree')}</h3>
						<Link className="button" to="citytree/">{t('homePage.buttonDetails')}</Link>                                
					</div>

					<div className="box">
						<img src={RoadAccidentLogo} alt="" />
						<h3>{t('homePage.roadaccident')}</h3>
						<Link className="button" to="roadaccident/">{t('homePage.buttonDetails')}</Link>
					</div>

					<div className="box">
						<img src={UrbanObjectLogo} alt="" />
						<h3>{t('homePage.urbanobject')}</h3>
						<Link className="button" to="urbanobject/">{t('homePage.buttonDetails')}</Link>
					</div>
				</div>
			</section>		
		</>
	);
};

export default HomePage;

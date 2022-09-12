import { useEffect, useState } from 'react';
import RoadAccidentLogo from '../images/roadaccident.svg';
import ListCities from '../components/ListCities';
import { Link } from 'react-router-dom';
import { CityItem } from '../types';

const URL_GET_CITIES_WITH_COUNT_ACCIDENTS = `${process.env.REACT_APP_API_URL}cities/with_count_accidents`;

interface RoadAccidentPageProps {
    cities: CityItem[] | undefined;
	setCities: (data: any) => void;
}

const RoadAccidentPage = ( { cities, setCities }: RoadAccidentPageProps ) => {

	useEffect(() => {
		const fetchCities = async () => {
			let res = await fetch(URL_GET_CITIES_WITH_COUNT_ACCIDENTS);
			let data = await res.json();
			setCities(data);
		}
                
        if (!cities) fetchCities(); 
		window.scrollTo(0, 0); 
	}, []);	

	return (
		<>
			<section className="cities">
				<div className="citiesTitle">
					<h1>Градове</h1>
				</div>				
				<div className="container">										
					<ListCities cities={cities}/>			
				</div>
			</section>

			<section className="content">
				<div className="contentTitle">
					<h1>Защо е необходима карта на пътно-транспортните произшествия</h1>
				</div>

				<div className="container">
					<div className="contentLogo">
						<img src={RoadAccidentLogo} alt="" />
					</div>
					
					<div>            
						<p><i className="fas fa-check-square"></i>
							Всички опасни места в града могат да бъдат разпознати и анализирани по основни причини, след това да бъдат приложени точкови и не скъпоструващи решения, които максимално ще намалят инциденти с постаради и загинали хора.						
						</p>
				
				
						<p><br /><i className="fas fa-info-circle"></i>
							В много градове вече има интерактивна карта на пътно-транспортните произшествия.</p>
				
						<p>
							Примери по света:{' '}
							<a href="https://www.crashmap.co.uk/Search" target="_blank">UK</a>,{' '}
							<a href="https://www.star-traffic-accidents.eu/nl-NL/Map" target="_blank">Netherlands</a>,{' '}
							<a href="https://unfallatlas.statistikportal.de/" target="_blank">Germany</a>,{' '}							 							 
							<a href="https://www.treds.virginia.gov/Mapping/Map/CrashesByJurisdiction" target="_blank">Virginia</a>,{' '}
							<a href="https://pattersonpersonalinjury.com/fort-worth-accident-map/" target="_blank">Fort Worth </a>							
						</p>

						
						
					</div>
				</div>
			</section>

			<section>
				<div className="container">

					<div className="contentLinks">
						<h1 style={{textAlign: "center"}}>ПОЛЕЗНИ ЛИНКОВЕ</h1>            
						<ul>
							<li><a href="https://bgurban.com/%d0%ba%d0%b0%d0%ba-%d0%b4%d0%b0-%d0%bd%d0%b0%d0%bc%d0%b0%d0%bb%d0%b8%d0%bc-%d1%81%d0%bc%d1%8a%d1%80%d1%82%d0%bd%d0%be%d1%81%d1%82%d1%82%d0%b0-%d0%bf%d1%80%d0%b8-%d0%bf%d1%82%d0%bf/" target="_blank">Как да намалим смъртността при ПТП?</a></li>
							<li><a href="https://bgurban.com/%d0%ba%d0%b0%d0%ba%d0%b2%d0%b8-%d1%82%d1%80%d1%8f%d0%b1%d0%b2%d0%b0-%d0%b4%d0%b0-%d0%b1%d1%8a%d0%b4%d0%b0%d1%82-%d0%bf%d0%b5%d1%88%d0%b5%d1%85%d0%be%d0%b4%d0%bd%d0%b8%d1%82%d0%b5-%d0%bf%d1%8a%d1%82/" target="_blank">Какви трябва да бъдат пешеходните пътеки</a></li>
							<li><a href="https://bgurban.com/%d0%ba%d0%b0%d0%ba-%d0%b4%d0%b0-%d0%bf%d1%80%d0%be%d0%b5%d0%ba%d1%82%d0%b8%d1%80%d0%b0%d0%bc%d0%b5-%d1%83%d0%bb%d0%b8%d1%86%d0%b8/" target="_blank">Как да проектираме улици</a></li>
							<li><a href="https://bgurban.com/%d1%82%d1%80%d0%b0%d0%bd%d1%81%d0%bf%d0%be%d1%80%d1%82%d1%8a%d1%82-%d0%b2-%d0%b3%d1%80%d0%b0%d0%b4%d0%be%d0%b2%d0%b5%d1%82%d0%b5-%d1%83%d0%b4%d0%be%d0%b1%d0%b5%d0%bd-%d0%b7%d0%b0-%d0%b6%d0%b8%d0%b2/" target="_blank">Транспортът в градовете, удобен за живот</a></li>							
							<li><a href="https://www.sciencedirect.com/science/article/pii/S2352146519303667" target="_blank">Map of traffic accidents</a></li>
							<li><a href="https://ec.europa.eu/transport/road_safety/specialist/statistics/map-viewer/" target="_blank">European Commission (statistics)</a></li>
						</ul>           
					</div>  
				</div>
			</section>  		
		</>
	);
};

export default RoadAccidentPage;

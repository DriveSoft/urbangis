import { useEffect } from 'react';
import CitytreeLogo from '../images/citytree.svg';
import ListCities from '../components/ListCities';
import { Link } from 'react-router-dom';
import { CityItem } from '../types';
import { fetchUrl } from '../utils/misc';

const URL_GET_CITIES_WITH_COUNT_TREES = `${process.env.REACT_APP_API_URL}cities/with_count_trees`;

interface CityTreePageProps {
    cities: CityItem[] | undefined;
	setCities: (data: any) => void;
}

const CityTreePage = ( { cities, setCities }: CityTreePageProps ) => {

	useEffect(() => {
		const fetchCities = async () => {
			console.log(URL_GET_CITIES_WITH_COUNT_TREES);
			let res = await fetch(URL_GET_CITIES_WITH_COUNT_TREES);
			let data = await res.json();			
			//const data = await fetchUrl(URL_GET_CITIES_WITH_COUNT_TREES, 'GET');
			console.log(data);
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
					<ListCities app="citytree" cities={cities}/>			
				</div>
			</section>

			<section className="content">
				<div className="contentTitle">
					<h1>Защо е необходима карта на градската дървесна растителност</h1>
				</div>

				<div className="container">
					<div className="contentLogo">
						<img src={CitytreeLogo} alt="" />
					</div>
					
					<div>            
						<p><i className="fas fa-check-square"></i>
							Позволява на града да планира дейностите по-ефективно, свързани със засаждания, санитарни резитби и лечение на дървесната растителност.</p>
				
						<p><i className="fas fa-check-square"></i>
							Насърчава градската администрация да обърне повече внимание на градската растителност.</p>
				
						<p><i className="fas fa-check-square"></i>
							Позволява анализ на данните за вземане на решения относно развитието на градската растителност.</p>
				
						<p><i className="fas fa-check-square"></i>
							Позволява да се намалят рисковете, свързани с опасни дървета, които могат да причинят материални щети или да представляват заплаха за живота и здравето на жителите на града.</p>
				
						<p><i className="fas fa-check-square"></i>
							Включва жителите в развитието на градската растителност.</p>
				
						<p><i className="fas fa-check-square"></i>
							Осигурява по-ефективен граждански контрол върху опазването на дърветата в града.</p>
				
						<p><i className="fas fa-check-square"></i>
							Позволява на жителите да научат повече за градската растителност.</p>
				
						<p><br /><i className="fas fa-info-circle"></i>
							В много градове вече има интерактивна карта на дърветата, създадена с помощта на доброволци. Защото тази задача е голяма и изисква общи усилия и упоритост.</p>
				
						<p>
							Примери по света:<br />

						</p>
						
					</div>
				</div>
			</section>

			<section>
				<div className="container">
					<div className="contentBottom">
						<h1>КАК РАБОТИ</h1>
						
						<iframe style={{width: "75vw", height: "85vh", maxWidth: "1200px"}} src="https://www.youtube.com/embed/GkXyKjiwxPE" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
					</div>

					<div className="contentLinks">
						<h1 style={{textAlign: "center"}}>ПОЛЕЗНИ ЛИНКОВЕ</h1>            
						<ul>
							<li><Link to="trees/">Най разпространени видове в България</Link></li>
							<li><a href="/citytree/varna/opendata/" target="_blank">Отворени данни за дървета във Варна</a></li>
							<li><a href="https://play.google.com/store/apps/details?id=org.plantnet&amp;hl=bg&amp;gl=US" target="_blank">Приложение, което ви позволява да идентифицирате растенията просто като ги снимате с вашия смартфон.</a></li>
							<li><a href="https://en.wikipedia.org/wiki/Tree_measurement" target="_blank">Tree measurement</a></li>
						</ul>            
					</div>  
				</div>
			</section>  		
		</>
	);
};

export default CityTreePage;

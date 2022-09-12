import { useEffect, useState } from "react";
import UrbanObjectLogo from "../images/urbanobject.svg";
import ListCities from "../components/ListCities";
import { Link } from "react-router-dom";
import { CityItem } from "../types";

const URL_GET_CITIES_WITH_COUNT_URBANOBJECTS = `${process.env.REACT_APP_API_URL}cities/with_count_urbanobjects`;

interface UrbanObjectPageProps {
	cities: CityItem[] | undefined;
	setCities: (data: any) => void;
}

const UrbanObjectPage = ({ cities, setCities }: UrbanObjectPageProps) => {

	useEffect(() => {
		const fetchCities = async () => {
			let res = await fetch(URL_GET_CITIES_WITH_COUNT_URBANOBJECTS);
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
					<ListCities cities={cities} app="urbanobject" />
				</div>
			</section>

			<section className="content">
				<div className="contentTitle">
					<h1>
						Защо е необходима карта на достъпността за социално
						важни обекти
					</h1>
				</div>

				<div className="container">
					<div className="contentLogo">
						<img src={UrbanObjectLogo} alt="" />
					</div>

					<div>
						<p>
							<i className="fas fa-question-circle"></i>
							Какво е това социално важни обекти в града? Това са
							обекти, който осигуряват нормален живот в града.
							Обикновено всеки жител на града използва такива
							обекти почти ежедневно през целия си живот или през
							определени периоди от него.
						</p>

						<p>
							<i className="fas fa-check-square"></i>
							Позволява ви да оцените достъпността на социално
							важни обекти в града.
						</p>

						<p>
							<i className="fas fa-check-square"></i>
							Позволява ви да идентифицирате райони в града, в
							които няма социално важни обекти на пешеходно
							разстояние.
						</p>

						<p>
							<i className="fas fa-check-square"></i>
							Позволява ви да изберете най-доброто местоположение,
							когато създавате нов социално важен обект в града.
						</p>

						
						<h2>Очаквани резултати</h2>

						<p>
							<i className="fas fa-check-square"></i>
							Използването на този инструмент може да намали необходимостта от пътуване на дълги разстояния в града.
						</p>

						<p>
							<i className="fas fa-check-square"></i>
							Намалява автомобилния трафик в града, което от своя страна води до много други положителни ефекти.
						</p>

						<p>
							<i className="fas fa-check-square"></i>
							Намалява необходимостта от притежаване на кола в града.
						</p>

						<p>
							<i className="fas fa-check-square"></i>
							Стимулира придвижване в града пеша, което от своя страна има положителен ефект върху здравето на жителите на града.
						</p>

						<p>
							<i className="fas fa-check-square"></i>
							Повишава комфорта на живот в града.
						</p>																						
						<br/><br/><br/>
					</div>

				</div>
			</section>

		</>
	);
};

export default UrbanObjectPage;

import { useEffect } from "react";
import ImageSlider from '../components/ImageSlider';

const CityTreePageTrees = () => {

	useEffect(() => {
		window.scrollTo(0, 0)
	  }, []);	

	const slidesTiliaPlatyphyllos = [
		'/images/species/tilia_platyphyllos1.jpg',
		'/images/species/tilia_platyphyllos2.jpg',
	];

	const slidesPlatanusOrientalis = [
		'/images/species/platanus_orientalis1.jpg',
		'/images/species/platanus_orientalis2.jpg',
		'/images/species/platanus_orientalis3.jpg',
		'/images/species/platanus_orientalis4.jpg',
	];	

	const slidesAesculusHippocastanum = [
		'/images/species/aesculus_hippocastanum1.jpg',
		'/images/species/aesculus_hippocastanum2.jpg',		
	];	

	const slidesFraxinusExcelsior = [
		'/images/species/fraxinus_excelsior1.jpg',
		'/images/species/fraxinus_excelsior2.jpg',		
		'/images/species/fraxinus_excelsior3.jpg',		
	];	
	
	const slidesGleditsiaTriacanthos = [
		'/images/species/gleditsia_triacanthos1.jpg',
		'/images/species/gleditsia_triacanthos2.jpg',		
		'/images/species/gleditsia_triacanthos3.jpg',		
		'/images/species/gleditsia_triacanthos4.jpg',		
	];	
	
	const slidesAcerPlatanoides = [
		'/images/species/acer_platanoides1.jpg',
		'/images/species/acer_platanoides2.jpg',		
		'/images/species/acer_platanoides3.jpg',		
	];	

	const slidesCeltisAustralis = [
		'/images/species/celtis_australis1.jpg',
		'/images/species/celtis_australis2.jpg',		
		'/images/species/celtis_australis3.jpg',		
		'/images/species/celtis_australis4.jpg',		
	];	

	const slidesGinkgoBiloba = [
		'/images/species/ginkgo_biloba1.jpg',
		'/images/species/ginkgo_biloba2.jpg',		
	];	
	
	const slidesMagnoliaGrandiflora = [
		'/images/species/magnolia_grandiflora1.jpg',
		'/images/species/magnolia_grandiflora2.jpg',		
	];	

	const slidesPaulowniaTomentosa = [
		'/images/species/paulownia_tomentosa1.jpg',
		'/images/species/paulownia_tomentosa2.jpg',		
		'/images/species/paulownia_tomentosa3.jpg',		
		'/images/species/paulownia_tomentosa4.jpg',		
		'/images/species/paulownia_tomentosa5.jpg',		
		'/images/species/paulownia_tomentosa6.jpg',		
	];	
	
	const slidesPrunusSerrulata = [
		'/images/species/prunus_serrulata1.jpg',
		'/images/species/prunus_serrulata2.jpg',		
	];		

	const slidesCupressusSempervirens = [
		'/images/species/cupressus_sempervirens1.jpg',
		'/images/species/cupressus_sempervirens2.jpg',		
		'/images/species/cupressus_sempervirens3.jpg',
		'/images/species/cupressus_sempervirens4.jpg',
		'/images/species/cupressus_sempervirens5.jpg',
	];	
	
	const slidesPinusPinaster = [
		'/images/species/pinus_pinaster1.jpg',
		'/images/species/pinus_pinaster2.jpg',		
		'/images/species/pinus_pinaster3.jpg',
	];	
	
		
		
	

	return (
		<section className="content">
			<div className="contentTitle">
				<h1>НАЙ РАЗПРОСТРАНЕНИ ВИДОВЕ</h1>
			</div>

			<div className="center" style={{marginBottom: "4rem"}}>
				<h2>Едролистна липа - <i>Tilia platyphyllos</i></h2>
				<ImageSlider slides={slidesTiliaPlatyphyllos} indicators width={1200} lazy />	
			</div>
			
			<div className="center" style={{marginBottom: "4rem"}}>
				<h2>Източен чинар - Platanus orientalis</h2>
				<ImageSlider slides={slidesPlatanusOrientalis} indicators width={1200} lazy />	
			</div>

			<div className="center" style={{marginBottom: "4rem"}}>
				<h2>Обикновен конски кестен - Aesculus hippocastanum</h2>
				<ImageSlider slides={slidesAesculusHippocastanum} indicators width={1200} lazy />	
			</div>	

			<div className="center" style={{marginBottom: "4rem"}}>
				<h2>Планински ясен - Fraxinus excelsior</h2>
				<ImageSlider slides={slidesFraxinusExcelsior} indicators width={1200} lazy />	
			</div>		

			<div className="center" style={{marginBottom: "4rem"}}>
				<h2>Тришипна гледичия - Gleditsia triacanthos</h2>
				<ImageSlider slides={slidesGleditsiaTriacanthos} indicators width={1200} lazy />	
			</div>							

			<div className="center" style={{marginBottom: "4rem"}}>
				<h2>Шестил - Acer platanoides</h2>
				<ImageSlider slides={slidesAcerPlatanoides} indicators width={1200} lazy />	
			</div>			
			
			<div className="center" style={{marginBottom: "4rem"}}>
				<h2>Южна копривка - Celtis australis</h2>
				<ImageSlider slides={slidesCeltisAustralis} indicators width={1200} lazy />	
			</div>			
			
									

			
			<div className="contentTitle">
				<h1>СРЕДНО РАЗПРОСТРАНЕНИ ВИДОВЕ</h1>
			</div>

			<div className="center" style={{marginBottom: "4rem"}}>
				<h2>Двуделен гинко - Ginkgo biloba</h2>
				<ImageSlider slides={slidesGinkgoBiloba} indicators width={1200} lazy />	
			</div>

			<div className="center" style={{marginBottom: "4rem"}}>
				<h2>Едроцветна Магнолия - Magnolia grandiflora</h2>
				<ImageSlider slides={slidesMagnoliaGrandiflora} indicators width={1200} lazy />	
			</div>			

			<div className="center" style={{marginBottom: "4rem"}}>
				<h2>Пауловния - Paulownia tomentosa</h2>
				<ImageSlider slides={slidesPaulowniaTomentosa} indicators width={1200} lazy />	
			</div>	

			<div className="center" style={{marginBottom: "4rem"}}>
				<h2>Японска вишна - Prunus serrulata</h2>
				<ImageSlider slides={slidesPrunusSerrulata} indicators width={1200} lazy />	
			</div>				
			
		
			
			<div className="contentTitle">
				<h1>ВЕЧНОЗЕЛЕНИ ВИДОВЕ</h1>
			</div>	

			<div className="center" style={{marginBottom: "4rem"}}>
				<h2>Обикновен кипарис - Cupressus sempervirens</h2>
				<ImageSlider slides={slidesCupressusSempervirens} indicators width={1200} lazy />	
			</div>		

			<div className="center" style={{marginBottom: "4rem"}}>
				<h2>Морски бор - Pinus pinaster</h2>
				<ImageSlider slides={slidesPinusPinaster} indicators width={1200} lazy />	
			</div>							
					

		</section>
	);
};

export default CityTreePageTrees;

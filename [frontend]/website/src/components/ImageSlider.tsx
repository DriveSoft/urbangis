import { useState, useEffect } from "react";
import "./ImageSlider.css";


interface ImageSliderProps {
	slides: string[];    
    indicators?: boolean;
    width?: number;
    lazy?: boolean;
}

const ImageSlider = ({ slides, indicators = false, width=1000, lazy=false }: ImageSliderProps) => {
	const [currentSlide, setCurrentSlide] = useState(0);
    const [lazySlides, setLazySlides] = useState<string[] | undefined>(undefined);

    useEffect(() => {        
        if (lazy) {
            const imgLoading = require('./ImageSlider_loading.png');
            //const lazyImages: string[] = Array(slides.length).fill('/images/loading.png');
            const lazyImages: string[] = Array(slides.length).fill(imgLoading);            
            lazyImages[0] = slides[0]
            setLazySlides(lazyImages); 
        }          
    }, []);


    const prev = () => {
        const index = currentSlide > 0 ? currentSlide - 1 : slides.length - 1;  
        lazyDownload(index);      
        setCurrentSlide(index);
    }

    const next = () => {
        const index = currentSlide < slides.length - 1 ? currentSlide + 1 : 0;       
        lazyDownload(index); 
        setCurrentSlide(index);
    }    

    const switchIndex = (index: number) => {
        setCurrentSlide(index);    
        lazyDownload(index); 
    }

    function lazyDownload(index: number) {
        if (lazy && lazySlides) {
            const ar = [...lazySlides];
            ar[index] = slides[index];
            setLazySlides(ar);            
        }
    }

    function onTouchSlide(deltaX: number) {
        if (deltaX < -60) next();
        if (deltaX > 60) prev();
    }
    
    return (
		<div className="carousel" style={{maxWidth: width}}>
			<div 
                className="carousel-inner"
                style={{transform: `translateX(${-currentSlide * 100}%)`}}
            >

				{lazy && lazySlides && lazySlides.map((slide, index) => (
					<CarouselItem slide={slide} onTouchSlide={onTouchSlide} key={index} />
				))}

                {!lazy && slides.map((slide, index) => (
					<CarouselItem slide={slide} onTouchSlide={onTouchSlide} key={index} />
				))}                


			</div>
            {indicators && <CarouselIndicators slides={slides} currentIndex={currentSlide} switchIndex={switchIndex}/>}
            <CarouselControls prev={prev} next={next}/>
		</div>
	);
};



interface CarouselItemProp {
	slide: string;
    onTouchSlide: (deltaX: number) => void;
}
function CarouselItem({ slide, onTouchSlide }: CarouselItemProp) {
    let clientX: number;

    const touchstart = (e: any) => {
        clientX = e.touches[0].clientX;
    }
    
    const touchend = (e: any) => {
        const deltaX = e.changedTouches[0].clientX - clientX;
        onTouchSlide(deltaX);
        //console.log('deltaX', deltaX);
    }

    return (
        <div className="carousel-item">
            <img src={slide} style={{ width: "auto", maxHeight:"95vh"}} alt="" onTouchStart={touchstart} onTouchEnd={touchend} />;
        </div>
    
    );
}



interface CarouselControlsProps {
    prev: () => void;
    next: () => void;
}

function CarouselControls( {prev, next}: CarouselControlsProps ) {
  return (
    <div>
        <button className="carousel-control left" onClick={prev}>⟨</button>
        <button className="carousel-control right"onClick={next}>⟩</button>
    </div>
  )
}



interface CarouselIndicatorsProps {
    slides: string[];
    currentIndex: number;
    switchIndex: (index: number) => void;
}

function CarouselIndicators( {slides, currentIndex, switchIndex }: CarouselIndicatorsProps ) {
  return (
    <div className="carousel-indicators">
        {slides.map((_, index) => (
            <button key={index} className={`carousel-indicator-item ${currentIndex === index ? 'activeIndicator' : ''}`} onClick={() => switchIndex(index)}></button>    
        ))}
    </div>
  )
}



export default ImageSlider;

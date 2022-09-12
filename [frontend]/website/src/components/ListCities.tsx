import { useEffect, useState } from 'react';
import './ListCities.css';
import { CityItem } from '../types'


interface ListCitiesProps {
    cities: CityItem[] | undefined
}


const ListCities = ( { cities }: ListCitiesProps ) => {	

    const cityItem = (cities: CityItem[], city: CityItem, index: number, part: number) => {     
        if (part === 1 && index >= Math.floor(cities.length/2)) return undefined;
        if (part === 2 && index < Math.floor(cities.length/2)) return undefined;
                 
        return (
            <a className="buttonBadge" href={`/citytree/${city.sysname}/`} key={city.id} data-after-content={city.count_items}>{city.cityname}</a>
        ); 
    }

    return (
        <>                     
            <div className="cityBox">
                {cities?.map((city: CityItem, index: number) =>  
                    cityItem(cities, city, index, 1)                    
                )}            
            </div>

            <div className="cityBox">
                {cities?.map((city: CityItem, index: number) =>  
                    cityItem(cities, city, index, 2)                    
                )}            
            </div>            
        </>
    )
}

export default ListCities
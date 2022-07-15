export const filterDataMap = (feature: any, dataFilters: any, authToken: any): boolean => {
		
    const objectSearchResult = {
        species: true,
        status: true,
        recommendations: true,
        remarks: true,
        placetype: true,
        irrigationmethod: true,

        plantedDateFrom: true,
        plantedDateTo: true,
        addedDateFrom: true,
        addedDateTo: true,
        comment: true,

        heightFrom: true,
        heightTo: true,
        trunkGirthFrom: true,
        trunkGirthTo: true,
        crownDiameterFrom: true,
        crownDiameterTo: true,

        showOnlyMyTrees: true			
    }

    let valueFilter;

            
    valueFilter = dataFilters?.speciesFilter;
    if (Array.isArray(valueFilter)) {
        objectSearchResult.species = isFoundArrayInValue(valueFilter, feature.properties.species);			
    }

    valueFilter = dataFilters?.statusFilter;
    if (Array.isArray(valueFilter)) {
        objectSearchResult.status = isFoundArrayInValue(valueFilter, feature.properties.lastinsp_status);			
    }


    valueFilter = dataFilters?.careTypeFilter;
    if (Array.isArray(valueFilter)) {
        objectSearchResult.recommendations = isFoundArrayInArray(valueFilter, feature.properties.recommendations);
    }	
    
    valueFilter = dataFilters?.remarkFilter;
    if (Array.isArray(valueFilter)) {
        objectSearchResult.remarks = isFoundArrayInArray(valueFilter, feature.properties.remarks);
    }		



    valueFilter = dataFilters?.placeTypeFilter?.value;
    if (valueFilter) {
        objectSearchResult.placetype = valueFilter === feature.properties.placetype;
    }

    valueFilter = dataFilters?.irrigationMethodFilter?.value;
    if (valueFilter) {
        objectSearchResult.irrigationmethod = valueFilter === feature.properties.irrigationmethod;
    }	
    
    valueFilter = dataFilters?.datePlantedFromFilter;
    if (valueFilter) {
        objectSearchResult.plantedDateFrom =
            feature.properties.dateplanted >= valueFilter;
    }
    valueFilter = dataFilters?.datePlantedToFilter;
    if (valueFilter) {
        objectSearchResult.plantedDateTo =
            feature.properties.dateplanted <= valueFilter;
    }	
    
    valueFilter = dataFilters?.dateAddedFromFilter;
    if (valueFilter) {
        objectSearchResult.addedDateFrom =
            feature.properties.datetimeadded >= valueFilter;
    }
    valueFilter = dataFilters?.dateAddedToFilter;
    if (valueFilter) {
        objectSearchResult.addedDateTo =
            feature.properties.datetimeadded <= valueFilter;
    }	
    
    valueFilter = dataFilters?.commentFilter;
    if (valueFilter) {
        if (
            feature.properties.comment
                .toLowerCase()
                .indexOf(valueFilter.toLowerCase()) === -1
        ) {
            objectSearchResult.comment = false;
        }
    }		


    
    valueFilter = dataFilters?.heightFromFilter;
    if (valueFilter) {
        objectSearchResult.heightFrom = feature.properties.lastinsp_height >= valueFilter;
    }
    valueFilter = dataFilters?.heightToFilter;
    if (valueFilter) {
        objectSearchResult.heightTo = feature.properties.lastinsp_height <= valueFilter;
    }	
    
    valueFilter = dataFilters?.trunkGirthFromFilter;
    if (valueFilter) {
        objectSearchResult.trunkGirthFrom = feature.properties.lastinsp_trunkgirth >= valueFilter;
    }
    valueFilter = dataFilters?.trunkGirthToFilter;
    if (valueFilter) {
        objectSearchResult.trunkGirthTo = feature.properties.lastinsp_trunkgirth <= valueFilter;
    }	
    
    valueFilter = dataFilters?.crownDiameterFromFilter;
    if (valueFilter) {
        objectSearchResult.crownDiameterFrom = feature.properties.lastinsp_crowndiameter >= valueFilter;
    }
    valueFilter = dataFilters?.crownDiameterToFilter;
    if (valueFilter) {
        objectSearchResult.crownDiameterTo = feature.properties.lastinsp_crowndiameter <= valueFilter;
    }		



    valueFilter = dataFilters?.showMyTreesFilter;
    if (valueFilter && authToken?.user) {
        objectSearchResult.showOnlyMyTrees = authToken.user.id === feature.properties.useradded;	
    }


    let result = true;
    for (const el in objectSearchResult) {
        //@ts-ignore
        if (objectSearchResult[el] === false) {
            result = false;
            break;
        }			
    }
                 
    //rxDataTrees.dateTimeGenerated = Date.now(); // dateTimeGenerated is used like key parameter to update data on map, when it changed
    return result;
};

function isFoundArrayInValue(array: {value: number}[], value: number) {
    for (let el of array) {
        if (el.value === value) {
            return true;				
        }				
    }
    return false;
}

function isFoundArrayInArray(arraySearch: {value: number}[], arrayTree: string[]){
    const intersection = arraySearch.filter((x) => {
        return arrayTree.includes(String(x.value));
    });
    return intersection.length > 0;
}	
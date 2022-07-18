const initialState = {
    dataTrees: [],
    dataFilters: {},
    dictStatuses: [],
    dictSpecieses: [],
    dictCareTypes: [],
    dictRemarks: [], 
    dictPlaceTypes: [],
    dictIrrigationMethods: [], 
    dictGroupSpec: [],
    dictTypeSpec: [],
    dataLastEditedTreeId: {treeId: 0} 
}

const dataReducer = (state=initialState, action: {type: string; payload: any}) => {
    switch (action.type) {
        case 'DATATREES':
            return {
                ...state,
                dataTrees: action.payload
            }

        case 'DATALASTEDITEDTREEID':
            return {
                ...state,
                dataLastEditedTreeId: action.payload
            }
                        
        case 'DICTSTATUSES':
            return {
                ...state,
                dictStatuses: action.payload
            }

        case 'DICTSPECIESES':
            return {
                ...state,
                dictSpecieses: action.payload
            }      

        case 'DICTCARETYPES':
            return {
                ...state,
                dictCareTypes: action.payload
            }  

        case 'DICTREMARKS':
            return {
                ...state,
                dictRemarks: action.payload
            }  

        case 'DICTPLACETYPES':
            return {
                ...state,
                dictPlaceTypes: action.payload
            }    
            
        case 'DICTIRRIGATIONMETHODS':
            return {
                ...state,
                dictIrrigationMethods: action.payload
            }   
            
        case 'DICTGROUPSPECS':
            return {
                ...state,
                dictGroupSpec: action.payload
            }             
            
        case 'DICTTYPESPECS':
            return {
                ...state,
                dictTypeSpec: action.payload
            }             

        case 'DATAFILTERS':
            return {
                ...state,
                dataFilters: action.payload
            }


        default:
            return state            
    }
}




export default dataReducer
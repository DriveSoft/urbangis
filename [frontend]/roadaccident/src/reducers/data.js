const initialState = {
    dataAccidents: [],
    dataFilters: {},
    dictManeuvers: [],
    dictTypeViolations: [],
    dictViolators: [],
    minMaxDateData: {
        minDate: "",
        maxDate: ""
    }   
}

const dataReducer = (state=initialState, action) => {
    switch (action.type) {
        case 'DATAACCIDENTS':
            return {
                ...state,
                dataAccidents: action.payload
            }

        case 'DICTMANEUVERS':
            return {
                ...state,
                dictManeuvers: action.payload
            }

        case 'DICTTYPEVIOLATIONS':
            return {
                ...state,
                dictTypeViolations: action.payload
            }      

        case 'DICTVIOLATORS':
            return {
                ...state,
                dictViolators: action.payload
            }  

        case 'DATAFILTERS':
            return {
                ...state,
                dataFilters: action.payload
            }

        case 'MINMAXDATEDATA':
            return {
                ...state,
                minMaxDateData: action.payload
            }



        default:
            return state            
    }
}




export default dataReducer
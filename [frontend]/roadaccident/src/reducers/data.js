const initialState = {
    dictManeuvers: [],
    dictTypeViolations: []    
}

const dataReducer = (state=initialState, action) => {
    switch (action.type) {
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
            
        default:
            return state            
    }
}

export default dataReducer
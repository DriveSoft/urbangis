const initialState = {
    loginModalShow: false,
    registerModalShow: false
}

const uiReducer = (state=initialState, action) => {
    switch (action.type) {
        case 'LOGINMODALSHOW':
            return {
                ...state,
                loginModalShow: action.payload
            }

        case 'REGISTERMODALSHOW':
            return {
                ...state,
                registerModalShow: action.payload
            }    
        
        default:
            return state
    }
}

export default uiReducer
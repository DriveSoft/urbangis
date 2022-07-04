const initialState = {
    showSidebar: false,
    showTreeTab: false,
    showInspTab: false,
    activeTabKey: 'filter',
    loginModalShow: false,
    registerModalShow: false,

    mapBaseLayerName: 'Default',
    newMarkerState: {
		visible: false,
		position: {},
		isMobile: false
	},
    showOkCancelMobileMarker: false,
    checkButtonNewMarker: false,
    checkButtonHeatmap: false,
    checkButtonGPS: false,

    isMobileDevice: false
}

const uiReducer = (state=initialState, action: {type: string; payload: any}) => {
    switch (action.type) {
        case 'SHOWSIDEBAR':
            return {
                ...state,
                showSidebar: action.payload
            }
        case 'SHOWTREETAB':
            return {
                ...state,
                showTreeTab: action.payload
            }   
        case 'SHOWINSPTAB':
            return {
                ...state,
                showInspTab: action.payload
            }                      
        case 'ACTIVETABKEY':
            return {
                ...state,
                activeTabKey: action.payload
            }                                              
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
        


        case 'MAPBASELAYERNAME':
            return {
                ...state,
                mapBaseLayerName: action.payload
            } 
            
        case 'NEWMARKERSTATE':
            return {
                ...state,
                newMarkerState: action.payload
            } 

        case 'SHOWOKCANCELMOBILEMARKER':
            return {
                ...state,
                showOkCancelMobileMarker: action.payload
            }              
        
        case 'CHECKBUTTONNEWMARKER':
            return {
                ...state,
                checkButtonNewMarker: action.payload
            }
        case 'CHECKBUTTONHEATMAP':
            return {
                ...state,
                checkButtonHeatmap: action.payload
            }            
        case 'CHECKBUTTONGPS':
            return {
                ...state,
                checkButtonGPS: action.payload
            }            
                        


        case 'ISMOBILEDEVICE':
            return {
                ...state,
                isMobileDevice: action.payload
            }


        default:
            return state
    }
}

export default uiReducer
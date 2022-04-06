// userInterface actions ================================================
export const actShowSidebar = (value) => {
    return {
        type: 'SHOWSIDEBAR',
        payload: value
    }
}

export const actShowAccidentTab = (value) => {
    return {
        type: 'SHOWACCIDENTTAB',
        payload: value
    }
}

export const actActiveTabKey = (value) => {
    return {
        type: 'ACTIVETABKEY',
        payload: value
    }
}

export const actLoginModalShow = (value) => {
    return {
        type: 'LOGINMODALSHOW',
        payload: value
    }
}

export const actRegisterModalShow = (value) => {
    return {
        type: 'REGISTERMODALSHOW',
        payload: value
    }
}




export const actMapBaseLayerName = (value) => {
    return {
        type: 'MAPBASELAYERNAME',
        payload: value
    }
}

export const actNewMarkerState = (value) => {
    return {
        type: 'NEWMARKERSTATE',
        payload: value
    }
}

export const actShowOkCancelMobileMarker = (value) => {
    return {
        type: 'SHOWOKCANCELMOBILEMARKER',
        payload: value
    }
}

export const actCheckButtonNewMarker = (value) => {
    return {
        type: 'CHECKBUTTONNEWMARKER',
        payload: value
    }
}
export const actCheckButtonHeatmap = (value) => {
    return {
        type: 'CHECKBUTTONHEATMAP',
        payload: value
    }
}
export const actCheckButtonGPS = (value) => {
    return {
        type: 'CHECKBUTTONGPS',
        payload: value
    }
}




export const actIsMobileDevice = (value) => {
    return {
        type: 'ISMOBILEDEVICE',
        payload: value
    }
}






// date actions ================================================
export const actDataAccidents= (value) => {
    return {
        type: 'DATAACCIDENTS',
        payload: value
    }
}

export const actDictManeuvers = (value) => {
    return {
        type: 'DICTMANEUVERS',
        payload: value
    }
}

export const actDictTypeViolations = (value) => {
    return {
        type: 'DICTTYPEVIOLATIONS',
        payload: value
    }
}

export const actDictViolators = (value) => {
    return {
        type: 'DICTVIOLATORS',
        payload: value
    }
}

export const actDataFilters = (value) => {
    return {
        type: 'DATAFILTERS',
        payload: value
    }
}

export const actMinMaxDateData = (value) => {
    return {
        type: 'MINMAXDATEDATA',
        payload: value
    }
}

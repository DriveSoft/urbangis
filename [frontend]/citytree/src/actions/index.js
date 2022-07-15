// userInterface actions ================================================
export const actNewTreeCreation= (value) => {
    return {
        type: 'NEWTREECREATION',
        payload: value
    }
}

export const actShowSidebar = (value) => {
    return {
        type: 'SHOWSIDEBAR',
        payload: value
    }
}

export const actShowTreeTab = (value) => {
    return {
        type: 'SHOWTREETAB',
        payload: value
    }
}

export const actShowInspTab = (value) => {
    return {
        type: 'SHOWINSPTAB',
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

export const actMapMarkerState = (value) => {
    return {
        type: 'MAPMARKERSTATE',
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
export const actDataTrees= (value) => {
    return {
        type: 'DATATREES',
        payload: value
    }
}

export const actDictStatuses = (value) => {
    return {
        type: 'DICTSTATUSES',
        payload: value
    }
}

export const actDictSpecieses = (value) => {
    return {
        type: 'DICTSPECIESES',
        payload: value
    }
}


export const actDictCareTypes = (value) => {
    return {
        type: 'DICTCARETYPES',
        payload: value
    }
}

export const actDictRemarks = (value) => {
    return {
        type: 'DICTREMARKS',
        payload: value
    }
}

export const actDictPlaceTypes = (value) => {
    return {
        type: 'DICTPLACETYPES',
        payload: value
    }
}

export const actDictIrrigationMethods = (value) => {
    return {
        type: 'DICTIRRIGATIONMETHODS',
        payload: value
    }
}

export const actDictGroupSpecs = (value) => {
    return {
        type: 'DICTGROUPSPECS',
        payload: value
    }
}

export const actDictTypeSpecs = (value) => {
    return {
        type: 'DICTTYPESPECS',
        payload: value
    }
}




export const actDataFilters = (value) => {
    return {
        type: 'DATAFILTERS',
        payload: value
    }
}



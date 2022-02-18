import { useState } from 'react'
import SidebarTabs from './SidebarTabs';

const Sidebar = ({
                    onSubmitFilter, 
                    
                    onSubmitAccident, 
                    onDeleteAccident, 
                    onCloseAccident,
                    
                    minMaxDateData, 
                    dataAccidentForm,

                    showAccidentTab, 
                    activeTabKey, 
                    setActiveTabKey, 
                    newMarkerState, 
                    dictManeuvers, 
                    dictTypeViolations, 
                    dictViolators,
                    currentCity
                }) => {

    

    return (
        <div className="bg-light border-right" id="sidebar-wrapper">
            <div className="list-group list-group-flush" style={{marginTop: '15px'}}>

                <SidebarTabs 
                    onSubmitFilter={onSubmitFilter} 
                    
                    onSubmitAccident={onSubmitAccident}
                    onDeleteAccident={onDeleteAccident}
                    onCloseAccident={onCloseAccident}

                    minMaxDateData={minMaxDateData} 
                    dataAccidentForm={dataAccidentForm}
                    
                    showAccidentTab={showAccidentTab} 
                    activeTabKey={activeTabKey}
                    setActiveTabKey={setActiveTabKey}
                    newMarkerState={newMarkerState}

                    dictManeuvers={dictManeuvers} 
                    dictTypeViolations={dictTypeViolations} 
                    dictViolators={dictViolators} 
                    currentCity={currentCity}
                />

            </div>            
        </div>
    )
}

export default Sidebar

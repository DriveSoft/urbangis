import { useState } from 'react'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import FormFilter from './FormFilter'
import FormAccident from './FormAccident'

const SidebarTabs = ({
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
    const [key, setKey] = useState('filter')    
    
    return (
        <Tabs
        	id="controlled-tab-example"
          	activeKey={activeTabKey}
			onSelect={(k) => setActiveTabKey(k)}
          	//onSelect={(k) => setKey(k)}
          	className="mb-3"
		>

        	<Tab eventKey="filter" title="Търсене">
				<div style={{overflowY: 'auto', overflowX: 'hidden', width: '100%', height: 'calc(100vh - 130px)'}}>
					<FormFilter 
						onSubmitFilter={onSubmitFilter} 
						minMaxDateData={minMaxDateData} 
						dictManeuvers={dictManeuvers} 
						dictTypeViolations={dictTypeViolations} 
						dictViolators={dictViolators} 
					/>
				</div>
          	</Tab>

          	<Tab eventKey="accident" title="ПТП" tabClassName={!showAccidentTab ? 'd-none' : ''}>
			  	<div style={{overflowY: 'auto', overflowX: 'hidden', width: '100%', height: 'calc(100vh - 130px)'}}>
					<FormAccident 
						onSubmitAccident={onSubmitAccident}
						onDeleteAccident={onDeleteAccident}
						onCloseAccident={onCloseAccident}
						newMarkerState={newMarkerState}
						dictManeuvers={dictManeuvers}
						dictTypeViolations={dictTypeViolations}
						dictViolators={dictViolators} 
						dataAccidentForm={dataAccidentForm}
						currentCity={currentCity}
					/>
				</div>
          	</Tab>
          


        </Tabs>
      );
}

export default SidebarTabs
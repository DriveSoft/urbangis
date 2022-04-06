import { useState } from 'react'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import FormFilter from './FormFilter'
import FormAccident from './FormAccident'
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux'
import { actActiveTabKey } from '../actions'


const SidebarTabs = ({
						onSubmitFilter, 

						onSubmitAccident, 
						onDeleteAccident, 
						onCloseAccident,						

						minMaxDateData, 
						dataAccidentForm,

						//showAccidentTab, 
						//activeTabKey, 
						//setActiveTabKey, 
						newMarkerState, 
						
						//dictManeuvers, 
						//dictTypeViolations, 
						//dictViolators,
						currentCity
									
					}) => {
	const rxShowAccidentTab = useSelector(state => state.uiReducer.showAccidentTab)
	const rxActiveTabKey = useSelector(state => state.uiReducer.activeTabKey)

    const [key, setKey] = useState('filter')    
	const { t } = useTranslation()

	const dispath = useDispatch()

    return (

        <Tabs
        	id="controlled-tab-example"
          	activeKey={rxActiveTabKey}
			onSelect={(k) => dispath(actActiveTabKey(k)) /*setActiveTabKey(k)*/}
          	//onSelect={(k) => setKey(k)}
          	className="mb-3"
		>

        	<Tab eventKey="filter" title={t('sidebar.filterTab.title')}>
				<div style={{overflowY: 'auto', overflowX: 'hidden', width: '100%', height: 'calc(100vh - 130px)'}}>
					<FormFilter 
						onSubmitFilter={onSubmitFilter} 
						minMaxDateData={minMaxDateData} 
						//dictManeuvers={dictManeuvers} 
						//dictTypeViolations={dictTypeViolations} 
						//dictViolators={dictViolators} 
					/>
				</div>
          	</Tab>

          	<Tab eventKey="accident" title={t('sidebar.accidentTab.title')} tabClassName={!rxShowAccidentTab ? 'd-none' : ''}>
			  	<div style={{overflowY: 'auto', overflowX: 'hidden', width: '100%', height: 'calc(100vh - 130px)'}}>
					<FormAccident 
						onSubmitAccident={onSubmitAccident}
						onDeleteAccident={onDeleteAccident}
						onCloseAccident={onCloseAccident}
						//newMarkerState={rxNewMarkerState}
						//dictManeuvers={dictManeuvers}
						//dictTypeViolations={dictTypeViolations}
						//dictViolators={dictViolators} 
						dataAccidentForm={dataAccidentForm}
						currentCity={currentCity}
					/>
				</div>
          	</Tab>
          


        </Tabs>
		
      );
}

export default SidebarTabs

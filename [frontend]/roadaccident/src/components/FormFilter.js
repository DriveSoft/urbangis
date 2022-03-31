import { useState, useEffect } from 'react'
import { useForm, Controller  } from 'react-hook-form'
import { Form, Button, Card, Row, Col, } from 'react-bootstrap';
import Select from "react-select";
import { useTranslation } from 'react-i18next';

//export const DictionariesContext = createContext({})


function FormFilter( {onSubmitFilter, minMaxDateData, dictManeuvers, dictTypeViolations, dictViolators} ) {

    const { t, i18n } = useTranslation()

    // used to set default values for dates control, because when it renders first time, minMaxDateData is still empty, after that I just can't change def values, so do it manually 
    useEffect(() => {
        setDefaultsForDates()
    }, [minMaxDateData])


    function setDefaultsForDates(){
        setValue('dateFromFilter', minMaxDateData.minDate)
        setValue('dateToFilter', minMaxDateData.maxDate)
    }

 
    const { control, handleSubmit, reset, setValue } = useForm({
        reValidateMode: 'onChange',
        defaultValues: {
            dateFromFilter: '',
            dateToFilter: '',
            descFilter: '',
            maneuverFilter: '',
            violationsTypeFilter: '',
            violatorsFilter: '',

            driverViolationFilter:  false,
            motorcyclistViolationFilter:  false,
            cyclistViolationFilter:  false,
            pedestrianViolationFilter:  false,
            kidsInjuredFilter:  false,
            pubtrPassengersInjuredFilter: false,
            
            driversKilledFilter: false,
            motorcyclistsKilledFilter: false,
            cyclistsKilledFilter: false,
            pedestrianKilledFilter: false,
            kidsKilledFilter: false,
            pubtrPassengersKilledFilter: false,

            publicTransportInvolvedFilter: false,
            showOnlyMyAccidentsFilter: false,

          select: {}
        }
      });    

      


      //let optionsManeuverFilter = []
      //let arManeuvers = dictsContex?.dictManeuvers
      //if (Array.isArray(arManeuvers)) {
      //  optionsManeuverFilter = arManeuvers.map((x) => { return {value: x.id, label: x.maneuvername} })  
      //}

      //let optionsTypeViolationsFilter = []
      //let arTypeViolations = dictsContex?.dictTypeViolations
      //if (Array.isArray(arTypeViolations)) {
      //    optionsTypeViolationsFilter = arTypeViolations.map((x) => { return {value: x.id, label: x.violationname} })  
      //}     
        
      //let optionsViolatorsFilter = []
      //let arViolators = dictsContex?.dictViolators
      //if (Array.isArray(arViolators)) {
      //    optionsViolatorsFilter = arViolators.map((x) => { return {value: x.id, label: x.violatorname} })  
      //}         

      
    let optionsManeuverFilter = []
    if (Array.isArray(dictManeuvers)) {
        optionsManeuverFilter = dictManeuvers.map((x) => { return {value: x.id, label: t(`sidebar.filterTab.maneuversList.${x.maneuvername}`)} }) 
         
    }

    let optionsTypeViolationsFilter = []
    if (Array.isArray(dictTypeViolations)) {
        optionsTypeViolationsFilter = dictTypeViolations.map((x) => { return {value: x.id, label: t(`sidebar.filterTab.typeViolationsList.${x.violationname}`)} })  
    }
    
    let optionsViolatorsFilter = []
    if (Array.isArray(dictViolators)) {
        optionsViolatorsFilter = dictViolators.map((x) => { return {value: x.id, label: t(`sidebar.filterTab.violatorsList.${x.violatorname}`)} })  
    }    

      
     
    
    
    function onResetButton(e) {
        reset()
        setDefaultsForDates()
        onSubmitFilter({})
    }     
    


    return (
        <div>
            <Form className="m-1" onSubmit={handleSubmit(onSubmitFilter)}> 

                <Row >
                    <Form.Group as={Col} controlId="formDateFromFilter">
                        <Form.Label>{t('sidebar.filterTab.from')}</Form.Label>
                        <Controller
                            name="dateFromFilter"
                            control={control}
                            render={({ field }) => <Form.Control type="date" {...field} />}
                        />
                    </Form.Group>

                    <Form.Group as={Col} controlId="formDateToFilter">
                        <Form.Label>{t('sidebar.filterTab.to')}</Form.Label>
                        <Controller
                            name="dateToFilter"
                            control={control}
                            render={({ field }) => <Form.Control type="date" {...field} />}
                        />
                    </Form.Group>
                </Row>



                <Row className="mt-3">
                    <Form.Group as={Col} controlId="formManeuverFilter" style={{minWidth: '250px'}}>
                        <Form.Label>{t('sidebar.filterTab.vehicleManeuver')}</Form.Label>
                        <Controller
                            name="maneuverFilter"
                            control={control}
                            render={({ field }) => <Select {...field} isClearable isSearchable={false} options={optionsManeuverFilter} />}
                        />
                    </Form.Group>

                    <Form.Group as={Col} controlId="formDescFilter">
                        <Form.Label>{t('sidebar.filterTab.description')}</Form.Label>
                        <Controller
                            name="descFilter"
                            control={control}
                            render={({ field }) => <Form.Control type="text" {...field} />}
                        />
                    </Form.Group>                    
                </Row>                



                <Form.Group controlId="formViolationsTypeFilter" className="mt-3">
                    <Form.Label>{t('sidebar.filterTab.violationsType')}</Form.Label>
                    <Controller
                        name="violationsTypeFilter"
                        control={control}
                        render={({ field }) => <Select {...field} isMulti isSearchable={false} options={optionsTypeViolationsFilter} />}
                    />
                </Form.Group>


                <Form.Group controlId="formviolatorsFilter" className="mt-3">
                    <Form.Label>{t('sidebar.filterTab.violators')}</Form.Label>
                    <Controller
                        name="violatorsFilter"
                        control={control}
                        render={({ field }) => <Select {...field} isMulti isSearchable={false} options={optionsViolatorsFilter} />}
                    />
                </Form.Group>      



                <Card body className="mt-3">
                    <Card.Title><h6>{t('sidebar.filterTab.injured')}</h6></Card.Title>
                    
                        <Controller
                            name="driverInjuredFilter"
                            control={control}
                            render={({ field }) => 
                                <Form.Check {...field} checked={field['value'] ?? false} inline label={t('sidebar.filterTab.driver')} type="checkbox" id="idDriverInjuredFilter"/>
                            }
                        />        

                        <Controller
                            name="motorcyclistInjuredFilter"
                            control={control}
                            render={({ field }) => 
                                <Form.Check {...field} checked={field['value'] ?? false} inline label={t('sidebar.filterTab.motorcyclist')} type="checkbox" id="idMotorcyclistInjuredFilter"/>
                            }
                        />                                         

                        <Controller
                            name="cyclistInjuredFilter"
                            control={control}
                            render={({ field }) => 
                                <Form.Check {...field} checked={field['value'] ?? false} inline label={t('sidebar.filterTab.cyclist')} type="checkbox" id="idCyclistInjuredFilter"/>
                            }
                        /> 

                        <Controller
                            name="pedestrianInjuredFilter"
                            control={control}
                            render={({ field }) => 
                                <Form.Check {...field} checked={field['value'] ?? false} inline label={t('sidebar.filterTab.pedestrian')} type="checkbox" id="idPedestrianInjuredFilter"/>
                            }
                        /> 

                        <Controller
                            name="kidsInjuredFilter"
                            control={control}
                            render={({ field }) => 
                                <Form.Check {...field} checked={field['value'] ?? false} inline label={t('sidebar.filterTab.kid')} type="checkbox" id="idKidsInjuredFilter"/>
                            }
                        /> 
     
                        <Controller
                            name="pubtrPassengersInjuredFilter"
                            control={control}
                            render={({ field }) => 
                                <Form.Check {...field} checked={field['value'] ?? false} inline label={t('sidebar.filterTab.pubtrPassenger')} type="checkbox" id="idPubtrPassengersInjuredFilter"/>
                            }
                        />                         
                </Card>          



                <Card body className="mt-3">
                    <Card.Title><h6>{t('sidebar.filterTab.killed')}</h6></Card.Title>
                    
                        <Controller
                            name="driversKilledFilter"
                            control={control}
                            render={({ field }) => 
                                <Form.Check {...field} checked={field['value'] ?? false} inline label={t('sidebar.filterTab.driver')} type="checkbox" id="idDriversKilledFilter"/>
                            }
                        />        

                        <Controller
                            name="motorcyclistsKilledFilter"
                            control={control}
                            render={({ field }) => 
                                <Form.Check {...field} checked={field['value'] ?? false} inline label={t('sidebar.filterTab.motorcyclist')} type="checkbox" id="idMotorcyclistsKilledFilter"/>
                            }
                        />                                         

                        <Controller
                            name="cyclistsKilledFilter"
                            control={control}
                            render={({ field }) => 
                                <Form.Check {...field} checked={field['value'] ?? false} inline label={t('sidebar.filterTab.cyclist')} type="checkbox" id="idCyclistsKilledFilter"/>
                            }
                        /> 

                        <Controller
                            name="pedestrianKilledFilter"
                            control={control}
                            render={({ field }) => 
                                <Form.Check {...field} checked={field['value'] ?? false} inline label={t('sidebar.filterTab.pedestrian')} type="checkbox" id="idPedestrianKilledFilter"/>
                            }
                        /> 

                        <Controller
                            name="kidsKilledFilter"
                            control={control}
                            render={({ field }) => 
                                <Form.Check {...field} checked={field['value'] ?? false} inline label={t('sidebar.filterTab.kid')} type="checkbox" id="idKidsKilledFilter"/>
                            }
                        /> 
     
                        <Controller
                            name="pubtrPassengersKilledFilter"
                            control={control}
                            render={({ field }) => 
                                <Form.Check {...field} checked={field['value'] ?? false} inline label={t('sidebar.filterTab.pubtrPassenger')} type="checkbox" id="idPubtrPassengersKilledFilter"/>
                            }
                        />                         
                </Card> 


                <Form.Group controlId="formPublicTransportInvolvedFilter" className="mt-3 ms-1">
                    <Controller
                                name="publicTransportInvolvedFilter"
                                control={control}
                                render={({ field }) => 
                                    <Form.Check {...field} checked={field['value'] ?? false} inline label={t('sidebar.filterTab.publicTransportInvolved')} type="checkbox" id="idPublicTransportInvolvedFilter"/>
                                }
                    /> 
                </Form.Group>

                <Form.Group controlId="formShowOnlyMyAccidentsFilter" className="mt-3 ms-1">
                    <Controller
                                name="showOnlyMyAccidentsFilter"
                                control={control}
                                render={({ field }) => 
                                    <Form.Check {...field} checked={field['value'] ?? false} inline label={t('sidebar.filterTab.showOnlyMyAccidents')} type="checkbox" id="idShowOnlyMyAccidentsFilter"/>
                                }
                    /> 
                </Form.Group>


                <div className="mt-4 me-2 float-end">
                    <Button variant="light" onClick={onResetButton}>{t('sidebar.filterTab.clear')}</Button>{' '}
                    <Button type="submit" variant="primary" style={{ minWidth: '150px' }}>{t('sidebar.filterTab.search')}</Button>{' '}
                </div>

            </Form> 
        </div>
    )
}

export default FormFilter

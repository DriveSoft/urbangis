import { useState, useEffect, useRef } from 'react'
import { useForm, Controller  } from 'react-hook-form'
import { Form, Button, Card, Row, Col, Modal} from 'react-bootstrap';
import Select from "react-select";
import "@fortawesome/fontawesome-free/css/all.min.css"

import Datetime from 'react-datetime'
import "react-datetime/css/react-datetime.css"

import moment from 'moment';


function FormAccident( {newMarkerState, onSubmitAccident, onDeleteAccident, onCloseAccident, dictManeuvers, dictTypeViolations, dataAccidentForm, dictViolators, currentCity} ) {
    
    const [showModalDelete, setShowModalDelete] = useState(false);
    const dateTimeRef = useRef(null)

    //const handleShowModalDeleteClose = () => setShowModalDelete(false);


    useEffect(() => {
        if (newMarkerState.visible) {
            reset()
                    
            // perhaps a bug of component, value is not reset, so reset it manually
            dateTimeRef.current.state.inputValue = ''
            dateTimeRef.current.state.selectedDate = undefined
                        
            setValue('latAccidentForm', newMarkerState.position.lat) 
            setValue('lngAccidentForm', newMarkerState.position.lng)             
        }
    }, [newMarkerState])


    useEffect(() => {
        let formData = {}

        formData.accidentId = dataAccidentForm?.properties?.id
        formData.latAccidentForm = dataAccidentForm?.properties?.latitude
        formData.lngAccidentForm = dataAccidentForm?.properties?.longitude
        formData.descAccidentForm = dataAccidentForm?.properties?.description
        
        if (dataAccidentForm?.properties?.datetime) {
            formData.dateTimeAccidentForm = moment(dataAccidentForm?.properties?.datetime)
        }
        
        let maneuver = dataAccidentForm?.properties?.maneuver
        if (maneuver) {
            formData.maneuverAccidentForm = optionsManeuverFilter.find((item) => item.value === maneuver)           
        }

        let violations_type = dataAccidentForm?.properties?.violations_type
        if (violations_type) {
            violations_type = violations_type.map(item => parseInt(item))            
            formData.violationsTypeAccidentForm = optionsTypeViolationsFilter.filter(item => violations_type.includes(item.value))          
        }        
        
        let violators = dataAccidentForm?.properties?.violators
        if (violators) {
            violators = violators.map(item => parseInt(item))            
            formData.violatorsAccidentForm = optionsViolatorsFilter.filter(item => violators.includes(item.value))          
        }          

        
        formData.driversInjuredAccidentForm = dataAccidentForm?.properties?.drivers_injured
        formData.motorcyclistsInjuredAccidentForm = dataAccidentForm?.properties?.motorcyclists_injured
        formData.cyclistsInjuredAccidentForm = dataAccidentForm?.properties?.cyclists_injured
        formData.pedInjuredAccidentForm = dataAccidentForm?.properties?.ped_injured
        formData.kidsInjuredAccidentForm = dataAccidentForm?.properties?.kids_injured
        formData.pubtrPassengersInjuredAccidentForm = dataAccidentForm?.properties?.pubtr_passengers_injured
        
        formData.driversKilledAccidentForm = dataAccidentForm?.properties?.drivers_killed
        formData.motorcyclistsKilledAccidentForm = dataAccidentForm?.properties?.motorcyclists_killed
        formData.cyclistsKilledAccidentForm = dataAccidentForm?.properties?.cyclists_killed
        formData.pedKilledAccidentForm = dataAccidentForm?.properties?.ped_killed
        formData.kidsKilledAccidentForm = dataAccidentForm?.properties?.kids_killed
        formData.pubtrPassengersKilledAccidentForm = dataAccidentForm?.properties?.pubtr_passengers_killed

        formData.publicTransportInvolvedAccidentForm = dataAccidentForm?.properties?.public_transport_involved



        //formData.violationsTypeAccidentForm = [{value: 1, label: 'Преминаване на червено'}, {value: 3, label: 'Самокатастрофирал'}]


        //setValue("violationsTypeAccidentForm",[{value: 1, label: 'Преминаване на червено'}, {value: 3, label: 'Самокатастрофирал'}]);

        //formData.violationsTypeAccidentForm = 
        
        //console.log('optionsTypeViolationsFilter', optionsTypeViolationsFilter)
        //console.log('violations_type', violations_type)
        


        //console.log('dictManeuvers', dictManeuvers)
        //setValue("maneuverAccidentForm", {value: 2, label: 'При завой надясно'}, { shouldValidate: true });
        //setValue("maneuverAccidentForm",[{value: 'optionA', label:'Option A'}]);

  
        reset(formData, {keepDefaultValues: true} )
    }, [dataAccidentForm])    
        




    let optionsManeuverFilter = []
    if (Array.isArray(dictManeuvers)) {
        optionsManeuverFilter = dictManeuvers.map((x) => { return {value: x.id, label: x.maneuvername} })  
    }
  
    let optionsTypeViolationsFilter = []
    if (Array.isArray(dictTypeViolations)) {
        optionsTypeViolationsFilter = dictTypeViolations.map((x) => { return {value: x.id, label: x.violationname} })  
    }
      
    let optionsViolatorsFilter = []
    if (Array.isArray(dictViolators)) {
        optionsViolatorsFilter = dictViolators.map((x) => { return {value: x.id, label: x.violatorname} })  
    }      


    

    const { control, handleSubmit, reset, setValue, getValues, formState: { errors }  } = useForm({
        //reValidateMode: 'onChange',
        defaultValues: {
            latAccidentForm: '',
            lngAccidentForm: '',
            descAccidentForm: '',
            dateTimeAccidentForm: '',
            maneuverAccidentForm: null, 
            violationsTypeAccidentForm: [],
            violatorsAccidentForm: [],

            driversInjuredAccidentForm: 0,
            motorcyclistsInjuredAccidentForm: 0,
            cyclistsInjuredAccidentForm: 0,
            pedInjuredAccidentForm: 0,
            kidsInjuredAccidentForm: 0,
            pubtrPassengersInjuredAccidentForm: 0,
            
            driversKilledAccidentForm: 0,
            motorcyclistsKilledAccidentForm: 0,
            cyclistsKilledAccidentForm: 0, 
            pedKilledAccidentForm: 0, 
            kidsKilledAccidentForm: 0,
            pubtrPassengersKilledAccidentForm: 0,
            
            publicTransportInvolvedAccidentForm: false,
              
            accidentId: ''
        }
    }); 



    function prepareOnSubmitAccident (data) {
        let dataRest = {}

        
        dataRest.id = parseInt(getValues("accidentId")) || null
        //dataRest.city = currentCity
        dataRest.latitude = getValues("latAccidentForm")
        dataRest.longitude = getValues("lngAccidentForm")
        dataRest.datetime = getValues("dateTimeAccidentForm").format('YYYY-MM-DDTHH:mm')
        
        dataRest.maneuver = getValues("maneuverAccidentForm")?.value   
        if (dataRest.maneuver === undefined) { dataRest.maneuver = null }
        
        dataRest.description = getValues("descAccidentForm")        
        dataRest.violations_type = getValues("violationsTypeAccidentForm").map((item) => item.value)
        dataRest.violators = getValues("violatorsAccidentForm").map((item) => item.value)
        
        dataRest.drivers_injured = parseInt(getValues("driversInjuredAccidentForm")) || 0
        dataRest.motorcyclists_injured = parseInt(getValues("motorcyclistsInjuredAccidentForm")) || 0
        dataRest.cyclists_injured = parseInt(getValues("cyclistsInjuredAccidentForm")) || 0
        dataRest.ped_injured = parseInt(getValues("pedInjuredAccidentForm")) || 0
        dataRest.kids_injured = parseInt(getValues("kidsInjuredAccidentForm")) || 0
        dataRest.pubtr_passengers_injured = parseInt(getValues("pubtrPassengersInjuredAccidentForm")) || 0
        
        dataRest.drivers_killed = parseInt(getValues("driversKilledAccidentForm")) || 0
        dataRest.motorcyclists_killed = parseInt(getValues("motorcyclistsKilledAccidentForm")) || 0
        dataRest.cyclists_killed = parseInt(getValues("cyclistsKilledAccidentForm")) || 0
        dataRest.ped_killed = parseInt(getValues("pedKilledAccidentForm")) || 0
        dataRest.kids_killed = parseInt(getValues("kidsKilledAccidentForm")) || 0
        dataRest.pubtr_passengers_killed = parseInt(getValues("pubtrPassengersKilledAccidentForm")) || 0
        
        dataRest.public_transport_involved = getValues("publicTransportInvolvedAccidentForm")

        onSubmitAccident(dataRest)    
    }

    return (
        <div>
            <Form className="m-1" onSubmit={handleSubmit(prepareOnSubmitAccident)}>

                <Row>
                    <Form.Group as={Col} controlId="formDateFromFilter">
                        <Form.Label>Lat/Lng <a href="#"><i className="fas fa-edit align-middle"></i></a></Form.Label>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formLatAccident">
                        <Controller
                            name="latAccidentForm"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => <Form.Control type="number" step="any" size="sm" isInvalid={!!errors.latAccidentForm} {...field} />}
                        />

                        <Form.Control.Feedback type="invalid">
                            Required field
                        </Form.Control.Feedback>                          
                    </Form.Group>

                    <Form.Group as={Col} controlId="formLngAccident">
                        <Controller
                            name="lngAccidentForm"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => <Form.Control type="number" step="any" size="sm" isInvalid={!!errors.lngAccidentForm} {...field} />}
                        />
                        <Form.Control.Feedback type="invalid">
                            Required field
                        </Form.Control.Feedback>                        
                    </Form.Group>                    
                </Row>


                <Form.Group controlId="formDescriptionAccident" className="mt-3">
                    <Form.Label>Описание</Form.Label>
                    <Controller
                        name="descAccidentForm"
                        control={control}
                        render={({ field }) => <Form.Control type="text" as="textarea" rows={3}  {...field} />}
                    />
                </Form.Group>


                <Row className="mt-3">
                    <Form.Group as={Col} controlId="formDateTimeAccident">
                        <Form.Label>Дата и час</Form.Label>
                        <Controller
                            name="dateTimeAccidentForm"
                            control={control}
                            rules={{ required: true }}
                            
                            render={({ field }) => <Datetime {...field} ref={dateTimeRef} />}
                        />
                        { errors.dateTimeAccidentForm ? 
                            <p style={{color: "red"}}><small>Required field</small></p> 
                            : ''                            
                        }   
                      
                    </Form.Group>

                    <Form.Group as={Col} controlId="formManeuverAccident">
                        <Form.Label>Маньовър на МПС</Form.Label>
                        <Controller
                            name="maneuverAccidentForm"
                            control={control}
                            render={({ field }) => <Select {...field} isClearable options={optionsManeuverFilter} />}
                        />
                    </Form.Group>                    
                </Row> 



                <Form.Group controlId="formViolationsTypeAccident" className="mt-3">
                    <Form.Label>Вид на нарушение</Form.Label>
                    <Controller
                        name="violationsTypeAccidentForm"
                        control={control}
                        render={({ field }) => <Select {...field} isMulti options={optionsTypeViolationsFilter} />}
                    />
                </Form.Group>


                <Form.Group controlId="formViolatorsAccident" className="mt-3">
                    <Form.Label>Нарушители</Form.Label>
                    <Controller
                        name="violatorsAccidentForm"
                        control={control}
                        render={({ field }) => <Select {...field} isMulti options={optionsViolatorsFilter} />}
                    />
                </Form.Group>                




                <Row className="mt-3">
                    <Form.Group as={Col} controlId="formInjuredLabelAccident"> 
                        <Form.Label style={{marginTop: "32px"}}>Постр:</Form.Label>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formDriversInjuredAccident" className="ps-1 pe-0">
                        <Form.Label><i className="fas fa-car fa-lg" title="Шофьор и пътници"></i></Form.Label>
                        <Controller
                            name="driversInjuredAccidentForm"
                            control={control}
                            render={({ field }) => <Form.Control type="number" size="sm" min="0" max="99" {...field} />}
                        />
                    </Form.Group>    

                    <Form.Group as={Col} controlId="formMotorcyclistsInjuredAccident" className="ps-1 pe-0">
                        <Form.Label><i className="fas fa-motorcycle fa-lg" title="Мотоциклист"></i></Form.Label>
                        <Controller
                            name="motorcyclistsInjuredAccidentForm"
                            control={control}
                            render={({ field }) => <Form.Control type="number" size="sm" min="0" max="99" {...field} />}
                        />
                    </Form.Group> 

                    <Form.Group as={Col} controlId="formCyclistsInjuredAccident" className="ps-1 pe-0">
                        <Form.Label><i className="fas fa-bicycle fa-lg" title="Велосипедист"></i></Form.Label>
                        <Controller
                            name="cyclistsInjuredAccidentForm"
                            control={control}
                            render={({ field }) => <Form.Control type="number" size="sm" min="0" max="99" {...field} />}
                        />
                    </Form.Group> 

                    <Form.Group as={Col} controlId="formPedInjuredAccident" className="ps-1 pe-0">
                        <Form.Label><i className="fas fa-walking fa-lg" title="Пешеходец"></i></Form.Label>
                        <Controller
                            name="pedInjuredAccidentForm"
                            control={control}
                            render={({ field }) => <Form.Control type="number" size="sm" min="0" max="99" {...field} />}
                        />
                    </Form.Group> 

                    <Form.Group as={Col} controlId="formKidsInjuredAccident" className="ps-1 pe-0">
                        <Form.Label><i className="fas fa-baby fa-lg" title="Дете"></i></Form.Label>
                        <Controller
                            name="kidsInjuredAccidentForm"
                            control={control}
                            render={({ field }) => <Form.Control type="number" size="sm" min="0" max="99" {...field} />}
                        />
                    </Form.Group> 

                    <Form.Group as={Col} controlId="formPubtrPassengersInjuredAccident" className="ps-1 pe-0">
                        <Form.Label><i className="fas fa-bus-alt fa-lg" title="Пътник на градски транспорт"></i></Form.Label>
                        <Controller
                            name="pubtrPassengersInjuredAccidentForm"
                            control={control}
                            render={({ field }) => <Form.Control type="number" size="sm" min="0" max="99" {...field} />}
                        />
                    </Form.Group>                                                                                                                     
                </Row> 



                <Row className="mt-0">
                    <Form.Group as={Col} controlId="formKilledLabelAccident"> 
                        <Form.Label>Убити:</Form.Label>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formDriversKilledAccident" className="ps-1 pe-0">
                        <Controller
                            name="driversKilledAccidentForm"
                            control={control}
                            render={({ field }) => <Form.Control type="number" size="sm" min="0" max="99" {...field} />}
                        />
                    </Form.Group>    

                    <Form.Group as={Col} controlId="formMotorcyclistsKilledAccident" className="ps-1 pe-0">
                        <Controller
                            name="motorcyclistsKilledAccidentForm"
                            control={control}
                            render={({ field }) => <Form.Control type="number" size="sm" min="0" max="99" {...field} />}
                        />
                    </Form.Group> 

                    <Form.Group as={Col} controlId="formCyclistsKilledAccident" className="ps-1 pe-0">
                        <Controller
                            name="cyclistsKilledAccidentForm"
                            control={control}
                            render={({ field }) => <Form.Control type="number" size="sm" min="0" max="99" {...field} />}
                        />
                    </Form.Group> 

                    <Form.Group as={Col} controlId="formPedKilledAccident" className="ps-1 pe-0">
                        <Controller
                            name="pedKilledAccidentForm"
                            control={control}
                            render={({ field }) => <Form.Control type="number" size="sm" min="0" max="99" {...field} />}
                        />
                    </Form.Group> 

                    <Form.Group as={Col} controlId="formKidsKilledAccident" className="ps-1 pe-0">
                        <Controller
                            name="kidsKilledAccidentForm"
                            control={control}
                            render={({ field }) => <Form.Control type="number" size="sm" min="0" max="99" {...field} />}
                        />
                    </Form.Group> 

                    <Form.Group as={Col} controlId="formPubtrPassengersKilledAccident" className="ps-1 pe-0">
                        <Controller
                            name="pubtrPassengersKilledAccidentForm"
                            control={control}
                            render={({ field }) => <Form.Control type="number" size="sm" min="0" max="99" {...field} />}
                        />
                    </Form.Group>                                                                                                                     
                </Row>                 


                <Form.Group controlId="formPublicTransportInvolvedAccident" className="mt-3 ms-1">
                    <Controller
                                name="publicTransportInvolvedAccidentForm"
                                control={control}
                                render={({ field }) => 
                                    <Form.Check {...field} checked={field['value'] ?? false} inline label="ГТ участва в ПТП" type="checkbox" id="idPublicTransportInvolvedAccident"/>
                                }
                    /> 
                </Form.Group>


                <Form.Group controlId="formIdAccident" className="mt-3">
                    <Controller
                        name="accidentId"
                        control={control}
                        render={({ field }) => <Form.Control type="number" size="sm" min="0" max="99" {...field} />}
                    />
                </Form.Group>



                <div className="mt-4 me-2 float-end">
                    <Button onClick={() => setShowModalDelete(true)} variant="light">Изтрий</Button>{' '}
                    <Button onClick={onCloseAccident} variant="secondary">Изход</Button>{' '}
                    <Button type="submit" variant="primary" style={{ minWidth: '110px' }}>Запази</Button>
                </div>


            </Form>            
            


            

            <Modal show={showModalDelete} onHide={() => setShowModalDelete(false)}>
                <Modal.Header closeButton>
                <Modal.Title>Изтриване</Modal.Title>
                </Modal.Header>
                <Modal.Body>Наистина ли искате да изтриете този инцидент?</Modal.Body>
                <Modal.Footer>
                <Button variant="light" onClick={() => {setShowModalDelete(false); onDeleteAccident(getValues("accidentId"))} }>
                    Изтрий
                </Button>
                <Button variant="secondary" onClick={() => setShowModalDelete(false)}>
                    Отмени
                </Button>
                </Modal.Footer>
            </Modal>



        </div>
    )
}

export default FormAccident

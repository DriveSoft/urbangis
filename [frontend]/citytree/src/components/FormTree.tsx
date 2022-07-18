import { useState, useEffect, useRef } from 'react';
import { useForm, Controller  } from 'react-hook-form';
import { Form, Button, Row, Col, Modal} from 'react-bootstrap';
import Select, { components } from "react-select";
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../reducers/index'
import { TreeItem } from "../interfaces";
//import TableList from './TableList'
import InspectionsList from './InspectionsList';
import UploadPhotos from "./UploadPhotos"
//import ImageS3Upload from "./ImageS3Upload";
//import noPhotoImage from "./images/no-photo.png";

interface FormTreeProps {
	onSubmitTree: (data: {}) => void;
	onDeleteTree: (id: number) => void;
	onCloseTree: () => void;
    
    onNewInsp:(idTree: number) => void;
    onEditInsp: (data: {}) => void;
    onClickInspPhotos: (data: {}) => void;
    onClickEditCoords: (coord: {lat: string; lng: string}) => void;
        	
    dataTreeForm: TreeItem | null;
    city: string;
    signingS3Url: string;
}


const FormTree = ({
	onSubmitTree,
	onDeleteTree,
	onCloseTree,
    onNewInsp,
    onEditInsp,
    onClickInspPhotos,
    onClickEditCoords,
	dataTreeForm,
    city,
    signingS3Url
}: FormTreeProps) => {

    const rxMapMarkerState = useSelector((state: RootState) => state.uiReducer.mapMarkerState);
    const rxNewTreeCreation = useSelector((state: RootState) => state.uiReducer.newTreeCreation);
    const [showModalDelete, setShowModalDelete] = useState(false);

    const rxDictSpecieses = useSelector((state: RootState) => state.dataReducer.dictSpecieses);
    const rxDictStatuses = useSelector((state: RootState) => state.dataReducer.dictStatuses);
    const rxDictCareTypes = useSelector((state: RootState) => state.dataReducer.dictCareTypes);
	const rxDictRemarks = useSelector((state: RootState) => state.dataReducer.dictRemarks);
	const rxDictPlaceTypes = useSelector((state: RootState) => state.dataReducer.dictPlaceTypes);
	const rxDictIrrigationMethods = useSelector((state: RootState) => state.dataReducer.dictIrrigationMethods);
    const rxDictGroupSpecs = useSelector((state: RootState) => state.dataReducer.dictGroupSpec);


	//const [uploadedPhoto1, setUploadedPhoto1] = useState(false);
	//const [uploadedPhoto2, setUploadedPhoto2] = useState(false);
	//const [uploadedPhoto3, setUploadedPhoto3] = useState(false); 
    
	//const photo1Ref = useRef(); // to be able to call method uploadFile
	//const photo2Ref = useRef();
	//const photo3Ref = useRef();

    const uploadPhotosRef = useRef();


    // interface IInspections {
	// 	id: number;
	// 	[key: string]: any | {iconFA?: string; iconFASize?: string; text?: string; idButton: string};
	// };

    //const [inspections, setInspections] = useState<IInspections[] | undefined>(undefined);

    const { t } = useTranslation();

	useEffect(() => {
        reset();
        //@ts-ignore
        setValue("irrigationmethod", optionsIrrigationMethodsData[0]);                 
        setValue("latitude", rxMapMarkerState.position.lat);
        setValue("longitude", rxMapMarkerState.position.lng);                  
	}, [rxNewTreeCreation]);  
    
	useEffect(() => {
		if (rxMapMarkerState.visible) {
			setValue("latitude", rxMapMarkerState.position.lat);
			setValue("longitude", rxMapMarkerState.position.lng);                       
		}
	}, [rxMapMarkerState]);    




    // when provide data to show it
	useEffect(() => {
		let formData: any = {};

        formData.id = dataTreeForm?.id;
        formData.latitude = dataTreeForm?.latitude;
        formData.longitude = dataTreeForm?.longitude;
        
		let species = dataTreeForm?.species_id;
		if (species) {
			let isFound = false; // to stop loop
            optionsSpeciesesData.forEach((element:any) => { // loop for categories (The most common, The medium common and so on...)
                if (element?.options && Array.isArray(element.options)) { // in every categories trying to find id of species 
                    
                    if (!isFound) {
                        formData.species = element.options.find(                			
                            (item: any) => {
                                isFound = item.value === species; 
                                return isFound;	}
                        );             
                    }       
                }        
            });
            
		}        
        
        formData.speciescomment = dataTreeForm?.speciescomment;
        formData.comment = dataTreeForm?.comment;

        
		let placetype = dataTreeForm?.placetype;
		if (placetype) {
			console.log('optionsPlaceTypesData', optionsPlaceTypesData)
			formData.placetype = optionsPlaceTypesData.find(				
				(item) => item.value === placetype	
			);
		}    
        
		let irrigationmethod = dataTreeForm?.irrigationmethod;
		if (irrigationmethod) {
			//console.log('optionsPlaceTypesData', optionsPlaceTypesData)
			formData.irrigationmethod = optionsIrrigationMethodsData.find(				
				(item) => item.value === irrigationmethod	
			);
		}          
        

		if (dataTreeForm?.dateplanted) {
            console.log('dataTreeForm?.properties?.dateplanted', dataTreeForm?.dateplanted);
			formData.dateplanted = dataTreeForm.dateplanted;
		}

        formData.googlestreeturl = dataTreeForm?.googlestreeturl;


        reset(formData, { keepDefaultValues: true });

        // const fetchInpections = async () => {
		//     //@ts-ignore
        //     let url = `${process.env.REACT_APP_API_URL}citytree/${city}/trees/${dataTreeForm.id}/inspections/`;
    	// 	let res = await fetch(url);
		//     let data = await res.json(); 
            
        //     // adding buttons
        //     data = data.map((element: any) => {
        //         element.buttons = [];
        //         element.buttons.push({iconFA: 'fas fa-edit', iconFASize: '15pt', idButton: 'edit'});
                
        //         if (element?.photo1 || element?.photo2 || element?.photo3) {
        //             element.buttons.push({iconFA: 'fa fa-camera', iconFASize: '15pt', idButton: 'photo'});                       
                    
        //         }
        //         element.typeData = 'Inspection';
        //         return element;
                    
        //     });
            
        //     console.log('inspections',data);
        //     setInspections(data);       
        // };

        // if (dataTreeForm?.id) {
        //     fetchInpections();    
        // }


	}, [dataTreeForm]);



    // let optionsSpeciesesData: any = [];
    // if (Array.isArray(rxDictSpecieses) && Array.isArray(rxDictGroupSpecs)) {

    //     optionsSpeciesesData = rxDictGroupSpecs.map(itemGroup => {
    //         return {
    //             label: itemGroup.groupname,
    //             options: rxDictSpecieses.map(spec => {
    //                 if (itemGroup.id === spec.groupspec) {
    //                     return {
    //                         value: spec.id,
    //                         label: spec.localname,
    //                         speciesname: spec.speciesname,
    //                         typespec: spec.typespec
    //                         //color: '#FF8B00'
    //                     }
    //                 }
    //             }).filter(e => e) // removes all undefined items in result array			 
    //         }
    //     })
    // }

	//let optionsSpeciesesFilter: {label: string; options: {value: number; label: string}[] | undefined}[] = [];
	let optionsSpeciesesData: any = [];
	if (Array.isArray(rxDictSpecieses) && Array.isArray(rxDictGroupSpecs)) {
		let unknownTreeItem = null;

		optionsSpeciesesData = rxDictGroupSpecs.map(itemGroup => {
			return {				
				label: itemGroup.groupname,
				options: rxDictSpecieses.map(spec => {
					if (itemGroup.id === spec.groupspec) {
						if (spec.id !== 1) { // unknow tree item has id = 1
							return {
								value: spec.id,
								label: spec.localname,
								speciesname: spec.speciesname,
								typespec: spec.typespec
								//color: '#FF8B00'
							}
						} else {
							unknownTreeItem = {
								value: spec.id,
								label: spec.localname
							}
							return null;	
						}
					}
					return null;
				}).filter(e => e) // removes all undefined items in result array			 
			}
		})
		
		if (unknownTreeItem) {
			optionsSpeciesesData.unshift(unknownTreeItem);
		}				
	}    


    let optionsStatusesData: {value: number; label: string}[] = [];
    if (Array.isArray(rxDictStatuses)) {
        optionsStatusesData = rxDictStatuses.map((x) => {
            return {
                value: x.id,
                //label: t(`sidebar.filterTab.maneuversList.${x.maneuvername}`),
                label: x.statusname,
            };
        });
    }	

    let optionsCareTypesData: {value: number; label: string}[] = [];
    if (Array.isArray(rxDictCareTypes)) {
        optionsCareTypesData = rxDictCareTypes.map((x) => {
            return {
                value: x.id,
                //label: t(`sidebar.filterTab.maneuversList.${x.maneuvername}`),
                label: x.carename,
            };
        });
    }	

    let optionsRemarksData: {value: number; label: string}[] = [];
    if (Array.isArray(rxDictRemarks)) {
        optionsRemarksData = rxDictRemarks.map((x) => {
            return {
                value: x.id,
                //label: t(`sidebar.filterTab.maneuversList.${x.maneuvername}`),
                label: x.remarkname,
            };
        });
    }	

    let optionsPlaceTypesData: {value: number; label: string}[] = [];
    if (Array.isArray(rxDictPlaceTypes)) {
        //console.log('rxDictPlaceTypes', rxDictPlaceTypes)
        optionsPlaceTypesData = rxDictPlaceTypes.map((x) => {
            return {
                value: x.id,
                //label: t(`sidebar.filterTab.maneuversList.${x.maneuvername}`),
                label: x.placename,
            };
        });
    }

    let optionsIrrigationMethodsData: {value: number; label: string}[] = [];
    if (Array.isArray(rxDictIrrigationMethods)) {
        optionsIrrigationMethodsData = rxDictIrrigationMethods.map((x) => {
            return {
                value: x.id,
                //label: t(`sidebar.filterTab.maneuversList.${x.maneuvername}`),
                label: x.irrigationname,
            };
        });
    }	


	const {
		control,
		handleSubmit,
		reset,
		setValue,
		getValues,
		formState: { errors },
        trigger
	} = useForm({
		//reValidateMode: 'onChange',
		defaultValues: {			
            id: "",
            latitude: "",
            longitude: "",
            species: "",
            speciescomment: "",
            comment: "",
            placetype: "",
            irrigationmethod: "",            
            dateplanted: "",
            googlestreeturl: "",
            
            height: "",
            crowndiameter: "",
            trunkgirth: "",
            status: "",
            remarks: "",
            recommendations: "",
            photo1: "",
            photo2: "",
            photo3: ""
		},
	});





	async function onSubmitBefore(e: any) {
		e.preventDefault();				
		
        const result = await trigger(); // programmaticaly run validation
        if (result) {
            //@ts-ignore
            uploadPhotosRef.current.uploadPhotos(); // component uploadPhotos has a callback to start a submit of the form, when uploading has been finished.
        }



        /*
        //setPhoto1StateUpload({...photo1StateUpload, start: true})

		let p1 = false;
		let p2 = false;
		let p3 = false;
		//@ts-ignore
		if (photo1Ref?.current?.uploadFile) {
			//@ts-ignore
			p1=photo1Ref.current.uploadFile();
		}	

		//@ts-ignore
		if (photo2Ref?.current?.uploadFile) {
			//@ts-ignore
			p2=photo2Ref.current.uploadFile();
		}
		
		//@ts-ignore
		if (photo3Ref?.current?.uploadFile) {
			//@ts-ignore
			p3=photo3Ref.current.uploadFile();
		}		


		console.log('p', p1, p2, p3);
		if (!p1 && !p2 && !p3) { // there is no photo to upload, so just submit form
			//handleSubmit(prepareOnSubmitInsp)()
		} else {
			e.preventDefault();
			setUploadedPhoto1(!p1);
			setUploadedPhoto2(!p2);
			setUploadedPhoto3(!p3);
			//console.log('cons', {photo1: !p1, photo2: !p2, photo3: !p3, data: data})
			//setPhotosUploaded({photo1: !p1, photo2: !p2, photo3: !p3, data: data});
		}		
		
		//handleSubmit(prepareOnSubmitInsp)()
        */
	}

	const onCallbackDone = () => {
		console.log('DONE');
		handleSubmit(prepareOnSubmitTree)();	
	}    



	function prepareOnSubmitTree(data: {
        id: any;
        latitude: string;
        longitude: string;
        species: any;
        speciescomment: string;
        comment: string;
        placetype: any;
        irrigationmethod: any;
        dateplanted: any;
        googlestreeturl: string | null;

        inspection?: any;
        height: any;
        crowndiameter: any;
        trunkgirth: any;
        status: any;
        remarks: any;
        recommendations: any;
        photo1: string | null; 
        photo2: string | null;
        photo3: string | null;
    }) {
		//let dataResult: any = {};
        //console.log('data', data);


        if (!data.dateplanted) {
            data.dateplanted = null;    
        }

        if (rxNewTreeCreation === true) {
            // new record                
            data.species = data.species.value;
            data.placetype = data.placetype.value;
            data.irrigationmethod = data?.irrigationmethod?.value;            

            // make inspection
            if (data?.height && data?.crowndiameter && data?.trunkgirth && data?.status) {
                data.inspection = {
                    height: parseInt(data.height),
                    crowndiameter: parseFloat(data.crowndiameter),
                    trunkgirth: parseInt(data.trunkgirth),
                    status: data.status.value,  
                    
                    photo1: data.photo1,          
                    photo2: data.photo2, 
                    photo3: data.photo3, 
                };

                if (data?.remarks && Array.isArray(data.remarks)) {
                    data.inspection.remarks = [];
                    data.remarks.forEach(element => {
                        data.inspection.remarks.push(element.value);     
                    });                                           
                }
                
                if (data?.recommendations && Array.isArray(data.recommendations)) {
                    data.inspection.recommendations = [];
                    data.recommendations.forEach(element => {
                        data.inspection.recommendations.push(element.value);     
                    });                                           
                }                             
            }   

            delete data.id;
            delete data.height;
            delete data.crowndiameter;
            delete data.trunkgirth;
            delete data.status; 
            delete data.remarks;
            delete data.recommendations; 

            console.log('onSubmitTree', data);
            onSubmitTree(data);

        } else {
            // edit
            data.species = data.species.value;
            data.placetype = data.placetype.value;
            data.irrigationmethod = data?.irrigationmethod?.value; 
            
            console.log('dataedit', data);
            onSubmitTree(data);
        }

        
    }        


    const customStyles = {
		//@ts-ignore
		option: (styles, { data, isSelected, isFocused, isDisabled  }) => {
			//const color = chroma(data.color);
			return {
			  ...styles,
			  paddingLeft: 20,
			  //backgroundColor: data.typespec === 2 ? '#EEFFEE' : undefined,
              backgroundColor: isDisabled
              ? undefined
              : isSelected
              ? "#606060"
              : isFocused
              ? "#EEEEEE"
              : data.typespec === 2 ? '#EEFFEE' : undefined,
			};
		  },
	  } 



	  const Option = (props: any) => {
		const { label, speciesname } = props.data;
		return (
		  <components.Option {...props}>
			<span>{label}</span> <span style={{ color: "darkgray" }}>{speciesname}</span>
		  </components.Option>
		);
	  };




    function OnButtonTableClick (rowData: any, idButton: string) {    
        console.log(idButton, rowData);
        if (idButton==='edit') {
            onEditInsp(rowData);
        } else if (idButton==='photo') {
            onClickInspPhotos(rowData);
        }
        
    }


    /*
	const onFinishPhoto1 = () => {
		console.log('onFinishPhoto1');
		setUploadedPhoto1(true);
		//setPhotosUploaded({...photosUploaded, photo1: true});	
	}
	const onFinishPhoto2 = () => {
		console.log('onFinishPhoto2');
		setUploadedPhoto2(true);
	
		//setPhotosUploaded({photo1: photosUploaded.photo1, photo2: true, photo3: photosUploaded.photo3, data: photosUploaded.data});
		//setPhotosUploaded({...photosUploaded, photo2: true});
	}
	const onFinishPhoto3 = () => {
		console.log('onFinishPhoto3');
		//setPhotosUploaded({...photosUploaded, photo3: true});
		setUploadedPhoto3(true);
	}	    
    */




	return (
		<div>
			<Form
				className="m-1"
				onSubmit={handleSubmit(prepareOnSubmitTree)}
			>
				<Row>
					<Form.Group as={Col} controlId="formCoordEditButton">
						<Form.Label>
							{t<string>("sidebar.treeTab.latLng")}{" "}
							<a href="#">
								<i className="fas fa-edit align-middle" onClick={() => onClickEditCoords({lat:getValues("latitude"), lng:getValues("longitude")})}></i>
							</a>
						</Form.Label>
					</Form.Group>

					<Form.Group as={Col} controlId="formLatTree">
						<Controller
							name="latitude"
                            rules={{ required: true }}
							control={control}
							render={({ field }) => (
								<Form.Control
									type="number"
									step="any"
									size="sm"
									isInvalid={!!errors.latitude}
									{...field}
								/>
							)}
						/>

						<Form.Control.Feedback type="invalid">
							{t<string>("words.requiredField")}
						</Form.Control.Feedback>
					</Form.Group>

					<Form.Group as={Col} controlId="formLngTree">
						<Controller
							name="longitude"
                            rules={{ required: true }}
							control={control}
							render={({ field }) => (
								<Form.Control
									type="number"
									step="any"
									size="sm"
									isInvalid={!!errors.longitude}
									{...field}
								/>
							)}
						/>
						<Form.Control.Feedback type="invalid">
							{t<string>("words.requiredField")}
						</Form.Control.Feedback>
					</Form.Group>
				</Row>





				<Form.Group controlId="formSpecies" className="mt-3">
					<Form.Label className="required">
						{t<string>("sidebar.treeTab.species")}
					</Form.Label>
					<Controller
						name="species"
                        rules={{ required: t<string>("words.requiredField") }}
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								placeholder={t<string>("words.select")}
								isSearchable={true}
								//@ts-ignore
								options={optionsSpeciesesData}
								//@ts-ignore
								styles={customStyles}
								//@ts-ignore
								getOptionLabel={(option) =>`${option.label} - ${option.speciesname}`}
								components={{ Option }}
							/>
						)}
					/>
                    <p className="requiredField">{errors.species?.message}</p>
				</Form.Group>

                
				<Form.Group
					controlId="formSpeciesCommentTree"
					className="mt-3"
				>
					<Form.Label>
						{t<string>("sidebar.treeTab.speciescomment")}
					</Form.Label>
					<Controller
						name="speciescomment"
						control={control}
						render={({ field }) => (
							<Form.Control
								type="text"
								{...field}
							/>
						)}
					/>
				</Form.Group>
                
				<Form.Group
					controlId="formCommentTree"
					className="mt-3"
				>
					<Form.Label>
						{t<string>("sidebar.treeTab.comment")}
					</Form.Label>
					<Controller
						name="comment"
						control={control}
						render={({ field }) => (
							<Form.Control
								type="text"
								as="textarea"
								rows={3}
								{...field}
							/>
						)}
					/>
				</Form.Group>


				<Row className="mt-3">
					<Form.Group as={Col} controlId="formPlaceTypeTree" style={{ minWidth: "230px" }}>
						<Form.Label className="required">
							{t<string>("sidebar.treeTab.placetype")}
						</Form.Label>
						<Controller
							name="placetype"
                            rules={{ required: t<string>("words.requiredField") }}
							control={control}
							render={({ field }) => (
								<Select
									{...field}
                                    placeholder={t<string>("words.select")}
									isClearable
									isSearchable={false}
									//@ts-ignore
                                    options={optionsPlaceTypesData}
								/>
							)}
						/>
                        <p className="requiredField">{errors.placetype?.message}</p>
					</Form.Group>

					<Form.Group as={Col} controlId="formIrrigationmethodTree" style={{ minWidth: "230px" }}>
						<Form.Label>
							{t<string>("sidebar.treeTab.irrigationmethod")}
						</Form.Label>
						<Controller
							name="irrigationmethod"
							control={control}
							render={({ field }) => (
								<Select
									{...field}
                                    placeholder={t<string>("words.select")}
									isClearable
									isSearchable={false}
									//@ts-ignore
                                    options={optionsIrrigationMethodsData}
								/>
							)}
						/>
					</Form.Group>
				</Row>



				<Row className="mt-3">
                    <Form.Group as={Col} controlId="formDatePlantedTree" style={{ minWidth: "230px" }}>
						<Form.Label>
							{t<string>("sidebar.treeTab.dateplanted")}
						</Form.Label>
						<Controller
							name="dateplanted"
							control={control}
							render={({ field }) => (
								<Form.Control type="date" {...field} />
							)}
						/>
					</Form.Group>

                    <Form.Group as={Col} controlId="formGoogleStreetUrlTree" style={{ minWidth: "230px" }}>
                        <Form.Label>
                            {t<string>("sidebar.treeTab.googlestreeturl")}
                        </Form.Label>
                        <Controller
                            name="googlestreeturl"
                            control={control}
                            render={({ field }) => (
                                <Form.Control
                                    type="text"
                                    {...field}
                                />
                            )}
                        />
                    </Form.Group>
				</Row>


                {rxNewTreeCreation ? 
                <>
                    <Form.Group className="mt-4" controlId="formFirstInspectionTree">
                        <Form.Label>
                            <b>{t<string>("sidebar.treeTab.firstInspection")}</b>
                        </Form.Label>

                    </Form.Group>   
                    
                    <Row className="mt-3">
                        <Form.Group as={Col} controlId="formHeightTree">
                            <Form.Label className="required">
                                {t<string>("sidebar.treeTab.heightTree")}
                            </Form.Label>
                            <Controller
                                name="height"
                                rules={{ required: t<string>("words.requiredField") }}                               
                                control={control}
                                render={({ field }) => (
                                    <Form.Control
                                        type="number"
                                        size="sm"
                                        {...field}
                                    />
                                )}
                            />
                            <p className="requiredField">{errors.height?.message}</p>
                        </Form.Group>

                        <Form.Group as={Col} controlId="formDiameterTree">
                            <Form.Label className="required">
                                {t<string>("sidebar.treeTab.diameterTree")}
                            </Form.Label>
                            <Controller
                                name="crowndiameter"
                                rules={{ required: t<string>("words.requiredField"), max: 99, pattern: /^\d+([.]\d)?$/ }}                              
                                control={control}
                                render={({ field }) => (
                                    <Form.Control
                                        type="number"
                                        size="sm"
                                        {...field}
                                    />
                                )}
                            />
						{errors.crowndiameter?.message && 
							<p className="requiredField">{errors.crowndiameter?.message}</p>
						}

						{errors.crowndiameter?.type === "max" && 
							<p className="requiredField">Maximum value is 99</p>
						}	

						{errors.crowndiameter?.type === "pattern" && 
							<p className="requiredField">Allow only one decimal point</p>
						}
                        </Form.Group>

                        <Form.Group as={Col} controlId="formGirthTree">
                            <Form.Label className="required">
                                {t<string>("sidebar.treeTab.girthTree")}
                            </Form.Label>
                            <div style={{height: "100%"}}>
                            <Controller
                                name="trunkgirth"
                                rules={{ required: t<string>("words.requiredField") }}                                
                                control={control}
                                render={({ field }) => (
                                    <Form.Control
                                        type="number"
                                        size="sm"    
                                        {...field}
                                    />
                                )}
                            />
                            <p className="requiredField">{errors.trunkgirth?.message}</p>
                            </div>
                        </Form.Group>                        
				    </Row>  






                    <Form.Group controlId="formStatusTree" className="mt-3">
                        <Form.Label className="required">
                            {t<string>("sidebar.treeTab.status")}
                        </Form.Label>
                        <Controller
                            name="status"
                            rules={{ required: t<string>("words.requiredField") }} 
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    placeholder={t<string>("words.select")}
                                    isSearchable={false}
                                    //@ts-ignore
                                    options={optionsStatusesData}																
                                />
                            )}
                        />
                        <p className="requiredField">{errors.status?.message}</p>
				    </Form.Group>

                    <Form.Group controlId="formRemarksTree" className="mt-3">
                        <Form.Label>
                            {t<string>("sidebar.treeTab.remarks")}
                        </Form.Label>
                        <Controller
                            name="remarks"                            
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    isMulti
                                    placeholder={t<string>("words.select")}
                                    isSearchable={false}
                                    //@ts-ignore
                                    options={optionsRemarksData}																
                                />
                            )}
                        />
				    </Form.Group>

                    <Form.Group controlId="formCareTypesTree" className="mt-3">
                        <Form.Label>
                            {t<string>("sidebar.treeTab.careTypes")}
                        </Form.Label>
                        <Controller
                            name="recommendations"                            
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    isMulti
                                    placeholder={t<string>("words.select")}
                                    isSearchable={false}
                                    //@ts-ignore
                                    options={optionsCareTypesData}																
                                />
                            )}
                        />
				    </Form.Group>    


                    <UploadPhotos 
                        controlFromUseForm={control}
                        signingS3Url={signingS3Url}
                        onCallbackDone={onCallbackDone}	
                        ref={uploadPhotosRef}
				    />
                </>

                
                : <>
                    <Form.Group controlId="formInspActTable" className="mt-3">
                        <Form.Label>
                            {t<string>("sidebar.treeTab.inspActionsTable")}
                        </Form.Label>
                        
                        <InspectionsList 
                            idTree={dataTreeForm?.id}
                            //data={inspections} 
                            OnClickButtons={OnButtonTableClick}
                        />

                    </Form.Group>


                    <Row className="mt-3">
                        <Form.Group as={Col} controlId="formNewInspButton">
                            <Button
                                style={{width: "100%"}}
                                onClick={() => dataTreeForm?.id && onNewInsp(dataTreeForm.id)}
                                variant="light"
                            >
                                {t<string>("sidebar.treeTab.newInspButton")}
                            </Button>{" "}
                        </Form.Group>

                        <Form.Group as={Col} controlId="formNewActButton">
                            <Button
                                style={{width: "100%"}}
                                //onClick={}
                                variant="light"
                            >
                                {t<string>("sidebar.treeTab.newActButton")}
                            </Button>{" "}
                        </Form.Group>
                    </Row>
                </>}




				<Form.Group controlId="formIdTree" className="mt-3">
					<Controller
						name="id"
						control={control}
						render={({ field }) => (
							<Form.Control
								type="number"
								size="sm"
								min="0"
								style={{ display: "none" }}
								{...field}
							/>
						)}
					/>
				</Form.Group>

				<div className="mt-4 me-2 float-end">
					<Button
						onClick={() => setShowModalDelete(true)}
						variant="light"
					>
						{t<string>("sidebar.treeTab.delete")}
					</Button>{" "}
					<Button 
                        onClick={onCloseTree} 
                        variant="secondary"
                    >
						{t<string>("sidebar.treeTab.close")}
					</Button>{" "}
					<Button                        
						type="submit"
                        onClick={ rxNewTreeCreation ? onSubmitBefore : undefined }
						variant="primary"
						style={{ minWidth: "110px" }}
					>
						{t<string>("sidebar.treeTab.save")}
					</Button>
				</div>
			</Form>

			<Modal
				show={showModalDelete}
				onHide={() => setShowModalDelete(false)}
			>
				<Modal.Header closeButton>
					<Modal.Title>{t<string>("words.deleting")}</Modal.Title>
				</Modal.Header>
				<Modal.Body>{t<string>("sidebar.treeTab.confirmDeleting")}</Modal.Body>
				<Modal.Footer>
					<Button
						variant="light"
						onClick={() => {
							setShowModalDelete(false);
							onDeleteTree(parseInt(getValues("id").toString()));
						}}
					>
						{t<string>("words.delete")}
					</Button>
					<Button
						variant="secondary"
						onClick={() => setShowModalDelete(false)}
					>
						{t<string>("words.cancel")}
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);

}


export default FormTree
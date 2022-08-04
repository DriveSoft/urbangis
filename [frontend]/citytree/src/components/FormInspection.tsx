import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Form, Button, Row, Col, Modal } from "react-bootstrap";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../reducers/index";
import { InspItem } from "../interfaces";
import UploadPhotos from "./UploadPhotos"
//import ImageS3Upload from "./ImageS3Upload";
//import noPhotoImage from "./images/no-photo.png";




interface FormInspProps {
	onSubmitInsp: (data: {}) => void;
	onDeleteInsp: (data: InspItem | null) => void;
	onCloseInsp: () => void;
	dataInspForm: InspItem | null;
	city: string;
	signingS3Url: string;
}


const FormInspection = ({
	onSubmitInsp,
	onDeleteInsp,
	onCloseInsp,
	dataInspForm,
	city,
	signingS3Url
}: FormInspProps) => {

    	
	const [showModalDelete, setShowModalDelete] = useState(false);

	const rxDictStatuses = useSelector((state: RootState) => state.dataReducer.dictStatuses);
    const rxDictCareTypes = useSelector((state: RootState) => state.dataReducer.dictCareTypes);
	const rxDictRemarks = useSelector((state: RootState) => state.dataReducer.dictRemarks);    
    const { t } = useTranslation();


	const uploadPhotosRef = useRef();

	const {		
		control,
		handleSubmit,
		reset,
		setValue,
		getValues,
		formState: { errors, isValid },
		trigger 
	} = useForm({ 
		//reValidateMode: 'onChange',
		defaultValues: {			
            id: "",  
            treeId: "",          
            height: "",
            crowndiameter: "",
            trunkgirth: "",
            status: "",
            remarks: [],
            recommendations: [],
			photo1: "",
			photo2: "",
			photo3: "",
		},
	});





    useEffect(()=>{
		let formData: any = {};

        formData.id = dataInspForm?.id;  
        formData.treeId = dataInspForm?.tree; 
        formData.height = dataInspForm?.height; 
        formData.crowndiameter = dataInspForm?.crowndiameter; 
        formData.trunkgirth = dataInspForm?.trunkgirth; 
        
		let status = dataInspForm?.status;
		if (status) {
			formData.status = optionsStatusesData.find(				
				(item) => item.value === status	
			);
		}   
  
        
		let remarks = dataInspForm?.remarks;
		if (remarks) {
			//let remarksValues = remarks.map((item) => item);
			formData.remarks = optionsRemarksData.filter(
				//@ts-ignore
                (item) => remarks.includes(item.value)
			);
		}  
        
		let recommendations = dataInspForm?.recommendations;
		if (recommendations) {
			//let remarksValues = remarks.map((item) => item);
			formData.recommendations = optionsCareTypesData.filter(
				//@ts-ignore
                (item) => recommendations.includes(item.value)
			);
		}        


		if (dataInspForm?.photo1) {
			formData.photo1 = dataInspForm.photo1;
		} else {
			formData.photo1 = '';
		}
		if (dataInspForm?.photo2) {
			formData.photo2 = dataInspForm.photo2;
		} else {
			formData.photo2 = '';
		}
		if (dataInspForm?.photo3) {
			formData.photo3 = dataInspForm.photo3;
		} else {
			formData.photo3 = '';
		}		
		
        
        reset(formData, { keepDefaultValues: true });
		console.log('dataInspForm');

    }, [dataInspForm]);


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




	async function onSubmitBefore(e: any) {
		e.preventDefault();				
		const result = await trigger(); // programmaticaly run validation
		if (result) {
			//@ts-ignore
			uploadPhotosRef.current.uploadPhotos(); // component uploadPhotos has a callback to start a submit of the form, when uploading has been finished.
		}
	}

	function prepareOnSubmitInsp(data: {
        id: any;  
        treeId: any;      
        height: any;
        crowndiameter: any;
        trunkgirth: any;
        status: any;
        remarks: any;
        recommendations: any;
        //photo1: any;
        //photo2: any;
        //photo3: any;
    }) {

		console.log('submit', data);

        data.height = parseInt(data.height);
        data.crowndiameter = parseFloat(data.crowndiameter);
        data.trunkgirth = parseInt(data.trunkgirth);
        data.status = data.status.value;

        if (data?.remarks && Array.isArray(data.remarks)) {
            let remarks: number[] = [];
            data.remarks.forEach((element:{value: number; label: string}) => {
                remarks.push(element.value);     
            }); 
            data.remarks = remarks;                                          
        }

        if (data?.recommendations && Array.isArray(data.recommendations)) {
            let recommendations: number[] = [];
            data.recommendations.forEach((element:{value: number; label: string}) => {
                recommendations.push(element.value);     
            }); 
            data.recommendations = recommendations;                                          
        }  		

		onSubmitInsp({...data, user: dataInspForm?.user});

    };


	const onUploadError = (e: any) => {
		console.log('onUploadError', e);
	}


	const onCallbackDone = () => {
		console.log('DONE');
		handleSubmit(prepareOnSubmitInsp)();	
	}

	return (
		<div>
			<Form className="m-1" onSubmit={handleSubmit(prepareOnSubmitInsp)}>				
				<Row className="mt-3">
					<Form.Group as={Col} controlId="formHeightTreeInsp">
						<Form.Label className="required">
							{t<string>("sidebar.treeTab.heightTree")}
						</Form.Label>
						<Controller
							name="height"
							rules={{ required: t<string>("words.requiredField") }}
							control={control}
							render={({ field }) => (
								<Form.Control
									size="sm"
									type="number"
									{...field}
								/>								
							)}							
						/>
						<p className="requiredField">{errors.height?.message}</p>
					</Form.Group>

					<Form.Group as={Col} controlId="formDiameterTreeInsp">
						<Form.Label className="required">
							{t<string>("sidebar.treeTab.diameterTree")}
						</Form.Label>
						<Controller
							name="crowndiameter"
							rules={{ required: t<string>("words.requiredField"), max: 99, pattern: /^\d+([.]\d)?$/ }}
							control={control}
							render={({ field }) => (
								<Form.Control
									size="sm"
									type="number"
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

					<Form.Group as={Col} controlId="formGirthTreeInsp">
						<Form.Label className="required">
							{t<string>("sidebar.treeTab.girthTree")}
						</Form.Label>
						<Controller
							name="trunkgirth"
							rules={{ required: t<string>("words.requiredField") }}
							control={control}
							render={({ field }) => (
								<Form.Control
									size="sm"
									type="number"
									{...field}
								/>
							)}
						/>
						<p className="requiredField">{errors.trunkgirth?.message}</p>
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



				<Form.Group controlId="formIdInsp" className="mt-3">
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


				<UploadPhotos 
					controlFromUseForm={control}
					signingS3Url={signingS3Url}
					serverPhoto={dataInspForm?.photoServer}
					onCallbackDone={onCallbackDone}	
					ref={uploadPhotosRef}
				/>

				<Form.Group controlId="formIdTreeInsp" className="mt-3">
					<Controller
						name="treeId"
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
						{t<string>("sidebar.inspTab.delete")}
					</Button>{" "}
					<Button 
                        onClick={onCloseInsp} 					
                        variant="secondary"
                    >
						{t<string>("sidebar.inspTab.close")}
					</Button>{" "}
					<Button                        
						type="submit"
						onClick={onSubmitBefore}
						variant="primary"
						style={{ minWidth: "110px" }}
					>
						{t<string>("sidebar.inspTab.save")}
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
				<Modal.Body>{t<string>("sidebar.inspTab.confirmDeleting")}</Modal.Body>
				<Modal.Footer>
					<Button
						variant="light"
						onClick={() => {
							setShowModalDelete(false);
							//onDeleteInsp(parseInt(getValues("id").toString()));
                            onDeleteInsp(dataInspForm);
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
};

export default FormInspection;

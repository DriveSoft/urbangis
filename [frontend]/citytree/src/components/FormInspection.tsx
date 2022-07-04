import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Form, Button, Card, Row, Col, Modal } from "react-bootstrap";
import Datetime from "react-datetime";
import Select, { components } from "react-select";
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


let test = 1;

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

	//const [uploadedPhoto1, setUploadedPhoto1] = useState(false);
	//const [uploadedPhoto2, setUploadedPhoto2] = useState(false);
	//const [uploadedPhoto3, setUploadedPhoto3] = useState(false);	
	
	//const photo1Ref = useRef(); // to be able to call method uploadFile
	//const photo2Ref = useRef();
	//const photo3Ref = useRef();

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


	/*
	useEffect(() => {
		if (uploadedPhoto1 && uploadedPhoto2 && uploadedPhoto3) {			
			setUploadedPhoto1(false);
			setUploadedPhoto2(false);
			setUploadedPhoto3(false);

			handleSubmit(prepareOnSubmitInsp)();
		}
	}, [uploadedPhoto1, uploadedPhoto2, uploadedPhoto3]);	
	*/




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
		
		
		/*
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
		}		
		
		//handleSubmit(prepareOnSubmitInsp)()
		*/
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

		onSubmitInsp(data);

    };


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
									size="sm"
									type="number"
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

					<Form.Group as={Col} controlId="formGirthTree">
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

				{/*
				<Row className="mt-3">
					<Form.Group as={Col} controlId="formIdInsp1" className="mt-3">
						<Controller
							name="photo1"
							control={control}
							render={({ field }) => (

								<ImageS3Upload  
									signingUrl={signingS3Url}
									autoUpload={false}
									//startUploadState={photo1StateUpload.start}
									emptyPhoto={noPhotoImage}
									serverPhoto={dataInspForm?.photoServer}	
									onFinish={onFinishPhoto1}																	
									{...field}
									ref={photo1Ref}
								/>

							)}
						/>
					</Form.Group>

					<Form.Group as={Col} controlId="formIdInsp2" className="mt-3">
						<Controller
							name="photo2"
							control={control}
							render={({ field }) => (

								<ImageS3Upload  
									signingUrl={signingS3Url}
									autoUpload={false}	
									emptyPhoto={noPhotoImage}
									serverPhoto={dataInspForm?.photoServer}
									onFinish={onFinishPhoto2}
									{...field}
									ref={photo2Ref}
								/>

							)}
						/>
					</Form.Group>

					<Form.Group as={Col} controlId="formIdInsp3" className="mt-3">
						<Controller
							name="photo3"
							control={control}
							render={({ field }) => (

								<ImageS3Upload  
									signingUrl={signingS3Url}
									autoUpload={false}
									emptyPhoto={noPhotoImage}
									serverPhoto={dataInspForm?.photoServer}
									onFinish={onFinishPhoto3}
									{...field}
									ref={photo3Ref}
								/>

							)}
						/>
					</Form.Group>	
															
				</Row>
				*/}

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

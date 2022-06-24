import { Form, Button, Card, Row, Col, Modal} from 'react-bootstrap';
import {useState, useEffect, forwardRef, useRef, useImperativeHandle} from 'react'
import { Controller } from "react-hook-form";
import ImageS3Upload from "./ImageS3Upload";
import noPhotoImage from "./images/no-photo.png";

interface UploadPhotosProps {
    controlFromUseForm: any;
    signingS3Url: string;
    serverPhoto?: string | undefined | null;
    onCallbackDone: () => void;
} 

interface RefObject {
    uploadPhotos: () => void
}

const UploadPhotos = forwardRef<RefObject | undefined, UploadPhotosProps>(({
    controlFromUseForm,
    signingS3Url,
    serverPhoto,
    onCallbackDone
}, ref) => {

	const photo1Ref = useRef(); // to be able to call method uploadFile
	const photo2Ref = useRef();
	const photo3Ref = useRef();   
    
	const [uploadedPhoto1, setUploadedPhoto1] = useState(false);
	const [uploadedPhoto2, setUploadedPhoto2] = useState(false);
	const [uploadedPhoto3, setUploadedPhoto3] = useState(false);   

	useEffect(() => {
		if (uploadedPhoto1 && uploadedPhoto2 && uploadedPhoto3) {			
			setUploadedPhoto1(false);
			setUploadedPhoto2(false);
			setUploadedPhoto3(false);
						
			onCallbackDone();
		}
	}, [uploadedPhoto1, uploadedPhoto2, uploadedPhoto3]);



    const autoUpload = false;

    const resizerOptions = {
        enabled: true,
        autoResize: false, // otherwise resizing will be preform before uploading
        maxWidth: 1280,
        maxHeight: 1280,
        compressFormat: "JPEG",
        quality: 70,
        rotation: 0            
    }


    // to be able to call method uploadFile
    useImperativeHandle(ref, () => ({
        uploadPhotos: () => {

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
                onCallbackDone();
            } else {
                //e.preventDefault();
                setUploadedPhoto1(!p1);
                setUploadedPhoto2(!p2);
                setUploadedPhoto3(!p3);
                //console.log('cons', {photo1: !p1, photo2: !p2, photo3: !p3, data: data})
                //setPhotosUploaded({photo1: !p1, photo2: !p2, photo3: !p3, data: data});
            }	            

        }
    }));



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




    return (


        <Row className="mt-3">
            <Form.Group as={Col} controlId="formIdInsp1" className="mt-3">
                <Controller
                    name="photo1"
                    control={controlFromUseForm}
                    render={({ field }) => (

                        <ImageS3Upload  
                            signingUrl={signingS3Url}
                            autoUpload={autoUpload}
                            //startUploadState={photo1StateUpload.start}
                            emptyPhoto={noPhotoImage}
                            serverPhoto={serverPhoto}	
                            onFinish={onFinishPhoto1}
                            resizer={resizerOptions}																	
                            {...field}
                            ref={photo1Ref}
                        />

                    )}
                />
            </Form.Group>

            <Form.Group as={Col} controlId="formIdInsp2" className="mt-3">
                <Controller
                    name="photo2"
                    control={controlFromUseForm}
                    render={({ field }) => (

                        <ImageS3Upload  
                            signingUrl={signingS3Url}
                            autoUpload={autoUpload}	
                            emptyPhoto={noPhotoImage}
                            serverPhoto={serverPhoto}
                            onFinish={onFinishPhoto2}
                            resizer={resizerOptions}
                            {...field}
                            ref={photo2Ref}
                        />

                    )}
                />
            </Form.Group>

            <Form.Group as={Col} controlId="formIdInsp3" className="mt-3">
                <Controller
                    name="photo3"
                    control={controlFromUseForm}
                    render={({ field }) => (

                        <ImageS3Upload  
                            signingUrl={signingS3Url}
                            autoUpload={autoUpload}
                            emptyPhoto={noPhotoImage}
                            serverPhoto={serverPhoto}
                            onFinish={onFinishPhoto3}
                            resizer={resizerOptions}
                            {...field}
                            ref={photo3Ref}
                        />

                    )}
                />
            </Form.Group>	
        </Row>



  )
})

export default UploadPhotos
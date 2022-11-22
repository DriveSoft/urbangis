import { Form, Button, Card, Row, Col, Modal} from 'react-bootstrap';
import {useState, useEffect, forwardRef, useRef, useImperativeHandle} from 'react'
import { Controller } from "react-hook-form";
//import ImageS3Upload from "./ImageS3Upload";
import { ImageS3Upload } from "react-image-upload-s3";
import noPhotoImage from "./images/no-photo.png";

interface UploadPhotosProps {
    controlFromUseForm: any;
    signingS3Url: string;
    serverPhoto?: string;
    onCallbackDone: (isSuccessful: boolean) => void;
} 

interface RefObject {
    uploadPhotos: () => void
}

// enum StateUploader {
//     none,
//     ok,
//     error
// }

const UploadPhotos = forwardRef<RefObject | undefined, UploadPhotosProps>(({
    controlFromUseForm,
    signingS3Url,
    serverPhoto,
    onCallbackDone
}, ref) => {

	const photo1Ref = useRef(); // to be able to call method uploadFile
	const photo2Ref = useRef();
	const photo3Ref = useRef();   
    //const [photosUploaded, setPhotosUploaded] = useState<{photo1: StateUploader, photo2: StateUploader, photo3: StateUploader}>({photo1: StateUploader.none, photo2: StateUploader.none, photo3: StateUploader.none});
    const [submitData, setSubmitData] = useState({submit: false, success: false});

    useEffect(()=> {        
        if (submitData.submit) {
            onCallbackDone(submitData.success);    
            setSubmitData({submit: false, success: false});
        }                        
    }, [submitData]);    

	// useEffect(() => {
	// 	if (photosUploaded.photo1 !== StateUploader.none && photosUploaded.photo2 !== StateUploader.none && photosUploaded.photo3 !== StateUploader.none) {			
	// 		onCallbackDone(photosUploaded.photo1 === StateUploader.ok && photosUploaded.photo2 === StateUploader.ok && photosUploaded.photo3 === StateUploader.ok);
    //         setPhotosUploaded({photo1: StateUploader.none, photo2: StateUploader.none, photo3: StateUploader.none});									
	// 	}
	// }, [photosUploaded]);    


    const autoUpload = false;

    const resizerOptions = {
        enabled: true,
        autoResize: true, // otherwise resizing will be preform before uploading
        maxWidth: 1280,
        maxHeight: 1280,
        compressFormat: "JPEG",
        quality: 70,
        rotation: 0            
    }


    // to be able to call method uploadFile
    useImperativeHandle(ref, () => ({
        uploadPhotos: () => {
            //setPhotosUploaded({photo1: StateUploader.none, photo2: StateUploader.none, photo3: StateUploader.none});            
            //@ts-ignore
            //photo1Ref?.current?.uploadFile();
            //@ts-ignore
            //photo2Ref?.current?.uploadFile();
            //@ts-ignore
            //photo3Ref?.current?.uploadFile();            

            Promise.all([
                //@ts-ignore
                photo1Ref.current.uploadFile(),	
                //@ts-ignore
                photo2Ref.current.uploadFile(),
                //@ts-ignore
                photo3Ref.current.uploadFile()	            
            ]).then((values) => {          
                console.log('result', values);
                let result = true;
                values.forEach((value) => {if (!value) result = false})
                setSubmitData({submit: true, success: result});
            });            
        }
    }));


	// const onFinishPhoto1 = (isSuccessful: boolean) => {		
    //     setPhotosUploaded(prev => ({...prev, photo1: isSuccessful ? StateUploader.ok : StateUploader.error }));
	// }
	// const onFinishPhoto2 = (isSuccessful: boolean) => {		
    //     //isSuccessful && setPhotosUploaded(prev => ({...prev, photo2: true}));
    //     setPhotosUploaded(prev => ({...prev, photo2: isSuccessful ? StateUploader.ok : StateUploader.error }));
	// }
	// const onFinishPhoto3 = (isSuccessful: boolean) => {		
    //     //isSuccessful && setPhotosUploaded(prev => ({...prev, photo3: true}));
    //     setPhotosUploaded(prev => ({...prev, photo3: isSuccessful ? StateUploader.ok : StateUploader.error }));
	// }


    return (
        <Row className="mt-3" xs={3}>
            <Form.Group as={Col} controlId="formIdInsp1" className="mt-3 align-self-end">
                <Controller
                    name="photo1"
                    control={controlFromUseForm}
                    render={({ field }) => (

                        <ImageS3Upload  
                            signingUrl={signingS3Url}
                            autoUpload={autoUpload}                            
                            emptyPhoto={noPhotoImage}
                            serverPhoto={serverPhoto}	
                            //onFinish={onFinishPhoto1}
                            resizer={resizerOptions}																	
                            {...field}
                            ref={photo1Ref}
                        />

                    )}
                />
            </Form.Group>

            <Form.Group as={Col} controlId="formIdInsp2" className="mt-3 align-self-end">
                <Controller
                    name="photo2"
                    control={controlFromUseForm}
                    render={({ field }) => (

                        <ImageS3Upload  
                            signingUrl={signingS3Url}
                            autoUpload={autoUpload}	
                            emptyPhoto={noPhotoImage}
                            serverPhoto={serverPhoto}
                            //onFinish={onFinishPhoto2}
                            resizer={resizerOptions}
                            {...field}
                            ref={photo2Ref}
                        />

                    )}
                />
            </Form.Group>

            <Form.Group as={Col} controlId="formIdInsp3" className="mt-3 align-self-end">
                <Controller
                    name="photo3"
                    control={controlFromUseForm}
                    render={({ field }) => (

                        <ImageS3Upload  
                            signingUrl={signingS3Url}
                            autoUpload={autoUpload}
                            emptyPhoto={noPhotoImage}
                            serverPhoto={serverPhoto}
                            //onFinish={onFinishPhoto3}
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
import {useState, useEffect, forwardRef, useRef, useImperativeHandle} from 'react';
import { Form, Button, Spinner , Row, Col, Modal } from "react-bootstrap";
import Image from 'react-bootstrap/Image';
import Resizer from "react-image-file-resizer";
import deleteImage from "./delete2.svg";

interface ImageS3UploadProps {
    signingUrl: string;
    autoUpload: boolean;
    //startUploadState?: boolean;
    value: string | undefined;
    onChange: (val: string) => void;    
    emptyPhoto?: string; 
    serverPhoto?: string | undefined | null; 
    buttonCaption?: string;

    resizer?: {
        enabled: boolean;
        autoResize: boolean;
        maxWidth: number;
        maxHeight: number;
        compressFormat: string;
        quality: number;
        rotation: number;
    };

    onFinish?: () => void;
    onProgress?: (percent: number) => void;
    onError?: (status: number, filename: string) => void;
    onSignedUrl?: (data: any)  => void;
}

interface RefObject {
    uploadFile: () => boolean
}


enum stateComponent {
    none,
    resizing,
    resized,
    uploading,
    uploaded,
    error
}

const defaultResizingOptions = {
    enabled: false,
    autoResize: true, // otherwise resizing will be preform before uploading
    maxWidth: 1280,
    maxHeight: 1280,
    compressFormat: "JPEG",
    quality: 70,
    rotation: 0
}

const ImageS3Upload = forwardRef<RefObject | undefined, ImageS3UploadProps>(({
    signingUrl,
    autoUpload,
    //startUploadState,
    emptyPhoto,
    serverPhoto,
    value,
    onChange,
    buttonCaption = 'Browse...',
    resizer = defaultResizingOptions,
    onFinish,
    onProgress,
    onError,
    onSignedUrl
}, ref) => {


    // to be able to call method uploadFile
    useImperativeHandle(ref, () => ({
        uploadFile: () => {
            //@ts-ignore
            if (inputFileEl?.current?.files && inputFileEl.current.files.length===1) {                
                if (status !== stateComponent.resizing) {
                    //@ts-ignore
                    startUpload(inputFileEl?.current?.files[0].name);
                    return true;
                }
                return false;
            }
            return false;             
        }
    }));


    const inputFileEl = useRef(null);
    
    const [status, setStatus] = useState<stateComponent>(stateComponent.none);
    const [imagePhoto, setImagePhoto] = useState<string | undefined>(undefined);
    const [compressedPhoto, setCompressedPhoto] = useState<any>(undefined);
    const [buttonCaptionState, setButtonCaptionState] = useState(buttonCaption);
    //const [stateUploading, setStateUploading] = useState(false);
    const [showSpinner, setShowSpinner] = useState<boolean>(false);    
    const [s3DataState, setS3DataState] = useState<any>(undefined);
    const [notLoad, setNotLoad] = useState(false); // to prevent loading photo from S3 when we have this photo in blob input element
   

    useEffect(()=>{
        if (emptyPhoto) {
            setImagePhoto(emptyPhoto);    
        }  
    }, []);



    useEffect(()=>{
        console.log('s3DataState', s3DataState); 
        if (s3DataState?.data?.fields?.key) {
            setNotLoad(true);
            onChange(s3DataState.data.fields.key);
        } 
    }, [s3DataState]);  

    useEffect(()=>{                
        
        if (value) {
            
            if (serverPhoto == null) {
                serverPhoto = '';    
            }

            if (serverPhoto.slice(-1) != '/' && value.slice(0, 1) != '/') { // if there is no symbol / between serverPhoto and value, just add it.
                serverPhoto = serverPhoto + '/';
            }

            if (!notLoad) { // to prevent loading photo from S3 when we have this photo in blob input element
                setButtonCaptionState(buttonCaption);
                setShowSpinner(false);
                if (inputFileEl?.current) {
                    //@ts-ignore
                    inputFileEl.current.value='';
                }
                                
                setImagePhoto(`${serverPhoto}${value}`);
                //console.log('serverPhotoValue', `${serverPhoto}${value}`); 
            }
                    
          
        } else {
            setImagePhoto(emptyPhoto);
            setButtonCaptionState(buttonCaption);
        }
               
        setNotLoad(false);
        
    }, [value]);   
    
    


    //useEffect(() => {
        //if (status === stateComponent.resizing) {
        //    setButtonCaptionState("Resizing...");
        //} else {
        //    setButtonCaptionState(buttonCaption);            
        //}   
    //}, [status])


        
{/*
    useEffect(()=>{
        if (startUploadState === true && stateUploading === false) {
            setStateUploading(true);
            //@ts-ignore
            if (inputFileEl?.current?.files && inputFileEl.current.files.length===1) {
                //@ts-ignore
                startUpload(inputFileEl?.current?.files[0].name);
            }    
        }
    }, [startUploadState]);
*/}


    const resizeFile = (file: any) =>
		new Promise((resolve) => {
			Resizer.imageFileResizer(
				file,
				resizer.maxWidth,
				resizer.maxHeight,
				resizer.compressFormat,
				resizer.quality,
				resizer.rotation,
				(uri) => {
					resolve(uri);
				},
				"blob"
			);
		});


    const onChangeFile = async (event: any) => {
        
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            //onChange(file.name);
            //setFilename(file.name);
            setImagePhoto(URL.createObjectURL(file)); 
            
            if (resizer.enabled && resizer.autoResize) {
                try {                
                    setStatus(stateComponent.resizing);
                    setButtonCaptionState("Resizing...")
                    const image = await resizeFile(file);

                    if (image instanceof Blob) {
                        setCompressedPhoto(image);
                        setStatus(stateComponent.resized);
                        setButtonCaptionState("Resized ");
    
                        if (autoUpload) {
                            startUpload(file.name);     
                        }
                        //console.log('image.size', humanFileSize(image.size));
                    } else {
                        setButtonCaptionState("Error");    
                    } 
                    


                } catch (err) {
                    console.log(err);
                    setStatus(stateComponent.error);
                    setButtonCaptionState("Error")
                }
            } else {
                if (autoUpload) {
                    startUpload(file.name);     
                }                
            }            

        }                
    };




	const fetchUrlSign = async (objectName: string) => {			

		let myHeaders = new Headers();
		myHeaders.append("Content-type", "application/json");  

        const bodyObject = {objectName: objectName};
        
        let res = await fetch(signingUrl, {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(bodyObject)
        });

		const json = await res.json();

        return JSON.parse(json);				
	}





    const updateProgress = (ev: any) => {
        if (ev.lengthComputable) {
            let percentComplete = Math.round((ev.loaded / ev.total) * 100);
            setButtonCaptionState(String(percentComplete)+'%');
            if (onProgress) {
                onProgress(percentComplete);
            }
            console.log('percentComplete', percentComplete);
            //$('#'+idElement+'_browse_button').html(percentComplete+'%');
        }
    } 

    const uploadFile = (file: any, s3Data: any) => {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", s3Data.url);
        xhr.timeout = 30000;
        xhr.upload.onprogress = updateProgress;

        let postData = new FormData();
		for (let key in s3Data.fields) {			
            if (key != 'file') { // in field "file" must be blob of file.
                postData.append(key, s3Data.fields[key]);
                //console.log('append', key, s3Data.fields[key]);
            }                    
		}
		postData.append("file", file); // blob

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				// done
				if (xhr.status === 200 || xhr.status === 204) {
                    setShowSpinner(false);
                    setButtonCaptionState('Done');
                    if (onFinish) {
                        onFinish();
                    }

                    
					//ok || 204 No Content
                } else {
					//SetStateSaveButton('saveButton', true, 'Запази');
					//SetStateSaveButton('saveInspButton', true, 'Запази');
					//$('#'+idElement+'_loading').hide();
					//$('#'+idElement+'_browse_button').html('Browse...');
					
                    if (onError) {
                        setShowSpinner(false);
                        setButtonCaptionState(`Error ${xhr.status}`);
                        onError(xhr.status, file.name);
                    }                    
                    
                    alert(
						"Error during file upload (status: " +
							xhr.status +
							"): " +
							file.name
					);
				}
			}  
		};


		xhr.onload = () => {
			// transaction completes successfully.
			console.log("transaction completes successfully.");
            //if (s3DataState?.data?.fields?.key) {
            //    onChange(s3DataState.data.fields.key);
            //}             
		};  


        xhr.onerror = () => {
            //SetStateSaveButton('saveButton', true, 'Запази');
            //SetStateSaveButton('saveInspButton', true, 'Запази');
            //$('#'+idElement+'_loading').hide();
            //$('#'+idElement+'_browse_button').html('Browse...');
            alert('Error during file upload: ' + file.name);
        };  
          
        
        console.log('postData', postData);
        xhr.send(postData);  

    
    //    {"data": {"url": "https://urbangis.s3.amazonaws.com/", "fields": {"acl": "public-read", "Content-Type": "image/jpeg", "key": "media/citytree/images_tree/user_None/None", "x-amz-algorithm": "AWS4-HMAC-SHA256", "x-amz-credential": "***REMOVED***/20220524/eu-central-1/s3/aws4_request", "x-amz-date": "20220524T105522Z", "policy": "eyJleHBpcmF0aW9uIjogIjIwMjItMDUtMjRUMTE6NTU6MjJaIiwgImNvbmRpdGlvbnMiOiBbeyJhY2wiOiAicHVibGljLXJlYWQifSwgeyJDb250ZW50LVR5cGUiOiAiaW1hZ2UvanBlZyJ9LCB7ImJ1Y2tldCI6ICJ1cmJhbmdpcyJ9LCB7ImtleSI6ICJtZWRpYS9jaXR5dHJlZS9pbWFnZXNfdHJlZS91c2VyX05vbmUvTm9uZSJ9LCB7IngtYW16LWFsZ29yaXRobSI6ICJBV1M0LUhNQUMtU0hBMjU2In0sIHsieC1hbXotY3JlZGVudGlhbCI6ICJBS0lBMllTTzdGRTVKQllPWEU1Qy8yMDIyMDUyNC9ldS1jZW50cmFsLTEvczMvYXdzNF9yZXF1ZXN0In0sIHsieC1hbXotZGF0ZSI6ICIyMDIyMDUyNFQxMDU1MjJaIn1dfQ==", "x-amz-signature": "75a181348c86194678752f6c726582a833408925226259efc0ad6858060d56bb", "file": null}}, "url": "https://urbangis.s3.amazonaws.com/media/citytree/images_tree/user_None/None", "file_exists": false}
    }




    const startUpload = async (filename: string) => {
        filename = filename.replace(/\s/g, ''); // remove spaces, because there is some problem with restAPI, which return url filename with %20 instead space, after that when we savind data again, %20 will be convert to %2520 (% = %25)

        setShowSpinner(true);
        setButtonCaptionState('Starting... ');
        setS3DataState(undefined);
        const signedUrl = await fetchUrlSign(filename);
        setS3DataState(signedUrl);  
        if (onSignedUrl) {
            onSignedUrl(signedUrl);
        }
        
        console.log('signedUrl', signedUrl);
        

        if (signedUrl.file_exists === false) {
            //@ts-ignore
            if (inputFileEl?.current?.files && inputFileEl.current.files.length===1) {
                //@ts-ignore
                const file = inputFileEl.current.files[0];

                if (resizer.enabled) {
                   
                    if (resizer.autoResize) { // photo already resized and stored in compressedPhoto
                        if (compressedPhoto) {
                            //@ts-ignore
                            uploadFile(compressedPhoto, signedUrl.data);
                        }
                    } else {
                        try {                

                            setStatus(stateComponent.resizing);
                            setButtonCaptionState("Resizing...")
                            const image = await resizeFile(file);
                            setStatus(stateComponent.resized);
                            setButtonCaptionState("Resized");
                            //@ts-ignore
                            uploadFile(image, signedUrl.data);                            
                        } catch (err) {
                            console.log(err);
                            setStatus(stateComponent.error);
                            setButtonCaptionState("Error")
                        }                        
                    }

                    
                } else {
                    //@ts-ignore
                    uploadFile(file, signedUrl.data);
                }                
            }
        } else {
            let rndStr = makeRandomStr(5);
            startUpload(rndStr + '_' + filename);            
        }
    
    }




    return (
        <div style={{position: "relative"}}>
            <Form.Group>
                <Image src={imagePhoto} fluid={true} rounded key={imagePhoto} /> {/* key to prevent showing previous loaded photos */}
                <a href="#">
                    {/*
                    <i className="far fa-times-circle fa-lg" 
                        style={{color: "#BB0000", position: "absolute", top: "-3px", right: "8px", textShadow: "0 0 3px white"}}
                        onClick={() => { 
                            //onChange("*will_be_deleted*"); 
                            //setFilename("*will_be_deleted*");
                            onChange(""); 
                            setImagePhoto(emptyPhoto);
                            if (inputFileEl?.current) {
                                //@ts-ignore
                                inputFileEl.current.value='';
                            }                             
                        }} 
                    />
                    */}   

                    <Image 
                        src={deleteImage} 
                        style={{width: "46px", height: "46px", position: "absolute", top: "-9px", right: "-8px"}} 
                        onClick={() => { 
                            onChange(""); 
                            setImagePhoto(emptyPhoto);
                            if (inputFileEl?.current) {
                                //@ts-ignore
                                inputFileEl.current.value='';
                            }                             
                        }}                     
                    />

                </a>
                
                <Button variant="outline-secondary" style={{width: "100%"}} className="mt-3"
                    onClick={()=>{
                        //onChange("Helloooo")
                        setShowSpinner(false);
                        setButtonCaptionState(buttonCaption);
                        //@ts-ignore                        
                        inputFileEl.current.click();
                    }}>
                    {showSpinner && <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    />}                
                    {buttonCaptionState}
                </Button>{' '}
                
                
                <input ref={inputFileEl} type="file" accept="image/*" style={{display: "none"}} 
                    onChange={onChangeFile}
                    /*
                    onChange={(e)=>{
                        if (e.target.files && e.target.files.length > 0) {
                            const file = e.target.files[0];
                            //onChange(file.name);
                            //setFilename(file.name);
                            setImagePhoto(URL.createObjectURL(file)); 
                            if (autoUpload) {
                                startUpload(file.name);     
                            }
                        }     
                    }}
                    */
                />

                
                {/* 
                <input ref={inputTextEl} style={{width: "100%"}}
                    //value={filename}
                    //onChange={({ target: { value } }) => onChange(value)}
                /> 


                

              

                    
                <img src="{% static 'images/no-photo.png' %}" class="img-fluid rounded" id="id_insp_img_photo1">
                            <a href="#"><i class="far fa-times-circle fa-2x iconDeletePhoto" onclick="document.getElementById('id_insp_photo1_new_name').value='*will_be_deleted*'; $('#id_insp_img_photo1').attr('src', '{% static 'images/no-photo.png' %}');"></i></a>

                */}
            </Form.Group>        
        </div>
  )

})






function makeRandomStr(length: number) {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
 charactersLength));
   }
   return result;
}




function humanFileSize(size: number) {
    const i = Math.floor( Math.log(size) / Math.log(1024) );
    const sSize = ( size / Math.pow(1024, i) ).toFixed(2);
    return `${sSize} ${['B', 'kB', 'MB', 'GB', 'TB'][i]}`;
    //return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    
};

export default ImageS3Upload
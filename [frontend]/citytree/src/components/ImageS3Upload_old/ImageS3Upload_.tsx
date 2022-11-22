import { useState, useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import Resizer from "react-image-file-resizer";
import deleteImage from "./delete2.svg";
import "./style.css";
import noImage from "./noimage.svg";

interface ImageS3UploadProps {
    signingUrl: string;
    autoUpload: boolean;    
    value: string;
    onChange: (e: any) => void;    
    emptyPhoto?: string; 
    serverPhoto?: string; 
    buttonCaption?: string;
    id?: string;
    name?: string;

    resizer?: {
        enabled: boolean;
        autoResize: boolean; // otherwise resizing will be preform before uploading
        maxWidth: number;
        maxHeight: number;
        compressFormat: string;
        quality: number;
        rotation: number;
    };

    onUploaded?: () => void;
    onProgress?: (percent: number) => void;
    onFinish?: () => void;
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
    startingUpload,
    uploading,
    uploaded,
    finish,
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
    emptyPhoto = noImage,
    serverPhoto,
    value,
    onChange,
    buttonCaption = 'Browse...',
    id = '',
    name = '',
    resizer = defaultResizingOptions,
    onUploaded,
    onProgress,
    onFinish,
    onError,
    onSignedUrl
}, ref) => {


    const inputFileEl = useRef(null);
    
    const [status, setStatus] = useState<{state: stateComponent, msg: string, intValue?: number}>({state: stateComponent.none, msg: ''});
    const [imagePhoto, setImagePhoto] = useState<string | undefined>(undefined);
    const [compressedPhoto, setCompressedPhoto] = useState<any>(undefined);
    const [buttonCaptionState, setButtonCaptionState] = useState(buttonCaption);
    const [showSpinner, setShowSpinner] = useState<boolean>(false);    
    const [s3DataState, setS3DataState] = useState<any>(undefined);
    const [notLoad, setNotLoad] = useState(false); // to prevent loading photo from S3 when we have this photo in blob input element
   

    // to be able to call method uploadFile
    useImperativeHandle(ref, () => ({
        uploadFile: () => { 
            if (status.state === stateComponent.finish || status.state === stateComponent.uploaded) {
                setStatus({state: stateComponent.finish, msg: ''});
                return false;
            } 
              
            //@ts-ignore
            if (inputFileEl?.current?.files && inputFileEl.current.files.length === 1) {                
                if (status.state !== stateComponent.resizing) {
                    //@ts-ignore
                    startUpload(inputFileEl?.current?.files[0].name);
                    return true;
                } 
                setStatus({state: stateComponent.error, msg: ''});               
                return false;
            }
            setStatus({state: stateComponent.finish, msg: ''});
            return false;                         
        }
    }));    

    useEffect(()=>{
        if (emptyPhoto) {
            setImagePhoto(emptyPhoto);    
        }  
    }, []);

    useEffect(()=>{
        //console.log('s3DataState', s3DataState); 
        if (s3DataState?.fields?.key) {
            setNotLoad(true);
  
            //onChange(s3DataState.fields.key);   
            fireOnChange(s3DataState.fields.key);
        } 
    }, [s3DataState]); 
    
    
    useEffect(()=>{                  
        if (status.state === stateComponent.none) {
            setButtonCaptionState(buttonCaption); 
        }  

        if (status.state === stateComponent.resizing) {
            setButtonCaptionState("Resizing...");
        }   

        if (status.state === stateComponent.resized) {
            setButtonCaptionState("Resized ");
        }   

        if (status.state === stateComponent.startingUpload) {
            setButtonCaptionState("Starting... ");
            setShowSpinner(true);
        }                          
          
        if (status.state === stateComponent.uploading) {
            setButtonCaptionState(status.msg);
            if (onProgress && status?.intValue) {
                onProgress(status.intValue);
            }
        }          
            
        if (status.state === stateComponent.uploaded) {
            setButtonCaptionState('Done');
            setShowSpinner(false); 
            if (onUploaded) onUploaded();   
            if (onFinish) onFinish();
        }

        if (onFinish && status.state === stateComponent.finish) {
            onFinish();
        }  
        
        if (status.state === stateComponent.error) {
            setButtonCaptionState("Error");
            setShowSpinner(false);
        }          
        
    }, [status]);


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
    


    const fireOnChange = (value: string) => {
        const event = {
            persist: () => {},
            target: {
              type: "change",
              id: id,
              name: name,
              value: value
            }
          };

          onChange(event);         
    }


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
            setStatus({state: stateComponent.none, msg: ''});
            const file = event.target.files[0];
            //onChange(file.name);
            //setFilename(file.name);
            setImagePhoto(URL.createObjectURL(file)); 
            
            if (resizer.enabled && resizer.autoResize) {
                try {                
                    setStatus({state: stateComponent.resizing, msg: ''});
                    //setButtonCaptionState("Resizing...")
                    const image = await resizeFile(file);

                    if (image instanceof Blob) {
                        setCompressedPhoto(image);
                        setStatus({state: stateComponent.resized, msg: ''});
                        //setButtonCaptionState("Resized ");
    
                        if (autoUpload) {
                            startUpload(file.name);     
                        }
                        //console.log('image.size', humanFileSize(image.size));
                    } else {
                        setStatus({state: stateComponent.error, msg: 'Resizing error.'});
                        //setButtonCaptionState("Error");    
                    } 
                    


                } catch (error) {
                    console.log('ERROR', error);
                    let message
                    if (error instanceof Error) message = error.message
                    else message = String(error)

                    setStatus({state: stateComponent.error, msg: message});
                    //setButtonCaptionState("Error")
                }
            } else {
                if (autoUpload) {
                    startUpload(file.name);     
                }                
            }            

        }                
    };




	const fetchUrlSign = async (fileName: string) => {			
		let myHeaders = new Headers();
		myHeaders.append("Content-type", "application/json");  

        const bodyObject = {objectName: fileName};
        
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
            setStatus({state: stateComponent.uploading, msg: String(percentComplete)+'%', intValue: percentComplete})
        }
    } 

    const uploadFile = async (file: any, s3Data: any) => {
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
				if (xhr.status === 200 || xhr.status === 204) { //ok || 204 No Content
                    //setShowSpinner(false);                    
                    setStatus({state: stateComponent.uploaded, msg: ''});
                    //setStatus({state: stateComponent.finish});
                } else {

                    if (onError) {
                        setShowSpinner(false);
                        setButtonCaptionState(`Error ${xhr.status}`);
                        onError(xhr.status, file.name);
                        setStatus({state: stateComponent.error, msg: String(xhr.status)});
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
			//console.log("transaction completes successfully.");
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
          
        
        //console.log('postData', postData);
        xhr.send(postData);  

    
    //    {"data": {"url": "https://urbangis.s3.amazonaws.com/", "fields": {"acl": "public-read", "Content-Type": "image/jpeg", "key": "media/citytree/images_tree/user_None/None", "x-amz-algorithm": "AWS4-HMAC-SHA256", "x-amz-credential": "***REMOVED***/20220524/eu-central-1/s3/aws4_request", "x-amz-date": "20220524T105522Z", "policy": "eyJleHBpcmF0aW9uIjogIjIwMjItMDUtMjRUMTE6NTU6MjJaIiwgImNvbmRpdGlvbnMiOiBbeyJhY2wiOiAicHVibGljLXJlYWQifSwgeyJDb250ZW50LVR5cGUiOiAiaW1hZ2UvanBlZyJ9LCB7ImJ1Y2tldCI6ICJ1cmJhbmdpcyJ9LCB7ImtleSI6ICJtZWRpYS9jaXR5dHJlZS9pbWFnZXNfdHJlZS91c2VyX05vbmUvTm9uZSJ9LCB7IngtYW16LWFsZ29yaXRobSI6ICJBV1M0LUhNQUMtU0hBMjU2In0sIHsieC1hbXotY3JlZGVudGlhbCI6ICJBS0lBMllTTzdGRTVKQllPWEU1Qy8yMDIyMDUyNC9ldS1jZW50cmFsLTEvczMvYXdzNF9yZXF1ZXN0In0sIHsieC1hbXotZGF0ZSI6ICIyMDIyMDUyNFQxMDU1MjJaIn1dfQ==", "x-amz-signature": "75a181348c86194678752f6c726582a833408925226259efc0ad6858060d56bb", "file": null}}, "url": "https://urbangis.s3.amazonaws.com/media/citytree/images_tree/user_None/None", "file_exists": false}
    }




    const startUpload = async (filename: string) => {
        filename = filename.replace(/\s/g, ''); // remove spaces, because there is some problem with restAPI, which return url filename with %20 instead space, after that when we savind data again, %20 will be convert to %2520 (% = %25)

        setStatus({state: stateComponent.startingUpload, msg: ''});
        setS3DataState(undefined);

        console.log('filename', filename);
        const signedUrl = await fetchUrlSign(filename);
        setS3DataState(signedUrl);  
        if (onSignedUrl) {
            onSignedUrl(signedUrl);
        }
        
        console.log('signedUrl', signedUrl);
        

        //if (signedUrl.file_exists === false) {
            //@ts-ignore
            if (inputFileEl?.current?.files && inputFileEl.current.files.length===1) {
                //@ts-ignore
                const file = inputFileEl.current.files[0];

                if (resizer.enabled) {
                   
                    if (resizer.autoResize) { // photo already resized and stored in compressedPhoto
                        if (compressedPhoto) {
                            //@ts-ignore
                            uploadFile(compressedPhoto, signedUrl);
                        }
                    } else {
                        try {                
                            setStatus({state: stateComponent.resizing, msg: ''});
                            //setButtonCaptionState("Resizing...")
                            const image = await resizeFile(file);
                            setStatus({state: stateComponent.resized, msg: ''});
                            //setButtonCaptionState("Resized");
                            //@ts-ignore
                            await uploadFile(image, signedUrl);                            
                        } catch (error) {
                            console.log('ERROR', error);
                            
                            let message;
                            if (error instanceof Error) message = error.message;
                            else message = String(error);
                            
                            setStatus({state: stateComponent.error, msg: message});
                            //setButtonCaptionState("Error")
                        }                        
                    }
                    
                } else {
                    //@ts-ignore
                    uploadFile(file, signedUrl, callbackFinish);
                }                
            }
        //} else {
        //    let rndStr = makeRandomStr(5);
        //    startUpload(rndStr + '_' + filename);            
        //}
    
    }


    const clearImage = () => {        
        fireOnChange('');
        setImagePhoto(emptyPhoto);        
        setStatus({state: stateComponent.none, msg: ''});
        if (inputFileEl?.current) {
            //@ts-ignore
            inputFileEl.current.value='';
        }         
    }



    return (
        <div className="imageS3UploadContainer" style={{position: "relative"}}>

            <img id="imageS3Upload" src={imagePhoto} key={imagePhoto} alt="" />
            
            <img style={{cursor: "pointer"}}
                id="imageDeleteIconS3Upload"
                src={deleteImage} 
                onClick={clearImage}                          
                alt="" 
            />
                                        
            {showSpinner && <span className="spinner"></span>} 

            <button 
                className="button" 
                type="button"
                onClick={()=>{                        
                    setShowSpinner(false);
                    setButtonCaptionState(buttonCaption);
                    //@ts-ignore                        
                    inputFileEl.current.click();
                }}
            >
                {buttonCaptionState}
                
            </button>{' '}
                                    
            <input ref={inputFileEl} type="file" accept="image/*" style={{display: "none"}} 
                onChange={onChangeFile}
            />                    
        </div>
    );

})



function makeRandomStr(length: number) {
    let result = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function humanFileSize(size: number) {
    const i = Math.floor( Math.log(size) / Math.log(1024) );
    const sSize = ( size / Math.pow(1024, i) ).toFixed(2);
    return `${sSize} ${['B', 'kB', 'MB', 'GB', 'TB'][i]}`;        
};

export default ImageS3Upload
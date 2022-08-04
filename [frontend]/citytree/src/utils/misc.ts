import { csrftoken } from '../constants/const'

export async function fetchUrl2(url: string, method: string, bodyObject?: any, tokenAccess?: string) {
    const myHeaders = getHTTPHeader(csrftoken, tokenAccess);

    const fetchResult = await fetch(url, {
        method: method,
        headers: myHeaders,
        body: JSON.stringify(bodyObject),
    });

    const result = await fetchResult.json();
    if (fetchResult.ok) {
        return result;
    }

    //@ts-ignore
    throw new fetchException(fetchResult.status, fetchResult.statusText, result.detail);    
};	

function fetchException(status: number, message: string, detail: string) {
    //@ts-ignore
    this.message = message;
    //@ts-ignore
    this.status = status;
    //@ts-ignore
    this.detail = detail;    
}	

function getHTTPHeader(csrftoken: string | null, accessToken: string | undefined){
    const myHeaders = new Headers();
    myHeaders.append("Content-type", "application/json");
    
    if (csrftoken) {
        myHeaders.append("X-CSRFToken", csrftoken);
        console.log('csrftoken', csrftoken);
    }	
    if (accessToken) {
        myHeaders.append("Authorization", "Bearer " + accessToken);
    }
    return myHeaders;
}



export function getCookie(name: string) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === name + "=") {
                cookieValue = decodeURIComponent(
                    cookie.substring(name.length + 1)
                );
                break;
            }
        }
    }
    return cookieValue;
}






// function fetchUrl(url: string, method: string, bodyObject?: any, tokenAccess?: string, callBackSucceed?: (data: any) => void) {
//     const myHeaders = getHTTPHeader(csrftoken, tokenAccess);

//     fetch(url, {
//         method: method,
//         headers: myHeaders,
//         body: JSON.stringify(bodyObject),
//     }).then(function (response) {
//         if (response.status >= 400) {
//             console.log('fetchUrl', response.status, response.statusText);

            
//             response.json().then((data) => {
//                 //@ts-ignore
//                 throw new fetchException(response.status, response.statusText, data.detail);
//             	// alert(
//             	// 	response.statusText +
//             	// 		" (" +
//             	// 		response.status +
//             	// 		")\n\n" +
//             	// 		data.detail
//             	// );
//             });
//         } else {
            
//             if (callBackSucceed) {

//                 response.json().then((data) => {
//                     callBackSucceed(data);
//                 })
                
//             }
//         }
//     });
// };
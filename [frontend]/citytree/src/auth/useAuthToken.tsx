import { useState } from 'react';
import { getCookie, fetchUrl2 } from "../utils/misc"
import { URL_VERIFY_TOKEN, URL_REFRESH_TOKEN } from '../constants/urlsAPI';

interface userTokenJson {
    access: string; 
    refresh: string; 
    user: {
        id: number; 
        name: string;
    }    
}


export const useAuthToken = () => {
        
    const [authToken, setAuthToken] = useState(getToken());

    function getToken() {        
        let tokenString;
        const rememberme = localStorage.getItem('rememberme');

        if (rememberme==='true') {
            tokenString = localStorage.getItem('token');
        } else {
            tokenString = sessionStorage.getItem('token');
        }
        
        if (tokenString) {            
            const json = JSON.parse(tokenString);
            const user = getUserInfoFromToken(json);
            if (user) {
                json.user = user;
            }      

            return json;        
        } else {
            return null;
        }
    };

    const saveToken = (userToken: userTokenJson | null) => {
        console.log('saveToken', userToken);
        if (userToken) {
            const rememberme = localStorage.getItem('rememberme');

            if (rememberme === 'true') {
                localStorage.setItem('token', JSON.stringify(userToken));
            } else {
                sessionStorage.setItem('token', JSON.stringify(userToken));
            }
                        
            const user = getUserInfoFromToken(userToken);
            if (user) {                
                if (userToken?.user) {
                    userToken.user = {...userToken.user, id: user.id, name: user.name}
                } else {
                    userToken.user = user;    
                }
                
            }            
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("rememberme"); 
            sessionStorage.removeItem("token");
        }           
        console.log('saveToken', userToken);
        setAuthToken(userToken);
    };    

    function getUserInfoFromToken(json: userTokenJson): {id: number; name: string} | undefined {
        let token = json?.access; 

        if (token) {
            const arToken = token.split('.');
            if (arToken.length > 1) {
                console.log('getUserInfoFromToken', JSON.parse(atob(arToken[1])));
                return {                    
                    "name": JSON.parse(atob(arToken[1])).username,
                    "id": JSON.parse(atob(arToken[1])).user_id
                }    
            }
        }
    }    


    return [authToken, saveToken];  
}


export async function userAuthentication(authToken: any, setAuthToken: any) {
    if (authToken) {
        const isTokenValid = await checkAuthToken(URL_VERIFY_TOKEN, authToken.access);
        console.log('isTokenValid', isTokenValid);
        
        if (isTokenValid) return true;
        
        if (!isTokenValid) {
            return await refreshTokens(setAuthToken, authToken.refresh);							
        }							
    }
    return false;
}

export async function checkAuthToken(urlCheckingToken: string, accessToken: string) {    
    try {
        await fetchUrl2(urlCheckingToken, 'POST', { token: accessToken }, accessToken); // if success, return just empty object {}
        return true;
    } catch (err) {
        console.log('checkAuthToken', err);
        return false;        
    }			
};	

export async function refreshTokens(setAuthToken: any, refreshToken: string) {
    const accessRefreshToken = await getNewAccessRefreshAuthToken(URL_REFRESH_TOKEN, refreshToken);        
    setAuthToken(accessRefreshToken);
    if (accessRefreshToken) return true;
    return false;				
}



export async function getNewAccessRefreshAuthToken(urlRefreshingToken: string, refreshToken: string){
    try {
        const response = await fetchUrl2(urlRefreshingToken, 'POST', { refresh: refreshToken });
        return response;
    } catch (err) {
        console.log('getNewAccessRefreshAuthToken', err);
        return null;        
    }
    
    
    
    // const csrftoken = getCookie("csrftoken");
    // let myHeaders = new Headers();
    // myHeaders.append("Content-type", "application/json");
    // if (csrftoken) {
    //     myHeaders.append("X-CSRFToken", csrftoken);
    // }	

    // const response = await fetch(urlRefreshingToken, {
    //     method: "POST",
    //     headers: myHeaders,
    //     body: JSON.stringify({ refresh: refreshToken }),
    // });
    
    // if (response.status >= 400) {
    //     return null;
    // } else {
    //     const responseJson = await response.json();
    //     return responseJson;	
    // }		
};
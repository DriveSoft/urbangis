import { useState } from 'react';
import { getCookie } from "./utils/misc"


export const useAuthToken = () => {
    
    const getUserInfoFromToken = (json: {access: string; refresh: string}) =>{
        let token = json?.access; 

        if (token) {
            const arToken = token.split('.');
            if (arToken.length > 1) {
                return {
                    "name": JSON.parse(atob(arToken[1])).username,
                    "id": JSON.parse(atob(arToken[1])).user_id
                }    
            }
        }
    }
    
    const getToken = () => {
        let tokenString;
        const rememberme = localStorage.getItem('rememberme');

        if (rememberme==='true') {
            tokenString = localStorage.getItem('token');
        } else {
            tokenString = sessionStorage.getItem('token');
        }
        
        if (tokenString) {
            let json = JSON.parse(tokenString);
            const user = getUserInfoFromToken(json);
            if (user) {
                json.user = user;
            }            
            return json;
        } else {
            return null;
        }
    };

    const [authToken, setAuthToken] = useState(getToken());


    const saveToken = (userToken: {access: string; refresh: string; user?: {id: number; name: string}} | null) => {
        if (userToken) {

            const rememberme = localStorage.getItem('rememberme');

            if (rememberme === 'true') {
                localStorage.setItem('token', JSON.stringify(userToken));
            } else {
                sessionStorage.setItem('token', JSON.stringify(userToken));
            }
                        
            const user = getUserInfoFromToken(userToken);
            if (user) {
                userToken.user = user;
            }            
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("rememberme"); 
            sessionStorage.removeItem("token");
        }           
        setAuthToken(userToken);
    };    


    return {
        setAuthToken: saveToken,
        authToken
    }    
}


export async function checkAuthToken(urlCheckingToken: string, accessToken: string) {
    const body = { token: accessToken }		
    const myHeaders = new Headers();
    const csrftoken = getCookie("csrftoken");

    myHeaders.append("Content-type", "application/json");
    if (csrftoken) {
        myHeaders.append("X-CSRFToken", csrftoken);
    }	

    const response = await fetch(urlCheckingToken, {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(body),
    });

    //const responseJson = await response.json();
    
    if (response.status >= 400) {
        //console.log(">= 400", responseJson);					
        return false;
    } else {
        //console.log("ok", responseJson);
        return true;
    }			
};	

export async function getNewAccessRefreshAuthToken(urlRefreshingToken: string, refreshToken: string){
    const csrftoken = getCookie("csrftoken");
    let myHeaders = new Headers();
    myHeaders.append("Content-type", "application/json");
    if (csrftoken) {
        myHeaders.append("X-CSRFToken", csrftoken);
    }	

    const response = await fetch(urlRefreshingToken, {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({ refresh: refreshToken }),
    });
    
    if (response.status >= 400) {
        return null;
    } else {
        const responseJson = await response.json();
        return responseJson;	
    }		
};
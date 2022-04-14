import { useState } from 'react';

export default function useAuthToken() {
    
    const getUsernameFromToken = (json: {access: string; refresh: string}) =>{
        let token = json?.access 

        if (token) {
            const arToken = token.split('.')
            if (arToken.length > 1) {
                return JSON.parse(atob(arToken[1])).username
            }
        }
    }
    
    const getToken = () => {
        let tokenString
        const rememberme = localStorage.getItem('rememberme')

        if (rememberme==='true') {
            tokenString = localStorage.getItem('token')
        } else {
            tokenString = sessionStorage.getItem('token')
        }
        

        if (tokenString) {
            let json = JSON.parse(tokenString)
            const userName = getUsernameFromToken(json)
            if (userName) {
                json.username = userName
            }            
            return json
        } else {
            return null
        }
      };

    const [authToken, setAuthToken] = useState(getToken());


    const saveToken = (userToken: {access: string; refresh: string; username?: string} | null) => {
        if (userToken) {

            const rememberme = localStorage.getItem('rememberme')

            if (rememberme === 'true') {
                localStorage.setItem('token', JSON.stringify(userToken));
            } else {
                sessionStorage.setItem('token', JSON.stringify(userToken));
            }
            
            
            const userName = getUsernameFromToken(userToken)
            if (userName) {
                userToken.username = userName
            }            
        } else {
            localStorage.removeItem("token")    
            localStorage.removeItem("rememberme") 
            sessionStorage.removeItem("token")
        }           
        setAuthToken(userToken);
    };    


    return {
        setAuthToken: saveToken,
        authToken
    }    
}
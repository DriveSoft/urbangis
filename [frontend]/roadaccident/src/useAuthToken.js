import { useState } from 'react';

export default function useAuthToken() {
    const getUsernameFromToken = (json) =>{
        let token = json?.access 

        if (token) {
            const arToken = token.split('.')
            if (arToken.length > 1) {
                return JSON.parse(atob(arToken[1])).username
            }
        }
    }
    
    const getToken = () => {
        const tokenString = localStorage.getItem('token');
        let json = JSON.parse(tokenString)
        const userName = getUsernameFromToken(json)
        if (userName) {
            json.username = userName
        }
        return json
      };

    const [authToken, setAuthToken] = useState(getToken());


    const saveToken = userToken => {
        if (userToken) {
            localStorage.setItem('token', JSON.stringify(userToken));
            
            const userName = getUsernameFromToken(userToken)
            if (userName) {
                userToken.username = userName
            }            
        } else {
            localStorage.removeItem("token")    
        }           
        setAuthToken(userToken);
    };    

    return {
        setAuthToken: saveToken,
        authToken
    }    
}
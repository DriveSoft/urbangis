import { useEffect, useState } from 'react'
import { useTranslation } from "react-i18next";

const URL_LOGIN = `${process.env.REACT_APP_API_URL}token/`;

interface Credentials {
	username: string; 
	password: string; 
	rememberme: boolean;
} 

interface userTokenJson {
    access: string; 
    refresh: string; 
    user: {
        id: number; 
        name: string;
    }    
}

interface LoginFormProps {
    setAuthToken: (userToken: userTokenJson | null) => void | null;
    setShowLoginModal: (b: boolean) => void;
	setShowRegisterModal: (b: boolean) => void;	
}

const LoginForm = ( { setAuthToken, setShowLoginModal, setShowRegisterModal }: LoginFormProps  ) => {
	const { t } = useTranslation();
    const buttonCaptionDef = t("loginModalForm.words.login");

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);

    const [buttonCaption, setButtonCaption] = useState(buttonCaptionDef);
    const [wrongAuth, setWrongAuth] = useState(false);



    useEffect(()=>{
        let intervalId: any = undefined;

        if (wrongAuth) {
			setButtonCaption(t('loginModalForm.words.wrongPassword'));
			intervalId = setInterval(() => {
				setButtonCaption(buttonCaptionDef);
                setWrongAuth(false);
			}, 3000);
		}

        return ()=>{
            if (intervalId) clearInterval(intervalId);
        }

    }, [wrongAuth])


    const handleSubmit = (e: any) => {
        e.preventDefault();
        setWrongAuth(false);
        localStorage.setItem("rememberme", rememberMe.toString());
        
		if (!username || !password) {
			setWrongAuth(true);	
			return;
		}
		
		loginUser(
            {
                username: username,
                password: password,
                rememberme: rememberMe
            }
        );
    }

	async function loginUser(credentials: Credentials) {
		console.log(credentials)
		return fetch(URL_LOGIN, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},

			body: JSON.stringify(credentials),
		}).then((data) => {
			if (data.status === 200) {
				data.json().then((data) => {							
					console.log('setAuthToken', data);
					setAuthToken(data);	
                    setWrongAuth(false);
                    setShowLoginModal(false);										
				});
			} else if (data.status === 401) {
				setWrongAuth(true);
			}
		});
	}



	return (
		<form onSubmit={handleSubmit}>
			<div className="inputWithIcon">
				<input type="text" placeholder={t('registerModalForm.username')} value={username} onChange={(e)=>setUsername(e.target.value)} />
				<i className="fa fa-user fa-lg fa-fw" aria-hidden="true"></i>
			</div>

			<div className="inputWithIcon">
				<input type="password" placeholder={t('registerModalForm.password')} value={password} onChange={(e)=>setPassword(e.target.value)} />
				<i
					className="fa-solid fa-lock fa-lg fa-fw"
					aria-hidden="true"
				></i>
			</div>

			<div className="inputCheckBox">
				<input
					type="checkbox"	
                    id="rememberme"				
					name="rememberme"
					checked={rememberMe}
                    onChange={(e)=>setRememberMe(e.target.checked)}

				/>
				<label htmlFor="rememberme"> {t("loginModalForm.rememberme")}</label>
			</div>

			<div className="modalFooter">
				<button type="submit" className={wrongAuth ? "buttonShake": ""} style={{ backgroundColor: wrongAuth ? "red" : "dodgerBlue" }}>{buttonCaption}</button>
			</div>

			<div className="footerText">
				<p>{t("loginModalForm.words.dontHaveAccount")} <a href="#" onClick={() => {setShowLoginModal(false); setShowRegisterModal(true);}}>{t("loginModalForm.words.signup")}</a></p>
			</div>
		</form>
	);
};

export default LoginForm
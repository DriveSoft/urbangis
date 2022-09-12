import { listenerCount } from 'process';
import { useEffect, useState } from 'react'
import { useTranslation } from "react-i18next";

const URL_REGISTER = `${process.env.REACT_APP_API_URL}users/`;

interface RegisterData {
	username: string;
	email: string;
	password: string;
	password2: string;
	first_name: string;
	last_name: string;
} 

interface userTokenJson {
    access: string; 
    refresh: string; 
    user: {
        id: number; 
        name: string;
    }    
}

interface RegisterFormProps {
    setAuthToken: (userToken: userTokenJson | null) => void | null;
    setShowRegisterModal: (b: boolean) => void;
	setShowLoginModal: (b: boolean) => void;	
}

const RegisterForm = ( { setAuthToken, setShowRegisterModal, setShowLoginModal }: RegisterFormProps  ) => {
	const initData: RegisterData = {
		username: '',
		email: '',
		password:  '',
		password2: '',
		first_name:'',
		last_name: ''	
	};

	
	const { t } = useTranslation();
    const buttonCaptionDef = t("loginModalForm.words.login");

    const [formData, setFormData] = useState(initData);
	const [showSuccessMsg, setShowSuccessMsg] = useState(false);

    const [buttonCaption, setButtonCaption] = useState(buttonCaptionDef);
    const [smthWrong, setSmthWrong] = useState(false);
	const [formErrors, setFormErrors] = useState<{[key: string]: string[]}>({});



    useEffect(()=>{
        let intervalId: any = undefined;

        if (smthWrong) {			
			intervalId = setInterval(() => {
				setButtonCaption(buttonCaptionDef);
                setSmthWrong(false);
			}, 3000);
		}

        return ()=>{
            if (intervalId) clearInterval(intervalId);
        }

    }, [smthWrong]);


    const handleSubmit = (e: any) => {
        e.preventDefault();
        setSmthWrong(false);
		setFormErrors({});						
        registerUser(formData);
    }

	async function registerUser(registerData: RegisterData) {
		console.log(registerData)
		return fetch(URL_REGISTER, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},

			body: JSON.stringify(registerData),
		}).then((data) => {
			if (data.status === 200) {
				data.json().then((data) => {							
                    //setShowRegisterModal(false);										
					setShowSuccessMsg(true);
				});
			} else if (data.status === 400) {
				setSmthWrong(true);
				data.json().then((data) => {							
					setFormErrors(data);					
				});				
			}
		});
	}


	const showErrors = (field: string, formErrors: {[key: string]: string[]}) => {		
		const errors = formErrors[field];
		if (!Array.isArray(errors)) return;


		return (<div style={{marginTop: "-10px", color: "red"}}>
			{errors.map((message)=><p><small>{message}</small></p>)}	
		</div>);
	}


	return (
		<>
		{!showSuccessMsg ?

			<form onSubmit={handleSubmit}>
				<div className="inputWithIcon">
					<input type="text" placeholder={t('registerModalForm.username')} value={formData.username} onChange={(e)=>setFormData({...formData, username: e.target.value})} />
					<i className="fa fa-user fa-lg fa-fw" aria-hidden="true"></i>
					{showErrors('username', formErrors)}
				</div>

				<div className="inputWithIcon">
					<input type="email" placeholder="E-mail" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} />
					<i className="fa-solid fa-envelope fa-lg" aria-hidden="true"></i>
					{showErrors('email', formErrors)}
				</div>			

				<div className="inputWithIcon">
					<input type="password" placeholder={t('registerModalForm.password')} value={formData.password} onChange={(e)=>setFormData({...formData, password: e.target.value})} />
					<i className="fa-solid fa-lock fa-lg fa-fw" aria-hidden="true"></i>
					{showErrors('password', formErrors)}
				</div>

				<div className="inputWithIcon">
					<input type="password" placeholder={t('registerModalForm.confirmPassword')} value={formData.password2} onChange={(e)=>setFormData({...formData, password2: e.target.value})} />
					<i className="fa-solid fa-lock fa-lg fa-fw" aria-hidden="true"></i>
					{showErrors('password2', formErrors)}
				</div>	

				<div style={{display: "flex", gap: "13px"}}>
					<div className="inputWithIcon">
						<input type="text" placeholder={t('registerModalForm.firstname')} value={formData.first_name} onChange={(e)=>setFormData({...formData, first_name: e.target.value})} />
						<i className="fa fa-user fa-lg fa-fw" aria-hidden="true"></i>
						{showErrors('first_name', formErrors)}
					</div>

					<div className="inputWithIcon">
						<input type="text" placeholder={t('registerModalForm.lastname')} value={formData.last_name} onChange={(e)=>setFormData({...formData, last_name: e.target.value})} />
						<i className="fa fa-user fa-lg fa-fw" aria-hidden="true"></i>
						{showErrors('last_name', formErrors)}
					</div>
				</div>		



				<div className="modalFooter">
					<button type="submit" className={smthWrong ? "buttonShake": ""} style={{ backgroundColor: smthWrong ? "red" : "dodgerBlue" }}>{t("registerModalForm.buttonRegister")}</button>
				</div>

				<div className="footerText">
					<p>{t("registerModalForm.words.alreadyHaveAccount")} <a href="#" onClick={() => {setShowRegisterModal(false); setShowLoginModal(true);}}>{t("registerModalForm.words.login")}</a></p>
				</div>
			</form>

		: 
			<div style={{display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100px"}}>
				<p>Congratulation!</p>
			</div>
		}
		</>
	);
};

export default RegisterForm
import { useState, useEffect } from "react";
import { Form, Button, FloatingLabel, Modal, Col, Row } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from 'react-i18next'

import { useSelector, useDispatch } from 'react-redux'
import { actLoginModalShow, actRegisterModalShow } from '../actions'

const RegisterModalForm = ({
	setAuthToken,
}) => {

	const dispatch = useDispatch();
	const rxRegisterModalShow = useSelector(state => state.uiReducer.registerModalShow)	
	
	const { t } = useTranslation()

	useEffect(() => {
		reset();	
	}, [rxRegisterModalShow]);

	const {
		control,
		handleSubmit,
		reset,
        setError,
		formState: { errors },
	} = useForm({
		//reValidateMode: 'onChange',
		defaultValues: {
			username: "",
			email: "",
			password: "",
			password2: "",
			first_name: "",
			last_name: "",
		},
	});




	const OnSubmitForm = (data) => {
		registerUser(data);
	};

	async function registerUser(credentials) {

		return fetch("http://localhost:8000/api/users/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},

			body: JSON.stringify(credentials),

		}).then((data) => {            
			if (data.status === 200) {
				data.json().then((data) => {	
                    console.log('ok', data)				
                    //setRegisterModalShow(false);
					dispatch(actRegisterModalShow(false))
                    setAuthToken(data.token) // after register make login					
				});

			} else if (data.status >= 400) {
				data.json().then((data) => {
					console.log(data)
                
                    for (const [key, value] of Object.entries(data)) {                
                        setError(key, {
                            type: "manual",
                            message: value,
                        }); 
                    }                   
				});                
				
			}
		});
	}



	return (
		<Modal
			//{...props}
			//show={show}
			show={rxRegisterModalShow}
			//onHide={onHide}
			onHide={() => dispatch(actRegisterModalShow(false))}
			aria-labelledby="contained-modal-title-vcenter"
			centered
		>
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-vcenter">
					{t('registerForm.title')}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form onSubmit={handleSubmit(OnSubmitForm)}>
					<Form.Group className="mb-3" controlId="formRegister">
						
                
                        {errors?.username?.message && (
							<Form.Text className="text-danger">
								{errors.username.message.map(value => <p key={value} className="mb-0">{value}</p>)}
							</Form.Text>                           
						)}                        

						<FloatingLabel
							controlId="floatingUsername"
							label={t('registerForm.username')}
							className="mb-3"
						>
							<Controller
								name="username"
								control={control}
								rules={{ required: true }}
								render={({ field }) => (
									<Form.Control
										type="text"
										placeholder={t('registerForm.username')}
										isInvalid={!!errors.username}
										{...field}
									/>
								)}
							/>
						</FloatingLabel>

                        
                        {errors?.email?.message && (
							<Form.Text className="text-danger">
								{errors.email.message.map(value => <p key={value} className="mb-0">{value}</p>)}
							</Form.Text>                           
						)}                          

						<FloatingLabel
							controlId="floatingEmail"
							label={t('registerForm.email')}
							className="mb-3"
						>
							<Controller
								name="email"
								control={control}
								rules={{ required: true }}
								render={({ field }) => (
									<Form.Control
										type="text"
										placeholder={t('registerForm.email')}
										isInvalid={!!errors.email}
										{...field}
									/>
								)}
							/>
						</FloatingLabel>


                        {errors?.password?.message && (
							<Form.Text className="text-danger">
								{errors.password.message.map(value => <p key={value} className="mb-0">{value}</p>)}
							</Form.Text>                           
						)}  

						<FloatingLabel
							controlId="floatingPassword"
							label={t('registerForm.password')}
							className="mb-3"
						>
							<Controller
								name="password"
								control={control}
								rules={{ required: true }}
								render={({ field }) => (
									<Form.Control
										type="password"
										placeholder={t('registerForm.password')}
										isInvalid={!!errors.password}
										{...field}
									/>
								)}
							/>
						</FloatingLabel>

						<FloatingLabel
							controlId="floatingPassword2"
							label={t('registerForm.confirmPassword')}
							className="mb-3"
						>
							<Controller
								name="password2"
								control={control}
								rules={{ required: true }}
								render={({ field }) => (
									<Form.Control
										type="password"
										placeholder={t('registerForm.confirmPassword')}
										isInvalid={!!errors.password2}
										{...field}
									/>
								)}
							/>
						</FloatingLabel>

						<Row>
							<Col>
								<Controller
									name="first_name"
									control={control}
									rules={{ required: false }}
									render={({ field }) => (
										<Form.Control
											type="text"
											size="sm"
											placeholder={t('registerForm.firstNameOptional')}
											isInvalid={!!errors.first_name}
											{...field}
										/>
									)}
								/>
							</Col>

							<Col>
								<Controller
									name="last_name"
									control={control}
									rules={{ required: false }}
									render={({ field }) => (
										<Form.Control
											type="text"
											size="sm"
											placeholder={t('registerForm.lastNameOptional')}
											isInvalid={!!errors.last_name}
											{...field}
										/>
									)}
								/>
							</Col>
						</Row>
					</Form.Group>


					<Button
						className="mb-3"
						variant="primary"
						type="submit"
						style={{ display: "block", width: "100%" }}
					>
						{t('registerForm.register')}
					</Button>

					<Form.Text className="text-muted mb-0">
						<p className="text-center">
							{t('registerForm.alreadyHaveAccount')}{" "}
							<a
								href="#"
								onClick={() => {
									//setRegisterModalShow(false);
									//setLoginModalShow(true);
									dispatch(actRegisterModalShow(false))
									dispatch(actLoginModalShow(true))
								}}
							>
								{t('registerForm.login')}
							</a>
						</p>
					</Form.Text>
				</Form>
			</Modal.Body>
		</Modal>
	);
};

export default RegisterModalForm;

import { useState, useEffect } from "react";
import { Form, Button, FloatingLabel, Modal, Col, Row } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";

const RegisterModalForm = ({
	show,
	onHide,
	setRegisterModalShow,
	setLoginModalShow,
	setAuthToken,
}) => {
	

	useEffect(() => {
		reset();	
	}, [show]);

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
                    setRegisterModalShow(false);
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
			show={show}
			onHide={onHide}
			aria-labelledby="contained-modal-title-vcenter"
			centered
		>
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-vcenter">
					SIGN UP
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
							label="Username"
							className="mb-3"
						>
							<Controller
								name="username"
								control={control}
								rules={{ required: true }}
								render={({ field }) => (
									<Form.Control
										type="text"
										placeholder="Username"
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
							label="Email"
							className="mb-3"
						>
							<Controller
								name="email"
								control={control}
								rules={{ required: true }}
								render={({ field }) => (
									<Form.Control
										type="text"
										placeholder="Email"
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
							label="Password"
							className="mb-3"
						>
							<Controller
								name="password"
								control={control}
								rules={{ required: true }}
								render={({ field }) => (
									<Form.Control
										type="password"
										placeholder="Password"
										isInvalid={!!errors.password}
										{...field}
									/>
								)}
							/>
						</FloatingLabel>

						<FloatingLabel
							controlId="floatingPassword2"
							label="Confirm password"
							className="mb-3"
						>
							<Controller
								name="password2"
								control={control}
								rules={{ required: true }}
								render={({ field }) => (
									<Form.Control
										type="password"
										placeholder="Password"
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
											placeholder="Firstname (optional)"
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
											placeholder="Lastname (optional)"
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
						REGISTER
					</Button>

					<Form.Text className="text-muted mb-0">
						<p className="text-center">
							Already have an account?{" "}
							<a
								href="#"
								onClick={() => {
									setRegisterModalShow(false);
									setLoginModalShow(true);
								}}
							>
								Login
							</a>
						</p>
					</Form.Text>
				</Form>
			</Modal.Body>
		</Modal>
	);
};

export default RegisterModalForm;

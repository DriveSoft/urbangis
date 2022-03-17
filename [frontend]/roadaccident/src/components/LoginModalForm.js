import { useState, useEffect } from 'react'
import { Form, Button, FloatingLabel, Modal } from "react-bootstrap";
import { useForm, Controller  } from 'react-hook-form'

const LoginModalForm = ({ show, onHide, setLoginModalShow, setRegisterModalShow, setAuthToken }) => {

    const [showWrongPassword, setShowWrongPassword] = useState(false)

    useEffect(() => {
        reset()
        setShowWrongPassword(false)
    }, [show])


    const { control, handleSubmit, reset, formState: { errors }  } = useForm({
        //reValidateMode: 'onChange',
        defaultValues: {
            username: '',
            password: '',
        }
    }); 




    async function loginUser(credentials) {
        return fetch(`${process.env.REACT_APP_API_URL}token/`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},

			body: JSON.stringify(credentials),
		})
			.then((data) => {
                if (data.status === 200) {
                    data.json().then((data) => {
						setAuthToken(data)
                        //console.log(data.access);
                        setShowWrongPassword(false)
                        setLoginModalShow(false)
					});
                } else if (data.status === 401) {
                    setShowWrongPassword(true)
                }
				
			});
    }




    const OnSubmitForm = (data) => {
        setShowWrongPassword(false)
        loginUser(data)        
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
					SIGN IN
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form onSubmit={handleSubmit(OnSubmitForm)}>
					<Form.Group className="mb-3" controlId="formLogin">
						<FloatingLabel
							controlId="floatingInput"
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

						<FloatingLabel
							controlId="floatingPassword"
							label="Password"
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
					</Form.Group>

					<Form.Group className="mb-3" controlId="formBasicCheckbox">
						<Form.Check type="checkbox" label="Remember me" />
					</Form.Group>

					{showWrongPassword && (
						<Form.Text className="text-danger">
							Wrong username or password.
						</Form.Text>
					)}

					<Button
						className="mb-3"
						variant="primary"
						type="submit"
						style={{ display: "block", width: "100%" }}
					>
						LOGIN
					</Button>

					<Form.Text className="text-muted mb-0">
						<p className="text-center">
							Don't have account? <a href="#" onClick={()=> { setLoginModalShow(false); setRegisterModalShow(true) } }>Sign up</a>
						</p>
					</Form.Text>
				</Form>
			</Modal.Body>
		</Modal>
	);
};

export default LoginModalForm;

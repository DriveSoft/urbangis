import { useState, useEffect } from 'react'
import { Form, Button, FloatingLabel, Modal } from "react-bootstrap";
import { useForm, Controller  } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useSelector, useDispatch } from 'react-redux'
import { actLoginModalShow, actRegisterModalShow } from '../actions'

const LoginModalForm = ({
	//show,
	//onHide,
	//setLoginModalShow,
	//setRegisterModalShow,
	setAuthToken,
}) => {
	const dispatch = useDispatch();
	const rxLoginModalShow = useSelector(state => state.uiReducer.loginModalShow)

	const [showWrongPassword, setShowWrongPassword] = useState(false);
	const { t } = useTranslation();

	useEffect(() => {
		reset();
		setShowWrongPassword(false);
	}, [rxLoginModalShow]);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		//reValidateMode: 'onChange',
		defaultValues: {
			username: "",
			password: "",
			rememberme: false,
		},
	});

	async function loginUser(credentials) {
		//console.log(credentials)
		return fetch(`${process.env.REACT_APP_API_URL}token/`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},

			body: JSON.stringify(credentials),
		}).then((data) => {
			if (data.status === 200) {
				data.json().then((data) => {
					//data.rememberme = credentials.rememberme
					setAuthToken(data);
					//console.log(data);
					setShowWrongPassword(false);

					//setLoginModalShow(false)
					dispatch(actLoginModalShow(false));
				});
			} else if (data.status === 401) {
				setShowWrongPassword(true);
			}
		});
	}

	const OnSubmitForm = (data) => {
		setShowWrongPassword(false);
		localStorage.setItem("rememberme", data.rememberme);
		loginUser(data);
	};

	return (
		<Modal
			//{...props}
			//show={show}
			show={rxLoginModalShow}
			//onHide={onHide}
			onHide={() => dispatch(actLoginModalShow(false))}
			aria-labelledby="contained-modal-title-vcenter"
			centered
		>
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-vcenter">
					{t("loginForm.title")}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form onSubmit={handleSubmit(OnSubmitForm)}>
					<Form.Group className="mb-3" controlId="formLogin">
						<FloatingLabel
							controlId="floatingInput"
							label={t("loginForm.username")}
							className="mb-3"
						>
							<Controller
								name="username"
								control={control}
								rules={{ required: true }}
								render={({ field }) => (
									<Form.Control
										type="text"
										placeholder={t("loginForm.username")}
										isInvalid={!!errors.username}
										{...field}
									/>
								)}
							/>
						</FloatingLabel>

						<FloatingLabel
							controlId="floatingPassword"
							label={t("loginForm.password")}
						>
							<Controller
								name="password"
								control={control}
								rules={{ required: true }}
								render={({ field }) => (
									<Form.Control
										type="password"
										placeholder={t("loginForm.password")}
										isInvalid={!!errors.password}
										{...field}
									/>
								)}
							/>
						</FloatingLabel>
					</Form.Group>

					<Form.Group className="mb-3" controlId="formBasicCheckbox">
						<Controller
							name="rememberme"
							control={control}
							rules={{ required: false }}
							render={({ field }) => (
								<Form.Check
									type="checkbox"
									label={t("loginForm.rememberMe")}
									{...field}
								/>
							)}
						/>
					</Form.Group>

					{showWrongPassword && (
						<Form.Text className="text-danger">
							{t("loginForm.wrongUsernamePassword")}
						</Form.Text>
					)}

					<Button
						className="mb-3"
						variant="primary"
						type="submit"
						style={{ display: "block", width: "100%" }}
					>
						{t("loginForm.login")}
					</Button>

					<Form.Text className="text-muted mb-0">
						<p className="text-center">
							{/* {t('loginForm.dontHaveAccount')} <a href="#" onClick={()=> { setLoginModalShow(false); setRegisterModalShow(true) } }>{t('loginForm.signUp')}</a> */}
							{t("loginForm.dontHaveAccount")}{" "}
							<a
								href="#"
								onClick={() => {
									dispatch(actLoginModalShow(false));
									dispatch(actRegisterModalShow(true));
								}}
							>
								{t("loginForm.signUp")}
							</a>
						</p>
					</Form.Text>
				</Form>
			</Modal.Body>
		</Modal>
	);
};

export default LoginModalForm;

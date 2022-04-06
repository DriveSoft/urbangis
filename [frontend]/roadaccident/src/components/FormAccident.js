import { useState, useEffect, useRef } from 'react'
import { useForm, Controller  } from 'react-hook-form'
import { Form, Button, Card, Row, Col, Modal} from 'react-bootstrap'
import Select from "react-select";
import "@fortawesome/fontawesome-free/css/all.min.css"

import Datetime from 'react-datetime'
import "react-datetime/css/react-datetime.css"

import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'


function FormAccident({
	onSubmitAccident,
	onDeleteAccident,
	onCloseAccident,
	dataAccidentForm,
	//currentCity,
}) {
	const rxNewMarkerState = useSelector((state) => state.uiReducer.newMarkerState)
	const rxDictManeuvers = useSelector(state => state.dataReducer.dictManeuvers)
    const rxDictTypeViolations = useSelector(state => state.dataReducer.dictTypeViolations)
    const rxDictViolators = useSelector(state => state.dataReducer.dictViolators)	

	const [showModalDelete, setShowModalDelete] = useState(false);
	const dateTimeRef = useRef(null);
	const { t } = useTranslation();

	//const handleShowModalDeleteClose = () => setShowModalDelete(false);

	useEffect(() => {
		if (rxNewMarkerState.visible) {
			reset();

			// perhaps a bug of component, value is not reset, so reset it manually
			dateTimeRef.current.state.inputValue = "";
			dateTimeRef.current.state.selectedDate = undefined;

			setValue("latAccidentForm", rxNewMarkerState.position.lat);
			setValue("lngAccidentForm", rxNewMarkerState.position.lng);
		}
	}, [rxNewMarkerState]);

	useEffect(() => {
		let formData = {};

		formData.accidentId = dataAccidentForm?.properties?.id;
		formData.latAccidentForm = dataAccidentForm?.properties?.latitude;
		formData.lngAccidentForm = dataAccidentForm?.properties?.longitude;
		formData.descAccidentForm = dataAccidentForm?.properties?.description;

		if (dataAccidentForm?.properties?.datetime) {
			formData.dateTimeAccidentForm = moment(
				dataAccidentForm?.properties?.datetime
			);
		}

		let maneuver = dataAccidentForm?.properties?.maneuver;
		if (maneuver) {
			formData.maneuverAccidentForm = optionsManeuverFilter.find(
				(item) => item.value === maneuver
			);
		}

		let violations_type = dataAccidentForm?.properties?.violations_type;
		if (violations_type) {
			violations_type = violations_type.map((item) => parseInt(item));
			formData.violationsTypeAccidentForm =
				optionsTypeViolationsFilter.filter((item) =>
					violations_type.includes(item.value)
				);
		}

		let violators = dataAccidentForm?.properties?.violators;
		if (violators) {
			violators = violators.map((item) => parseInt(item));
			formData.violatorsAccidentForm = optionsViolatorsFilter.filter(
				(item) => violators.includes(item.value)
			);
		}

		formData.driversInjuredAccidentForm =
			dataAccidentForm?.properties?.drivers_injured;
		formData.motorcyclistsInjuredAccidentForm =
			dataAccidentForm?.properties?.motorcyclists_injured;
		formData.cyclistsInjuredAccidentForm =
			dataAccidentForm?.properties?.cyclists_injured;
		formData.pedInjuredAccidentForm =
			dataAccidentForm?.properties?.ped_injured;
		formData.kidsInjuredAccidentForm =
			dataAccidentForm?.properties?.kids_injured;
		formData.pubtrPassengersInjuredAccidentForm =
			dataAccidentForm?.properties?.pubtr_passengers_injured;

		formData.driversKilledAccidentForm =
			dataAccidentForm?.properties?.drivers_killed;
		formData.motorcyclistsKilledAccidentForm =
			dataAccidentForm?.properties?.motorcyclists_killed;
		formData.cyclistsKilledAccidentForm =
			dataAccidentForm?.properties?.cyclists_killed;
		formData.pedKilledAccidentForm =
			dataAccidentForm?.properties?.ped_killed;
		formData.kidsKilledAccidentForm =
			dataAccidentForm?.properties?.kids_killed;
		formData.pubtrPassengersKilledAccidentForm =
			dataAccidentForm?.properties?.pubtr_passengers_killed;

		formData.publicTransportInvolvedAccidentForm =
			dataAccidentForm?.properties?.public_transport_involved;

		//formData.violationsTypeAccidentForm = [{value: 1, label: 'Преминаване на червено'}, {value: 3, label: 'Самокатастрофирал'}]

		//setValue("violationsTypeAccidentForm",[{value: 1, label: 'Преминаване на червено'}, {value: 3, label: 'Самокатастрофирал'}]);

		//formData.violationsTypeAccidentForm =

		//console.log('optionsTypeViolationsFilter', optionsTypeViolationsFilter)
		//console.log('violations_type', violations_type)

		//console.log('dictManeuvers', dictManeuvers)
		//setValue("maneuverAccidentForm", {value: 2, label: 'При завой надясно'}, { shouldValidate: true });
		//setValue("maneuverAccidentForm",[{value: 'optionA', label:'Option A'}]);

		reset(formData, { keepDefaultValues: true });
	}, [dataAccidentForm]);

	let optionsManeuverFilter = [];
	if (Array.isArray(rxDictManeuvers)) {
		optionsManeuverFilter = rxDictManeuvers.map((x) => {
			return {
				value: x.id,
				label: t(`sidebar.filterTab.maneuversList.${x.maneuvername}`),
			};
		});
	}

	let optionsTypeViolationsFilter = [];
	if (Array.isArray(rxDictTypeViolations)) {
		optionsTypeViolationsFilter = rxDictTypeViolations.map((x) => {
			return {
				value: x.id,
				label: t(
					`sidebar.filterTab.typeViolationsList.${x.violationname}`
				),
			};
		});
	}

	let optionsViolatorsFilter = [];
	if (Array.isArray(rxDictViolators)) {
		optionsViolatorsFilter = rxDictViolators.map((x) => {
			return {
				value: x.id,
				label: t(`sidebar.filterTab.violatorsList.${x.violatorname}`),
			};
		});
	}

	const {
		control,
		handleSubmit,
		reset,
		setValue,
		getValues,
		formState: { errors },
	} = useForm({
		//reValidateMode: 'onChange',
		defaultValues: {
			latAccidentForm: "",
			lngAccidentForm: "",
			descAccidentForm: "",
			dateTimeAccidentForm: "",
			maneuverAccidentForm: null,
			violationsTypeAccidentForm: [],
			violatorsAccidentForm: [],

			driversInjuredAccidentForm: 0,
			motorcyclistsInjuredAccidentForm: 0,
			cyclistsInjuredAccidentForm: 0,
			pedInjuredAccidentForm: 0,
			kidsInjuredAccidentForm: 0,
			pubtrPassengersInjuredAccidentForm: 0,

			driversKilledAccidentForm: 0,
			motorcyclistsKilledAccidentForm: 0,
			cyclistsKilledAccidentForm: 0,
			pedKilledAccidentForm: 0,
			kidsKilledAccidentForm: 0,
			pubtrPassengersKilledAccidentForm: 0,

			publicTransportInvolvedAccidentForm: false,

			accidentId: "",
		},
	});

	function prepareOnSubmitAccident(data) {
		let dataRest = {};

		dataRest.id = parseInt(getValues("accidentId")) || null;
		//dataRest.city = currentCity
		dataRest.latitude = getValues("latAccidentForm");
		dataRest.longitude = getValues("lngAccidentForm");
		dataRest.datetime = getValues("dateTimeAccidentForm").format(
			"YYYY-MM-DDTHH:mm"
		);

		dataRest.maneuver = getValues("maneuverAccidentForm")?.value;
		if (dataRest.maneuver === undefined) {
			dataRest.maneuver = null;
		}

		dataRest.description = getValues("descAccidentForm");
		dataRest.violations_type = getValues("violationsTypeAccidentForm").map(
			(item) => item.value
		);
		dataRest.violators = getValues("violatorsAccidentForm").map(
			(item) => item.value
		);

		dataRest.drivers_injured =
			parseInt(getValues("driversInjuredAccidentForm")) || 0;
		dataRest.motorcyclists_injured =
			parseInt(getValues("motorcyclistsInjuredAccidentForm")) || 0;
		dataRest.cyclists_injured =
			parseInt(getValues("cyclistsInjuredAccidentForm")) || 0;
		dataRest.ped_injured =
			parseInt(getValues("pedInjuredAccidentForm")) || 0;
		dataRest.kids_injured =
			parseInt(getValues("kidsInjuredAccidentForm")) || 0;
		dataRest.pubtr_passengers_injured =
			parseInt(getValues("pubtrPassengersInjuredAccidentForm")) || 0;

		dataRest.drivers_killed =
			parseInt(getValues("driversKilledAccidentForm")) || 0;
		dataRest.motorcyclists_killed =
			parseInt(getValues("motorcyclistsKilledAccidentForm")) || 0;
		dataRest.cyclists_killed =
			parseInt(getValues("cyclistsKilledAccidentForm")) || 0;
		dataRest.ped_killed = parseInt(getValues("pedKilledAccidentForm")) || 0;
		dataRest.kids_killed =
			parseInt(getValues("kidsKilledAccidentForm")) || 0;
		dataRest.pubtr_passengers_killed =
			parseInt(getValues("pubtrPassengersKilledAccidentForm")) || 0;

		dataRest.public_transport_involved = getValues(
			"publicTransportInvolvedAccidentForm"
		);

		onSubmitAccident(dataRest);
	}

	return (
		<div>
			<Form
				className="m-1"
				onSubmit={handleSubmit(prepareOnSubmitAccident)}
			>
				<Row>
					<Form.Group as={Col} controlId="formDateFromFilter">
						<Form.Label>
							{t("sidebar.accidentTab.latLng")}{" "}
							<a href="#">
								<i className="fas fa-edit align-middle"></i>
							</a>
						</Form.Label>
					</Form.Group>

					<Form.Group as={Col} controlId="formLatAccident">
						<Controller
							name="latAccidentForm"
							control={control}
							rules={{ required: true }}
							render={({ field }) => (
								<Form.Control
									type="number"
									step="any"
									size="sm"
									isInvalid={!!errors.latAccidentForm}
									{...field}
								/>
							)}
						/>

						<Form.Control.Feedback type="invalid">
							{t("words.requiredField")}
						</Form.Control.Feedback>
					</Form.Group>

					<Form.Group as={Col} controlId="formLngAccident">
						<Controller
							name="lngAccidentForm"
							control={control}
							rules={{ required: true }}
							render={({ field }) => (
								<Form.Control
									type="number"
									step="any"
									size="sm"
									isInvalid={!!errors.lngAccidentForm}
									{...field}
								/>
							)}
						/>
						<Form.Control.Feedback type="invalid">
							{t("words.requiredField")}
						</Form.Control.Feedback>
					</Form.Group>
				</Row>

				<Form.Group
					controlId="formDescriptionAccident"
					className="mt-3"
				>
					<Form.Label>
						{t("sidebar.accidentTab.description")}
					</Form.Label>
					<Controller
						name="descAccidentForm"
						control={control}
						render={({ field }) => (
							<Form.Control
								type="text"
								as="textarea"
								rows={3}
								{...field}
							/>
						)}
					/>
				</Form.Group>

				<Row className="mt-3">
					<Form.Group
						as={Col}
						controlId="formDateTimeAccident"
						style={{ minWidth: "250px" }}
					>
						<Form.Label>
							{t("sidebar.accidentTab.datetime")}
						</Form.Label>
						<Controller
							name="dateTimeAccidentForm"
							control={control}
							rules={{ required: true }}
							render={({ field }) => (
								<Datetime {...field} ref={dateTimeRef} />
							)}
						/>
						{errors.dateTimeAccidentForm ? (
							<p style={{ color: "red" }}>
								<small>Required field</small>
							</p>
						) : (
							""
						)}
					</Form.Group>

					<Form.Group as={Col} controlId="formManeuverAccident">
						<Form.Label>
							{t("sidebar.accidentTab.vehicleManeuver")}
						</Form.Label>
						<Controller
							name="maneuverAccidentForm"
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									isClearable
									isSearchable={false}
									options={optionsManeuverFilter}
								/>
							)}
						/>
					</Form.Group>
				</Row>

				<Form.Group
					controlId="formViolationsTypeAccident"
					className="mt-3"
				>
					<Form.Label>
						{t("sidebar.accidentTab.violationsType")}
					</Form.Label>
					<Controller
						name="violationsTypeAccidentForm"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								isMulti
								isSearchable={false}
								options={optionsTypeViolationsFilter}
							/>
						)}
					/>
				</Form.Group>

				<Form.Group controlId="formViolatorsAccident" className="mt-3">
					<Form.Label>
						{t("sidebar.accidentTab.violators")}
					</Form.Label>
					<Controller
						name="violatorsAccidentForm"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								isMulti
								isSearchable={false}
								options={optionsViolatorsFilter}
							/>
						)}
					/>
				</Form.Group>

				<Row className="mt-3">
					<Form.Group as={Col} controlId="formInjuredLabelAccident">
						<Form.Label style={{ marginTop: "32px" }}>
							{t("sidebar.accidentTab.injured")}
						</Form.Label>
					</Form.Group>

					<Form.Group
						as={Col}
						controlId="formDriversInjuredAccident"
						className="ps-1 pe-0"
					>
						<Form.Label>
							<i
								className="fas fa-car fa-lg"
								title={t(
									"sidebar.accidentTab.driverAndPassengers"
								)}
							></i>
						</Form.Label>
						<Controller
							name="driversInjuredAccidentForm"
							control={control}
							render={({ field }) => (
								<Form.Control
									type="number"
									size="sm"
									min="0"
									max="99"
									{...field}
								/>
							)}
						/>
					</Form.Group>

					<Form.Group
						as={Col}
						controlId="formMotorcyclistsInjuredAccident"
						className="ps-1 pe-0"
					>
						<Form.Label>
							<i
								className="fas fa-motorcycle fa-lg"
								title={t("sidebar.accidentTab.motorcyclist")}
							></i>
						</Form.Label>
						<Controller
							name="motorcyclistsInjuredAccidentForm"
							control={control}
							render={({ field }) => (
								<Form.Control
									type="number"
									size="sm"
									min="0"
									max="99"
									{...field}
								/>
							)}
						/>
					</Form.Group>

					<Form.Group
						as={Col}
						controlId="formCyclistsInjuredAccident"
						className="ps-1 pe-0"
					>
						<Form.Label>
							<i
								className="fas fa-bicycle fa-lg"
								title={t("sidebar.accidentTab.cyclist")}
							></i>
						</Form.Label>
						<Controller
							name="cyclistsInjuredAccidentForm"
							control={control}
							render={({ field }) => (
								<Form.Control
									type="number"
									size="sm"
									min="0"
									max="99"
									{...field}
								/>
							)}
						/>
					</Form.Group>

					<Form.Group
						as={Col}
						controlId="formPedInjuredAccident"
						className="ps-1 pe-0"
					>
						<Form.Label>
							<i
								className="fas fa-walking fa-lg"
								title={t("sidebar.accidentTab.pedestrian")}
							></i>
						</Form.Label>
						<Controller
							name="pedInjuredAccidentForm"
							control={control}
							render={({ field }) => (
								<Form.Control
									type="number"
									size="sm"
									min="0"
									max="99"
									{...field}
								/>
							)}
						/>
					</Form.Group>

					<Form.Group
						as={Col}
						controlId="formKidsInjuredAccident"
						className="ps-1 pe-0"
					>
						<Form.Label>
							<i
								className="fas fa-baby fa-lg"
								title={t("sidebar.accidentTab.kid")}
							></i>
						</Form.Label>
						<Controller
							name="kidsInjuredAccidentForm"
							control={control}
							render={({ field }) => (
								<Form.Control
									type="number"
									size="sm"
									min="0"
									max="99"
									{...field}
								/>
							)}
						/>
					</Form.Group>

					<Form.Group
						as={Col}
						controlId="formPubtrPassengersInjuredAccident"
						className="ps-1 pe-0"
					>
						<Form.Label>
							<i
								className="fas fa-bus-alt fa-lg"
								title={t(
									"sidebar.accidentTab.publicTransPassenger"
								)}
							></i>
						</Form.Label>
						<Controller
							name="pubtrPassengersInjuredAccidentForm"
							control={control}
							render={({ field }) => (
								<Form.Control
									type="number"
									size="sm"
									min="0"
									max="99"
									{...field}
								/>
							)}
						/>
					</Form.Group>
				</Row>

				<Row className="mt-0">
					<Form.Group as={Col} controlId="formKilledLabelAccident">
						<Form.Label>
							{t("sidebar.accidentTab.killed")}
						</Form.Label>
					</Form.Group>

					<Form.Group
						as={Col}
						controlId="formDriversKilledAccident"
						className="ps-1 pe-0"
					>
						<Controller
							name="driversKilledAccidentForm"
							control={control}
							render={({ field }) => (
								<Form.Control
									type="number"
									size="sm"
									min="0"
									max="99"
									{...field}
								/>
							)}
						/>
					</Form.Group>

					<Form.Group
						as={Col}
						controlId="formMotorcyclistsKilledAccident"
						className="ps-1 pe-0"
					>
						<Controller
							name="motorcyclistsKilledAccidentForm"
							control={control}
							render={({ field }) => (
								<Form.Control
									type="number"
									size="sm"
									min="0"
									max="99"
									{...field}
								/>
							)}
						/>
					</Form.Group>

					<Form.Group
						as={Col}
						controlId="formCyclistsKilledAccident"
						className="ps-1 pe-0"
					>
						<Controller
							name="cyclistsKilledAccidentForm"
							control={control}
							render={({ field }) => (
								<Form.Control
									type="number"
									size="sm"
									min="0"
									max="99"
									{...field}
								/>
							)}
						/>
					</Form.Group>

					<Form.Group
						as={Col}
						controlId="formPedKilledAccident"
						className="ps-1 pe-0"
					>
						<Controller
							name="pedKilledAccidentForm"
							control={control}
							render={({ field }) => (
								<Form.Control
									type="number"
									size="sm"
									min="0"
									max="99"
									{...field}
								/>
							)}
						/>
					</Form.Group>

					<Form.Group
						as={Col}
						controlId="formKidsKilledAccident"
						className="ps-1 pe-0"
					>
						<Controller
							name="kidsKilledAccidentForm"
							control={control}
							render={({ field }) => (
								<Form.Control
									type="number"
									size="sm"
									min="0"
									max="99"
									{...field}
								/>
							)}
						/>
					</Form.Group>

					<Form.Group
						as={Col}
						controlId="formPubtrPassengersKilledAccident"
						className="ps-1 pe-0"
					>
						<Controller
							name="pubtrPassengersKilledAccidentForm"
							control={control}
							render={({ field }) => (
								<Form.Control
									type="number"
									size="sm"
									min="0"
									max="99"
									{...field}
								/>
							)}
						/>
					</Form.Group>
				</Row>

				<Form.Group
					controlId="formPublicTransportInvolvedAccident"
					className="mt-3 ms-1"
				>
					<Controller
						name="publicTransportInvolvedAccidentForm"
						control={control}
						render={({ field }) => (
							<Form.Check
								{...field}
								checked={field["value"] ?? false}
								inline
								label={t(
									"sidebar.accidentTab.publicTransInvolved"
								)}
								type="checkbox"
								id="idPublicTransportInvolvedAccident"
							/>
						)}
					/>
				</Form.Group>

				<Form.Group controlId="formIdAccident" className="mt-3">
					<Controller
						name="accidentId"
						control={control}
						render={({ field }) => (
							<Form.Control
								type="number"
								size="sm"
								min="0"
								style={{ display: "none" }}
								{...field}
							/>
						)}
					/>
				</Form.Group>

				<div className="mt-4 me-2 float-end">
					<Button
						onClick={() => setShowModalDelete(true)}
						variant="light"
					>
						{t("sidebar.accidentTab.delete")}
					</Button>{" "}
					<Button onClick={onCloseAccident} variant="secondary">
						{t("sidebar.accidentTab.close")}
					</Button>{" "}
					<Button
						type="submit"
						variant="primary"
						style={{ minWidth: "110px" }}
					>
						{t("sidebar.accidentTab.save")}
					</Button>
				</div>
			</Form>

			<Modal
				show={showModalDelete}
				onHide={() => setShowModalDelete(false)}
			>
				<Modal.Header closeButton>
					<Modal.Title>{t("words.deleting")}</Modal.Title>
				</Modal.Header>
				<Modal.Body>{t("words.confirmDeleting")}</Modal.Body>
				<Modal.Footer>
					<Button
						variant="light"
						onClick={() => {
							setShowModalDelete(false);
							onDeleteAccident(getValues("accidentId"));
						}}
					>
						{t("words.delete")}
					</Button>
					<Button
						variant="secondary"
						onClick={() => setShowModalDelete(false)}
					>
						{t("words.cancel")}
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
}

export default FormAccident

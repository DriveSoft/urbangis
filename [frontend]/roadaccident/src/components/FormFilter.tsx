import { useState, useEffect } from 'react'
import { useForm, Controller  } from 'react-hook-form'
import { Form, Button, Card, Row, Col, } from 'react-bootstrap';
import Select from "react-select";
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux'
import { RootState } from '../reducers/index'


interface FormFilterProps {
	onSubmitFilter: (filter: {}) => void;
}


const FormFilter = ({onSubmitFilter}: FormFilterProps) => {
    const rxDictManeuvers = useSelector((state: RootState) => state.dataReducer.dictManeuvers)
    const rxDictTypeViolations = useSelector((state: RootState) => state.dataReducer.dictTypeViolations)
    const rxDictViolators = useSelector((state: RootState) => state.dataReducer.dictViolators)
	const rxMinMaxDateData = useSelector((state: RootState) => state.dataReducer.minMaxDateData)
	const { t, i18n } = useTranslation();

	// used to set default values for dates control, because when it renders first time, minMaxDateData is still empty, after that I just can't change def values, so do it manually
	useEffect(() => {
		setDefaultsForDates();
	}, [rxMinMaxDateData]);

	function setDefaultsForDates() {
		setValue("dateFromFilter", rxMinMaxDateData.minDate);
		setValue("dateToFilter", rxMinMaxDateData.maxDate);
	}

	const { control, handleSubmit, reset, setValue } = useForm({
		reValidateMode: "onChange",
		defaultValues: {
			dateFromFilter: "",
			dateToFilter: "",
			descFilter: "",
			maneuverFilter: "",
			violationsTypeFilter: "",
			violatorsFilter: "",

			driverViolationFilter: false,
			motorcyclistViolationFilter: false,
			cyclistViolationFilter: false,
			pedestrianViolationFilter: false,
			
            driverInjuredFilter: false,
            motorcyclistInjuredFilter: false,
            cyclistInjuredFilter: false,
            pedestrianInjuredFilter: false,           
            kidsInjuredFilter: false,
			pubtrPassengersInjuredFilter: false,

			driversKilledFilter: false,
			motorcyclistsKilledFilter: false,
			cyclistsKilledFilter: false,
			pedestrianKilledFilter: false,
			kidsKilledFilter: false,
			pubtrPassengersKilledFilter: false,

			publicTransportInvolvedFilter: false,
			showOnlyMyAccidentsFilter: false,

			select: {},
		},
	});

	//let optionsManeuverFilter = []
	//let arManeuvers = dictsContex?.dictManeuvers
	//if (Array.isArray(arManeuvers)) {
	//  optionsManeuverFilter = arManeuvers.map((x) => { return {value: x.id, label: x.maneuvername} })
	//}

	//let optionsTypeViolationsFilter = []
	//let arTypeViolations = dictsContex?.dictTypeViolations
	//if (Array.isArray(arTypeViolations)) {
	//    optionsTypeViolationsFilter = arTypeViolations.map((x) => { return {value: x.id, label: x.violationname} })
	//}

	//let optionsViolatorsFilter = []
	//let arViolators = dictsContex?.dictViolators
	//if (Array.isArray(arViolators)) {
	//    optionsViolatorsFilter = arViolators.map((x) => { return {value: x.id, label: x.violatorname} })
	//}

	let optionsManeuverFilter: {value: string; label: string}[] = [];
	if (Array.isArray(rxDictManeuvers)) {
		optionsManeuverFilter = rxDictManeuvers.map((x) => {
			return {
				value: x.id,
				label: t(`sidebar.filterTab.maneuversList.${x.maneuvername}`),
			};
		});
	}


	let optionsTypeViolationsFilter: {value: string; label: string}[] = [];
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


	let optionsViolatorsFilter: {value: string; label: string}[] = [];
	if (Array.isArray(rxDictViolators)) {
		optionsViolatorsFilter = rxDictViolators.map((x) => {
			return {
				value: x.id,
				label: t(`sidebar.filterTab.violatorsList.${x.violatorname}`),
			};
		});
	}

	function onResetButton() {
		reset();
		setDefaultsForDates();
		onSubmitFilter({});
	}

	return (
		<div>
			<Form className="m-1" onSubmit={handleSubmit(onSubmitFilter)}>
				<Row>
					<Form.Group as={Col} controlId="formDateFromFilter">
						<Form.Label>{t<string>("sidebar.filterTab.from")}</Form.Label>
						<Controller
							name="dateFromFilter"
							control={control}
							render={({ field }) => (
								<Form.Control type="date" {...field} />
							)}
						/>
					</Form.Group>

					<Form.Group as={Col} controlId="formDateToFilter">
						<Form.Label>{t<string>("sidebar.filterTab.to")}</Form.Label>
						<Controller
							name="dateToFilter"
							control={control}
							render={({ field }) => (
								<Form.Control type="date" {...field} />
							)}
						/>
					</Form.Group>
				</Row>

				<Row className="mt-3">
					<Form.Group
						as={Col}
						controlId="formManeuverFilter"
						style={{ minWidth: "250px" }}
					>
						<Form.Label>
							{t<string>("sidebar.filterTab.vehicleManeuver")}
						</Form.Label>
						<Controller
							name="maneuverFilter"
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									isClearable
									isSearchable={false}
									//@ts-ignore
									options={optionsManeuverFilter}
								/>
							)}
						/>
					</Form.Group>

					<Form.Group as={Col} controlId="formDescFilter">
						<Form.Label>
							{t<string>("sidebar.filterTab.description")}
						</Form.Label>
						<Controller
							name="descFilter"
							control={control}
							render={({ field }) => (
								<Form.Control type="text" {...field} />
							)}
						/>
					</Form.Group>
				</Row>

				<Form.Group
					controlId="formViolationsTypeFilter"
					className="mt-3"
				>
					<Form.Label>
						{t<string>("sidebar.filterTab.violationsType")}
					</Form.Label>
					<Controller
						name="violationsTypeFilter"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								isMulti
								isSearchable={false}
								//@ts-ignore
								options={optionsTypeViolationsFilter}
							/>
						)}
					/>
				</Form.Group>

				<Form.Group controlId="formviolatorsFilter" className="mt-3">
					<Form.Label>{t<string>("sidebar.filterTab.violators")}</Form.Label>
					<Controller
						name="violatorsFilter"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								isMulti
								isSearchable={false}
								//@ts-ignore
								options={optionsViolatorsFilter}
							/>
						)}
					/>
				</Form.Group>

				<Card body className="mt-3">
					<Card.Title>
						<h6>{t<string>("sidebar.filterTab.injured")}</h6>
					</Card.Title>

					<Controller
						name="driverInjuredFilter"
						control={control}
						render={({ field }) => (
							//@ts-ignore
							<Form.Check
								{...field}
								checked={field["value"] ?? false}
								inline
								label={t<string>("sidebar.filterTab.driver")}
								type="checkbox"
								id="idDriverInjuredFilter"
							/>
						)}
					/>

					<Controller
						name="motorcyclistInjuredFilter"
						control={control}
						render={({ field }) => (
							//@ts-ignore
							<Form.Check
								{...field}
								checked={field["value"] ?? false}
								inline
								label={t<string>("sidebar.filterTab.motorcyclist")}
								type="checkbox"
								id="idMotorcyclistInjuredFilter"
							/>
						)}
					/>

					<Controller
						name="cyclistInjuredFilter"
						control={control}
						render={({ field }) => (
							//@ts-ignore
							<Form.Check
								{...field}
								checked={field["value"] ?? false}
								inline
								label={t<string>("sidebar.filterTab.cyclist")}
								type="checkbox"
								id="idCyclistInjuredFilter"
							/>
						)}
					/>

					<Controller
						name="pedestrianInjuredFilter"
						control={control}
						render={({ field }) => (
							//@ts-ignore
							<Form.Check
								{...field}
								checked={field["value"] ?? false}
								inline
								label={t<string>("sidebar.filterTab.pedestrian")}
								type="checkbox"
								id="idPedestrianInjuredFilter"
							/>
						)}
					/>

					<Controller
						name="kidsInjuredFilter"
						control={control}
						render={({ field }) => (
							//@ts-ignore
							<Form.Check
								{...field}
								checked={field["value"] ?? false}
								inline
								label={t<string>("sidebar.filterTab.kid")}
								type="checkbox"
								id="idKidsInjuredFilter"
							/>
						)}
					/>

					<Controller
						name="pubtrPassengersInjuredFilter"
						control={control}
						render={({ field }) => (
							//@ts-ignore
							<Form.Check
								{...field}
								checked={field["value"] ?? false}
								inline
								label={t<string>("sidebar.filterTab.pubtrPassenger")}
								type="checkbox"
								id="idPubtrPassengersInjuredFilter"
							/>
						)}
					/>
				</Card>

				<Card body className="mt-3">
					<Card.Title>
						<h6>{t<string>("sidebar.filterTab.killed")}</h6>
					</Card.Title>

					<Controller
						name="driversKilledFilter"
						control={control}
						render={({ field }) => (
							//@ts-ignore
							<Form.Check
								{...field}
								checked={field["value"] ?? false}
								inline
								label={t<string>("sidebar.filterTab.driver")}
								type="checkbox"
								id="idDriversKilledFilter"
							/>
						)}
					/>

					<Controller
						name="motorcyclistsKilledFilter"
						control={control}
						render={({ field }) => (
							//@ts-ignore
							<Form.Check
								{...field}
								checked={field["value"] ?? false}
								inline
								label={t<string>("sidebar.filterTab.motorcyclist")}
								type="checkbox"
								id="idMotorcyclistsKilledFilter"
							/>
						)}
					/>

					<Controller
						name="cyclistsKilledFilter"
						control={control}
						render={({ field }) => (
							//@ts-ignore
							<Form.Check
								{...field}
								checked={field["value"] ?? false}
								inline
								label={t<string>("sidebar.filterTab.cyclist")}
								type="checkbox"
								id="idCyclistsKilledFilter"
							/>
						)}
					/>

					<Controller
						name="pedestrianKilledFilter"
						control={control}
						render={({ field }) => (
							//@ts-ignore
							<Form.Check
								{...field}
								checked={field["value"] ?? false}
								inline
								label={t<string>("sidebar.filterTab.pedestrian")}
								type="checkbox"
								id="idPedestrianKilledFilter"
							/>
						)}
					/>

					<Controller
						name="kidsKilledFilter"
						control={control}
						render={({ field }) => (
							//@ts-ignore
							<Form.Check
								{...field}
								checked={field["value"] ?? false}
								inline
								label={t<string>("sidebar.filterTab.kid")}
								type="checkbox"
								id="idKidsKilledFilter"
							/>
						)}
					/>

					<Controller
						name="pubtrPassengersKilledFilter"
						control={control}
						render={({ field }) => (
							//@ts-ignore
							<Form.Check
								{...field}
								checked={field["value"] ?? false}
								inline
								label={t<string>("sidebar.filterTab.pubtrPassenger")}
								type="checkbox"
								id="idPubtrPassengersKilledFilter"
							/>
						)}
					/>
				</Card>

				<Form.Group
					controlId="formPublicTransportInvolvedFilter"
					className="mt-3 ms-1"
				>
					<Controller
						name="publicTransportInvolvedFilter"
						control={control}
						render={({ field }) => (
							//@ts-ignore
							<Form.Check
								{...field}
								checked={field["value"] ?? false}
								inline
								label={t<string>(
									"sidebar.filterTab.publicTransportInvolved"
								)}
								type="checkbox"
								id="idPublicTransportInvolvedFilter"
							/>
						)}
					/>
				</Form.Group>

				<Form.Group
					controlId="formShowOnlyMyAccidentsFilter"
					className="mt-3 ms-1"
				>
					<Controller
						name="showOnlyMyAccidentsFilter"
						control={control}
						render={({ field }) => (
							//@ts-ignore
							<Form.Check
								{...field}
								checked={field["value"] ?? false}
								inline
								label={t<string>(
									"sidebar.filterTab.showOnlyMyAccidents"
								)}
								type="checkbox"
								id="idShowOnlyMyAccidentsFilter"
							/>
						)}
					/>
				</Form.Group>

				<div className="mt-4 me-2 float-end">
					<Button variant="light" onClick={onResetButton}>
						{t<string>("sidebar.filterTab.clear")}
					</Button>{" "}
					<Button
						type="submit"
						variant="primary"
						style={{ minWidth: "150px" }}
					>
						{t<string>("sidebar.filterTab.search")}
					</Button>{" "}
				</div>
			</Form>
		</div>
	);
}

export default FormFilter




import { useState, useEffect } from 'react'
import { useForm, Controller  } from 'react-hook-form'
import { Form, Button, Card, Row, Col, } from 'react-bootstrap';
import Select, { components } from "react-select";
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux'
import { RootState } from '../reducers/index'


interface FormFilterProps {
	onSubmitFilter: (filter: {}) => void;
}


const FormFilter = ({onSubmitFilter}: FormFilterProps) => {
    const rxDictSpecieses = useSelector((state: RootState) => state.dataReducer.dictSpecieses);
    const rxDictStatuses = useSelector((state: RootState) => state.dataReducer.dictStatuses);
    const rxDictCareTypes = useSelector((state: RootState) => state.dataReducer.dictCareTypes);
	const rxDictRemarks = useSelector((state: RootState) => state.dataReducer.dictRemarks);
	const rxDictPlaceTypes = useSelector((state: RootState) => state.dataReducer.dictPlaceTypes);
	const rxDictIrrigationMethods = useSelector((state: RootState) => state.dataReducer.dictIrrigationMethods);
	const rxDictGroupSpecs = useSelector((state: RootState) => state.dataReducer.dictGroupSpec);
	//const rxDictTypeSpecs = useSelector((state: RootState) => state.dataReducer.dictTypeSpec);
	
	const { t, i18n } = useTranslation();



	const { control, handleSubmit, reset, setValue } = useForm({
		reValidateMode: "onChange",
		defaultValues: {
			speciesFilter: "",
			statusFilter: "",
			careTypeFilter: "",
			remarkFilter: "",
			placeTypeFilter: "",
			irrigationMethodFilter: "",
			datePlantedFromFilter: "",
			datePlantedToFilter: "",
			dateAddedFromFilter: "",
			dateAddedToFilter: "",
			commentFilter: "",
			heightFromFilter: "",
			trunkGirthFromFilter: "",
			crownDiameterFromFilter: "",
			heightToFilter: "",
			trunkGirthToFilter: "",
			crownDiameterToFilter: "",			
			showMyTreesFilter: "",

			//select: {},
		},
	});



	
	//let optionsSpeciesesFilter: {label: string; options: {value: number; label: string}[] | undefined}[] = [];
	let optionsSpeciesesFilter: any = [];
	if (Array.isArray(rxDictSpecieses) && Array.isArray(rxDictGroupSpecs)) {

		optionsSpeciesesFilter = rxDictGroupSpecs.map(itemGroup => {
			return {
				label: itemGroup.groupname,
				options: rxDictSpecieses.map(spec => {
					if (itemGroup.id === spec.groupspec) {
						return {
							value: spec.id,
							label: spec.localname,
							speciesname: spec.speciesname,
							typespec: spec.typespec
							//color: '#FF8B00'
						}
					}
				}).filter(e => e) // removes all undefined items in result array			 
			}
		})
	}


	let optionsStatusesFilter: {value: string; label: string}[] = [];
	if (Array.isArray(rxDictStatuses)) {
		optionsStatusesFilter = rxDictStatuses.map((x) => {
			return {
				value: x.id,
				//label: t(`sidebar.filterTab.maneuversList.${x.maneuvername}`),
				label: x.statusname,
			};
		});
	}	
	
	let optionsCareTypesFilter: {value: string; label: string}[] = [];
	if (Array.isArray(rxDictCareTypes)) {
		optionsCareTypesFilter = rxDictCareTypes.map((x) => {
			return {
				value: x.id,
				//label: t(`sidebar.filterTab.maneuversList.${x.maneuvername}`),
				label: x.carename,
			};
		});
	}	

	let optionsRemarksFilter: {value: string; label: string}[] = [];
	if (Array.isArray(rxDictRemarks)) {
		optionsRemarksFilter = rxDictRemarks.map((x) => {
			return {
				value: x.id,
				//label: t(`sidebar.filterTab.maneuversList.${x.maneuvername}`),
				label: x.remarkname,
			};
		});
	}	
	
	let optionsPlaceTypesFilter: {value: string; label: string}[] = [];
	if (Array.isArray(rxDictPlaceTypes)) {
		optionsPlaceTypesFilter = rxDictPlaceTypes.map((x) => {
			return {
				value: x.id,
				//label: t(`sidebar.filterTab.maneuversList.${x.maneuvername}`),
				label: x.placename,
			};
		});
	}
	
	let optionsIrrigationMethodsFilter: {value: string; label: string}[] = [];
	if (Array.isArray(rxDictIrrigationMethods)) {
		optionsIrrigationMethodsFilter = rxDictIrrigationMethods.map((x) => {
			return {
				value: x.id,
				//label: t(`sidebar.filterTab.maneuversList.${x.maneuvername}`),
				label: x.irrigationname,
			};
		});
	}	


	  const customStyles = {
		//@ts-ignore
		option: (styles, { data }) => {
			//const color = chroma(data.color);
			return {
			  ...styles,
			  paddingLeft: 20,
			  backgroundColor: data.typespec === 2 ? '#EEFFEE' : undefined,

			};
		  },
	  } 



	  const Option = (props: any) => {
		const { label, speciesname } = props.data;
		return (
		  <components.Option {...props}>
			<span>{label}</span> <span style={{ color: "darkgray" }}>{speciesname}</span>
		  </components.Option>
		);
	  };	  



	function onResetButton() {
		reset();
		onSubmitFilter({});
	}

	return (
		<div>
			<Form className="m-1" onSubmit={handleSubmit(onSubmitFilter)}>
				<Form.Group controlId="formSpeciesFilter" className="mt-3">
					<Form.Label>
						{t<string>("sidebar.filterTab.species")}
					</Form.Label>
					<Controller
						name="speciesFilter"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								placeholder={t<string>("words.select")}
								isMulti
								isSearchable={true}
								//@ts-ignore
								options={optionsSpeciesesFilter}
								//@ts-ignore
								styles={customStyles}
								//@ts-ignore
								getOptionLabel={(option) =>`${option.label} - ${option.speciesname}`}
								components={{ Option }}
							/>
						)}
					/>
				</Form.Group>

				<Form.Group controlId="formStatusFilter" className="mt-3">
					<Form.Label>
						{t<string>("sidebar.filterTab.status")}
					</Form.Label>
					<Controller
						name="statusFilter"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								placeholder={t<string>("words.select")}
								isMulti
								//@ts-ignore
								options={optionsStatusesFilter}
								//@ts-ignore
								styles={customStyles}
								components={{ Option }}
							/>
						)}
					/>
				</Form.Group>

				<Form.Group controlId="formCareTypeFilter" className="mt-3">
					<Form.Label>
						{t<string>("sidebar.filterTab.careType")}
					</Form.Label>
					<Controller
						name="careTypeFilter"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								placeholder={t<string>("words.select")}
								isMulti
								//@ts-ignore
								options={optionsCareTypesFilter}
								//@ts-ignore
								styles={customStyles}
								components={{ Option }}
							/>
						)}
					/>
				</Form.Group>

				<Form.Group controlId="formRemarkFilter" className="mt-3">
					<Form.Label>
						{t<string>("sidebar.filterTab.remark")}
					</Form.Label>
					<Controller
						name="remarkFilter"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								placeholder={t<string>("words.select")}
								isMulti
								//@ts-ignore
								options={optionsRemarksFilter}
								//@ts-ignore
								styles={customStyles}
								components={{ Option }}
							/>
						)}
					/>
				</Form.Group>

				<Row className="mt-3">
					<Form.Group
						as={Col}
						controlId="formPlaceTypeFilter"
						style={{ minWidth: "230px" }}
					>
						<Form.Label>
							{t<string>("sidebar.filterTab.placeType")}
						</Form.Label>
						<Controller
							name="placeTypeFilter"
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									placeholder={t<string>("words.select")}
									isClearable
									isSearchable={false}
									//@ts-ignore
									options={optionsPlaceTypesFilter}
								/>
							)}
						/>
					</Form.Group>

					<Form.Group
						as={Col}
						controlId="formIrrigationMethodFilter"
						style={{ minWidth: "230px" }}
					>
						<Form.Label>
							{t<string>("sidebar.filterTab.irrigationMethod")}
						</Form.Label>
						<Controller
							name="irrigationMethodFilter"
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									placeholder={t<string>(
										"words.select"
									)}
									isClearable
									isSearchable={false}
									//@ts-ignore
									options={optionsIrrigationMethodsFilter}
								/>
							)}
						/>
					</Form.Group>
				</Row>

				<Row className="mt-3">
					<Form.Group as={Col} controlId="formDatePlantedFromFilter">
						<Form.Label>
							{t<string>("sidebar.filterTab.plantedFrom")}
						</Form.Label>
						<Controller
							name="datePlantedFromFilter"
							control={control}
							render={({ field }) => (
								<Form.Control type="date" {...field} />
							)}
						/>
					</Form.Group>

					<Form.Group as={Col} controlId="formDatePlantedToFilter">
						<Form.Label>
							{t<string>("sidebar.filterTab.plantedTo")}
						</Form.Label>
						<Controller
							name="datePlantedToFilter"
							control={control}
							render={({ field }) => (
								<Form.Control type="date" {...field} />
							)}
						/>
					</Form.Group>
				</Row>

				<Row className="mt-3">
					<Form.Group as={Col} controlId="formDateAddedFromFilter">
						<Form.Label>
							{t<string>("sidebar.filterTab.dateAddedFrom")}
						</Form.Label>
						<Controller
							name="dateAddedFromFilter"
							control={control}
							render={({ field }) => (
								<Form.Control type="date" {...field} />
							)}
						/>
					</Form.Group>

					<Form.Group as={Col} controlId="formDateAddedToFilter">
						<Form.Label>
							{t<string>("sidebar.filterTab.dateAddedTo")}
						</Form.Label>
						<Controller
							name="dateAddedToFilter"
							control={control}
							render={({ field }) => (
								<Form.Control type="date" {...field} />
							)}
						/>
					</Form.Group>
				</Row>



				<Form.Group className="mt-3" controlId="formCommentFilter">
					<Form.Label>
						{t<string>("sidebar.filterTab.comment")}
					</Form.Label>
					<Controller
						name="commentFilter"
						control={control}
						render={({ field }) => (
							<Form.Control type="text" {...field} />
						)}
					/>
				</Form.Group>




				<Row className="mt-3">
					<Form.Group as={Col} controlId="formFromParamsTreeFilter" style={{maxWidth: "50px"}}>
						<Form.Label style={{ marginTop: "32px"}}>
							{t<string>("sidebar.filterTab.from")}
						</Form.Label>
					</Form.Group>

					<Form.Group
						as={Col}
						controlId="formHeightFromFilter"
						className="ps-1 pe-0"
					>
						<Form.Label>
							{t<string>("sidebar.filterTab.height")}
						</Form.Label>
						<Controller
							name="heightFromFilter"
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
						controlId="formTrunkGirthFromFilter"
						className="ps-1 pe-0"
					>
						<Form.Label>
							{t<string>("sidebar.filterTab.trunkGirth")}
						</Form.Label>
						<Controller
							name="trunkGirthFromFilter"
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
						controlId="formCrownDiameterFromFilter"
						className="ps-1 pe-0"
					>
						<Form.Label>
							{t<string>("sidebar.filterTab.crownDiameter")}
						</Form.Label>
						<Controller
							name="crownDiameterFromFilter"
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
					<Form.Group as={Col} controlId="formToParamsTreeFilter" style={{maxWidth: "50px"}}>
						<Form.Label>
							{t<string>("sidebar.filterTab.to")}
						</Form.Label>
					</Form.Group>

					<Form.Group
						as={Col}
						controlId="formHeightToFormFilter"
						className="ps-1 pe-0"
					>
						<Controller
							name="heightToFilter"
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
						controlId="formTrunkGirthToFormFilter"
						className="ps-1 pe-0"
					>
						<Controller
							name="trunkGirthToFilter"
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
						controlId="formCrownDiameterToFormFilter"
						className="ps-1 pe-0"
					>
						<Controller
							name="crownDiameterToFilter"
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
					controlId="formShowMyTreesFilter"
					className="mt-3 ms-1"
				>
					<Controller
						name="showMyTreesFilter"
						control={control}
						render={({ field }) => (
							//@ts-ignore
							<Form.Check
								{...field}
								//@ts-ignore
								checked={field["value"] ?? false}
								inline
								label={t<string>(
									"sidebar.filterTab.showMyTrees"
								)}
								type="checkbox"
								id="idShowMyTreesFilter"
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




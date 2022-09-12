import Table from "react-bootstrap/Table";
import {useState, useEffect} from 'react';

export interface ColumnsStructureTableList {
	field: string;
	headerName: string;
	width?: string;
	sortable?: boolean;
	dateTimeOption?: 'onlyDate' | 'onlyTime' | 'dateTime'; // for Date fields you can choose format	
}

export interface DataStructureTableList {
	id: number;
	[key: string]:
		| any
		| {
				iconFA?: string;
				iconFASize?: string;
				text?: string;
				idButton: string;
		  }[]; // array of buttons, where key is field name of a column
}

interface TableListProps {	
	columns: ColumnsStructureTableList[];
	data: DataStructureTableList[] | undefined;
	sortField?: string;
	sortAsc?: boolean;	
	size?: string; // sm
	variant?: string; // dark
  	OnClickButtons?: (rowData: any, idButton: string) => void;
}

function TableList({
	columns,
	data,
	sortField,
	sortAsc = true,
	size,
	variant,
	OnClickButtons,
}: TableListProps) {
	const [sortState, setSortState] = useState({
		sortField: sortField,
		sortAsc: sortAsc,
	});

	const [dataTable, setDataTable] = useState(data);

	useEffect(() => {
		setDataTable(data);
	}, [data]);



	interface ColumnsHeaderProps {
		header: ColumnsStructureTableList[]	
	}

	function Header({header}: ColumnsHeaderProps) {

		const columnsHeader = header.map((item, index) => (
			<th
				style={{
					width: item.width ? item.width : "",
					cursor: item.sortable ? "pointer" : "default",
				}}
				key={index}
				onClick={() => {
					if (item.sortable) {
						setSortState({
							sortField: item.field,
							sortAsc:
								sortState.sortField === item.field
									? !sortState.sortAsc
									: true,
						}); // inverse sortAsc, only when sortField has not changed, otherwise sortAsc=true
					}
				}}
			>
				{
					// for current sorted column draws icon
					sortState?.sortField === item.field ? (
						<>
							<div style={{ float: "left", textAlign: "left" }}>
								{item.headerName}
							</div>
							<div style={{ float: "right", textAlign: "right" }}>
								<span style={{ fontSize: "8pt", color: "gray" }}>
									{" "}
									{sortState.sortAsc ? "▼" : "▲"}
								</span>
							</div>
						</>
					) : (
						item.headerName
					)
				}
			</th>
		));

		return (<>{columnsHeader}</>);

	}






	function DataTable() {
		function compare(a: {}, b: {}) {
			//@ts-ignore
			if (a[sortState.sortField] < b[sortState.sortField]) {
				if (sortState.sortAsc) {
					return -1;
				} else {
					return 1;
				}
			}
			//@ts-ignore
			if (a[sortState.sortField] > b[sortState.sortField]) {
				if (sortState.sortAsc) {
					return 1;
				} else {
					return -1;
				}
			}
			return 0;
		}

		// sorting of data
		let sortedData: any[] | undefined = [];
		if (sortState.sortField && dataTable) {			
			sortedData = dataTable.sort(compare);//sortedData = dataTable?.sort(compare);
		} else {
			sortedData = dataTable;
		}

		// fill out
		if (sortedData && sortedData.length > 0) {
			return (
				<>
					{sortedData.map((row: any, index) => {
						return (
							<tr key={row.id}>
								<DataRow row={row} indexRow={index} />
							</tr>
						);
					})}
				</>
			);
		}

		return (
			<tr>
				<td style={{ textAlign: "center" }} colSpan={columns.length}>
					no data
				</td>
			</tr>
		);
	}

	interface DataRowProps {
		row: any;
		indexRow: number;
	}

	function DataRow({ row, indexRow }: DataRowProps): any {
		const getUniqKey = (row: any, index: number): string =>
			`${String(row.id)}.${String(index)}`;

		const result = columns.map((col, index) => {
			if (typeof row[col.field] !== "object") {
				//if it's not object, then it's just value of field, else it's button

				if (col?.dateTimeOption) {
					if (col.dateTimeOption === "onlyDate") {
						return (
							<td key={getUniqKey(row, index)}>
								{new Date(row[col.field]).toLocaleDateString()}
							</td>
						);
					}

					if (col.dateTimeOption === "onlyTime") {
						return (
							<td key={getUniqKey(row, index)}>
								{new Date(row[col.field]).toLocaleTimeString()}
							</td>
						);
					}

					if (col.dateTimeOption === "dateTime") {
						let dateTime =
							new Date(row[col.field]).toLocaleDateString() +
							" " +
							new Date(row[col.field]).toLocaleTimeString();
						return <td key={getUniqKey(row, index)}>{dateTime}</td>;
					}

					return (
						<td key={getUniqKey(row, index)}>{row[col.field]}</td>
					);
				}

				if (col.field === "#") {
					return <td key={getUniqKey(row, index)}>{indexRow + 1}</td>;
				}

				return <td key={getUniqKey(row, index)}>{row[col.field]}</td>;
			}

			// buttons
			const buttons = row[col.field];

			if (Array.isArray(buttons)) {
				let buttonRow: any[] = [];
				buttons.forEach((button) => {
					if ((button?.text || button?.iconFA) && button?.idButton) {
						let buttonText = [];

						if (button?.iconFA) {
							if (button?.iconFASize) {
								buttonText.push(
									<i
										key={
											getUniqKey(row, index) +
											button.idButton
										}
										className={button.iconFA}
										style={{ fontSize: button.iconFASize }}
									></i>
								);
							} else {
								buttonText.push(
									<i
										key={
											getUniqKey(row, index) +
											button.idButton
										}
										className={button.iconFA}
									></i>
								);
							}
						}

						if (button?.text) {
							buttonText.push(
								<span
									key={
										getUniqKey(row, index) + button.idButton
									}
								>
									{button.text}
								</span>
							);
						}

						if (OnClickButtons) {
							buttonRow.push(
								<span
									key={
										getUniqKey(row, index) + button.idButton
									}
								>
									<a
										href="#"
										onClick={() =>
											OnClickButtons(row, button.idButton)
										}
									>
										{buttonText}
									</a>{" "}
								</span>
							);
						} else {
							buttonRow.push(
								<span
									key={
										getUniqKey(row, index) + button.idButton
									}
								>
									{buttonText}
								</span>
							);
						}
					}
				});

				return <td key={getUniqKey(row, index)}>{buttonRow}</td>;
			}
		});

		return result;
	}

	return (
		<Table striped bordered hover size={size} variant={variant}>
			<thead>
				<tr><Header header={columns} /></tr>
			</thead>
			<tbody>
				<DataTable />
			</tbody>
		</Table>
	);
}

export default TableList
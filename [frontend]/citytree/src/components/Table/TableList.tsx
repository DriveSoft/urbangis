import Table from "react-bootstrap/Table";
import { useState, useEffect } from 'react';
import { Header } from './Header'
import TableData from './TableData'
import { ColumnsStructureTableList, DataStructureTableList } from './interfaces'


interface TableListProps {	
	columns: ColumnsStructureTableList[];
	data: DataStructureTableList[] | undefined;
	sortField?: string;
	sortAsc?: boolean;	
	size?: string; // sm
	variant?: string; // dark
  	OnClickButtons?: (rowData: any, idButton: string) => void;
	noDataTitle?: string;
}

function TableList({
	columns,
	data,
	sortField,
	sortAsc = true,
	size,
	variant,
	OnClickButtons,
	noDataTitle = 'no data'
}: TableListProps) {

	const [sortState, setSortState] = useState({
		sortField: sortField,
		sortAsc: sortAsc,
	});

	const [dataTable, setDataTable] = useState(data);

	useEffect(() => {
		setDataTable(data);
	}, [data]);


	return (
		<Table striped bordered hover size={size} variant={variant}>
			<thead>
				<tr><Header header={columns} sortState={sortState} setSortState={setSortState} /></tr>
			</thead>
			<tbody>
				<TableData columns={columns} data={dataTable} sortState={sortState} noDataTitle={noDataTitle} OnClickButtons={OnClickButtons}/>
			</tbody>
		</Table>
	);
}

export default TableList
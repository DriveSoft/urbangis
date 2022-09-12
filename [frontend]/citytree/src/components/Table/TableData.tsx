
import { DataRow } from './DataRow';
import { ColumnsStructureTableList, DataStructureTableList } from './interfaces'

interface TableDataProp {
    data: DataStructureTableList[] | undefined,
    sortState: {sortField: string | undefined, sortAsc: boolean },
    columns: ColumnsStructureTableList[],
    noDataTitle: string;
    OnClickButtons?: (rowData: any, idButton: string) => void;
}

function TableData({data, sortState, columns, noDataTitle, OnClickButtons}: TableDataProp) {
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
    if (sortState.sortField && data) {			
        sortedData = data.sort(compare);//sortedData = dataTable?.sort(compare);
    } else {
        sortedData = data;
    }

    // fill out
    if (sortedData && sortedData.length > 0) {
        return (
            <>
                {sortedData.map((row: any, index) => {
                    return (
                        <tr key={row.id}>
                            <DataRow columns={columns} row={row} indexRow={index} OnClickButtons={OnClickButtons} />
                        </tr>
                    );
                })}
            </>
        );
    }

    return (
        <tr>
            <td style={{ textAlign: "center" }} colSpan={columns.length}>
                {noDataTitle}
            </td>
        </tr>
    );
}


export default TableData
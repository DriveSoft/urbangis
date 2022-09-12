import { ColumnsStructureTableList } from './interfaces'

interface ColumnsHeaderProps {
    header: ColumnsStructureTableList[],
    sortState: {sortField: string | undefined, sortAsc: boolean },
    setSortState: any
}

export function Header({header, sortState, setSortState}: ColumnsHeaderProps) {

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
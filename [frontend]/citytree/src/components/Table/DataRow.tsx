import { ColumnsStructureTableList } from './interfaces'

interface DataRowProps {
    columns: ColumnsStructureTableList[],    
    row: any,
    indexRow: number,
    OnClickButtons?: (rowData: any, idButton: string) => void,
}

export function DataRow({ columns, row, indexRow, OnClickButtons }: DataRowProps): any {
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
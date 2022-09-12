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
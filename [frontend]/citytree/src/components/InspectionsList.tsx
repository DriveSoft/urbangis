import { useEffect, useState } from 'react';

//import TableList from './Table'
//import { DataStructureTableList } from './Table/interfaces'
import { BootstrapTable } from 'react-bootstrap-table-light'
import { DataStructureTable } from 'react-bootstrap-table-light/src/interfaces';

import { useSelector } from "react-redux";
import { RootState } from "../reducers/index";

interface InspectionsListProps {
    idTree: number | undefined;  
    onClickButtonEditInsp: (inspData: any) => void;
    onClickButtonPhotosInsp: (inspData: any) => void;
}

const InspectionsList = (props: InspectionsListProps) => {

    const [inspectionsData, setInspectionsData] = useState<DataStructureTable[] | undefined>(undefined);
    const rxDataLastEditetTreeId = useSelector((state: RootState) => state.dataReducer.dataLastEditedTreeId);

    const fetchInpections = async () => {
        //@ts-ignore
        let url = `${process.env.REACT_APP_API_URL}citytree/cityfoo/trees/${props.idTree}/inspections/`;
        let res = await fetch(url);
        let data = await res.json(); 


        
        // adding buttons
        data = data.map((element: any) => {
            element.buttons = [];
            element.buttons.push({iconFA: 'fas fa-edit', iconFASize: '15pt', idButton: 'edit'});
            
            if (element?.photo1 || element?.photo2 || element?.photo3) {
                element.buttons.push({iconFA: 'fa fa-camera', iconFASize: '15pt', idButton: 'photo'});                       
                
            }
            element.typeData = 'Inspection';
            return element;
                
        });
        
        setInspectionsData(data);       
    };

    useEffect(() => {
        if (props.idTree) {
            fetchInpections();
        }
    }, [props.idTree]);

    useEffect(() => {
        //console.log('rxDataLastEditetTreeId', props.idTree, rxDataLastEditetTreeId);
        if (props.idTree && (props.idTree === rxDataLastEditetTreeId.treeId)) { // if data about inspection was updated, which belongs to this instance of tree, then update the component
            fetchInpections();
            console.log('rxDataLastEditetTreeId');
        }
    }, [rxDataLastEditetTreeId]);


    const OnClickInspButtons = (rowData: any, idButton: string) => {            
        if (idButton==='edit') props.onClickButtonEditInsp(rowData);        
        if (idButton==='photo') props.onClickButtonPhotosInsp(rowData);                 
    }

    return (
        <BootstrapTable 
            data={inspectionsData} 
            OnClickButtons={OnClickInspButtons} 
            sortField={"datetime"} 
            sortAsc={false} 
            size={"sm"} 
            noDataTitle='Няма'       
            columns={
                [
                    {
                        field: "#",
                        headerName: "",
                    },                            
                    {
                        field: "datetime",
                        headerName: "Дата",
                        width: "40%",
                        sortable: true,
                        dateTimeOption: "onlyDate",
                    },
                    {
                        field: "typeData",
                        headerName: "Тип",
                        width: "35%"
                    },    
                    {
                        field: "buttons",
                        headerName: "Actions",
                        width: "25%"
                    },             
                ]
            }
        />
    )
}


export default InspectionsList; 
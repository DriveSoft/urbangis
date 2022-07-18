import { Form, Button, Row, Col, } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import Carousel from "react-bootstrap/Carousel";
import Modal from "react-bootstrap/Modal";
import InspectionsList from './InspectionsList';
import { useTranslation } from 'react-i18next';
import "./TreePreviewModal.css";
import { useEffect } from 'react';

interface TreePreviewModalProps {
    visible: boolean;
    data: any;
    setTreePreview: any; 
    onButtonEditTreeClick: (idTree: number) => void;
    onEditInsp: (data: {}) => void;
} 

function TreePreviewModal({
    visible,
    data,
    setTreePreview,
    onButtonEditTreeClick,
    onEditInsp
}: TreePreviewModalProps) {

    const { t } = useTranslation();    
    const handleClose = () => setTreePreview({visible: false, data: {photos:[]}});    
    const handleEditTree = () => {
        setTreePreview({visible: false, data: {photos:[]}}); 
        onButtonEditTreeClick(data.id)   
    }


    function OnButtonTableClick (rowData: any, idButton: string) {    
        console.log(idButton, rowData);
        if (idButton==='edit') {
            setTreePreview({visible: false, data: {photos:[]}}); 
            onEditInsp(rowData);
        } else if (idButton==='photo') {
            //onClickInspPhotos(rowData);
        }
        
    }


    return (    
    
        <Modal
            show={visible}
            onHide={handleClose}
            //size="lg"
            //@ts-ignore
            dialogClassName="modal-90w"       
            aria-labelledby="example-custom-modal-styling-title"
        >

            <Modal.Header closeButton>
                <Modal.Title>{data.localname} - {data.species} </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Row className="mt-1">
                    <Form.Group
                            as={Col}
                            controlId="formTreePreviewLeftSide"
                            style={{ minWidth: "230px" }}
                    >
                        <Carousel interval={null}>
                            {data?.lastinsp_photo1 && data.lastinsp_photo1 && (
                                <Carousel.Item key={data.lastinsp_photo1} >
                                    <img
                                        className="d-block w-100" alt="photo1"
                                        src={data.photoServer+data.lastinsp_photo1}                                               
                                    />
                                </Carousel.Item>                     
                            )}

                            {data?.lastinsp_photo2 && data.lastinsp_photo2 && (
                                <Carousel.Item key={data.lastinsp_photo2} >
                                    <img
                                        className="d-block w-100" alt="photo2"
                                        src={data.photoServer+data.lastinsp_photo2}                                               
                                    />
                                </Carousel.Item>                     
                            )}   

                            {data?.lastinsp_photo3 && data.lastinsp_photo3 && (
                                <Carousel.Item key={data.lastinsp_photo3} >
                                    <img
                                        className="d-block w-100" alt="photo3"
                                        src={data.photoServer+data.lastinsp_photo3}                                               
                                    />
                                </Carousel.Item>                     
                            )}                              
                        </Carousel>
                    </Form.Group>

                    <Form.Group
                            as={Col}
                            controlId="formTreePreviewRightSide"
                            style={{ minWidth: "230px" }}
                    >
                        <Table striped>
                            <tbody>
                                <RowTable title={t<string>("TreePreviewModal.status")} value={data.lastinsp_status} />
                                <RowTable title={t<string>("TreePreviewModal.parameters")} value={`${t<string>("TreePreviewModal.heightTree")}: ${data.lastinsp_height} \u00A0\u00A0 ${t<string>("TreePreviewModal.girthTree")}: ${data.lastinsp_trunkgirth} \u00A0\u00A0 ${t<string>("TreePreviewModal.diameterTree")}: ${data.lastinsp_crowndiameter}`} />
                                <RowTable title={t<string>("TreePreviewModal.dateplanted")} value={dateTimeToDate(data.dateplanted)} />
                                <RowTable title={t<string>("TreePreviewModal.googlestreeturl")} value={data.googlestreeturl} isValueIsLink/>
                                <RowTable title={t<string>("TreePreviewModal.remarks")} value={data.lastinsp_remarks} />
                                <RowTable title={t<string>("TreePreviewModal.careTypes")} value={data.lastinsp_recommendations} />
                                <RowTable title={t<string>("TreePreviewModal.comment")} value={data.comment} />                                
                            </tbody>
                        </Table>


                        <p className="mt-5" id="captionInspectsActions">Прегледи и Дейности</p>

                        <InspectionsList 
                            idTree={data?.id} 
                            OnClickButtons={OnButtonTableClick}                            
                        />

                    </Form.Group>                
                </Row>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleEditTree}>
                    {t<string>("TreePreviewModal.edit")}
                </Button>
                <Button variant="primary" style={{ minWidth: "180px" }} onClick={handleClose}>
                    {t<string>("TreePreviewModal.close")}
                </Button>
            </Modal.Footer>

        </Modal>

    )
}


interface RowTableProps {
    title: string;
    value: string | null;
    isValueIsLink?: boolean;   
} 

const RowTable = ({title, value, isValueIsLink}: RowTableProps) => {
    if (value) {
        return (
            <tr>
                <td>{title}</td>
                { isValueIsLink ? 
                    <td><a href={value} target="_blank">Link</a></td>
                : <td>{value}</td>
                }
          </tr>                
        );
    } else {
        return null;
    }
}

function dateTimeToDate(dateTimeStr: string) {
    if (dateTimeStr) {
        const dateTime = new Date(dateTimeStr);
        if (dateTime) {
            const arDateTime = dateTime.toISOString().split("T");
            if (arDateTime.length === 2) {
                return arDateTime[0];
            } 
            return dateTimeStr;
        }
    }
    return null;
}


export default TreePreviewModal
import Carousel from "react-bootstrap/Carousel";
import Modal from "react-bootstrap/Modal";
import "./ImageSlider.css";


interface ImageSliderProps {
    visible: boolean;
    setVisible: any;
    images: string[];
} 

function ImageSlider({
    visible,
    setVisible,
    images
}: ImageSliderProps) {
  return (
    
    
    <Modal
        show={visible}
        onHide={() => setVisible({visible: false, images:[]})}
        //size="lg"
        //@ts-ignore
        dialogClassName="modal-90w"       
        aria-labelledby="example-custom-modal-styling-title"
    >
        <Modal.Body>
            <Carousel interval={null}>
                {                
                    images.map((photo) => 
                        <Carousel.Item key={photo} >
                            <img
                                className="d-block w-100"
                                src={photo}                                               
                            />
                        </Carousel.Item>                    
                    )                
                }                
            </Carousel>
        </Modal.Body>
    </Modal>

  )
}

export default ImageSlider
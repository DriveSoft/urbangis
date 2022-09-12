import { useEffect, useState } from "react";
import "./Modal.css";

interface ModalProps {
	title: string;
	setShowModal: (b: boolean) => void;
	children: JSX.Element;
}

function Modal({ title, setShowModal, children }: ModalProps) {
	const [moveY, setMoveY] = useState(0);
	const [opacity, setOpacity] = useState(0);
	const [backgroundColor, setBackgroundColor] = useState(0);

	useEffect(()=>{		
		setMoveY(10);
		setOpacity(1);
		setBackgroundColor(0.8);
	}, []);


	return (
		<div className="modalBackground" style={{backgroundColor: `rgba(0, 0, 0, ${backgroundColor})`}} onMouseDown={ () => setShowModal(false) }>
			<div className="modalContainer" style={{transform: `translateY(${moveY}%)`, opacity: `${opacity}`}} onMouseDown={ (e) => e.stopPropagation()}>
				<div className="modalHeader">
					<h1 style={{flex: "1"}}>{title}</h1>
					<button onClick={ () => setShowModal(false) }>✖</button>
				</div>

				<div className="body">
					{children}
				</div>

			</div>
		</div>
	);
}

export default Modal;

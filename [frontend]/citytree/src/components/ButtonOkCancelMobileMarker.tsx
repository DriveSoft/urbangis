import Button from "react-bootstrap/Button";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
	actMapMarkerState,
	actShowSidebar,
	actCheckButtonNewMarker,
	actShowOkCancelMobileMarker,
	actShowTreeTab,
	actActiveTabKey,
} from "../actions";


const ButtonOkCancelMobileMarker = () => {

    const dispatch = useDispatch();
    const { t } = useTranslation();


    return (
    <>
        <Button
            variant="success"
            id="doneEditMarkerMobile"
            onClick={() => {
                dispatch(
                    actCheckButtonNewMarker(
                        false
                    )
                );
                dispatch(
                    actShowOkCancelMobileMarker(
                        false
                    )
                );
                dispatch(
                    actShowTreeTab(true)
                );
                dispatch(
                    actActiveTabKey("tree")
                );
                dispatch(actShowSidebar(true));
            }}
        >
            {t<string>("words.done")}
        </Button>{" "}
        
        <Button
            variant="secondary"
            id="cancelMarkerMobile"
            onClick={() => {
                dispatch(
                    actMapMarkerState({
                        visible: false,
                        position: {
                            lat: 0,
                            lng: 0,
                        },
                    })
                );
                dispatch(
                    actShowOkCancelMobileMarker(
                        false
                    )
                );
                dispatch(
                    actCheckButtonNewMarker(
                        false
                    )
                );
            }}
        >
            &#x2715;
        </Button>{" "}
    </>
  )
}

export default ButtonOkCancelMobileMarker
import Button from "react-bootstrap/Button";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import {
	actMapMarkerState,
	actShowSidebar,
	actCheckButtonNewMarker,
	actShowOkCancelMobileMarker,
	actShowTreeTab,
	actActiveTabKey,
    actNewTreeCreation
} from "../actions";
import { RootState } from "../reducers/index";


const ButtonOkCancelMobileMarker = () => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const rxCheckButtonNewMarker = useSelector((state: RootState) => state.uiReducer.checkButtonNewMarker);


    return (
    <>
        <Button
            variant="success"
            id="doneEditMarkerMobile"
            onClick={() => {
                if (rxCheckButtonNewMarker) dispatch(actNewTreeCreation(true));
                
                dispatch(actCheckButtonNewMarker(false));
                dispatch(actShowOkCancelMobileMarker(false));                
                dispatch(actShowTreeTab(true));
                dispatch(actActiveTabKey("tree"));
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
// don't work with TypeScript, error: TypeError: leaflet__WEBPACK_IMPORTED_MODULE_0___default.a.easyButton is not a function
import L from 'leaflet';
import easyButton from 'leaflet-easybutton'
import "leaflet-easybutton/src/easy-button.css"
import "@fortawesome/fontawesome-free/css/all.min.css" 
 

function ButtonMap_ (map, iconTrue, iconFalse, onClick) {
    //const map = useMap()
    
            const buttonMap = L.easyButton({
                position: 'topright',
                states:[
                    {
                        title: '',
                        stateName: 'off',
                        icon: `<i class="${iconTrue}"></i>`,
                        onClick: function(control){
                            control.state('on');
                            //@ts-ignore
                            control.button.style.backgroundColor = 'red';
                            onClick(true)
                        }
                    },
        
                    {
                        title: '',
                        stateName: 'on',
                        icon: `<i class="${iconFalse}"></i>`,
                        onClick: function(control){
                            control.state('off');
                            //@ts-ignore
                            control.button.style.backgroundColor = 'white';
                            onClick(false)
                        }
                    }]
            }).addTo( map );



            //if (checkButtonState) {
            //    buttonMap.state('on');
            //    buttonMap.button.style.backgroundColor = 'red';
            //} else {
            //    buttonMap.state('off');
            //    buttonMap.button.style.backgroundColor = 'white';            
            //}
            
            
    
    return buttonMap

}

export default ButtonMap_

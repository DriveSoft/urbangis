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
                        stateName: 'off',
                        icon: `<i class="${iconTrue}"></i>`,
                        onClick: function(control){
                            control.state('on');
                            control.button.style.backgroundColor = 'red';
                            onClick(true)
                        }
                    },
        
                    {
                        stateName: 'on',
                        icon: `<i class="${iconFalse}"></i>`,
                        onClick: function(control){
                            control.state('off');
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

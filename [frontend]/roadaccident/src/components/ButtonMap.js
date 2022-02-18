import L from 'leaflet';
import easyButton from 'leaflet-easybutton'
import "leaflet-easybutton/src/easy-button.css"
import "@fortawesome/fontawesome-free/css/all.min.css"

function ButtonMap (map, button, iconTrue, iconFalse, onClick, checkButtonState) {
   
    if (button===null) { // если в глобальной переменной пусто, значит создаем кнопку, иначе только меняем статус
        button = L.easyButton({
                    position: 'topright',
                    states:[
                        {
                            stateName: 'off',
                            icon: `<i className="${iconTrue}"></i>`,
                            onClick: function(control){
                                control.state('on');
                                control.button.style.backgroundColor = 'red';
                                onClick(true)
                            }
                        },
            
                        {
                            stateName: 'on',
                            icon: `<i className="${iconFalse}"></i>`,
                            onClick: function(control){
                                control.state('off');
                                control.button.style.backgroundColor = 'white';
                                onClick(false)
                            }
                        }]
                }).addTo( map );

    } else {
            
        if (checkButtonState) {
            button.state('on');
            button.button.style.backgroundColor = 'red';
        } else {
            button.state('off');
            button.button.style.backgroundColor = 'white';            
        }
            
    }
            
    return button    
}

export default ButtonMap

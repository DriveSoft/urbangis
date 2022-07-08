import { useSelector } from "react-redux";
import { RootState } from "../reducers/index";

interface MainWrapperProps {
    children: JSX.Element;
    cityName: string | undefined;
}

const MainWrapper = ({children, cityName}: MainWrapperProps) => {
    const rxShowSidebar = useSelector((state: RootState) => state.uiReducer.showSidebar);

    return (
        <div className="main-wrapper">            
            {cityName ? (                
                <div id="app">
                    <div className={`d-flex ${rxShowSidebar ? "showed" : "hided"}`} id="wrapper">
                        {children}
                    </div>
                </div>
            ) : (
                    "You must select a city."
            )}     		                           
        </div>
    )
}

export default MainWrapper
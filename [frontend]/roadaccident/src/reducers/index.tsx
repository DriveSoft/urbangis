import uiReducer from './userInterface'
import dataReducer from './dataApp'
import { combineReducers } from 'redux'

export const allReducers = combineReducers({
    uiReducer,
    dataReducer    
});

//export default allReducers
export type RootState = ReturnType<typeof allReducers>
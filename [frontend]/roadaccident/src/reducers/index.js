import uiReducer from './userInterface'
import dataReducer from './data'
import { combineReducers } from 'redux'

const allReducers = combineReducers({
    uiReducer,
    dataReducer    
})

export default allReducers
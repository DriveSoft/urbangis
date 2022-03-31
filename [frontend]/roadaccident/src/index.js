import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';
import './sidebar.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './i18nextConf';
import { createStore } from 'redux'
import allReducers from './reducers';
import { Provider } from 'react-redux'

// Importing the Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

const store = createStore(
  allReducers,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

ReactDOM.render(
  <Provider store={store}>
  {/*<React.StrictMode>*/}
    <BrowserRouter basename="/roadaccident">
      <Routes>
        <Route path="/" element={<App />}>
          <Route path=":cityName" element={<App />} >
            <Route path=":accidentId" element={<App />} />
          </Route>               
        </Route>
      </Routes>
    </BrowserRouter>,
  {/*</React.StrictMode>,*/}
  </Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

//Import boilerplate (third party)
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import reduxThunk from 'redux-thunk';
import { offline } from '@redux-offline/redux-offline';
import offlineConfig from '@redux-offline/redux-offline/lib/defaults';
//import Dexie from 'dexie';
//Import local files (main components)
import App from './components/App';
import reducers from './reducers';
import { getLocalStorage, setLocalStorage } from './localStorage';

import * as serviceWorker from './serviceWorker';

const persistedState = getLocalStorage();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  reducers,
  persistedState,
  composeEnhancers(
    applyMiddleware(reduxThunk),
    offline(offlineConfig)
  )
);

//Need to save state anytime the store state changes
store.subscribe(() => {
  setLocalStorage({
    userData: store.getState().userData,
    sessions: store.getState().sessions,
    jobMeta: store.getState().jobMeta,
    db: store.getState().db
    //categories: store.getState().categories

  });
});

ReactDOM.render(
  <Provider store = {store}>
    <App/>
  </Provider>,
  document.querySelector('#root')
);


//serviceWorker.register();
serviceWorker.register({
  onUpdate: registration => {
    const waitingServiceWorker = registration.waiting

    if (waitingServiceWorker) {
      waitingServiceWorker.addEventListener("statechange", event => {
        if (event.target.state === "activated") {
          window.location.reload()
        }
      });
      waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
    }
  }
});

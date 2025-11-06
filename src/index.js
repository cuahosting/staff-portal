import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { applyMiddleware, createStore, compose } from "redux";
import { serverStatus } from "./resources/url";
import rootReducer from "./reducers/rootReducer";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import thunkMiddleware from "redux-thunk";
import { logger } from "redux-logger";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
let store;
if (serverStatus === "Dev") {
  store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(logger, thunkMiddleware))
  );
} else {
  store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(thunkMiddleware))
  );
}

const persist = persistStore(store);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <PersistGate persistor={persist}>
      <App />
    </PersistGate>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

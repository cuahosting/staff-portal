import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./ErrorBoundary";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { applyMiddleware, createStore, compose } from "redux";
import { serverStatus } from "./resources/url";
import rootReducer from "./reducers/rootReducer";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { thunk as thunkMiddleware } from "redux-thunk";
import { logger } from "redux-logger";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "./config/googleAuth";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
let store;
try {
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
} catch (error) {
  console.error("Store creation error:", error);
  document.getElementById("root").innerHTML = `
    <div style="padding: 20px; color: red;">
      <h1>Store Initialization Error</h1>
      <p>${error.message}</p>
      <pre>${error.stack}</pre>
    </div>
  `;
  throw error;
}

const persist = persistStore(store);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ErrorBoundary>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <PersistGate persistor={persist}>
          <App />
        </PersistGate>
      </Provider>
    </GoogleOAuthProvider>
  </ErrorBoundary>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

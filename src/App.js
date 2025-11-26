import { BrowserRouter as Router, Route } from "react-router-dom";
import PageRoutes from "./component/pageroutes/pageroutes";
import { connect } from "react-redux";
import PublicRoutes from "./component/pageroutes/publicroutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../src/resources/select2.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
function App(props) {
  return (
    <GoogleOAuthProvider clientId="172821218711-pe2vgt64309g7pu0ftfo6oaja7e9bjdh.apps.googleusercontent.com">
      <div >
        <Router>
          {props.loginData.length < 1 ? <PublicRoutes /> : <PageRoutes />}
        </Router>
        <ToastContainer
          position="top-left"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </GoogleOAuthProvider>
  );
}

const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails,
  };
};

export default connect(mapStateToProps, null)(App);

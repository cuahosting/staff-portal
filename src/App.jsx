import { BrowserRouter as Router, Route } from "react-router-dom";
import PageRoutes from "./component/pageroutes/pageroutes";
import { connect } from "react-redux";
import PublicRoutes from "./component/pageroutes/publicroutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../src/resources/select2.css";
function App(props) {
  return (
    <div >
      <Router>
        {props.loginData.length < 1 ? <PublicRoutes /> : <PageRoutes />}
      </Router>
      <ToastContainer
        position="top-right"
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
  );
}

const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails,
  };
};

export default connect(mapStateToProps, null)(App);

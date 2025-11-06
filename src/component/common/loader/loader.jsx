import React from "react";
import { BallTriangle } from "react-loader-spinner";
// import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
export default function Loader() {
  return (
      <div style={{
          display: 'block',
          marginLeft: 'auto',
          marginRight: 'auto',
      }} >
          <BallTriangle height="150" width="150" color="grey" ariaLabel="loading" />
      </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";

export default function PageHeader(props) {
  return (
    <div
      className="d-flex flex-stack flex-wrap gap-2 mt-n1 mb-6 printPageButton"
      id="kt_toolbar"
      style={{ borderBottom: '1px solid #d3d3d3', marginBottom: '10px', paddingBottom: '10px' }}
    >
      <div className="page-title d-flex flex-column align-items-start me-3 py-2 py-lg-0 gap-2">
        <h1 className="d-flex text-dark fw-bolder m-0 fs-3">{props.title}</h1>
        <ul className="breadcrumb breadcrumb-dot fw-bold text-gray-600 fs-7">
          <li className="breadcrumb-item text-gray-600">
            <Link to={"/"} className="text-gray-600 text-hover-primary">
              Home
            </Link>
          </li>
          {props.items &&
            props.items.length > 0 &&
            props.items.map((item, index) => {
              return (
                <li key={index} className="breadcrumb-item text-gray-600">
                  {item}
                </li>
              );
            })}
        </ul>
      </div>

      {props.buttons && (
        <div className="d-flex align-items-center gap-2 py-2">
          {props.buttons}
        </div>
      )}
    </div>
  );
}

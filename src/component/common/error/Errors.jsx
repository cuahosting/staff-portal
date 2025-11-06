import React from "react";

const Errors = ({ msg }) => {
  return (
    <div class="alert alert-danger d-flex align-items-center mt-5 p-5">
      <div class="d-flex flex-column">
        <span>{msg}</span>
      </div>
    </div>
  );
};

export default Errors;

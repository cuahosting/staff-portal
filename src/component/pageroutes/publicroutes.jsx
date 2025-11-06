import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../authentication/login/login";
import ForgotPassword from "../authentication/login/forgot-password";
import ResetPassword from "../authentication/login/reset-password";
import GuardianApprovalForm from "../registration/change-of-course/guardian-approval-form";
import StudentDetaiilsFromBarcode from "../registration/student-manager/reports/student-details-from-barcode";

export default function PublicRoutes() {
  return (
    <Routes>
      <Route exact path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:slug" element={<ResetPassword/>} />
      <Route path="*" element={<Login />} />
      <Route path="/change-of-course/guardian-approve/:id" element={<GuardianApprovalForm/>} />
      <Route path="/student/:id" element={<StudentDetaiilsFromBarcode/>} />
    </Routes>
  );
}

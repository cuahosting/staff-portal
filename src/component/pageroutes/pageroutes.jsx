import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "../dashboard/dashboard";
import Header from "../common/header/header";
import Footer from "../common/footer/footer";
import Department from "../academic/department/department";
import Login from "../authentication/login/login";
import ForgotPassword from "../authentication/login/forgot-password";
import Sample from "../sample/sample";
import HRBank from "../human-resources/bank/hr-bank";
import Modules from "../academic/modules/modules";
import TimetableSettings from "../academic/timetable/timetable-settings";
import AddEditStaff from "../human-resources/staff/add-edit-staff";
import HRQualifications from "../human-resources/qualifications/hr-qualifications";
import Faculty from "../academic/faculty/faculty";
import HRDesignations from "../human-resources/designations/hr-designations";
import HRTitle from "../human-resources/title/hr-title";
import RegistrationDashboard from "../registration/admissions/Dashboard";
import SupportingDocument from "../registration/admissions/supporting-document/SupportingDocument";
import Course from "../academic/course/course";
import TimetableStudentGroup from "../academic/timetable/student-group/timetable-student-group";
import HRNationality from "../human-resources/nationality/hr-nationality";
import UploadStaffDocument from "../human-resources/staff/upload-staff-document";
import ProcessApplication from "../registration/admissions/ProcessApplication-ug";
import AddStaffQualifications from "../human-resources/staff/add-staff-qualications";
import TimetableSemester from "../academic/timetable/semester/timetable-semester";
import ProcessApplicationPg from "../registration/admissions/ProcessApplication-pg";
import HRPensionSettings from "../human-resources/pension/settings/hr-pension-settings";
import AddEditStaffPensionRecord from "../human-resources/staff/add-edit-staff-pension";
import HRPensionAdministrator from "../human-resources/pension/administrator/hr-pension-administrator";
import HRPensionReport from "../human-resources/pension/report/hr-pension-report";
import HRPensionStaffEnrolledReport from "../human-resources/pension/staff-enrolled/hr-pension-staff-enrolled";
import HRPensionStaffNotEnrolledReport from "../human-resources/pension/staff-not-enrolled/hr-pension-staff-not-enrolled";
import JobOpenings from "../human-resources/jobs/job-openings";
import HRGeneralLedger from "../human-resources/payroll/general-ledger/hr-general-ledger";
import HRPayrollManageAllowanceAndDeduction from "../human-resources/payroll/manage-allowance-and-deduction/hr-payroll-manage-allowance-and-deduction";
import JobApplications from "../human-resources/jobs/job-applications";
import JobApplicationDetails from "../human-resources/jobs/applicant-details/job-application-details";
import StaffProfile from "../human-resources/staff-profile/staff-profile";
import HRPayrollRunAllowanceAndDeduction from "../human-resources/payroll/run-allowance-and-deduction/hr-payroll-run-allowance-and-deduction";
import HrPayrollPostSchedule from "../human-resources/payroll/post-schedule/hr-payroll-post-schedule";
import HrPayrollSendPayslips from "../human-resources/payroll/send-payslips/hr-payroll-send-payslips";
import HrSalarySettings from "../human-resources/payroll/salary-settings/hr-salary-settings";
import HrGrossPayManagement from "../human-resources/payroll/gross-pay-management/hr-gross-pay-management";
import PermissionMenus from "../settings/permission/menus/permission-menu";
import PermissionGroup from "../settings/permission/group/permission-group";
import PermissionPermission from "../settings/permission/permission/permission-permission";
import AddStaffBank from "../human-resources/staff/add-staff-bank";
import AddStaffNOK from "../human-resources/staff/add-staff-nok";
import ModuleAssignment2 from "../academic/timetable-planner/module-assignment_2";
import LecturerAssignment from "../academic/timetable-planner/LecturerAssignment";
import FinanceSettings from "../human-resources/finance/finance-settings/finance-settings";
import PostPayment from "../human-resources/finance/post-payment/post-payment";
import PaymentReceipt from "../human-resources/finance/payment-receipt/payment-receipt";
import FinanceAllowRegistration from "../human-resources/finance/finance-allow-registration/finance-allow-registration";
import FinanceAllowResult from "../human-resources/finance/finance-allow-result/finance-allow-result";
import ViewTimeTableGrid from "../academic/timetable/timetable/timetable-view/timetable-grid";
import TimetableReport from "../academic/timetable/timetable-report/timetable";
import ManageTimetableSchedule from "../academic/timetable/manage-schedule/manage-schedule";
import ClashByPass from "../academic/timetable/clash-by-pass/clash-by-pass";
import SemesterRegistration from "../registration/semeter-registration/semester-registration";
import SemesterRegistrationSettings from "../settings/registration-settings/registration-settings";
import OfficerAssignment from "../academic/timetable-planner/OfficerAssignment";
import DeanApproval from "../academic/timetable-planner/DeanApproval";
import FinalSubmission from "../academic/timetable-planner/FinalSubmission";
import SubmissionReport from "../academic/timetable-planner/SubmissionReport";
import EnrolmentList from "../human-resources/jobs/enrolment/enrolment-list";
import CASettings from "../assessments/assessment/ca-settings/ca-settings";
import CAEntry from "../assessments/assessment/ca-entry/ca-entry";
import ResetPassword from "../authentication/login/reset-password";
import StaffList from "../user/staff-report/staff-list";
import DeanList from "../user/staff-report/dean-list";
import HodList from "../user/staff-report/hod-list";
import StaffDistribution from "../user/staff-report/staff-distribution";
import StaffListByModule from "../user/staff-report/staff-list-by-module";
import NewStudentEnrolment from "../registration/student-manager/new-student-enrolment/new-student-enrolment";
import NewStudentEnrolmentDetails from "../registration/student-manager/reports/enrolment-details";
import NewStudentEnrolmentReport from "../registration/student-manager/reports/enrolment-report";
import CAFinalSubmission from "../assessments/assessment/final-submission/ca-final-submission";
import StaffListByDesignation from "../user/staff-report/staff-list-by-designation";
import ExamBarcode from "../assessments/exam/exam-barcode/exam-barcode";
import ExamGradeSettings from "../assessments/exam/grade-settings/exam-grade-settings";
import ExamTimeTableSchedule from "../assessments/exam/exam-timetable/timetable-schedule";
import ExamTimeTableHall from "../assessments/exam/exam-timetable/timetable-hall";
import ExamTimeTableReport from "../assessments/exam/exam-timetable/timetable-report";

import StaffListByModuleAndSemester from "../user/staff-report/staff-list-by-module-and-semester";
import StaffListByGoogleScholar from "../user/staff-report/staff-list-with-google-scholar";
import ExamCaEntry from "../assessments/assessment/ca-entry/exam-ca-entry";
import EXAMCAFinalSubmission from "../assessments/assessment/final-submission/exam-ca-final-submission";
import ProgressionStep from "../registration/progressions/progression-step/progression-step";

import Hostel from "../registration/hostel/Hostel/Hostel";
import HostelAllocations from "../registration/hostel/Hostel/HostelAllocations";
import HostelRooms from "../registration/hostel/Hostel/HostelRooms";
import HostelAllocationForm from "../registration/hostel/Hostel/HostelAllocationForm";
import ResetHostelRooms from "../registration/hostel/Hostel/ResetHostelRooms";

import TimeTableByBlock from "../academic/timetable/timetable-by-block/TimeTableByBlock";
import TimeTableByCourse from "../academic/timetable/timetable-by-block/TimeTableByCourse";
import ActiveStudentList from "../user/student-report/ActiveStudentList";
import ActiveStudentListByCourse from "../user/student-report/ActiveStudentListByCourse";
import ActiveStudentListByModeOfEntry from "../user/student-report/ActiveStudentListByModeOfEntry";
import ActiveStudentListByDepartment from "../user/student-report/ActiveStudentListByDepartment";

import StudentListByLecturerModule from "../user/student-report/StudentListByLecturerModule";
import SemesterProgression from "../registration/progressions/semester-progression/semester-progression";
import MissingRegistrationModule from "../registration/semeter-registration/missing-registration";
import ProcessRunningModules from "../academic/timetable-planner/process-running-modules";
import ChangeofCourseGuardian from "../registration/change-of-course/guardian-approval";
import ChangeOfCourseAdmissionOfficeApproval from "../registration/change-of-course/admission-approval";
import ChangeofCourseReport from "../registration/change-of-course/change-of-course-report";
import ChangeOfCourseRegistrarOfficeApproval from "../registration/change-of-course/registrar-approval";
import GuardianApprovalForm from "../registration/change-of-course/guardian-approval-form";
import EXAMSCASettings from "../assessments/assessment/ca-settings/exams-ca-settings";

import ProcessCA from "../assessments/assessment/process-ca/process-ca";
import GenerateAttendance from "../assessments/attendance/attendance";
import AttendanceList from "../assessments/attendance/lecturer-mark-attendance";

import StudentListByCourseAll from "../user/student-report/student-list-by-course-all";
import StudentListAll from "../user/student-report/student-list-all";

import PostExamResult from "../assessments/exam/post-exam-result/post-exam-result";
import DefermentApplications from "../registration/deferment/deferment-application";
import ProcessResult from "../assessments/exam/process-result/process-result";
import ApproveResult from "../assessments/exam/approve-result/approve-result";
import GenerateIDCard from "../user/id-card/id-card";
import CaptureBiometric from "../user/biometric/biometric";
import AddStudentPortal from "../user/student-manager/add-student-portal/AddStudentPortal";
import ActivateNewStudents from "../user/student-manager/activate-new-students/ActivateNewStudents";
import LoginToStudentPortal from "../user/student-manager/login-to-student-portal/LoginToStudentPortal";
import StudentDeferment from "../registration/student-deferment/Deferment/StudentDeferment";
import StudentProfile from "../user/student-manager/student-profile/StudentProfile";
import UpdateStudentDetails from "../user/student-manager/update-student-details/UpdateStudentDetails";
import RegisteredStudentsCountByModule from "../registration/registration-report/registered-students-count-by-module";
import ActiveNotRegistered from "../registration/registration-report/active-not-registered";
import EditStaffProfile from "../user/staff-edit-profile/staff-edit-profile";
import LogComplain from "../user/service-desk/log-complain";
import ComplainList from "../user/service-desk/complain-list";
import MyComplains from "../user/service-desk/my-complains";
import PaidNotRegistered from "../registration/registration-report/paid-not-registered";
import RegisteredNotPaid from "../registration/registration-report/registered-not-paid";
import CarryOverNotRegistered from "../registration/registration-report/carry-over-not-registered";
import PublicationManager from "../user/publication-manager/publication-manager";

import StudentParticularProfile from "../user/student-manager/student-profile/StudentParticularProfile";
import ReturnList from "../registration/student-deferment/return-list/ReturnList";

import ComplainsAssignedToMe from "../user/service-desk/assigned-to-me";
import StudentDefermentReturn from "../registration/student-deferment/student-deferment-return/StudentDefermentReturn";
import DeleteResult from "../assessments/exam/delete-result/delete-result";
import ExaminationReports from "../assessments/reports/exams-reports";
import ResultActivityTracker from "../assessments/reports/result-activity-tracker";
import StaffLeaveSettings from "../human-resources/staff-leave/leave-settings";
import StaffLeaveCategoryMembers from "../human-resources/staff-leave/category-members";
import StaffLeaveApply from "../human-resources/staff-leave/leave-apply";
import StaffLeaveApplications from "../human-resources/staff-leave/leave-applications";
import AdmissionClearance from "../user/graduation-clearance/admission-clearance/AdmissionClearance";
import ExamClearance from "../user/graduation-clearance/exam-clearance/ExamClearance";
import LibraryClearance from "../user/graduation-clearance/library-clearance/LibraryClearance";
import FinanceClearance from "../user/graduation-clearance/finance-clearance/FinanceClearance";
import EvaluateGPA from "../assessments/assessment/evaluate-gpa/evaluate-gpa";
import ByCourse from "../academic/module-running/by-course";
import ByDepartment from "../academic/module-running/by-department";
import ByFaculty from "../academic/module-running/by-faculty";

import AllTranscriptApplications from "../registration/transcript-applications/all-transcript-applications/AllTranscriptApplications";
import PendingTranscriptApplications from "../registration/transcript-applications/pending-transcript-applications/PendingTranscriptApplications";

import ByUniversity from "../academic/module-running/by-university";
import InternshipManager from "../user/internship-manager/internship-manager";
import ModuleAssignment from "../academic/timetable-planner/module-assignment";
import AdmissionDateLine from "../registration/admissions/admission-dateline";
import InitiateClearance from "../user/graduation-clearance/initiate-clearance/InitiateClearance";
import AllPaymentReport from "../human-resources/finance-report/all-payment-report";
import CustomPaymentReport from "../human-resources/finance-report/custom-payment-report";
import PaymentReportByTrimester from "../human-resources/finance-report/payment-report-by-trimester";
import TuitionFeePaymentReport from "../human-resources/finance-report/tuition-fee-payment-report";
import GraduatingList from "../user/student-report/graduating-list";
import StudentsConstactByModule from "../user/student-report/students-contact-by-module";
import StudentsContactByLecturerModule from "../user/student-report/students-contact-by-lecturer-module";
import LastSemesterRegistered from "../user/student-report/last-semester-registered";
import JambReport from "../user/student-report/jamb-report";
import NumberOfStudentsPerModule from "../user/student-report/number-of-students-per-module";
import NumberOfStudentsPerProgram from "../user/student-report/number-of-students-per-program";
import StudentEnrolledByDepartment from "../user/student-report/student-enrolled-by-department";
import Inventory from "../human-resources/inventory/inventory";
import AcademicResultByCourse from "../assessments/academic-result/academic-result-by-course";
import AcademicResultByDepartment from "../assessments/academic-result/academic-result-by-department";
import AcademicResultByModule from "../assessments/academic-result/academic-result-by-module";
import AcademicResultByFaculty from "../assessments/academic-result/academic-result-by-faculty";
import TuitionFee from "../registration/admissions/tution-fees";

import InventorySettings from "../human-resources/inventory/inventory-settings/inventory-settings";
import LedgerBranch from "../human-resources/pension/ledger/ledger-branch";
import ledgerDocuments from "../human-resources/pension/ledger/ledger-documents";
import LedgerDocuments from "../human-resources/pension/ledger/ledger-documents";
import LedgerEntries from "../human-resources/pension/ledger/ledger-entry";
import InventoryDashboard from "../human-resources/inventory/inventory-dashboard/inventory-dashboard";
import ItemAllocation from "../human-resources/inventory/inventory-dashboard/item-allocation/item-allocation";
import InventoryReport from "../human-resources/inventory/inventory-dashboard/inventory-report";
import MarkExamBarcode from "../assessments/exam/mark-exam-barcode/mark-exam-barcode";
import UpdateStudentInformation from "../user/student-manager/update-student-information/update-student-information";
import UpdateStaffPassword from "../user/staff-report/update-staff-password";
import ComplainTypes from "../user/service-desk/complain-types";
import TimetableMigration from "../academic/timetable/timetable-migration/timetable-migration";
import RegistrationClearanceReport
  from "../human-resources/finance/clearance-report/registration-clearance-report";
import ResultClearanceReport from "../human-resources/finance/clearance-report/result-clearance-report";
import InventoryManufacturer from "../human-resources/inventory/inventory-manufacturer/inventory-manufacturer";
import InventoryVendor from "../human-resources/inventory/inventory-vendor/inventory-vendor";
import InventoryLocation from "../human-resources/inventory/inventory-location/inventory-location";
import InventoryItem from "../human-resources/inventory/inventory-item/inventory-item";
import InventoryCategory from "../human-resources/inventory/inventory-category/inventory-category";
import InventoryTrackStock
  from "../human-resources/inventory/inventory-track-stock-movement/inventory-track-stock-movement";
import InventoryList from "../human-resources/inventory/inventory-list/inventory-list";
import InventoryPurchaseOrder from "../human-resources/inventory/inventory-purchase-order/inventory-purchase-order";
import InventoryAllocation from "../human-resources/inventory/inventory-allocation/inventory-allocate";
import FinanceAccount from "../human-resources/finance-and-budget/finance-account";
import FinanceTransaction from "../human-resources/finance-and-budget/finance-transaction";
import FinanceFinancialYear from "../human-resources/finance-and-budget/finance-financial-year";
import FinanceReportAccountsPayableAging
  from "../human-resources/finance-and-budget/finance-report-accounts-payable-aging";
import FinanceReportAccountReceivableAging
  from "../human-resources/finance-and-budget/finance-report-accounts-receivable-aging";
import FinanceReportBalanceSheet from "../human-resources/finance-and-budget/finance-report-balance-sheet";
import FinanceReportBankReconciliation from "../human-resources/finance-and-budget/finance-report-bank-reconciliation";
import FinanceReportGeneralLedger from "../human-resources/finance-and-budget/finance-report-general-ledger";
import FinanceReportIncomeStatement from "../human-resources/finance-and-budget/finance-report-income-statement";
import FinanceReportTrialBalance from "../human-resources/finance-and-budget/finance-report-trial-balance";
import AccountPayable from "../human-resources/inventory/inventory-account/account-payable"
import FinanceBudgetReport from "../human-resources/finance-and-budget/finance-budget-report";
import FinanceMyBudget from "../human-resources/finance-and-budget/finance-my-budget";
import FinanceBudgetProfile from "../human-resources/finance-and-budget/finance-budget-profile";
import StaffActivity from "../human-resources/staff-activity/staff-activity";
import PostExamResultByLecturer from "../assessments/exam/post-exam-lecturer/post-exam-lecturer";
import AcademicResultSummaryByCourse from "../assessments/academic-result/academic-result-summary-by-course";
import CAEntryReport from "../assessments/assessment/ca-entry/ca-entries-report";
import CANotSubmitted from "../assessments/reports/ca-not-submitted";
import CASubmitted from "../assessments/reports/ca-submitted";
import CAAcknowledgementByCourse from "../assessments/reports/ca-acknowledgment-by-course";
import AcademicResultByUniversity from "../assessments/academic-result/academic-result-by-university";
import StudentResultSlip from "../assessments/reports/student-result-slip";
import ExamBulkUpload from "../assessments/exam/post-exam-lecturer/exam-bulk-upload";
import ExamResultBulkUpload from "../assessments/exam/post-exam-lecturer/exam-bulk-upload";
import BankReport from "../human-resources/salary-report/bank-report";
import PaySlip from "../human-resources/salary-report/pay-slip";
import PensionScheduleReport from "../human-resources/salary-report/pension-report";
import SalarySummaryReport from "../human-resources/salary-report/salary-summary-report";
import SalaryBreakdownReport from "../human-resources/salary-report/salary-breakdown-report";
import NSITFReport from "../human-resources/salary-report/nsitf-report";
import ITFReport from "../human-resources/salary-report/itf-report";

export default function PageRoutes()
{
  return (
    <div className="d-flex flex-column flex-root">
      <div className="page d-flex flex-row flex-column-fluid">
        <div
          className="wrapper d-flex flex-column flex-row-fluid"
          id="kt_wrapper"
        >
          <Header />
          <div
            id="kt_content_container"
            className="container-custom container-xxl d-flex flex-column-fluid"
          >
            <div
              className="content d-flex flex-row flex-row-fluid"
              id="kt_content"
            >
              <Routes>
                {/* Dashboard Redirect */}
                <Route exact path="/" element={<Dashboard />} />
                <Route path="/sample" element={<Sample />} />
                {/* General */}
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/reset-password/:slug"
                  element={<ResetPassword />}
                />
                {/* HR Routes */}
                <Route
                  path="/human-resources/add/staff"
                  element={<AddEditStaff />}
                />
                <Route
                  path="/human-resources/staff/profile/:staffId"
                  element={<StaffProfile />}
                />
                <Route
                  path="/human-resources/upload/staff/document"
                  element={<UploadStaffDocument />}
                />
                <Route
                  path="/human-resources/add/staff/qualifications"
                  element={<AddStaffQualifications />}
                />
                <Route
                  path="/human-resources/add/staff/pension/record"
                  element={<AddEditStaffPensionRecord />}
                />
                <Route
                  path="/human-resources/add/staff/bank"
                  element={<AddStaffBank />}
                />
                <Route
                  path="/human-resources/add/staff/nok"
                  element={<AddStaffNOK />}
                />
                <Route
                  path="/human-resources/staff-management/documents"
                  element={""}
                />
                <Route path="/human-resources/staff-management/documents" element={""} />
                <Route path="/human-resources/staff-activity" element={<StaffActivity />} />
                {/*pension Routes*/}
                <Route path="/human-resources/pension/reports" element={""} />
                <Route
                  path="/human-resources/pension/post-pension-arrears"
                  element={""}
                />
                {/*Others*/}
                <Route
                  path="/human-resources/others/inventory"
                  element={<Inventory />}
                />
                <Route
                  path="/human-resources/others/banks"
                  element={<HRBank />}
                />
                <Route
                  path="/human-resources/others/qualifications"
                  element={<HRQualifications />}
                />
                <Route
                  path="/human-resources/others/designations"
                  element={<HRDesignations />}
                />
                <Route
                  path="/human-resources/others/title"
                  element={<HRTitle />}
                />
                <Route
                  path="/human-resources/others/qualifications"
                  element={<HRQualifications />}
                />
                <Route
                  path="/human-resources/others/designations"
                  element={<HRDesignations />}
                />
                <Route
                  path="/human-resources/others/nationality"
                  element={<HRNationality />}
                />
                <Route
                  path="/human-resources/pension/settings"
                  element={<HRPensionSettings />}
                />
                <Route
                  path="/human-resources/pension/administrators"
                  element={<HRPensionAdministrator />}
                />
                <Route
                  path="/human-resources/pension/report"
                  element={<HRPensionReport />}
                />
                <Route
                  path="/human-resources/pension/staff/enrolled"
                  element={<HRPensionStaffEnrolledReport />}
                />
                <Route
                  path="/human-resources/pension/staff/not-enrolled"
                  element={<HRPensionStaffNotEnrolledReport />}
                />
                <Route
                  path="/human-resources/payroll/salary-settings"
                  element={<HrSalarySettings />}
                />
                <Route
                  path="/human-resources/payroll/general-ledger"
                  element={<HRGeneralLedger />}
                />
                <Route
                  path="/human-resources/payroll/manage-allowance-and-deduction"
                  element={<HRPayrollManageAllowanceAndDeduction />}
                />
                <Route
                  path="/human-resources/payroll/run-allowance-and-deduction"
                  element={<HRPayrollRunAllowanceAndDeduction />}
                />
                <Route
                  path="/human-resources/payroll/post-schedule"
                  element={<HrPayrollPostSchedule />}
                />
                <Route
                  path="/human-resources/payroll/send-payslips"
                  element={<HrPayrollSendPayslips />}
                />
                <Route
                  path="/human-resources/payroll/gross-pay-management"
                  element={<HrGrossPayManagement />}
                />
                <Route
                  path="/human-resources/finance-report/all-payment"
                  element={<AllPaymentReport />}
                />
                <Route
                  path="/human-resources/finance-report/custom-payment-report"
                  element={<CustomPaymentReport />}
                />
                <Route
                  path="/human-resources/finance-report/payment-report-by-trimester"
                  element={<PaymentReportByTrimester />}
                />
                <Route
                  path="/human-resources/finance-report/tuition-fee-payment-report"
                  element={<TuitionFeePaymentReport />}
                />
                {/* jobs routes */}
                <Route
                  path="/human-resources/jobs/openings"
                  element={<JobOpenings />}
                />
                <Route
                  path="/human-resources/jobs/applications"
                  element={<JobApplications />}
                />
                <Route
                  path="/human-resources/jobs/applications/:id"
                  element={<JobApplicationDetails />}
                />
                <Route
                  path="/human-resources/jobs/enrolment"
                  element={<EnrolmentList />}
                />

                <Route
                  path="/human-resources/staff-leave/settings"
                  element={<StaffLeaveSettings />}
                />
                <Route
                  path="/human-resources/staff-leave/category-members"
                  element={<StaffLeaveCategoryMembers />}
                />
                <Route
                  path="/human-resources/staff-leave/apply"
                  element={<StaffLeaveApply />}
                />
                <Route
                  path="/human-resources/staff-leave/applications"
                  element={<StaffLeaveApplications />}
                />

                {/*academics*/}
                <Route path="/academics/faculty" element={<Faculty />} />
                <Route path="/academics/department" element={<Department />} />
                <Route path="/academics/modules" element={<Modules />} />
                <Route
                  path="/academics/timetable/settings"
                  element={<TimetableSettings />}
                />
                <Route
                  path="/academics/timetable/add-schedule"
                  element={<ManageTimetableSchedule />}
                />
                <Route
                  path="/academics/timetable/update-schedule/:slug"
                  element={<ManageTimetableSchedule />}
                />
                <Route
                  path="/academics/timetable/student-group"
                  element={<TimetableStudentGroup />}
                />
                <Route
                  path="/academics/timetable/semester"
                  element={<TimetableSemester />}
                />
                <Route
                  path="/academics/timetable/view"
                  element={<ViewTimeTableGrid />}
                />
                <Route
                  path="/academics/timetable/view"
                  element={<ViewTimeTableGrid />}
                />
                <Route
                  path="/academics/timetable/timetable-report"
                  element={<TimetableReport />}
                />
                <Route
                  path="/academics/timetable/timetable-migration"
                  element={<TimetableMigration />}
                />
                <Route
                  path="/academics/timetable/timetable-by-block"
                  element={<TimeTableByBlock />}
                />
                <Route
                  path="/academics/timetable/timetable-by-course"
                  element={<TimeTableByCourse />}
                />
                <Route
                  path="/academics/timetable/module-clash"
                  element={<ClashByPass />}
                />
                <Route
                  path="/academics/module-running/by-course"
                  element={<ByCourse />}
                />
                <Route
                  path="/academics/module-running/by-department"
                  element={<ByDepartment />}
                />
                <Route
                  path="/academics/module-running/by-faculty"
                  element={<ByFaculty />}
                />
                <Route
                  path="/academics/module-running/by-university"
                  element={<ByUniversity />}
                />
                <Route path="/academics/courses" element={<Course />} />
                <Route
                  path="/assessment/exam-timetable/schedule"
                  element={<ExamTimeTableSchedule />}
                />
                <Route
                  path="/assessment/exam-timetable/schedule-venue"
                  element={<ExamTimeTableHall />}
                />

                <Route
                  path="/assessment/examinations/reports"
                  element={<ExaminationReports />}
                />

                <Route
                  path="/assessment/exam-timetable/report"
                  element={<ExamTimeTableReport />}
                />

                <Route path="/assessment/academic-result/course" element={<AcademicResultByCourse />} />
                <Route path="/assessment/academic-result/department" element={<AcademicResultByDepartment />} />
                <Route path="/assessment/academic-result/faculty" element={<AcademicResultByFaculty />} />
                <Route path="/assessment/academic-result/module" element={<AcademicResultByModule />} />
                <Route path="/assessment/academic-result/university" element={<AcademicResultByUniversity />} />
                <Route path="/assessment/academic-result-summary/course" element={<AcademicResultSummaryByCourse />} />
                <Route path="/assessment/report/ca-not-submitted" element={<CANotSubmitted />} />
                <Route path="/assessment/report/ca-submitted" element={<CASubmitted />} />
                <Route path="/assessment/report/ca-summary-print-by-course" element={<CAAcknowledgementByCourse />} />
                <Route path="/assessment/report/ca-summary-print" element={<CAAcknowledgementByCourse />} />
                <Route path="/assessment/report/student-result-slip" element={<StudentResultSlip />} />

                <Route path="/academics/exam-timetable" element={""} />
                <Route
                  path="/academics/exam-timetable/schedule"
                  element={<ExamTimeTableSchedule />}
                />
                <Route
                  path="/academics/exam-timetable/schedule-venue"
                  element={<ExamTimeTableHall />}
                />
                <Route
                  path="/academics/exam-timetable/report"
                  element={<ExamTimeTableReport />}
                />
                <Route
                  path="/application-processing-ug/:applicant"
                  element={<ProcessApplication />}
                />
                <Route
                  path="/application-processing-pg/:applicant"
                  element={<ProcessApplicationPg />}
                />
                <Route
                  path="/registration/admissions"
                  element={<RegistrationDashboard />}
                />
                <Route path="/registration/admissions/tuition-fees" element={<TuitionFee />} />
                <Route
                  path="/registration/admissions/supporting-document"
                  element={<SupportingDocument />}
                />
                <Route
                  path="/registration/admissions/admission-dateline"
                  element={<AdmissionDateLine />}
                />
                {/* regisration report */}
                <Route
                  path="/registration/registration-report/registered-students-count-by-module"
                  element={<RegisteredStudentsCountByModule />}
                />
                <Route
                  path="/registration/registration-report/active-not-registered"
                  element={<ActiveNotRegistered />}
                />
                <Route
                  path="/registration/registration-report/paid-not-registered"
                  element={<PaidNotRegistered />}
                />
                <Route
                  path="/registration/registration-report/registered-not-paid"
                  element={<RegisteredNotPaid />}
                />
                <Route
                  path="/registration/registration-report/carry-over-not-registered"
                  element={<CarryOverNotRegistered />}
                />

                <Route
                  path="/registration/progressions/progression-steps"
                  element={<ProgressionStep />}
                />

                <Route
                  path="/registration/progression/semester-progression"
                  element={<SemesterProgression />}
                />
                <Route
                  path="/registration/registration/missing-registration-module"
                  element={<MissingRegistrationModule />}
                />

                {/* Hostel Module Routes    */}

                <Route
                  path="/registration/progression/semester-progression"
                  element={<SemesterProgression />}
                />

                {/* Hostel Module Routes    */}

                <Route
                  path="/registration/progression/semester-progression"
                  element={<SemesterProgression />}
                />

                <Route
                  path="/registration/hostel/hostels"
                  element={<Hostel />}
                />

                <Route
                  path="/registration/hostel/hostel-rooms"
                  element={<HostelRooms />}
                />
                <Route
                  path="/registration/hostel/hostel-allocations"
                  element={<HostelAllocations />}
                />
                <Route
                  path="/registration/hostel/hostel-allocation-form"
                  element={<HostelAllocationForm />}
                />
                <Route
                  path="/registration/hostel/reset-hostel-rooms"
                  element={<ResetHostelRooms />}
                />

                {/* Hostel Module Routes    */}

                {/* Users-> Student Manager Routes */}
                <Route
                  path="/users/student-manager/add-student-portal"
                  element={<AddStudentPortal />}
                />
                <Route
                  path="/users/student-manager/activate-new-students"
                  element={<ActivateNewStudents />}
                />

                <Route
                  path="/users/student-manager/login-to-student-portal"
                  element={<LoginToStudentPortal />}
                />
                <Route
                  path="/registration/student-deferment/deferment"
                  element={<StudentDeferment />}
                />
                <Route
                  path="/registration/student-deferment/student-deferment-return"
                  element={<StudentDefermentReturn />}
                />

                <Route
                  path="/registration/student-deferment/return-list"
                  element={<ReturnList />}
                />
                <Route
                  path="/users/student-manager/student-profile"
                  element={<StudentProfile />}
                />
                <Route
                  path="/users/student-manager/student-profile/:id"
                  element={<StudentParticularProfile />}
                />
                <Route
                  path="/users/student-manager/update-student-details"
                  element={<UpdateStudentDetails />}
                />

                <Route
                  path="/users/student-manager/update-student-information"
                  element={<UpdateStudentInformation />}
                />

                <Route
                  path="/users/staff-report/update-staff-password"
                  element={<UpdateStaffPassword />}
                />

                <Route
                  path="/users/internship-manager"
                  element={<InternshipManager />}
                />

                {/* Users-> Student Manager Routes */}

                {/* Graduation Clearance Module Start */}
                <Route
                  path="/users/graduation-clearance/admission-clearance"
                  element={<AdmissionClearance />}
                />
                <Route
                  path="/users/graduation-clearance/exams-clearance"
                  element={<ExamClearance />}
                />
                <Route
                  path="/users/graduation-clearance/library-clearance"
                  element={<LibraryClearance />}
                />
                <Route
                  path="/users/graduation-clearance/finance-clearance"
                  element={<FinanceClearance />}
                />
                <Route
                  path="/users/graduation-clearance/initiate-clearance"
                  element={<InitiateClearance />}
                />

                {/* Graduation Clearance Module End    */}

                {/* Transcript Module Start    */}
                <Route
                  path="/registration/transcript-applications/all-transcript-applications"
                  element={<AllTranscriptApplications />}
                />
                <Route
                  path="/registration/transcript-applications/pending-transcript-applications"
                  element={<PendingTranscriptApplications />}
                />
                {/* Transcript Module End    */}

                {/* Finance  */}
                <Route
                  path="/human-resources/finance/finance-settings"
                  element={<FinanceSettings />}
                />
                <Route
                  path="/human-resources/finance/post-payment"
                  element={<PostPayment />}
                />
                <Route
                  path="/human-resources/finance/payment-receipt/:slug"
                  element={<PaymentReceipt />}
                />
                <Route
                  path="/human-resources/finance/allow-student-registration"
                  element={<FinanceAllowRegistration />}
                />
                <Route
                  path="/human-resources/finance/allow-student-result"
                  element={<FinanceAllowResult />}
                />
                <Route path="/human-resources/finance-and-budget/account" element={<FinanceAccount />} />
                <Route path="/human-resources/finance-and-budget/transaction" element={<FinanceTransaction />} />
                <Route path="/human-resources/finance-and-budget/financial-year" element={<FinanceFinancialYear />} />
                <Route path="/human-resources/finance-and-budget/accounts-payable-aging-report" element={<FinanceReportAccountsPayableAging />} />
                <Route path="/human-resources/finance-and-budget/accounts-receivable-aging-report" element={<FinanceReportAccountReceivableAging />} />
                <Route path="/human-resources/finance-and-budget/balance-sheet-report" element={<FinanceReportBalanceSheet />} />
                <Route path="/human-resources/finance-and-budget/bank-reconciliation-report" element={<FinanceReportBankReconciliation />} />
                <Route path="/human-resources/finance-and-budget/finance-general-ledger-report" element={<FinanceReportGeneralLedger />} />
                <Route path="/human-resources/finance-and-budget/income-statement-report" element={<FinanceReportIncomeStatement />} />
                <Route path="/human-resources/finance-and-budget/trial-balance-report" element={<FinanceReportTrialBalance />} />
                <Route path="/human-resources/finance-and-budget/budget-report" element={<FinanceBudgetReport />} />
                <Route path="/human-resources/finance-and-budget/my-budget" element={<FinanceMyBudget />} />
                <Route path="/human-resources/finance-and-budget/budget-profile" element={<FinanceBudgetProfile />} />

                <Route
                  path="/registration/registration/semester-registration"
                  element={<SemesterRegistration />}
                />
                {/* timetable planner */}
                <Route
                  path="/academics/timetable-planner/module-assignment"
                  element={<ModuleAssignment />}
                />
                <Route
                  path="/academics/timetable-planner/module-assignment2"
                  element={<ModuleAssignment2 />}
                />
                <Route
                  path="/academics/timetable-planner/lecturer-assignment"
                  element={<LecturerAssignment />}
                />
                <Route
                  path="/academics/timetable-planner/officer-assignment"
                  element={<OfficerAssignment />}
                />
                <Route
                  path="/academics/timetable-planner/dean-approval"
                  element={<DeanApproval />}
                />
                <Route
                  path="/academics/timetable-planner/final-submission"
                  element={<FinalSubmission />}
                />
                <Route
                  path="/academics/timetable-planner/submission-report"
                  element={<SubmissionReport />}
                />
                <Route
                  path="/academics/timetable-planner/process-running-modules"
                  element={<ProcessRunningModules />}
                />
                {/*Student Manager*/}
                <Route
                  path="/registration/student-manager/enrolment"
                  element={<NewStudentEnrolment />}
                />
                <Route
                  path="/registration/student-manager/enrolment/report"
                  element={<NewStudentEnrolmentReport />}
                />
                <Route
                  path="/registration/student-manager/enrolment/:id"
                  element={<NewStudentEnrolmentDetails />}
                />
                <Route
                  path="/registration/registration/deferment/applications"
                  element={<DefermentApplications />}
                />
                {/*SETTINGS*/}
                <Route
                  path="/settings/permission/menus"
                  element={<PermissionMenus />}
                />
                <Route
                  path="/settings/permission/group"
                  element={<PermissionGroup />}
                />
                <Route
                  path="/settings/permission/permission"
                  element={<PermissionPermission />}
                />
                <Route
                  path="/settings/registration/settings"
                  element={<SemesterRegistrationSettings />}
                />

                <Route
                  path="/assessments/continuous-assessment/settings"
                  element={<CASettings />}
                />
                <Route
                  path="/assessments/continuous-assessment/exams/settings"
                  element={<EXAMSCASettings />}
                />

                <Route
                  path="/assessments/continuous-assessment/process/ca"
                  element={<ProcessCA />}
                />

                <Route
                  path="/assessments/continuous-assessment/entry"
                  element={<CAEntry />}
                />

                <Route
                  path="/assessments/continuous-assessment/entry-report"
                  element={<CAEntryReport />}
                />

                <Route
                  path="/assessments/continuous-assessment/final/submission/"
                  element={<CAFinalSubmission />}
                />

                <Route
                  path="/assessments/continuous-assessment/exam/mark/ca/"
                  element={<ExamCaEntry />}
                />

                <Route
                  path="/assessments/continuous-assessment/exam/final/ca/submission/"
                  element={<EXAMCAFinalSubmission />}
                />

                <Route
                  path="/assessments/exam/exam-barcode"
                  element={<ExamBarcode />}
                />

                <Route
                  path="/assessments/exam/mark-exam-barcode"
                  element={<MarkExamBarcode />}
                />

                <Route
                  path="/assessments/exam/grade-settings"
                  element={<ExamGradeSettings />}
                />

                <Route
                  path="/assessments/exam/post-exam-result-barcode"
                  element={<PostExamResult />}
                />
                <Route
                  path="/assessments/exam/post-exam-result-default"
                  element={<PostExamResult />}
                />
                <Route
                  path="/assessments/exam/post-exam-result-lecturer-default"
                  element={<PostExamResultByLecturer />}
                />
                <Route
                  path="/assessments/exam/bulk-upload"
                  element={<ExamResultBulkUpload />}
                />
                <Route
                  path="/assessments/exam/update-result"
                  element={<PostExamResult />}
                />
                <Route
                  path="/assessments/exam/process-result"
                  element={<ProcessResult />}
                />
                <Route
                  path="/assessments/exam/approve-result"
                  element={<ApproveResult />}
                />
                <Route
                  path="/assessments/exam/delete-result"
                  element={<DeleteResult />}
                />
                <Route
                  path="/assessments/exam/report/activity-tracker"
                  element={<ResultActivityTracker />}
                />
                <Route
                  path="/assessments/exam/approve-result"
                  element={<ApproveResult />}
                />
                <Route
                  path="/assessments/exam/delete-result"
                  element={<DeleteResult />}
                />
                <Route
                  path="/assessments/exam/report/activity-tracker"
                  element={<ResultActivityTracker />}
                />
                <Route
                  path="/assessments/exam/approve-result"
                  element={<ApproveResult />}
                />
                <Route
                  path="/assessments/exam/delete-result"
                  element={<DeleteResult />}
                />

                <Route
                  path="/assessments/attendance"
                  element={<GenerateAttendance />}
                />
                <Route
                  path="/assessments/attendance/list"
                  element={<AttendanceList />}
                />

                <Route
                  path="/assessments/evaluate/gpa"
                  element={<EvaluateGPA />}
                />

                {/*Users Reports*/}
                <Route
                  path="/users/staff-report/staff-list"
                  element={<StaffList />}
                />
                <Route
                  path="/users/staff-report/dean-list"
                  element={<DeanList />}
                />

                <Route
                  path="/users/staff-report/hod-list"
                  element={<HodList />}
                />
                <Route
                  path="/users/staff-report/staff-distribution"
                  element={<StaffDistribution />}
                />
                <Route
                  path="/users/staff-report/staff-list-by-module"
                  element={<StaffListByModule />}
                />
                <Route
                  path="/users/staff-report/staff-list-by-designation"
                  element={<StaffListByDesignation />}
                />
                <Route
                  path="/users/staff-report/staff-list-by-module-and-semester"
                  element={<StaffListByModuleAndSemester />}
                />
                <Route
                  path="/users/staff-report/staff-list-by-google-scholar"
                  element={<StaffListByGoogleScholar />}
                />
                <Route
                  path="/users/student-report/active-student-list"
                  element={<ActiveStudentList />}
                />
                <Route
                  path="/users/student-report/active-student-list-by-course"
                  element={<ActiveStudentListByCourse />}
                />
                <Route
                  path="/users/student-report/active-student-list-by-mode-of-entry"
                  element={<ActiveStudentListByModeOfEntry />}
                />
                <Route
                  path="/users/student-report/active-student-list-by-department"
                  element={<ActiveStudentListByDepartment />}
                />
                <Route
                  path="/users/student-report/student-list-by-lecturer-module"
                  element={<StudentListByLecturerModule />}
                />
                <Route
                  path="/users/student-report/student-list-by-course-all"
                  element={<StudentListByCourseAll />}
                />
                <Route
                  path="/users/student-report/student-list-all"
                  element={<StudentListAll />}
                />
                <Route
                  path="/users/student-report/graduating-list"
                  element={<GraduatingList />}
                />
                <Route
                  path="/users/student-report/students-contact-by-module"
                  element={<StudentsConstactByModule />}
                />
                <Route
                  path="/users/student-report/students-contact-by-lecturer-module"
                  element={<StudentsContactByLecturerModule />}
                />
                <Route
                  path="/users/student-report/last-semester-registered"
                  element={<LastSemesterRegistered />}
                />
                <Route
                  path="/users/student-report/jamb-report"
                  element={<JambReport />}
                />
                <Route
                  path="/users/student-report/number-of-students-per-module"
                  element={<NumberOfStudentsPerModule />}
                />
                <Route
                  path="/users/student-report/number-of-students-per-program"
                  element={<NumberOfStudentsPerProgram />}
                />
                <Route
                  path="/users/student-report/students-enrolled-by-department"
                  element={<StudentEnrolledByDepartment />}
                />
                <Route
                  path="/users/generate/id/card"
                  element={<GenerateIDCard />}
                />

                <Route
                  path="/users/capture/biometric"
                  element={<CaptureBiometric />}
                />

                <Route
                  path="/users/change-of-course/guardian"
                  element={<ChangeofCourseGuardian />}
                />
                <Route
                  path="/users/change-of-course/admission"
                  element={<ChangeOfCourseAdmissionOfficeApproval />}
                />
                <Route
                  path="/users/change-of-course/report"
                  element={<ChangeofCourseReport />}
                />
                <Route
                  path="/users/change-of-course/registrar"
                  element={<ChangeOfCourseRegistrarOfficeApproval />}
                />

                <Route
                  path="/users/edit-staff-profile"
                  element={<EditStaffProfile />}
                />

                <Route
                  path="/change-of-course/guardian-approve/:id"
                  element={<GuardianApprovalForm />}
                />

                {/*Publication Manager*/}
                <Route
                  path="/users/publication-manager"
                  element={<PublicationManager />}
                />

                <Route
                  path="/users/service-desk/log-complain"
                  element={<LogComplain />}
                />
                <Route
                  path="/users/service-desk/complain-types"
                  element={<ComplainTypes />}
                />
                <Route
                  path="/users/service-desk/complain-list"
                  element={<ComplainList />}
                />
                <Route
                  path="/users/service-desk/my-complains"
                  element={<MyComplains />}
                />
                <Route
                  path="/users/service-desk/assigned-complains"
                  element={<ComplainsAssignedToMe />}
                />
                <Route
                  path="/users/publication-manager"
                  element={<PublicationManager />}
                />

                {/*Inventory*/}


                <Route
                  path="human-resources/finance/registration-clearance-report"
                  element={<RegistrationClearanceReport />}
                />
                <Route
                  path="human-resources/finance/result-clearance-report"
                  element={<ResultClearanceReport />}
                />

                <Route path="/human-resources/inventory/inventory-settings" element={<InventorySettings />} />
                <Route path="/human-resources/inventory/dashboard" element={<InventoryDashboard />} />
                <Route path="/human-resources/inventory/item/allocation/:slug" element={<ItemAllocation />} />
                <Route path="/human-resources/inventory/item/report/:slug" element={<InventoryReport />} />
                {/*//11-March-2023 -- ahmad*/}
                <Route path="/human-resources/payroll/ledger-branch" element={<LedgerBranch />} />
                <Route path="/human-resources/payroll/ledger-documents" element={<LedgerDocuments />} />
                <Route path="/human-resources/payroll/ledger-entries" element={<LedgerEntries />} />

                {/*begin::Inventory*/}
                <Route exact path={"/human-resources/inventory/inventory-list"} element={<InventoryList />} />
                {/*  <Route exact path={"/human-resources/inventory/receive-inventory"} element={<InventoryReceiveItem />} />*/}
                <Route exact path={"/human-resources/inventory/track-stock-movements"} element={<InventoryTrackStock />} />
                <Route exact path={"/human-resources/inventory/inventory-item"} element={<InventoryItem />} />
                <Route exact path={"/human-resources/inventory/manufacturer"} element={<InventoryManufacturer />} />
                <Route exact path={"/human-resources/inventory/vendor"} element={<InventoryVendor />} />
                <Route exact path={"/human-resources/inventory/category"} element={<InventoryCategory />} />
                <Route exact path={"/human-resources/inventory/location"} element={<InventoryLocation />} />
                <Route exact path={"/human-resources/inventory/allocate"} element={<InventoryAllocation />} />
                <Route exact path={"/human-resources/inventory/generate-purchase-order"} element={<InventoryPurchaseOrder />} />
                <Route exact path={"/human-resources/inventory/finance"} element={<AccountPayable />} />
                {/*end::Inventory*/}


                <Route path="/human-resources/salary-report/bank-report" element={<BankReport />}/>
                <Route path="/human-resources/salary-report/pay-slip" element={<PaySlip />}/>
                <Route path="/human-resources/salary-report/pension-report" element={<PensionScheduleReport />}/>
                <Route path="/human-resources/salary-report/salary-summary" element={<SalarySummaryReport />}/>
                <Route path="/human-resources/salary-report/salary-breakdown" element={<SalaryBreakdownReport />}/>
                <Route path="/human-resources/salary-report/nsitf-report" element={<NSITFReport />}/>
                <Route path="/human-resources/salary-report/itf-report" element={<ITFReport />}/>


                <Route path="*" element={<Dashboard />} />
              </Routes>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

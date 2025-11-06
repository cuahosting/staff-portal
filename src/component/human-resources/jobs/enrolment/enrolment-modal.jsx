import { formatDate, shortCode } from "../../../../resources/constants";
import { serverLink } from "../../../../resources/url";
import Select2 from "react-select2-wrapper";
import "react-select2-wrapper/css/select2.css";
import './enrolment.css'

const StaffEnrolmentModal = (props) => {
    //let data = props.details;
    let data = props.createStaff;
    return (
        <form>
            {props.details.length > 0 &&
                <div className="row col-md-12">
                    <div className="col-md-3">
                        <div className="image-input image-input-empty image-input-outline" >
                            <div className="image-input-wrapper w-125px h-125px">
                                <img style={{ maxWidth: '125px', maxHeight: '125px', borderRadius: '5px' }}
                                    src={data?.Image !== null ? data?.Image?.includes("simplefileupload") ? data?.Image :
                                        `${serverLink}public/uploads/${shortCode}/hr/document/${data?.Image}` : ""}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-9">
                        <div className="d-flex flex-wrap flex-stack">
                            <div className="d-flex flex-column flex-grow-1 pe-8">
                                <div className="d-flex flex-wrap">
                                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                        <div className="fw-bold fs-6 text-gray-400">Position</div>
                                        <div className="d-flex align-items-center">
                                            <div className="fs-2 fw-bolder">
                                                {data.Position}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                        <div className="fw-bold fs-6 text-gray-400">Department</div>
                                        <div className="d-flex align-items-center">
                                            <div className="fs-2 fw-bolder">
                                                {props.departmentList?.length > 0 &&
                                                    props.departmentList?.filter(
                                                        x => x.DepartmentCode?.toLowerCase() === data.Department?.toLowerCase())[0]?.DepartmentName
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                        <div className="fw-bold fs-6 text-gray-400">Gender</div>
                                        <div className="d-flex align-items-center">
                                            <div className="fs-2 fw-bolder">
                                                {data.Gender}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row col-md-12 mt-4">
                                        <div className="flex-column-fluid">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="row mb-3">
                                                        <label className="col-lg-5 fw-bold text-muted">Nationality: </label>
                                                        <div className="col-lg-7">
                                                            <span className="fw-bolder fs-6 text-gray-800">&emsp;
                                                                {
                                                                    props.countries?.length > 0 && data.NationalityID !== "" &&
                                                                    props.countries?.filter(x => x.EntryID.toString() === data.NationalityID.toString())[0]?.Country
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="row mb-3">
                                                        <label className="col-lg-5 fw-bold text-muted">State:</label>
                                                        <div className="col-lg-7">
                                                            <span className="fw-bolder fs-6 text-gray-800">&emsp;
                                                                {
                                                                    props.stateList?.length > 0 && data.StateID !== "" &&
                                                                    props.stateList?.filter(x => x.EntryID?.toString() === data.StateID.toString())[0]?.StateName
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="row mb-3">
                                                        <label className="col-lg-5 fw-bold text-muted">LGA:</label>
                                                        <div className="col-lg-7">
                                                            <span className="fw-bolder fs-6 text-gray-800">&emsp;
                                                                {
                                                                    props.lgaList?.length > 0 && data.LgaID !== "" &&
                                                                    props.lgaList?.filter(x => x.EntryID?.toString() === data.LgaID?.toString())[0]?.LgaName
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="row mb-3">
                                                        <label className="col-lg-5 fw-bold text-muted">Religion:</label>
                                                        <div className="col-lg-7">
                                                            <span className="fw-bolder fs-6 text-gray-800">&emsp;{data.Religion}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="row mb-3">
                                                        <label className="col-lg-5 fw-bold text-muted">MaritalStatus:</label>
                                                        <div className="col-lg-7">
                                                            <span className="fw-bolder fs-6 text-gray-800">&emsp;{data.MaritalStatus}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="row mb-3">
                                                        <label className="col-lg-5 fw-bold text-muted">Date Of Birth:</label>
                                                        <div className="col-lg-7">
                                                            <span className="fw-bolder fs-6 text-gray-800">&emsp;{formatDate(data.DateOfBirth)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-12 mt-5">
                                                    <div className="row mb-3">
                                                        <label className="col-lg-5 fw-bold text-muted">Email Address:</label>
                                                        <div className="col-lg-7">
                                                            <span className="fw-bolder fs-6 text-gray-800">&emsp;{data.EmailAddress}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="row mb-3">
                                                        <label className="col-lg-5 fw-bold text-muted">PhoneNumber</label>
                                                        <div className="col-lg-7">
                                                            <span className="fw-bolder fs-6 text-gray-800">&emsp;{data.PhoneNumber}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="row mb-3">
                                                        <label className="col-lg-5 fw-bold text-muted">Contact Address:</label>
                                                        <div className="col-lg-7">
                                                            <span className="fw-bolder fs-6 text-gray-800">&emsp;{data.ContactAddress}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="card mb-4 bg-light text-center">
                                        <div className="card-body py-12">
                                            <a target={"_blank"} href={data.Researchgate} className="mx-4 social">
                                                <img src="https://img.icons8.com/external-tal-revivo-color-tal-revivo/48/000000/external-researchgate-a-social-networking-site-for-scientists-and-researchers-to-share-papers-logo-color-tal-revivo.png" />
                                            </a>
                                            <a target={"_blank"} href={data.Scholar} className="mx-4 social">
                                                <img src="https://img.icons8.com/color/48/000000/google-scholar--v3.png" />
                                            </a>
                                            <a target={"_blank"} href={data.Orcid} className="mx-4 social">
                                                <img src="https://img.icons8.com/windows/48/000000/orcid.png" />
                                            </a>
                                            <a target={"_blank"} href={data.Academia} className="mx-4 social">
                                                <img src="https://img.icons8.com/external-tal-revivo-shadow-tal-revivo/48/000000/external-academia-edu-online-teaching-and-learning-website-logo-shadow-tal-revivo.png" />                                            </a>
                                            <a target={"_blank"} href={data.Facebook} className="mx-4 social">
                                                <img src="https://img.icons8.com/fluency/48/000000/facebook-new.png" />
                                            </a>
                                            <a target={"_blank"} href={data.Twitter} className="mx-4 social">
                                                <img src="https://img.icons8.com/fluency/48/000000/twitter.png" />                                            </a>
                                            <a target={"_blank"} href={data.LinkedIn} className="mx-4 social">
                                                <img src="https://img.icons8.com/color/48/000000/linkedin-circled--v1.png" />                                            </a>
                                        </div>
                                    </div>

                                    <div className="row col-md-12 mt-4">
                                        <div className="flex-column-fluid">
                                            <div className="row">
                                                <div className="col-lg-6 pb-5">
                                                    <div className="form-group">
                                                        <label htmlFor="DesignationID" className="mb-2">Designation</label>
                                                        <select
                                                            id="DesignationID"
                                                            className="form-control"
                                                            required
                                                            onChange={props.onEdit}
                                                        >
                                                            <option value="">Select Option</option>
                                                            {props.designations.length > 0 ? (
                                                                <>
                                                                    {props.designations.map((item, index) => {
                                                                        return (
                                                                            <option key={index} value={item.EntryID}>
                                                                                {item.DesignationName}
                                                                            </option>
                                                                        );
                                                                    })}
                                                                </>
                                                            ) : (
                                                                ""
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="col-lg-6 pb-5">
                                                    <div className="form-group">
                                                        <label htmlFor="StaffType" className="mb-2">Staff Type</label>
                                                        <select
                                                            id="StaffType"
                                                            className="form-control"
                                                            required
                                                            onChange={props.onEdit}
                                                        >
                                                            <option value="">Select Option</option>
                                                            <option value={"Casual"}>Casual</option>
                                                            <option value={"Contract"}>Contract</option>
                                                            <option value={"Full Time"}>Full Time</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="col-lg-6 pb-5">
                                                    <div className="form-group">
                                                        <label htmlFor="GrossPay" className="mb-2">Gross Pay</label>
                                                        <input
                                                            type="float"
                                                            id="GrossPay"
                                                            className="form-control"
                                                            placeholder="Gross Pay"
                                                            onChange={props.onEdit}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-lg-6 col-md-6 pb-5">
                                                    <div className="form-group">
                                                        <label htmlFor="DateOfFirstEmployment" className="mb-2">
                                                            Date Of First Employment
                                                        </label>
                                                        <input
                                                            type="date"
                                                            id="DateOfFirstEmployment"
                                                            className="form-control"
                                                            placeholder="Date Of First Employment"
                                                            required
                                                            onChange={props.onEdit}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-lg-6 col-md-6 pb-5">
                                                    <div className="form-group">
                                                        <label htmlFor="DateOfCurrentEmployment" className="mb-2">
                                                            Date Of Current Employment
                                                        </label>
                                                        <input
                                                            type="date"
                                                            id="DateOfCurrentEmployment"
                                                            className="form-control"
                                                            placeholder="Date Of Current Employment"
                                                            onChange={props.onEdit}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-lg-6 col-md-6 pb-5">
                                                    <div className="form-group">
                                                        <label htmlFor="ContractStartDate" className="mb-2">Contract Start Date</label>
                                                        <input
                                                            type="date"
                                                            id="ContractStartDate"
                                                            className="form-control"
                                                            placeholder="Contract Start Date"
                                                            onChange={props.onEdit}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-lg-6 col-md-6 pb-5">
                                                    <div className="form-group">
                                                        <label htmlFor="ContractEndDate" className="mb-2">Contract End Date</label>
                                                        <input
                                                            type="date"
                                                            id="ContractEndDate"
                                                            className="form-control"
                                                            placeholder="Contract End Date"
                                                            onChange={props.onEdit}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-lg-6 col-md-6 pb-5">
                                                    <div className="form-group">
                                                        <label htmlFor="LineManagerID" className="mb-2">Line Manager</label>
                                                        <select
                                                            id="LineManagerID"
                                                            className="form-control"
                                                            required
                                                            onChange={props.onEdit}
                                                        >
                                                            <option value="">Select Option</option>
                                                            {props.staffList.length > 0 ? (
                                                                <>
                                                                    {props.staffList?.map((item, index) => {
                                                                        return (
                                                                            <option key={index} value={item.StaffID}>
                                                                                {item.StaffID} -- {item.FirstName + " " + item.MiddleName + " " + item.Surname}
                                                                            </option>
                                                                        );
                                                                    })}
                                                                </>
                                                            ) : (
                                                                ""
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="col-lg-6 col-md-6 pb-5">
                                                    <div className="form-group">
                                                        <label htmlFor="DepartmentCode" className="mb-2">Department</label>
                                                        <select
                                                            id="DepartmentCode"
                                                            className="form-control"
                                                            required
                                                            onChange={props.onEdit}
                                                        >
                                                            <option value="">Select Option</option>
                                                            {props.departmentList.length > 0 ? (
                                                                <>
                                                                    {props.departmentList.map((item, index) => {
                                                                        return (
                                                                            <option key={index} value={item.DepartmentCode}>
                                                                                {item.DepartmentName}
                                                                            </option>
                                                                        );
                                                                    })}
                                                                </>
                                                            ) : (
                                                                ""
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="col-lg-6 col-md-6 pb-5">
                                                    <div className="form-group">
                                                        <label htmlFor="CourseCode" className="mb-2">Course</label>
                                                        <select
                                                            id="CourseCode"
                                                            className="form-control"
                                                            required
                                                            onChange={props.onEdit}
                                                        >
                                                            <option value="">Select Option</option>
                                                            {props.courseList.length > 0 ? (
                                                                <>
                                                                    {props.courseList.map((item, index) => {
                                                                        return (
                                                                            <option key={index} value={item.CourseCode}>
                                                                                {item.CourseName}
                                                                            </option>
                                                                        );
                                                                    })}
                                                                </>
                                                            ) : (
                                                                ""
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-lg-12 col-md-12 pb-5">
                                                    <div className="form-group">
                                                        <label htmlFor="OfficialEmailAddress" className="mb-2">Official Email Address</label>
                                                        <input
                                                            type="email"
                                                            id="OfficialEmailAddress"
                                                            className="form-control"
                                                            placeholder="Official Email"
                                                            onChange={props.onEdit}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-lg-4 pb-5">
                                                    <div className="form-group">
                                                        <label htmlFor="IsActive" className="mb-2">IsActive ?</label>
                                                        <select
                                                            id="IsActive"
                                                            className="form-control"
                                                            required
                                                            onChange={props.onEdit} >
                                                            <option value="">Select Option</option>
                                                            <option value={"1"}>YES</option>
                                                            <option value={"0"}>NO</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4 pb-5">
                                                    <div className="form-group">
                                                        <label htmlFor="IsAcademicStaff" className="mb-2">Is Academic Staff ?</label>
                                                        <select
                                                            id="IsAcademicStaff"
                                                            className="form-control"
                                                            required
                                                            onChange={props.onEdit} >
                                                            <option value="">Select Option</option>
                                                            <option value={"1"}>YES</option>
                                                            <option value={"0"}>NO</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4 pb-5">
                                                    <div className="form-group">
                                                        <label htmlFor="IsAdmin" className="mb-2">Is Admin ?</label>
                                                        <select
                                                            id="IsAdmin"
                                                            className="form-control"
                                                            required
                                                            onChange={props.onEdit} >
                                                            <option value="">Select Option</option>
                                                            <option value={"1"}>YES</option>
                                                            <option value={"0"}>NO</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-lg-12 mt-5">
                                                    <button type="button" onClick={props.onSubmit} className="btn btn-primary w-100">
                                                        Submit
                                                    </button>
                                                </div>
                                            </div>


                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            }
        </form >

    )
}

export default StaffEnrolmentModal;


import { shortCode } from "../../../resources/constants";
import { serverLink } from "../../../resources/url";
import ImagePic from './images_pic.png'

const PictureCard = (props) =>
{

    const img = props.current_user !== null || props.current_user !== undefined ?
        props.current_user.Image.includes("simplefileupload") ? props.current_user.Image : `${serverLink}public/uploads/${shortCode}/hr/document/${props.current_user.Image}` : ImagePic
    return (
        <>

            <div className="card card-flush h-xl-100">
                <div className="rounded bgi-no-repeat bgi-size-cover bgi-position-y-top bgi-position-x-center align-items-start h-250px" style={{
                    background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
                 url('${img}')  `
                }}>


                    <div className="container container-fluid">
                        <div className="row col-md-12 position-relative" >
                            <div className="col-md-9">
                                <div className="justify-content-start" style={{ zIndex: '1' }}>
                                    <h3 className="align-items-start text-white pt-5">
                                        <div className="fw-bold fs-0x mb-3">Hello, <br />{props.current_user.FirstName} {props.current_user.Surname}</div>
                                    </h3>
                                    <div className="fs-4 text-white">
                                        <span className="opacity-75">Welcome back!  </span>
                                        <p style={{ fontSize: '12px' }}></p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="justify-content-end align-items-end">
                                    <div className="symbol symbol-100px mt-4">
                                        <img src={`${img}`} alt="image" />
                                    </div>
                                </div>

                            </div>
                            <div className="col-md-12 ">
                                <div className="fs-2 text-white">
                                    <p style={{ fontSize: '13px' }}>
                                        {props.current_user.StaffID}<br />
                                        {props.current_user.OfficialEmailAddress}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                {
                    <div className="card-body mt-n20 mt-5">
                        <div className="mt-n20 position-relative">
                            <div className="row g-3 g-lg-6">
                                <div className="col-6">
                                    <div className="bg-gray-100 bg-opacity-70 rounded-2 px-6 py-5">
                                        <div className="symbol symbol-30px me-5 mb-8">
                                            <span className="symbol-label">
                                                <span className="svg-icon svg-icon-1 svg-icon-primary">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none">
                                                        <path opacity="0.3" d="M20.9 12.9C20.3 12.9 19.9 12.5 19.9 11.9C19.9 11.3 20.3 10.9 20.9 10.9H21.8C21.3 6.2 17.6 2.4 12.9 2V2.9C12.9 3.5 12.5 3.9 11.9 3.9C11.3 3.9 10.9 3.5 10.9 2.9V2C6.19999 2.5 2.4 6.2 2 10.9H2.89999C3.49999 10.9 3.89999 11.3 3.89999 11.9C3.89999 12.5 3.49999 12.9 2.89999 12.9H2C2.5 17.6 6.19999 21.4 10.9 21.8V20.9C10.9 20.3 11.3 19.9 11.9 19.9C12.5 19.9 12.9 20.3 12.9 20.9V21.8C17.6 21.3 21.4 17.6 21.8 12.9H20.9Z" fill="currentColor" />
                                                        <path d="M16.9 10.9H13.6C13.4 10.6 13.2 10.4 12.9 10.2V5.90002C12.9 5.30002 12.5 4.90002 11.9 4.90002C11.3 4.90002 10.9 5.30002 10.9 5.90002V10.2C10.6 10.4 10.4 10.6 10.2 10.9H9.89999C9.29999 10.9 8.89999 11.3 8.89999 11.9C8.89999 12.5 9.29999 12.9 9.89999 12.9H10.2C10.4 13.2 10.6 13.4 10.9 13.6V13.9C10.9 14.5 11.3 14.9 11.9 14.9C12.5 14.9 12.9 14.5 12.9 13.9V13.6C13.2 13.4 13.4 13.2 13.6 12.9H16.9C17.5 12.9 17.9 12.5 17.9 11.9C17.9 11.3 17.5 10.9 16.9 10.9Z" fill="currentColor" />
                                                    </svg>
                                                </span>
                                            </span>
                                        </div>
                                        <div className="m-0">
                                            <span className="text-gray-700 fw-boldest d-block fs-2qx lh-1 ls-n1 mb-1">{
                                                props.semester !== "" ? props.semester : "N/A"}</span>
                                            <span className="text-gray-500 fw-bold fs-6">Current Semester</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="bg-gray-100 bg-opacity-70 rounded-2 px-6 py-5">
                                        <div className="symbol symbol-30px me-5 mb-8">
                                            <span className="symbol-label">
                                                <span className="svg-icon svg-icon-1 svg-icon-success">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none">
                                                        <path d="M14 18V16H10V18L9 20H15L14 18Z" fill="currentColor" />
                                                        <path opacity="0.3" d="M20 4H17V3C17 2.4 16.6 2 16 2H8C7.4 2 7 2.4 7 3V4H4C3.4 4 3 4.4 3 5V9C3 11.2 4.8 13 7 13C8.2 14.2 8.8 14.8 10 16H14C15.2 14.8 15.8 14.2 17 13C19.2 13 21 11.2 21 9V5C21 4.4 20.6 4 20 4ZM5 9V6H7V11C5.9 11 5 10.1 5 9ZM19 9C19 10.1 18.1 11 17 11V6H19V9ZM17 21V22H7V21C7 20.4 7.4 20 8 20H16C16.6 20 17 20.4 17 21ZM10 9C9.4 9 9 8.6 9 8V5C9 4.4 9.4 4 10 4C10.6 4 11 4.4 11 5V8C11 8.6 10.6 9 10 9ZM10 13C9.4 13 9 12.6 9 12V11C9 10.4 9.4 10 10 10C10.6 10 11 10.4 11 11V12C11 12.6 10.6 13 10 13Z" fill="currentColor" />
                                                    </svg>
                                                </span>
                                            </span>
                                        </div>
                                        <div className="m-0">
                                            <span className="text-gray-700 fw-boldest d-block fs-2qx lh-1 ls-n1 mb-1">{props.current_user.Hits}</span>
                                            <span className="text-gray-500 fw-bold fs-6">Profile Hits</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-6">
                                    <div className="bg-gray-100 bg-opacity-70 rounded-2 px-6 py-5">
                                        <div className="symbol symbol-30px me-5 mb-8">
                                            <span className="symbol-label">
                                                <span className="svg-icon svg-icon-1 svg-icon-primary">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none">
                                                        <path opacity="0.3" d="M17.9061 13H11.2061C11.2061 12.4 10.8061 12 10.2061 12C9.60605 12 9.20605 12.4 9.20605 13H6.50606L9.20605 8.40002V4C8.60605 4 8.20605 3.6 8.20605 3C8.20605 2.4 8.60605 2 9.20605 2H15.2061C15.8061 2 16.2061 2.4 16.2061 3C16.2061 3.6 15.8061 4 15.2061 4V8.40002L17.9061 13ZM13.2061 9C12.6061 9 12.2061 9.4 12.2061 10C12.2061 10.6 12.6061 11 13.2061 11C13.8061 11 14.2061 10.6 14.2061 10C14.2061 9.4 13.8061 9 13.2061 9Z" fill="currentColor" />
                                                        <path d="M18.9061 22H5.40605C3.60605 22 2.40606 20 3.30606 18.4L6.40605 13H9.10605C9.10605 13.6 9.50605 14 10.106 14C10.706 14 11.106 13.6 11.106 13H17.8061L20.9061 18.4C21.9061 20 20.8061 22 18.9061 22ZM14.2061 15C13.1061 15 12.2061 15.9 12.2061 17C12.2061 18.1 13.1061 19 14.2061 19C15.3061 19 16.2061 18.1 16.2061 17C16.2061 15.9 15.3061 15 14.2061 15Z" fill="currentColor" />
                                                    </svg>
                                                </span>
                                            </span>
                                        </div>
                                        <div className="m-0">
                                            <span className="text-gray-700 fw-boldest d-block fs-2qx lh-1 ls-n1 mb-1">{props.modules.MyModules}</span>
                                            <span className="text-gray-500 fw-bold fs-6">Modules</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="bg-gray-100 bg-opacity-70 rounded-2 px-6 py-5">
                                        <div className="symbol symbol-30px me-5 mb-8">
                                            <span className="symbol-label">
                                                <span className="svg-icon svg-icon-1 svg-icon-success">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none">
                                                        <path d="M20 19.725V18.725C20 18.125 19.6 17.725 19 17.725H5C4.4 17.725 4 18.125 4 18.725V19.725H3C2.4 19.725 2 20.125 2 20.725V21.725H22V20.725C22 20.125 21.6 19.725 21 19.725H20Z" fill="currentColor" />
                                                        <path opacity="0.3" d="M22 6.725V7.725C22 8.325 21.6 8.725 21 8.725H18C18.6 8.725 19 9.125 19 9.725C19 10.325 18.6 10.725 18 10.725V15.725C18.6 15.725 19 16.125 19 16.725V17.725H15V16.725C15 16.125 15.4 15.725 16 15.725V10.725C15.4 10.725 15 10.325 15 9.725C15 9.125 15.4 8.725 16 8.725H13C13.6 8.725 14 9.125 14 9.725C14 10.325 13.6 10.725 13 10.725V15.725C13.6 15.725 14 16.125 14 16.725V17.725H10V16.725C10 16.125 10.4 15.725 11 15.725V10.725C10.4 10.725 10 10.325 10 9.725C10 9.125 10.4 8.725 11 8.725H8C8.6 8.725 9 9.125 9 9.725C9 10.325 8.6 10.725 8 10.725V15.725C8.6 15.725 9 16.125 9 16.725V17.725H5V16.725C5 16.125 5.4 15.725 6 15.725V10.725C5.4 10.725 5 10.325 5 9.725C5 9.125 5.4 8.725 6 8.725H3C2.4 8.725 2 8.325 2 7.725V6.725L11 2.225C11.6 1.925 12.4 1.925 13.1 2.225L22 6.725ZM12 3.725C11.2 3.725 10.5 4.425 10.5 5.225C10.5 6.025 11.2 6.725 12 6.725C12.8 6.725 13.5 6.025 13.5 5.225C13.5 4.425 12.8 3.725 12 3.725Z" fill="currentColor" />
                                                    </svg>
                                                </span>
                                            </span>
                                        </div>
                                        <div className="m-0">
                                            <span className="text-gray-700 fw-boldest d-block fs-2qx lh-1 ls-n1 mb-1">{props.students.Students}</span>
                                            <span className="text-gray-500 fw-bold fs-6">Students</span>
                                        </div>
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>}
            </div>

        </>
    )
}

export default PictureCard;
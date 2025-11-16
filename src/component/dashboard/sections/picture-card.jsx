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
                                    <div className="rounded-3 px-6 py-5 position-relative overflow-hidden"
                                         style={{
                                             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                             boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                                             transition: 'all 0.3s ease',
                                             cursor: 'pointer'
                                         }}
                                         onMouseEnter={(e) => {
                                             e.currentTarget.style.transform = 'translateY(-5px)';
                                             e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)';
                                         }}
                                         onMouseLeave={(e) => {
                                             e.currentTarget.style.transform = 'translateY(0)';
                                             e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)';
                                         }}>
                                        <div className="symbol symbol-40px mb-4">
                                            <span className="symbol-label bg-white bg-opacity-20">
                                                <i className="fa fa-calendar-alt fs-2 text-white"></i>
                                            </span>
                                        </div>
                                        <div className="m-0">
                                            <span className="text-white fw-boldest d-block fs-2qx lh-1 ls-n1 mb-2">{
                                                props.semester !== "" ? props.semester : "N/A"}</span>
                                            <span className="text-white opacity-75 fw-semibold fs-6">Current Semester</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="rounded-3 px-6 py-5 position-relative overflow-hidden"
                                         style={{
                                             background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                             boxShadow: '0 10px 30px rgba(240, 147, 251, 0.3)',
                                             transition: 'all 0.3s ease',
                                             cursor: 'pointer'
                                         }}
                                         onMouseEnter={(e) => {
                                             e.currentTarget.style.transform = 'translateY(-5px)';
                                             e.currentTarget.style.boxShadow = '0 15px 40px rgba(240, 147, 251, 0.4)';
                                         }}
                                         onMouseLeave={(e) => {
                                             e.currentTarget.style.transform = 'translateY(0)';
                                             e.currentTarget.style.boxShadow = '0 10px 30px rgba(240, 147, 251, 0.3)';
                                         }}>
                                        <div className="symbol symbol-40px mb-4">
                                            <span className="symbol-label bg-white bg-opacity-20">
                                                <i className="fa fa-eye fs-2 text-white"></i>
                                            </span>
                                        </div>
                                        <div className="m-0">
                                            <span className="text-white fw-boldest d-block fs-2qx lh-1 ls-n1 mb-2">{props.current_user.Hits}</span>
                                            <span className="text-white opacity-75 fw-semibold fs-6">Profile Hits</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-6">
                                    <div className="rounded-3 px-6 py-5 position-relative overflow-hidden"
                                         style={{
                                             background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                             boxShadow: '0 10px 30px rgba(79, 172, 254, 0.3)',
                                             transition: 'all 0.3s ease',
                                             cursor: 'pointer'
                                         }}
                                         onMouseEnter={(e) => {
                                             e.currentTarget.style.transform = 'translateY(-5px)';
                                             e.currentTarget.style.boxShadow = '0 15px 40px rgba(79, 172, 254, 0.4)';
                                         }}
                                         onMouseLeave={(e) => {
                                             e.currentTarget.style.transform = 'translateY(0)';
                                             e.currentTarget.style.boxShadow = '0 10px 30px rgba(79, 172, 254, 0.3)';
                                         }}>
                                        <div className="symbol symbol-40px mb-4">
                                            <span className="symbol-label bg-white bg-opacity-20">
                                                <i className="fa fa-book fs-2 text-white"></i>
                                            </span>
                                        </div>
                                        <div className="m-0">
                                            <span className="text-white fw-boldest d-block fs-2qx lh-1 ls-n1 mb-2">{props.modules.MyModules}</span>
                                            <span className="text-white opacity-75 fw-semibold fs-6">Modules</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="rounded-3 px-6 py-5 position-relative overflow-hidden"
                                         style={{
                                             background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                             boxShadow: '0 10px 30px rgba(67, 233, 123, 0.3)',
                                             transition: 'all 0.3s ease',
                                             cursor: 'pointer'
                                         }}
                                         onMouseEnter={(e) => {
                                             e.currentTarget.style.transform = 'translateY(-5px)';
                                             e.currentTarget.style.boxShadow = '0 15px 40px rgba(67, 233, 123, 0.4)';
                                         }}
                                         onMouseLeave={(e) => {
                                             e.currentTarget.style.transform = 'translateY(0)';
                                             e.currentTarget.style.boxShadow = '0 10px 30px rgba(67, 233, 123, 0.3)';
                                         }}>
                                        <div className="symbol symbol-40px mb-4">
                                            <span className="symbol-label bg-white bg-opacity-20">
                                                <i className="fa fa-users fs-2 text-white"></i>
                                            </span>
                                        </div>
                                        <div className="m-0">
                                            <span className="text-white fw-boldest d-block fs-2qx lh-1 ls-n1 mb-2">{props.students.Students}</span>
                                            <span className="text-white opacity-75 fw-semibold fs-6">Students</span>
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


const OverviewCard = (props)=>{
    const faculty_code = props.departmentList.length > 0 ? 
        props.departmentList.filter(x => x.DepartmentCode === props.current_user.DepartmentCode)[0]?.FacultyCode
        :""
        

    return (
        <div id="kt_sliders_widget_1_slider" className="card card-flush carousel carousel-custom carousel-stretch slide h-xl-100" data-bs-ride="carousel" data-bs-interval={5000}>
            <div className="card-header pt-5">
                <h4 className="card-title d-flex align-items-start flex-column">
                    <span className="card-label fw-bolder text-gray-800">Overview</span>
                </h4>
            </div>
            <div className="card-body pt-6">
                <div className="me-md-5 w-100">
                    <div className="d-flex border border-gray-300 border-dashed rounded p-6 mb-6">
                        <div className="d-flex align-items-center flex-grow-1 me-2 me-sm-5">
                            <div className="symbol symbol-50px me-4">
                                <span className="symbol-label">
                                    <span className="svg-icon svg-icon-2qx svg-icon-primary">
                                        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none">
                                            <path opacity="0.3" d="M20.9 12.9C20.3 12.9 19.9 12.5 19.9 11.9C19.9 11.3 20.3 10.9 20.9 10.9H21.8C21.3 6.2 17.6 2.4 12.9 2V2.9C12.9 3.5 12.5 3.9 11.9 3.9C11.3 3.9 10.9 3.5 10.9 2.9V2C6.19999 2.5 2.4 6.2 2 10.9H2.89999C3.49999 10.9 3.89999 11.3 3.89999 11.9C3.89999 12.5 3.49999 12.9 2.89999 12.9H2C2.5 17.6 6.19999 21.4 10.9 21.8V20.9C10.9 20.3 11.3 19.9 11.9 19.9C12.5 19.9 12.9 20.3 12.9 20.9V21.8C17.6 21.3 21.4 17.6 21.8 12.9H20.9Z" fill="currentColor" />
                                            <path d="M16.9 10.9H13.6C13.4 10.6 13.2 10.4 12.9 10.2V5.90002C12.9 5.30002 12.5 4.90002 11.9 4.90002C11.3 4.90002 10.9 5.30002 10.9 5.90002V10.2C10.6 10.4 10.4 10.6 10.2 10.9H9.89999C9.29999 10.9 8.89999 11.3 8.89999 11.9C8.89999 12.5 9.29999 12.9 9.89999 12.9H10.2C10.4 13.2 10.6 13.4 10.9 13.6V13.9C10.9 14.5 11.3 14.9 11.9 14.9C12.5 14.9 12.9 14.5 12.9 13.9V13.6C13.2 13.4 13.4 13.2 13.6 12.9H16.9C17.5 12.9 17.9 12.5 17.9 11.9C17.9 11.3 17.5 10.9 16.9 10.9Z" fill="currentColor" />
                                        </svg>
                                    </span>
                                </span>
                            </div>
                            <div className="me-2">
                                <span href="#" className="text-gray-800 text-hover-primary fs-6 fw-bolder">Faculty</span>
                                <span className="text-gray-400 fw-bolder d-block fs-7">
                                    {props.facultyList?.length > 0 ?
                                        props.facultyList?.filter(x => x.FacultyCode === faculty_code)[0]?.FacultyName
                                        :"N/A"
                                    }
                                </span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center">
                            <span className="badge badge-lg badge-success align-self-center px-2 fw-bold fs-1x"> 
                            {faculty_code !== ""? faculty_code : "N/A"}
                            </span>
                        </div>
                    </div>
                    <div className="d-flex border border-gray-300 border-dashed rounded p-6 mb-6">
                        <div className="d-flex align-items-center flex-grow-1 me-2 me-sm-5">
                            <div className="symbol symbol-50px me-4">
                                <span className="symbol-label">
                                    <span className="svg-icon svg-icon-2qx svg-icon-primary">
                                        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none">
                                            <rect x={2} y={2} width={9} height={9} rx={2} fill="currentColor" />
                                            <rect opacity="0.3" x={13} y={2} width={9} height={9} rx={2} fill="currentColor" />
                                            <rect opacity="0.3" x={13} y={13} width={9} height={9} rx={2} fill="currentColor" />
                                            <rect opacity="0.3" x={2} y={13} width={9} height={9} rx={2} fill="currentColor" />
                                        </svg>
                                    </span>
                                </span>
                            </div>
                            <div className="me-2">
                                <span href="#" className="text-gray-800 text-hover-primary fs-6 fw-bolder">Department</span>
                                <span className="text-gray-400 fw-bolder d-block fs-7">
                                    {props.departmentList.length > 0 ?
                                        props.departmentList.filter(x => x.DepartmentCode === props.current_user.DepartmentCode)[0]?.DepartmentName :'N/A'
                                    }
                                </span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center">
                            <span className="badge badge-lg badge-primary align-self-center px-2 fw-bold fs-1x">
                                {props.current_user?.DepartmentCode !== "" ? props.current_user?.DepartmentCode : "N/A"}
                            </span>
                        </div>
                    </div>
                    <div className="d-flex border border-gray-300 border-dashed rounded p-6 mb-6">
                        <div className="d-flex align-items-center flex-grow-1 me-2 me-sm-5">
                            <div className="symbol symbol-50px me-4">
                                <span className="symbol-label">
                                    <span className="svg-icon svg-icon-2qx svg-icon-primary">
                                        <svg style={{ color: 'blue' }} className="svg-icon" viewBox="0 0 20 20">
                                            <path d="M12.075,10.812c1.358-0.853,2.242-2.507,2.242-4.037c0-2.181-1.795-4.618-4.198-4.618S5.921,4.594,5.921,6.775c0,1.53,0.884,3.185,2.242,4.037c-3.222,0.865-5.6,3.807-5.6,7.298c0,0.23,0.189,0.42,0.42,0.42h14.273c0.23,0,0.42-0.189,0.42-0.42C17.676,14.619,15.297,11.677,12.075,10.812 M6.761,6.775c0-2.162,1.773-3.778,3.358-3.778s3.359,1.616,3.359,3.778c0,2.162-1.774,3.778-3.359,3.778S6.761,8.937,6.761,6.775 M3.415,17.69c0.218-3.51,3.142-6.297,6.704-6.297c3.562,0,6.486,2.787,6.705,6.297H3.415z" />
                                        </svg>
                                    </span>
                                </span>
                            </div>

                            <div className="me-2">
                                <span href="#" className="text-gray-800 text-hover-primary fs-6 fw-bolder">Designation</span>
                                <span className="text-gray-400 fw-bolder d-block fs-7">
                                    {props.designations}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OverviewCard;
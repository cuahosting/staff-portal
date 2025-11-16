

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
                    <div className="rounded-3 p-6 mb-4 position-relative overflow-hidden"
                         style={{
                             background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                             border: '2px solid rgba(102, 126, 234, 0.2)',
                             transition: 'all 0.3s ease',
                             cursor: 'pointer'
                         }}
                         onMouseEnter={(e) => {
                             e.currentTarget.style.transform = 'translateX(5px)';
                             e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)';
                             e.currentTarget.style.boxShadow = '0 5px 20px rgba(102, 126, 234, 0.15)';
                         }}
                         onMouseLeave={(e) => {
                             e.currentTarget.style.transform = 'translateX(0)';
                             e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                             e.currentTarget.style.boxShadow = 'none';
                         }}>
                        <div className="d-flex align-items-center flex-grow-1 me-2 me-sm-5">
                            <div className="symbol symbol-50px me-4">
                                <span className="symbol-label" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                                    <i className="fa fa-university fs-3 text-white"></i>
                                </span>
                            </div>
                            <div className="me-2 flex-grow-1">
                                <span className="text-gray-800 fs-6 fw-bold d-block mb-1">Faculty</span>
                                <span className="text-gray-600 fw-semibold d-block fs-7">
                                    {props.facultyList?.length > 0 ?
                                        props.facultyList?.filter(x => x.FacultyCode === faculty_code)[0]?.FacultyName
                                        :"N/A"
                                    }
                                </span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center">
                            <span className="badge px-3 py-2 fw-bold fs-7"
                                  style={{
                                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                      color: 'white'
                                  }}>
                            {faculty_code !== ""? faculty_code : "N/A"}
                            </span>
                        </div>
                    </div>
                    <div className="rounded-3 p-6 mb-4 position-relative overflow-hidden"
                         style={{
                             background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%)',
                             border: '2px solid rgba(79, 172, 254, 0.2)',
                             transition: 'all 0.3s ease',
                             cursor: 'pointer'
                         }}
                         onMouseEnter={(e) => {
                             e.currentTarget.style.transform = 'translateX(5px)';
                             e.currentTarget.style.borderColor = 'rgba(79, 172, 254, 0.4)';
                             e.currentTarget.style.boxShadow = '0 5px 20px rgba(79, 172, 254, 0.15)';
                         }}
                         onMouseLeave={(e) => {
                             e.currentTarget.style.transform = 'translateX(0)';
                             e.currentTarget.style.borderColor = 'rgba(79, 172, 254, 0.2)';
                             e.currentTarget.style.boxShadow = 'none';
                         }}>
                        <div className="d-flex align-items-center flex-grow-1 me-2 me-sm-5">
                            <div className="symbol symbol-50px me-4">
                                <span className="symbol-label" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                                    <i className="fa fa-building fs-3 text-white"></i>
                                </span>
                            </div>
                            <div className="me-2 flex-grow-1">
                                <span className="text-gray-800 fs-6 fw-bold d-block mb-1">Department</span>
                                <span className="text-gray-600 fw-semibold d-block fs-7">
                                    {props.departmentList.length > 0 ?
                                        props.departmentList.filter(x => x.DepartmentCode === props.current_user.DepartmentCode)[0]?.DepartmentName :'N/A'
                                    }
                                </span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center">
                            <span className="badge px-3 py-2 fw-bold fs-7"
                                  style={{
                                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                      color: 'white'
                                  }}>
                                {props.current_user?.DepartmentCode !== "" ? props.current_user?.DepartmentCode : "N/A"}
                            </span>
                        </div>
                    </div>
                    <div className="rounded-3 p-6 mb-4 position-relative overflow-hidden"
                         style={{
                             background: 'linear-gradient(135deg, rgba(245, 87, 108, 0.1) 0%, rgba(240, 147, 251, 0.1) 100%)',
                             border: '2px solid rgba(245, 87, 108, 0.2)',
                             transition: 'all 0.3s ease',
                             cursor: 'pointer'
                         }}
                         onMouseEnter={(e) => {
                             e.currentTarget.style.transform = 'translateX(5px)';
                             e.currentTarget.style.borderColor = 'rgba(245, 87, 108, 0.4)';
                             e.currentTarget.style.boxShadow = '0 5px 20px rgba(245, 87, 108, 0.15)';
                         }}
                         onMouseLeave={(e) => {
                             e.currentTarget.style.transform = 'translateX(0)';
                             e.currentTarget.style.borderColor = 'rgba(245, 87, 108, 0.2)';
                             e.currentTarget.style.boxShadow = 'none';
                         }}>
                        <div className="d-flex align-items-center flex-grow-1 me-2 me-sm-5">
                            <div className="symbol symbol-50px me-4">
                                <span className="symbol-label" style={{background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)'}}>
                                    <i className="fa fa-user-tie fs-3 text-white"></i>
                                </span>
                            </div>
                            <div className="me-2 flex-grow-1">
                                <span className="text-gray-800 fs-6 fw-bold d-block mb-1">Designation</span>
                                <span className="text-gray-600 fw-semibold d-block fs-7">
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
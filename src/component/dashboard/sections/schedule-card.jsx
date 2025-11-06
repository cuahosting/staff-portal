import { useState } from "react"
import { toast } from "react-toastify"
import { TimeTablePeriods } from "../../../resources/constants"


const ScheduleCard = (props) => {
    const [active, setActive] = useState('active')
    let data = []
    for (let index = 0; index < props.monthDays.length; index++) {
        let object = { day: props.monthDays[index].split(' ')[0], date: props.monthDays[index].split(' ')[1] }
        data.push(object)
    }

    return (
        <div id="kt_sliders_widget_2_slider" className="card card-flush carousel carousel-custom carousel-stretch slide h-xl-100" data-bs-ride="carousel" data-bs-interval={5500} >
            <div className="card-header pt-5">
                <h4 className="card-title d-flex align-items-start flex-column">
                    <span className="card-label fw-bolder text-gray-800">My Schedule</span>
                    <span className="text-gray-400 mt-1 fw-bolder fs-7">
                        {props.timetable.length} schedules on timetable</span>
                </h4>
                <div className="card-toolbar">
                    <ol className="p-0 m-0 carousel-indicators carousel-indicators-bullet carousel-indicators-active-success">
                        <li data-bs-target="#kt_sliders_widget_2_slider" data-bs-slide-to={0} className="active ms-1" />
                        <li data-bs-target="#kt_sliders_widget_2_slider" data-bs-slide-to={1} className="ms-1" />
                    </ol>
                </div>
            </div>

            <div className="card-body pt-6" >
                <div className="carousel-inner" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                    <div className="carousel-item active show">
                        <div>
                            <span className="card-label fw-bolder text-gray-800">{props.today}</span>
                        </div>
                        <div className="d-flex align-items-center mb-9">
                            <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
                                <tbody>
                                    {
                                        props.timetable.length > 0 ?
                                            <>
                                                {props.timetable.filter(x => x.DayName === props.today).map((item, index) => {
                                                    return (
                                                        <tr key={index}>
                                                            <td>
                                                                <div className="d-flex align-items-center">
                                                                    <div className="symbol symbol-45px me-5">
                                                                        <span className="symbol-label bg-light-danger text-danger fw-bolder">
                                                                            {item.ModuleCode[0] ?? 'C'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="d-flex justify-content-start flex-column">
                                                                        <span className="text-dark fw-bolder text-hover-primary mb-1 fs-6">{item.ModuleCode}</span>
                                                                        <span className="text-muted text-hover-primary fw-bold text-muted d-block fs-7">
                                                                            {item.ModuleName}</span>
                                                                        <span className="text-muted fw-bold text-muted d-block fs-7">{
                                                                            item.BlockName + " " + item.VenueName
                                                                        }</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="text-end" style={{ minWidth: '60px' }}>
                                                                <span className="text-dark fw-bolder text-hover-primary d-block mb-1 fs-6">
                                                                {
                                                                TimeTablePeriods.filter(x=>x.value.toString() === item.StartTime.toString())[0].label
                                                                }
                                                                    - 
                                                                {
                                                                    TimeTablePeriods.filter(x=>x.value.toString() === item.EndTime.toString())[0].label
                                                                }
                                                                </span>

                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </>
                                            :
                                            <>
                                                <tr>
                                                    <td>
                                                        <h3>No schedules today</h3>
                                                    </td>
                                                </tr>
                                            </>
                                    }

                                </tbody>
                            </table>
                        </div>
                        <div className="mb-1">
                            <button type="button" onClick={() => {
                                if (props.timetable.length > 0) {
                                    document.getElementById("timetable").scrollIntoView()
                                } else {
                                    toast.info('No schedues today')
                                }
                            }} className="btn btn-sm btn-secondary me-2">View Full TimeTable</button>
                        </div>
                    </div>

                    <div className="carousel-item">
                        <div>
                            <span className="card-label fw-bolder text-gray-800">{props.tomorrow}</span>
                        </div>
                        <div className="d-flex align-items-center mb-9">
                            <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
                                <tbody>
                                    {
                                        props.timetable.length > 0 ?
                                            <>
                                                {props.timetable.filter(x => x.DayName === props.tomorrow).map((item, index) => {
                                                    return (
                                                        <tr key={index}>
                                                            <td>
                                                                <div className="d-flex align-items-center">
                                                                    <div className="symbol symbol-45px me-5">
                                                                        <span className="symbol-label bg-light-danger text-danger fw-bolder">
                                                                            {item.ModuleCode[0] ?? 'C'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="d-flex justify-content-start flex-column">
                                                                        <span className="text-dark fw-bolder text-hover-primary mb-1 fs-6">{item.ModuleCode}</span>
                                                                        <span className="text-muted text-hover-primary fw-bold text-muted d-block fs-7">
                                                                            {item.ModuleName}</span>
                                                                        <span className="text-muted fw-bold text-muted d-block fs-7">{
                                                                            item.BlockName + " " + item.VenueName
                                                                        }</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="text-end">
                                                                <span className="text-dark fw-bolder text-hover-primary d-block mb-1 fs-6">
                                                                {
                                                                TimeTablePeriods.filter(x=>x.value.toString() === item.StartTime.toString())[0].label
                                                                }
                                                                    - 
                                                                {
                                                                    TimeTablePeriods.filter(x=>x.value.toString() === item.EndTime.toString())[0].label
                                                                    }
                                                                </span>

                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </>
                                            :
                                            <>
                                                <tr>
                                                    <td>
                                                        <h3>No schedules today</h3>
                                                    </td>
                                                </tr>
                                            </>
                                    }

                                </tbody>
                            </table>
                        </div>
                        <div className="mb-1">
                            <span onClick={() => {
                                if (props.timetable.length > 0) {
                                    document.getElementById("timetable").scrollIntoView()
                                } else {
                                    toast.info('No schedues today')
                                }
                            }} className="btn btn-sm btn-secondary me-2">View Full TimeTable</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ScheduleCard;
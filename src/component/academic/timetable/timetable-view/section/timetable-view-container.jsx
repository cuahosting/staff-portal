import React from "react";
import TimeTableGridItem from "../../timetable/timetable-view/timetable-grid-item";

function TimetableViewContainer(props) {
    const data = props.data;
    return (
        <div className="card card-no-border mb-5 mt-5">
            <div className="table-responsive">
                <div className="p-3">
                    <h2>{props.sub_title}</h2>
                </div>
                <table className="table table-striped table-bordered">
                    {/*<thead className="fw-bold fs-6 text-gray-800 border-bottom border-gray-200">*/}
                    {/*<tr className="fw-bolder">*/}
                    {/*    <td className="ps-2">DAYS/PERIODS</td>*/}
                    {/*    <td>8:00 AM</td>*/}
                    {/*    <td>9:00 AM</td>*/}
                    {/*    <td>10:00 AM</td>*/}
                    {/*    <td>11:00 AM</td>*/}
                    {/*    <td>12:00 PM</td>*/}
                    {/*    <td>1:00 PM</td>*/}
                    {/*    <td>2:00 PM</td>*/}
                    {/*    <td>3:00 PM</td>*/}
                    {/*    <td>4:00 PM</td>*/}
                    {/*    <td>5:00 PM</td>*/}
                    {/*    <td>6:00 PM</td>*/}
                    {/*    <td>7:00 PM</td>*/}
                    {/*    <td>8:00 PM</td>*/}
                    {/*</tr>*/}
                    {/*</thead>*/}
                    <tbody className="fs-6 fw-bold text-gray-600">
                    <tr>
                        <td className="text-bold ps-2">Monday</td>

                        {
                            data.map((x, y) => {
                                let staff_data = "";
                                x.StaffList.forEach((staff, index) => {
                                    staff_data += `<div className="text-default me-2">${staff.StaffName}</div>`
                                })
                                if (x.DayName === 'Monday') {
                                    return (
                                            <td key={y} colSpan={x.NumOfHours}>
                                                <TimeTableGridItem
                                                    key_id={(y+1)}
                                                    course={x.ModuleCode}
                                                    staff_list={staff_data}
                                                    type={x.ModuleType}
                                                    venue={x.VenueID}
                                                    time={`${x.StartTime}:00 - ${x.EndTime}:00`}
                                                    color={x.Color} />
                                            </td>

                                    )
                                }
                            })
                        }
                    </tr>

                    <tr>
                        <td className="text-bold ps-2">Tuesday</td>
                        {
                            data.map((x, y) => {
                                let staff_data = "";
                                x.StaffList.forEach((staff, index) => {
                                    staff_data += `<div key="${index}" className="text-default me-2">${staff.StaffName}</div>`
                                })
                                if (x.DayName === 'Tuesday') {
                                    return (
                                        <td key={y} colSpan={x.NumOfHours}>
                                            <TimeTableGridItem
                                                key_id={(y+1)}
                                                course={x.ModuleCode}
                                                staff_list={staff_data}
                                                type={x.ModuleType}
                                                venue={x.VenueID}
                                                time={`${x.StartTime}:00 - ${x.EndTime}:00`}
                                                color={x.Color} />
                                        </td>
                                    )
                                }
                            })
                        }
                    </tr>

                    <tr>
                        <td className="text-bold ps-2">Wednesday</td>
                        {
                            data.map((x, y) => {
                                let staff_data = "";
                                x.StaffList.forEach((staff, index) => {
                                    staff_data += `<div key="${index}" className="text-default me-2">${staff.StaffName}</div>`
                                })
                                if (x.DayName === 'Wednesday') {
                                    return (
                                        <td key={y} colSpan={x.NumOfHours}>
                                            <TimeTableGridItem
                                                key_id={(y+1)}
                                                course={x.ModuleCode}
                                                staff_list={staff_data}
                                                type={x.ModuleType}
                                                venue={x.VenueID}
                                                time={`${x.StartTime}:00 - ${x.EndTime}:00`}
                                                color={x.Color} />
                                        </td>
                                    )
                                }
                            })
                        }
                    </tr>

                    <tr>
                        <td className="text-bold ps-2">Thursday</td>
                        {
                            data.map((x, y) => {
                                let staff_data = "";
                                x.StaffList.forEach((staff, index) => {
                                    staff_data += `<div key="${index}" className="text-default me-2">${staff.StaffName}</div>`
                                })
                                if (x.DayName === 'Thursday') {
                                    return (
                                        <td key={y} colSpan={x.NumOfHours}>
                                            <TimeTableGridItem
                                                key_id={(y+1)}
                                                course={x.ModuleCode}
                                                staff_list={staff_data}
                                                type={x.ModuleType}
                                                venue={x.VenueID}
                                                time={`${x.StartTime}:00 - ${x.EndTime}:00`}
                                                color={x.Color} />
                                        </td>
                                    )
                                }
                            })
                        }
                    </tr>

                    <tr>
                        <td className="text-bold ps-2">Friday</td>
                        {
                            data.map((x, y) => {
                                let staff_data = "";
                                x.StaffList.forEach((staff, index) => {
                                    staff_data += `<div key="${index}" className="text-default me-2">${staff.StaffName}</div>`
                                })
                                if (x.DayName === 'Friday') {
                                    return (
                                        <td key={y} colSpan={x.NumOfHours}>
                                            <TimeTableGridItem
                                                key_id={(y+1)}
                                                course={x.ModuleCode}
                                                staff_list={staff_data}
                                                type={x.ModuleType}
                                                venue={x.VenueID}
                                                time={`${x.StartTime}:00 - ${x.EndTime}:00`}
                                                color={x.Color} />
                                        </td>
                                    )
                                }
                            })
                        }
                    </tr>

                    <tr>
                        <td className="text-bold ps-2">Saturday</td>
                        {
                            data.map((x, y) => {
                                let staff_data = "";
                                x.StaffList.forEach((staff, index) => {
                                    staff_data += `<div key="${index}" className="text-default me-2">${staff.StaffName}</div>`
                                })
                                if (x.DayName === 'Saturday') {
                                    return (
                                        <td key={y} colSpan={x.NumOfHours}>
                                            <TimeTableGridItem
                                                course={x.ModuleCode}
                                                staff_list={staff_data}
                                                type={x.ModuleType}
                                                venue={x.VenueID}
                                                time={`${x.StartTime}:00 - ${x.EndTime}:00`}
                                                color={x.Color} />
                                        </td>
                                    )
                                }
                            })
                        }
                    </tr>

                    </tbody>

                </table>

                <hr />
            </div>

            {
                props.show_key === true &&
                <div className="d-flex flex-column flex-row-fluid">
                    <div className="flex-column-fluid">
                        <div className="">
                            <div className="card-body">
                                <h4>Additional Information</h4>
                                <span><strong>NOTE:</strong> Each color represents a schedule in the main timetable.</span>
                                <div className="row p-2 additional-info"  >
                                    {
                                        data.map((x,y) => {
                                            return (
                                                <div key={y} className="col-md-3 additional-info p-1 pb-5">
                                                    <div className="col-md-12">
                                                        <div className="col-md-3">
                                                            <div style={{ width: '100%', backgroundColor: `${x.Color}`, height: '20px' }}/>
                                                        </div>
                                                        <div>
                                                            <h5>{x.ModuleCode}</h5>
                                                            <p>{x.ModuleName}</p>

                                                            {
                                                                props.type !== 'group' && props.type !== 'student' &&
                                                                <>
                                                                    <h5>Groups</h5>
                                                                    {
                                                                        typeof x.GroupList !== 'undefined' &&
                                                                        x.GroupList.map((g,x) => {
                                                                            return <p key={x}>{g.groupName}</p>
                                                                        })
                                                                    }
                                                                </>
                                                            }

                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default TimetableViewContainer;

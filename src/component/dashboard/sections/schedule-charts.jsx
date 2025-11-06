import React, { useRef, useLayoutEffect } from 'react';

import { Chart } from "react-google-charts";

function ScheduleCharts(props) {
    const days = [
        { id: 0, dayName: 'Sunday' },
        { id: 1, dayName: 'Monday' },
        { id: 2, dayName: 'Tuesday' },
        { id: 3, dayName: 'Wednesday' },
        { id: 4, dayName: 'Thursday' },
        { id: 5, dayName: 'Friday' },
        { id: 6, dayName: 'Saturday' },
        { id: 7, dayName: 'Sunday' },
    ]
    const val = props.timetable.length > 0 ? props.timetable : []
    const data = [
        ["Days", "Count"],
        ["Monday", parseInt(val.filter(x => x.DayName === "Monday").length)],
        ["Tuesday", parseInt(val.filter(x => x.DayName === "Tuesday").length)],
        ["Wednesday", parseInt(val.filter(x => x.DayName === "Wednesday").length)],
        ["Thursday", parseInt(val.filter(x => x.DayName === "Thursday").length)],
        ["Friday", parseInt(val.filter(x => x.DayName === "Friday").length)],
        ["Saturday", parseInt(val.filter(x => x.DayName === "Saturday").length)],
    ];

    const options = {
        title: "My Schedules",
        pieHole: 0.4,
        is3D: true,
    };

    let counts = [];
    props.activitiesCount.map((x, y) => {
        counts.push({ counts: x.Count, dates: x.Date, days: x.Days })
    })

    let data_ = [];
    for (let i = 0; i < counts.length; i++) {
        let dates_ = counts[i].dates.split("T")[0]
        data_.push([counts[i].counts, counts[i].days + " \n" + dates_]);
    }
    let d = []
    data_.forEach(element => {
        d.push([element[1], element[0]])
    })

    let chart_data = [];
    chart_data.push(...d);

    const data_line = [
        ["Days", ""],
        ...chart_data
    ];



    const options_line = {
        title: "my activities in the last 7 days",
        curveType: "function",
        legend: { position: "bottom" },
    };

    return (
        <>
            <div className='row'>
                <div className="row col-md-12">
                    {props.timetable.length > 0 &&
                        <div className="col-md-6">
                            <h4>My schedules</h4>
                            <div className="d-flex border border-gray-300 border-dashed rounded">
                                <Chart
                                    graphID='TimetableSchedule'
                                    chartType="PieChart"
                                    width="100%"
                                    height="300px"
                                    data={data}
                                    options={options}
                                />
                            </div>
                        </div>
                    }
                    {props.activities.length > 0 &&
                    <div className={props.timetable.length > 0 ? "col-md-6" : "col-md-12" }>
                        <h4>My portal Usage</h4>
                        <div className="d-flex border border-gray-300 border-dashed rounded">
                                <Chart
                                    graphID='Activities'
                                    chartType="Bar"
                                    width="100%"
                                    height="400px"
                                    data={data_line}
                                    options={options_line}
                                />
                        </div>
                    </div>
}
                </div>

            </div>
        </>

    );
}
export default ScheduleCharts;
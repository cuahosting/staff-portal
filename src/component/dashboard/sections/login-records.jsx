import { useState, useEffect } from "react";
import { formatDateAndTime } from "../../../resources/constants";
import AGTable from "../../common/table/AGTable";


const LoginHistory = (props) => {
  const color = ['success', 'danger', 'info', 'secondary', 'primary', 'warning']
  const logins_ = props.activities.filter(x => x.Action.includes('logged'));
  const activities_ = props.activities.filter(x => !x.Action.includes('logged'));

  const [loginDatatable, setLoginDatatable] = useState({
    columns: [
      { label: "S/N", field: "sn" },
      { label: "Status", field: "status" },
      { label: "Action", field: "action" },
      { label: "Date & Time", field: "datetime" }
    ],
    rows: [],
  });

  useEffect(() => {
    if (logins_.length > 0) {
      let rows = [];
      logins_.forEach((item, index) => {
        var color_ = color[Math.floor(Math.random() * color.length)];
        let data = new Date(item.InsertedDate)
        let date = formatDateAndTime(item.InsertedDate, "date")
        let hrs = data.getHours();
        let mins = data.getMinutes();
        if (hrs <= 9)
          hrs = '0' + hrs
        if (mins < 10)
          mins = '0' + mins
        const postTime = hrs + ':' + mins

        rows.push({
          sn: index + 1,
          status: <span data-kt-element="bullet" className={`bullet bullet-vertical d-flex align-items-center h-40px bg-${color_}`} />,
          action: item.Action,
          datetime: `${date} : ${postTime}`
        });
      });
      setLoginDatatable({
        ...loginDatatable,
        rows: rows,
      });
    }
  }, [props.activities]);

  return (
    <>
      <div className="card h-xl-100" id="kt_timeline_widget_2_card">
        <div className="card-header position-relative py-0 border-bottom-2">
          <ul className="nav nav-stretch nav-pills nav-pills-custom d-flex mt-3">
            <li className="nav-item p-0 ms-0 me-8">
              <a className="nav-link btn btn-color-muted px-0 active" data-bs-toggle="pill" href="#kt_timeline_widget_2_tab_1">
                <span className="nav-text fw-bold fs-4 mb-3">Login History</span>

                <span className="bullet-custom position-absolute z-index-2 w-100 h-2px top-100 bottom-n100 bg-primary rounded" />
              </a>
            </li>
            <li className="nav-item p-0 ms-0 me-8">
              <a className="nav-link btn btn-color-muted px-0" data-bs-toggle="pill" href="#kt_timeline_widget_2_tab_2">
                <span className="nav-text fw-bold fs-4 mb-3">Recent Activities</span>
                <span className="bullet-custom position-absolute z-index-2 w-100 h-2px top-100 bottom-n100 bg-primary rounded" />
              </a>
            </li>
          </ul>
        </div>

        <div className="card-body" style={{ maxHeight: '350px', overflowY: 'auto' }}>
          <div className="tab-content">
            <div className="tab-pane fade active show" id="kt_timeline_widget_2_tab_1">
              {logins_.length > 0 ? (
                <AGTable data={loginDatatable} paging={false} />
              ) : (
                <div className="text-center p-5">No login records</div>
              )}
            </div>
            <div className="tab-pane fade" id="kt_timeline_widget_2_tab_2">
              <div className="timeline-label">
                {
                  activities_.length > 0 ?
                    <>
                      {
                        activities_.map((x, y) => {
                          var color_ = color[Math.floor(Math.random() * color.length)];
                          let data = new Date(x.InsertedDate)
                          let date = formatDateAndTime(x.InsertedDate, "date")
                          let hrs = data.getHours();
                          let mins = data.getMinutes();
                          if (hrs <= 9)
                            hrs = '0' + hrs
                          if (mins < 10)
                            mins = '0' + mins
                          const postTime = hrs + ':' + mins
                          return (
                            <div className="timeline-item" key={y}>
                              <div className="timeline-label fw-bolder text-gray-800 fs-6">{postTime}</div>
                              <div className="timeline-badge">
                                <i className={`fa fa-genderless text-${color_} fs-1`} />
                              </div>
                              <div className="fw-mormal timeline-content text-muted ps-3">
                                <span className="fw-bolder text-gray-800 fs-8">{date}</span><br />
                                {x.Action}</div>
                            </div>
                          )
                        })
                      }
                    </> :
                    <>
                      <label className="badge badge-warning badge-lg">
                        No Recent activities
                      </label>
                    </>
                }
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default LoginHistory;
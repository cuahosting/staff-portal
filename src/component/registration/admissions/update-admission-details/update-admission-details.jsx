import React from 'react'
import Jamb from './jamb'

export default function UpdateAdmissionDetails(props)
{
    return (
        <div>
            <div className="card h-xl-100" id="kt_timeline_widget_2_card">
                <div className="card-header position-relative py-0 border-bottom-2">
                    <ul className="nav nav-stretch nav-pills nav-pills-custom d-flex mt-3">
                        <li className="nav-item p-0 ms-0 me-8">
                            <a className="nav-link btn btn-color-muted px-0 active" data-bs-toggle="pill" href="#tab_1">
                                <span className="nav-text fw-bold fs-4 mb-3">Jamb Result</span>

                                <span className="bullet-custom position-absolute z-index-2 w-100 h-2px top-100 bottom-n100 bg-primary rounded" />
                            </a>
                        </li>
                        {/* <li className="nav-item p-0 ms-0 me-8">
                            <a className="nav-link btn btn-color-muted px-0" data-bs-toggle="pill" href="#tab_2">
                                <span className="nav-text fw-bold fs-4 mb-3">Other...</span>
                                <span className="bullet-custom position-absolute z-index-2 w-100 h-2px top-100 bottom-n100 bg-primary rounded" />
                            </a>
                        </li> */}
                    </ul>
                </div>

                <div className="card-body" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    <div className="tab-content">
                        <div className="tab-pane fade active show" id="tab_1">
                            <Jamb jambData={props.jambData} AppId={props.AppId} {...props} />
                        </div>
                        <div className="tab-pane fade" id="tab_2">
                            bbb
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

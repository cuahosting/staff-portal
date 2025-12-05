import React, { useEffect, useState } from "react";
import PageHeader from "../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { connect } from "react-redux/es/exports";
import BlocksSettings from "./block/block";
import CampusSettings from "./campus/campus";
import VenueSettings from "./venue/venues";


function TimeTableSettings(props) {
    const token  = props.LoginDetails[0].token
    const [isLoading, setIsLoading] = useState(true);

    const [campusList, setCampus] = useState([])
    const [BlockList, setBlockList] = useState([])

    const getData = async () => {
        await axios
            .get(`${serverLink}staff/academics/block/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    setBlockList(result.data)
                }
            })

        await axios
            .get(`${serverLink}staff/academics/campus/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    setCampus(result.data)
                }
            })
        setIsLoading(false)

    };



    useEffect(() => {
        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Timetable Settings"}
                items={["Academics", "timetable", "Timetable Settings"]}
            />

            <div id="kt_content_container" className="container-custom container-xxl d-flex flex-column-fluid">

                <div className="pt-0 pb-0">
                    <ul className="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bolder">
                        <li className="nav-item mt-2">
                            <a className="nav-link text-active-primary ms-0 me-10 py-5 active" data-bs-toggle="tab" href="#kt_tabs_tab_1">Campus</a>
                        </li>
                        <li className="nav-item mt-2">
                            <a className="nav-link text-active-primary ms-0 me-10 py-5" data-bs-toggle="tab" href="#kt_tabs_tab_2">Block</a>
                        </li>
                        <li className="nav-item mt-2">
                            <a className="nav-link text-active-primary ms-0 me-10 py-5" data-bs-toggle="tab" href="#kt_tabs_tab_3">Venue</a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex-column-fluid">
                <div
                    className="tab-content"
                    data-kt-scroll="true"
                    data-kt-scroll-activate="{default: true, lg: false}"
                    data-kt-scroll-height="auto"
                    data-kt-scroll-offset="70px"
                >
                    <div
                        className="tab-pane fade active show"
                        id="kt_tabs_tab_1"
                    >
                        <CampusSettings getData={getData} />
                    </div>
                    <div
                        className="tab-pane fade"
                        id="kt_tabs_tab_2">
                        <BlocksSettings campusList={campusList} getData={getData} />
                    </div>
                    <div
                        className="tab-pane fade"
                        id="kt_tabs_tab_3">
                        <VenueSettings 
                            campusList={campusList} 
                            BlockList={BlockList} getData={getData} 
                            LoginDetails={props.LoginDetails} />
                    </div>

                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
        FacultyList: state.FacultyList
    };
};
export default connect(mapStateToProps, null)(TimeTableSettings);

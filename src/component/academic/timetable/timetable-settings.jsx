import React, { useEffect, useState } from "react";
import PageHeader from "../../common/pageheader/pageheader";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { connect } from "react-redux/es/exports";
import BlocksSettings from "./block/block";
import CampusSettings from "./campus/campus";
import VenueSettings from "./venue/venues";

function TimeTableSettings(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [campusList, setCampus] = useState([]);
    const [BlockList, setBlockList] = useState([]);

    const getData = async () => {
        const [blockResult, campusResult] = await Promise.all([
            api.get("staff/academics/block/list"),
            api.get("staff/academics/campus/list")
        ]);
        if (blockResult.success && blockResult.data?.length > 0) { setBlockList(blockResult.data); }
        if (campusResult.success && campusResult.data?.length > 0) { setCampus(campusResult.data); }
        setIsLoading(false);
    };

    useEffect(() => { getData(); }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Timetable Settings"} items={["Academics", "timetable", "Timetable Settings"]} />
            <div id="kt_content_container" className="container-custom container-xxl d-flex flex-column-fluid"><div className="pt-0 pb-0"><ul className="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bolder"><li className="nav-item mt-2"><a className="nav-link text-active-primary ms-0 me-10 py-5 active" data-bs-toggle="tab" href="#kt_tabs_tab_1">Campus</a></li><li className="nav-item mt-2"><a className="nav-link text-active-primary ms-0 me-10 py-5" data-bs-toggle="tab" href="#kt_tabs_tab_2">Block</a></li><li className="nav-item mt-2"><a className="nav-link text-active-primary ms-0 me-10 py-5" data-bs-toggle="tab" href="#kt_tabs_tab_3">Venue</a></li></ul></div></div>
            <div className="flex-column-fluid"><div className="tab-content" data-kt-scroll="true" data-kt-scroll-activate="{default: true, lg: false}" data-kt-scroll-height="auto" data-kt-scroll-offset="70px"><div className="tab-pane fade active show" id="kt_tabs_tab_1"><CampusSettings getData={getData} /></div><div className="tab-pane fade" id="kt_tabs_tab_2"><BlocksSettings campusList={campusList} getData={getData} /></div><div className="tab-pane fade" id="kt_tabs_tab_3"><VenueSettings campusList={campusList} BlockList={BlockList} getData={getData} LoginDetails={props.LoginDetails} /></div></div></div>
        </div>
    );
}

const mapStateToProps = (state) => { return { LoginDetails: state.LoginDetails, FacultyList: state.FacultyList }; };
export default connect(mapStateToProps, null)(TimeTableSettings);

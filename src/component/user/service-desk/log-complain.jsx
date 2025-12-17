import React, { useState, useMemo } from "react";
import { connect } from "react-redux";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { useEffect } from "react";
import JoditEditor from "jodit-react";
import SearchSelect from "../../common/select/SearchSelect";

const LogComplain = (props) => {
    const editorRef = React.createRef();
    const [isLoading, setisLoading] = useState(true);
    const [complainTypes, setComplainTypes] = useState([]);
    const [isFormLoading, setIsFormLoading] = useState('off');
    const [complain, setComplain] = useState({
        ComplainTitle: "",
        ComplainType: "",
        FilePath: "",
        UserType: "staff",
        Description: "",
        InsertedBy: props.LoginDetails[0].StaffID,
        currentSemester: props.currentSemester,
    });

    // Options for SearchSelect
    const complainTypeOptions = useMemo(() => {
        return complainTypes.map(x => ({
            value: x.EntryID,
            label: x.ComplainType
        }));
    }, [complainTypes]);

    const getData = async () => {
        const { success, data } = await api.get("staff/service-desk/complain-types/list");

        if (success && data?.length > 0) {
            setComplainTypes(data);
        }
        setisLoading(false);
    };

    const resetForm = () => {
        setComplain({
            ...complain,
            ComplainTitle: "",
            ComplainType: "",
            FilePath: "",
            UserType: "",
            Description: "",
        });
    };

    const onSubmit = async () => {
        setIsFormLoading('on');

        const { success, data } = await api.post("staff/service-desk/post-complain", complain);

        if (success && data?.message === "success") {
            setIsFormLoading('off');

            // Upload file if provided
            if (complain.FilePath !== "") {
                const formData = new FormData();
                formData.append("File", complain.FilePath);
                formData.append("EntryID", data.EntryID);

                await api.patch("staff/service-desk/post-complain-file", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            }

            toast.success("Complain logged successfully, kindly check back to track progress");
            resetForm();
        } else if (success) {
            setIsFormLoading('off');
            showAlert("ERROR", "Complaint has already been submitted", 'error');
        } else {
            setIsFormLoading('off');
            showAlert("ERROR", "Network error, please try again", 'error');
        }
    };

    const onEdit = (e) => {
        if (e.target.id === "FilePath") {
            setComplain({
                ...complain,
                [e.target.id]: e.target.files[0]
            });
            return;
        }

        setComplain({
            ...complain,
            [e.target.id]: e.target.value
        });
    };

    const onDescriptionChange = (e) => {
        setComplain({
            ...complain,
            "Description": e
        });
    };

    useEffect(() => {
        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Service Desk"}
                items={["Users", "Service Desk", "Log Complain"]}
            />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body pt-5">
                        <div className="row col-md-12">
                            <div className="col-md-6 mb-5">
                                <div className="form-group">
                                    <label htmlFor="ComplainTitle">Complain Title</label>
                                    <input
                                        type="text"
                                        id="ComplainTitle"
                                        onChange={onEdit}
                                        value={complain.ComplainTitle}
                                        className="form-control"
                                        placeholder=""
                                    />
                                </div>
                            </div>
                            <div className="col-md-6 mb-5">
                                <div className="form-group">
                                    <label htmlFor="ComplainType">Complain Type</label>
                                    <SearchSelect
                                        id="ComplainType"
                                        value={complainTypeOptions.find(opt => opt.value === complain.ComplainType) || null}
                                        options={complainTypeOptions}
                                        onChange={(selected) => onEdit({ target: { id: 'ComplainType', value: selected?.value || '' } })}
                                        placeholder="-select type-"
                                        isClearable={false}
                                    />
                                </div>
                            </div>
                            <div className="col-md-12 mb-5">
                                <div className="form-group">
                                    <label htmlFor="FilePath">Attachment (optional)</label>
                                    <input
                                        type="file"
                                        id="FilePath"
                                        onChange={onEdit}
                                        className="form-control"
                                        placeholder=""
                                    />
                                </div>
                            </div>
                            <div className="col-md-12 mb-5">
                                <div className="form-group">
                                    <label htmlFor="Description">Comments</label>
                                    <JoditEditor
                                        value={complain.Description}
                                        ref={editorRef}
                                        tabIndex={1}
                                        onChange={onDescriptionChange}
                                    />
                                </div>
                            </div>
                            <div className="col-md-12 mb-5">
                                <button
                                    type="button"
                                    onClick={onSubmit}
                                    className="btn btn-primary w-100"
                                    id="kt_modal_new_address_submit"
                                    data-kt-indicator={isFormLoading}
                                >
                                    <span className="indicator-label">Submit</span>
                                    <span className="indicator-progress">Please wait...
                                        <span className="spinner-border spinner-border-sm align-middle ms-2" />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
        currentSemester: state.currentSemester
    };
};

export default connect(mapStateToProps, null)(LogComplain);
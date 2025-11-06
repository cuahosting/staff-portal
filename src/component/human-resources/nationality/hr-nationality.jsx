import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import Table from "../../common/table/table";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";

function HRNationality(props) {
    const token = props.LoginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [nationalityDatatable, setNationalityDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Nationality Title",
                field: "title",
            },
            {
                label: "Country",
                field: "country",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });
    const [createNationality, setCreateNationality] = useState({
        nationality_title: "",
        country: "",
        entry_id: "",
    });
    const [nationalityList, setNationalityList] = useState([]);

    const [stateDatatable, setStateDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "State Name",
                field: "state",
            },
            {
                label: "Country",
                field: "country",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });
    const [createState, setCreateState] = useState({
        state_name: "",
        nationality_id: "",
        entry_id: "",
    });
    const [stateList, setStateList] = useState([]);
    const [stateSelect, setStateSelect] = useState([]);
    const [stateForm, setStateForm] = useState(false);
    const toggleAddState = () => {
        setCreateState({
            state_name: "",
            nationality_id: "",
            entry_id: "",
        })
        setStateForm(true);
    }
    const toggleUpdateState = (type) => {
        setCreateState({
            ...createState,
            state_name: type.StateName,
            nationality_id: type.NationalityID,
            entry_id: type.EntryID,
        })
        setStateForm(true);
    }

    const [lgaDatatable, setLGADatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "LGA Name",
                field: "lga",
            },
            {
                label: "State Name",
                field: "state",
            },
            {
                label: "Country",
                field: "country",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });
    const [createLGA, setCreateLGA] = useState({
        lga_name: "",
        state_id: "",
        country: "",
        entry_id: "",
    });
    const [lgaList, setLgaList] = useState([]);
    const [lgaForm, setLgaForm] = useState(false);
    const toggleAddLga = () => {
        setCreateState({
            state_name: "",
            nationality_id: "",
            entry_id: "",
        })
        setLgaForm(true);
    }
    const toggleUpdateLga = async (type) => {
        await axios.get(`${serverLink}staff/hr/state/list`, token)
            .then((result) => {
                const data = result.data;
                const country_id = data.filter(item => item.EntryID === type.StateID)[0]['NationalityID'];
                setStateSelect(data.filter(item => item.NationalityID === country_id));
                setCreateLGA({
                    lga_name: type.LgaName,
                    state_id: type.StateID,
                    country: country_id,
                    entry_id: type.EntryID,
                })
                setLgaForm(true);
            })
            .catch((err) => {
                console.log("NETWORK ERROR STATE");
            });
    }
    const closeHandler = () => {
        setCreateState({
            state_name: '',
            nationality_id: '',
            entry_id: '',
        })

        setCreateLGA({
            lga_name: "",
            state_id: "",
            country: "",
            entry_id: "",
        })
        setStateForm(false);
        setLgaForm(false);
    }

    const getRecords = async () => {
        await axios.get(`${serverLink}staff/hr/nationality/list`, token)
            .then((result) => {
                const data = result.data;
                setNationalityList(data)
                if (data.length > 0) {
                    let rows = [];
                    data.map((item, index) => {
                        rows.push({
                            sn: index + 1,
                            title: item.NationalityTitle,
                            country: item.Country,
                            action: (
                                <button
                                    className="btn btn-sm btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                    onClick={() =>
                                        setCreateNationality({
                                            nationality_title: item.NationalityTitle,
                                            country: item.Country,
                                            entry_id: item.EntryID,
                                        })
                                    }
                                >
                                    <i className="fa fa-pen" />
                                </button>
                            ),
                        });
                    });
                    setNationalityDatatable({
                        ...nationalityDatatable,
                        columns: nationalityDatatable.columns,
                        rows: rows,
                    });
                }
            })
            .catch((err) => {
                console.log("NETWORK NATIONALITY ERROR");
            });

        await axios.get(`${serverLink}staff/hr/state/list`, token)
            .then((result) => {
                const data = result.data;
                setStateList(data)
                if (data.length > 0) {
                    let rows = [];
                    data.map((item, index) => {
                        rows.push({
                            sn: index + 1,
                            state: item.StateName,
                            country: item.NationalityID,
                            action: (
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => toggleUpdateState(item)}
                                >
                                    <i className="fa fa-pen" />
                                </button>
                            ),
                        });
                    });
                    setStateDatatable({
                        ...stateDatatable,
                        columns: stateDatatable.columns,
                        rows: rows,
                    });
                }
            })
            .catch((err) => {
                console.log("NETWORK ERROR STATE");
            });

        await axios.get(`${serverLink}staff/hr/lga/list`, token)
            .then((result) => {
                const data = result.data;
                setLgaList(data)
                if (data.length > 0) {
                    let rows = [];
                    data.map((item, index) => {
                        rows.push({
                            sn: index + 1,
                            lga: item.LgaName,
                            state: item.StateID,
                            country: "",
                            action: (
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => toggleUpdateLga(item)}
                                >
                                    <i className="fa fa-pen" />
                                </button>
                            ),
                        });
                    });
                    setLGADatatable({
                        ...lgaDatatable,
                        columns: lgaDatatable.columns,
                        rows: rows,
                    });
                }

                setIsLoading(false);
            })
            .catch((err) => {
                console.log("NETWORK ERROR LGA");
            });
    };

    const onNationalityEdit = (e) => {
        setCreateNationality({
            ...createNationality,
            [e.target.id]: e.target.value,
        });
    };

    const onSubmitNationality = async () => {
        if (createNationality.nationality_title.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the nationality title", "error");
            return false;
        }

        if (createNationality.country.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the country name", "error");
            return false;
        }

        if (createNationality.entry_id === "") {
            await axios
                .post(`${serverLink}staff/hr/nationality/add`, createNationality, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Nationality Added Successfully");
                        getRecords();
                        setCreateNationality({
                            ...createNationality,
                            nationality_title: "",
                            country: "",
                            entry_id: "",
                        });
                    } else if (result.data.message === "exist") {
                        showAlert("NATIONALITY EXIST", "Nationality already exist!", "error");
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
        else {
            await axios
                .patch(`${serverLink}staff/hr/nationality/update`, createNationality, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Nationality Updated Successfully");
                        getRecords();
                        setCreateNationality({
                            ...createNationality,
                            nationality_title: "",
                            country: "",
                            entry_id: "",
                        });
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
    };

    const onStateEdit = (e) => {
        setCreateState({
            ...createState,
            [e.target.id]: e.target.value,
        });
    };

    const onSubmitState = async () => {
        if (createState.nationality_id === "") {
            showAlert("EMPTY FIELD", "Please select the country name", "error");
            return false;
        }
        if (createState.state_name.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the state name", "error");
            return false;
        }

        if (createState.entry_id === "") {
            await axios
                .post(`${serverLink}staff/hr/state/add`, createState, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("State Added Successfully");
                        getRecords();
                        setCreateState({
                            ...createState,
                            nationality_id: "",
                            state_name: "",
                            entry_id: "",
                        });
                        closeHandler();
                    } else if (result.data.message === "exist") {
                        showAlert("STATE EXIST", "State already exist!", "error");
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
        else {
            await axios
                .patch(`${serverLink}staff/hr/state/update`, createState, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("State Updated Successfully");
                        getRecords();
                        setCreateNationality({
                            ...createNationality,
                            nationality_id: "",
                            state_name: "",
                            entry_id: "",
                        });
                        closeHandler();
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
    }

    const onLgaEdit = (e) => {
        const id = e.target.id;
        const value = e.target.value;

        if (id === 'country') {
            if (value !== '') {
                setStateSelect(stateList.filter(item => item.NationalityID === parseInt(value)))
            } else {
                setStateSelect([])
            }

        }
        setCreateLGA({
            ...createLGA,
            [e.target.id]: e.target.value,
        });
    };

    const onSubmitLga = async () => {
        if (createLGA.state_id === "") {
            showAlert("EMPTY FIELD", "Please select the state name", "error");
            return false;
        }
        if (createLGA.lga_name === "") {
            showAlert("EMPTY FIELD", "Please enter the local government name", "error");
            return false;
        }

        if (createLGA.entry_id === "") {
            await axios
                .post(`${serverLink}staff/hr/lga/add`, createLGA, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("LGA Added Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setCreateLGA({
                            ...createLGA,
                            lga_name: "",
                            state_id: "",
                            country: "",
                            entry_id: "",
                        });
                        closeHandler();
                    } else if (result.data.message === "exist") {
                        showAlert("LGA EXIST", "LGA already exist!", "error");
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
        else {
            await axios
                .patch(`${serverLink}staff/hr/lga/update`, createLGA, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("LGA Updated Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setCreateLGA({
                            ...createLGA,
                            lga_name: "",
                            state_id: "",
                            country: "",
                            entry_id: "",
                        });
                        closeHandler();
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
    }

    useEffect(() => {
        if (isLoading) {
            getRecords();
        }
    }, []);

    useEffect(() => {
        let rows = [];

        stateDatatable.rows.length > 0 &&
        stateDatatable.rows.map(item => {
            const country_name = nationalityList.filter(i => i.EntryID === item.country);
            if (country_name.length > 0) {
                item.country = country_name[0].Country;
            }
            rows.push(item)
        })

        setStateDatatable({
            ...stateDatatable,
            columns: stateDatatable.columns,
            rows: rows,
        });

    },[stateList])

    useEffect(() => {
        let rows = [];
        lgaDatatable.rows.length > 0 &&
        lgaDatatable.rows.map(item => {
            const state_name = stateList.filter(i => i.EntryID === item.state);
            if (state_name.length > 0) {
                item.state = state_name[0].StateName;

                const country_name = nationalityList.filter(i => i.EntryID === state_name[0].NationalityID);
                if (country_name.length > 0) {
                    item.country = country_name[0].Country;
                }
            }
            rows.push(item)
        })

        setLGADatatable({
            ...lgaDatatable,
            columns: lgaDatatable.columns,
            rows: rows,
        });

    },[lgaList])

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Nationality"}
                items={["Human Resources", "Others", "Nationality"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body pt-0">
                        <ul className="nav nav-custom nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-4 fw-bold mb-8">

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4 active" data-bs-toggle="tab" href="#nationality">Countries</a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4" data-kt-countup-tabs="true" data-bs-toggle="tab" href="#state">States</a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4" data-bs-toggle="tab" href="#lga">LGAs</a>
                            </li>

                        </ul>

                        <div className="tab-content" id="myTabContent">
                            
                            <div className="tab-pane fade active show" id="nationality" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#kt_modal_general"
                                        onClick={() =>
                                            setCreateNationality({
                                                ...createNationality,
                                                nationality_title: "",
                                                country: "",
                                                entry_id: "",
                                            })
                                        }
                                    >
                                        Add Nationality
                                    </button>
                                </div>
                                <Table data={nationalityDatatable} />
                            </div>
                            
                            
                            <div className="tab-pane fade" id="state" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={toggleAddState}
                                    >
                                        Add State
                                    </button>
                                </div>

                                {
                                    stateForm &&
                                    <div className="pb-5">
                                        <div className="col-md-6 offset-3">
                                            <h3>{createState.entry_id === '' ? 'Add' : 'Update'} State</h3>
                                            <div className="form-group pt-5">
                                                <label htmlFor="">Select Country</label>
                                                <select name="" id="nationality_id" className="form-select" onChange={onStateEdit} value={createState.nationality_id}>
                                                    <option value="">Select Country</option>
                                                    {
                                                        nationalityList.length > 0 &&
                                                        nationalityList.map((item, index) => {
                                                            return <option key={index} value={item.EntryID}>{item.Country}</option>
                                                        })
                                                    }
                                                </select>
                                            </div>

                                            <div className="form-group pt-5">
                                                <label htmlFor="">State Name</label>
                                                <input type="text" className="form-control" id={"state_name"} value={createState.state_name} onChange={onStateEdit} placeholder={"Enter the State Name"}/>
                                            </div>

                                            <div className="pt-5">
                                                <button className="btn btn-danger w-50 btn-sm" onClick={closeHandler}>Cancel</button>
                                                <button className="btn btn-primary w-50 btn-sm" onClick={onSubmitState}>Save</button>
                                            </div>
                                        </div>
                                    </div>
                                }

                                <Table data={stateDatatable} />
                            </div>

                            <div className="tab-pane fade" id="lga" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={toggleAddLga}
                                    >
                                        Add LGA
                                    </button>
                                </div>

                                {
                                    lgaForm &&
                                    <div className="pb-5">
                                        <div className="col-md-6 offset-3">
                                            <h3>{createLGA.entry_id === '' ? 'Add' : 'Update'} LGA</h3>
                                            <div className="form-group pt-5">
                                                <label htmlFor="">Select Country</label>
                                                <select name="" id="country" className="form-select" onChange={onLgaEdit} value={createLGA.country}>
                                                    <option value="">Select Country</option>
                                                    {
                                                        nationalityList.length > 0 &&
                                                        nationalityList.map((item, index) => {
                                                            return <option key={index} value={item.EntryID}>{item.Country}</option>
                                                        })
                                                    }
                                                </select>
                                            </div>

                                            <div className="form-group pt-5">
                                                <label htmlFor="">Select State</label>
                                                <select name="" id="state_id" className="form-select" onChange={onLgaEdit} value={createLGA.state_id}>
                                                    <option value="">Select State</option>
                                                    {
                                                        stateSelect.length > 0 &&
                                                        stateSelect.map((item, index) => {
                                                            return <option key={index} value={item.EntryID}>{item.StateName}</option>
                                                        })
                                                    }
                                                </select>
                                            </div>

                                            <div className="form-group pt-5">
                                                <label htmlFor="">LGA Name</label>
                                                <input type="text" className="form-control" id={"lga_name"} value={createLGA.lga_name} onChange={onLgaEdit} placeholder={"Enter the LGA Name"}/>
                                            </div>

                                            <div className="pt-5">
                                                <button className="btn btn-danger w-50 btn-sm" onClick={closeHandler}>Cancel</button>
                                                <button className="btn btn-primary w-50 btn-sm" onClick={onSubmitLga}>Save</button>
                                            </div>
                                        </div>
                                    </div>
                                }
                                <Table data={lgaDatatable} />
                            </div>

                        </div>
                    </div>
                </div>

                <Modal title={"Nationality Form"}>
                    <div className="form-group">
                        <label htmlFor="nationality_title">Nationality Title</label>
                        <input
                            type="text"
                            id={"nationality_title"}
                            onChange={onNationalityEdit}
                            value={createNationality.nationality_title}
                            className={"form-control"}
                            placeholder={"Enter the Nationality Title"}
                        />
                    </div>

                    <div className="form-group pt-2">
                        <label htmlFor="country">Country Name</label>
                        <input
                            type="text"
                            id={"country"}
                            onChange={onNationalityEdit}
                            value={createNationality.country}
                            className={"form-control"}
                            placeholder={"Enter the Country Name"}
                        />
                    </div>

                    <div className="form-group pt-2">
                        <button onClick={onSubmitNationality} className="btn btn-primary w-100">
                            Submit
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
    };
};
export default connect(mapStateToProps, null)(HRNationality);

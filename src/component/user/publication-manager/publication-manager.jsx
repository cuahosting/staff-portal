import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import Table from "../../common/table/table";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import {currencyConverter, decryptData, encryptData, formatDateAndTime} from "../../../resources/constants";
import {connect} from "react-redux";
import BlogForm from "./blog-form";
import BookForm from "./book-form";
import BookChapterForm from "./book-chapter-form";
import ConferenceForm from "./conference-form";
import JournalForm from "./journal-form";
import NewspaperForm from "./newspaper-form";
import PatentForm from "./patent-form";
import { useLocation } from "react-router";

function PublicationManager(props) {
    const {search} = useLocation();
    const param = search.split("=")[1] !== undefined ? search.split("=")[1] : "";

    const token = props.loginData[0].token;

    const [isLoading, setIsLoading] = useState(false);
    const [isFormLoading, setIsFormLoading] = useState('off');
    const [change, setChange] = useState(0.1);

    const [blogDatatable, setBlogDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Work Title",
                field: "WorkTitle",
            },
            {
                label: "Authors",
                field: "Authors",
            },
            {
                label: "Published Year",
                field: "PublishedYear",
            },
            {
                label: "Link",
                field: "OnlineURL",
            },
            {
                label: "File",
                field: "UploadFile",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });

    const [bookDatatable, setBookDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Work Title",
                field: "WorkTitle",
            },
            {
                label: "Authors",
                field: "Authors",
            },
            {
                label: "Published Year",
                field: "PublishedYear",
            },
            {
                label: "File",
                field: "UploadFile",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });

    const [bookChapterDatatable, setBookChapterDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Work Title",
                field: "WorkTitle",
            },
            {
                label: "Authors",
                field: "Authors",
            },
            {
                label: "Published Year",
                field: "PublishedYear",
            },
            {
                label: "Chapter Title",
                field: "ChapterTitle",
            },
            {
                label: "Chapter Number",
                field: "ChapterNumber",
            }
            ,
            {
                label: "Editor",
                field: "EditorName",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });

    const [conferenceDatatable, setConferenceDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Conference  Title",
                field: "WorkTitle",
            },
            {
                label: "Authors",
                field: "Authors",
            },
            {
                label: "Conference Location",
                field: "Location",
            },
            {
                label: "Published Year",
                field: "PublishedYear",
            },
            {
                label: "Publisher",
                field: "Publisher",
            },
            {
                label: "File",
                field: "UploadFile",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });

    const [journalDatatable, setJournalDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Journal  Title",
                field: "WorkTitle",
            },
            {
                label: "Authors",
                field: "Authors",
            },
            {
                label: "Published Year",
                field: "PublishedYear",
            },
            {
                label: "Journal Issue Number",
                field: "JournalIssueNumber",
            },{
                label: "Volume No.",
                field: "VolumeNumber",
            },
            {
                label: "File",
                field: "UploadFile",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });

    const [newspaperDatatable, setNewspaperDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Publication Title",
                field: "WorkTitle",
            },
            {
                label: "Authors",
                field: "Authors",
            },
            {
                label: "Published Date",
                field: "PublishedYear",
            },
            {
                label: "Paper / Magazine Name",
                field: "PaperTitle",
            },
            {
                label: "File",
                field: "UploadFile",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });

    const [patentDatatable, setPatentDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Publication Title",
                field: "WorkTitle",
            },
            {
                label: "Authors",
                field: "Authors",
            },
            {
                label: "Date Granted",
                field: "PublishedYear",
            },
            {
                label: "Locale",
                field: "PlaceOfPublication",
            },
            {
                label: "Assignee",
                field: "Assignee",
            },
            {
                label: "Patent Number",
                field: "PatentNumber",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });

    const [formData, setFormData] = useState({
        PublicationTypeID: "",
        WorkTitle: "",
        Authors: "",
        ChapterTitle: "",
        ChapterNumber: "",
        PaperTitle: "",
        ArticleTitle: "",
        JournalIssueNumber: "",
        Assignee: "",
        PatentNumber: "",
        PageRange: "",
        EditorName: "",
        OrganiserName: "",
        Location: "",
        Publisher: "",
        PlaceOfPublication: "",
        PublishedYear: "",
        OnlineURL: "",
        Edition: "",
        WorkStatus: "",
        VolumeNumber: "",
        DatabaseName: "",
        DOI: "",
        BlogName: "",
        UploadFile: "",
        InsertedBy: param !== "" ? decryptData(param) : props.loginData[0].StaffID,
        EntryID: "",
    });

    const resetForm = () => {
        setChange(Math.random())

        setFormData({
            ...formData,
            PublicationTypeID: "",
            WorkTitle: "",
            Authors: "",
            ChapterTitle: "",
            ChapterNumber: "",
            PaperTitle: "",
            ArticleTitle: "",
            JournalIssueNumber: "",
            Assignee: "",
            PatentNumber: "",
            PageRange: "",
            EditorName: "",
            OrganiserName: "",
            Location: "",
            Publisher: "",
            PlaceOfPublication: "",
            PublishedYear: "",
            OnlineURL: "",
            Edition: "",
            WorkStatus: "",
            VolumeNumber: "",
            DatabaseName: "",
            DOI: "",
            BlogName: "",
            UploadFile: "",
            InsertedBy: param !== "" ? decryptData(param) : props.loginData[0].StaffID,
            EntryID: "",
        });
        setChange(Math.random())
    }


    const getRecords = async () => {
        await axios.get(`${serverLink}staff/publication-manager/list/${formData.InsertedBy}`, token)
            .then((result) => {
                const data = result.data;
                if (data.length > 0 ){
                    const book = data.filter(e => e.PublicationTypeID.toString() === '1');
                    const book_chapter = data.filter(e => e.PublicationTypeID.toString() === '2');
                    const conference = data.filter(e => e.PublicationTypeID.toString() === '3');
                    const newspaper = data.filter(e => e.PublicationTypeID.toString() === '4');
                    const blog = data.filter(e => e.PublicationTypeID.toString() === '5');
                    const patent = data.filter(e => e.PublicationTypeID.toString() === '6');
                    const journal = data.filter(e => e.PublicationTypeID.toString() === '7');

                    if (blog.length > 0) {
                        let rows = [];
                        blog.map((item, index) => {
                            rows.push({
                                sn: index + 1,
                                WorkTitle: item.WorkTitle,
                                Authors: item.Authors,
                                PublishedYear: item.PublishedYear,
                                OnlineURL:  (!item.OnlineURL ? '--' : <a href={decryptData(item.OnlineURL)} target="_blank" >Link</a>),
                                UploadFile: (!item.UploadFile ? '--' : <a href="" target="_blank" >File</a>),
                                action: (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#kt_modal_general"
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                PublicationTypeID: item.PublicationTypeID,
                                                WorkTitle: item.WorkTitle,
                                                Authors: item.Authors,
                                                PublishedYear: item.PublishedYear,
                                                OnlineURL: decryptData(item.OnlineURL),
                                                DOI: item.DOI,
                                                UploadFile: item.UploadFile,
                                                InsertedBy: param !== "" ? decryptData(param) : props.loginData[0].StaffID,
                                                EntryID: item.EntryID,
                                            })
                                        }
                                    >
                                        <i className="fa fa-pen" />
                                    </button>
                                ),
                            });
                        });
                        setBlogDatatable({
                            ...blogDatatable,
                            columns: blogDatatable.columns,
                            rows: rows,
                        });
                    }

                    if (book.length > 0) {
                        let rows = [];
                        book.map((item, index) => {
                            rows.push({
                                sn: index + 1,
                                WorkTitle: item.WorkTitle,
                                Authors: item.Authors,
                                PublishedYear: item.PublishedYear,
                                Publisher: item.Publisher,
                                PlaceOfPublication: item.PlaceOfPublication,
                                Edition: item.Edition,
                                OnlineURL:  (!item.OnlineURL ? '--' : <a href={decryptData(item.OnlineURL)} target="_blank" >Link</a>),
                                UploadFile: (!item.UploadFile ? '--' : <a href="" target="_blank" >File</a>),
                                action: (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#book_form"
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                PublicationTypeID: item.PublicationTypeID,
                                                WorkTitle: item.WorkTitle,
                                                Authors: item.Authors,
                                                PublishedYear: item.PublishedYear,
                                                Publisher: item.Publisher,
                                                PlaceOfPublication: item.PlaceOfPublication,
                                                Edition: item.Edition,
                                                OnlineURL: decryptData(item.OnlineURL),
                                                UploadFile: item.UploadFile,
                                                InsertedBy: param !== "" ? decryptData(param) : props.loginData[0].StaffID,
                                                EntryID: item.EntryID,
                                            })
                                        }
                                    >
                                        <i className="fa fa-pen" />
                                    </button>
                                ),
                            });
                        });
                        setBookDatatable({
                            ...bookDatatable,
                            columns: bookDatatable.columns,
                            rows: rows,
                        });
                    }

                    if (book_chapter.length > 0) {
                        let rows = [];
                        book_chapter.map((item, index) => {
                            rows.push({
                                sn: index + 1,
                                WorkTitle: item.WorkTitle,
                                Authors: item.Authors,
                                PublishedYear: item.PublishedYear,
                                Publisher: item.Publisher,
                                PlaceOfPublication: item.PlaceOfPublication,
                                ChapterTitle: item.ChapterTitle,
                                ChapterNumber: item.ChapterNumber,
                                EditorName: item.EditorName,
                                OnlineURL:  (!item.OnlineURL ? '--' : <a href={decryptData(item.OnlineURL)} target="_blank" >Link</a>),
                                action: (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#book_chapter_form"
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                PublicationTypeID: item.PublicationTypeID,
                                                WorkTitle: item.WorkTitle,
                                                Authors: item.Authors,
                                                PublishedYear: item.PublishedYear,
                                                Publisher: item.Publisher,
                                                PlaceOfPublication: item.PlaceOfPublication,
                                                ChapterTitle: item.ChapterTitle,
                                                ChapterNumber: item.ChapterNumber,
                                                EditorName: item.EditorName,
                                                OnlineURL: decryptData(item.OnlineURL),
                                                InsertedBy: param !== "" ? decryptData(param) : props.loginData[0].StaffID,
                                                EntryID: item.EntryID,
                                            })
                                        }
                                    >
                                        <i className="fa fa-pen" />
                                    </button>
                                ),
                            });
                        });
                        setBookChapterDatatable({
                            ...bookChapterDatatable,
                            columns: bookChapterDatatable.columns,
                            rows: rows,
                        });
                    }

                    if (conference.length > 0) {
                        let rows = [];
                        conference.map((item, index) => {
                            rows.push({
                                sn: index + 1,
                                WorkTitle: item.WorkTitle,
                                PaperTitle: item.PaperTitle,
                                Authors: item.Authors,
                                PublishedYear: item.PublishedYear,
                                Location: item.Location,
                                Publisher: item.Publisher,
                                PlaceOfPublication: item.PlaceOfPublication,
                                Organiser: item.Organiser,
                                OnlineURL:  (!item.OnlineURL ? '--' : <a href={decryptData(item.OnlineURL)} target="_blank" >Link</a>),
                                UploadFile: (!item.UploadFile ? '--' : <a href="" target="_blank" >File</a>),
                                action: (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#conference_form"
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                PublicationTypeID: item.PublicationTypeID,
                                                WorkTitle: item.WorkTitle,
                                                PaperTitle: item.PaperTitle,
                                                Authors: item.Authors,
                                                PublishedYear: item.PublishedYear,
                                                Location: item.Location,
                                                Publisher: item.Publisher,
                                                PlaceOfPublication: item.PlaceOfPublication,
                                                Organiser: item.Organiser,
                                                OnlineURL: decryptData(item.OnlineURL),
                                                InsertedBy: param !== "" ? decryptData(param) : props.loginData[0].StaffID,
                                                EntryID: item.EntryID,
                                            })
                                        }
                                    >
                                        <i className="fa fa-pen" />
                                    </button>
                                ),
                            });
                        });
                        setConferenceDatatable({
                            ...conferenceDatatable,
                            columns: conferenceDatatable.columns,
                            rows: rows,
                        });
                    }

                    if (journal.length > 0) {
                        let rows = [];
                        journal.map((item, index) => {
                            rows.push({
                                sn: index + 1,
                                WorkTitle: item.WorkTitle,
                                ArticleTitle: item.ArticleTitle,
                                Authors: item.Authors,
                                PublishedYear: item.PublishedYear,
                                JournalIssueNumber: item.JournalIssueNumber,
                                VolumeNumber: item.VolumeNumber,
                                PageRange: item.PageRange,
                                DOI: item.DOI,
                                DatabaseName: item.DatabaseName,
                                OnlineURL:  (!item.OnlineURL ? '--' : <a href={decryptData(item.OnlineURL)} target="_blank" >Link</a>),
                                UploadFile: (!item.UploadFile ? '--' : <a href="" target="_blank" >File</a>),
                                action: (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#journal_form"
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                PublicationTypeID: item.PublicationTypeID,
                                                ArticleTitle: item.ArticleTitle,
                                                Authors: item.Authors,
                                                PublishedYear: item.PublishedYear,
                                                JournalIssueNumber: item.JournalIssueNumber,
                                                VolumeNumber: item.VolumeNumber,
                                                PageRange: item.PageRange,
                                                DOI: item.DOI,
                                                DatabaseName: item.DatabaseName,
                                                OnlineURL: decryptData(item.OnlineURL),
                                                InsertedBy: param !== "" ? decryptData(param) : props.loginData[0].StaffID,
                                                EntryID: item.EntryID,
                                            })
                                        }
                                    >
                                        <i className="fa fa-pen" />
                                    </button>
                                ),
                            });
                        });
                        setJournalDatatable({
                            ...journalDatatable,
                            columns: journalDatatable.columns,
                            rows: rows,
                        });
                    }

                    if (newspaper.length > 0) {
                        let rows = [];
                        newspaper.map((item, index) => {
                            rows.push({
                                sn: index + 1,
                                WorkTitle: item.WorkTitle,
                                PaperTitle: item.PaperTitle,
                                Authors: item.Authors,
                                PublishedYear: item.PublishedYear,
                                OnlineURL:  (!item.OnlineURL ? '--' : <a href={decryptData(item.OnlineURL)} target="_blank" >Link</a>),
                                UploadFile: (!item.UploadFile ? '--' : <a href="" target="_blank" >File</a>),
                                action: (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#newspaper_form"
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                PublicationTypeID: item.PublicationTypeID,
                                                WorkTitle: item.WorkTitle,
                                                PaperTitle: item.PaperTitle,
                                                Authors: item.Authors,
                                                PublishedYear: item.PublishedYear,
                                                OnlineURL: decryptData(item.OnlineURL),
                                                InsertedBy: param !== "" ? decryptData(param) : props.loginData[0].StaffID,
                                                EntryID: item.EntryID,
                                            })
                                        }
                                    >
                                        <i className="fa fa-pen" />
                                    </button>
                                ),
                            });
                        });
                        setNewspaperDatatable({
                            ...newspaperDatatable,
                            columns: newspaperDatatable.columns,
                            rows: rows,
                        });
                    }

                    if (patent.length > 0) {
                        let rows = [];
                        patent.map((item, index) => {
                            rows.push({
                                sn: index + 1,
                                WorkTitle: item.WorkTitle,
                                Authors: item.Authors,
                                PublishedYear: item.PublishedYear,
                                PlaceOfPublication: item.PlaceOfPublication,
                                Assignee: item.Assignee,
                                PatentNumber: item.PatentNumber,
                                DatabaseName: item.DatabaseName,
                                OnlineURL:  (!item.OnlineURL ? '--' : <a href={decryptData(item.OnlineURL)} target="_blank" >Link</a>),
                                UploadFile: (!item.UploadFile ? '--' : <a href="" target="_blank" >File</a>),
                                action: (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#patent_form"
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                PublicationTypeID: item.PublicationTypeID,
                                                Authors: item.Authors,
                                                PublishedYear: item.PublishedYear,
                                                PlaceOfPublication: item.PlaceOfPublication,
                                                Assignee: item.Assignee,
                                                PatentNumber: item.PatentNumber,
                                                DatabaseName: item.DatabaseName,
                                                OnlineURL: decryptData(item.OnlineURL),
                                                InsertedBy: param !== "" ? decryptData(param) : props.loginData[0].StaffID,
                                                EntryID: item.EntryID,
                                            })
                                        }
                                    >
                                        <i className="fa fa-pen" />
                                    </button>
                                ),
                            });
                        });
                        setPatentDatatable({
                            ...patentDatatable,
                            columns: patentDatatable.columns,
                            rows: rows,
                        });
                    }
                }

                setIsLoading(false);
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });
    };

    const onEdit = (e) => {
        const id = e.target.id;
        let value;
        if (id === "UploadFile"){
            value = e.target.files[0];
        }else{
           value = e.target.value;
        }

        setFormData({
            ...formData,
            [id]: value,
        });
    };


    const onSubmit = async (pubID) => {
        const pubTypeID = pubID;
        if (pubTypeID.toString() === "1"){
            if (formData.WorkTitle.trim() === "") {
                showAlert("EMPTY FIELD", "Please enter the work title", "error");
                return false;
            }
            if (formData.Authors.toString().trim() === "") {
                showAlert("EMPTY FIELD", "Please enter the authors", "error");
                return false;
            }
            if (formData.PublishedYear.toString().trim() === "") {
                showAlert("EMPTY FIELD", "Please enter the date published", "error");
                return false;
            }
        }else if (pubTypeID.toString() === "1"){

        }else {

        }



        if (formData.EntryID === "") {
            setIsFormLoading("on")
            let sendData = {...formData, PublicationTypeID: pubTypeID, OnlineURL: encryptData(formData.OnlineURL)};
            await axios
                .post(`${serverLink}staff/publication-manager/add`, sendData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        setIsFormLoading("off")
                        toast.success("Publication Added Successfully");
                         document.querySelector("closeModal").click()

                        getRecords();
                        setFormData({
                            ...formData,
                            PublicationTypeID: "",
                            WorkTitle: "",
                            Authors: "",
                            ChapterTitle: "",
                            ChapterNumber: "",
                            PaperTitle: "",
                            ArticleTitle: "",
                            JournalIssueNumber: "",
                            Assignee: "",
                            PatentNumber: "",
                            PageRange: "",
                            EditorName: "",
                            OrganiserName: "",
                            Location: "",
                            Publisher: "",
                            PlaceOfPublication: "",
                            PublishedYear: "",
                            OnlineURL: "",
                            Edition: "",
                            WorkStatus: "",
                            VolumeNumber: "",
                            DatabaseName: "",
                            DOI: "",
                            BlogName: "",
                            UploadFile: "",
                            EntryID: "",
                        });
                    } else if (result.data.message === "exist") {
                        setIsFormLoading("off")
                        showAlert("PUBLICATION EXIST", "Publication already exist!", "error");
                    } else {
                        setIsFormLoading("off")
                        showAlert( "ERROR", "Something went wrong. Please try again!",  "error" );
                    }
                })
                .catch((error) => {
                    setIsFormLoading("off")
                    showAlert( "NETWORK ERROR",  "Please check your connection and try again!", "error"   );
                });
        } else {
            setIsFormLoading("on")
            let sendData = {...formData, PublicationTypeID: pubTypeID, OnlineURL: encryptData(formData.OnlineURL)};
            await axios
                .patch(`${serverLink}staff/publication-manager/update`, sendData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        setIsFormLoading("off")
                        toast.success("Publication Updated Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setFormData({
                            ...formData,
                            PublicationTypeID: "",
                            WorkTitle: "",
                            Authors: "",
                            ChapterTitle: "",
                            ChapterNumber: "",
                            PaperTitle: "",
                            ArticleTitle: "",
                            JournalIssueNumber: "",
                            Assignee: "",
                            PatentNumber: "",
                            PageRange: "",
                            EditorName: "",
                            OrganiserName: "",
                            Location: "",
                            Publisher: "",
                            PlaceOfPublication: "",
                            PublishedYear: "",
                            OnlineURL: "",
                            Edition: "",
                            WorkStatus: "",
                            VolumeNumber: "",
                            DatabaseName: "",
                            DOI: "",
                            BlogName: "",
                            UploadFile: "",
                            EntryID: "",
                        });
                    } else {
                        setIsFormLoading("off")
                        showAlert( "ERROR", "Something went wrong. Please try again!",  "error" );
                    }
                })
                .catch((error) => {
                    setIsFormLoading("off")
                    showAlert( "NETWORK ERROR",  "Please check your connection and try again!", "error"   );
                });
        }
    };

    useEffect(() => {
        getRecords();
    }, []);

    useEffect(()=>{
        setFormData({
            ...formData,
            PublicationTypeID: "",
            WorkTitle: "",
            Authors: "",
            ChapterTitle: "",
            ChapterNumber: "",
            PaperTitle: "",
            ArticleTitle: "",
            JournalIssueNumber: "",
            Assignee: "",
            PatentNumber: "",
            PageRange: "",
            EditorName: "",
            OrganiserName: "",
            Location: "",
            Publisher: "",
            PlaceOfPublication: "",
            PublishedYear: "",
            OnlineURL: "",
            Edition: "",
            WorkStatus: "",
            VolumeNumber: "",
            DatabaseName: "",
            DOI: "",
            BlogName: "",
            UploadFile: "",
            EntryID: "",
        });    }, [change])

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Publication Manager"} items={["Users", "Publication", "Publication Manager"]}/>
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body pt-0">
                        <ul className="nav nav-custom nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-4 fw-bold mb-8">

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4 active" data-bs-toggle="tab" href="#blog">Blog</a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4" data-kt-countup-tabs="true" data-bs-toggle="tab" href="#book">Book</a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4" data-bs-toggle="tab" href="#book_chapter">Book Chapter</a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4" data-bs-toggle="tab" href="#conference_paper">Conference Paper</a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4" data-bs-toggle="tab" href="#journal">Journal</a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4" data-bs-toggle="tab" href="#newspaper">Newspaper/Magazine</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4" data-bs-toggle="tab" href="#patent">Patent/Creative Work/Invention</a>
                            </li>
                        </ul>

                        <div className="tab-content" id="myTabContent">

                            <div className="tab-pane fade active show" id="blog" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#kt_modal_general"
                                        onClick={() => resetForm }
                                    >
                                        Add Publication
                                    </button>
                                </div>
                                <Table data={blogDatatable} />
                            </div>
                            <div className="tab-pane fade" id="book" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#book_form"
                                        onClick={() => resetForm }
                                    >
                                        Add Publication
                                    </button>
                                </div>
                                <Table data={bookDatatable} />
                            </div>
                            <div className="tab-pane fade" id="book_chapter" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#book_chapter_form"
                                        onClick={() => resetForm }
                                    >
                                        Add Publication
                                    </button>
                                </div>
                                <Table data={bookChapterDatatable} />
                            </div>
                            <div className="tab-pane fade" id="conference_paper" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#conference_form"
                                        onClick={() => resetForm }
                                    >
                                        Add Publication
                                    </button>
                                </div>
                                <Table data={conferenceDatatable} />
                            </div>
                            <div className="tab-pane fade" id="journal" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#journal_form"
                                        onClick={() => resetForm }
                                    >
                                        Add Publication
                                    </button>
                                </div>
                                <Table data={journalDatatable} />
                            </div>
                            <div className="tab-pane fade" id="newspaper" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#newspaper_form"
                                        onClick={() => resetForm }
                                    >
                                        Add Publication
                                    </button>
                                </div>
                                <Table data={newspaperDatatable} />
                            </div>
                            <div className="tab-pane fade" id="patent" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#patent_form"
                                        onClick={() => resetForm }
                                    >
                                        Add Publication
                                    </button>
                                </div>
                                <Table data={patentDatatable} />
                            </div>
                        </div>
                    </div>
                </div>

                <Modal title={"Blog Form"}>
                   <BlogForm data={formData} onSubmit={()=>onSubmit(5)} onEdit={onEdit} isFormLoading={isFormLoading}/>
                </Modal>

                <Modal title={"Book Form"} id="book_form">
                    <BookForm data={formData} onSubmit={()=>onSubmit(1)} onEdit={onEdit} isFormLoading={isFormLoading}/>
                </Modal>

                <Modal title={"Book Chapter Form"} id="book_chapter_form">
                    <BookChapterForm data={formData} onSubmit={()=>onSubmit(2)} onEdit={onEdit} isFormLoading={isFormLoading}/>
                </Modal>

                <Modal title={"Conference Form"} id="conference_form">
                    <ConferenceForm data={formData} onSubmit={()=>onSubmit(3)} onEdit={onEdit} isFormLoading={isFormLoading}/>
                </Modal>

                <Modal title={"Journal Form"} id="journal_form">
                    <JournalForm data={formData} onSubmit={()=>onSubmit(7)} onEdit={onEdit} isFormLoading={isFormLoading}/>
                </Modal>

                <Modal title={"Newspaper/Magazine Form"} id="newspaper_form">
                    <NewspaperForm data={formData} onSubmit={()=>onSubmit(4)} onEdit={onEdit} isFormLoading={isFormLoading}/>
                </Modal>

                <Modal title={"Patent/Creative Work/Invention Form"} id="patent_form">
                    <PatentForm data={formData} onSubmit={()=>onSubmit(6)} onEdit={onEdit} isFormLoading={isFormLoading}/>
                </Modal>
            </div>
        </div>
    );
}
const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(PublicationManager);
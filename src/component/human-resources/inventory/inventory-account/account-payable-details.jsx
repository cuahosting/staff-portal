import React from 'react'
import Loader from "../../../common/loader/loader";
import ReportTable from "../../../common/table/report_table";
import JoditEditor from "jodit-react";
import {sendEmail} from "../../../../resources/constants";

export default function AccountPayableDetails(props) {

    const onSendEmail = async () => {
        sendEmail("adammusa89@gmail.com", props.values.EmailObject.subject, props.values.Title, props.values.Name, props.values.EmailContentBody, '');
    }
    return (
        <div>
            {
                props.formType === 0 ?
                    <>
                        {
                            props.fetechingRecord !== null ?
                                <Loader />
                                :
                                <div className="col-md-12">
                                    <ReportTable size="xl" title={"ITEM DETAILS"} columns={props.detailsCols} data={props.requestDetails} height={"700px"} />
                                </div>
                        }
                    </>
                    :
                    props.formType === 2 ?
                        <>
                            <form onSubmit={props.onSubmit}>
                                <div className="row">
                                    <div className="col-md-12 pb-3 mb-5">
                                        <div className="form-group">
                                            <h2 className="text-center">Are you sure you want to reject this request?</h2>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <button type="button" className="btn btn-lg btn-block btn-primary form-control" onClick={() => document.getElementById("closeModal").click()} disabled={props.isSubmitting} >
                                            Cancel
                                        </button>
                                    </div>
                                    <div className="col-md-6">
                                        <button type="button" onClick={props.onCancel} className="btn btn-lg btn-block btn-danger form-control" disabled={props.isSubmitting} >
                                            {props.isSubmitting ? <span> <i className='fa fa-spin fa-spinner' /> &nbsp;Please wait...</span> : "Reject"}
                                        </button>
                                    </div>
                                </div>
                            </form>

                        </>
                        :

                        props.formType === 3 ?
                            <>
                            {
                                props.fetechingRecord !== null ?
                                    <Loader />
                                    :
                                    <div className="form-group col-md-12 mb-3">
                                        <label className='form-label' >Email Body</label>
                                        <JoditEditor
                                            value={props.values.EmailContentBody}
                                            tabIndex={1}
                                            onChange={(e) => {
                                                props.setFormData({
                                                    ...props.values,
                                                    EmailContentBody: e
                                                })
                                            }}
                                        />
                                        <div className="form-group mt-10">
                                            <button type="button" className="form-control btn btn-lg btn-block btn-primary" disabled={props.isSubmitting} >
                                                {props.isSubmitting ? <span> <i className='fa fa-spin fa-spinner' /> &nbsp;Please wait...</span> : "Send"}
                                            </button>
                                        </div>
                                    </div>
                            }
                            </>

                            :
                    <>
                        <form onSubmit={props.onSubmit}>
                            <div className="row">
                                <div className="col-md-12 pb-3 mb-5">
                                    <div className="form-group">
                                        <label htmlFor="amount_to_pay">Enter Amount</label>
                                        <input type="number" step={"any"} min="0" id="amount_to_pay" className="form-control mt-3"
                                               value={props.values.amount_to_pay} onChange={props.onChange} required />

                                    </div>
                                </div>
                                <button type="submit" onClick={onSendEmail} className="btn btn-lg btn-block btn-primary" disabled={props.isSubmitting} >
                                    {props.isSubmitting ? <span> <i className='fa fa-spin fa-spinner' /> &nbsp;Please wait...</span> : "Submit"}
                                </button>
                            </div>
                        </form>

                    </>
            }
        </div>
    )
}
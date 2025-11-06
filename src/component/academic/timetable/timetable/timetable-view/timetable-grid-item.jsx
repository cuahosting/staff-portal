import * as DOMPurify from 'dompurify';

const TimeTableGridItem = (props) => {
    return (
        <div className="h-100" style={{ backgroundColor: `${props.color}`, color: 'white' }}>
            <div className="d-flex flex-column px-3 pt-3 pb-4">
                <div className="fw-bolder mb-0 text-lg-start">
                    <span className="font-weight-bold" style={{ fontSize: '18px', fontWeight: 'bold' }}>{props.course}</span>
                    {/*<span className="float-end">{props.key_id}</span>*/}
                </div>

                <div className="d-flex align-items-center flex-wrap mb-1 mt-auto fs-6">
                    {
                        <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(props.staff_list)}} />
                    }
                </div>

                <div className="d-flex align-items-center fw-bold">
                    <span className="badge bg-light text-gray-700 px-1 py-1 me-0">{props.type}</span>
                </div>
                <div className="d-flex align-items-center fw-bold">
                    <span className="text-default-400 fs-7">{props.venue}</span>
                </div>
                <div>
                    <span className="text-default-400 fs-7">{props.time}</span>
                </div>
            </div>
        </div>
    )
}
export default TimeTableGridItem;

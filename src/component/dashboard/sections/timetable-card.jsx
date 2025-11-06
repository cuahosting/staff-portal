
import TimetableView from "../../academic/timetable/timetable-view/timetable-view";
const TimeTableCard = (props) => {


    return (
        <TimetableView type="staff" hidePrint={props.hidePrint} item_id={props.current_user.StaffID} semester={props.semester} show_key={true} />
    )
}

export default TimeTableCard;

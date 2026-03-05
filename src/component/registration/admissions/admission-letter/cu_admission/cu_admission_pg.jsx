import './cu_admission.css';
import RegSign from './reg_sign.png';
import { convertNumbertoWords, currencyConverter, formatDateAndTime } from '../../../../../resources/constants';

const CosmopolitanAdmissionLetter = (props) => {
    const applicantCourse = props.data.applicantCourse?.[0] || {};
    const applicantInfo = props.data.applicantInfo?.[0] || {};
    const decision = props.data.decison || {};
    const decisionDetails = props.data.decisionDetails?.[0] || {};
    const school = props.data.school || {};
    const today = new Date();

    const applicantName = `${applicantInfo.FirstName || ""} ${applicantInfo.LastName || ""}`.trim() ||
        `${applicantInfo.FirstName || ""} ${applicantInfo.Surname || ""}`.trim() ||
        `${applicantInfo.Surname || ""} ${applicantInfo.MiddleName || ""} ${applicantInfo.FirstName || ""}`.replace(/\s+/g, " ").trim();

    const applicationId = decisionDetails.ApplicationID ||
        decisionDetails.ApplicantID ||
        decisionDetails.applicantion_id ||
        decision.applicant_id ||
        applicantInfo.ApplicationID ||
        applicantInfo.ApplicantID ||
        "";

    const insertedDate = decisionDetails.InsertedOn || decision.decisionDate || today;
    const dateLabel = formatDateAndTime(insertedDate, "date");

    const admissionType = decisionDetails.AdmissionType || decision.type || applicantCourse.CourseClass || "MBA";
    const modeOfStudy = decision.studyMode || decisionDetails.StudyMode || "Full-Time";

    const startYear = decisionDetails.StartYear || decision.StartYear;
    const termOfAdmission =
        decisionDetails.AdmissionSemester ||
        decision.admissionSemester ||
        (startYear ? `${startYear}/${Number(startYear) + 1}` : "");

    const duration = Number(applicantCourse.Duration || 0);
    const durationType = String(applicantCourse.DurationType || "").toLowerCase();
    const semesterCount =
        duration && durationType.includes("year")
            ? duration * 2
            : duration && durationType.includes("semester")
                ? duration
                : 4;

    const courseLengthLabel =
        duration
            ? `${duration} ${applicantCourse.DurationType}${semesterCount ? ` (${semesterCount} Semesters)` : ""}`
            : `${semesterCount} Semesters`;

    const tuitionPerSemester = Number(
        applicantCourse.TuitionFee ||
        applicantCourse.TuitionAmount ||
        props.data.tuitionPerSemester ||
        props.data.tuition ||
        0
    );
    const tuitionPerYear = tuitionPerSemester * 2;
    const applicationFee = Number(props.data.applicationFee || 50000);
    const totalFees = (tuitionPerSemester * semesterCount) + applicationFee;
    const totalFeesWords = convertNumbertoWords(totalFees);

    const courseName = decisionDetails.CourseName || decision.CourseName || applicantCourse.CourseName || "";
    const specialization = applicantCourse.Specialization || applicantCourse.Track || "";
    const intakeSession = termOfAdmission;
    const studyMode = modeOfStudy;
    const acceptanceDeadline = props.data.acceptanceDeadline || "";

    return (
        <div>
            <div
                className="admission-letter-body"
                style={{
                    backgroundColor: '#ffffff',
                    minHeight: '297mm',
                    width: '210mm',
                    padding: '0',
                    margin: '0 auto',
                    fontFamily: "'Times New Roman', Times, serif",
                    fontSize: '12pt',
                    lineHeight: '1.6',
                    color: '#111'
                }}
                ref={props.componentRef}
            >
                <div style={{ padding: '40px 60px 50px 60px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        {school.logo && (
                            <img src={school.logo} alt="Logo" style={{ height: '80px', marginBottom: '8px' }} />
                        )}
                        <div style={{ fontSize: '16pt', fontWeight: 'bold' }}>{school.name?.split("|")[0] || "Cosmopolitan University"}</div>
                        <div style={{ fontSize: '13pt', fontWeight: 'bold', letterSpacing: '0.5px' }}>POSTGRADUATE ADMISSIONS OFFICE</div>
                    </div>

                    <div style={{ marginBottom: '18px', fontSize: '12pt' }}>
                        <div><strong>Application ID:</strong> {applicationId || "N/A"}</div>
                        <div><strong>Date:</strong> {dateLabel}</div>
                        <div><strong>Applicant’s Name:</strong> {applicantName || "N/A"}</div>
                    </div>

                    <div style={{ marginBottom: '18px', fontSize: '12pt' }}>
                        <strong>Dear {applicantInfo.FirstName || "Applicant"},</strong>
                    </div>

                    <div style={{ textAlign: 'center', margin: '10px 0 20px 0', fontSize: '13pt', fontWeight: 'bold' }}>
                        OFFER OF PROVISIONAL ADMISSION
                    </div>

                    <p style={{ marginBottom: '14px', textAlign: 'justify' }}>
                        We are pleased to inform you that, following a successful review of your application and uploaded
                        required documents, you have been offered Provisional Admission into the {courseName}
                        {specialization ? ` programme, ${specialization},` : " programme,"} for the {intakeSession || "current academic session"} in
                        {studyMode ? ` ${studyMode}` : " Full-Time"}.
                        Congratulations on this achievement.
                    </p>

                    {acceptanceDeadline && (
                        <p style={{ marginBottom: '16px' }}>
                            Please confirm acceptance of this offer on or before <strong>{acceptanceDeadline}</strong>.
                        </p>
                    )}

                    <div style={{ margin: '8px 0 10px 0' }}>
                        <div><strong>Mode of Study:</strong> {modeOfStudy} &nbsp;&nbsp; <strong>Admission Type:</strong> {admissionType}</div>
                        <div><strong>Term of Admission:</strong> {termOfAdmission || "N/A"}</div>
                        <div><strong>Course Length:</strong> {courseLengthLabel}</div>
                    </div>

                    <div style={{ marginTop: '12px', marginBottom: '10px', fontWeight: 'bold' }}>Fees:</div>
                    <ul style={{ marginTop: '6px', marginBottom: '12px' }}>
                        <li>Tuition: {currencyConverter(tuitionPerSemester)} per semester</li>
                        <li>{currencyConverter(tuitionPerYear)} per year</li>
                        <li><strong>Application Processing Fee:</strong> {currencyConverter(applicationFee)}</li>
                    </ul>

                    <div style={{ marginBottom: '16px' }}>
                        <strong>Total Fees:</strong> {currencyConverter(totalFees)}
                        {totalFeesWords && (
                            <span> ({totalFeesWords} Naira only).</span>
                        )}
                    </div>

                    <p style={{ marginBottom: '20px', textAlign: 'justify' }}>
                        Accept my congratulations on your admission! Please note that this offer of admission is subject
                        to the payment of the required fees. Our admissions team will be pleased to guide you through the
                        enrolment process. We look forward to welcoming you into a community committed to innovation,
                        leadership, and professional excellence.
                    </p>

                    <div style={{ marginTop: '20px' }}>
                        <div>Yours faithfully,</div>
                        <div style={{ marginTop: '10px' }}>
                            <img src={RegSign} style={{ width: '180px', height: '45px' }} alt="Registrar Signature" />
                        </div>
                        <div style={{ marginTop: '6px', fontWeight: 'bold' }}>Mani Ibrahim Ahmad, PhD. FNIM</div>
                        <div>Registrar, Cosmopolitan University, Abuja</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CosmopolitanAdmissionLetter;

import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import BgImage from './cu_bg_1.jpg';
import RegSign from './reg_sign.png';
import { formatDate, formatDateAndTime } from '../../../../../resources/constants';

const formatNGN = (amount) => {
    return 'NGN ' + Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const styles = StyleSheet.create({
    page: {
        position: 'relative',
        fontFamily: 'Times-Roman',
        fontSize: 11,
        color: '#333',
        lineHeight: 1.3,
    },
    bgImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    content: {
        paddingTop: 130,
        paddingLeft: 50,
        paddingRight: 50,
        paddingBottom: 15,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        textAlign: 'right',
    },
    studentName: {
        fontSize: 10,
        fontFamily: 'Times-Bold',
        marginBottom: 2,
    },
    addressText: {
        fontSize: 10,
        color: '#555',
    },
    refText: {
        fontSize: 10,
        marginBottom: 2,
        textAlign: 'right',
    },
    boldText: {
        fontFamily: 'Times-Bold',
    },
    salutation: {
        fontSize: 11,
        marginBottom: 8,
    },
    titleBox: {
        textAlign: 'center',
        marginBottom: 8,
        padding: 6,
        borderRadius: 3,
    },
    titleText: {
        fontSize: 13,
        fontFamily: 'Times-Bold',
        textDecoration: 'underline',
    },
    sponsorText: {
        marginTop: 3,
        fontSize: 10,
        fontStyle: 'italic',
        color: '#006400',
    },
    bodyText: {
        fontSize: 11,
        marginBottom: 8,
        textAlign: 'justify',
    },
    detailsBox: {
        marginLeft: 25,
        marginBottom: 8,
        padding: '8 12',
        backgroundColor: '#f8f9fa',
        borderLeft: '3 solid #003366',
        borderTopRightRadius: 3,
        borderBottomRightRadius: 3,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 1,
    },
    tableLabel: {
        width: '40%',
        fontSize: 10,
        fontFamily: 'Times-Bold',
    },
    tableValue: {
        width: '60%',
        fontSize: 10,
    },
    feesHeading: {
        fontSize: 11,
        fontFamily: 'Times-Bold',
        marginBottom: 3,
        color: '#003366',
    },
    feesSubtext: {
        fontSize: 10,
        marginBottom: 3,
    },
    feesBox: {
        marginLeft: 25,
        marginBottom: 8,
        padding: '8 12',
        backgroundColor: '#fff8e1',
        borderLeft: '3 solid #ffc107',
        borderTopRightRadius: 3,
        borderBottomRightRadius: 3,
    },
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 1,
    },
    feeLabel: {
        fontSize: 10,
    },
    feeValue: {
        fontSize: 10,
        fontFamily: 'Times-Bold',
        textAlign: 'right',
    },
    scholarshipBox: {
        marginBottom: 8,
        padding: '8 12',
        backgroundColor: 'rgba(0, 100, 0, 0.05)',
        borderLeft: '3 solid #006400',
        borderTopRightRadius: 3,
        borderBottomRightRadius: 3,
    },
    closingText: {
        fontSize: 10,
        marginBottom: 3,
        textAlign: 'justify',
    },
    congratsText: {
        fontSize: 10,
        marginBottom: 8,
    },
    signatureSection: {
        marginTop: 8,
    },
    signatureImage: {
        width: 130,
        height: 35,
    },
    signatureLine: {
        borderTop: '1 solid #333',
        width: 220,
        paddingTop: 3,
        marginTop: 3,
    },
    signatureName: {
        fontSize: 10,
        fontFamily: 'Times-Bold',
    },
    signatureTitle: {
        fontSize: 9,
        color: '#555',
    },
    footer: {
        marginTop: 10,
        borderTop: '1 solid #ccc',
        paddingTop: 4,
        textAlign: 'center',
    },
    footerText: {
        fontSize: 8,
        color: '#666',
        textAlign: 'center',
    },
});

const CUAdmissionLetterPDF = ({ data }) => {
    const applicantCourse = data.applicantCourse[0];
    const applicantInfo = data.applicantInfo[0];
    const decison = data.decison;
    const dec = data.decisionDetails[0];
    const school = data.school;
    const isScholarship = data.isScholarship || false;
    const scholarshipBody = data.scholarshipBody || '';
    const accommodationFee = data.accommodationFee || 450000;
    const applicationFee = data.applicationFee || 20000;

    const title = isScholarship
        ? "SCHOLARSHIP OFFER OF ADMISSION"
        : (decison.type === "Conditional" ? "CONDITIONAL OFFER OF ADMISSION" : "OFFER OF PROVISIONAL ADMISSION");

    const titleBgColor = isScholarship ? 'rgba(0, 100, 0, 0.1)' : 'rgba(0, 51, 102, 0.1)';
    const titleColor = isScholarship ? '#006400' : '#003366';

    const tuitionPerSemester = parseInt(applicantCourse.TuitionFee || 0);
    const tuitionPerSession = tuitionPerSemester * 2;

    const refDate = formatDateAndTime(formatDate(dec.InsertedOn), "date");
    const refNumber = `CU/REG/ADM/${dec.AdmissionSemester?.split('-')[0]}/${dec.ApplicationID}`;

    return (
        <Document>
            <Page size="A4" orientation="portrait" style={styles.page} wrap={false}>
                {/* Background Image */}
                <Image src={BgImage} style={styles.bgImage} />

                <View style={styles.content}>
                    {/* Header Row */}
                    <View style={styles.headerRow}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.studentName}>
                                {applicantInfo.Surname?.toUpperCase()} {applicantInfo.MiddleName?.toUpperCase() || ''} {applicantInfo.FirstName?.toUpperCase()}
                            </Text>
                            <Text style={styles.addressText}>
                                {applicantInfo.Address || 'Nigeria'}
                            </Text>
                        </View>
                        <View style={styles.headerRight}>
                            <Text style={styles.refText}>
                                <Text style={styles.boldText}>Our Ref: </Text>{refNumber}
                            </Text>
                            <Text style={styles.refText}>
                                <Text style={styles.boldText}>Date: </Text>{refDate}
                            </Text>
                        </View>
                    </View>

                    {/* Salutation */}
                    <Text style={styles.salutation}>
                        Dear <Text style={styles.boldText}>{applicantInfo.FirstName}</Text>,
                    </Text>

                    {/* Title Box */}
                    <View style={[styles.titleBox, { backgroundColor: titleBgColor }]}>
                        <Text style={[styles.titleText, { color: titleColor }]}>
                            {title}
                        </Text>
                        {isScholarship && scholarshipBody ? (
                            <Text style={styles.sponsorText}>
                                Sponsored by: {scholarshipBody}
                            </Text>
                        ) : null}
                    </View>

                    {/* Body Text */}
                    <Text style={styles.bodyText}>
                        Further to your application for admission to study at{' '}
                        <Text style={styles.boldText}>{school.name.split("|")[0].trim()}</Text>,
                        I am pleased to inform you that you have been offered {isScholarship ? 'a Scholarship' : 'Provisional'} Admission
                        to undertake the programme below:
                    </Text>

                    {/* Programme Details */}
                    <View style={styles.detailsBox}>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableLabel}>Title of Programme:</Text>
                            <Text style={styles.tableValue}>{dec.CourseName}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableLabel}>Mode of Study:</Text>
                            <Text style={styles.tableValue}>Full-Time</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableLabel}>Admission Type:</Text>
                            <Text style={styles.tableValue}>{dec.AdmissionType}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableLabel}>Term of Admission:</Text>
                            <Text style={styles.tableValue}>{dec.StartMonth} {dec.StartYear}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableLabel}>Course Duration:</Text>
                            <Text style={styles.tableValue}>{applicantCourse.Duration} {applicantCourse.DurationType}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableLabel}>Fee Status:</Text>
                            <Text style={styles.tableValue}>{isScholarship ? 'Scholarship' : 'Home'}</Text>
                        </View>
                    </View>

                    {/* Fees Section */}
                    {!isScholarship && (
                        <View>
                            <Text style={styles.feesHeading}>Fees and Other Costs</Text>
                            <Text style={styles.feesSubtext}>
                                The Tuition Fee for the first year of the programme is stated below:
                            </Text>
                            <View style={styles.feesBox}>
                                <View style={styles.feeRow}>
                                    <Text style={styles.feeLabel}>Tuition Fee (per semester):</Text>
                                    <Text style={styles.feeValue}>{formatNGN(tuitionPerSemester)}</Text>
                                </View>
                                <View style={styles.feeRow}>
                                    <Text style={styles.feeLabel}>Tuition Fee (per session):</Text>
                                    <Text style={styles.feeValue}>{formatNGN(tuitionPerSession)}</Text>
                                </View>
                                <View style={styles.feeRow}>
                                    <Text style={styles.feeLabel}>Accommodation (per semester):</Text>
                                    <Text style={styles.feeValue}>{formatNGN(accommodationFee)}</Text>
                                </View>
                                <View style={styles.feeRow}>
                                    <Text style={styles.feeLabel}>Application Processing Fee:</Text>
                                    <Text style={styles.feeValue}>{formatNGN(applicationFee)}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Scholarship Note */}
                    {isScholarship && scholarshipBody ? (
                        <View style={styles.scholarshipBox}>
                            <Text style={{ fontSize: 10 }}>
                                <Text style={styles.boldText}>Scholarship Information: </Text>
                                Your tuition and related fees are sponsored by{' '}
                                <Text style={styles.boldText}>{scholarshipBody}</Text>.
                                Please ensure compliance with all scholarship requirements and conditions.
                            </Text>
                        </View>
                    ) : null}

                    {/* Closing */}
                    <Text style={styles.closingText}>
                        Please note that this offer of admission is subject to your acceptance of the conditions and undertaking.
                    </Text>
                    <Text style={styles.congratsText}>
                        Please accept my congratulations on your admission!
                    </Text>

                    {/* Signature */}
                    <View style={styles.signatureSection}>
                        <Image src={RegSign} style={styles.signatureImage} />
                        <View style={styles.signatureLine}>
                            <Text style={styles.signatureName}>Mani Ibrahim Ahmad, PhD. FNIM</Text>
                            <Text style={styles.signatureTitle}>Registrar</Text>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Cosmopolitan University, Abuja | www.cosmopolitan.edu.ng | admissions@cosmopolitan.edu.ng
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default CUAdmissionLetterPDF;

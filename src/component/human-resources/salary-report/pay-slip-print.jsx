import React from 'react'
import Logo from "../../../images/logo.png"
import { projectAddress, projectName } from '../../../resources/constants';
import { currencyConverter, currentDate, formatDateAndTime, generate_token } from '../../../resources/constants';


export default function PaySlipPrint(props) {
    const gross_pay = props.data?.salary?.filter(x => x.SalaryType === "Allowance")?.map(e => parseFloat(e.Amount)).reduce((a, b) => a + b, 0)
    const sum_deductions = props.data?.salary?.filter(x => x.SalaryType === "Deduction")?.map(e => parseFloat(e.Amount)).reduce((a, b) => a + b, 0)
    const net_pay = gross_pay - sum_deductions;

    const styles = {
        container: {
            maxWidth: '900px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            padding: '40px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        },
        watermark: {
            position: "absolute",
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            fontSize: '80px',
            fontWeight: '900',
            color: 'rgba(0, 0, 0, 0.03)',
            zIndex: 0,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            userSelect: 'none'
        },
        header: {
            position: 'relative',
            zIndex: 1,
            marginBottom: '30px'
        },
        banner: {
            width: '100%',
            marginBottom: '25px',
            borderRadius: '8px'
        },
        titleSection: {
            backgroundColor: '#f8f9fa',
            padding: '20px 25px',
            borderRadius: '8px',
            marginBottom: '25px',
            borderLeft: '4px solid #0d6efd'
        },
        infoCard: {
            backgroundColor: '#ffffff',
            border: '1px solid #e3e6ef',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '25px'
        },
        infoRow: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px',
            paddingBottom: '12px',
            borderBottom: '1px solid #f1f3f5'
        },
        label: {
            color: '#6c757d',
            fontSize: '13px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        value: {
            color: '#212529',
            fontSize: '14px',
            fontWeight: '600'
        },
        table: {
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0',
            marginBottom: '25px',
            border: '1px solid #e3e6ef',
            borderRadius: '8px',
            overflow: 'hidden'
        },
        tableHeader: {
            backgroundColor: '#0d6efd',
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        tableHeaderCell: {
            padding: '15px 20px',
            textAlign: 'left'
        },
        tableRow: {
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #f1f3f5'
        },
        tableRowEven: {
            backgroundColor: '#f8f9fa'
        },
        tableCell: {
            padding: '15px 20px',
            fontSize: '14px',
            color: '#495057'
        },
        summaryCard: {
            backgroundColor: '#f8f9fa',
            border: '2px solid #0d6efd',
            borderRadius: '8px',
            padding: '25px',
            marginBottom: '30px'
        },
        summaryRow: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 0',
            borderBottom: '1px solid #dee2e6'
        },
        summaryLabel: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#6c757d',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        summaryValue: {
            fontSize: '16px',
            fontWeight: '700'
        },
        netPayRow: {
            backgroundColor: '#0d6efd',
            margin: '-25px -25px 0 -25px',
            padding: '20px 25px',
            borderRadius: '0 0 6px 6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        netPayLabel: {
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px'
        },
        netPayValue: {
            color: '#ffffff',
            fontSize: '24px',
            fontWeight: '900'
        },
        footer: {
            marginTop: '40px',
            paddingTop: '25px',
            borderTop: '2px solid #e3e6ef',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
        },
        signatureBox: {
            width: '250px'
        },
        signatureLine: {
            borderTop: '2px solid #212529',
            marginTop: '60px',
            paddingTop: '8px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#6c757d',
            fontWeight: '600'
        },
        confidentialNote: {
            fontSize: '11px',
            color: '#6c757d',
            fontStyle: 'italic',
            maxWidth: '400px',
            textAlign: 'right',
            lineHeight: '1.6'
        },
        slipId: {
            backgroundColor: '#e7f3ff',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '700',
            color: '#0d6efd',
            display: 'inline-block'
        }
    };


    return (
        <div ref={props.componentRef} style={{ position: 'relative' }}>
            <div style={styles.watermark}>
                {projectName}
            </div>

            <div style={styles.container}>
                <div style={styles.header}>
                    <img
                        src={require('../../../images/banner2.png')}
                        alt="Banner"
                        style={styles.banner}
                    />

                    <div style={styles.titleSection}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '15px'
                        }}>
                            <div>
                                <h1 style={{
                                    margin: '0 0 5px 0',
                                    fontSize: '28px',
                                    fontWeight: '700',
                                    color: '#212529'
                                }}>
                                    Salary Slip
                                </h1>
                                <p style={{
                                    margin: 0,
                                    fontSize: '15px',
                                    color: '#6c757d',
                                    fontWeight: '600'
                                }}>
                                    {formatDateAndTime(props.data?.salary_date, "month_and_year")}
                                </p>
                            </div>
                            <div style={styles.slipId}>
                                SLIP ID: {props.data?.employee_id + generate_token(3)}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={styles.infoCard}>
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{
                            margin: '0 0 15px 0',
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#0d6efd',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Employee Information
                        </h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <div style={styles.infoRow}>
                                <span style={styles.label}>Employee Name</span>
                                <span style={styles.value}>{props.data?.employee_name}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.label}>Employee ID</span>
                                <span style={styles.value}>{props.data.salary[0]?.staff_id}</span>
                            </div>
                            <div style={{ ...styles.infoRow, borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                                <span style={styles.label}>Designation</span>
                                <span style={styles.value}>{props.data.salary[0]?.designation}</span>
                            </div>
                        </div>

                        <div>
                            <div style={styles.infoRow}>
                                <span style={styles.label}>Pay Period</span>
                                <span style={styles.value}>{formatDateAndTime(props.data?.salary_date, "month_and_year")}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.label}>Issue Date</span>
                                <span style={styles.value}>{formatDateAndTime(currentDate, "date")}</span>
                            </div>
                            <div style={{ ...styles.infoRow, borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                                <span style={styles.label}>Processed Date</span>
                                <span style={styles.value}>{formatDateAndTime(props.data?.run_date, "date")}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <h3 style={{
                        margin: '0 0 15px 0',
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#0d6efd',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Earnings & Deductions
                    </h3>

                    <table style={styles.table}>
                        <thead style={styles.tableHeader}>
                            <tr>
                                <th style={{ ...styles.tableHeaderCell, width: '50%' }}>Description</th>
                                <th style={{ ...styles.tableHeaderCell, textAlign: 'right', width: '25%' }}>Earnings</th>
                                <th style={{ ...styles.tableHeaderCell, textAlign: 'right', width: '25%' }}>Deductions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                props.data.salary.length > 0 &&
                                props.data.salary.map((x, i) => {
                                    return (
                                        <tr
                                            key={i}
                                            style={i % 2 === 0 ? styles.tableRow : { ...styles.tableRow, ...styles.tableRowEven }}
                                        >
                                            <td style={styles.tableCell}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <span style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        backgroundColor: x.SalaryType === "Allowance" ? '#198754' : '#dc3545',
                                                        marginRight: '12px',
                                                        flexShrink: 0
                                                    }}></span>
                                                    <span style={{ fontWeight: '600' }}>{x.ItemName}</span>
                                                </div>
                                            </td>
                                            <td style={{ ...styles.tableCell, textAlign: 'right', color: '#198754', fontWeight: '700' }}>
                                                {x.SalaryType === "Allowance" && currencyConverter(x.Amount)}
                                            </td>
                                            <td style={{ ...styles.tableCell, textAlign: 'right', color: '#dc3545', fontWeight: '700' }}>
                                                {x.SalaryType === "Deduction" && currencyConverter(x.Amount)}
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>

                <div style={styles.summaryCard}>
                    <div style={styles.summaryRow}>
                        <span style={styles.summaryLabel}>Total Earnings</span>
                        <span style={{ ...styles.summaryValue, color: '#198754' }}>
                            {currencyConverter(gross_pay)}
                        </span>
                    </div>

                    <div style={{ ...styles.summaryRow, borderBottom: 'none' }}>
                        <span style={styles.summaryLabel}>Total Deductions</span>
                        <span style={{ ...styles.summaryValue, color: '#dc3545' }}>
                            {currencyConverter(sum_deductions)}
                        </span>
                    </div>

                    <div style={styles.netPayRow}>
                        <span style={styles.netPayLabel}>Net Pay</span>
                        <span style={styles.netPayValue}>{currencyConverter(net_pay)}</span>
                    </div>
                </div>

                <div style={styles.footer}>
                    <div style={styles.signatureBox}>
                        <div style={styles.signatureLine}>
                            Authorized Signature
                        </div>
                    </div>

                    <div style={styles.confidentialNote}>
                        This is a computer-generated payslip and does not require a signature.
                        Please keep this document for your records. For any discrepancies,
                        contact the HR department within 7 days.
                    </div>
                </div>
            </div>
        </div>
    )
}
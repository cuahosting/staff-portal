import React, { useEffect } from "react";
import "jquery/dist/jquery.min.js";
import jsZip from "jszip";
import "datatables.net-dt/js/dataTables.dataTables";
import "datatables.net-dt/css/jquery.dataTables.min.css";
import "datatables.net-buttons/js/dataTables.buttons.js";
import "datatables.net-buttons/js/buttons.colVis.js";
import "datatables.net-buttons/js/buttons.flash.js";
import "datatables.net-buttons/js/buttons.html5.js";
import "datatables.net-buttons/js/buttons.print.js";
import "./data-table.css";
import $ from "jquery";

window.JSZip = jsZip;

export default function AdvancedDataTable(props) {
    const today = new Date();
    const current_date = `${today.getFullYear()}-${
        today.getMonth() + 1 < 10
            ? "0" + (today.getMonth() + 1)
            : today.getMonth() + 1
    }-${
        today.getDate() < 10 ? "0" + today.getDate() : today.getDate()
    }`;
    let tblID = props.tableID ?? "table";
    let report_date = props.date;
    let groupColumn = props.groupCol ?? 0;
    let colSpan = props.colSpan ?? 8;

    let isGrouping = props.isGrouping
        ? {
            order: [[groupColumn, "asc"]],
            drawCallback: function (settings) {
                let api = this.api();
                let rows = api.rows({ page: "current" }).nodes();
                let last = null;

                api
                    .column(groupColumn, { page: "current" })
                    .data()
                    .each(function (group, i) {
                        if (last !== group) {
                            $(rows)
                                .eq(i)
                                .before(
                                    `<tr class="group"><td colspan="${colSpan}" style="background-color: rgba(110, 219, 110, 0.42);" align="center"><h4>${group}</h4></td></tr>`
                                );
                            last = group;
                        }
                    });
            },
        }
        : {};

    let groupColumnVisibility = props.isGrouping
        ? { visible: false, targets: groupColumn }
        : {};

    useEffect(() => {
        if (!$.fn.DataTable.isDataTable("#myTable")) {
            $(document).ready(function () {
                setTimeout(function () {
                    $(`#${tblID}`).DataTable({
                        pagingType: "full_numbers",
                        pageLength: 20,
                        processing: true,
                        dom: "Bfrtip",
                        select: {
                            style: "single",
                        },
                        buttons: [
                            {
                                extend: "pageLength",
                                className: "btn btn-secondary bg-secondary",
                            },
                            {
                                extend: "colvis", // 🔥 THIS ENABLES COLUMN VISIBILITY TOGGLE
                                className: "btn btn-secondary bg-secondary",
                                text: "Columns",
                                postfixButtons: ["colvisRestore"], // adds "Restore" option
                            },                            {
                                extend: "copy",
                                className: "btn btn-secondary bg-secondary",
                            },
                            {
                                extend: "csv",
                                className: "btn btn-secondary bg-secondary",
                            },
                            {
                                extend: "excelHtml5",
                                className: "btn btn-secondary bg-secondary",
                            },
                            {
                                extend: "print",
                                exportOptions: {
                                    columns: (idx, data, node) => {
                                        if (idx === props.groupCol) return true;
                                        return $(node).is(':visible');
                                    },
                                },
                                customize: function (win) {
                                    $(win.document.body).find("h1").remove();
                                    $(win.document.body).find("td").find("a").remove();

                                    $(win.document.body).find("table").prepend(`
            <caption>
                <div style="text-align: center; width: 100%; display: block; margin: auto;">
                    <img src="https://portal.bazeuniversity.edu.ng/assets/img/logo.png" width="80" height="80"/>
                    <br>
                    <h1>BAZE UNIVERSITY
                        <small><br>${props.title ?? "Report"}<br>${report_date ?? current_date}</small>
                    </h1>
                </div>
                <div style="border-bottom: 1px solid #cccccc; display: none"/>
            </caption>
        `);

                                    $(win.document.body).find("th, td").css({
                                        "white-space": "pre-line",
                                        "text-justify": "auto",
                                        border: "1px solid #eeeeee",
                                        "font-size": "11px",
                                        "font-family": "Roboto, Helvetica, Arial, sans-serif",
                                    });

                                    if (props.isGrouping) {
                                        let realGroupColIndex = -1;
                                        const thElements = $(win.document.body).find("table thead tr th");
                                        thElements.each(function (i) {
                                            const text = $(this).text().trim().toLowerCase();
                                            const groupColHeader = props.header[props.groupCol]?.trim().toLowerCase();
                                            if (text === groupColHeader) {
                                                realGroupColIndex = i;
                                                return false;
                                            }
                                        });

                                        if (realGroupColIndex !== -1) {
                                            let lastGroup = null;
                                            const colCount = colSpan;
                                            const rows = $(win.document.body).find("table tbody tr").not(".group");

                                            rows.each(function () {
                                                const row = $(this);
                                                const groupText = row.find(`td:eq(${realGroupColIndex})`).text().trim();
                                                if (lastGroup !== groupText) {
                                                    const groupRow = $(`
                            <tr class="group">
                                <td colspan="${colCount}" style="background-color: rgba(110, 219, 110, 0.42); text-align: center;">
                                    <h4>${groupText}</h4>
                                </td>
                            </tr>
                        `);
                                                    groupRow.insertBefore(row);
                                                    lastGroup = groupText;
                                                }
                                            });

                                            // Hide group column in print
                                            $(win.document.body).find("table tr").each(function () {
                                                $(this)
                                                    .find(`td:eq(${realGroupColIndex}), th:eq(${realGroupColIndex})`)
                                                    .hide();
                                            });
                                        }
                                    }
                                },
                                className: "btn btn-secondary bg-secondary",
                            }
                            ,
                        ],
                        ...isGrouping,
                        fnRowCallback: function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                            var index = iDisplayIndexFull + 1;
                            $("td:first", nRow).html(index);
                            return nRow;
                        },
                        lengthMenu: [
                            [10, 20, 30, 50, -1],
                            [10, 20, 30, 50, "All"],
                        ],
                        columnDefs: [
                            groupColumnVisibility,
                            {
                                targets: 0,
                                render: function (data, type, row, meta) {
                                    return type === "export" ? meta.row + 1 : data;
                                },
                            },
                        ],
                    });
                }, 5000);
            });
        }
    }, []);

    return (
        <table
            id={tblID}
            className="table caption-top myTable align-items-center justify-content-center mb-0"
            style={{ fontSize: "12px" }}
        >
            {props.caption ? (
                <caption>
                    <h1 className="text-end">{props.caption}</h1>
                </caption>
            ) : (
                <></>
            )}
            <thead>
            <tr style={{ border: "1px solid #cccccc" }}>
                {props.header.length > 0 &&
                    props.header.map((item, index) => {
                        return (
                            <th
                                key={index}
                                className="text-uppercase text-dark text-sm font-weight-bolder opacity-7 ps-2"
                                style={{backgroundColor: '#EEEEEE'}}
                            >
                                {item}
                            </th>
                        );
                    })}
            </tr>
            </thead>
            <tbody>{props.body}</tbody>
        </table>
    );
}

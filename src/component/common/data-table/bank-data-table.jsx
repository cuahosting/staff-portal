import React, {useEffect} from "react";
import ReactDOMServer from 'react-dom/server';
import "jquery/dist/jquery.min.js";
import jsZip from 'jszip';
import "datatables.net-dt/js/dataTables.dataTables";
import "datatables.net-dt/css/jquery.dataTables.min.css";
import "datatables.net-buttons/js/dataTables.buttons.js";
import "datatables.net-buttons/js/buttons.colVis.js";
import "datatables.net-buttons/js/buttons.flash.js";
import "datatables.net-buttons/js/buttons.html5.js";
import "datatables.net-buttons/js/buttons.print.js";
import "./style.css";
import $ from "jquery";
import {convertNumbertoWords, currencyConverter} from "../../../resources/constants";
window.JSZip = jsZip;


export default function BankDataTable(props) {
    const today = new Date();
    const current_date = `${today.getFullYear()}-${(today.getMonth()+1) < 10 ? '0'+(today.getMonth()+1) : (today.getMonth()+1)}-${today.getDate() < 10 ? '0'+today.getDate() : today.getDate()}`;
    let tblID = props.tableID ?? "table";
    let report_date = props.date;
    let total_caption = props.caption;
    let total_amount = props.total_amount;
    const signatoryHtml = ReactDOMServer.renderToStaticMarkup(props.signatory);
    let groupColumn = props.groupCol ??  0;
    let isGrouping = props.isGrouping ?
        {
            "order": [[groupColumn, 'asc']],
            "drawCallback": function (settings)  {
                let api = this.api();
                let rows = api.rows({page: 'current'}).nodes();
                let last = null;

                api.column(groupColumn, {page: 'current'}).data().each(function (group, i) {
                    if (last !== group) {
                        $(rows).eq(i).before(
                            '<tr class="group"><td colspan="14" style="background-color: rgba(110, 219, 110, 0.42);" align="center"><h4>' + group + '</h4></td></tr>'
                        );

                        last = group;
                    }
                });
            }
        } : {};
    let groupColumnVisibility = props.isGrouping ? {"visible": false, "targets": groupColumn,} : {};

    useEffect( () => {
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
                                customize: function (win) {
                                    $(win.document.body).find('h1').remove();$(win.document.body).find('td').find('a').remove();
                                    $(win.document.body).find('table').prepend('<caption><div class="flex-container" style="width: 100%; margin: 5px;">' +
                                        `<img src="https://staff.kadpolyodfel.ng/banner2.png" style="width: 100%"/></div>` +
                                        `<div style=" margin-top: 10px; display: block"/>
                                          <p style="font-size: 14px; margin-bottom: 10px">
                                            <b>The Manager</b><br>
                                            Guaranty Trust Bank<br>
                                            Central Area Abuja<br>
                                            Nigeria. <br>

                                          </p>
                                          <center style="font-size: 14px; margin-bottom: 10px"><b>Approved payment to following assigned staffs</b></center>
                                          <p style="font-size: 14px; margin-bottom: 10px">
                                            Debit our account in your Bank (0040098779) with ${convertNumbertoWords(total_amount)} <b>(${currencyConverter(total_amount)})</b> only, and credit the following accounts.
                                          </p>
                                        </div><caption>`);
                                    $(win.document.body).append(`
                                    <div style="page-break-inside: avoid; margin-top: 20px;">
                                      ${signatoryHtml}
                                    </div>
                                  `);
                                    // $(win.document.body).find('th').css('white-space', 'pre-line');
                                    // $(win.document.body).find('td').css('white-space', 'pre-line');
                                    $(win.document.body).find('td').css('text-justify', 'auto');
                                    $(win.document.body).find('td').css('border', '0.5px solid #000000');
                                    $(win.document.body).find('th').css('border', '0.5px solid #000000');
                                    $(win.document.body).find('table').addClass('compact').css('font-size', '11px', 'width', '100%','font-family', 'Roboto, Helvetica, Arial, sans-serif', 'font-weight', '400');
                                    // $(win.document.body).find('table').addClass('wd').css('width', '100px');

                                },
                                className: "btn btn-secondary bg-secondary",
                            },
                        ],
                        ...isGrouping,
                        fnRowCallback: function (
                            nRow,
                            aData,
                            iDisplayIndex,
                            iDisplayIndexFull
                        ) {
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

    return ( <table id={tblID} className="table caption-top myTable align-items-center  justify-content-center mb-0" style={{fontSize: '12px'}}>
            {
                // props.caption ? <div className="hidden-on-print" style={{display: 'none'}}><caption><h1 className="text-end">{props.caption}</h1></caption> </div> : <></>
            }

            <thead>
            <tr style={{border: '0.5px solid #000000'}}>
                {
                    props.header.length > 0 &&  props.header.map((item, index) => {
                        return (
                            <th  style={{border: '0.5px solid #000000'}} key={index} className="text-uppercase text-sm font-weight-bolder bg-secondary opacity-7 ps-2">{item}</th>
                        )
                    })
                }
            </tr>
            </thead>
            <tbody>
            {props.body}
            </tbody>
        </table>
    )

}
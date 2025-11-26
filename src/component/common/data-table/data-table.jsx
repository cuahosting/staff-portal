import React, {useEffect} from "react";
import "jquery/dist/jquery.min.js";
import jsZip from 'jszip';
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

export default function DataTable(props) {
    const today = new Date();
    const current_date = `${today.getFullYear()}-${(today.getMonth()+1) < 10 ? '0'+(today.getMonth()+1) : (today.getMonth()+1)}-${today.getDate() < 10 ? '0'+today.getDate() : today.getDate()}`;
    let tblID = props.tableID ?? "table";
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
                                    $(win.document.body).find('table').prepend('<caption><div style="text-align: center; width: 100%;  display: block; margin: auto;">' +
                                        `<img src="https://staff.kadpolyodfel.ng/banner2.png" style="width: 100%"/><br><br>
                                        <h3>${props.title ?? "Report"}</h3><br><div>${current_date}</div>
                                        </div>` +
                                        '<div style="border-bottom: 1px solid #cccccc; display: none"/></div><caption>');
                                    // $(win.document.body).find('th').css('white-space', 'pre-line');
                                    // $(win.document.body).find('td').css('white-space', 'pre-line');
                                    $(win.document.body).find('td').css('text-justify', 'auto');
                                    $(win.document.body).find('td').css('border', '1px solid #eeeeee', 'width', '33.33%');
                                    $(win.document.body).find('table').addClass('compact').css('font-size', '11px', 'width', '100%','font-family', 'Roboto, Helvetica, Arial, sans-serif', 'font-weight', '400');
                                    // $(win.document.body).find('table').addClass('wd').css('width', '100px');

                                },
                                className: "btn btn-secondary",
                            },
                        ],

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
                            {
                                targets: 0,
                                render: function (data, type, row, meta) {
                                    return type === "export" ? meta.row + 1 : data;
                                },
                            },
                        ],
                    });
                }, 1000);
            });
        }
    }, [""]);

    return ( <table id={tblID} className="table caption-top myTable align-items-center  justify-content-center mb-0">
                    <thead>
                    <tr>
                        {
                            props.header.length > 0 &&  props.header.map((item, index) => {
                                return (
                                        <th key={index} className="text-capitalize text-dark text-sm font-weight-bold opacity-7 ps-2">{item}</th>
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
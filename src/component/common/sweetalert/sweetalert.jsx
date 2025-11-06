import React from "react";
import swal from "sweetalert";

export function showAlert(title, msg, type, btnName = "OK") {
  // type: error, success, warning, confirm
  return swal({
    title: title,
    text: msg,
    icon: type,
    button: btnName,
  });
}


export function  showConfirm(title, msg, type, action, button = true)  {
  // type: error, success, warning, confirm
  return swal({
    title: title,
    text: msg,
    icon: type,
    buttons: button,
    dangerMode: true,
  })
}

export function  showContentAlert(title)  {
  // type: error, success, warning, confirm
  return swal({
    text: title,
    label: "Requested By: (Staff ID)",
    content: "input",
    button: {
      Submit: "Submit",
      cancel: "Close",
      closeModal: false,
    },
  })
}


export function showConfirmAndContinue(){
  return swal.fire({
    title: 'Do you want to save the changes?',
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: 'Save',
    denyButtonText: `Don't save`,
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      swal.fire('Saved!', '', 'success')
    } else if (result.isDenied) {
      swal.fire('Changes are not saved', '', 'info')
    }
  })
}

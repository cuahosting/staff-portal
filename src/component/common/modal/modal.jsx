import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Modal(props) {
  return (
    <div
      className="modal fade"
      id={`${typeof props.id !== "undefined" ? props.id : "kt_modal_general"}`}
      tabIndex="-1"
      aria-hidden="true"
    >
      <AnimatePresence>
        <motion.div
          className={`modal-dialog modal-dialog-centered ${typeof props.large !== "undefined" ? "mw-1000px" : "mw-650px"
            }`}
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
        >
          <div className="modal-content">
            <div className="modal-header" id="kt_modal_add_customer_header">
              <h2 className="fw-bolder">{props.title}</h2>
              <div
                className="btn btn-sm btn-icon btn-active-color-primary closeModal"
                data-bs-dismiss="modal"
                id={`${typeof props.close !== "undefined" ? props.close : "closeModal"
                  }`}
                onClick={() => props.onClose && props.onClose()}
              >
                <span id="closeModal" className="svg-icon svg-icon-1 closeModal">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <rect
                      opacity="0.5"
                      x="6"
                      y="17.3137"
                      width="16"
                      height="2"
                      rx="1"
                      transform="rotate(-45 6 17.3137)"
                      fill="currentColor"
                    />
                    <rect
                      x="7.41422"
                      y="6"
                      width="16"
                      height="2"
                      rx="1"
                      transform="rotate(45 7.41422 6)"
                      fill="currentColor"
                    />
                  </svg>
                </span>
              </div>
            </div>
            <div className="modal-body py-10 px-lg-17">
              <div
                className="scroll-y me-n7 pe-7"
                id="kt_modal_add_customer_scroll"
                data-kt-scroll="true"
                data-kt-scroll-activate="{default: false, lg: true}"
                data-kt-scroll-max-height="auto"
                data-kt-scroll-dependencies="#kt_modal_add_customer_header"
                data-kt-scroll-wrappers="#kt_modal_add_customer_scroll"
                data-kt-scroll-offset="300px"
              >
                {props.children}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

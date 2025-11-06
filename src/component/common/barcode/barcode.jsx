import React from "react";
import "./barcode.css";

import Barcode from "react-hooks-barcode";

function BarcodeImage({value, height, width}) {
    const config = {
        background: "#ffffff",
        width: width,
        height: height,
        displayValue: true,
        renderer: "img",
    };

    return (
        <div className="BarcodeContainer">
            <Barcode value={value} {...config} />
        </div>
    );
}

export default BarcodeImage;
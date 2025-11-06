import { projectCode } from "../../../resources/constants";

const CryptoJS = require("crypto-js");

export function encryptData(string, val = false) {
  try {
    let secret_key = val === false ? "SayyoFilms" : projectCode;
    let secret_iv = val === false ? "FilmsInternational" : projectCode;
    // hash
    let kee = CryptoJS.SHA256(secret_key);
    let ivv = CryptoJS.SHA256(secret_iv).toString().substr(0, 16);

    kee = CryptoJS.enc.Utf8.parse(kee.toString().substr(0, 32));
    ivv = CryptoJS.enc.Utf8.parse(ivv);

    let decrypted = CryptoJS.AES.encrypt(string, kee, { iv: ivv });

    let result = decrypted.toString();
    return btoa(result);
  }catch (e) {
    console.log(e)
  }
}

export function decryptData(string, val = false) {
  try {
    let secret_key = val === false ? "SayyoFilms" : projectCode;
    let secret_iv = val === false ? "FilmsInternational" : projectCode;
    // hash
    let kee = CryptoJS.SHA256(secret_key);
    let ivv = CryptoJS.SHA256(secret_iv).toString().substr(0, 16);

    kee = CryptoJS.enc.Utf8.parse(kee.toString().substr(0, 32));
    ivv = CryptoJS.enc.Utf8.parse(ivv);

    var decrypted = CryptoJS.AES.decrypt(atob(string), kee, { iv: ivv });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }catch (e) {
    console.log(e)
  }
}

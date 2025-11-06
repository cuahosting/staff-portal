import { serverLink } from "./url";
import axios from "axios";
import './email.css'

const CryptoJS = require("crypto-js");
//
// export const projectName = "Baba Ahmed University | Staff Portal";
// export const projectCode = "BABA_AHMED_UNIVERSITY_STAFF_PORTAL";
// export const shortCode = "BAUK";
// export const projectURL = "https://babaahmeduniversity.edu.ng";
// export const projectStaffURL = "https://staff.babaahmeduniversity.edu.ng";
// export const projectStudentURL = "https://student.babaahmeduniversity.edu.ng";
// export const projectJobsURL = "https://jobs.babaahmeduniversity.edu.ng";
// export const projectLogo = "https://babaahmeduniversity.edu.ng/logo.png";
// export const projectPhone = "+2348035125748, +2348087555544";
// export const projectEmail = "info@babaahmeduniversity.edu.ng";
// export const projectHREmail = "hr@babaahmeduniversity.edu.ng";
// export const projectAddress = "No 306, Sharada Phase I Kano State, Nigeria.";
// export const projectTwitter = " https://twitter.com/";
// export const projectFacebook = "https://www.facebook.com/";
// export const projectYoutube = "https://www.youtube.com/";
// export const projectViceChancellor = "Adamu Idris Tanko";
// export const schoolName = "Baba Ahmed University, Kano";
// export const projectPaymentURL = "";


// export const projectName = "Olivia University | Staff Portal";
// export const projectCode = "OLIVIA_UNIVERSITY_STAFF_PORTAL";
// export const shortCode = "OUB";
// export const projectLogo = "https://oliviauniversity.com/logo.png";
// export const projectStaffURL = "https://staff.oliviauniversity.com";
// export const projectStudentURL = "https://student.oliviauniversity.com/";
// export const projectJobsURL = "https://jobs.oliviauniversity.com";
// export const projectURL = "https://oliviauniversity.com";
// export const projectPhone = "+25767800004";
// export const projectEmail = "info@oliviauniversity.com";
// export const projectHREmail = "hr@oliviauniversity.com";
// export const projectAddress = "No 4&5, Avenue Mayugi, Mukaza, Bujumbura, Burundi";
// export const projectTwitter = " https://twitter.com/search?q=%23OliviaUniversity&src=typed_query";
// export const projectFacebook = "https://www.facebook.com/Olivia-University-Bujumbura-103773839028110/";
// export const projectYoutube = "https://www.youtube.com/user/oliviauniversity";
// export const projectViceChancellor="Rev Fr Prof Obi J. Oguejiofor"
// export const schoolName = "Olivia University, Burundi";
// export const projectPaymentURL = "";



// export const projectName = "Al-Ansar University | Staff Portal";
// export const projectCode = "ALANSAR_UNIVERSITY_STAFF_PORTAL";
// export const shortCode = "AUM";
// export const projectURL = "https://aum.edu.ng";
// export const projectStaffURL = "https://staff.aum.edu.ng";
// export const projectStudentURL = "https://student.aum.edu.ng";
// export const projectJobsURL = "https://jobs.aum.edu.ng";
// export const projectLogo = "https://aum.edu.ng/logo.png";
// export const projectPhone = "+234 803 629 5382";
// export const projectEmail = "info@aum.edu.ng";
// export const projectHREmail = "hr@aum.edu.ng";
// export const projectAddress = "Maiduguri, Borno State, Nigeria.";
// export const projectTwitter = " https://twitter.com/";
// export const projectFacebook = "https://www.facebook.com/";
// export const projectYoutube = "https://www.youtube.com/";
// export const projectViceChancellor = "Prof. Abubakar Musa Kunduri";
// export const schoolName = "Al-Ansar University, Maiduguri";
// export const projectPaymentURL = "https://payment.aum.edu.ng";



// export const projectName = "Lux Mundi University | Staff Portal";
// export const projectCode = "LUX_MUNDI_UNIVERSITY_STAFF_PORTAL";
// export const shortCode = "LMU";
// export const projectURL = "https://luxmundi.edu.ng";
// export const projectStaffURL = "https://staff.luxmundi.edu.ng";
// export const projectStudentURL = "https://student.luxmundi.edu.ng";
// export const projectJobsURL = "https://jobs.luxmundi.edu.ng";
// export const projectLogo = "https://luxmundi.edu.ng/logo.png";
// export const projectPhone = "+234 803 xxx xxxx";
// export const projectEmail = "info@luxmundi.edu.ng";
// export const projectHREmail = "hr@luxmundi.edu.ng";
// export const projectAddress = "Umuahia, Abia State";
// export const projectTwitter = " https://twitter.com/";
// export const projectFacebook = "https://www.facebook.com/";
// export const projectYoutube = "https://www.youtube.com/";
// export const projectViceChancellor = "Prof. xxx xxx";
// export const schoolName = "Lux Mundi University, Umuahia";
// export const projectPaymentURL = "";


export const projectName = "Cosmopolitan University | Staff Portal";
export const projectCode = "COSMOPOLITAN_UNIVERSITY_STAFF_PORTAL";
export const shortCode = "CU";
export const projectURL = "https://cosmopolitan.edu.ng";
export const projectStaffURL = "https://staff.cosmopolitan.edu.ng";
export const projectStudentURL = "https://student.cosmopolitan.edu.ng";
export const projectJobsURL = "https://jobs.cosmopolitan.edu.ng";
export const projectLogo = "https://cosmopolitan.edu.ng/logo.png";
export const projectPhone = "+234 805 208 0828";
export const projectEmail = "info@cosmopolitan.edu.ng";
export const projectHREmail = "hr@cosmopolitan.edu.ng";
export const projectAddress = "Central Area Abuja, Nigeria ";
export const projectTwitter = " https://twitter.com/";
export const projectFacebook = "https://www.facebook.com/";
export const projectYoutube = "https://www.youtube.com/";
export const projectViceChancellor = "Prof. Carl Adams";
export const schoolName = "Cosmopolitan University, Abuja";
export const projectPaymentURL = "https://payment.cosmopolitan.edu.ng";


let domain = "";
switch (projectCode)
{
  case "OLIVIA_UNIVERSITY_STAFF_PORTAL":
    domain = "@oliviauniversity.com";
    break;
  case "BABA_AHMED_UNIVERSITY_STAFF_PORTAL":
    domain = "@babaahmeduniversity.edu.ng";
    break;
  case "ALANSAR_UNIVERSITY_STAFF_PORTAL":
    domain = "@aum.edu.ng";
    break;
  case "LUX_MUNDI_UNIVERSITY_STAFF_PORTAL":
    domain = "@luxmundi.edu.ng";
    break;
  case "COSMOPOLITAN_UNIVERSITY_STAFF_PORTAL":
    domain = "@cosmopolitan.edu.ng";
    break;
  default:
    domain = "";
}
export const projectDomain = domain;

export const formatDateAndTime = (date, option) =>
{
  if (date !== null)
  {
    const user_date = new Date(date);
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthNamesShort = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const day =
      user_date.getDate() < 10
        ? "0" + user_date.getDate()
        : user_date.getDate();
    const hour =
      user_date.getHours() < 10
        ? "0" + user_date.getHours()
        : user_date.getHours();
    const min =
      user_date.getMinutes() < 10
        ? "0" + user_date.getMinutes()
        : user_date.getMinutes();
    const sec =
      user_date.getSeconds() < 10
        ? "0" + user_date.getSeconds()
        : user_date.getSeconds();

    let date_string = "";
    if (option === "date_and_time")
      date_string = `${day}-${monthNames[user_date.getMonth()]
        }-${user_date.getFullYear()} : ${hour}:${min}:${sec}`;
    else if (option === "date")
      date_string = `${day}-${monthNames[user_date.getMonth()]
        }-${user_date.getFullYear()}`;
    else if (option === "day") date_string = day;
    else if (option === "full_month")
      date_string = monthNames[user_date.getMonth()];
    else if (option === "short_month")
      date_string = monthNamesShort[user_date.getMonth()];
    else if (option === "year_only") date_string = user_date.getFullYear();
    else if (option === "month_and_year") date_string = monthNames[user_date.getMonth()] + " " + user_date.getFullYear()

    return date_string;
  } else
  {
    return "--";
  }
};

export const formatDate = (date) =>
{
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

export const currencyConverter = (amount) =>
{
  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });
  return formatter.format(amount);
};

export const sendEmail = (email, subject, title, name, body, signature) =>
{
  const sendEmail = {
    logo: projectLogo,
    from: projectEmail,
    to: email,
    subject: subject,
    title: title,
    name: name,
    body: body,
    signature: signature,
  };
  axios.post(`${serverLink}send_email/send`, sendEmail).then((r) =>
  {
    console.log("email sent");
  });

  return "sent";
};

export const admissionEmail = (
  email,
  app_id,
  subject,
  title,
  name,
  body,
  signature
) =>
{
  const sendEmail = {
    logo: projectLogo,
    from: projectEmail,
    to: email,
    app_id,
    subject: subject,
    title: title,
    name: name,
    body: body,
    signature: signature,
  };
  axios.post(`${serverLink}send_email/send`, sendEmail).then((r) =>
  {
    console.log("email sent");
  });

  return "sent";
};

export function encryptData(string, val = false)
{
  try
  {
    let secret_key =
      val === false
        ? "BABA_AHMED_UNIVERSITY_STAFF_PORTAL" + "_ENCRYPT"
        : projectCode;
    let secret_iv =
      val === false
        ? "BABA_AHMED_UNIVERSITY_STAFF_PORTAL" + "_ENCRYPT_IV"
        : projectCode;
    // hash
    let kee = CryptoJS.SHA256(secret_key);
    let ivv = CryptoJS.SHA256(secret_iv).toString().substr(0, 16);

    kee = CryptoJS.enc.Utf8.parse(kee.toString().substr(0, 32));
    ivv = CryptoJS.enc.Utf8.parse(ivv);

    let decrypted = CryptoJS.AES.encrypt(string, kee, { iv: ivv });

    let result = decrypted.toString();
    return btoa(result);
  } catch (e)
  {
    console.log(e)
  }
}

export function decryptData(string, val = false)
{
  try
  {
    let secret_key =
      val === false
        ? "BABA_AHMED_UNIVERSITY_STAFF_PORTAL" + "_ENCRYPT"
        : projectCode;
    let secret_iv =
      val === false
        ? "BABA_AHMED_UNIVERSITY_STAFF_PORTAL" + "_ENCRYPT_IV"
        : projectCode;
    // hash
    let kee = CryptoJS.SHA256(secret_key);
    let ivv = CryptoJS.SHA256(secret_iv).toString().substr(0, 16);

    kee = CryptoJS.enc.Utf8.parse(kee.toString().substr(0, 32));
    ivv = CryptoJS.enc.Utf8.parse(ivv);

    var decrypted = CryptoJS.AES.decrypt(atob(string), kee, { iv: ivv });

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (e)
  {
    console.log(e)
  }
}

export const TimeTablePeriods = [
  { value: "6", label: "6:00 am" },
  { value: "7", label: "7:00 am" },
  { value: "8", label: "8:00 am" },
  { value: "9", label: "9:00 am" },
  { value: "10", label: "10:00 am" },
  { value: "11", label: "11:00 am" },
  { value: "12", label: "12:00 pm" },
  { value: "13", label: "1:00 pm" },
  { value: "14", label: "2:00 pm" },
  { value: "15", label: "3:00 pm" },
  { value: "16", label: "4:00 pm" },
  { value: "17", label: "5:00 pm" },
  { value: "18", label: "6:00 pm" },
  { value: "19", label: "7:00 pm" },
  { value: "20", label: "8:00 pm" },
  { value: "21", label: "9:00 pm" },
];

export const EmailTemplates = (type, interview) =>
{
  if (type === "1")
  {
    const message = {
      subject: "JOB APPLICATION",
      title: "Invitation to Interview",
      body: `<div style="line-height: 1.6">Dear Applicant,<br/> we are pleased to invite you to an interview following your application for position of ${interview.Position} <br/>The Interview is set to take place as follows. <br/>Date: ${interview.InterviewDate} <br/>Vanue: ${interview.InterviewVenue} <br/>Time: ${interview.InterviewTime} <br/>For further enquiries, please contact ${projectHREmail}</div>`,
    };
    return message;
  } else if (type === "2")
  {
    const message = {
      subject: "JOB APPLICATION",
      title: "",
      body: `<div style="line-height: 1.6">Dear ${interview.applicantName
        }, <br/> Thank you for your application for employment at ${projectName.split("|")[0]
        }. After careful examination of your curriculum vitae and other supporting documents you submitted, the management of ${projectName.split("|")[0]
        } regrets to inform you that your application for employment at ${projectName.split("|")[0]
        } has been rejected. <br/>
          It may be that your area of training, expertise or skillset, does not meet ${projectName.split("|")[0]
        }’s needs presently; or that we have already filled that position at ${projectName.split("|")[0]
        }. Since we already have your application material, we will retain the same in our records, in the event that there is an opening, you may be contacted; assuming your continued availability.<br/>
          Once again, thank you for your interest in working at ${projectName.split("|")[0]
        }. We wish you success in all your career endeavors.<br/>
          Sincerely,<br/><br/>
          Employment Officer,<br/>
          Office of Human Resources<br/>
          ${projectName.split("|")[0]}<br/>
          ${projectAddress}</div>`,
    };
    return message;
  }
  else if (type === "3")
  {
    const message = {
      subject: "JOB APPLICATION",
      title: "Offer of Appointment",
      body: `<div style="line-height: 1.6">Congratulations, <br/> we are pleased to notify you that you have been offered appointment with ${projectName.split("|")[0]} as <strong>${interview.Position}</strong>. <br/>You are to report at the Human Resource Department for documentation within two weeks from the date of this email. <br/>If you accept this offer, kindly follow this <a href="${projectURL}/enrol/${interview.applicationID}">link</a> to enroll before reporting at the HR. <br/>Failure to report within the specified period would render this offer void. <br/><br/>For further enquiries, please contact ${projectHREmail}</div>`,
    };
    return message;
  }
  else if (type === "4")
  {
    const message = {
      subject: "STAFF PROFILE",
      title: "Confirmation of Resumption",
      body: `<div style="line-height: 1.6">
      Welcome to ${projectName.split("|")[0]}!. 
      <br/><strong>Your  Employee Identification Number is ${interview.StaffID}.</strong>
      <br/>Kindly find below login details for : 
      <br/>
      <br/><strong>1. Internet Portal:</strong>
      <br/>Click the <a href="${projectStaffURL}">link</a> or copy and paste ${projectStaffURL} in your browser.
      <br/>Username: ${interview.StaffID
        }<br/>Password: ${interview.PhoneNumber
        }<br/>Please endeavour to change your password to ensure full ownership of the account. 
      <br/>
      <br/><strong>2. Official Email Address<br/>Email:</strong> ${interview.OfficialEmailAddress
        }<br/>Password: ${interview.PhoneNumber
        }<br/>Please endeavour to change your password to ensure full ownership of the account.
      <br/>
      <br/><strong>3. Staff Portal</strong>
      <br/>UserID: ${interview.StaffID
        }<br/>Password: ${interview.PhoneNumber
        }<br/>Please endeavour to change your password to ensure full ownership of the account.<br/><br/>If you are not able to login, call the Administrator on extension 105 or send email to ${projectHREmail}<br/><br/>For any complains or enquiry contact IT services Department via intercom ext 1081/1152 or drop in at Block A, Room A23.<br/>Thank you and have a wonderful time @ ${projectName.split("|")[0]
        }. <br/>${projectHREmail}<br/>${projectPhone}</div>`,
    };
    return message;
  }
  else if (type === "5")
  {
    const message = {
      subject: "Staff Portal",
      title: "password recovery",
      body: `<div style="line-height: 1.6">
      You have requested to reset your password, kindly follow this <a href='${projectStaffURL}/reset-password/${interview}'>link</a> to reset your password.
       <br/><br/>For further enquiries, please contact <b/>${projectEmail}<br/>${projectPhone}
      </div>`,
    };
    return message;
  }
};

export const InventoryEmailTemplates = (type, data) =>
{
  let total = 0;
  const item_data = () =>
  {
    const rows = data.Items.map((item, index) =>
    {
      total += + item.total;
      return `
      <tr>
        <td style="padding: 5px;">${item.item_name}</td>
        <td style="padding: 5px;">${item.quantity}</td>
        <td style="padding: 5px;">${currencyConverter(item.amount)}</td>
        <td style="padding: 5px;">${currencyConverter(item.total)}</td>
      </tr>
    `;
    });
    return rows.join('');
  };

  let supplier = data.Supplier;
  let supplier_name = "";
  if (supplier.length > 0)
  {
    supplier_name = supplier[0].name;
  }

  let body = `<div class="email-template" style="font-family: Arial, sans-serif; margin: 0 auto; max-width: 100%; padding: 20px;">
          <table class="email-table" cellpadding="0" cellspacing="0" style="width: 100%;" width="100%">
            <tr>
              <td>
                <h2 class="email-heading" style="color: #333; font-size: 24px; font-weight: bold; margin-bottom: 10px; text-align: center;">
                  ${projectName.split("|")[0]} Purchase Order!
                </h2>
                <p class="email-content" style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 15px;">
                  Dear ${supplier_name},
                  <br><br>
                  We are writing to place a purchase order for the following items to fulfill the inventory needs of our university.<br><br>
                   Please find below the order details:<br>
                  <b>Order Number: </b> ORDER-00${data.request_id}<br>
                  <b> Order Date: </b> ${formatDateAndTime(data.inserted_date, "date")}<br>
                  <b>Delivery Address: </b> ${projectAddress}<br>
                </p>
                <p class="email-content" style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 15px;">
                  <table style="border-collapse: collapse; width: 100%;">
                    <tr style="border-bottom: 1px solid black;">
                      <th style="text-align: left; padding: 5px;">Item</th>
                      <th style="text-align: left; padding: 5px;">Quantity</th>
                      <th style="text-align: left; padding: 5px;">Unit Price</th>
                      <th style="text-align: left; padding: 5px;">Total Price</th>
                    </tr>`;
  body += `<tbody>
          ${item_data()}
        </tbody>`;

  body += `<tr>
            <td colspan="3" style="padding: 5px; text-align: center"><b>TOTAL</b></td>
            <td style="padding: 5px;">${currencyConverter(total)}</td>
          </tr>`;


  body += ` </table>
                </p>
                <p class="email-content" style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 15px;">
                  Please find attached the purchase order in PDF format for your reference and processing. We kindly request you to review the order details and provide an estimated delivery date.<br><br>
                  Please ensure that the items are securely packaged to avoid any damage during transit. Additionally, we would appreciate it if you could include all relevant invoices, packing slips, and any other necessary documentation with the shipment.<br><br>
                
                Kindly include the payment instructions and any applicable discounts or taxes in the invoice.<br> <br>
                
                If you have any questions or require further clarification, please do not hesitate to contact us at <a href="${projectEmail}">${projectEmail}</a>  or <a href="tel:${projectPhone}">${projectPhone}</a>.<br> <br>
                
                Thank you for your prompt attention to this matter. We look forward to receiving the shipment at the earliest convenience.<br> 
            </p>
            <p class="email-content" style="color:#555; font-size:16px; line-height:1.5; margin-bottom:0">
              Sincerely,<br> <br>
    
              ${data.staff_name}<br> 
              ${projectName.split("|")[0]}<br> 
              ${projectAddress}
            </p>
          </td>
        </tr>
      </table>
    </div>`;

  if (type === "1")
  {
    const message = {
      subject: "Purchase Order",
      title: "",
      body: body
    };
    return message;
  }
}

export const AdmissionSuccessfulEmailTemplate = () =>
{
  return `I am delighted to inform you that you have been admitted to ${projectName.split("|")[0]
    }; to pursue an undergraduate degree in your chosen field or discipline of study.<br/>
            You will be required to provide a signed and dated Undertaking as part of your acceptance letter for your admission to ${projectName.split("|")[0]
    }.<br/>
            Kindly login to the <a href='${projectURL}/admission/application/login'>application portal</a> to download your admission letter<br/>
            We look forward to your joining the ${projectName.split("|")[0]
    } Family and having an exciting and illustrious educational experience at ${projectName.split("|")[0]
    }!<br/>
            Best wishes,&nbsp;<br/>
            Registrar,<br/>
            ${projectName.split("|")[0]}<br/>
            ${projectAddress},<br/>`;
};

export const ChangeOfCourseEmail = (data, new_id) =>
{
  const message = {
    subject: "Change of Course",
    title: "Change of Course",
    body: `<div style="line-height: 1.6">
    Your Request for change of course have been approved. <br/>
    Your new course is ${data.RequestedCourseName}. <br/>
    Your new Student ID is ${new_id}.
    <p>*To Login to your student portal, use your new studentID. Your password remains thesame.<br/>
    You may also change the password if you wish.</p>
    <h3 style="padding-top: 20px"><strong>Helpful Links</strong></h3>
    <p>Website: ${projectURL}</p>
    <p>Twitter: ${projectTwitter}</p>
    <p>Facebook: ${projectFacebook}</p>
    <p>Youtube: ${projectYoutube}</p> 
        <br/>
        Regards,<br/>Admissions Officer<br/>${shortCode}  
    </div>`,
  };
  return message;
};

export const CuAdmissionEmail = (data) =>
{
  const appInfo = data.appInfo;
  const decision = data.decision;

  const message = {
    subject: "OFFER OF ADMISSION",
    title: "OFFER OF ADMISSION",
    body: `
    <div>
      <p>
        We are pleased to notify you that after a successful application process, you have been considered for admission into ${appInfo.course[0]?.CourseClass} ${decision?.CourseName} at Cosmopolitan University in the ${new Date().getFullYear()}/${parseInt(new Date().getFullYear()) + 1} academic session.  We are confident that you will thrive in this academic environment and utilize the opportunities for personal and intellectual growth that Cosmopolitan has to offer. <br/>
        Congratulations.
        <br/><br/>
        Here are some information to assist you in the next steps towards transition as a student of Cosmopolitan University.<br/><br/>
        <b>Orientation and Induction: </b><br/>
        On resumption, there will be an orientation and induction program designed to help you acclimate to life at Cosmopolitan. You will receive further updates about orientation dates and activities in the coming weeks.
        We understand that this is an important decision and we encourage you to reach out if you have any questions or need additional information. Our Admissions Team is here to assist you. <br/><br/>
        <b>To Download your Admission Letter:</b> <br/>
        Log in to your account on the admission portal to download your admission letter. You can access the portal via this link - <a target="_blank" href="https://admission.cosmopolitan.edu.ng">https://admission.cosmopolitan.edu.ng</a>
        We are excited about the prospect of you joining our Cosmopolitan community and contributing to our vibrant academic environment. Once again, congratulations on your admission and we look forward to receiving you on campus.
        <br/>
        <br/>
        Mani Ibrahim Ahmad, PhD. FNIM<br/>
        Registrar,<br/>
        Cosmopolitan University Abuja
      </p>
    </div>

    `
  }
  return message
}

export const Audit = (staff_id, message, header = '') =>
{
  axios
    .post(`${serverLink}staff/settings/audit/add`, {
      StaffID: staff_id,
      Action: message,
    }, header)
    .then((r) => { });
};


export function removeSpace(str)
{
  str = str.replace(/\s/g, '')
  return str;
}


var th_val = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];
var dg_val = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
var tn_val = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
var tw_val = ['Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

export function convertNumbertoWords(s)
{
  s = s.toString();
  s = s.replace(/[\, ]/g, '');
  if (s != parseFloat(s))
    return 'not a number ';
  var x_val = s.indexOf('.');
  if (x_val == -1)
    x_val = s.length;
  if (x_val > 15)
    return 'too big';
  var n_val = s.split('');
  var str_val = '';
  var sk_val = 0;
  for (var i = 0; i < x_val; i++)
  {
    if ((x_val - i) % 3 == 2)
    {
      if (n_val[i] == '1')
      {
        str_val += tn_val[Number(n_val[i + 1])] + ' ';
        i++;
        sk_val = 1;
      } else if (n_val[i] != 0)
      {
        str_val += tw_val[n_val[i] - 2] + ' ';
        sk_val = 1;
      }
    } else if (n_val[i] != 0)
    {
      str_val += dg_val[n_val[i]] + ' ';
      if ((x_val - i) % 3 == 0)
        str_val += 'Hundred ';
      sk_val = 1;
    }
    if ((x_val - i) % 3 == 1)
    {
      if (sk_val)
        str_val += th_val[(x_val - i - 1) / 3] + ' ';
      sk_val = 0;
    }
  }
  if (x_val != s.length)
  {
    var y_val = s.length;
    str_val += 'point ';
    for (var i = x_val + 1; i < y_val; i++)
      str_val += dg_val[n_val[i]] + ' ';
  }
  return str_val.replace(/\s+/g, ' ');
}


const date = new Date();

let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();

export const currentDate = `${year}-${month}-${day}`;

export const sumObjectArray = (array, amount) =>
{
  return array.map(item => item[amount]).reduce((prev, next) => prev + next)
}

export function dynamicSort(property)
{
  var sortOrder = 1;
  if (property[0] === "-")
  {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a, b)
  {
    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    return result * sortOrder;
  }
}

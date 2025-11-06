const MailTemplates = (type, interview) => {
    if (type === '1') {
        const message = {
            subject: 'JOB APPLICATION',
            title: 'Invitation to Interview',
            body: `<div style="line-height: 1.6">Dear Applicant,<br/> we are pleased to invite you to an interview following your application for position of ${interview.Position} <br/>The Interview is set to take place as follows. <br/>Date: ${interview.InterviewDate} <br/>Vanue: ${interview.InterviewVenue} <br/>Time: ${interview.InterviewTime} <br/>For further enquiries, please contact hr@bazeuniversity.edu.ng</div>`
        }
        return message;
    }
    else if (type === '2') {
        const message = {
            subject: 'JOB APPLICATION',
            title: '',
            body: `<div style="line-height: 1.6">Dear ${interview.applicantName}, <br/> Thank you for your application for employment at OUB. After careful examination of your curriculum vitae and other supporting documents you submitted, the management of OUB regrets to inform you that your application for employment at OUB has been rejected. <br/>
            It may be that your area of training, expertise or skillset, does not meet OUB’s needs presently; or that we have already filled that position at OUB. Since we already have your application material, we will retain the same in our records, in the event that there is an opening, you may be contacted; assuming your continued availability.<br/>
            Once again, thank you for your interest in working at OUB. We wish you success in all your career endeavors.<br/>
            Sincerely,<br/><br/>
            Employment Officer,<br/>
            Office of Human Resources<br/>
            Olivia University<br/>
            Bujumbura (OUB), Burundi</div>`
        }
        return message;
    }
    else if (type === '3') {
        const message = {
            subject: 'JOB APPLICATION',
            title: 'Offer of Appointment',
            body: `<div style="line-height: 1.6">Congratulations, <br/> we are pleased to notify you that you have been offered appointment with Baze University as <strong>${interview.Position}</strong>. <br/>You are to report at the Human Resource Department for documentation within two weeks from the date of this email. <br/>Failure to report within the specified period would render this offer void. <br/><br/>For further enquiries, please context hr@bazeuniversity.edu.ng</div>`
        }
        return message;
    } else if (type === '4') {
        const message = {
            subject: 'STAFF DETAILS',
            body: `<div style="line-height: 1.6">Dear ${interview.fullname},<br/>Welcome to Baze University!. Your  Employee Identification Number is ${interview.staff_id}.<br/><br/>Kindly find below login details for : <br/><br/>1. Internet Portal:<br/>Click the link or copy and paste ${`https://portal.bazeuniversity.edu.ng/staff_enrolment/#/portal`} in your browser.<br/>Username: ${interview.staff_id}<br/>Password: Baze1234@@<br/>Please endeavour to change your password to ensure full ownership of the account. <br/><br/>2.Baze University Email Address<br/>Email: ${interview.bazeEmail}<br/>Password: baze1234.<br/>Please endeavour to change your password to ensure full ownership of the account.<br/><br/>3. Staff Portal<br/>UserID: ${interview.staff_id}<br/>Password: 123456<br/>Please endeavour to change your password to ensure full ownership of the account.<br/><br/><br/>If you are not able to login, call the Administrator on extension 105 or send email to servicedesk@bazeuniversity.edu.ng.<br/><br/>Furthermore, You are to pick up your ID card and capture your biometric data at the service desk. <br/>Academic teaching staff are required to create accounts for the University e-Learning Portal (Room A24) and Turnitin accounts (Faculty Offices). <br/><br/>For any issues or enquiry contact IT services Department via intercom ext 1081/1152 or drop in at Block A, Room A23.<br/><br/>Thank you and have a wonderful time @ Baze University. <br/><br/>Faisal Salisu/Rakeeba Bode<br/>For Baze IT Service Desk</div>`
        }
        return message;
    }
};

export default MailTemplates;
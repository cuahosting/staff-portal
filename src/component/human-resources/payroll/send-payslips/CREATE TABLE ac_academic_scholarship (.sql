CREATE TABLE ac_academic_scholarship (
    EntryID INT AUTO_INCREMENT PRIMARY KEY,
    ScholarshipPercentage DECIMAL(5,2),
    StudentID INT NOT NULL,
    SchoolSemesterUsed VARCHAR(50),
    GPA DECIMAL(3,2),
    IsUsed BOOLEAN DEFAULT FALSE,
    UsedDate DATETIME,
    InsertedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate DATETIME NULL
);

CREATE TABLE ac_scholarships (
    EntryID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    StartDate DATE,
    EndDate DATE,
    InsertedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    InsertedBy INT,
    UpdatedDate DATETIME,
    UpdatedBy INT,
    Admission DECIMAL(5,2),
    Tuition DECIMAL(5,2),
    Feeding DECIMAL(5,2),
    Transportation DECIMAL(5,2),
    Accommodation DECIMAL(5,2)
);

CREATE TABLE ac_scholarship_admission (
    EntryID INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(255),
    EmailAddress VARCHAR(255),
    ScholarshipID INT NOT NULL,
    IsUsed BOOLEAN DEFAULT FALSE,
    SchoolSemester VARCHAR(50),
    InsertedBy INT,
    InsertedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedBy INT,
    UpdatedDate DATETIME,
    FOREIGN KEY (ScholarshipID) REFERENCES ac_scholarships(EntryID)
);

CREATE TABLE ac_scholarship_students (
    EntryID INT AUTO_INCREMENT PRIMARY KEY,
    ScholarshipID INT NOT NULL,
    StudentID INT NOT NULL,
    FullName VARCHAR(255),
    EmailAddress VARCHAR(255),
    Semester VARCHAR(50),
    IsActive BOOLEAN DEFAULT TRUE,
    InsertedBy INT,
    InsertedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedBy INT,
    UpdatedDate DATETIME,
    FOREIGN KEY (ScholarshipID) REFERENCES ac_scholarships(EntryID)
);

CREATE TABLE ac_scholarship_used (
    EntryID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID INT NOT NULL,
    ScholarshipID INT NOT NULL,
    Semester VARCHAR(50),
    AdmissionFeeAmount DECIMAL(12,2),
    FeedingFeeAmount DECIMAL(12,2),
    AccommodationFeeAmount DECIMAL(12,2),
    TransportFeeAmount DECIMAL(12,2),
    TuitionFeeAmount DECIMAL(12,2),
    FOREIGN KEY (ScholarshipID) REFERENCES ac_scholarships(EntryID)
);

CREATE TABLE ac_course_schedule_fees (
    EntryID INT AUTO_INCREMENT PRIMARY KEY,
    CourseID INT NOT NULL,
    Level VARCHAR(50),
    Semester VARCHAR(50),
    ScheduleType INT DEFAULT 0 COMMENT "0 NEW, 1 RETURNING", 
    InsertedBy INT,
    InsertedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedBy INT,
    UpdatedDate DATETIME
);

CREATE TABLE ac_schedule_fee_items (
    EntryID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255),
    Description TEXT,
    Amount DECIMAL(12,2),
    InsertedBy INT,
    InsertedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedBy INT,
    UpdatedDate DATETIME
);

CREATE TABLE ac_course_schedule_fee (
    EntryID INT AUTO_INCREMENT PRIMARY KEY,
    ScheduleFeeID INT NOT NULL,
    FeeItemID INT NOT NULL,
    InsertedBy INT,
    InsertedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedBy INT,
    UpdatedDate DATETIME,
    FOREIGN KEY (ScheduleFeeID) REFERENCES ac_course_schedule_fees(EntryID),
    FOREIGN KEY (FeeItemID) REFERENCES ac_schedule_fee_items(EntryID)
);

CREATE TABLE ac_student_invoice (
    EntryID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID INT NOT NULL,
    SchoolSemester VARCHAR(50),
    InvoiceCode VARCHAR(225),
    InsertedBy INT,
    InsertedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedBy INT,
    UpdatedDate DATETIME
);

CREATE TABLE ac_student_invoice_items (
    EntryID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID INT NOT NULL,
    InvoiceID INT NOT NULL,
    ItemName VARCHAR(255),
    Amount DECIMAL(12,2),
    Description TEXT,
    InsertedBy INT,
    InsertedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedBy INT,
    UpdatedDate DATETIME,
    FOREIGN KEY (InvoiceID) REFERENCES ac_student_invoice(EntryID)
);

CREATE TABLE ac_student_payment (
    EntryID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID INT NOT NULL,
    InvoiceID INT NOT NULL,
    Semester VARCHAR(50),
    Amount DECIMAL(12,2),
    PaymentDetails TEXT,
    InsertedBy INT,
    InsertedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedBy INT,
    UpdatedDate DATETIME,
    FOREIGN KEY (InvoiceID) REFERENCES ac_student_invoice(EntryID)
);

CREATE TABLE ac_student_outstanding (
    EntryID INT AUTO_INCREMENT PRIMARY KEY,
    StudentPaymentID INT NOT NULL,
    Amount DECIMAL(12,2),
    SchoolSemester VARCHAR(50),
    StudentID INT NOT NULL,
    IsCleared BOOLEAN DEFAULT FALSE,
    InsertedBy INT,
    InsertedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedBy INT,
    UpdatedDate DATETIME,
    FOREIGN KEY (StudentPaymentID) REFERENCES ac_student_payment(EntryID)
);

CREATE TABLE ac_student_balance (
    EntryID INT AUTO_INCREMENT PRIMARY KEY,
    StudentPaymentID INT NOT NULL,
    Amount DECIMAL(12,2),
    SchoolSemester VARCHAR(50),
    StudentID INT NOT NULL,
    IsCleared BOOLEAN DEFAULT FALSE,
    InsertedBy INT,
    InsertedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedBy INT,
    UpdatedDate DATETIME,
    FOREIGN KEY (StudentPaymentID) REFERENCES ac_student_payment(EntryID)
);
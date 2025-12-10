# Finance Module API Endpoints

## Base URL: `/staff/ac-finance`

All endpoints require JWT authentication via the `Authorization` header.

---

## 1. Fee Items (`/fee-items`)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/fee-items/list` | List all fee items | - |
| GET | `/fee-items/active` | List only active fee items | - |
| GET | `/fee-items/categories` | Get distinct categories | - |
| GET | `/fee-items/:id` | Get fee item by ID | - |
| POST | `/fee-items/add` | Create a new fee item | `{ Name, Description, Amount, Category, InsertedBy }` |
| PATCH | `/fee-items/update/:id` | Update a fee item | `{ Name, Description, Amount, Category, IsActive, UpdatedBy }` |
| DELETE | `/fee-items/delete/:id` | Soft delete a fee item | `{ UpdatedBy }` |
| POST | `/fee-items/bulk-add` | Bulk create fee items | `{ items: [{ Name, Description, Amount, Category }], InsertedBy }` |

---

## 2. Fee Schedules (`/fee-schedules`)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/fee-schedules/list` | List all fee schedules | - |
| GET | `/fee-schedules/by-course/:courseId` | List fee schedules for a course | - |
| GET | `/fee-schedules/lookup/:courseId/:level/:semester/:type` | Get specific schedule | - |
| GET | `/fee-schedules/:id` | Get fee schedule by ID with items | - |
| POST | `/fee-schedules/add` | Create a new fee schedule | `{ CourseID, Level, Semester, ScheduleType, InsertedBy }` |
| POST | `/fee-schedules/link-item` | Link a fee item to a schedule | `{ ScheduleFeeID, FeeItemID, CustomAmount, InsertedBy }` |
| PATCH | `/fee-schedules/update-link/:linkId` | Update fee item link (custom amount) | `{ CustomAmount, UpdatedBy }` |
| DELETE | `/fee-schedules/unlink-item/:scheduleId/:itemId` | Remove fee item from schedule | - |
| PATCH | `/fee-schedules/update/:id` | Update a fee schedule | `{ CourseID, Level, Semester, ScheduleType, IsActive, UpdatedBy }` |
| DELETE | `/fee-schedules/delete/:id` | Delete a fee schedule | - |
| POST | `/fee-schedules/copy/:id` | Copy fee schedule to another course/level/semester | `{ CourseID, Level, Semester, ScheduleType, InsertedBy }` |
| POST | `/fee-schedules/bulk-link` | Bulk link fee items to a schedule | `{ ScheduleFeeID, FeeItemIDs: [], InsertedBy }` |

**Note:** `ScheduleType`: 0 = NEW Student, 1 = RETURNING Student

---

## 3. Scholarships (`/scholarships`)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/scholarships/list` | List all scholarships | - |
| GET | `/scholarships/active` | List only active scholarships | - |
| GET | `/scholarships/:id` | Get scholarship by ID | - |
| POST | `/scholarships/add` | Create a new scholarship | `{ Name, Description, StartDate, EndDate, Admission, Tuition, Feeding, Transportation, Accommodation, InsertedBy }` |
| PATCH | `/scholarships/update/:id` | Update a scholarship | `{ Name, Description, StartDate, EndDate, Admission, Tuition, Feeding, Transportation, Accommodation, IsActive, UpdatedBy }` |
| DELETE | `/scholarships/delete/:id` | Soft delete a scholarship | `{ UpdatedBy }` |
| POST | `/scholarships/calculate-discount/:scholarshipId` | Calculate discount amounts | `{ fees: { tuition, accommodation, feeding, transportation, admission } }` |

**Note:** Percentages (Admission, Tuition, Feeding, Transportation, Accommodation) are stored as 0-100.

---

## 4. Scholarship Students (`/scholarship-students`)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/scholarship-students/list` | List all scholarship enrollments | - |
| GET | `/scholarship-students/active` | List only active enrollments | - |
| GET | `/scholarship-students/student/:studentId` | Get student's scholarships | - |
| GET | `/scholarship-students/scholarship/:scholarshipId` | Get all students in a scholarship | - |
| POST | `/scholarship-students/enroll` | Enroll student in a scholarship | `{ ScholarshipID, StudentID, FullName, EmailAddress, Semester, InsertedBy }` |
| PATCH | `/scholarship-students/activate/:id` | Activate an enrollment | `{ UpdatedBy }` |
| PATCH | `/scholarship-students/deactivate/:id` | Deactivate an enrollment | `{ UpdatedBy }` |
| DELETE | `/scholarship-students/remove/:id` | Remove an enrollment | - |
| POST | `/scholarship-students/bulk-enroll` | Bulk enroll students | `{ ScholarshipID, StudentIDs: [], Semester, InsertedBy }` |

---

## 5. Scholarship Admission (`/scholarship-admission`)

Pre-assigns scholarships to applicants before they become students.

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/scholarship-admission/list` | List all admission scholarship assignments | - |
| GET | `/scholarship-admission/unused` | List unused (available) assignments | - |
| GET | `/scholarship-admission/semester/:semester` | List assignments for a semester | - |
| GET | `/scholarship-admission/check/:email` | Check if email has assigned scholarship | - |
| GET | `/scholarship-admission/:id` | Get assignment by ID | - |
| POST | `/scholarship-admission/assign` | Assign scholarship to applicant | `{ FullName, EmailAddress, ScholarshipID, SchoolSemester, InsertedBy }` |
| PATCH | `/scholarship-admission/mark-used/:id` | Mark assignment as used | `{ UpdatedBy }` |
| POST | `/scholarship-admission/use-for-student` | Convert to student scholarship | `{ AssignmentID, StudentID, InsertedBy }` |
| PATCH | `/scholarship-admission/update/:id` | Update an assignment | `{ FullName, EmailAddress, ScholarshipID, SchoolSemester, UpdatedBy }` |
| DELETE | `/scholarship-admission/delete/:id` | Delete unused assignment | - |
| POST | `/scholarship-admission/bulk-assign` | Bulk assign scholarships | `{ assignments: [{ FullName, EmailAddress, ScholarshipID }], SchoolSemester, InsertedBy }` |

---

## 6. Academic Scholarships (`/academic-scholarships`)

GPA-based automatic scholarship system.

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/academic-scholarships/list` | List all academic scholarships | - |
| GET | `/academic-scholarships/unused` | List unused academic scholarships | - |
| GET | `/academic-scholarships/student/:studentId` | Get student's academic scholarships | - |
| GET | `/academic-scholarships/semester/:semester` | Get academic scholarships for a semester | - |
| GET | `/academic-scholarships/eligible/:semesterCode` | Get eligible students for academic scholarship | - |
| GET | `/academic-scholarships/tiers` | Get GPA scholarship tiers configuration | - |
| POST | `/academic-scholarships/award` | Award academic scholarship | `{ StudentID, GPA, SchoolSemesterUsed, ScholarshipPercentage?, InsertedBy }` |
| POST | `/academic-scholarships/award-bulk` | Bulk award academic scholarships | `{ students: [{ StudentID, GPA }], SchoolSemesterUsed, InsertedBy }` |
| PATCH | `/academic-scholarships/use/:id` | Mark scholarship as used | `{ UpdatedBy }` |
| DELETE | `/academic-scholarships/delete/:id` | Delete unused academic scholarship | - |
| GET | `/academic-scholarships/summary/:semesterCode` | Get summary statistics for a semester | - |

**GPA Tiers:**
| GPA Range | Percentage |
|-----------|------------|
| 4.50 - 5.00 | 100% |
| 3.50 - 4.49 | 50% |
| 2.50 - 3.49 | 25% |
| 2.00 - 2.49 | 10% |

---

## 7. Scholarship Used (`/scholarship-used`)

Records of scholarship amounts applied to payments.

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/scholarship-used/list` | List all scholarship usage records | - |
| GET | `/scholarship-used/student/:studentId` | Get student's scholarship usage history | - |
| GET | `/scholarship-used/scholarship/:scholarshipId` | Get all usage for a scholarship | - |
| GET | `/scholarship-used/semester/:semester` | Get usage records for a semester | - |
| GET | `/scholarship-used/:id` | Get specific usage record | - |
| POST | `/scholarship-used/record` | Record scholarship usage | `{ StudentID, ScholarshipID, Semester, AdmissionFeeAmount, FeedingFeeAmount, AccommodationFeeAmount, TransportFeeAmount, TuitionFeeAmount, InsertedBy }` |
| POST | `/scholarship-used/calculate-and-record` | Calculate and record usage from invoice | `{ StudentID, ScholarshipID, InvoiceID, Semester, InsertedBy }` |
| GET | `/scholarship-used/summary/by-scholarship` | Get summary grouped by scholarship | - |

---

## 8. Invoices (`/invoices`)

| Method | Endpoint | Description | Request Body / Query |
|--------|----------|-------------|----------------------|
| GET | `/invoices/list` | List all invoices | Query: `semester, status, studentId, limit, offset` |
| GET | `/invoices/student/:studentId` | Get student's invoices | - |
| GET | `/invoices/student/:studentId/semester/:semester` | Get invoice for specific semester | - |
| GET | `/invoices/:id` | Get invoice by ID with line items & payments | - |
| POST | `/invoices/generate` | Generate invoice from fee schedule | `{ StudentID, SchoolSemester, DueDate, InsertedBy }` |
| POST | `/invoices/generate-bulk` | Bulk generate invoices | `{ SchoolSemester, DueDate, InsertedBy }` |
| POST | `/invoices/add-item/:invoiceId` | Add line item to invoice | `{ ItemName, Amount, Description, FeeItemID, InsertedBy }` |
| PATCH | `/invoices/update-item/:itemId` | Update invoice line item | `{ ItemName, Amount, Description, UpdatedBy }` |
| DELETE | `/invoices/remove-item/:itemId` | Remove invoice line item | `{ UpdatedBy }` |
| POST | `/invoices/regenerate/:id` | Regenerate invoice from fee schedule | `{ InsertedBy }` |
| PATCH | `/invoices/cancel/:id` | Cancel an invoice | `{ UpdatedBy }` |

**Invoice Statuses:** `Pending`, `Partial`, `Paid`, `Cancelled`

---

## 9. Payments (`/payments`)

| Method | Endpoint | Description | Request Body / Query |
|--------|----------|-------------|----------------------|
| GET | `/payments/list` | List all payments | Query: `semester, studentId, invoiceId, limit, offset` |
| GET | `/payments/student/:studentId` | Get student's payment history | - |
| GET | `/payments/invoice/:invoiceId` | Get payments for specific invoice | - |
| GET | `/payments/:id` | Get payment details | - |
| POST | `/payments/record` | Record a payment | `{ StudentID?, InvoiceID, Amount, PaymentMethod, PaymentReference, PaymentDetails, InsertedBy }` |
| GET | `/payments/receipt/:paymentId` | Get payment receipt data | - |
| POST | `/payments/apply-balance` | Apply credit balance to invoice | `{ BalanceID, InvoiceID, Amount, InsertedBy }` |
| GET | `/payments/summary/semester/:semester` | Get payment summary for a semester | - |

**Payment Methods:** `Transfer`, `Cash`, `Card`, `Credit Balance`, etc.

---

## 10. Balances (`/balances`)

### Outstanding Balances

| Method | Endpoint | Description | Request Body / Query |
|--------|----------|-------------|----------------------|
| GET | `/balances/outstanding/list` | List all outstanding balances | Query: `semester, cleared, limit, offset` |
| GET | `/balances/outstanding/:studentId` | Get student's outstanding balance | - |
| POST | `/balances/outstanding/clear/:id` | Mark outstanding as cleared | `{ UpdatedBy }` |

### Credit Balances

| Method | Endpoint | Description | Request Body / Query |
|--------|----------|-------------|----------------------|
| GET | `/balances/credit/list` | List all credit balances | Query: `semester, cleared, limit, offset` |
| GET | `/balances/credit/:studentId` | Get student's credit balance | - |
| POST | `/balances/credit/use/:id` | Apply credit to an invoice | `{ InvoiceID, Amount, InsertedBy }` |

### Summary & Reports

| Method | Endpoint | Description | Request Body / Query |
|--------|----------|-------------|----------------------|
| GET | `/balances/summary/:studentId` | Get complete balance summary | - |
| GET | `/balances/report/outstanding-by-semester` | Outstanding amounts by semester | - |
| GET | `/balances/report/credit-by-semester` | Credit balances by semester | - |
| GET | `/balances/students-with-outstanding` | List students with outstanding | Query: `semester, minAmount, limit, offset` |
| GET | `/balances/students-with-credit` | List students with available credit | Query: `limit, offset` |

---

## 11. Other Fees (`/other-fees`)

Custom/miscellaneous fees system separate from course fee schedules.

### Fee Types

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/other-fees/list` | List all other fee types | - |
| GET | `/other-fees/active` | List only active other fee types | - |
| GET | `/other-fees/fee/:id` | Get other fee type by ID | - |
| POST | `/other-fees/add` | Create a new other fee type | `{ Name, Description, DefaultAmount, Category, InsertedBy }` |
| PATCH | `/other-fees/update/:id` | Update an other fee type | `{ Name, Description, DefaultAmount, Category, IsActive, UpdatedBy }` |
| DELETE | `/other-fees/delete/:id` | Soft delete an other fee type | `{ UpdatedBy }` |

### Other Fee Invoices

| Method | Endpoint | Description | Request Body / Query |
|--------|----------|-------------|----------------------|
| GET | `/other-fees/invoices/list` | List all other fee invoices | Query: `status, studentId, limit, offset` |
| GET | `/other-fees/invoices/student/:studentId` | Get student's other fee invoices | - |
| GET | `/other-fees/invoices/:id` | Get other fee invoice with items | - |
| POST | `/other-fees/invoices/create` | Create other fee invoice | `{ StudentID, Description, DueDate, Items: [{ FeeID, Amount, Description }], InsertedBy }` |
| POST | `/other-fees/invoices/add-item/:invoiceId` | Add item to other fee invoice | `{ FeeID, Amount, Description, InsertedBy }` |
| DELETE | `/other-fees/invoices/remove-item/:itemId` | Remove item from other fee invoice | `{ UpdatedBy }` |

### Other Fee Payments

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/other-fees/payments/record` | Record payment for other fee invoice | `{ StudentID?, InvoiceID, Amount, PaymentMethod, PaymentReference, PaymentDetails, InsertedBy }` |
| GET | `/other-fees/payments/student/:studentId` | Get student's other fee payments | - |
| GET | `/other-fees/payments/invoice/:invoiceId` | Get payments for specific invoice | - |

---

## Summary

| Module | Endpoints |
|--------|-----------|
| Fee Items | 8 |
| Fee Schedules | 12 |
| Scholarships | 7 |
| Scholarship Students | 9 |
| Scholarship Admission | 11 |
| Academic Scholarships | 11 |
| Scholarship Used | 8 |
| Invoices | 11 |
| Payments | 8 |
| Balances | 10 |
| Other Fees | 12 |
| **Total** | **107** |

---

## Response Format

All endpoints return JSON in this format:

```json
{
  "success": true,
  "message": "success",
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error message or 'exist' for duplicates"
}
```

---

## Database Tables (ac_* prefix)

1. `ac_schedule_fee_items` - Fee item definitions
2. `ac_course_schedule_fees` - Fee schedules per course/level/semester
3. `ac_course_schedule_fee` - Links fee items to schedules
4. `ac_scholarships` - Scholarship definitions
5. `ac_scholarship_students` - Student scholarship enrollments
6. `ac_scholarship_admission` - Pre-admission scholarship assignments
7. `ac_academic_scholarship` - GPA-based scholarships
8. `ac_scholarship_used` - Scholarship usage records
9. `ac_student_invoice` - Student invoices
10. `ac_student_invoice_items` - Invoice line items
11. `ac_student_payment` - Payment records
12. `ac_student_outstanding` - Outstanding balances
13. `ac_student_balance` - Credit balances (overpayments)
14. `ac_balance_usage` - Credit application history
15. `ac_other_fees` - Other fee type definitions
16. `ac_other_fees_invoice` - Other fee invoices
17. `ac_other_fees_invoice_items` - Other fee invoice items
18. `ac_other_fee_payment` - Other fee payments

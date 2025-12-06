# AGTable Migration - Manual Application Guide

## Overview
This guide provides step-by-step instructions to manually apply the AGTable migration to the two files.

---

## File 1: upload-staff-document.jsx

### Step 1: Add AGTable Import
**Location**: Line 11 (after the Select2 import)

Add this line:
```javascript
import AGTable from "../../common/table/AGTable";
```

### Step 2: Add Datatable State
**Location**: Line 20 (after `const [staffDocuments, setStaffDocuments] = useState([]);`)

Add these lines:
```javascript

  const [documentsDatatable, setDocumentsDatatable] = useState({
    columns: [
      { label: "S/N", field: "sn" },
      { label: "Action", field: "action" },
      { label: "Document Type", field: "documentType" },
      { label: "File Name", field: "fileName" },
    ],
    rows: [],
  });
```

### Step 3: Add Update Datatable Function
**Location**: Line 106 (after `getStaffDocument` function, before `handlePassportUpload`)

Add this function:
```javascript

  const updateDocumentsDatatable = (documents) => {
    const rows = documents.map((item, index) => ({
      sn: index + 1,
      action: (
        <button
          className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
          onClick={() => deleteItem(item.EntryID, item.FileName)}
          title="Delete Document"
        >
          <i className="fa fa-trash-o"></i>
        </button>
      ),
      documentType: item.Document || 'N/A',
      fileName: (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`${serverLink}public/uploads/application/document/${item.FileName}`}
          className="text-primary"
        >
          <i className="fa fa-file-pdf-o me-2" />
          View Document
        </a>
      ),
    }));
    setDocumentsDatatable({
      ...documentsDatatable,
      rows: rows,
    });
  };
```

### Step 4: Update getStaffDocument Function
**Location**: Line 97 (change the URL)

Change line 97 from:
```javascript
      .get(`${serverLink}staff/hr/staff-management/staff/document/`, staffId, token)
```

To:
```javascript
      .get(`${serverLink}staff/hr/staff-management/staff/document/${staffId}`, token)
```

Then add this line after `setStaffDocuments(response.data);` (line 100):
```javascript
        updateDocumentsDatatable(response.data);
```

### Step 5: Update deleteItem Function
**Location**: Line 57-58

After `toast.success(\`Deleted\`);` add:
```javascript
            getStaffDocument(addStaffDocument.StaffID);
```

### Step 6: Update handlePassportUpload Function
**Location**: Line 139

After `setAddDocument(false);` add:
```javascript
          getStaffDocument(addStaffDocument.StaffID);
```

### Step 7: Update onSubmit Function (first occurrence)
**Location**: Line 206

After `setAddDocument(false);` add:
```javascript
                getStaffDocument(addStaffDocument.StaffID);
```

### Step 8: Update handleStaffEdit Function
**Location**: Lines 242-248

Replace the entire function with:
```javascript
  const handleStaffEdit = (e) =>
  {
    const staffId = e.target.value;
    setAddStaffDocument({
      ...addStaffDocument,
      [e.target.id]: staffId,
    });
    if (staffId) {
      getStaffDocument(staffId);
    }
  }
```

### Step 9: Replace Commented Table with AGTable
**Location**: Lines 377-422

Replace all the commented table code with:
```javascript
          <div className="mt-5">
            {staffDocuments.length > 0 ? (
              <AGTable data={documentsDatatable} />
            ) : (
              <div className="alert alert-info">
                There is no record. Click on Add Document
              </div>
            )}
          </div>
```

---

## File 2: staff-edit-profile.jsx

### Step 1: Add Publications Datatable State
**Location**: Line 54 (after `nokDatatable` state)

Add:
```javascript

    const [publicationsDatatable, setPublicationsDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Action", field: "action" },
            { label: "Paper Title", field: "paperTitle" },
            { label: "Author(s)", field: "authors" },
            { label: "Work Title", field: "workTitle" },
            { label: "Year", field: "year" },
            { label: "View", field: "viewCount" },
            { label: "Download", field: "downloadCount" },
        ],
        rows: [],
    });
```

### Step 2: Add Update Publications Function
**Location**: Line 253 (after `updateNokDatatable` function)

Add:
```javascript

    const updatePublicationsDatatable = (publications) => {
        const rows = publications.map((publication, index) => ({
            sn: index + 1,
            action: (
                <button className="btn btn-light btn-sm btn-active-light-primary">
                    Download
                </button>
            ),
            paperTitle: publication.PaperTitle || 'N/A',
            authors: publication.Authors || 'N/A',
            workTitle: publication.WorkTitle || 'N/A',
            year: publication.PublishedYear || 'N/A',
            viewCount: publication.ViewCount || 0,
            downloadCount: publication.DownloadCount || 0,
        }));
        setPublicationsDatatable({
            ...publicationsDatatable,
            rows: rows,
        });
    };
```

### Step 3: Update getStaffRelatedData Function
**Location**: Line 199

After `updateNokDatatable(response.data.nok);` add:
```javascript
                updatePublicationsDatatable(response.data.publications);
```

### Step 4: Replace Publications Tab Content
**Location**: Lines 1331-1408

Replace the entire publications tab section with:
```javascript
                                        <div className="tab-pane fade" id="publications" role="tabpanel">
                                            <div className="card shadow-sm">
                                                <div className="card-header bg-light border-0 pt-5">
                                                    <h3 className="card-title fw-bold">My Publications</h3>
                                                </div>
                                                <div className="card-body">
                                                    {staffInformation.publications && staffInformation.publications.length > 0 ? (
                                                        <AGTable data={publicationsDatatable} />
                                                    ) : (
                                                        <div className="text-center py-10">
                                                            <div className="mb-5">
                                                                <i className="bi bi-journal-text fs-3x text-muted"></i>
                                                            </div>
                                                            <h4 className="text-gray-800 mb-3">No Publications Added</h4>
                                                            <p className="text-gray-600 mb-5">
                                                                You haven't added any publications yet.{" "}
                                                                <Link to="/users/publication-manager" className="text-primary">
                                                                    Click to Add Publication
                                                                </Link>
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
```

---

## Verification Steps

After applying all changes:

1. **Check for Syntax Errors**:
   ```bash
   npm start
   ```

2. **Test upload-staff-document.jsx**:
   - Navigate to Human Resource → Staff Management → Upload Staff Document
   - Select a staff member
   - Verify documents table appears
   - Test delete button
   - Test file link opens correctly
   - Upload a new document and verify table refreshes

3. **Test staff-edit-profile.jsx**:
   - Navigate to your staff profile
   - Click on Publications tab
   - Verify AGTable displays correctly
   - Test download button
   - Verify empty state if no publications

4. **Check Console for Errors**:
   - Open browser developer tools (F12)
   - Look for any JavaScript errors in the Console tab

---

## Rollback Instructions

If issues occur, restore from backups:

```bash
# Restore upload-staff-document.jsx
cp "c:/Users/NEW USER/Project/cosmopolitanedu/staff/src/component/human-resources/staff/upload-staff-document.jsx.backup" "c:/Users/NEW USER/Project/cosmopolitanedu/staff/src/component/human-resources/staff/upload-staff-document.jsx"

# Restore staff-edit-profile.jsx
cp "c:/Users/NEW USER/Project/cosmopolitanedu/staff/src/component/user/staff-edit-profile/staff-edit-profile.jsx.backup" "c:/Users/NEW USER/Project/cosmopolitanedu/staff/src/component/user/staff-edit-profile/staff-edit-profile.jsx"
```

---

## Summary of Changes

### upload-staff-document.jsx
- Added AGTable import
- Added documentsDatatable state
- Added updateDocumentsDatatable function
- Fixed getStaffDocument API call
- Updated deleteItem to refresh table
- Updated handlePassportUpload to refresh table
- Updated onSubmit to refresh table
- Updated handleStaffEdit to load documents on staff selection
- Replaced commented HTML table with AGTable component

### staff-edit-profile.jsx
- Added publicationsDatatable state
- Added updatePublicationsDatatable function
- Updated getStaffRelatedData to populate publications table
- Replaced publications HTML table with AGTable component
- Added empty state UI with icon and link

Both files now use consistent AGTable implementation with sorting, filtering, pagination, export, and copy features.

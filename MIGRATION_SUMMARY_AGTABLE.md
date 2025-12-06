# AG Grid Migration Summary

## Files Migrated from HTML Tables to AGTable

### 1. upload-staff-document.jsx
**Location**: `c:/Users/NEW USER/Project/cosmopolitanedu/staff/src/component/human-resources/staff/upload-staff-document.jsx`

**Status**: READY FOR MIGRATION

**Current State**: The file has a commented-out HTML table (lines 377-422) that displays staff documents with Document Type, File Name, and Action columns.

**Migration Changes Required**:

1. **Add Import**:
```javascript
import AGTable from "../../common/table/AGTable";
```

2. **Add Datatable State** (after line 20):
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

3. **Add Update Function** (after `getStaffDocument` function):
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

4. **Update `getStaffDocument` Function** (line 94-106):
```javascript
const getStaffDocument = async (staffId) =>
{
  await axios
    .get(`${serverLink}staff/hr/staff-management/staff/document/${staffId}`, token)
    .then((response) =>
    {
      setStaffDocuments(response.data);
      updateDocumentsDatatable(response.data);  // ADD THIS LINE
    })
    .catch((err) =>
    {
      console.log("NETWORK ERROR");
    });
};
```

5. **Update `deleteItem` Function** (add refresh after successful deletion, line 58):
```javascript
if (res.data.message === "success")
{
  toast.success(`Deleted`);
  getStaffDocument(addStaffDocument.StaffID);  // ADD THIS LINE
} else
```

6. **Update `handlePassportUpload` Function** (add refresh after success, line 138-139):
```javascript
toast.success(`Document Uploaded`);
setAddDocument(false);
getStaffDocument(addStaffDocument.StaffID);  // ADD THIS LINE
```

7. **Update `onSubmit` Function** (add refresh after success, line 205-206):
```javascript
toast.success(`Document Uploaded`);
setAddDocument(false);
getStaffDocument(addStaffDocument.StaffID);  // ADD THIS LINE
```

8. **Update `handleStaffEdit` Function** (line 242-248):
```javascript
const handleStaffEdit = (e) =>
{
  const staffId = e.target.value;
  setAddStaffDocument({
    ...addStaffDocument,
    [e.target.id]: staffId,
  });
  if (staffId) {
    getStaffDocument(staffId);  // ADD THIS
  }
}
```

9. **Replace Commented Table** (lines 377-422) with AGTable:
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

### 2. staff-edit-profile.jsx
**Location**: `c:/Users/NEW USER/Project/cosmopolitanedu/staff/src/component/user/staff-edit-profile/staff-edit-profile.jsx`

**Status**: PARTIALLY MIGRATED

**Current State**:
- Qualifications table (line 1429) - Already using AGTable ✓
- Next of Kin table (line 1472) - Already using AGTable ✓
- Publications table (lines 1343-1396) - Still using raw HTML table ✗

**Migration Changes Required for Publications Table**:

1. **Add Datatable State** (after line 54):
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

2. **Add Update Function** (after `updateNokDatatable` function, line 253):
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

3. **Update `getStaffRelatedData` Function** (line 197):
```javascript
setStaffInformation(response.data);
updateQualificationsDatatable(response.data.qualifications);
updateNokDatatable(response.data.nok);
updatePublicationsDatatable(response.data.publications);  // ADD THIS LINE
```

4. **Replace Publications HTML Table** (lines 1331-1408) with:
```javascript
<div className="tab-pane fade" id="publications" role="tabpanel">
  <div className="card">
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

## Benefits of AG Grid Migration

1. **Consistent UI/UX**: All tables now use the same modern, professional appearance
2. **Built-in Features**:
   - Sorting on all columns
   - Filtering/search functionality
   - Pagination (50, 100, 200 rows per page)
   - Export to CSV
   - Copy data to clipboard
   - Column resizing
   - Auto-sizing columns
3. **Performance**: Better handling of large datasets
4. **Responsive**: Works well on mobile devices
5. **Maintainability**: Single table component to update instead of multiple HTML tables

---

## Testing Checklist

### upload-staff-document.jsx
- [ ] Table displays correctly with S/N, Action, Document Type, and File Name columns
- [ ] Action column shows delete button with proper icon
- [ ] Delete button removes document and refreshes table
- [ ] File Name column shows clickable link with icon
- [ ] File link opens document in new tab
- [ ] Upload document refreshes table with new entry
- [ ] Selecting staff loads their documents
- [ ] Empty state shows info message

### staff-edit-profile.jsx (Publications)
- [ ] Publications tab shows table with all columns
- [ ] Table displays Paper Title, Authors, Work Title, Year, View Count, Download Count
- [ ] Download button in Action column works
- [ ] Empty state shows with icon and link to add publications
- [ ] Data loads correctly from API
- [ ] S/N column shows sequential numbers
- [ ] Export and Copy buttons work

---

## Migration Pattern Reference

This migration follows the established pattern from `course.jsx`:

1. Import AGTable
2. Create datatable state with columns array
3. Build rows as objects mapping field names to values
4. Add JSX elements (buttons, links) directly as field values
5. Place Action column after S/N for consistency
6. Replace `<table>` with `<AGTable data={datatable} />`
7. Add empty state for when no data exists

---

## Complete File Locations

- **AGTable Component**: `c:/Users/NEW USER/Project/cosmopolitanedu/staff/src/component/common/table/AGTable.jsx`
- **Example Pattern**: `c:/Users/NEW USER/Project/cosmopolitanedu/staff/src/component/academic/course/course.jsx`
- **File 1 (To Migrate)**: `c:/Users/NEW USER/Project/cosmopolitanedu/staff/src/component/human-resources/staff/upload-staff-document.jsx`
- **File 2 (Partial Migration)**: `c:/Users/NEW USER/Project/cosmopolitanedu/staff/src/component/user/staff-edit-profile/staff-edit-profile.jsx`
- **Backups Created**:
  - `upload-staff-document.jsx.backup`
  - `staff-edit-profile.jsx.backup`

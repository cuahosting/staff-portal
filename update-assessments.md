# Assessment Components Update Guide

This guide documents the changes needed to upgrade assessment components to match the academic folder improvements.

## Changes Applied

### 1. Import Updates
Replace:
```javascript
import Table from "../../../common/table/table";
import ReportTable from "../../../common/table/report_table";
import Select2 from "react-select2-wrapper";
```

With:
```javascript
import AGTable from "../../../common/table/AGTable";
import AgReportTable from "../../../common/table/AGReportTable";
import Select from "react-select";
```

### 2. Custom Select Styles
Add this constant after imports:
```javascript
const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        border: '2px solid #e8e8e8',
        backgroundColor: state.isFocused ? '#ffffff' : '#f8f9fa',
        padding: '0.25rem 0.5rem',
        fontSize: '1rem',
        borderRadius: '0.5rem',
        boxShadow: state.isFocused ? '0 6px 20px rgba(13, 110, 253, 0.15)' : provided.boxShadow,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: state.isFocused ? 'translateY(-2px)' : 'none',
        '&:hover': {
            borderColor: '#0d6efd',
            transform: 'translateY(-1px)',
        }
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#0d6efd' : state.isFocused ? '#e7f3ff' : 'white',
        color: state.isSelected ? 'white' : '#212529',
        padding: '0.75rem 1rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:active': {
            backgroundColor: '#0d6efd',
        }
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999,
        borderRadius: '0.5rem',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
    }),
    menuList: (provided) => ({
        ...provided,
        padding: 0,
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#6c757d',
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#212529',
    }),
};
```

### 3. Move Actions Column to 2nd Position
Change column order from:
```javascript
columns: [
    { label: "S/N", field: "sn" },
    { label: "Field1", field: "field1" },
    // ... other columns
    { label: "Action", field: "action" },  // Last
]
```

To:
```javascript
columns: [
    { label: "S/N", field: "sn" },
    { label: "Action", field: "action" },  // 2nd position
    { label: "Field1", field: "field1" },
    // ... other columns
]
```

### 4. Update Action Buttons
Change from:
```javascript
action: (
    <button
        className="btn btn-sm btn-primary"
        onClick={() => handleEdit(item)}
    >
        <i className="fa fa-pen" />
    </button>
)
```

To:
```javascript
action: (
    <>
        <button
            className="btn btn-link p-0 text-primary"
            style={{ marginRight: 15 }}
            onClick={() => handleEdit(item)}
            title="Edit"
        >
            <i style={{ fontSize: '15px', color: "blue" }} className="fa fa-pen" />
        </button>
        <button
            className="btn btn-link p-0 text-danger"
            onClick={() => handleDelete(item.id)}
            title="Delete"
        >
            <i style={{ fontSize: '15px', color: "red" }} className="fa fa-trash" />
        </button>
    </>
)
```

### 5. Move Add Button to PageHeader
Change from:
```javascript
<PageHeader
    title={"Page Title"}
    items={["breadcrumb"]}
/>
<div className="flex-column-fluid">
    <div className="card">
        <div className="card-header border-0 pt-6">
            <div className="card-title" />
            <div className="card-toolbar">
                <button className="btn btn-primary">Add Item</button>
            </div>
        </div>
        <div className="card-body pt-0">
            <Table data={data} />
        </div>
    </div>
</div>
```

To:
```javascript
<PageHeader
    title={"Page Title"}
    items={["breadcrumb"]}
    buttons={
        <button className="btn btn-primary">Add Item</button>
    }
/>
<div className="flex-column-fluid">
    <div className="card">
        <div className="card-body pt-0">
            <AGTable data={data} />
        </div>
    </div>
</div>
```

### 6. Replace Table Components
```javascript
// Old
<Table data={datatable} />
<ReportTable columns={columns} data={data} />

// New
<AGTable data={datatable} />
<AgReportTable columns={columns} data={data} />
```

### 7. Replace Select2 with React-Select
```javascript
// Convert data format
const options = items.map(item => ({
    value: item.id,
    label: item.name
}));

// Add state for selected value
const [selectedModule, setSelectedModule] = useState(null);

// Add to form state
ModuleCode2: null,  // For react-select display value

// Replace Select2
<Select
    options={options}
    value={selectedModule}
    onChange={(option) => {
        setSelectedModule(option);
        // Update form state
        setFormData({
            ...formData,
            ModuleCode: option ? option.value : "",
            ModuleCode2: option
        });
    }}
    styles={customSelectStyles}
    placeholder="Select Module"
    isSearchable
    isClearable
/>
```

### 8. Add Delete Handler
```javascript
const handleDelete = async (id) => {
    const result = await showAlert(
        "DELETE CONFIRMATION",
        "Are you sure you want to delete this item?",
        "warning",
        true
    );

    if (result.isConfirmed) {
        toast.info("Deleting. Please wait...");
        await axios
            .delete(`${serverLink}api/endpoint/${id}`, token)
            .then((result) => {
                if (result.data.message === "success") {
                    toast.success("Item deleted successfully");
                    // Refresh data
                    getData();
                } else {
                    showAlert("ERROR", "Failed to delete item", "error");
                }
            })
            .catch((error) => {
                showAlert("NETWORK ERROR", "Please check your connection", "error");
            });
    }
};
```

## Files to Update

### Phase 1 - Core Components (8 files)
1. ✅ src/component/assessments/assessment/ca-settings/ca-settings.jsx
2. ✅ src/component/assessments/assessment/ca-settings/exams-ca-settings.jsx
3. ✅ src/component/assessments/assessment/ca-entry/ca-entry.jsx
4. ✅ src/component/assessments/assessment/ca-entry/exam-ca-entry.jsx
5. ✅ src/component/assessments/attendance/attendance.jsx
6. ✅ src/component/assessments/exam/grade-settings/exam-grade-settings.jsx
7. ✅ src/component/assessments/exam/exam-timetable/timetable-schedule.jsx
8. ✅ src/component/assessments/exam/exam-barcode/exam-barcode.jsx

### Phase 2 - CA Processing & Submission (6 files)
9. src/component/assessments/assessment/process-ca/process-ca.jsx
10. src/component/assessments/assessment/evaluate-gpa/evaluate-gpa.jsx
11. src/component/assessments/assessment/final-submission/ca-final-submission.jsx
12. src/component/assessments/assessment/final-submission/exam-ca-final-submission.jsx
13. And 2 more...

### Phase 3 - Exam Management (14 files)
14-27. Various exam management components

### Phase 4 - Academic Results (7 files)
28-34. Academic result components

### Phase 5 - Reports (6 files)
35-41. Report components

## Testing Checklist

After updating each file:
- [ ] File compiles without errors
- [ ] Tables render correctly
- [ ] Dropdowns are searchable
- [ ] Edit button opens modal with correct data
- [ ] Delete button shows confirmation and deletes
- [ ] Add button appears in page header
- [ ] Actions column is in 2nd position
- [ ] Form submissions work
- [ ] Disabled states are preserved

## Common Issues

1. **Missing AGTable/AgReportTable** - Ensure the component exists in src/component/common/table/
2. **React-Select not found** - Run `npm install react-select`
3. **Broken disabled logic** - Preserve existing conditional logic like `disabled={item.CAPerCon > 0 && true}`
4. **API errors** - Don't change API endpoints or request formats
5. **State management** - Add ModuleCode2 fields where using React-Select

## Rollback

If issues occur, revert changes with:
```bash
git checkout -- src/component/assessments/
```

Or restore from individual backup files created during updates.

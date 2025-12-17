import React, { useEffect, useState, useRef } from "react";
import PageHeader from "../../common/pageheader/pageheader";
import { api } from "../../../resources/api";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import SearchSelect from "../../common/select/SearchSelect";

// Photo direction configurations
const PHOTO_DIRECTIONS = [
    { key: 'photoLeft', label: 'Left', icon: '◀', dbField: 'PhotoLeft' },
    { key: 'photoLeftCenter', label: 'Left Center', icon: '◁', dbField: 'PhotoLeftCenter' },
    { key: 'photoCenter', label: 'Center', icon: '●', dbField: 'PhotoCenter' },
    { key: 'photoRightCenter', label: 'Right Center', icon: '▷', dbField: 'PhotoRightCenter' },
    { key: 'photoRight', label: 'Right', icon: '▶', dbField: 'PhotoRight' }
];

function UploadStudentPhoto(props) {
    const currentUser = props.loginData[0]?.StaffID;

    const [isLoading, setIsLoading] = useState(true);
    const [studentList, setStudentList] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [existingPhotos, setExistingPhotos] = useState({});
    const [photoFiles, setPhotoFiles] = useState({});
    const [photoPreviews, setPhotoPreviews] = useState({});
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRefs = useRef({});

    useEffect(() => { getStudentList(); }, []);

    const getStudentList = async () => {
        const { success, data } = await api.get("staff/users/student-manager/update/get-all-student");
        if (success && data) {
            const rows = data.map((row) => ({
                label: `${row.StudentID} -- ${row.FirstName} ${row.MiddleName || ''} ${row.Surname}`,
                value: row.StudentID
            }));
            setStudentList(rows);
        }
        setIsLoading(false);
    };

    const getStudentPhotos = async (studentId) => {
        const { success, data } = await api.get(`staff/student-management/student/photos/${studentId}`);
        if (success && data) setExistingPhotos(data);
        else setExistingPhotos({});
    };

    const handleStudentSelect = (e) => {
        const studentId = e.target.value;
        setSelectedStudent(studentId);
        setPhotoFiles({});
        setPhotoPreviews({});
        if (studentId) getStudentPhotos(studentId);
        else setExistingPhotos({});
    };

    const handleFileSelect = (direction, event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) { toast.error('Only JPG, JPEG, and PNG files are allowed'); return; }
        if (file.size > 2 * 1024 * 1024) { toast.error('File size must be less than 2MB'); return; }
        const reader = new FileReader();
        reader.onload = (e) => { setPhotoPreviews(prev => ({ ...prev, [direction]: e.target.result })); };
        reader.readAsDataURL(file);
        setPhotoFiles(prev => ({ ...prev, [direction]: file }));
    };

    const handleUploadClick = (direction) => { fileInputRefs.current[direction]?.click(); };

    const handleRemovePhoto = (direction) => {
        setPhotoFiles(prev => { const updated = { ...prev }; delete updated[direction]; return updated; });
        setPhotoPreviews(prev => { const updated = { ...prev }; delete updated[direction]; return updated; });
        if (fileInputRefs.current[direction]) fileInputRefs.current[direction].value = '';
    };

    const handleDeleteExistingPhoto = async (direction) => {
        if (!selectedStudent) return;
        const confirmed = window.confirm(`Are you sure you want to delete this ${direction.replace('Photo', '')} photo?`);
        if (!confirmed) return;
        toast.info('Deleting photo...');
        const { success } = await api.delete(`staff/student-management/student/photos/${selectedStudent}/${direction}`);
        if (success) { toast.success('Photo deleted successfully'); getStudentPhotos(selectedStudent); }
    };

    const handleSubmit = async () => {
        if (!selectedStudent) { toast.error('Please select a student'); return; }
        const hasNewPhotos = Object.keys(photoFiles).length > 0;
        if (!hasNewPhotos) { toast.error('Please select at least one photo to upload'); return; }

        setIsUploading(true);
        toast.info('Uploading photos... Please wait');

        const formData = new FormData();
        formData.append('StudentID', selectedStudent);
        formData.append('InsertedBy', currentUser);
        Object.entries(photoFiles).forEach(([direction, file]) => { formData.append(direction, file); });

        const { success, data } = await api.postFormData("staff/student-management/student/photos/upload", formData);
        if (success && data?.message === 'success') {
            toast.success(`Photos ${data.action} successfully!`);
            setPhotoFiles({});
            setPhotoPreviews({});
            getStudentPhotos(selectedStudent);
        } else if (success) { toast.error('Failed to upload photos'); }
        setIsUploading(false);
    };

    const getPhotoUrl = (filename) => {
        if (!filename) return null;
        return `${serverLink}public/uploads/${process.env.REACT_APP_PROJECT_CODE || 'CU'}/hr/photos/${filename}`;
    };

    const renderPhotoCard = (direction) => {
        const existingPhoto = existingPhotos[direction.dbField];
        const preview = photoPreviews[direction.key];
        const hasNewFile = photoFiles[direction.key];

        return (
            <div key={direction.key} className="col-lg-2 col-md-4 col-sm-6 mb-4">
                <div className="card h-100 shadow-sm">
                    <div className="card-header text-center py-2" style={{ backgroundColor: '#e8f5e9' }}>
                        <span style={{ fontSize: '1.5rem' }}>{direction.icon}</span>
                        <div className="fw-bold small">{direction.label}</div>
                    </div>
                    <div className="card-body p-2 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '180px' }}>
                        <div className="photo-preview-container mb-2 d-flex align-items-center justify-content-center" style={{ width: '120px', height: '150px', border: '2px dashed #dee2e6', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f8f9fa', cursor: 'pointer' }} onClick={() => handleUploadClick(direction.key)}>
                            {preview ? (<img src={preview} alt={`${direction.label} preview`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />) : existingPhoto ? (<img src={getPhotoUrl(existingPhoto)} alt={`${direction.label}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<i class="fa fa-image" style="font-size: 3rem; color: #dee2e6;"></i>'; }} />) : (<div className="text-center text-muted"><i className="fa fa-camera" style={{ fontSize: '2rem' }}></i><div className="small mt-1">Click to upload</div></div>)}
                        </div>
                        <input type="file" ref={el => fileInputRefs.current[direction.key] = el} accept="image/jpeg,image/jpg,image/png" style={{ display: 'none' }} onChange={(e) => handleFileSelect(direction.key, e)} />
                        <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-success btn-sm" onClick={() => handleUploadClick(direction.key)} title="Upload new photo"><i className="fa fa-upload"></i></button>
                            {hasNewFile && (<button className="btn btn-outline-warning btn-sm" onClick={() => handleRemovePhoto(direction.key)} title="Remove selected"><i className="fa fa-times"></i></button>)}
                            {existingPhoto && !hasNewFile && (<button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteExistingPhoto(direction.dbField)} title="Delete photo"><i className="fa fa-trash"></i></button>)}
                        </div>
                    </div>
                    {hasNewFile && (<div className="card-footer text-center py-1"><span className="badge bg-success small">New</span></div>)}
                    {existingPhoto && !hasNewFile && (<div className="card-footer text-center py-1"><span className="badge bg-info small">Uploaded</span></div>)}
                </div>
            </div>
        );
    };

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title="Upload Student Photos" items={["Registration", "Student Management", "Upload Photos"]} />
            <div className="row mb-4">
                <div className="col-lg-6 col-md-8">
                    <label className="form-label fw-bold"><i className="fa fa-graduation-cap me-1"></i> Select Student</label>
                    <SearchSelect id="StudentID" value={studentList.find(op => op.value === selectedStudent) || null} options={studentList} onChange={(selected) => handleStudentSelect({ target: { value: selected?.value || '' } })} placeholder="Search and select student..." />
                </div>
            </div>
            {selectedStudent && (
                <>
                    <div className="alert alert-info mb-4"><i className="fa fa-info-circle me-2"></i><strong>Instructions:</strong> Upload photos from 5 different angles. Click on each card to upload a photo. Supported formats: JPG, JPEG, PNG (max 2MB each).</div>
                    <div className="row justify-content-center">{PHOTO_DIRECTIONS.map(renderPhotoCard)}</div>
                    {Object.keys(photoFiles).length > 0 && (<div className="text-center mt-4"><button className="btn btn-success btn-lg px-5" onClick={handleSubmit} disabled={isUploading}>{isUploading ? (<><span className="spinner-border spinner-border-sm me-2"></span>Uploading...</>) : (<><i className="fa fa-cloud-upload me-2"></i>Upload {Object.keys(photoFiles).length} Photo(s)</>)}</button></div>)}
                </>
            )}
            {!selectedStudent && (<div className="text-center py-5 text-muted"><i className="fa fa-graduation-cap" style={{ fontSize: '4rem' }}></i><p className="mt-3">Please select a student to manage their photos</p></div>)}
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails }; };
export default connect(mapStateToProps, null)(UploadStudentPhoto);

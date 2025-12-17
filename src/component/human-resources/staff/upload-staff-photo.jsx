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

function UploadStaffPhoto(props) {
    const currentUser = props.loginData[0]?.StaffID;

    const [isLoading, setIsLoading] = useState(true);
    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState("");
    const [existingPhotos, setExistingPhotos] = useState({});
    const [photoFiles, setPhotoFiles] = useState({});
    const [photoPreviews, setPhotoPreviews] = useState({});
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRefs = useRef({});

    useEffect(() => {
        getStaffList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getStaffList = async () => {
        try {
            const { success, data } = await api.get("staff/hr/staff-management/staff/list");
            if (success && data) {
                const rows = data.map((row) => ({
                    label: `${row.StaffID} -- ${row.FirstName} ${row.MiddleName || ''} ${row.Surname}`,
                    value: row.StaffID
                }));
                setStaffList(rows);
            }
            setIsLoading(false);
        } catch (err) {
            console.error("Error fetching staff list:", err);
            toast.error("Failed to load staff list");
            setIsLoading(false);
        }
    };

    const getStaffPhotos = async (staffId) => {
        try {
            const { success, data } = await api.get(`staff/hr/staff-management/staff/photos/${staffId}`);
            if (success) {
                setExistingPhotos(data || {});
            } else {
                setExistingPhotos({});
            }
        } catch (err) {
            console.error("Error fetching staff photos:", err);
            setExistingPhotos({});
        }
    };

    const handleStaffSelect = (e) => {
        const staffId = e.target.value;
        setSelectedStaff(staffId);
        setPhotoFiles({});
        setPhotoPreviews({});
        if (staffId) {
            getStaffPhotos(staffId);
        } else {
            setExistingPhotos({});
        }
    };

    const handleFileSelect = (direction, event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
            toast.error('Only JPG, JPEG, and PNG files are allowed');
            return;
        }

        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('File size must be less than 2MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPhotoPreviews(prev => ({
                ...prev,
                [direction]: e.target.result
            }));
        };
        reader.readAsDataURL(file);

        setPhotoFiles(prev => ({
            ...prev,
            [direction]: file
        }));
    };

    const handleUploadClick = (direction) => {
        fileInputRefs.current[direction]?.click();
    };

    const handleRemovePhoto = (direction) => {
        setPhotoFiles(prev => {
            const updated = { ...prev };
            delete updated[direction];
            return updated;
        });
        setPhotoPreviews(prev => {
            const updated = { ...prev };
            delete updated[direction];
            return updated;
        });
        if (fileInputRefs.current[direction]) {
            fileInputRefs.current[direction].value = '';
        }
    };

    const handleDeleteExistingPhoto = async (direction) => {
        if (!selectedStaff) return;

        const confirmed = window.confirm(`Are you sure you want to delete this ${direction.replace('Photo', '')} photo?`);
        if (!confirmed) return;

        try {
            toast.info('Deleting photo...');
            const { success } = await api.delete(`staff/hr/staff-management/staff/photos/${selectedStaff}/${direction}`);
            if (success) {
                toast.success('Photo deleted successfully');
                getStaffPhotos(selectedStaff);
            } else {
                toast.error('Failed to delete photo');
            }
        } catch (err) {
            console.error("Error deleting photo:", err);
            toast.error('Failed to delete photo');
        }
    };

    const handleSubmit = async () => {
        if (!selectedStaff) {
            toast.error('Please select a staff member');
            return;
        }

        const hasNewPhotos = Object.keys(photoFiles).length > 0;
        if (!hasNewPhotos) {
            toast.error('Please select at least one photo to upload');
            return;
        }

        setIsUploading(true);
        toast.info('Uploading photos... Please wait');

        try {
            const formData = new FormData();
            formData.append('StaffID', selectedStaff);
            formData.append('InsertedBy', currentUser);

            Object.entries(photoFiles).forEach(([direction, file]) => {
                formData.append(direction, file);
            });

            const { success, data } = await api.post(
                "staff/hr/staff-management/staff/photos/upload",
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (success && data.message === 'success') {
                toast.success(`Photos ${data.action} successfully!`);
                setPhotoFiles({});
                setPhotoPreviews({});
                getStaffPhotos(selectedStaff);
            } else {
                toast.error('Failed to upload photos');
            }
        } catch (err) {
            console.error("Upload error:", err);
            toast.error(err.response?.data?.error || 'Failed to upload photos');
        } finally {
            setIsUploading(false);
        }
    };

    const getPhotoUrl = (filename) => {
        if (!filename) return null;
        // Check if it's already a full URL (external storage like simplefileupload.com)
        if (filename.startsWith('http://') || filename.startsWith('https://')) {
            return filename;
        }
        // Otherwise, construct the local server path
        return `${serverLink}public/uploads/CU/hr/photos/${filename}`;
    };

    const renderPhotoCard = (direction) => {
        const existingPhoto = existingPhotos[direction.dbField];
        const preview = photoPreviews[direction.key];
        const hasNewFile = photoFiles[direction.key];

        return (
            <div key={direction.key} className="col-lg-2 col-md-4 col-sm-6 mb-4">
                <div className="card h-100 shadow-sm">
                    <div className="card-header text-center py-2" style={{ backgroundColor: '#f8f9fa' }}>
                        <span style={{ fontSize: '1.5rem' }}>{direction.icon}</span>
                        <div className="fw-bold small">{direction.label}</div>
                    </div>
                    <div className="card-body p-2 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '180px' }}>
                        {/* Photo Preview Area */}
                        <div
                            className="photo-preview-container mb-2 d-flex align-items-center justify-content-center"
                            style={{
                                width: '120px',
                                height: '150px',
                                border: '2px dashed #dee2e6',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                backgroundColor: '#f8f9fa',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleUploadClick(direction.key)}
                        >
                            {preview ? (
                                <img
                                    src={preview}
                                    alt={`${direction.label} preview`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : existingPhoto ? (
                                <img
                                    src={getPhotoUrl(existingPhoto)}
                                    alt={`${direction.label}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = '<i class="fa fa-image" style="font-size: 3rem; color: #dee2e6;"></i>';
                                    }}
                                />
                            ) : (
                                <div className="text-center text-muted">
                                    <i className="fa fa-camera" style={{ fontSize: '2rem' }}></i>
                                    <div className="small mt-1">Click to upload</div>
                                </div>
                            )}
                        </div>

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={el => fileInputRefs.current[direction.key] = el}
                            accept="image/jpeg,image/jpg,image/png"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileSelect(direction.key, e)}
                        />

                        {/* Action Buttons */}
                        <div className="btn-group btn-group-sm">
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleUploadClick(direction.key)}
                                title="Upload new photo"
                            >
                                <i className="fa fa-upload"></i>
                            </button>
                            {hasNewFile && (
                                <button
                                    className="btn btn-outline-warning btn-sm"
                                    onClick={() => handleRemovePhoto(direction.key)}
                                    title="Remove selected"
                                >
                                    <i className="fa fa-times"></i>
                                </button>
                            )}
                            {existingPhoto && !hasNewFile && (
                                <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => handleDeleteExistingPhoto(direction.dbField)}
                                    title="Delete photo"
                                >
                                    <i className="fa fa-trash"></i>
                                </button>
                            )}
                        </div>
                    </div>
                    {hasNewFile && (
                        <div className="card-footer text-center py-1">
                            <span className="badge bg-success small">New</span>
                        </div>
                    )}
                    {existingPhoto && !hasNewFile && (
                        <div className="card-footer text-center py-1">
                            <span className="badge bg-info small">Uploaded</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Upload Staff Photos"
                items={["Human Resource", "Staff Management", "Upload Photos"]}
            />

            {/* Staff Selection */}
            <div className="row mb-4">
                <div className="col-lg-6 col-md-8">
                    <label className="form-label fw-bold">
                        <i className="fa fa-user me-1"></i> Select Staff Member
                    </label>
                    <SearchSelect
                        id="StaffID"
                        value={staffList.find(op => op.value === selectedStaff) || null}
                        options={staffList}
                        onChange={(selected) => handleStaffSelect({ target: { value: selected?.value || '' } })}
                        placeholder="Search and select staff..."
                    />
                </div>
            </div>

            {selectedStaff && (
                <>
                    {/* Instructions */}
                    <div className="alert alert-info mb-4">
                        <i className="fa fa-info-circle me-2"></i>
                        <strong>Instructions:</strong> Upload photos from 5 different angles.
                        Click on each card to upload a photo. Supported formats: JPG, JPEG, PNG (max 2MB each).
                    </div>

                    {/* Photo Upload Grid */}
                    <div className="row justify-content-center">
                        {PHOTO_DIRECTIONS.map(renderPhotoCard)}
                    </div>

                    {/* Submit Button */}
                    {Object.keys(photoFiles).length > 0 && (
                        <div className="text-center mt-4">
                            <button
                                className="btn btn-primary btn-lg px-5"
                                onClick={handleSubmit}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa fa-cloud-upload me-2"></i>
                                        Upload {Object.keys(photoFiles).length} Photo(s)
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}

            {!selectedStaff && (
                <div className="text-center py-5 text-muted">
                    <i className="fa fa-user-circle" style={{ fontSize: '4rem' }}></i>
                    <p className="mt-3">Please select a staff member to manage their photos</p>
                </div>
            )}
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(UploadStaffPhoto);

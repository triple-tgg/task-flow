import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Paperclip, Download, Trash2, Upload, FileText, Image, File } from 'lucide-react';
import { attachmentsApi } from '../../api/tasks';
import type { Attachment } from '../../api/tasks';

interface TaskAttachmentsProps {
    taskId: string;
}

export const TaskAttachments: React.FC<TaskAttachmentsProps> = ({ taskId }) => {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadAttachments = async () => {
        try {
            const data = await attachmentsApi.list(taskId);
            setAttachments(data);
        } catch (err: any) {
            console.error('Failed to load attachments:', err);
        }
    };

    useEffect(() => {
        if (taskId) {
            loadAttachments();
        }
    }, [taskId]);

    const uploadFile = async (file: File) => {
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        setError(null);
        setIsUploading(true);

        try {
            await attachmentsApi.upload(taskId, file);
            await loadAttachments();
        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.response?.data?.message || 'Upload failed. Check file type.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadFile(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Drag & Drop handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            await uploadFile(file);
        }
    }, [taskId]);

    const handleDelete = async (attachmentId: string) => {
        if (!window.confirm('Delete this attachment?')) return;
        try {
            await attachmentsApi.remove(attachmentId);
            setAttachments(prev => prev.filter(a => a.id !== attachmentId));
        } catch (err: any) {
            console.error('Delete failed:', err);
            setError('Failed to delete file');
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return <Image size={18} className="att-icon att-icon-image" />;
        if (mimeType === 'application/pdf') return <FileText size={18} className="att-icon att-icon-pdf" />;
        return <File size={18} className="att-icon att-icon-doc" />;
    };

    const isImage = (mimeType: string) => mimeType.startsWith('image/');

    return (
        <div className="att-section">
            <div className="att-header">
                <h4 className="att-title">
                    <Paperclip size={14} />
                    Attachments
                    {attachments.length > 0 && (
                        <span className="att-count">{attachments.length}</span>
                    )}
                </h4>
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="att-add-btn"
                    >
                        <Upload size={12} />
                        {isUploading ? 'Uploading...' : 'Add File'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="att-error">{error}</div>
            )}

            {/* File List */}
            {attachments.length > 0 && (
                <div className="att-list">
                    {attachments.map((att) => (
                        <div key={att.id} className="att-file-card">
                            <div className="att-file-preview">
                                {isImage(att.mimeType) && att.url ? (
                                    <img src={att.url} alt={att.filename} className="att-thumb" />
                                ) : (
                                    getFileIcon(att.mimeType)
                                )}
                            </div>
                            <div className="att-file-info">
                                <span className="att-file-name" title={att.filename}>
                                    {att.filename}
                                </span>
                                <span className="att-file-size">{formatSize(att.size)}</span>
                            </div>
                            <div className="att-file-actions">
                                {att.url && (
                                    <a href={att.url} target="_blank" rel="noopener noreferrer" className="att-action-btn" title="Download">
                                        <Download size={14} />
                                    </a>
                                )}
                                <button onClick={() => handleDelete(att.id)} className="att-action-btn att-delete-btn" title="Delete">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Drop zone */}
            <div
                className={`att-dropzone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload size={16} className="att-drop-icon" />
                <span>{isDragging ? 'Drop file here' : 'Drop files here or click to upload'}</span>
                <span className="att-drop-hint">Images, PDFs, documents up to 10MB</span>
            </div>
        </div>
    );
};

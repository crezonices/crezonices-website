import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import {
  Upload,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  FileCheck,
} from 'lucide-react';
import { getFirebaseAuth } from '../../lib/firebase/auth';
import { getApiUrl } from '../../lib/api';

export type DriveSubfolder =
  | 'Project Logos'
  | 'Project Images'
  | 'Testimonials'
  | 'Product Images'
  | 'Directors & Team'
  | 'Service Images'
  | 'Other Website Images';

export interface ImageUploadResult {
  url: string;
  fileId?: string;
  provider: 'google-drive' | 'external';
  filename?: string;
  mimeType?: string;
  size?: number;
}

interface ImageUploaderProps {
  label: string;
  currentUrl?: string;
  folder: DriveSubfolder;
  maxSizeMb?: number;
  onUploadSuccess: (result: ImageUploadResult) => void;
  onRemove?: () => void;
  disabled?: boolean;
  helperText?: string;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * Validates file magic bytes to prevent renamed malicious payloads
 */
async function validateImageHeader(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const arr = new Uint8Array(reader.result as ArrayBuffer).subarray(0, 4);
      let header = '';
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16).padStart(2, '0');
      }
      // JPEG: ffd8, PNG: 89504e47, WEBP: 52494646 (RIFF)
      const isJpg = header.startsWith('ffd8');
      const isPng = header === '89504e47';
      const isWebp = header.startsWith('5249'); // RIFF
      resolve(isJpg || isPng || isWebp);
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 12));
  });
}

/**
 * Client-side optimization: scale down massive images (e.g. 4K/8K cameras)
 * without noticeably degrading quality
 */
async function optimizeImage(file: File, maxDimension = 2048, quality = 0.88): Promise<Blob> {
  return new Promise((resolve) => {
    // If WebP or small PNG, keep original if under 1.5MB
    if (file.size < 1.5 * 1024 * 1024 && (file.type === 'image/webp' || file.type === 'image/png')) {
      return resolve(file);
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width <= maxDimension && height <= maxDimension && file.size < 2 * 1024 * 1024) {
        return resolve(file);
      }

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          resolve(blob || file);
        },
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

export function ImageUploader({
  label,
  currentUrl,
  folder,
  maxSizeMb = 5,
  onUploadSuccess,
  onRemove,
  disabled = false,
  helperText,
}: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualUrl, setManualUrl] = useState(currentUrl || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayUrl = previewUrl || currentUrl;

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || uploading) return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled || uploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = async (file: File) => {
    setError(null);
    setSuccess(null);

    // 1. Extension check
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.type)) {
      setError(`Unsupported file format. Please upload JPG, PNG, or WebP.`);
      return;
    }

    // 2. Size check (before compression)
    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Image size exceeds ${maxSizeMb} MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      return;
    }

    // 3. Image integrity check
    const isValidBytes = await validateImageHeader(file);
    if (!isValidBytes) {
      setError('Invalid image file structure. Header verification failed.');
      return;
    }

    // Create local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);

    // Automatically trigger upload
    await uploadFileToDrive(file);
  };

  const uploadFileToDrive = async (file: File) => {
    setUploading(true);
    setProgress(15);
    setError(null);
    setSuccess(null);

    try {
      // 1. Optimize image
      setProgress(30);
      const optimizedBlob = await optimizeImage(file);
      const uploadFile = new File([optimizedBlob], file.name, { type: file.type });

      // 2. Obtain Firebase Auth token
      const auth = await getFirebaseAuth();
      const currentUser = auth.currentUser;
      let idToken = '';
      if (currentUser) {
        idToken = await currentUser.getIdToken();
      }

      // 3. Prepare FormData
      const formData = new FormData();
      formData.append('image', uploadFile);
      formData.append('folder', folder);

      setProgress(60);

      // 4. Send to backend endpoint
      const response = await fetch(getApiUrl('/api/drive/upload'), {
        method: 'POST',
        headers: {
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: formData,
      });

      setProgress(90);

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      if (!response.ok) {
        let errorMessage = `Upload failed (Status ${response.status})`;
        if (isJson) {
          const data = await response.json().catch(() => ({}));
          errorMessage = data.message || data.error || errorMessage;
        } else {
          const text = await response.text().catch(() => '');
          if (text.includes('<!doctype') || text.includes('<!DOCTYPE') || text.includes('<html')) {
            errorMessage =
              'Backend service returned a web page (HTML) instead of JSON. The backend server (/api/drive/upload) is either not deployed on this domain or offline. You can use "Direct URL" above to insert your image.';
          }
        }
        throw new Error(errorMessage);
      }

      if (!isJson) {
        throw new Error(
          'Backend endpoint returned HTML instead of JSON. The backend server is not reachable on this domain. Please ensure the backend is running, or switch to "Direct URL" mode above.'
        );
      }

      const result = await response.json();
      setProgress(100);
      setSuccess(`Uploaded to Google Drive (${folder}) successfully.`);

      onUploadSuccess({
        url: result.url || result.servingUrl,
        fileId: result.fileId,
        provider: 'google-drive',
        filename: file.name,
        mimeType: file.type,
        size: uploadFile.size,
      });
    } catch (err: any) {
      const msg = err.message || 'Network error during Google Drive upload.';
      setError(
        msg.includes('Failed to fetch') || msg.includes('404')
          ? 'Google Drive backend endpoint /api/drive/upload is not reachable on this domain. You can also specify a direct URL using the "Direct URL" tab above.'
          : msg
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRetry = () => {
    if (selectedFile) {
      uploadFileToDrive(selectedFile);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
    setManualUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onRemove) onRemove();
  };

  const handleManualApply = () => {
    if (!manualUrl.trim()) return;
    try {
      const u = new URL(manualUrl);
      if (u.protocol !== 'https:' && !manualUrl.startsWith('/')) {
        setError('URL must use secure HTTPS protocol.');
        return;
      }
      onUploadSuccess({
        url: manualUrl.trim(),
        provider: 'external',
      });
      setSuccess('Applied direct URL reference.');
      setError(null);
    } catch {
      setError('Please enter a valid URL.');
    }
  };

  return (
    <div className="image-uploader-component">
      <div className="uploader-header-row">
        <label className="uploader-label">{label}</label>
        <div className="uploader-mode-toggle">
          <button
            type="button"
            className={`uploader-toggle-btn ${!manualMode ? 'active' : ''}`}
            onClick={() => setManualMode(false)}
          >
            Google Drive Upload
          </button>
          <button
            type="button"
            className={`uploader-toggle-btn ${manualMode ? 'active' : ''}`}
            onClick={() => setManualMode(true)}
          >
            Direct URL
          </button>
        </div>
      </div>

      {!manualMode ? (
        <div
          className={`uploader-dropzone ${dragActive ? 'dragover' : ''} ${
            displayUrl ? 'has-preview' : ''
          } ${disabled ? 'disabled' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !displayUrl && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden-file-input"
            onChange={handleFileInputChange}
            disabled={disabled || uploading}
          />

          {displayUrl ? (
            <div className="preview-container">
              <div className="preview-image-wrap">
                <img src={displayUrl} alt={label} className="uploader-preview-img" />
                {uploading && (
                  <div className="upload-progress-overlay">
                    <RefreshCw className="spin-icon" size={24} />
                    <span>Uploading to Drive ({progress}%)…</span>
                  </div>
                )}
              </div>

              <div className="preview-actions">
                <span className="folder-pill">
                  <FileCheck size={12} /> {folder}
                </span>
                <div className="btn-group">
                  <button
                    type="button"
                    className="uploader-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    disabled={uploading}
                    title="Replace with another image"
                  >
                    <RefreshCw size={13} /> Replace
                  </button>
                  <a
                    href={displayUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="uploader-action-btn"
                    onClick={(e) => e.stopPropagation()}
                    title="View full image in new tab"
                  >
                    <ExternalLink size={13} /> View
                  </a>
                  <button
                    type="button"
                    className="uploader-action-btn danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    disabled={uploading}
                    title="Remove this image"
                  >
                    <X size={13} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="dropzone-empty-content">
              <div className="dropzone-icon-circle">
                <Upload size={22} />
              </div>
              <div className="dropzone-copy">
                <strong>Click to browse or drag and drop image</strong>
                <span>
                  JPG, PNG, or WebP · Max {maxSizeMb} MB · Automatically stores in{' '}
                  <em>{folder}</em>
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="manual-url-wrap">
          <div className="manual-url-row">
            <input
              type="url"
              placeholder="https://images.example.com/photo.jpg or /assets/..."
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="manual-url-input"
            />
            <button
              type="button"
              className="button small"
              onClick={handleManualApply}
            >
              Apply URL
            </button>
          </div>
          {displayUrl && (
            <div className="manual-preview-mini">
              <img src={displayUrl} alt="Manual preview" />
              <span>Active URL: {displayUrl}</span>
            </div>
          )}
        </div>
      )}

      {/* Progress Bar during active upload */}
      {uploading && (
        <div className="uploader-progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Feedback Notifications */}
      {error && (
        <div className="uploader-notice error">
          <AlertCircle size={14} />
          <span>{error}</span>
          {selectedFile && (
            <button type="button" onClick={handleRetry} className="retry-btn">
              <RefreshCw size={12} /> Retry
            </button>
          )}
        </div>
      )}

      {success && (
        <div className="uploader-notice success">
          <CheckCircle2 size={14} />
          <span>{success}</span>
        </div>
      )}

      {helperText && !error && !success && (
        <span className="uploader-helper-text">{helperText}</span>
      )}
    </div>
  );
}

import { useState } from 'react';
import toast from 'react-hot-toast';
import { publicUploadUrl } from './testManagement.utils';

/**
 * Uploads a file to the admin assessment media API and stores the returned relative path.
 */
const AssessmentAssetFileField = ({
  label,
  kind,
  value,
  onChange,
  upload,
  uploadData = undefined,
  disabled = false,
}) => {
  const [busy, setBusy] = useState(false);
  const previewUrl = publicUploadUrl(value);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const response = await upload(file, uploadData);
      const nextPath = response.data?.data?.path;
      if (!nextPath) {
        throw new Error('Server did not return a file path.');
      }
      onChange(nextPath);
      toast.success(kind === 'image' ? 'Image uploaded.' : 'Audio uploaded.');
    } catch (error) {
      toast.error(error.response?.data?.error?.message || error.message || 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <span className="label">{label}</span>
      {kind === 'image' && previewUrl ? (
        <img src={previewUrl} alt="" className="h-28 max-w-full rounded-lg border border-gray-200 object-contain" />
      ) : null}
      {kind === 'audio' && previewUrl ? (
        <audio controls preload="none" src={previewUrl} className="w-full max-w-md" />
      ) : null}
      <input
        type="file"
        accept={kind === 'image' ? 'image/jpeg,image/png,image/gif,image/webp' : 'audio/*'}
        disabled={disabled || busy}
        onChange={handleFile}
        className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:font-semibold file:text-primary-700 hover:file:bg-primary-100"
      />
      {busy ? <p className="text-xs text-gray-500">Uploading…</p> : null}
      {value ? <p className="text-xs text-gray-500 break-all">{value}</p> : null}
    </div>
  );
};

export default AssessmentAssetFileField;

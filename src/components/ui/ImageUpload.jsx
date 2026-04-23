import { useRef, useState } from "react";
import { uploadService } from "../../services/api";

export default function ImageUpload({
  label,
  uploadType,       // 'profile' | 'national-id' | 'trek'
  accept = "image/*",
  maxSizeMB = 5,
  value,            // current URL (for preview) or publicId (for docs)
  onChange,         // (result: { url?, publicId }) => void
  required = false,
  hint,
  isDocument = false,
  error,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);

  async function handleFile(file) {
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setUploadError(`File too large. Max ${maxSizeMB}MB.`);
      return;
    }
    setUploadError("");
    setUploading(true);
    try {
      const result = await uploadService.upload(file, uploadType);
      onChange(result);
    } catch (e) {
      setUploadError(e?.response?.data?.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(e) {
    handleFile(e.target.files[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  const displayError = uploadError || error;
  const hasValue = !!value;

  return (
    <div>
      {label && (
        <label className="flex items-center text-[12px] font-semibold text-stone-500 tracking-[0.12em] uppercase mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {hint && <p className="text-[11.5px] text-stone-400 mb-2">{hint}</p>}

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all
          ${dragging ? "border-forest-400 bg-forest-50" : hasValue ? "border-forest-300 bg-forest-50/50" : "border-stone-200 bg-stone-50 hover:border-forest-300 hover:bg-forest-50/30"}
          ${uploadType === "trek" ? "h-36" : "h-28"}
        `}
      >
        {uploading ? (
          <>
            <span className="w-7 h-7 border-2 border-forest-200 border-t-forest-500 rounded-full animate-spin" />
            <span className="text-[12px] text-stone-400">Uploading…</span>
          </>
        ) : hasValue && !isDocument ? (
          <>
            <img src={value} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-80" />
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/20">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white mb-1">
                <path d="M3 14l4-4 3 3 3-4 4 5H3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                <circle cx="14" cy="6" r="2" stroke="currentColor" strokeWidth="1.4" />
              </svg>
              <span className="text-[11px] text-white font-medium">Change photo</span>
            </div>
          </>
        ) : hasValue && isDocument ? (
          <div className="flex flex-col items-center gap-1.5">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-forest-500">
              <rect x="5" y="3" width="18" height="22" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 9h10M9 13h10M9 17h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M18 19l2 2 3-3" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[11.5px] text-forest-700 font-medium">Document uploaded ✓</span>
            <span className="text-[11px] text-stone-400">Click to replace</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 px-4 text-center">
            {isDocument ? (
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none" className="text-stone-400">
                <rect x="5" y="3" width="18" height="22" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 9h10M9 13h10M9 17h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none" className="text-stone-400">
                <path d="M5 20l5-5 4 4 4-5 5 6H5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                <circle cx="19" cy="9" r="3" stroke="currentColor" strokeWidth="1.4" />
                <path d="M3 24V6a2 2 0 012-2h18a2 2 0 012 2v18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            )}
            <span className="text-[12px] text-stone-500 font-medium">
              {isDocument ? "Click or drag to upload document" : "Click or drag to upload photo"}
            </span>
            <span className="text-[11px] text-stone-400">
              {isDocument ? "JPG, PNG or PDF · max 10MB" : `JPG, PNG, WebP · max ${maxSizeMB}MB`}
            </span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {displayError && (
        <p className="text-[12px] text-red-500 mt-1.5">{displayError}</p>
      )}
    </div>
  );
}

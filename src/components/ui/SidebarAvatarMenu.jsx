import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { uploadService } from "../../services/api";

export default function SidebarAvatarMenu({ photo, initials, name, email, viewProfileTo, viewProfileAction, onPhotoChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const fileRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    setUploadErr("");
    try {
      const result = await uploadService.upload(file, "profile");
      onPhotoChange(result.url);
    } catch (err) {
      setUploadErr(err?.response?.data?.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="w-full text-center">
      {/* Photo */}
      <div className="flex justify-center mb-3">
        <div className="relative group">
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="w-[72px] h-[72px] rounded-2xl object-cover border-2 border-stone-100 shadow-sm"
            />
          ) : (
            <div className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center font-serif font-bold text-[1.4rem] text-white bg-forest-500 shadow-sm">
              {initials}
            </div>
          )}
        </div>
      </div>

      {/* Name + email */}
      <div className="text-[13.5px] font-semibold text-stone-900 leading-snug truncate px-1">{name}</div>
      <div className="text-[11px] text-stone-400 truncate px-1 mb-3">{email}</div>

      {/* Action buttons */}
      <div className="flex gap-1.5">
        {viewProfileTo ? (
          <Link
            to={viewProfileTo}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11.5px] font-medium bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="4" r="2" stroke="currentColor" strokeWidth="1.2" />
              <path d="M1 11c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            View
          </Link>
        ) : (
          <button
            onClick={viewProfileAction}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11.5px] font-medium bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="4" r="2" stroke="currentColor" strokeWidth="1.2" />
              <path d="M1 11c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            View
          </button>
        )}

        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11.5px] font-medium bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <span className="w-3 h-3 border border-stone-400 border-t-stone-700 rounded-full animate-spin" />
          ) : (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M4 2.5h4l1 1.5h2a.5.5 0 01.5.5v5a.5.5 0 01-.5.5h-9A.5.5 0 011 9.5v-5a.5.5 0 01.5-.5H3L4 2.5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
              <circle cx="6" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.1" />
            </svg>
          )}
          {uploading ? "Uploading" : "Change"}
        </button>
      </div>

      {uploadErr && (
        <p className="text-[11px] text-red-500 mt-1.5 text-left">{uploadErr}</p>
      )}

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
    </div>
  );
}

import { useState } from "react";

export default function SidebarAvatarMenu({ photo, initials, name, email }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div className="w-full flex items-center gap-3">
      {photo && !imgErr ? (
        <img
          src={photo}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setImgErr(true)}
          className="w-10 h-10 rounded-full object-cover border border-stone-100 shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-medium text-[13px] text-white bg-forest-500 shrink-0">
          {initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-medium text-stone-900 truncate">{name}</div>
        <div className="text-[11.5px] text-stone-400 truncate">{email}</div>
      </div>
    </div>
  );
}

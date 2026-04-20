import { useState } from "react";
import SectionHeader from "./SectionHeader";

export default function UsersSection({ users }) {
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <SectionHeader title="All Users" sub="Registered trekkers and guides" />

      <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-[7px] mb-5 max-w-xs">
        <svg width="14" height="14" viewBox="0 0 15 15" fill="none" className="text-[#5a7868] shrink-0">
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="bg-transparent text-[13px] text-[#f0e4c8] placeholder:text-[#3a5848] outline-none w-full"
        />
      </div>

      <div className="bg-[linear-gradient(160deg,rgba(20,24,40,0.7),rgba(10,14,28,0.85))] border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] text-[#5a7868] text-[11px] uppercase tracking-wide">
                <th className="text-left py-3 px-5 font-medium">Name</th>
                <th className="text-left py-3 px-5 font-medium">Email</th>
                <th className="text-left py-3 px-5 font-medium">Role</th>
                <th className="text-left py-3 px-5 font-medium">Joined</th>
                <th className="text-left py-3 px-5 font-medium">Bookings</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr
                  key={u.id}
                  className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i === filtered.length - 1 ? "border-0" : ""}`}
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[11px] font-bold text-[#b0c0b0]">
                        {u.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </div>
                      <span className="text-[#d0c8b0] text-[13px]">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-[#6a8878] text-[13px]">{u.email}</td>
                  <td className="py-3.5 px-5">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      u.role === "guide"
                        ? "bg-[#4a7a8a]/15 text-[#8ac8d8] border border-[#4a7a8a]/25"
                        : "bg-white/[0.05] text-[#9ab0a0] border border-white/[0.08]"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-[#5a7868] text-[13px]">{u.joinedAt}</td>
                  <td className="py-3.5 px-5 text-[#c0b090] text-[13px] font-medium">{u.bookings}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-[13px] text-[#4a6050]">No users found</div>
          )}
        </div>
      </div>
    </div>
  );
}

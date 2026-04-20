export default function SectionHeader({ title, sub }) {
  return (
    <div className="mb-7">
      <h2 className="font-serif text-[1.6rem] sm:text-[1.9rem] font-bold text-[#f5ead0] leading-tight">{title}</h2>
      {sub && <p className="text-[13px] text-[#5a7868] mt-1">{sub}</p>}
    </div>
  );
}

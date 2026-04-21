export default function SectionHeader({ title, sub }) {
  return (
    <div className="mb-7">
      <h2 className="font-serif text-[1.6rem] sm:text-[1.9rem] font-bold text-stone-900 leading-tight">{title}</h2>
      {sub && <p className="text-[13px] text-stone-500 mt-1">{sub}</p>}
    </div>
  );
}

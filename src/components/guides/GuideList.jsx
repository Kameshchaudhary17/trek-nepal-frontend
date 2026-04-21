import GuideCard from "./GuideCard";

function SkeletonCard() {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-stone-100" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-stone-100 rounded w-3/4" />
          <div className="h-3 bg-stone-100 rounded w-1/2" />
          <div className="h-3 bg-stone-100 rounded w-2/3" />
        </div>
      </div>
      <div className="h-16 bg-stone-100 rounded-xl mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-5 bg-stone-100 rounded-full w-20" />
        <div className="h-5 bg-stone-100 rounded-full w-24" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-9 bg-stone-100 rounded-xl" />
        <div className="flex-1 h-9 bg-stone-100 rounded-xl" />
      </div>
    </div>
  );
}

export default function GuideList({ guides, loading, error, hasFilters, onClearFilters }) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4 text-2xl">⚠️</div>
        <h3 className="font-serif text-[1.1rem] font-semibold text-stone-900 mb-2">Something went wrong</h3>
        <p className="text-[14px] text-stone-500 max-w-[300px]">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!guides.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center mb-4 text-2xl">🏔️</div>
        <h3 className="font-serif text-[1.1rem] font-semibold text-stone-900 mb-2">No guides found</h3>
        <p className="text-[14px] text-stone-500 mb-5 max-w-[300px]">Try adjusting your filters or search term.</p>
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="px-5 py-2.5 rounded-xl bg-forest-500 text-white text-[14px] font-semibold hover:bg-forest-600 transition-all"
          >
            Clear all filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {guides.map((g) => <GuideCard key={g.id} guide={g} />)}
    </div>
  );
}

import { useState } from "react";
import { reviewService } from "../../services/api";

function Star({ filled, onClick, onMouseEnter }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className="p-0.5 bg-transparent border-none cursor-pointer transition-transform hover:scale-110"
      aria-label="rating"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill={filled ? "#e0b874" : "none"} stroke={filled ? "#e0b874" : "#d6d3d1"} strokeWidth="1.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default function ReviewModal({ booking, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating < 1) {
      setError("Please choose a rating from 1 to 5 stars.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await reviewService.submit(booking._id, { rating, comment });
      onSubmitted?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  const displayRating = hover || rating;

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
      >
        <h3 className="font-serif text-[1.1rem] font-semibold text-stone-900 mb-1">Leave a review</h3>
        <p className="text-[12.5px] text-stone-500 mb-5">
          {booking?.route} with {booking?.guide?.user?.fullName || "your guide"}
        </p>

        <div
          className="flex items-center justify-center gap-1 mb-2"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              filled={n <= displayRating}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
            />
          ))}
        </div>
        <p className="text-center text-[12px] text-stone-400 mb-4">
          {displayRating ? `${displayRating} out of 5` : "Tap a star to rate"}
        </p>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (optional)"
          rows={4}
          maxLength={2000}
          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-[13.5px] text-stone-800 outline-none focus:border-forest-400 focus:bg-white focus:ring-2 focus:ring-forest-100 resize-none"
        />
        <p className="text-right text-[11px] text-stone-400 mt-1 mb-4">{comment.length}/2000</p>

        {error && (
          <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5 mb-4">{error}</p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-[13px] font-medium hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || rating < 1}
            className="flex-[2] px-4 py-2.5 rounded-xl bg-forest-500 text-white text-[13px] font-semibold hover:bg-forest-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting…" : "Submit review"}
          </button>
        </div>
      </form>
    </div>
  );
}

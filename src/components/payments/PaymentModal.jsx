import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { paymentService } from "../../services/api";
import { formatNPR } from "../../utils/money";

const PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = PK ? loadStripe(PK) : null;

function InnerForm({ amount, onSuccess, onClose }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError("");
    const { error: err, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    setSubmitting(false);
    if (err) {
      setError(err.message || "Payment failed. Please try again.");
      return;
    }
    if (paymentIntent?.status === "succeeded") {
      onSuccess?.();
    } else if (paymentIntent?.status === "processing") {
      onSuccess?.("processing");
    } else {
      setError(`Payment status: ${paymentIntent?.status || "unknown"}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />
      {error && (
        <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{error}</p>
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
          disabled={!stripe || submitting}
          className="flex-[2] px-4 py-2.5 rounded-xl bg-forest-500 text-white text-[13px] font-semibold hover:bg-forest-600 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Processing…" : `Pay ${formatNPR(amount)}`}
        </button>
      </div>
    </form>
  );
}

export default function PaymentModal({ booking, onClose, onPaid }) {
  const [clientSecret, setClientSecret] = useState("");
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!booking?._id) return;
    paymentService
      .createIntent(booking._id)
      .then((res) => {
        setClientSecret(res.clientSecret);
        setAmount(res.amount);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Unable to start payment.");
      });
  }, [booking?._id]);

  if (!stripePromise) {
    return (
      <Overlay onClose={onClose}>
        <p className="text-[14px] text-stone-700">
          Payments are not configured. Set <code className="bg-stone-100 px-1 rounded">VITE_STRIPE_PUBLISHABLE_KEY</code> in the frontend <code>.env</code> and restart the dev server.
        </p>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <h3 className="font-serif text-[1.1rem] font-semibold text-stone-900 mb-1">Complete payment</h3>
      <p className="text-[12.5px] text-stone-500 mb-5">
        {booking?.route} — {booking?.days} day{booking?.days === 1 ? "" : "s"}
      </p>
      {error && (
        <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5 mb-4">{error}</p>
      )}
      {!clientSecret && !error && (
        <p className="text-[13px] text-stone-400">Preparing secure payment…</p>
      )}
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <InnerForm
            amount={amount}
            onSuccess={() => onPaid?.()}
            onClose={onClose}
          />
        </Elements>
      )}
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

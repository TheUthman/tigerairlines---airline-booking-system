import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Copy, Tag } from "lucide-react";

const offers = [
  {
    code: "TIGER2026",
    discount: "20% OFF",
    title: "Lagos to London Escape",
    desc: "Valid on Economy and Business bookings from Lagos to London Heathrow.",
    validTill: "01 June 2026",
    validUntil: "2026-06-01",
    badge: "Bestseller",
  },
  {
    code: "NAIJA5",
    discount: "5% OFF",
    title: "All Domestic Round Trips",
    desc: "Discount on return trips across Lagos, Abuja, Port Harcourt, and Kano.",
    validTill: "31 December 2026",
    validUntil: "2026-12-31",
    badge: "Popular",
  },
  {
    code: "ABJ45K",
    discount: "₦45,000 Fixed Fare",
    title: "Weekend Abuja Flash Deal",
    desc: "Non-stop Lagos–Abuja flights on Fridays and Sundays. Limited seats available.",
    validTill: "30 November 2026",
    validUntil: "2026-11-30",
    badge: "Limited seats",
  },
];

const OffersPage = () => {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(null);
  const [copyUnavailable, setCopyUnavailable] = useState(false);

  const handleCopy = async (code, validUntil) => {
    if (new Date(`${validUntil}T23:59:59`).getTime() < Date.now()) return;

    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setCopyUnavailable(false);
      window.setTimeout(() => setCopiedCode(null), 2500);
    } catch {
      setCopyUnavailable(true);
    }
  };

  return (
    <main className="page-container space-y-8 py-10 md:py-12">
      <header className="page-header">
        <div>
          <p className="page-kicker">Featured fares</p>
          <h1 className="page-title">Offers & promo codes</h1>
          <p className="page-description">
            Review the current offer details and validity before you book.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/search")}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-offset-2"
        >
          Browse flights <ArrowRight size={16} aria-hidden="true" />
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {offers.map((offer) => {
          const isExpired =
            new Date(`${offer.validUntil}T23:59:59`).getTime() < Date.now();
          const isCopied = copiedCode === offer.code;

          return (
            <article
              key={offer.code}
              className="flex min-h-[19rem] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={`h-1.5 ${isExpired ? "bg-border" : "bg-primary"}`} />
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-md border border-border bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-muted">
                    {isExpired ? "Expired" : offer.badge}
                  </span>
                  <Tag size={18} className="text-primary" aria-hidden="true" />
                </div>

                <p className={`mt-5 text-2xl font-bold tracking-tight ${isExpired ? "text-muted" : "text-primary-dark dark:text-primary"}`}>
                  {offer.discount}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-foreground">
                  {offer.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {offer.desc}
                </p>

                <div className="mt-5 rounded-xl border border-border bg-background p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
                        Promo code
                      </p>
                      <p className="mt-1 truncate font-mono text-sm font-bold tracking-wider text-foreground">
                        {offer.code}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isExpired}
                      onClick={() => handleCopy(offer.code, offer.validUntil)}
                      aria-label={isCopied ? `Copied ${offer.code}` : `Copy ${offer.code}`}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition hover:bg-surface-muted focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {isCopied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {isExpired ? "This offer is no longer valid." : `Valid until ${offer.validTill}`}
                  </p>
                </div>

                {!isExpired && (
                  <button
                    type="button"
                    onClick={() => navigate("/search")}
                    className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-primary/30 px-4 text-sm font-semibold text-primary-dark transition-colors hover:bg-primary-soft focus-visible:outline-offset-2 dark:text-primary"
                  >
                    Browse flights <ArrowRight size={15} aria-hidden="true" />
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {copiedCode ? `${copiedCode} copied to clipboard.` : copyUnavailable ? "Clipboard access is unavailable." : ""}
      </p>
    </main>
  );
};

export default OffersPage;

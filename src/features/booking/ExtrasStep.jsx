import { Armchair, Check, Coffee, Luggage, ShieldCheck, Zap, ArrowLeft } from "lucide-react";
import Button from "../../components/ui/Button";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { setExtras, setBookingStep } from "./bookingSlice";
import { formatNaira } from "../../utils/formatNaira";

const baggageOptions = [
  { kg: 20, price: 0, label: "Standard 20 kg (Included)" },
  { kg: 30, price: 10000, label: "+10 kg Extra (30 kg total)" },
  { kg: 40, price: 18000, label: "+20 kg Extra (40 kg total)" },
];

const mealOptions = [
  { id: "Standard Meal", price: 0, desc: "Hot chicken or vegetarian daily entrée" },
  { id: "Asian Vegetarian", price: 0, desc: "Pure vegetarian meal with spiced lentils & rice" },
  { id: "Chef's Special", price: 4500, desc: "Nigerian Chef Suya Platter with Jollof Rice & Plantain" },
  { id: "Halal Meal", price: 0, desc: "Certified Halal prepared in dedicated facility" },
];

const AddOnCard = ({
  active,
  title,
  description,
  price,
  icon: Icon,
  onClick,
  actionLabel,
}) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={`flex min-h-48 w-full flex-col justify-between rounded-xl border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
      active
        ? "border-primary bg-primary-soft"
        : "border-border bg-surface hover:border-primary/40"
    }`}
  >
    <span>
      <span className="mb-3 flex items-center justify-between gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary-dark dark:text-primary">
          <Icon size={18} aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold text-primary-dark dark:text-primary">
          +{formatNaira(price)}
        </span>
      </span>
      <span className="block text-sm font-semibold text-foreground">{title}</span>
      <span className="mt-1.5 block text-sm leading-relaxed text-muted">
        {description}
      </span>
    </span>
    <span className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-sm font-medium text-foreground">
      <span
        aria-hidden="true"
        className={`inline-flex h-4 w-4 items-center justify-center rounded border ${
          active ? "border-primary bg-primary text-on-primary" : "border-border bg-surface"
        }`}
      >
        {active && <Check size={12} />}
      </span>
      {active ? "Added" : actionLabel}
    </span>
  </button>
);

const ExtrasStep = () => {
  const dispatch = useAppDispatch();
  const extras = useAppSelector((state) => state.booking.extras);

  const handleBaggageChange = (kg) => dispatch(setExtras({ baggageKg: kg }));
  const handleMealChange = (mealPreference) => dispatch(setExtras({ mealPreference }));
  const toggleInsurance = () =>
    dispatch(setExtras({ travelInsurance: !extras.travelInsurance }));
  const togglePriority = () =>
    dispatch(setExtras({ priorityBoarding: !extras.priorityBoarding }));
  const toggleLounge = () =>
    dispatch(setExtras({ loungeAccess: !extras.loungeAccess }));

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7" aria-labelledby="extras-title">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          Make it yours
        </p>
        <h2 id="extras-title" className="mt-1 text-xl font-semibold tracking-tight text-foreground">
          Customise your journey
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Select optional baggage, in-flight meals, and priority travel services.
        </p>
      </div>

      <div className="space-y-5">
        <fieldset className="rounded-xl border border-border p-4 sm:p-5">
          <legend className="px-1 text-sm font-semibold text-foreground">
            Checked baggage allowance
          </legend>
          <p className="mb-4 text-sm text-muted">
            Cabin baggage (7 kg) is always included free.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {baggageOptions.map((option) => {
              const selected = extras.baggageKg === option.kg;
              return (
                <button
                  type="button"
                  key={option.kg}
                  aria-pressed={selected}
                  onClick={() => handleBaggageChange(option.kg)}
                  className={`flex min-h-24 flex-col justify-between rounded-xl border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    selected
                      ? "border-primary bg-primary-soft"
                      : "border-border bg-surface hover:border-primary/40"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {option.kg} kg
                    </span>
                    <span className={`text-sm font-semibold ${option.price === 0 ? "text-success" : "text-primary-dark dark:text-primary"}`}>
                      {option.price === 0 ? "Included" : `+${formatNaira(option.price)}`}
                    </span>
                  </span>
                  <span className="mt-2 text-sm text-muted">{option.label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="rounded-xl border border-border p-4 sm:p-5">
          <legend className="px-1 text-sm font-semibold text-foreground">
            In-flight meal preference
          </legend>
          <p className="mb-4 text-sm text-muted">
            Choose the meal preference currently available for your itinerary.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {mealOptions.map((meal) => {
              const selected = extras.mealPreference === meal.id;
              return (
                <button
                  type="button"
                  key={meal.id}
                  aria-pressed={selected}
                  onClick={() => handleMealChange(meal.id)}
                  className={`flex min-h-28 flex-col justify-between rounded-xl border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    selected
                      ? "border-primary bg-primary-soft"
                      : "border-border bg-surface hover:border-primary/40"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">{meal.id}</span>
                    <span className={`shrink-0 text-xs font-semibold ${meal.price === 0 ? "text-success" : "text-primary-dark dark:text-primary"}`}>
                      {meal.price === 0 ? "Included" : `+${formatNaira(meal.price)}`}
                    </span>
                  </span>
                  <span className="mt-2 text-sm leading-relaxed text-muted">{meal.desc}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Protection and priority add-ons
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <AddOnCard
              active={extras.travelInsurance}
              title="Trip insurance"
              description="Emergency medical, flight delay and trip cancellation coverage."
              price={5000}
              icon={ShieldCheck}
              onClick={toggleInsurance}
              actionLabel="Add protection"
            />
            <AddOnCard
              active={extras.priorityBoarding}
              title="Priority boarding"
              description="Skip queues with a dedicated boarding lane and priority overhead bins."
              price={2500}
              icon={Zap}
              onClick={togglePriority}
              actionLabel="Add priority"
            />
            <AddOnCard
              active={extras.loungeAccess}
              title="Tiger Premium Lounge"
              description="3 hours access with gourmet buffet, showers, and panoramic airport views."
              price={8000}
              icon={Armchair}
              onClick={toggleLounge}
              actionLabel="Add lounge"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-border pt-5 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="secondary"
          onClick={() => dispatch(setBookingStep(2))}
          className="flex items-center justify-center gap-2"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to seat map
        </Button>
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={() => dispatch(setBookingStep(4))}
          className="flex items-center justify-center gap-2 px-6 sm:px-8"
        >
          Review booking summary
          <span aria-hidden="true">→</span>
        </Button>
      </div>
    </section>
  );
};

export { ExtrasStep };
export default ExtrasStep;

import { Luggage, Coffee, ShieldCheck, Zap, Armchair, ArrowLeft } from "lucide-react";
import Button from "../../components/ui/Button";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { setExtras, setBookingStep } from "./bookingSlice";
import { formatNaira } from "../../utils/formatNaira";
const ExtrasStep = () => {
  const dispatch = useAppDispatch();
  const extras = useAppSelector((state) => state.booking.extras);
  const handleBaggageChange = (kg) => {
    dispatch(setExtras({ baggageKg: kg }));
  };
  const handleMealChange = (meal) => {
    dispatch(setExtras({ mealPreference: meal }));
  };
  const toggleInsurance = () => {
    dispatch(setExtras({ travelInsurance: !extras.travelInsurance }));
  };
  const togglePriority = () => {
    dispatch(setExtras({ priorityBoarding: !extras.priorityBoarding }));
  };
  const toggleLounge = () => {
    dispatch(setExtras({ loungeAccess: !extras.loungeAccess }));
  };
  return <div className="bg-surface rounded-2xl p-6 md:p-8 shadow-sm border border-border">
      <div className="mb-6">
        <h2 className="text-xl font-black text-foreground">Customise Your Journey</h2>
        <p className="text-xs text-muted mt-1">
          Select optional baggage, in-flight meals, and priority travel services.
        </p>
      </div>

      <div className="space-y-6">
        {
    /* Baggage Selection */
  }
        <div className="border border-border rounded-xl p-5 hover:border-primary/40 transition">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Luggage size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Checked Baggage Allowance</h3>
              <p className="text-xs text-muted">Cabin baggage (7 kg) is always included free</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
    { kg: 20, price: 0, label: "Standard 20 kg (Included)" },
    { kg: 30, price: 1e4, label: "+10 kg Extra (30 kg total)" },
    { kg: 40, price: 18e3, label: "+20 kg Extra (40 kg total)" }
  ].map((option) => <label
    key={option.kg}
    onClick={() => handleBaggageChange(option.kg)}
    className={`p-3.5 rounded-xl border-2 flex flex-col justify-between cursor-pointer transition ${extras.baggageKg === option.kg ? "border-primary bg-primary/10" : "border-border hover:border-border"}`}
  >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-foreground">{option.kg} kg</span>
                  <span className={`text-xs font-bold ${option.price === 0 ? "text-emerald-600" : "text-primary"}`}>
                    {option.price === 0 ? "FREE" : `+${formatNaira(option.price)}`}
                  </span>
                </div>
                <p className="text-[11px] text-muted">{option.label}</p>
              </label>)}
          </div>
        </div>

        {
    /* Meal Choice */
  }
        <div className="border border-border rounded-xl p-5 hover:border-primary/40 transition">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-orange-50 text-secondary flex items-center justify-center">
              <Coffee size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">In-Flight Meal Preference</h3>
              <p className="text-xs text-muted">Prepared fresh by our award-winning Nigerian chefs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
    { id: "Standard Meal", price: 0, desc: "Hot chicken or vegetarian daily entr\xE9e" },
    { id: "Asian Vegetarian", price: 0, desc: "Pure vegetarian meal with spiced lentils & rice" },
    { id: "Chef's Special", price: 4500, desc: "Nigerian Chef Suya Platter with Jollof Rice & Plantain" },
    { id: "Halal Meal", price: 0, desc: "Certified Halal prepared in dedicated facility" }
  ].map((meal) => <label
    key={meal.id}
    onClick={() => handleMealChange(meal.id)}
    className={`p-3.5 rounded-xl border-2 flex flex-col justify-between cursor-pointer transition ${extras.mealPreference === meal.id ? "border-primary bg-primary/10" : "border-border hover:border-border"}`}
  >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-foreground">{meal.id}</span>
                  <span className={`text-xs font-bold ${meal.price === 0 ? "text-emerald-600" : "text-primary"}`}>
                    {meal.price === 0 ? "FREE" : `+${formatNaira(meal.price)}`}
                  </span>
                </div>
                <p className="text-[11px] text-muted">{meal.desc}</p>
              </label>)}
          </div>
        </div>

        {
    /* Protection & Priority Add-ons */
  }
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {
    /* Insurance */
  }
          <div
    onClick={toggleInsurance}
    className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${extras.travelInsurance ? "border-primary bg-primary/10" : "border-border hover:border-border"}`}
  >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <span className="text-xs font-bold text-primary">+₦5,000</span>
              </div>
              <h4 className="text-xs font-bold text-foreground">Trip Insurance</h4>
              <p className="text-[11px] text-muted mt-1">
                Emergency medical, flight delay and trip cancellation coverage.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-border flex items-center gap-2 text-xs font-semibold">
              <input type="checkbox" checked={extras.travelInsurance} readOnly className="accent-primary" />
              <span className="text-foreground">{extras.travelInsurance ? "Added" : "Add Protection"}</span>
            </div>
          </div>

          {
    /* Priority Boarding */
  }
          <div
    onClick={togglePriority}
    className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${extras.priorityBoarding ? "border-primary bg-primary/10" : "border-border hover:border-border"}`}
  >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-secondary flex items-center justify-center">
                  <Zap size={18} />
                </div>
                <span className="text-xs font-bold text-primary">+₦2,500</span>
              </div>
              <h4 className="text-xs font-bold text-foreground">Priority Boarding</h4>
              <p className="text-[11px] text-muted mt-1">
                Skip queues with dedicated boarding lane and priority overhead bins.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-border flex items-center gap-2 text-xs font-semibold">
              <input type="checkbox" checked={extras.priorityBoarding} readOnly className="accent-primary" />
              <span className="text-foreground">{extras.priorityBoarding ? "Added" : "Add Priority"}</span>
            </div>
          </div>

          {
    /* Lounge Access */
  }
          <div
    onClick={toggleLounge}
    className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${extras.loungeAccess ? "border-primary bg-primary/10" : "border-border hover:border-border"}`}
  >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Armchair size={18} />
                </div>
                <span className="text-xs font-bold text-primary">+₦8,000</span>
              </div>
              <h4 className="text-xs font-bold text-foreground">Tiger Premium Lounge</h4>
              <p className="text-[11px] text-muted mt-1">
                3 hours access with gourmet buffet, showers, and panoramic airport views.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-border flex items-center gap-2 text-xs font-semibold">
              <input type="checkbox" checked={extras.loungeAccess || false} readOnly className="accent-primary" />
              <span className="text-foreground">{extras.loungeAccess ? "Added" : "Add Lounge"}</span>
            </div>
          </div>
        </div>
      </div>

      {
    /* Navigation */
  }
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
        <Button
    type="button"
    variant="secondary"
    onClick={() => dispatch(setBookingStep(2))}
    className="flex items-center gap-2"
  >
          <ArrowLeft size={16} /> Back to Seat Map
        </Button>

        <Button
    type="button"
    variant="accent"
    size="lg"
    onClick={() => dispatch(setBookingStep(4))}
    className="px-8 font-bold"
  >
          Review Booking Summary →
        </Button>
      </div>
    </div>;
};
var stdin_default = ExtrasStep;
export {
  ExtrasStep,
  stdin_default as default
};

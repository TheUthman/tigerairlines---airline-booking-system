import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
const FlightForm = ({
  initialFlight,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const flightRecord = initialFlight || initialData;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      flightNumber: flightRecord?.flightNumber || "TG-105",
      originCode: flightRecord?.origin.code || "LOS",
      originCity: flightRecord?.origin.city || "Lagos",
      destCode: flightRecord?.destination.code || "ABV",
      destCity: flightRecord?.destination.city || "Abuja",
      departureTime: flightRecord?.departureTime || "09:00",
      arrivalTime: flightRecord?.arrivalTime || "10:05",
      departureDate: flightRecord?.departureDate || "2026-10-15",
      duration: flightRecord?.duration || "1h 05m",
      stops: flightRecord?.stops ?? 0,
      aircraft: flightRecord?.aircraft || "Airbus A320neo",
      priceEconomy: flightRecord?.priceEconomy || 45e3,
      priceBusiness: flightRecord?.priceBusiness || 15e4,
      availableSeatsEconomy: flightRecord?.availableSeatsEconomy || 45,
      availableSeatsBusiness: flightRecord?.availableSeatsBusiness || 8,
      status: flightRecord?.status || "SCHEDULED"
    }
  });
  useEffect(() => {
    if (flightRecord) {
      reset({
        flightNumber: flightRecord.flightNumber,
        originCode: flightRecord.origin.code,
        originCity: flightRecord.origin.city,
        destCode: flightRecord.destination.code,
        destCity: flightRecord.destination.city,
        departureTime: flightRecord.departureTime,
        arrivalTime: flightRecord.arrivalTime,
        departureDate: flightRecord.departureDate,
        duration: flightRecord.duration,
        stops: flightRecord.stops,
        aircraft: flightRecord.aircraft,
        priceEconomy: flightRecord.priceEconomy,
        priceBusiness: flightRecord.priceBusiness,
        availableSeatsEconomy: flightRecord.availableSeatsEconomy,
        availableSeatsBusiness: flightRecord.availableSeatsBusiness,
        status: flightRecord.status
      });
    }
  }, [flightRecord, reset]);
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
    label="Flight Number *"
    placeholder="e.g. TG-105"
    {...register("flightNumber", { required: "Required" })}
    error={errors.flightNumber?.message}
  />

        <Input
    label="Aircraft Model *"
    placeholder="e.g. Airbus A320neo"
    {...register("aircraft", { required: "Required" })}
    error={errors.aircraft?.message}
  />

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Flight Status
          </label>
          <select
    {...register("status")}
    className="w-full bg-surface border border-border rounded-lg p-2.5 text-xs font-semibold"
  >
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="BOARDING">BOARDING</option>
            <option value="DEPARTED">DEPARTED</option>
            <option value="DELAYED">DELAYED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Input
    label="Origin Airport Code *"
    placeholder="LOS"
    {...register("originCode", { required: "Required" })}
    error={errors.originCode?.message}
  />
        <Input
    label="Origin City *"
    placeholder="Lagos"
    {...register("originCity", { required: "Required" })}
    error={errors.originCity?.message}
  />
        <Input
    label="Dest Airport Code *"
    placeholder="ABV"
    {...register("destCode", { required: "Required" })}
    error={errors.destCode?.message}
  />
        <Input
    label="Dest City *"
    placeholder="Abuja"
    {...register("destCity", { required: "Required" })}
    error={errors.destCity?.message}
  />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Input
    label="Depart Time *"
    type="time"
    {...register("departureTime", { required: "Required" })}
    error={errors.departureTime?.message}
  />
        <Input
    label="Arrival Time *"
    type="time"
    {...register("arrivalTime", { required: "Required" })}
    error={errors.arrivalTime?.message}
  />
        <Input
    label="Flight Date *"
    type="date"
    {...register("departureDate", { required: "Required" })}
    error={errors.departureDate?.message}
  />
        <Input
    label="Duration *"
    placeholder="4h 15m"
    {...register("duration", { required: "Required" })}
    error={errors.duration?.message}
  />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Input
    label="Economy Price (₦) *"
    type="number"
    {...register("priceEconomy", { required: "Required", valueAsNumber: true })}
    error={errors.priceEconomy?.message}
  />
        <Input
    label="Business Price (₦) *"
    type="number"
    {...register("priceBusiness", { required: "Required", valueAsNumber: true })}
    error={errors.priceBusiness?.message}
  />
        <Input
    label="Economy Seats *"
    type="number"
    {...register("availableSeatsEconomy", { required: "Required", valueAsNumber: true })}
    error={errors.availableSeatsEconomy?.message}
  />
        <Input
    label="Business Seats *"
    type="number"
    {...register("availableSeatsBusiness", { required: "Required", valueAsNumber: true })}
    error={errors.availableSeatsBusiness?.message}
  />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading} className="font-bold">
          {initialFlight ? "Update Flight" : "Schedule New Flight"}
        </Button>
      </div>
    </form>;
};
var stdin_default = FlightForm;
export {
  FlightForm,
  stdin_default as default
};

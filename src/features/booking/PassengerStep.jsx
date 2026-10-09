import { useState } from "react";
import { useForm } from "react-hook-form";
import { User, Mail, Phone, FileText, Globe, Calendar } from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { setPassengers, setBookingStep } from "./bookingSlice";
import passengerService from "../../services/passengerService";
import { getApiErrorMessage } from "../../services/apiClient";
import { useToast } from "../../components/ui/Toast";
const PassengerStep = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const currentPassengers = useAppSelector((state) => state.booking.passengers);
  const user = useAppSelector((state) => state.auth.user);
  const [isSaving, setIsSaving] = useState(false);
  const isCustomer = user?.role === "CUSTOMER";
  const initial = currentPassengers[0] || {
    firstName: isCustomer && user ? user.name.split(" ")[0] : "",
    lastName: isCustomer && user ? user.name.split(" ")[1] || "" : "",
    email: isCustomer && user ? user.email : "",
    phone: "",
    passportNumber: "",
    nationality: "",
    dateOfBirth: "",
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: initial.firstName || "",
      lastName: initial.lastName || "",
      email: initial.email || "",
      phone: initial.phone || "",
      passportNumber: initial.passportNumber || "",
      nationality: initial.nationality || "",
      dateOfBirth: initial.dateOfBirth || "",
    },
  });
  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const response = await passengerService.getMyPassengers();
      const savedPassengers = Array.isArray(response.data) ? response.data : [];
      const normalize = (value) => value?.trim().toLocaleLowerCase() || "";
      const existingPassenger = savedPassengers.find(
        (passenger) =>
          normalize(passenger.firstName) === normalize(data.firstName) &&
          normalize(passenger.lastName) === normalize(data.lastName) &&
          passenger.dateOfBirth === data.dateOfBirth,
      );
      const passengerProfile =
        existingPassenger ||
        (
          await passengerService.createPassenger({
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth,
            phone: data.phone,
            passportNumber: data.passportNumber,
            nationality: data.nationality,
            savedTraveler: true,
          })
        ).data;
      const passengerId = Number(passengerProfile?.id);
      if (!Number.isSafeInteger(passengerId) || passengerId <= 0) {
        throw new Error("The passenger service did not return a valid passenger ID.");
      }

      dispatch(
        setPassengers([
          {
            id: passengerId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            passportNumber: data.passportNumber,
            dateOfBirth: data.dateOfBirth,
            nationality: data.nationality,
            seat: currentPassengers[0]?.seat || "12A",
            ticketNumber: "",
          },
        ]),
      );
      dispatch(setBookingStep(2));
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to save the passenger profile. Please try again.",
        ),
        "Passenger Details Not Saved",
      );
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="bg-surface rounded-2xl p-6 md:p-8 shadow-sm border border-border">
      <div className="mb-6">
        <h2 className="text-xl font-black text-foreground">
          Passenger Information
        </h2>
        <p className="text-xs text-muted mt-1">
          Please enter traveler details exactly as they appear on your passport
          or travel document.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First / Given Name *"
            placeholder="e.g. Jane"
            icon={<User size={16} />}
            {...register("firstName", { required: "First name is required" })}
            error={errors.firstName?.message}
          />

          <Input
            label="Last / Surname *"
            placeholder="e.g. Obi"
            icon={<User size={16} />}
            {...register("lastName", { required: "Last name is required" })}
            error={errors.lastName?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email Address *"
            type="email"
            placeholder="name@domain.com"
            icon={<Mail size={16} />}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            error={errors.email?.message}
          />

          <Input
            label="Mobile Phone *"
            placeholder="+234 803 123 4567"
            icon={<Phone size={16} />}
            {...register("phone", { required: "Phone number is required" })}
            error={errors.phone?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Passport / ID Number *"
            placeholder="e.g. A10293847"
            icon={<FileText size={16} />}
            {...register("passportNumber", {
              required: "Passport number is required",
            })}
            error={errors.passportNumber?.message}
          />

          <Input
            label="Nationality *"
            placeholder="e.g. Nigerian, British, American"
            icon={<Globe size={16} />}
            {...register("nationality", {
              required: "Nationality is required",
            })}
            error={errors.nationality?.message}
          />

          <Input
            label="Date of Birth *"
            type="date"
            icon={<Calendar size={16} />}
            {...register("dateOfBirth", {
              required: "Date of birth is required",
            })}
            error={errors.dateOfBirth?.message}
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button
            type="submit"
            variant="accent"
            size="lg"
            isLoading={isSaving}
            className="px-8 font-bold"
          >
            {isSaving ? "Saving passenger..." : "Continue to Seat Selection →"}
          </Button>
        </div>
      </form>
    </div>
  );
};
var stdin_default = PassengerStep;
export { PassengerStep, stdin_default as default };

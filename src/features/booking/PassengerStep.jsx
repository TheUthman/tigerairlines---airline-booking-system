import { useForm } from "react-hook-form";
import { User, Mail, Phone, FileText, Globe, Calendar } from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { setPassengers, setBookingStep } from "./bookingSlice";
const PassengerStep = () => {
  const dispatch = useAppDispatch();
  const currentPassengers = useAppSelector((state) => state.booking.passengers);
  const user = useAppSelector((state) => state.auth.user);
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
  const onSubmit = (data) => {
    dispatch(
      setPassengers([
        {
          id: "p-1",
          firstName: data.firstName,
          lastName: data.lastName,
          passportNumber: data.passportNumber,
          dateOfBirth: data.dateOfBirth,
          nationality: data.nationality,
          seat: currentPassengers[0]?.seat || "12A",
          ticketNumber: "",
        },
      ]),
    );
    dispatch(setBookingStep(2));
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
            className="px-8 font-bold"
          >
            Continue to Seat Selection →
          </Button>
        </div>
      </form>
    </div>
  );
};
var stdin_default = PassengerStep;
export { PassengerStep, stdin_default as default };

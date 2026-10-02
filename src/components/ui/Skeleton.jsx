const Skeleton = ({ className = "", variant = "rect", ...props }) => (
  <div
    className={`skeleton-shimmer ${variant === "circle" ? "rounded-full" : variant === "text" ? "rounded-md h-4" : "rounded-xl"} ${className}`}
    aria-hidden="true"
    {...props}
  />
);
const FlightCardSkeleton = () => {
  return (
    <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9" />
          <div className="space-y-1.5">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-32 h-3" />
          </div>
        </div>
        <Skeleton className="w-20 h-6" />
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="space-y-1.5">
          <Skeleton className="w-16 h-6" />
          <Skeleton className="w-24 h-3" />
        </div>
        <div className="flex flex-col items-center space-y-1">
          <Skeleton className="w-16 h-3" />
          <Skeleton className="w-36 h-2" />
        </div>
        <div className="space-y-1.5 text-right">
          <Skeleton className="w-16 h-6 ml-auto" />
          <Skeleton className="w-24 h-3" />
        </div>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between">
        <Skeleton className="w-28 h-4" />
        <Skeleton className="w-28 h-9 rounded-xl" />
      </div>
    </div>
  );
};
const TableRowSkeleton = ({ cols = 6 }) => {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton
            className={`h-4 ${i === 0 ? "w-20" : i === 1 ? "w-32" : "w-24"}`}
          />
        </td>
      ))}
    </tr>
  );
};
const TripCardSkeleton = () => (
  <div
    className="bg-surface rounded-2xl p-6 border border-border space-y-5"
    aria-hidden="true"
  >
    <div className="flex items-center justify-between border-b border-border pb-3">
      <div className="space-y-2">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-32 h-3" />
      </div>
      <Skeleton className="w-20 h-6" />
    </div>
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="w-24 h-5" />
        <Skeleton className="w-28 h-3" />
      </div>
      <Skeleton className="w-16 h-8" />
      <div className="space-y-2">
        <Skeleton className="w-24 h-5" />
        <Skeleton className="w-28 h-3" />
      </div>
    </div>
    <Skeleton className="w-full h-14" />
  </div>
);
var stdin_default = Skeleton;
export {
  FlightCardSkeleton,
  Skeleton,
  TableRowSkeleton,
  TripCardSkeleton,
  stdin_default as default,
};

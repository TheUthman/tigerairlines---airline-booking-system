import { ChevronRight, ArrowRight } from "lucide-react";
const SearchResultsLayout = ({
  originCode,
  originCity,
  destinationCode,
  destinationCity,
  cabinClass = "Economy",
  departureDate,
  dateStripSlot,
  filterSidebarSlot,
  children,
  headerActionSlot
}) => {
  return <div className="min-h-screen bg-background py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {
    /* Breadcrumb & Route Banner */
  }
        <div className="bg-surface rounded-3xl p-6 shadow-sm border border-border flex flex-wrap items-center justify-between gap-4">
          <div>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              <span>Flights</span>
              <ChevronRight size={12} />
              <span>West Africa Network</span>
              <ChevronRight size={12} />
              <span className="text-muted">Search Results</span>
            </nav>

            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-black text-foreground flex items-center gap-2">
                <span>{originCity || originCode}</span>
                <span className="text-muted font-mono text-sm">({originCode})</span>
                <ArrowRight size={20} className="inline text-primary" />
                <span>{destinationCity || destinationCode}</span>
                <span className="text-muted font-mono text-sm">({destinationCode})</span>
              </h1>
              <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-primary/20">
                {cabinClass} Class
              </span>
            </div>

            {departureDate && <p className="text-xs text-muted mt-1 font-medium">
                Departing: {new Date(departureDate).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  })}
              </p>}
          </div>

          {headerActionSlot && <div>{headerActionSlot}</div>}
        </div>

        {
    /* Flexible Date Strip Slot */
  }
        {dateStripSlot && <div>{dateStripSlot}</div>}

        {
    /* 2-Column Responsive Layout: Sidebar Filters + Results Feed */
  }
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {
    /* Filter Sidebar Slot (1 col) */
  }
          <aside className="lg:col-span-1" aria-label="Flight Search Filters">
            {filterSidebarSlot}
          </aside>

          {
    /* Results Slot (3 cols) */
  }
          <main className="lg:col-span-3 space-y-4">
            {children}
          </main>
        </div>
      </div>
    </div>;
};
var stdin_default = SearchResultsLayout;
export {
  SearchResultsLayout,
  stdin_default as default
};

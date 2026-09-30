import { useState } from "react";
import {
  Plane,
  Sparkles,
  Shield,
  Mail,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  Palette,
  Type
} from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Badge from "../components/ui/Badge";
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import Tabs from "../components/ui/Tabs";
import Modal from "../components/ui/Modal";
import Carousel from "../components/ui/Carousel";
import Accordion from "../components/ui/Accordion";
import { useToast } from "../components/ui/Toast";
const StyleGuidePage = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [activePillTab, setActivePillTab] = useState("one-way");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectVal, setSelectVal] = useState("economy");
  const [inputVal, setInputVal] = useState("");
  const accordionItems = [
    {
      id: "baggage",
      title: "What baggage allowance is included with my ticket?",
      icon: <Layers size={18} />,
      content: "All economy fares include 23 kg checked baggage and 7 kg cabin baggage. Business class passengers receive 40 kg checked luggage across up to 2 pieces.",
      badge: "Baggage"
    },
    {
      id: "checkin",
      title: "When does online check-in open and close?",
      icon: <Calendar size={18} />,
      content: "Online check-in opens 24 hours prior to departure and closes 60 minutes before scheduled takeoff for domestic flights, and 90 minutes for international.",
      badge: "Check-In"
    },
    {
      id: "cancellation",
      title: "How do refunds work for voluntary cancellations?",
      icon: <Shield size={18} />,
      content: "Cancellations made at least 4 hours before departure are refunded to your original payment method minus a flat \u20A615,000 airline processing fee.",
      badge: "Refunds"
    }
  ];
  return <div className="min-h-screen bg-background py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {
    /* Header */
  }
        <div className="bg-surface rounded-3xl p-8 shadow-sm border border-border">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles size={14} /> TigerAirlines Design System
              </div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                Component Library & Style Guide
              </h1>
              <p className="text-sm text-muted mt-1 max-w-2xl">
                Internal reference specifications for Peculiar, Favor, and Soliat. Built from the TigerAirlines brand palette and Tailwind CSS design tokens.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
    variant="outline"
    size="sm"
    onClick={() => toast.info("Style Guide Version 1.0 (Nigerian Localization Active)")}
  >
                Inspect Tokens
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
                Test Modal
              </Button>
            </div>
          </div>
        </div>

        {
    /* SECTION 1: Brand Colors & Tokens */
  }
        <section className="bg-surface rounded-3xl p-8 shadow-sm border border-border space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <Palette className="text-primary" size={20} />
            <h2 className="text-lg font-black text-foreground">Brand Color Tokens</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-background text-foreground border border-border shadow-sm space-y-1">
              <p className="text-xs font-bold">Background</p>
              <p className="font-mono text-[11px] text-muted">#FAF7F2 / #111111</p>
              <span className="text-[10px] block text-muted">Page canvas</span>
            </div>
            <div className="p-4 rounded-2xl bg-surface text-foreground border border-border shadow-sm space-y-1">
              <p className="text-xs font-bold">Surface</p>
              <p className="font-mono text-[11px] text-muted">#FFFFFF / #242424</p>
              <span className="text-[10px] block text-muted">Cards & panels</span>
            </div>
            <div className="p-4 rounded-2xl bg-primary text-on-primary shadow-sm space-y-1">
              <p className="text-xs font-bold">Primary</p>
              <p className="font-mono text-[11px] opacity-80">#E87516 / #F28C28</p>
              <span className="text-[10px] block opacity-70">Brand & primary CTA</span>
            </div>
            <div className="p-4 rounded-2xl bg-secondary text-on-secondary shadow-sm space-y-1">
              <p className="text-xs font-bold">Secondary</p>
              <p className="font-mono text-[11px] opacity-80">#FFB52E</p>
              <span className="text-[10px] block opacity-70">Accents & highlights</span>
            </div>
            <div className="p-4 rounded-2xl bg-foreground text-background shadow-sm space-y-1">
              <p className="text-xs font-bold">Text</p>
              <p className="font-mono text-[11px] opacity-80">#171717 / #FFFFFF</p>
              <span className="text-[10px] block opacity-70">Headings & body</span>
            </div>
            <div className="p-4 rounded-2xl bg-surface-muted text-muted border border-border shadow-sm space-y-1">
              <p className="text-xs font-bold">Muted Text</p>
              <p className="font-mono text-[11px]">#6B7280 / #8A8F98</p>
              <span className="text-[10px] block">Labels & helper copy</span>
            </div>
          </div>
        </section>

        {
    /* SECTION 2: Buttons */
  }
        <section className="bg-surface rounded-3xl p-8 shadow-sm border border-border space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <Plane className="text-primary" size={20} />
            <h2 className="text-lg font-black text-foreground">Buttons (<code className="text-xs bg-surface-muted px-2 py-0.5 rounded">Button</code>)</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Variants</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="accent">Accent</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <div className="bg-[#111111] p-2 rounded-xl inline-flex">
                  <Button variant="white">White on Dark</Button>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Sizes & Shapes</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small (sm)</Button>
                <Button size="md">Medium (md)</Button>
                <Button size="lg">Large (lg)</Button>
                <Button pill variant="primary">Pill Rounded</Button>
                <Button size="icon" variant="secondary" aria-label="Icon Button"><Plane size={16} /></Button>
                <Button isLoading variant="primary">Loading State</Button>
                <Button disabled variant="primary">Disabled</Button>
              </div>
            </div>
          </div>
        </section>

        {
    /* SECTION 3: Form Controls (Input & Select) */
  }
        <section className="bg-surface rounded-3xl p-8 shadow-sm border border-border space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <Type className="text-primary" size={20} />
            <h2 className="text-lg font-black text-foreground">Form Inputs (<code className="text-xs bg-surface-muted px-2 py-0.5 rounded">Input</code> & <code className="text-xs bg-surface-muted px-2 py-0.5 rounded">Select</code>)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
    label="Standard Input"
    placeholder="e.g. Chukwuemeka Obi"
    value={inputVal}
    onChange={(e) => setInputVal(e.target.value)}
    helperText="Helper text provides contextual guidance"
  />
            <Input
    label="Input with Icon"
    placeholder="name@tigerairlines.com.ng"
    type="email"
    icon={<Mail size={16} />}
  />
            <Input
    label="Input with Validation Error"
    defaultValue="invalid-entry"
    error="Password must contain at least 8 characters"
  />
            <Select
    label="Cabin Class Selector"
    value={selectVal}
    onChange={(e) => setSelectVal(e.target.value)}
    options={[
      { value: "economy", label: "Economy Class" },
      { value: "premium", label: "Premium Economy" },
      { value: "business", label: "Royal Business Class" }
    ]}
  />
            <Input
    label="Search Flight Number"
    placeholder="e.g. TG-101"
    icon={<Search size={16} />}
  />
            <Input
    label="Disabled Input"
    disabled
    defaultValue="Lagos (LOS) - Locked origin"
  />
          </div>
        </section>

        {
    /* SECTION 4: Badges */
  }
        <section className="bg-surface rounded-3xl p-8 shadow-sm border border-border space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <Sparkles className="text-primary" size={20} />
            <h2 className="text-lg font-black text-foreground">Badges (<code className="text-xs bg-surface-muted px-2 py-0.5 rounded">Badge</code>)</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="primary">Primary Red</Badge>
            <Badge variant="accent">Accent Orange</Badge>
            <Badge variant="success">Confirmed (Success)</Badge>
            <Badge variant="warning">Delayed (Warning)</Badge>
            <Badge variant="blue">Boarding (Info)</Badge>
            <Badge variant="neutral">Draft (Neutral)</Badge>
            <Badge variant="primary" size="sm">Small Badge</Badge>
          </div>
        </section>

        {
    /* SECTION 5: Cards & Layout */
  }
        <section className="bg-surface rounded-3xl p-8 shadow-sm border border-border space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <Layers className="text-primary" size={20} />
            <h2 className="text-lg font-black text-foreground">Cards (<code className="text-xs bg-surface-muted px-2 py-0.5 rounded">Card</code>)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card variant="default" hoverEffect>
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>With hover effect enabled</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted">Standard card used across flights, bookings, and dashboard KPI cards.</p>
              </CardContent>
              <CardFooter>
                <Badge variant="success" size="sm">Active</Badge>
                <span className="text-[11px] font-mono text-muted">#001</span>
              </CardFooter>
            </Card>

            <Card variant="outline">
              <CardHeader>
                <CardTitle>Outline Card</CardTitle>
                <CardDescription>Clean border style</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted">High contrast card suitable for secondary panels or setting groups.</p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>Deep drop-shadow</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted">Used for search widgets, checkout summaries, and priority alerts.</p>
              </CardContent>
              <CardFooter>
                <Button variant="primary" size="sm">Select</Button>
              </CardFooter>
            </Card>

            <Card variant="flat">
              <CardHeader>
                <CardTitle>Flat Card</CardTitle>
                <CardDescription>Subtle grey canvas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted">Recessed styling for in-form item rows and secondary summaries.</p>
              </CardContent>
              <CardFooter>
                <span className="text-xs font-bold text-foreground">₦45,000</span>
              </CardFooter>
            </Card>
          </div>
        </section>

        {
    /* SECTION 6: Tabs */
  }
        <section className="bg-surface rounded-3xl p-8 shadow-sm border border-border space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <Layers className="text-primary" size={20} />
            <h2 className="text-lg font-black text-foreground">Tabs (<code className="text-xs bg-surface-muted px-2 py-0.5 rounded">Tabs</code>)</h2>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Underline Variant</p>
              <Tabs
    activeTab={activeTab}
    onChange={setActiveTab}
    tabs={[
      { id: "all", label: "All Flights", badge: 14 },
      { id: "scheduled", label: "Scheduled", badge: 8 },
      { id: "delayed", label: "Delayed", badge: 2 },
      { id: "completed", label: "Completed" }
    ]}
  />
            </div>

            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Pills Variant</p>
              <Tabs
    variant="pills"
    activeTab={activePillTab}
    onChange={setActivePillTab}
    tabs={[
      { id: "one-way", label: "One Way" },
      { id: "round-trip", label: "Round Trip" },
      { id: "multi-city", label: "Multi-City" }
    ]}
  />
            </div>
          </div>
        </section>

        {
    /* SECTION 7: Accordion */
  }
        <section className="bg-surface rounded-3xl p-8 shadow-sm border border-border space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <Layers className="text-primary" size={20} />
            <h2 className="text-lg font-black text-foreground">Accordion (<code className="text-xs bg-surface-muted px-2 py-0.5 rounded">Accordion</code>)</h2>
          </div>

          <div className="max-w-3xl">
            <Accordion
    items={accordionItems}
    defaultExpanded={["baggage"]}
    variant="bordered"
  />
          </div>
        </section>

        {
    /* SECTION 8: Carousel */
  }
        <section className="bg-surface rounded-3xl p-8 shadow-sm border border-border space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <Sparkles className="text-primary" size={20} />
            <h2 className="text-lg font-black text-foreground">Carousel (<code className="text-xs bg-surface-muted px-2 py-0.5 rounded">Carousel</code>)</h2>
          </div>

          <div className="max-w-2xl">
            <Carousel autoPlay interval={4e3} className="h-64 shadow-md">
              <div className="relative h-full bg-gradient-to-r from-red-900 to-primary p-8 text-white flex flex-col justify-center">
                <span className="text-xs font-black uppercase tracking-wider text-secondary">Exclusive Offer</span>
                <h3 className="text-2xl font-black mt-1">Lagos to London Heathrow</h3>
                <p className="text-xs opacity-90 mt-2">Fly daily with lie-flat seating, gourmet Nigerian catering, and zero booking fee.</p>
                <div className="mt-4">
                  <Button variant="accent" size="sm">Book From ₦480,000</Button>
                </div>
              </div>

              <div className="relative h-full bg-gradient-to-r from-[#111111] to-[#242424] p-8 text-white flex flex-col justify-center">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Domestic Shuttle</span>
                <h3 className="text-2xl font-black mt-1">Lagos ↔ Abuja Hourly Commuter</h3>
                <p className="text-xs opacity-90 mt-2">Early morning to evening departures. On-time performance backed by TigerGuarantee.</p>
                <div className="mt-4">
                  <Button variant="primary" size="sm">Book From ₦45,000</Button>
                </div>
              </div>

              <div className="relative h-full bg-gradient-to-r from-orange-950 to-amber-900 p-8 text-white flex flex-col justify-center">
                <span className="text-xs font-black uppercase tracking-wider text-secondary">Holiday Getaway</span>
                <h3 className="text-2xl font-black mt-1">Discover Calabar & Obudu</h3>
                <p className="text-xs opacity-90 mt-2">Experience mountain clouds, lush rainforests, and authentic cultural hospitality.</p>
                <div className="mt-4">
                  <Button variant="white" size="sm">Explore Packages</Button>
                </div>
              </div>
            </Carousel>
          </div>
        </section>

        {
    /* SECTION 9: Toast Notifications & Feedback */
  }
        <section className="bg-surface rounded-3xl p-8 shadow-sm border border-border space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <CheckCircle2 className="text-primary" size={20} />
            <h2 className="text-lg font-black text-foreground">Toast Notifications (<code className="text-xs bg-surface-muted px-2 py-0.5 rounded">useToast</code>)</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
    variant="outline"
    size="sm"
    onClick={() => toast.success("Booking reference TG88JK confirmed successfully!")}
  >
              Trigger Success Toast
            </Button>
            <Button
    variant="outline"
    size="sm"
    onClick={() => toast.error("Authentication failed: Invalid credentials provided.")}
  >
              Trigger Error Toast
            </Button>
            <Button
    variant="outline"
    size="sm"
    onClick={() => toast.warning("Weather Advisory: Harmattan haze reported in Kano.")}
  >
              Trigger Warning Toast
            </Button>
            <Button
    variant="outline"
    size="sm"
    onClick={() => toast.info("Verification code sent to your registered email.")}
  >
              Trigger Info Toast
            </Button>
          </div>
        </section>
      </div>

      {
    /* Demo Modal */
  }
      <Modal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    title="Design System Demo Dialog"
    description="Standard modal dialog with backdrop blur, keyboard ESC dismissal, and customizable maxWidth."
  >
        <div className="space-y-4 text-xs text-muted">
          <p>
            This modal demonstrates the standard TigerAirlines dialog wrapper with built-in accessibility, scrolling containers, and responsive layouts.
          </p>
          <div className="p-3.5 bg-background rounded-xl border border-border flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>Ready for use in confirmation flows, seat selection modals, and authentication dialogs.</span>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={() => {
    setIsModalOpen(false);
    toast.success("Action executed from modal!");
  }}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>;
};
var stdin_default = StyleGuidePage;
export {
  StyleGuidePage,
  stdin_default as default
};

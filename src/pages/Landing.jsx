import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Plane,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Star,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SearchWidget from "../features/search/SearchWidget";
import { useAppDispatch } from "../app/store";
import { setSearchParams } from "../features/booking/bookingSlice";

gsap.registerPlugin(ScrollTrigger);
const Landing = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const landingRef = useRef(null);
  const searchRef = useRef(null);
  const testimonialContainerRef = useRef(null);
  const slideDirection = useRef(1);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [originFilter, setOriginFilter] = useState("LAGOS");
  const destinationsByOrigin = {
    LAGOS: [
      {
        city: "Abuja",
        country: "Nigeria",
        code: "ABV",
        cabin: "Economy",
        price: "\u20A645,000",
        image:
          "https://images.unsplash.com/photo-1707406534088-09c4b6958cfa?q=80&w=1933&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        city: "Dubai",
        country: "UAE",
        code: "DXB",
        cabin: "Economy",
        price: "\u20A6420,000",
        image:
          "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80",
      },
      {
        city: "London",
        country: "United Kingdom",
        code: "LHR",
        cabin: "Economy",
        price: "\u20A6480,000",
        image:
          "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&auto=format&fit=crop&q=80",
      },
    ],
    ABUJA: [
      {
        city: "Lagos",
        country: "Nigeria",
        code: "LOS",
        cabin: "Economy",
        price: "\u20A645,000",
        image:
          "https://images.unsplash.com/photo-1618116573990-9db6c93b86a5?w=600&auto=format&fit=crop&q=80",
      },
      {
        city: "Port Harcourt",
        country: "Nigeria",
        code: "PHC",
        cabin: "Economy",
        price: "\u20A638,000",
        image:
          "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&auto=format&fit=crop&q=80",
      },
      {
        city: "London",
        country: "United Kingdom",
        code: "LHR",
        cabin: "Economy",
        price: "\u20A6495,000",
        image:
          "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&auto=format&fit=crop&q=80",
      },
    ],
  };
  const destinations = destinationsByOrigin[originFilter];
  const nigeriaHighlights = [
    {
      title: "Lagos",
      description:
        "Africa's most vibrant city \u2014 from Victoria Island skylines to Lekki beach sunsets.",
      image:
        "https://images.unsplash.com/photo-1648023199223-25d3622bcb13?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      code: "LOS",
    },
    {
      title: "Abuja",
      description:
        "Nigeria's serene capital city, home to Aso Rock and the iconic National Mosque.",
      image:
        "https://images.unsplash.com/photo-1721642472312-cd30e9bd7cac?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      code: "ABV",
    },
    {
      title: "Port Harcourt",
      description:
        "The Garden City \u2014 gateway to the Niger Delta and hub of Nigeria's oil industry.",
      image:
        "https://plus.unsplash.com/premium_photo-1671089657680-9d86ebc74976?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      code: "PHC",
    },
  ];
  const deals = [
    {
      id: 1,
      badge: "Current Offer",
      title: "FLY TO LONDON GET 20% OFF",
      desc: "Exclusive seasonal discount on Economy class tickets from Lagos to London.",
      buttonText: "Book Now",
      isHighlight: true,
      destinationCode: "LHR",
    },
    {
      id: 2,
      badge: "Special This Month",
      title: "GET 5% OFF",
      subtitle: "on all domestic round-trip flights",
      validity: "valid until 1 June 2026",
      buttonText: "Book Now",
      isHighlight: false,
      destinationCode: "ABV",
    },
    {
      id: 3,
      badge: "Flash Deal",
      title: "Fly To Abuja",
      subtitle: "From Lagos this weekend",
      priceHighlight: "FROM \u20A645,000",
      buttonText: "Book Now",
      isHighlight: false,
      destinationCode: "ABV",
    },
    {
      id: 4,
      badge: "What's New",
      title: "Use coupon code",
      couponCode: "TIGER2026",
      validity: "valid until 1 June 2026",
      buttonText: "Book Now",
      isHighlight: false,
      destinationCode: "DXB",
    },
  ];
  const testimonials = [
    {
      initial: "C",
      name: "Verified Traveler",
      location: "Lagos, Nigeria",
      quote:
        "Booked Lagos to London with TigerAirlines and the experience was world-class from start to finish. Check-in was seamless and the business class seats were incredible.",
      stars: 5,
    },
    {
      initial: "N",
      name: "Business Traveler",
      location: "Abuja, Nigeria",
      quote:
        "I fly Lagos\u2013Abuja almost weekly for work. TigerAirlines is always on time, the app works perfectly, and boarding is the smoothest I have experienced on any Nigerian route.",
      stars: 5,
    },
    {
      initial: "A",
      name: "Frequent Flyer",
      location: "Port Harcourt, Nigeria",
      quote:
        "The team at TigerAirlines went above and beyond when my connecting flight was delayed. They rebooked me instantly and even offered a lounge pass. Truly Nigerian hospitality!",
      stars: 5,
    },
  ];
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const heroTimeline = gsap.timeline({ defaults: { ease: "power2.out" } });
      heroTimeline
        .from(".hero-headline-1", { y: 22, opacity: 0, duration: 0.45 })
        .from(
          ".hero-headline-2",
          { y: 18, opacity: 0, duration: 0.4 },
          "-=0.25",
        )
        .from(
          ".hero-book-btn",
          { scale: 0.92, opacity: 0, duration: 0.35 },
          "-=0.15",
        );
      gsap.from(".search-widget-wrapper", {
        y: 28,
        opacity: 0,
        duration: 0.45,
        delay: 0.2,
        ease: "power2.out",
      });
      const setupScrollAnimation = (sectionClass, cardClass, stagger = 0.1) => {
        const sectionEl = landingRef.current?.querySelector(sectionClass);
        if (!sectionEl) return null;
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const cards = landingRef.current?.querySelectorAll(cardClass);
                if (cards && cards.length > 0) {
                  gsap.fromTo(
                    cards,
                    { opacity: 0, y: 24 },
                    {
                      opacity: 1,
                      y: 0,
                      duration: 0.42,
                      stagger,
                      ease: "power2.out",
                    },
                  );
                }
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.05, rootMargin: "0px 0px 50px 0px" },
        );
        observer.observe(sectionEl);
        return observer;
      };
      const obs1 = setupScrollAnimation(
        ".destinations-section",
        ".destination-card",
        0.1,
      );
      const obs2 = setupScrollAnimation(
        ".nigeria-section",
        ".nigeria-card",
        0.1,
      );
      const obs3 = setupScrollAnimation(
        ".deals-section",
        ".promo-deal-card",
        0.08,
      );
      return () => {
        obs1?.disconnect();
        obs2?.disconnect();
        obs3?.disconnect();
      };
    },
    { scope: landingRef },
  );
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      if (testimonialContainerRef.current) {
        gsap.fromTo(
          testimonialContainerRef.current,
          { opacity: 0, x: slideDirection.current * 24 },
          { opacity: 1, x: 0, duration: 0.32, ease: "power2.out" },
        );
      }
    },
    { dependencies: [testimonialIndex], scope: landingRef },
  );
  const handleTestimonialChange = (nextIndex) => {
    slideDirection.current = nextIndex > testimonialIndex ? 1 : -1;
    setTestimonialIndex(nextIndex);
  };
  const handleBookDeal = (destCode) => {
    dispatch(
      setSearchParams({
        originCode: originFilter === "ABUJA" ? "ABV" : "LOS",
        destinationCode: destCode,
        departDate: "2026-10-15",
        returnDate: "2026-10-22",
        tripType: "roundTrip",
        cabinClass: "Economy",
        passengersCount: 1,
      }),
    );
    const fromCode = originFilter === "ABUJA" ? "ABV" : "LOS";
    navigate(`/search?from=${fromCode}&to=${destCode}&depart=2026-10-15`);
  };
  return (
    <div ref={landingRef} className="bg-background">
      <section className="relative min-h-[500px] overflow-hidden md:min-h-[620px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/tiger-airlines-hero.png')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-40 pt-16 md:px-8 md:pt-24">
          <div className="max-w-2xl text-white">
            <p className="hero-headline-1 mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              TigerAirlines Nigeria
            </p>
            <h1 className="text-4xl font-bold leading-[1.06] tracking-tight sm:text-5xl md:text-7xl">
              <span className="hero-headline-1 block">
                Nigeria connects the world
              </span>
              <span className="hero-headline-2 block text-white drop-shadow-sm">
                Flights from ₦380,000
              </span>
            </h1>

            <div className="mt-8 hero-book-btn">
              <button
                onClick={() =>
                  searchRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  })
                }
                className="inline-flex min-h-12 items-center gap-2.5 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-on-primary shadow-lg shadow-black/15 transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer md:text-base"
              >
                <span>Book now</span>
                <Send size={16} className="transform rotate-45" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div
        ref={searchRef}
        className="-mt-20 md:-mt-24 relative z-30 mb-12 search-widget-wrapper"
      >
        <SearchWidget />
      </div>

      <section className="destinations-section py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-1.5 text-xl md:text-2xl font-black text-foreground tracking-tight">
            <span>Destinations from</span>
            <button
              onClick={() =>
                setOriginFilter(originFilter === "LAGOS" ? "ABUJA" : "LAGOS")
              }
              className="inline-flex items-center gap-1 text-foreground border-b-2 border-foreground font-extrabold hover:text-primary hover:border-primary transition pb-0.5 cursor-pointer"
            >
              <span>{originFilter}</span>
              <ChevronDown size={18} />
            </button>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-10">
          {destinations.map((dest) => (
            <button
              type="button"
              key={dest.city}
              onClick={() => handleBookDeal(dest.code)}
              className="destination-card group relative block h-72 w-full cursor-pointer overflow-hidden rounded-xl p-0 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:h-80"
            >
              <img
                src={dest.image}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm ring-1 ring-black/10">
                <img
                  src="/logo.svg"
                  width="26"
                  height="26"
                  alt=""
                  className="object-contain"
                />
              </div>
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/30 to-transparent p-5 text-white">
                <h3 className="text-xl font-semibold tracking-tight">
                  {dest.city}
                </h3>
                <p className="text-sm font-medium text-white/80">
                  {dest.cabin}
                </p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-xs text-white/70">From</span>
                  <span className="text-lg font-semibold text-white">
                    {dest.price}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate("/destinations")}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-primary px-6 text-sm font-semibold text-primary transition-colors duration-150 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
          >
            Discover all destinations
          </button>
        </div>
      </section>

      {}
      <section className="nigeria-section py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-black text-center text-foreground tracking-tight mb-10">
          Explore Nigeria
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-10">
          {nigeriaHighlights.map((place, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => handleBookDeal(place.code)}
              className="nigeria-card group relative block h-72 w-full cursor-pointer overflow-hidden rounded-xl p-0 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:h-80"
            >
              <img
                src={place.image}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-5 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{place.title}</h3>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-colors group-hover:bg-primary group-hover:text-on-primary">
                    <ChevronRight size={16} aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/80">
                  {place.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate("/destinations")}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-primary px-6 text-sm font-semibold text-primary transition-colors duration-150 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
          >
            Explore more of Nigeria
          </button>
        </div>
      </section>

      {/* SECTION 3: Perfect deals for you */}
      <section className="deals-section relative py-20 px-4 md:px-8 overflow-hidden bg-white/10 text-white">
        {/* Airplane in clouds background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=1600&auto=format&fit=crop&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-sky-900/60 backdrop-blur-xs" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-sky-900/40 to-background/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center tracking-tight mb-12 text-white drop-shadow-sm">
            Perfect deals for you
          </h2>

          {/* Cards Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {deals.map((deal) => {
              if (deal.isHighlight) {
                return (
                  <div
                    key={deal.id}
                    className="promo-deal-card flex h-64 flex-col justify-between rounded-xl border border-white/10 bg-secondary p-6 shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-0.5"
                  >
                    <div>
                      <span className="text-xs font-semibold text-white/90 uppercase tracking-wider block mb-3 border-b border-white/20 pb-2">
                        {deal.badge}
                      </span>
                      <h3 className="text-xl font-extrabold text-white leading-tight">
                        {deal.title}
                      </h3>
                      {deal.desc && (
                        <p className="text-xs text-white/80 mt-2 font-medium">
                          {deal.desc}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleBookDeal(deal.destinationCode)}
                      className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary cursor-pointer"
                    >
                      {deal.buttonText}
                    </button>
                  </div>
                );
              }
              return (
                <div
                  key={deal.id}
                  className="promo-deal-card flex h-64 flex-col justify-between rounded-xl border border-border bg-surface p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div>
                    <span className="mb-3 block border-b border-border pb-2 text-xs font-medium text-muted">
                      {deal.badge}
                    </span>
                    <h3 className="text-lg font-semibold leading-snug text-foreground">
                      {deal.title}
                    </h3>
                    {deal.subtitle && (
                      <p className="mt-1 text-sm text-muted">{deal.subtitle}</p>
                    )}
                    {deal.couponCode && (
                      <div className="mt-2 inline-block rounded-md bg-primary-soft px-2.5 py-1 font-mono text-sm font-semibold tracking-wider text-primary-dark">
                        {deal.couponCode}
                      </div>
                    )}
                    {deal.priceHighlight && (
                      <p className="mt-1 text-base font-semibold text-primary-dark">
                        {deal.priceHighlight}
                      </p>
                    )}
                    {deal.validity && (
                      <p className="mt-1 text-xs text-muted">{deal.validity}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleBookDeal(deal.destinationCode)}
                    className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
                  >
                    {deal.buttonText}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate("/offers")}
              className="inline-flex items-center justify-center px-8 py-2.5 rounded-full bg-secondary text-on-secondary font-bold text-sm hover:bg-secondary-hover transition cursor-pointer shadow-md"
            >
              View all offers
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4: What Our Passengers Say */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-black text-center text-foreground tracking-tight mb-4">
          What Our Passengers Say
        </h2>
        <p className="text-xs text-center text-muted max-w-md mx-auto mb-10">
          Verified experiences from Nigerians who flew aboard TigerAirlines
          across Africa and beyond.
        </p>

        {/* Animated Testimonial Slide Container */}
        <div className="max-w-2xl mx-auto min-h-[170px] relative mb-8">
          <div
            ref={testimonialContainerRef}
            className="bg-surface rounded-2xl p-7 shadow-md border border-border flex flex-col justify-between"
          >
            <div>
              {/* Header: Initial, Name, Location */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-on-primary shadow-sm">
                    {testimonials[testimonialIndex].initial}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground leading-tight">
                      {testimonials[testimonialIndex].name}
                    </h4>
                    <p className="text-[11px] text-muted font-medium">
                      {testimonials[testimonialIndex].location}
                    </p>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 text-primary">
                  {[...Array(testimonials[testimonialIndex].stars)].map(
                    (_, i) => (
                      <Star key={i} size={15} className="fill-current" />
                    ),
                  )}
                </div>
              </div>

              {/* Quote */}
              <p className="text-sm text-foreground italic leading-relaxed">
                "{testimonials[testimonialIndex].quote}"
              </p>
            </div>
          </div>
        </div>

        {/* Testimonials Controls & Dot Indicators */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() =>
              handleTestimonialChange(
                testimonialIndex > 0
                  ? testimonialIndex - 1
                  : testimonials.length - 1,
              )
            }
            className="w-8 h-8 rounded-full border border-border text-muted hover:text-primary hover:border-primary flex items-center justify-center transition cursor-pointer"
            aria-label="Previous Testimonial"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleTestimonialChange(idx)}
                aria-label={`View testimonial ${idx + 1}`}
                aria-pressed={testimonialIndex === idx}
                className={`h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${testimonialIndex === idx ? "w-6 bg-primary" : "w-2.5 bg-border"}`}
              />
            ))}
          </div>

          <button
            onClick={() =>
              handleTestimonialChange(
                testimonialIndex < testimonials.length - 1
                  ? testimonialIndex + 1
                  : 0,
              )
            }
            className="w-8 h-8 rounded-full border border-border text-muted hover:text-primary hover:border-primary flex items-center justify-center transition cursor-pointer"
            aria-label="Next Testimonial"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
};
var stdin_default = Landing;
export { Landing, stdin_default as default };

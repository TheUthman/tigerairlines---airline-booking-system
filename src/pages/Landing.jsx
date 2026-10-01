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
          "https://images.unsplash.com/photo-1612874983384-bf5e47db3d07?w=600&auto=format&fit=crop&q=80",
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
        "https://images.unsplash.com/photo-1618116573990-9db6c93b86a5?w=600&auto=format&fit=crop&q=80",
      code: "LOS",
    },
    {
      title: "Abuja",
      description:
        "Nigeria's serene capital city, home to Aso Rock and the iconic National Mosque.",
      image:
        "https://images.unsplash.com/photo-1612874983384-bf5e47db3d07?w=600&auto=format&fit=crop&q=80",
      code: "ABV",
    },
    {
      title: "Port Harcourt",
      description:
        "The Garden City \u2014 gateway to the Niger Delta and hub of Nigeria's oil industry.",
      image:
        "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&auto=format&fit=crop&q=80",
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
      name: "Chukwuemeka Obi",
      location: "Lagos, Nigeria",
      quote:
        "Booked Lagos to London with TigerAirlines and the experience was world-class from start to finish. Check-in was seamless and the business class seats were incredible.",
      stars: 5,
    },
    {
      initial: "N",
      name: "Ngozi Adeleke",
      location: "Abuja, Nigeria",
      quote:
        "I fly Lagos\u2013Abuja almost weekly for work. TigerAirlines is always on time, the app works perfectly, and boarding is the smoothest I have experienced on any Nigerian route.",
      stars: 5,
    },
    {
      initial: "A",
      name: "Amaka Eze",
      location: "Port Harcourt, Nigeria",
      quote:
        "The team at TigerAirlines went above and beyond when my connecting flight was delayed. They rebooked me instantly and even offered a lounge pass. Truly Nigerian hospitality!",
      stars: 5,
    },
  ];
  useGSAP(
    () => {
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
      <section className="relative min-h-[480px] md:min-h-[540px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&auto=format&fit=crop&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-36">
          <div className="max-w-2xl text-white">
            <p className="hero-headline-1 text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-3">
              TigerAirlines Nigeria
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="hero-headline-1 block">
                Nigeria connects the world
              </span>
              <span className="hero-headline-2 block text-white drop-shadow-sm">
                Flights from ₦38,000
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
                className="inline-flex items-center gap-2.5 bg-secondary hover:bg-secondary-hover text-on-secondary px-7 py-3 rounded-full font-bold text-sm md:text-base shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
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
            <div
              key={dest.city}
              onClick={() => handleBookDeal(dest.code)}
              className="destination-card relative rounded-2xl overflow-hidden shadow-md group cursor-pointer h-72 md:h-80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {}
              <img
                src={dest.image}
                alt={dest.city}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {}
              <div className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/92 text-white flex items-center justify-center shadow-md ring-1 ring-orange-200">
                <img
                  src="/logo.svg"
                  width="26"
                  height="26"
                  alt="TigerAirlines logo"
                  className="object-contain"
                />
              </div>

              {}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-5 text-white">
                <h3 className="text-xl font-bold tracking-tight">
                  {dest.city}
                </h3>
                <p className="text-xs text-white/80 font-medium">
                  {dest.cabin}
                </p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-xs text-white/70">From</span>
                  <span className="text-lg font-extrabold text-white">
                    {dest.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate("/destinations")}
            className="inline-flex items-center justify-center px-8 py-2.5 rounded-full border border-primary text-primary font-bold text-sm hover:bg-primary hover:text-on-primary transition duration-200 cursor-pointer shadow-xs"
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
            <div
              key={idx}
              onClick={() => handleBookDeal(place.code)}
              className="nigeria-card relative rounded-2xl overflow-hidden shadow-md group cursor-pointer h-72 md:h-80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <img
                src={place.image}
                alt={place.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">{place.title}</h3>
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-surface group-hover:text-foreground transition">
                    <ChevronRight size={16} />
                  </div>
                </div>
                <p className="text-xs text-white/80 mt-1 line-clamp-2 leading-relaxed">
                  {place.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate("/destinations")}
            className="inline-flex items-center justify-center px-8 py-2.5 rounded-full border border-primary text-primary font-bold text-sm hover:bg-primary hover:text-on-primary transition duration-200 cursor-pointer shadow-xs"
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
                    className="promo-deal-card bg-secondary rounded-2xl p-6 shadow-xl flex flex-col justify-between h-64 border border-secondary/40 transform hover:-translate-y-1 transition duration-200"
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
                      className="w-full bg-surface text-on-secondary hover:bg-surface-muted font-bold py-2 rounded-lg text-xs shadow-sm transition cursor-pointer"
                    >
                      {deal.buttonText}
                    </button>
                  </div>
                );
              }
              return (
                <div
                  key={deal.id}
                  className="promo-deal-card bg-primary rounded-2xl p-6 shadow-xl flex flex-col justify-between h-64 border border-primary/30 transform hover:-translate-y-1 transition duration-200"
                >
                  <div>
                    <span className="text-xs font-semibold text-white/80 uppercase tracking-wider block mb-3 border-b border-white/10 pb-2">
                      {deal.badge}
                    </span>
                    <h3 className="text-lg font-black text-white leading-snug">
                      {deal.title}
                    </h3>
                    {deal.subtitle && (
                      <p className="text-xs text-white/80 mt-1">
                        {deal.subtitle}
                      </p>
                    )}
                    {deal.couponCode && (
                      <div className="mt-2 py-1 px-2.5 rounded bg-black/20 text-secondary font-mono font-bold text-sm tracking-wider inline-block">
                        {deal.couponCode}
                      </div>
                    )}
                    {deal.priceHighlight && (
                      <p className="text-base font-extrabold text-secondary mt-1">
                        {deal.priceHighlight}
                      </p>
                    )}
                    {deal.validity && (
                      <p className="text-[11px] text-white/60 mt-1 italic">
                        {deal.validity}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleBookDeal(deal.destinationCode)}
                    className="w-full bg-white/15 hover:bg-white/25 text-white font-semibold py-2 rounded-lg text-xs border border-white/20 transition cursor-pointer"
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
                  <div className="w-11 h-11 rounded-full bg-primary text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
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
                <div className="flex items-center gap-1 text-secondary">
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
              <span
                key={idx}
                onClick={() => handleTestimonialChange(idx)}
                className={`h-2.5 rounded-full cursor-pointer transition-all ${testimonialIndex === idx ? "bg-primary w-6" : "bg-border w-2.5"}`}
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

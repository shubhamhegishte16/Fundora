import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "./assets/forest.jpg";
import camp1 from "./assets/camp1.jpg";
import camp2 from "./assets/camp2.jpg";
import camp3 from "./assets/camp3.jpg";

/* Custom hook to detect when an element enters the viewport */
const useInView = (options = {}) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.15, ...options });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options]);

  return [ref, isInView];
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [howRef, howVisible] = useInView();
  const [campRef, campVisible] = useInView();
  const [impactRef, impactVisible] = useInView();
  const [ctaRef, ctaVisible] = useInView();

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen w-full text-gray-900">
      {/* ===== STICKY NAVBAR WITH GLASS EFFECT ===== */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-500 md:px-10 lg:px-16 ${
          scrolled
            ? "bg-white/70 backdrop-blur-lg shadow-md"
            : "bg-transparent"
        }`}
      >
        <button
          onClick={() => scrollTo("hero")}
          className={`text-4xl font-bold transition-all duration-500 ${
            scrolled ? "text-black drop-shadow-sm" : "text-white"
          }`}
        >
          ELPIS
        </button>

        <div className="hidden items-center space-x-10 md:flex">
          {["how-it-works", "campaigns", "impact"].map((id) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`text-base font-medium capitalize transition-all hover:scale-105 ${
                scrolled ? "text-gray-800" : "text-white/90"
              }`}
            >
              {id.replace(/-/g, " ")}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <span
            onClick={() => navigate("/login")}
            className={`hidden cursor-pointer text-base font-medium transition-all hover:scale-105 md:inline ${
              scrolled ? "text-gray-800" : "text-white/90"
            }`}
          >
            Login
          </span>
          <button
            onClick={() => navigate("/signup")}
            className="rounded-full bg-[#6FD06B] px-6 py-2.5 text-base font-semibold text-black transition-all hover:bg-[#5ab556] hover:shadow-lg hover:scale-105 active:scale-95"
          >
            Sign up
          </button>
        </div>
      </nav>

      {/* ===== HERO SECTION WITH PARALLAX & FADE IN ===== */}
      <div
        id="hero"
        className="relative flex min-h-screen w-full items-center justify-start bg-fixed bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundAttachment: "scroll", // fallback for mobile
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl px-6 pt-20 md:px-10 lg:px-16">
          <h1 className="text-5xl font-extrabold leading-tight text-white drop-shadow-2xl sm:text-6xl md:text-7xl lg:text-8xl animate-fade-in-up">
            Bring Hope
            <br />
            to Every Dream
          </h1>
          <p className="mt-6 max-w-lg text-lg text-white/80 animate-fade-in-up animation-delay-200">
            Join thousands of changemakers. Start or support a campaign that
            makes a real difference.
          </p>
          <div className="mt-12 flex flex-col gap-6 sm:flex-row animate-fade-in-up animation-delay-400">
            {/* Explore Campaign → browse page */}
            <button
              onClick={() => navigate("/browse")}
              className="h-[60px] rounded-full border-2 border-[#6FD06B] bg-transparent px-10 text-lg font-semibold text-white transition-all hover:bg-[#6FD06B] hover:text-black hover:shadow-xl hover:scale-105 active:scale-95"
            >
              Explore Campaign
            </button>

            {/* Start Campaign → signup */}
            <button
              onClick={() => navigate("/signup")}
              className="h-[60px] rounded-full bg-[#6FD06B] px-10 text-lg font-semibold text-black transition-all hover:bg-[#5ab556] hover:shadow-xl hover:scale-105 active:scale-95"
            >
              Start Campaign
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            className="h-8 w-8 text-white/80"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* ===== HOW IT WORKS (fade in on scroll) ===== */}
      <section
        id="how-it-works"
        ref={howRef}
        className="bg-white py-24"
      >
        <div
          className={`mx-auto max-w-6xl px-6 transition-all duration-1000 ${
            howVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="mb-16 text-center text-4xl font-bold text-gray-900 md:text-5xl">
            How It Works
          </h2>
          <div className="grid gap-12 md:grid-cols-3">
            {[
              { step: "01", title: "Create a Campaign", desc: "Tell your story, set a goal, and launch in minutes with our simple tools." },
              { step: "02", title: "Share Everywhere", desc: "Promote via social media, email, and our built‑in sharing features." },
              { step: "03", title: "Receive Funds", desc: "Donations are processed securely and transferred directly to your cause." },
            ].map((item) => (
              <div
                key={item.step}
                className="group flex flex-col items-center rounded-2xl bg-gray-50 p-8 text-center shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#6FD06B] text-2xl font-bold text-black shadow-md transition-transform group-hover:scale-110">
                  {item.step}
                </div>
                <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED CAMPAIGNS (fade in on scroll) ===== */}
      <section
        id="campaigns"
        ref={campRef}
        className="bg-gradient-to-b from-gray-50 to-white py-24"
      >
        <div
          className={`mx-auto max-w-6xl px-6 transition-all duration-1000 ${
            campVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="mb-16 text-center text-4xl font-bold text-gray-900 md:text-5xl">
            Featured Campaigns
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Clean Water for Village", desc: "Help us build a sustainable water system for 500 families.", raised: 3750, goal: 5000, img: camp1 },
              { title: "Education for All", desc: "Provide school supplies and scholarships to 200 children.", raised: 2400, goal: 4000, img: camp2 },
              { title: "Reforestation Drive", desc: "Plant 10,000 trees in deforested areas this monsoon.", raised: 6200, goal: 10000, img: camp3 },
            ].map((campaign, idx) => (
              <div
                key={idx}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all hover:shadow-2xl hover:-translate-y-2"
              >
                {/* Campaign image */}
                <div className="h-48 w-full overflow-hidden">
                  <img
                    src={campaign.img}
                    alt={campaign.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-semibold">{campaign.title}</h3>
                  <p className="mb-4 text-sm text-gray-500">{campaign.desc}</p>
                  <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-[#6FD06B] transition-all duration-1000"
                      style={{ width: `${(campaign.raised / campaign.goal) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm font-medium text-gray-600">
                    <span>${campaign.raised.toLocaleString()} raised</span>
                    <span>${campaign.goal.toLocaleString()} goal</span>
                  </div>
                  {/* Donate Now → login (auth required) */}
                  <button
                    onClick={() => navigate("/login")}
                    className="mt-4 w-full rounded-full bg-[#6FD06B] py-2.5 font-semibold text-black transition-all hover:bg-[#5ab556] hover:shadow-md"
                  >
                    Donate Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== IMPACT STATS (fade in + counters) ===== */}
      <section
        id="impact"
        ref={impactRef}
        className="bg-[#6FD06B] py-20"
      >
        <div
          className={`mx-auto max-w-5xl px-6 text-center transition-all duration-1000 ${
            impactVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="mb-12 text-4xl font-bold text-black md:text-5xl">
            Our Impact
          </h2>
          <div className="grid gap-10 md:grid-cols-3">
            {[
              { number: "1,200+", label: "Campaigns Funded" },
              { number: "$4.8M", label: "Donations Received" },
              { number: "85K+", label: "Happy Donors" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-2">
                <div className="text-6xl font-extrabold tracking-tight">{stat.number}</div>
                <div className="text-xl font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CALL TO ACTION ===== */}
      <section
        ref={ctaRef}
        className="bg-white py-24"
      >
        <div
          className={`mx-auto max-w-3xl px-6 text-center transition-all duration-1000 ${
            ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
            Ready to Make a Difference?
          </h2>
          <p className="mb-10 text-lg text-gray-600">
            Every contribution matters. Start a campaign or support one that
            touches your heart.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="rounded-full bg-[#6FD06B] px-12 py-4 text-lg font-semibold text-black transition-all hover:bg-[#5ab556] hover:shadow-xl hover:scale-105 active:scale-95"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 py-12 text-gray-400">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <span className="text-3xl font-bold text-white">Elpis.</span>
            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium">
              {["Home", "About", "Contact", "Privacy"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    if (item === "Home") scrollTo("hero");
                    else if (item === "About") navigate("/about");
                    else if (item === "Contact") navigate("/contact");
                    else if (item === "Privacy") navigate("/privacy");
                  }}
                  className="transition hover:text-white"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-10 text-center text-sm">
            © {new Date().getFullYear()} Elpis. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Inline keyframes for fade-in-up animation */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
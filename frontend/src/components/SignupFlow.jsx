import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import WelcomePanel from "./WelcomePanel";
import Step1Base from "./Step1Base";
import Step2Donor from "./Step2Donor";
import Step3KYC from "./Step3KYC";
import Step4Final from "./Step4Final";
import { CheckCircle2, UserCheck, HeartHandshake } from "lucide-react";

// Variants for step transition sliding animations
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 150 : -150,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    }
  },
  exit: (direction) => ({
    x: direction < 0 ? 150 : -150,
    opacity: 0,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    }
  })
};

const SignupFlow = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "Donor",
    // Donor specific
    donorUsername: "",
    donorPhone: "",
    donorConfirmedEmail: "",
    donorPassword: "",
    // Creator specific
    creatorIdType: "Aadhar Card",
    creatorIdNumber: "",
    creatorIdFile: null,
    creatorAddress: "",
    creatorFoundationName: "",
    creatorPhone: "",
    creatorConfirmedEmail: "",
    creatorPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Phone regex (simple 10-digit number validation or international format)
  const phoneRegex = /^[+]?[0-9]{10,14}$/;

  const validateStep1 = () => {
    const errs = {};
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      errs.fullName = "Full name must be at least 2 characters.";
    }
    if (!formData.email) {
      errs.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      errs.email = "Please enter a valid email address.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2Donor = () => {
    const errs = {};
    if (!formData.donorUsername || formData.donorUsername.trim().length < 3) {
      errs.donorUsername = "Username must be at least 3 characters.";
    }
    if (!formData.donorPhone) {
      errs.donorPhone = "Phone number is required.";
    } else if (!phoneRegex.test(formData.donorPhone.replace(/\s+/g, ""))) {
      errs.donorPhone = "Please enter a valid phone number (10-14 digits).";
    }
    if (!formData.donorConfirmedEmail) {
      errs.donorConfirmedEmail = "Please confirm your email.";
    } else if (formData.donorConfirmedEmail !== formData.email) {
      errs.donorConfirmedEmail = "Confirmed email must match the initial email.";
    }
    if (!formData.donorPassword || formData.donorPassword.length < 6) {
      errs.donorPassword = "Password must be at least 6 characters.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3KYC = () => {
    const errs = {};
    const idType = formData.creatorIdType || "Aadhar Card";
    
    if (!formData.creatorIdNumber || formData.creatorIdNumber.trim() === "") {
      errs.creatorIdNumber = `${idType} number is required.`;
    } else {
      // Specific checks
      if (idType === "Aadhar Card" && !/^\d{12}$/.test(formData.creatorIdNumber.replace(/\s+/g, ""))) {
        errs.creatorIdNumber = "Aadhar card number must be exactly 12 digits.";
      } else if (idType === "Pan Card" && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.creatorIdNumber.trim())) {
        errs.creatorIdNumber = "Invalid PAN card format (e.g. ABCDE1234F).";
      }
    }

    if (!formData.creatorIdFile) {
      errs.creatorIdFile = `Please upload your ${idType} document.`;
    }
    
    if (!formData.creatorAddress || formData.creatorAddress.trim().length < 5) {
      errs.creatorAddress = "Please provide a valid, complete address.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep4Final = () => {
    const errs = {};
    if (!formData.creatorFoundationName || formData.creatorFoundationName.trim().length < 3) {
      errs.creatorFoundationName = "Foundation Name or username is required (min 3 chars).";
    }
    if (!formData.creatorPhone) {
      errs.creatorPhone = "Phone number is required.";
    } else if (!phoneRegex.test(formData.creatorPhone.replace(/\s+/g, ""))) {
      errs.creatorPhone = "Please enter a valid phone number (10-14 digits).";
    }
    if (!formData.creatorConfirmedEmail) {
      errs.creatorConfirmedEmail = "Please confirm your email.";
    } else if (formData.creatorConfirmedEmail !== formData.email) {
      errs.creatorConfirmedEmail = "Confirmed email must match the initial email.";
    }
    if (!formData.creatorPassword || formData.creatorPassword.length < 6) {
      errs.creatorPassword = "Password must be at least 6 characters.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStep1Next = () => {
    if (validateStep1()) {
      setDirection(1);
      if (formData.role === "Donor") {
        setStep(2);
      } else {
        setStep(3);
      }
      setErrors({});
    }
  };

  const handleStep3Next = () => {
    if (validateStep3KYC()) {
      setDirection(1);
      setStep(4);
      setErrors({});
    }
  };

  const handleBack = () => {
    setDirection(-1);
    if (step === 2 || step === 3) {
      setStep(1);
    } else if (step === 4) {
      setStep(3);
    }
    setErrors({});
  };

  const handleDonorSubmit = async () => {
    if (validateStep2Donor()) {
      setIsLoading(true);
      setSubmitError(null);
      try {
        const response = await axios.post("http://localhost:5000/api/auth/register", {
          name: formData.fullName,
          email: formData.email,
          password: formData.donorPassword,
          role: "donor"
        });

        if (response.data.success) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          console.log("Donor Registration Successful:", response.data);
          setIsSubmitted(true);
          
          // Automatically redirect to /donor-panel after 2 seconds
          setTimeout(() => {
            navigate("/donor-panel");
          }, 2000);
        } else {
          setSubmitError(response.data.message || "Registration failed. Please try again.");
        }
      } catch (err) {
        console.error("Donor registration error:", err);
        const errMsg = err.response?.data?.message || "Server error. Please ensure the backend is running.";
        setSubmitError(errMsg);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCreatorSubmit = () => {
    if (validateStep4Final()) {
      console.log("Creator Registration Submitted (Awaiting Verification):", formData);
      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setStep(1);
    setDirection(-1);
    setFormData({
      fullName: "",
      email: "",
      role: "Donor",
      donorUsername: "",
      donorPhone: "",
      donorConfirmedEmail: "",
      donorPassword: "",
      creatorIdType: "Aadhar Card",
      creatorIdNumber: "",
      creatorIdFile: null,
      creatorAddress: "",
      creatorFoundationName: "",
      creatorPhone: "",
      creatorConfirmedEmail: "",
      creatorPassword: ""
    });
    setErrors({});
    setIsSubmitted(false);
  };

  const handleSignInToast = () => {
    alert("Sign In functionality will be available soon. Please complete the registration!");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-light p-4 sm:p-6 md:p-8 font-sans antialiased text-brand-text">
      {/* Outer Card Container */}
      <div className="w-full max-w-5xl bg-card-white rounded-2xl shadow-xl shadow-slate-200/80 border border-brand-border/60 flex flex-col lg:flex-row overflow-hidden min-h-[600px]">
        
        {/* Left Welcome Side panel */}
        <WelcomePanel onSignInClick={handleSignInToast} />

        {/* Right Form Wizard Panel */}
        <div className="relative w-full lg:w-3/5 min-h-[400px] lg:min-h-[600px] flex flex-col overflow-hidden">
          <AnimatePresence initial={false} mode="wait" custom={direction}>
            {!isSubmitted ? (
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 w-full h-full flex flex-col"
              >
                {step === 1 && (
                  <Step1Base
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    onNext={handleStep1Next}
                  />
                )}
                 {step === 2 && (
                  <Step2Donor
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    onBack={handleBack}
                    onSubmit={handleDonorSubmit}
                    isLoading={isLoading}
                    submitError={submitError}
                  />
                )}
                {step === 3 && (
                  <Step3KYC
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    onBack={handleBack}
                    onNext={handleStep3Next}
                  />
                )}
                {step === 4 && (
                  <Step4Final
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    onBack={handleBack}
                    onSubmit={handleCreatorSubmit}
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="w-full h-full p-8 lg:p-12 flex flex-col items-center justify-center text-center bg-white rounded-r-2xl"
              >
                {formData.role === "Donor" ? (
                  <>
                    <div className="w-20 h-20 bg-light-green text-[#22C55E] rounded-full flex items-center justify-center mb-6 shadow-md shadow-green-100">
                      <HeartHandshake size={44} />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#22C55E] tracking-wide mb-3">
                      Welcome Aboard, Donor!
                    </h2>
                    <p className="text-sm text-brand-secondary max-w-md mb-6 leading-relaxed">
                      Thank you for joining <strong>Ariseo</strong>, <span className="font-semibold text-brand-text">{formData.fullName}</span>. 
                      Your donor account is active. Get ready to discover and support revolutionary campaigns!
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-[#EFF6FF] text-[#3B82F6] rounded-full flex items-center justify-center mb-6 shadow-md shadow-blue-100">
                      <UserCheck size={44} />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3B82F6] tracking-wide mb-3">
                      Verification Sent!
                    </h2>
                    <p className="text-sm text-brand-secondary max-w-md mb-6 leading-relaxed">
                      Welcome, Creator! Your profile for <strong className="text-accent-blue">{formData.creatorFoundationName}</strong> has been submitted. 
                      We are reviewing your KYC document (<span className="italic font-medium text-brand-text">{formData.creatorIdFile?.name}</span>) and will activate your campaign creation access shortly.
                    </p>
                  </>
                )}
                
                 <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
                  {formData.role === "Donor" ? (
                    <div className="flex items-center gap-2 text-xs bg-[#F0FDF4] px-4 py-2.5 rounded-lg border border-emerald-200 text-emerald-700 justify-center font-medium shadow-sm">
                      <div className="animate-spin h-3.5 w-3.5 border-2 border-emerald-500 border-t-transparent rounded-full mr-1.5 shrink-0" />
                      Redirecting to Donor Panel...
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-xs bg-bg-light px-4 py-2.5 rounded-lg border border-brand-border text-brand-secondary justify-center font-medium">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        Verification request submitted
                      </div>
                      <button
                        onClick={handleReset}
                        className="w-full py-3 rounded-full bg-dark-green text-white font-bold text-sm hover:bg-primary-green transition-all shadow-md shadow-dark-green/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-light-green"
                      >
                        Back to Sign Up
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SignupFlow;

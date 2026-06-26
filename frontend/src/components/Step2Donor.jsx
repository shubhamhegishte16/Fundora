import React, { useState } from "react";
import { ArrowLeft, User, Phone, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

const Step2Donor = ({ formData, setFormData, errors, onBack, onSubmit, isLoading, submitError }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLoading) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col justify-between h-full w-full p-8 lg:p-12 bg-white rounded-r-none lg:rounded-r-2xl">
      {/* Title */}
      <div className="text-center lg:text-left mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-green tracking-wide">
          Sign Up As Donor
        </h2>
        <p className="text-xs text-brand-secondary mt-1">
          Provide your donor account details below
        </p>
      </div>

      {/* Database Error Alert */}
      {submitError && (
        <div className="mb-4 p-3.5 bg-brand-error/10 border border-brand-error/20 text-brand-error text-xs rounded-xl flex items-center gap-2 font-medium">
          <AlertCircle size={16} className="shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4 grow overflow-y-auto max-h-[360px] pr-1">
        {/* Username */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-brand-text flex items-center gap-1.5 px-1">
            <User size={15} className="text-primary-green" />
            Username:
          </label>
          <input
            type="text"
            name="donorUsername"
            placeholder="Enter username"
            disabled={isLoading}
            value={formData.donorUsername || ""}
            onChange={handleChange}
            className={`w-full px-5 py-2.5 rounded-full bg-[#D1FAE5]/30 text-brand-text font-medium placeholder-brand-secondary/60 border ${
              errors.donorUsername ? "border-brand-error" : "border-transparent"
            } focus:border-primary-green focus:bg-white focus:ring-2 focus:ring-light-green outline-none transition-all disabled:opacity-50`}
          />
          {errors.donorUsername && (
            <span className="text-xs text-brand-error px-3 font-medium">
              {errors.donorUsername}
            </span>
          )}
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-brand-text flex items-center gap-1.5 px-1">
            <Phone size={15} className="text-primary-green" />
            Phone:
          </label>
          <input
            type="tel"
            name="donorPhone"
            placeholder="Enter phone number"
            disabled={isLoading}
            value={formData.donorPhone || ""}
            onChange={handleChange}
            className={`w-full px-5 py-2.5 rounded-full bg-[#D1FAE5]/30 text-brand-text font-medium placeholder-brand-secondary/60 border ${
              errors.donorPhone ? "border-brand-error" : "border-transparent"
            } focus:border-primary-green focus:bg-white focus:ring-2 focus:ring-light-green outline-none transition-all disabled:opacity-50`}
          />
          {errors.donorPhone && (
            <span className="text-xs text-brand-error px-3 font-medium">
              {errors.donorPhone}
            </span>
          )}
        </div>

        {/* Confirmed Email */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-brand-text flex items-center gap-1.5 px-1">
            <Mail size={15} className="text-primary-green" />
            Confirmed Email:
          </label>
          <input
            type="email"
            name="donorConfirmedEmail"
            placeholder="Confirm your email address"
            disabled={isLoading}
            value={formData.donorConfirmedEmail || ""}
            onChange={handleChange}
            className={`w-full px-5 py-2.5 rounded-full bg-[#D1FAE5]/30 text-brand-text font-medium placeholder-brand-secondary/60 border ${
              errors.donorConfirmedEmail ? "border-brand-error" : "border-transparent"
            } focus:border-primary-green focus:bg-white focus:ring-2 focus:ring-light-green outline-none transition-all disabled:opacity-50`}
          />
          {errors.donorConfirmedEmail && (
            <span className="text-xs text-brand-error px-3 font-medium">
              {errors.donorConfirmedEmail}
            </span>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-brand-text flex items-center gap-1.5 px-1">
            <Lock size={15} className="text-primary-green" />
            Password:
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="donorPassword"
              placeholder="Create password"
              disabled={isLoading}
              value={formData.donorPassword || ""}
              onChange={handleChange}
              className={`w-full px-5 py-2.5 rounded-full bg-[#D1FAE5]/30 text-brand-text font-medium placeholder-brand-secondary/60 border ${
                errors.donorPassword ? "border-brand-error" : "border-transparent"
              } focus:border-primary-green focus:bg-white focus:ring-2 focus:ring-light-green outline-none transition-all pr-12 disabled:opacity-50`}
            />
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-dark-green cursor-pointer focus:outline-none disabled:opacity-50"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.donorPassword && (
            <span className="text-xs text-brand-error px-3 font-medium">
              {errors.donorPassword}
            </span>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between items-center mt-6 border-t border-brand-border/40 pt-4">
        <button
          type="button"
          disabled={isLoading}
          onClick={onBack}
          className="flex items-center gap-1 px-4 py-2 rounded-full border border-brand-border text-brand-secondary font-bold text-sm hover:text-brand-text hover:bg-bg-light transition-all cursor-pointer focus:outline-none disabled:opacity-50"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-full bg-dark-green text-white font-bold text-sm hover:bg-primary-green transition-all shadow-md shadow-dark-green/20 hover:shadow-primary-green/25 cursor-pointer flex items-center justify-center min-w-[140px] focus:outline-none focus:ring-2 focus:ring-light-green disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Registering...
            </span>
          ) : (
            "Become a Donor"
          )}
        </button>
      </div>
    </form>
  );
};

export default Step2Donor;

import React, { useState } from "react";
import { ArrowLeft, User, Phone, Mail, Lock, Eye, EyeOff, Send } from "lucide-react";

const Step4Final = ({ formData, setFormData, errors, onBack, onSubmit, isLoading, submitError }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col justify-between h-full w-full p-8 lg:p-12 bg-white rounded-r-none lg:rounded-r-2xl">
      {/* Title */}
      <div className="text-center lg:text-left mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-green tracking-wide">
          Sign Up As Creator
        </h2>
        <p className="text-xs text-brand-secondary mt-1">
          Step 2: Enter foundation & contact details for verification
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4 grow overflow-y-auto max-h-[360px] pr-1">
        {/* Foundation Name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-brand-text flex items-center gap-1.5 px-1 leading-tight">
            <User size={15} className="text-primary-green shrink-0" />
            <span>Foundation Name <span className="text-xs text-brand-secondary/80 font-normal">(if community otherwise personal username)</span>:</span>
          </label>
          <input
            type="text"
            name="creatorFoundationName"
            placeholder="Enter foundation name or username"
            value={formData.creatorFoundationName || ""}
            onChange={handleChange}
            className={`w-full px-5 py-2.5 rounded-full bg-[#D1FAE5]/30 text-brand-text font-medium placeholder-brand-secondary/60 border ${
              errors.creatorFoundationName ? "border-brand-error" : "border-transparent"
            } focus:border-primary-green focus:bg-white focus:ring-2 focus:ring-light-green outline-none transition-all text-sm`}
          />
          {errors.creatorFoundationName && (
            <span className="text-xs text-brand-error px-3 font-medium">
              {errors.creatorFoundationName}
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
            name="creatorPhone"
            placeholder="Enter phone number"
            value={formData.creatorPhone || ""}
            onChange={handleChange}
            className={`w-full px-5 py-2.5 rounded-full bg-[#D1FAE5]/30 text-brand-text font-medium placeholder-brand-secondary/60 border ${
              errors.creatorPhone ? "border-brand-error" : "border-transparent"
            } focus:border-primary-green focus:bg-white focus:ring-2 focus:ring-light-green outline-none transition-all text-sm`}
          />
          {errors.creatorPhone && (
            <span className="text-xs text-brand-error px-3 font-medium">
              {errors.creatorPhone}
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
            name="creatorConfirmedEmail"
            placeholder="Confirm your email address"
            value={formData.creatorConfirmedEmail || ""}
            onChange={handleChange}
            className={`w-full px-5 py-2.5 rounded-full bg-[#D1FAE5]/30 text-brand-text font-medium placeholder-brand-secondary/60 border ${
              errors.creatorConfirmedEmail ? "border-brand-error" : "border-transparent"
            } focus:border-primary-green focus:bg-white focus:ring-2 focus:ring-light-green outline-none transition-all text-sm`}
          />
          {errors.creatorConfirmedEmail && (
            <span className="text-xs text-brand-error px-3 font-medium">
              {errors.creatorConfirmedEmail}
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
              name="creatorPassword"
              placeholder="Create password"
              value={formData.creatorPassword || ""}
              onChange={handleChange}
              className={`w-full px-5 py-2.5 rounded-full bg-[#D1FAE5]/30 text-brand-text font-medium placeholder-brand-secondary/60 border ${
                errors.creatorPassword ? "border-brand-error" : "border-transparent"
              } focus:border-primary-green focus:bg-white focus:ring-2 focus:ring-light-green outline-none transition-all pr-12 text-sm`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-dark-green cursor-pointer focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.creatorPassword && (
            <span className="text-xs text-brand-error px-3 font-medium">
              {errors.creatorPassword}
            </span>
          )}
        </div>
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="mx-8 lg:mx-12 mb-2 px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium text-center">
          {submitError}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-between items-center mt-6 border-t border-brand-border/40 pt-4 px-8 lg:px-12 pb-8 lg:pb-12">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center gap-1 px-4 py-2 rounded-full border border-brand-border text-brand-secondary font-bold text-sm hover:text-brand-text hover:bg-bg-light transition-all cursor-pointer focus:outline-none disabled:opacity-50"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#22C55E] text-white font-bold text-sm hover:bg-[#16a34a] transition-all shadow-md shadow-green-500/20 hover:shadow-green-600/25 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#86efac] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Registering...
            </>
          ) : (
            <>
              Send for verification
              <Send size={14} />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default Step4Final;

import React from "react";
import { ChevronDown, User, Mail, Shield } from "lucide-react";

const Step1Base = ({ formData, setFormData, errors, onNext }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col justify-between h-full w-full p-8 lg:p-12 bg-cream-yellow rounded-r-none lg:rounded-r-2xl">
      {/* Title */}
      <div className="text-center lg:text-left mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-green tracking-wide">
          Sign Up
        </h2>
        <p className="text-xs text-brand-secondary mt-1">
          Create your Ariseo account to get started
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6 grow">
        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-brand-text flex items-center gap-1.5 px-1">
            <User size={16} className="text-primary-green" />
            Full Name:
          </label>
          <div className="relative">
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName || ""}
              onChange={handleChange}
              className={`w-full px-5 py-3 rounded-full bg-[#D1FAE5]/30 text-brand-text font-medium placeholder-brand-secondary/60 border ${
                errors.fullName ? "border-brand-error" : "border-transparent"
              } focus:border-primary-green focus:bg-white focus:ring-2 focus:ring-light-green outline-none transition-all`}
            />
          </div>
          {errors.fullName && (
            <span className="text-xs text-brand-error px-3 font-medium">
              {errors.fullName}
            </span>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-brand-text flex items-center gap-1.5 px-1">
            <Mail size={16} className="text-primary-green" />
            Email:
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email || ""}
              onChange={handleChange}
              className={`w-full px-5 py-3 rounded-full bg-[#D1FAE5]/30 text-brand-text font-medium placeholder-brand-secondary/60 border ${
                errors.email ? "border-brand-error" : "border-transparent"
              } focus:border-primary-green focus:bg-white focus:ring-2 focus:ring-light-green outline-none transition-all`}
            />
          </div>
          {errors.email && (
            <span className="text-xs text-brand-error px-3 font-medium">
              {errors.email}
            </span>
          )}
        </div>

        {/* Role */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-brand-text flex items-center gap-1.5 px-1">
            <Shield size={16} className="text-primary-green" />
            Role:
          </label>
          <div className="relative">
            <select
              name="role"
              value={formData.role || "Donor"}
              onChange={handleChange}
              className="w-full px-5 py-3 rounded-full bg-[#D1FAE5]/50 text-brand-text font-bold border border-transparent focus:border-primary-green focus:bg-white focus:ring-2 focus:ring-light-green outline-none appearance-none cursor-pointer transition-all pr-12"
            >
              <option value="Donor">Donor</option>
              <option value="Creator">Creator</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-dark-green">
              <ChevronDown size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Button container */}
      <div className="flex justify-end items-center mt-8 border-t border-brand-border/10 pt-6">
        <button
          type="submit"
          className="px-8 py-3 rounded-full bg-dark-green text-white font-bold text-sm hover:bg-primary-green transition-all shadow-md shadow-dark-green/20 hover:shadow-primary-green/25 cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-light-green"
        >
          Proceed
        </button>
      </div>
    </form>
  );
};

export default Step1Base;

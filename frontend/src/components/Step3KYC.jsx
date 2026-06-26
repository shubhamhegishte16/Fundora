import React, { useState, useRef } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, FileText, Upload, ShieldCheck, MapPin } from "lucide-react";

const Step3KYC = ({ formData, setFormData, errors, onBack, onNext }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, creatorIdFile: file }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFormData((prev) => ({ ...prev, creatorIdFile: file }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  const idType = formData.creatorIdType || "Aadhar Card";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col justify-between h-full w-full p-8 lg:p-12 bg-white rounded-r-none lg:rounded-r-2xl">
      {/* Title */}
      <div className="text-center lg:text-left mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-green tracking-wide">
          Sign Up As Creator
        </h2>
        <p className="text-xs text-brand-secondary mt-1">
          Step 1: Complete your identity verification (KYC)
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4 grow overflow-y-auto max-h-[360px] pr-1">
        {/* Choose ID */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-brand-text flex items-center gap-1.5 px-1">
            <ShieldCheck size={15} className="text-primary-green" />
            Choose ID:
          </label>
          <div className="relative">
            <select
              name="creatorIdType"
              value={idType}
              onChange={handleChange}
              className="w-full px-5 py-2.5 rounded-full bg-[#D1FAE5]/50 text-brand-text font-bold border border-transparent focus:border-primary-green focus:bg-white focus:ring-2 focus:ring-light-green outline-none appearance-none cursor-pointer transition-all pr-12 text-sm"
            >
              <option value="Aadhar Card">Aadhar Card</option>
              <option value="Pan Card">Pan Card</option>
              <option value="Voting Card">Voting Card</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-dark-green">
              <ChevronDown size={18} />
            </div>
          </div>
        </div>

        {/* ID Number */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-brand-text flex items-center gap-1.5 px-1">
            <FileText size={15} className="text-primary-green" />
            [{idType}] ID number:
          </label>
          <input
            type="text"
            name="creatorIdNumber"
            placeholder={`Enter your ${idType} number`}
            value={formData.creatorIdNumber || ""}
            onChange={handleChange}
            className={`w-full px-5 py-2.5 rounded-full bg-[#D1FAE5]/30 text-brand-text font-medium placeholder-brand-secondary/60 border ${
              errors.creatorIdNumber ? "border-brand-error" : "border-transparent"
            } focus:border-primary-green focus:bg-white focus:ring-2 focus:ring-light-green outline-none transition-all text-sm`}
          />
          {errors.creatorIdNumber && (
            <span className="text-xs text-brand-error px-3 font-medium">
              {errors.creatorIdNumber}
            </span>
          )}
        </div>

        {/* Upload ID */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-brand-text flex items-center gap-1.5 px-1">
            <Upload size={15} className="text-primary-green" />
            Upload [{idType}] id:
          </label>
          
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`relative flex items-center justify-between w-full px-5 py-2.5 rounded-full cursor-pointer transition-all border ${
              dragActive ? "border-dashed border-primary-green bg-[#D1FAE5]/20" : "border-transparent"
            } ${
              errors.creatorIdFile ? "border-brand-error" : "border-transparent"
            } bg-[#D1FAE5]/30 hover:bg-[#D1FAE5]/45 text-sm text-brand-text`}
          >
            <span className="truncate max-w-[80%] font-medium text-brand-secondary/80">
              {formData.creatorIdFile 
                ? formData.creatorIdFile.name 
                : `Upload/Drag your ${idType} file`
              }
            </span>
            <div className="flex items-center gap-1.5 text-xs text-dark-green font-bold bg-white/70 px-3 py-1 rounded-full border border-light-green shadow-sm">
              <Upload size={13} />
              Browse
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,.pdf"
            />
          </div>
          {errors.creatorIdFile && (
            <span className="text-xs text-brand-error px-3 font-medium">
              {errors.creatorIdFile}
            </span>
          )}
        </div>

        {/* Address */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-brand-text flex items-center gap-1.5 px-1">
            <MapPin size={15} className="text-primary-green" />
            Address:
          </label>
          <input
            type="text"
            name="creatorAddress"
            placeholder="Enter your street address"
            value={formData.creatorAddress || ""}
            onChange={handleChange}
            className={`w-full px-5 py-2.5 rounded-full bg-[#D1FAE5]/30 text-brand-text font-medium placeholder-brand-secondary/60 border ${
              errors.creatorAddress ? "border-brand-error" : "border-transparent"
            } focus:border-primary-green focus:bg-white focus:ring-2 focus:ring-light-green outline-none transition-all text-sm`}
          />
          {errors.creatorAddress && (
            <span className="text-xs text-brand-error px-3 font-medium">
              {errors.creatorAddress}
            </span>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between items-center mt-6 border-t border-brand-border/40 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 px-4 py-2 rounded-full border border-brand-border text-brand-secondary font-bold text-sm hover:text-brand-text hover:bg-bg-light transition-all cursor-pointer focus:outline-none"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-dark-green text-white font-bold text-sm hover:bg-primary-green transition-all shadow-md shadow-dark-green/20 hover:shadow-primary-green/25 cursor-pointer focus:outline-none focus:ring-2 focus:ring-light-green"
        >
          Next
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
};

export default Step3KYC;

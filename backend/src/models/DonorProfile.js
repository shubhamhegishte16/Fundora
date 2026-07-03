import mongoose from "mongoose";

const donorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    firstName: {
      type: String,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    mobile: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    dob: Date,

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    address: String,

    city: String,

    state: String,

    zipCode: String,

    country: String,

    profileImage: {
      type: String,
      default: "",
    },

    verified: {
      type: Boolean,
      default: false,
    },

    savedCampaigns: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign"
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("DonorProfile", donorProfileSchema);
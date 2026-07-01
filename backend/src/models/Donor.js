import mongoose from 'mongoose';

/**
 * Donor
 * A person who donates to / follows / comments on a creator's
 * campaigns. Donors authenticate through a separate donor-facing app
 * (out of scope here) — this model exists in the creator-panel
 * backend purely so we can reference and display donor info
 * (name, avatar initials) on donations, followers, and comments.
 * No password/auth fields live here on purpose.
 */
const donorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    avatarUrl: { type: String, default: null },
    isAnonymousByDefault: { type: Boolean, default: false }, // donor preference for "Anonymous" donations
  },
  { timestamps: true }
);

export default mongoose.model('Donor', donorSchema);

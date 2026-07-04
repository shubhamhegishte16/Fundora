import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const creatorSchema = new mongoose.Schema(
  {
    // Step 1 — Base info
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      default: 'creator',
    },

    // Step 3 — KYC info
    idType: {
      type: String,
      enum: ['Aadhar Card', 'Pan Card', 'Passport'],
      default: 'Aadhar Card',
    },
    idNumber: {
      type: String,
      trim: true,
    },
    idFileUrl: {
      type: String, // Stored filename / path after file upload
    },
    address: {
      type: String,
      trim: true,
    },

    // Step 4 — Foundation / contact details
    foundationName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },

    // Profile Settings page fields
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    notificationPrefs: {
      donations: { type: Boolean, default: true },
      milestones: { type: Boolean, default: true },
      followers: { type: Boolean, default: false },
      community: { type: Boolean, default: true },
    },

    // Verification status — set to true once admin approves KYC
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
creatorSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
creatorSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Creator = mongoose.model('Creator', creatorSchema);
export default Creator;

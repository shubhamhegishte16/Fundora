// controllers/donorProfileController.js
import User from "../models/User.js";
import DonorProfile from "../models/DonorProfile.js";
import bcrypt from "bcryptjs";
import { createDonorNotification } from "../services/donorNotificationService.js";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let profile = await DonorProfile.findOne({ user: userId });

    // Create empty profile on first visit
    if (!profile) {
      profile = await DonorProfile.create({
        user: userId,
      });
    }

    res.status(200).json({
      success: true,
      user,
      profile,
    });

  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      address,
      city,
      state,
      country,
      phone,
      dob,
      gender,
    } = req.body;

    // Find user
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find or create profile
    let profile = await DonorProfile.findOne({ user: userId });
    if (!profile) {
      profile = new DonorProfile({ user: userId });
    }

    // Update only provided fields
    if (firstName !== undefined) profile.firstName = firstName;
    if (lastName !== undefined) profile.lastName = lastName;
    if (address !== undefined) profile.address = address;
    if (city !== undefined) profile.city = city;
    if (state !== undefined) profile.state = state;
    if (country !== undefined) profile.country = country;
    if (phone !== undefined) profile.phone = phone;
    if (dob !== undefined) profile.dob = new Date(dob);
    if (gender !== undefined) profile.gender = gender;

    await profile.save();

    // Trigger notification
    await createDonorNotification({
      donorId: userId,
      type: 'profile_change',
      title: 'Profile Updated',
      detail: 'Your profile information has been successfully updated.',
      category: 'Activity'
    });

    // Return updated profile
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
      profile,
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // IMPORTANT: Use .select('+password') to include password field
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Use the comparePassword method from the schema
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Set new password - pre-save hook will handle hashing
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });

  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

export const createMissingDonor = async (req, res) => {
  try {
    const userId = req.user.id;
    // console.log('Creating missing donor for user:', userId);

    // Check if donor exists
    let donor = await Donor.findOne({ user: userId });
    if (donor) {
      return res.status(200).json({
        success: true,
        message: 'Donor already exists',
        data: donor
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create donor
    donor = await Donor.create({
      user: userId,
      name: user.name,
      email: user.email,
      role: user.role || 'donor',
    });

    // console.log('Donor created:', donor);

    res.status(201).json({
      success: true,
      message: 'Donor created successfully',
      data: donor
    });

  } catch (error) {
    console.error('Error creating donor:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
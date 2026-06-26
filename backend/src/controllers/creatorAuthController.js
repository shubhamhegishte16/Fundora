import Creator from '../models/Creator.js';
import { generateToken } from '../utils/jwt.js';

// ─── POST /api/creator/auth/register ──────────────────────────────────────────
export const registerCreator = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      // KYC
      idType,
      idNumber,
      address,
      // Foundation / contact
      foundationName,
      phone,
    } = req.body;

    // Check if creator already exists
    const existing = await Creator.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A creator account with this email already exists',
      });
    }

    // Build creator document
    const creatorData = {
      name,
      email,
      password,
      idType: idType || 'Aadhar Card',
      idNumber,
      address,
      foundationName,
      phone,
    };

    // Attach uploaded file name if multer was used
    if (req.file) {
      creatorData.idFileUrl = req.file.filename;
    }

    const creator = await Creator.create(creatorData);

    // Generate JWT
    const token = generateToken(creator._id);

    res.status(201).json({
      success: true,
      token,
      creator: {
        id: creator._id,
        name: creator.name,
        email: creator.email,
        role: creator.role,
        foundationName: creator.foundationName,
        isVerified: creator.isVerified,
      },
    });
  } catch (error) {
    console.error('Creator register error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── POST /api/creator/auth/login ─────────────────────────────────────────────
export const loginCreator = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const creator = await Creator.findOne({ email }).select('+password');
    if (!creator) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await creator.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(creator._id);

    res.status(200).json({
      success: true,
      token,
      creator: {
        id: creator._id,
        name: creator.name,
        email: creator.email,
        role: creator.role,
        foundationName: creator.foundationName,
        isVerified: creator.isVerified,
      },
    });
  } catch (error) {
    console.error('Creator login error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── GET /api/creator/auth/me ─────────────────────────────────────────────────
export const getCreatorMe = async (req, res) => {
  try {
    const creator = await Creator.findById(req.user.id);
    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'Creator not found',
      });
    }
    res.status(200).json({
      success: true,
      creator,
    });
  } catch (error) {
    console.error('Creator getMe error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

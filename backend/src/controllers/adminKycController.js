import Creator from '../models/Creator.js';
import { notifyAdmins } from '../utils/notifyAdmins.js';

const SAFE_FIELDS = '-password';

// ─── GET /api/admin/kyc?status=pending ─────────────────────────────────────
export const getKycSubmissions = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const filter = status === 'All' ? {} : { kycStatus: status };

    const creators = await Creator.find(filter).select(SAFE_FIELDS).sort({ createdAt: -1 });

    res.json({
      success: true,
      submissions: creators.map((c) => ({
        id: c._id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        foundationName: c.foundationName,
        idType: c.idType,
        idNumber: c.idNumber,
        idFileUrl: c.idFileUrl,
        address: c.address,
        kycStatus: c.kycStatus,
        kycRejectionReason: c.kycRejectionReason,
        submittedAt: c.createdAt,
        reviewedAt: c.kycReviewedAt,
      })),
    });
  } catch (error) {
    console.error('getKycSubmissions error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch KYC submissions' });
  }
};

// ─── GET /api/admin/kyc/:id ─────────────────────────────────────────────────
export const getKycById = async (req, res) => {
  try {
    const creator = await Creator.findById(req.params.id).select(SAFE_FIELDS);
    if (!creator) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }
    res.json({ success: true, creator });
  } catch (error) {
    console.error('getKycById error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch creator' });
  }
};

// ─── PATCH /api/admin/kyc/:id/approve ──────────────────────────────────────
export const approveKyc = async (req, res) => {
  try {
    const creator = await Creator.findById(req.params.id);
    if (!creator) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }

    if (creator.kycStatus === 'verified') {
      return res.status(400).json({ success: false, message: 'This creator is already verified' });
    }

    creator.kycStatus = 'verified';
    creator.isVerified = true;
    creator.kycRejectionReason = null;
    creator.kycReviewedBy = req.admin._id;
    creator.kycReviewedAt = new Date();
    await creator.save();

    await notifyAdmins({
      type: 'kyc_pending',
      title: 'KYC approved',
      message: `${creator.foundationName || creator.name}'s KYC verification has been approved.`,
      priority: 'low',
      relatedCreator: creator._id,
    });

    res.json({ success: true, creator: { id: creator._id, name: creator.name, kycStatus: creator.kycStatus } });
  } catch (error) {
    console.error('approveKyc error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to approve KYC' });
  }
};

// ─── PATCH /api/admin/kyc/:id/reject ───────────────────────────────────────
export const rejectKyc = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'A rejection reason is required' });
    }

    const creator = await Creator.findById(req.params.id);
    if (!creator) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }

    creator.kycStatus = 'rejected';
    creator.isVerified = false;
    creator.kycRejectionReason = reason.trim();
    creator.kycReviewedBy = req.admin._id;
    creator.kycReviewedAt = new Date();
    await creator.save();

    await notifyAdmins({
      type: 'kyc_pending',
      title: 'KYC rejected',
      message: `${creator.foundationName || creator.name}'s KYC verification was rejected: ${creator.kycRejectionReason}`,
      priority: 'low',
      relatedCreator: creator._id,
    });

    res.json({ success: true, creator: { id: creator._id, name: creator.name, kycStatus: creator.kycStatus } });
  } catch (error) {
    console.error('rejectKyc error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to reject KYC' });
  }
};

// ─── GET /api/admin/kyc/stats ──────────────────────────────────────────────
export const getKycStats = async (req, res) => {
  try {
    const [pending, verified, rejected] = await Promise.all([
      Creator.countDocuments({ kycStatus: 'pending' }),
      Creator.countDocuments({ kycStatus: 'verified' }),
      Creator.countDocuments({ kycStatus: 'rejected' }),
    ]);
    res.json({ success: true, stats: { pending, verified, rejected, total: pending + verified + rejected } });
  } catch (error) {
    console.error('getKycStats error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch KYC stats' });
  }
};
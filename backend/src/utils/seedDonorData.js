import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Creator from '../models/Creator.js';
import Donor from '../models/Donor.js';
import User from '../models/User.js';
import Campaign from '../models/Campaign.js';
import Donation from '../models/Donation.js';

async function seed() {
  await connectDB();

  console.log('[seed] Cleaning old campaigns and donations (seed only)...');
  // We clean up campaigns and donations to make seeding repeatable
  await Campaign.deleteMany({});
  await Donation.deleteMany({});

  // 1. Get creator (Teach India, seeded by main seed script)
  let creator = await Creator.findOne({ email: 'arjun@teachindia.org' });
  if (!creator) {
    console.log('[seed] Creator not found, seeding Teach India creator first...');
    creator = await Creator.create({
      name: 'Arjun Sharma',
      email: 'arjun@teachindia.org',
      password: 'password123',
      phone: '+91 98765 43210',
      foundationName: 'Teach India',
      isVerified: true
    });
  }

  // 2. Create donor user in 'User' collection for login
  const donorEmail = 'amit.sharma@example.com';
  let user = await User.findOne({ email: donorEmail });
  if (!user) {
    user = await User.create({
      name: 'Amit Sharma',
      email: donorEmail,
      password: 'password123',
      role: 'donor',
      status: 'active'
    });
    console.log('[seed] Created donor User account:', donorEmail);
  } else {
    console.log('[seed] Donor User account already exists:', donorEmail);
  }

  // 3. Ensure corresponding 'Donor' collection document exists
  let donorObj = await Donor.findOne({ email: donorEmail });
  if (!donorObj) {
    donorObj = await Donor.create({
      name: 'Amit Sharma',
      email: donorEmail,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop'
    });
    console.log('[seed] Created Donor collection reference document');
  }

  // 4. Seed active campaigns
  const campaignsData = [
    {
      creator: creator._id,
      title: 'Clean Water Project',
      description: 'Providing clean and safe drinking water to remote villages in India by building deep wells and purifiers.',
      category: 'Health',
      coverImageUrl: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=500&auto=format&fit=crop',
      goalAmount: 1000000,
      raisedAmount: 0,
      donorCount: 0,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days left
    },
    {
      creator: creator._id,
      title: 'Education for All',
      description: 'Funding school supplies, uniforms, and digital devices for underprivileged children in government schools.',
      category: 'Education',
      coverImageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&auto=format&fit=crop',
      goalAmount: 2500000,
      raisedAmount: 0,
      donorCount: 0,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days left
    },
    {
      creator: creator._id,
      title: 'Plant Trees Save Earth',
      description: 'A community reforestation drive aimed at planting 10,000 native saplings in urban areas to combat pollution.',
      category: 'Environment',
      coverImageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&auto=format&fit=crop',
      goalAmount: 500000,
      raisedAmount: 0,
      donorCount: 0,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days left
    },
    {
      creator: creator._id,
      title: 'Animal Shelter Care',
      description: 'Upgrading our rescue center facilities to accommodate more stray animals and provide medical treatments.',
      category: 'Animal Welfare',
      coverImageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop',
      goalAmount: 1200000,
      raisedAmount: 0,
      donorCount: 0,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) // 20 days left
    }
  ];

  const seededCampaigns = await Campaign.insertMany(campaignsData);
  console.log(`[seed] Seeded ${seededCampaigns.length} campaigns`);

  // 5. Seed sample donations for the test donor
  const donationsData = [
    {
      donor: donorObj._id,
      campaign: seededCampaigns[0]._id, // Clean Water
      creator: creator._id,
      amount: 15000,
      status: 'completed',
      message: 'Happy to support this vital work!',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    },
    {
      donor: donorObj._id,
      campaign: seededCampaigns[1]._id, // Education for All
      creator: creator._id,
      amount: 10000,
      status: 'completed',
      message: 'Education is the key to progress.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    }
  ];

  // We save one by one so that the model's post('save') hook runs and updates campaign stats!
  for (const d of donationsData) {
    const donation = new Donation(d);
    await donation.save();
  }

  console.log('[seed] Seeded donations and updated campaign raised/donor stats!');
  console.log('[seed] Done.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[seed] Seeding failed:', err);
  process.exit(1);
});

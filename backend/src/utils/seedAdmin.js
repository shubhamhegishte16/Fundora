// One-time script to create the first admin account.
// Run manually: node src/utils/seedAdmin.js
// Never exposed via HTTP — this is the only way to create the very first admin.

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';

dotenv.config();
console.log('URI being used:', process.env.MONGODB_URI);
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;
    const name = process.env.SEED_ADMIN_NAME || 'Fundora Admin';

    if (!email || !password) {
      console.error(
        'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env before running this script'
      );
      process.exit(1);
    }

    if (password.length < 8) {
      console.error('SEED_ADMIN_PASSWORD must be at least 8 characters');
      process.exit(1);
    }

    const existing = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      console.log(`An admin with email ${email} already exists. Aborting.`);
      process.exit(0);
    }

    const admin = await Admin.create({ name, email, password });
    console.log(`Admin created successfully: ${admin.email} (id: ${admin._id})`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
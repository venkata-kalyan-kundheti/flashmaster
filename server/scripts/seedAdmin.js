/**
 * Seed script to create the default admin user.
 * Run with: node scripts/seedAdmin.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: 'admin@gmail.com' });
    if (existing) {
      console.log('Admin user already exists — skipping seed.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = new User({
      name: 'admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin',
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('   Email:    admin@gmail.com');
    console.log('   Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();

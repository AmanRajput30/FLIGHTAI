require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createAdmin() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not set in .env');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@aervyn.in';
    const password = 'AdminPassword123!';
    const username = 'admin';

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      console.log('User already exists, updating password and verifying email...');
      user.passwordHash = await bcrypt.hash(password, 10);
      user.isEmailVerified = true;
      user.role = 'ADMIN';
      await user.save();
      console.log('User updated successfully.');
    } else {
      console.log('Creating new admin user...');
      const passwordHash = await bcrypt.hash(password, 10);
      user = new User({
        name: 'Aervyn Admin',
        username,
        email,
        passwordHash,
        isEmailVerified: true,
        role: 'ADMIN'
      });
      await user.save();
      console.log('Admin user created successfully.');
    }

    console.log('\n--- ADMIN CREDENTIALS ---');
    console.log(`Email:    ${email}`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log('-------------------------\n');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();

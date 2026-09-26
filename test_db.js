require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./backend/models/User');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/aervyn_dev_db_3');
  const user = await User.findOne({ email: 'admin@aervyn.in' });
  console.log('Current payment method in DB:', user.paymentMethod);
  
  user.paymentMethod = { brand: 'AMEX', last4: '0005', exp: '11/27' };
  user.markModified('paymentMethod');
  await user.save();
  
  const updatedUser = await User.findOne({ email: 'admin@aervyn.in' });
  console.log('Updated payment method in DB:', updatedUser.paymentMethod);
  
  process.exit(0);
}
run();

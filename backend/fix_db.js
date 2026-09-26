require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function fixDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    // Unset googleId and appleId if they are null
    const result = await User.updateMany(
      { $or: [{ googleId: null }, { appleId: null }] },
      { $unset: { googleId: "", appleId: "" } }
    );
    console.log('Updated documents:', result.modifiedCount);

    // Drop the indexes so they can be recreated without the nulls
    try {
      await mongoose.connection.collection('users').dropIndex('googleId_1');
      console.log('Dropped googleId_1 index');
    } catch (e) {
      console.log('Index googleId_1 not found or could not be dropped');
    }

    try {
      await mongoose.connection.collection('users').dropIndex('appleId_1');
      console.log('Dropped appleId_1 index');
    } catch (e) {
      console.log('Index appleId_1 not found or could not be dropped');
    }
    
    console.log('Done fixing DB');
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixDB();

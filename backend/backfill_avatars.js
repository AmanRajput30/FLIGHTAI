require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flightai').then(async () => {
  const users = await User.collection.find({
    $or: [
      { avatar: '' },
      { avatar: '/avatar.png' },
      { avatar: { $exists: false } }
    ]
  }).toArray();

  for (let u of users) {
    if (!u.name) continue;
    const newAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(u.name) + '&background=eab308&color=000';
    await User.collection.updateOne({ _id: u._id }, { $set: { avatar: newAvatar } });
    console.log('Updated ' + (u.username || 'unknown'));
  }
  
  console.log('Done backfilling avatars');
  process.exit(0);
});

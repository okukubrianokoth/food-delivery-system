import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  isAdmin: Boolean
});

const User = mongoose.model('User', userSchema);

async function checkAndUpdateUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all users
    const users = await User.find({}, 'name email isAdmin');
    console.log('Current users:');
    users.forEach(user => {
      console.log(`- ${user.name}: ${user.email} (Admin: ${user.isAdmin})`);
    });

    // Make user admin
    const result = await User.updateOne(
      { email: 'okukubrian743@gmail.com' },
      { $set: { isAdmin: true } }
    );

    console.log('Update result:', result);

    // Check updated user
    const updatedUser = await User.findOne({ email: 'okukubrian743@gmail.com' });
    if (updatedUser) {
      console.log('Updated user:', updatedUser.name, updatedUser.email, 'Admin:', updatedUser.isAdmin);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkAndUpdateUser();
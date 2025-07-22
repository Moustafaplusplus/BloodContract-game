import { User } from './src/models/User.js';
import { sequelize } from './src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function makeAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const email = process.argv[2];
    if (!email) {
      console.error('❌ Please provide an email address');
      console.log('Usage: node makeAdmin.js <email>');
      process.exit(1);
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.error('❌ User not found with email:', email);
      process.exit(1);
    }

    user.isAdmin = true;
    await user.save();

    console.log('✅ User is now an admin:', {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

makeAdmin(); 
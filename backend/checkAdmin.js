import { User } from './src/models/User.js';
import { sequelize } from './src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkAndFixAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check if admin user exists
    const adminUser = await User.findOne({ 
      where: { email: 'admin@hitman.com' } 
    });

    if (!adminUser) {
      console.log('❌ Admin user not found. Creating...');
      const newAdmin = await User.create({
        username: 'admin',
        email: 'admin@hitman.com',
        password: 'admin123',
        age: 25,
        gender: 'male',
        isAdmin: true,
      });
      console.log('✅ Admin user created:', {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
        isAdmin: newAdmin.isAdmin
      });
    } else {
      console.log('👤 Admin user found:', {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        isAdmin: adminUser.isAdmin
      });

      // Check if isAdmin is set to true
      if (!adminUser.isAdmin) {
        console.log('⚠️  Admin user exists but isAdmin is false. Fixing...');
        adminUser.isAdmin = true;
        await adminUser.save();
        console.log('✅ Admin status fixed');
      } else {
        console.log('✅ Admin status is correct');
      }
    }

    // List all admin users
    const allAdmins = await User.findAll({ 
      where: { isAdmin: true },
      attributes: ['id', 'username', 'email', 'isAdmin']
    });
    
    console.log('\n📋 All admin users:');
    allAdmins.forEach(admin => {
      console.log(`  - ${admin.username} (${admin.email}) - Admin: ${admin.isAdmin}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAndFixAdmin(); 
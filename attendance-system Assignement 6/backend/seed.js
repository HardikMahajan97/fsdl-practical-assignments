
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: 'admin@school.edu' });
  if (existing) {
    console.log('Admin user already exists:', existing.email);
    process.exit(0);
  }

  const admin = await User.create({
    name: 'System Administrator',
    email: 'admin@school.edu',
    password: 'Admin@1234',
    role: 'admin',
    department: 'Administration',
  });

  console.log('✅ Admin user created:');
  console.log('   Email   :', admin.email);
  console.log('   Password: Admin@1234');
  console.log('   ⚠  Change this password after first login!');

  // Seed a sample teacher
  const teacher = await User.create({
    name: 'Mrs. Anjali Sharma',
    email: 'anjali@school.edu',
    password: 'Teacher@1234',
    role: 'teacher',
    department: 'Science',
    createdBy: admin._id,
  });
  console.log('\n✅ Sample teacher created:');
  console.log('   Email   :', teacher.email);
  console.log('   Password: Teacher@1234');

  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});

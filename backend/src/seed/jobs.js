// File: backend/src/seed/jobs.js
import { sequelize } from '../config/db.js';
import Job from '../models/job.js';

await sequelize.sync();

const cleaner = await Job.create({
  title: 'Janitor',
  salary: 500,
  statRequirements: { strength: 2, dexterity: 1, defence: 1, labour: 4 }
});

const guard = await Job.create({
  title: 'Security Guard',
  salary: 1200,
  statRequirements: { strength: 5, dexterity: 4, defence: 3, labour: 3 }
});

const manager = await Job.create({
  title: 'Operations Manager',
  salary: 2500,
  statRequirements: { strength: 6, dexterity: 6, defence: 5, labour: 7 }
});

// Set promotion chain
await cleaner.update({ promotionTo: guard.id });
await guard.update({ promotionTo: manager.id });

console.log('✅ Jobs seeded');
process.exit();

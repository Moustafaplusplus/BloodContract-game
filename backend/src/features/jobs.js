// =======================================================
//  backend/src/features/jobs.js
//  Employment & Gym
//  • Job Mongoose model (salary + stat bonuses)
//  • /api/jobs routes  (list / apply / promote)
//  • /api/gym route    (train)
//  • Midnight cron to pay salary + grant XP + stat buffs
//  • seedJobs() helper (runs only if collection empty)
// =======================================================

/* ---------- externals ---------- */
import mongoose from 'mongoose';
import express  from 'express';
import cron     from 'node-cron';

/* ---------- locals ------------- */
import { Character } from './character.js';
import { auth }      from './user.js';

/* =====================================================================
 * 1️⃣  Job model
 * =====================================================================*/
const jobSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  statRequirements: {
    strength:  { type: Number, default: 0 },
    dexterity: { type: Number, default: 0 },
    defence:   { type: Number, default: 0 },
    labour:    { type: Number, default: 0 },
  },
  salary:        { type: Number, required: true }, // cash per day
  expReward:     { type: Number, required: true }, // exp per day
  powerBonus:    { type: Number, default: 0 },     // strength gain per day
  defenseBonus:  { type: Number, default: 0 },     // defense gain per day
  promotionTo:   { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
});
export const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

/* =====================================================================
 * 2️⃣  Routers
 * =====================================================================*/
export const jobsRouter = express.Router();
export const gymRouter  = express.Router();

// GET /api/jobs
jobsRouter.get('/', async (_req, res) => {
  const jobs = await Job.find().populate('promotionTo');
  res.json(jobs);
});

// POST /api/jobs/apply { jobId }
jobsRouter.post('/apply', auth, async (req, res) => {
  const { jobId } = req.body;
  const char  = await Character.findOne({ where: { userId: req.user.id } });
  const job   = await Job.findById(jobId);
  if (!char || !job) return res.status(404).json({ message: 'Job or character not found' });

  const st = char.strength ?? 0;
  const dx = char.dexterity ?? 0;
  const df = char.defense  ?? 0;
  const lb = char.labour   ?? 0;
  const r  = job.statRequirements;
  const ok = st>=r.strength && dx>=r.dexterity && df>=r.defence && lb>=r.labour;
  if (!ok) return res.status(400).json({ message:'Stat requirements not met' });

  char.jobId = job._id;
  await char.save();
  res.json({ message:'Job applied', job });
});

// POST /api/jobs/promote
jobsRouter.post('/promote', auth, async (req,res)=>{
  const char = await Character.findOne({ where:{ userId: req.user.id } });
  if (!char?.jobId) return res.status(400).json({ message:'No job' });
  const current = await Job.findById(char.jobId).populate('promotionTo');
  if (!current?.promotionTo) return res.status(400).json({ message:'No promotion available' });
  const nextJob = current.promotionTo;
  const { strength, dexterity, defence, labour } = nextJob.statRequirements;
  const ok = (char.strength>=strength && char.dexterity>=dexterity && char.defense>=defence && (char.labour??0)>=labour);
  if (!ok) return res.status(400).json({ message:'Stat requirements not met' });
  char.jobId = nextJob._id; await char.save();
  res.json({ message:'Promoted', job: nextJob });
});

/* ---------- /api/gym/train ---------- */
gymRouter.post('/train', auth, async (req,res)=>{
  const energyUsed = Number(req.body.energy);
  if (!energyUsed || energyUsed<=0) return res.status(400).send('Invalid energy');
  const char = await Character.findOne({ where:{ userId: req.user.id } });
  if (!char) return res.status(404).send('Character not found');
  if (char.energy < energyUsed) return res.status(400).send('Not enough energy');

  const gain = Math.floor(energyUsed * 0.2 + Math.random()*5);
  char.energy  -= energyUsed;
  char.strength += gain;
  char.defense  += Math.floor(gain*0.5);
  await char.save();
  res.json({ gained:{ strength: gain, defense: Math.floor(gain*0.5) }, remainingEnergy: char.energy });
});

/* =====================================================================
 * 3️⃣  Midnight cron – daily salary & stat growth
 * =====================================================================*/
export function startJobPayoutCron(){
  // run every day at 00:01
  cron.schedule('1 0 * * *', async ()=>{
    console.log('💼 Running daily job payouts');
    const chars = await Character.findAll({ where: { jobId: { [sequelize.Op.ne]: null } } });
    for (const char of chars){
      const job = await Job.findById(char.jobId);
      if (!job) continue;
      char.money   += job.salary;
      char.exp      = (char.exp||0) + job.expReward;
      char.strength += job.powerBonus;
      char.defense  += job.defenseBonus;
      await char.save();
    }
  });
}

/* =====================================================================
 * 4️⃣  Seeder – only if collection empty
 * =====================================================================*/
export async function seedJobs(){
  if (await Job.countDocuments()) return; // already seeded
  const janitor   = await Job.create({ title:'Janitor', salary:500,  expReward:25, powerBonus:1, defenseBonus:1, statRequirements:{ strength:2, dexterity:1, defence:1, labour:2 } });
  const guard     = await Job.create({ title:'Security Guard', salary:1200, expReward:40, powerBonus:2, defenseBonus:2, statRequirements:{ strength:4, dexterity:3, defence:3, labour:3 }, promotionTo:null });
  const manager   = await Job.create({ title:'Operations Manager', salary:2500, expReward:60, powerBonus:3, defenseBonus:3, statRequirements:{ strength:6, dexterity:5, defence:5, labour:6 }, promotionTo:null });
  await janitor.updateOne({ promotionTo: guard._id });
  await guard.updateOne({ promotionTo: manager._id });
  console.log('✅ Jobs seeded');
}

/* =====================================================================
 * 5️⃣  Barrel
 * =====================================================================*/
export default { Job, jobsRouter, gymRouter, seedJobs, startJobPayoutCron };

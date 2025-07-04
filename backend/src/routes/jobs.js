import express from "express";
import Job from "../models/job.js";
import User from "../models/user.js";

const router = express.Router();

// GET all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().populate("promotionTo");
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// APPLY for a job
router.post("/apply", async (req, res) => {
  try {
    const { userId, jobId } = req.body;
    const user = await User.findById(userId);
    const job = await Job.findById(jobId);

    if (!user || !job) {
      return res.status(404).json({ message: "User or Job not found." });
    }

    const { strength, dexterity, defence, labour } = user.stats;
    const reqs = job.statRequirements;

    const meets =
      strength >= reqs.strength &&
      dexterity >= reqs.dexterity &&
      defence >= reqs.defence &&
      labour >= reqs.labour;

    if (!meets) {
      return res.status(400).json({ message: "Stat requirements not met." });
    }

    user.job = job._id;
    await user.save();

    res.json({ message: "Job applied successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PROMOTE the user if criteria met
router.post("/promote", async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId).populate("job");

    if (!user || !user.job || !user.job.promotionTo) {
      return res.status(400).json({ message: "No promotion available." });
    }

    const nextJob = await Job.findById(user.job.promotionTo);
    const { strength, dexterity, defence, labour } = user.stats;
    const reqs = nextJob.statRequirements;

    const meets =
      strength >= reqs.strength &&
      dexterity >= reqs.dexterity &&
      defence >= reqs.defence &&
      labour >= reqs.labour;

    if (!meets) {
      return res.status(400).json({
        message: "Stat requirements not met for promotion.",
      });
    }

    user.job = nextJob._id;
    await user.save();

    res.json({ message: "Promoted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
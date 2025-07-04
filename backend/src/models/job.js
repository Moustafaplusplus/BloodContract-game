import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  statRequirements: {
    strength: { type: Number, default: 0 },
    dexterity: { type: Number, default: 0 },
    defence: { type: Number, default: 0 },
    labour: { type: Number, default: 0 },
  },
  salary: { type: Number, required: true },
  promotionTo: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
});

const Job = mongoose.model("Job", jobSchema);
export default Job;
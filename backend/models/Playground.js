import mongoose from "mongoose";

const playgroundSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  code:     { type: String, required: true, unique: true, uppercase: true }, // e.g. ALPHA-7X
  password: { type: String, default: null },   // null = no password
  owner:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members:  [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  pendingMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isActive: { type: Boolean, default: true },
  description: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Playground", playgroundSchema);

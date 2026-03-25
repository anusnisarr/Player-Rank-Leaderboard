import mongoose from "mongoose";

const rawEventSchema = new mongoose.Schema({
  type:      { type: String },   // "kill", "damage", "round_end"
  raw:       { type: String },   // the original log line
  data:      { type: Object },   // whatever the exe parsed and sent
  source:    { type: String },   // exe machine name or ip
  createdAt: { type: Date, default: Date.now },
});
 

export default mongoose.model("RawEvent", rawEventSchema);
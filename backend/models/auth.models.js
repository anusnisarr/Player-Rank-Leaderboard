import mongoose from "mongoose"


const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref:  "Player",
    },
}, { timestamps: true });

export default mongoose.model("User" , userSchema);


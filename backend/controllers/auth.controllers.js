import User from "../models/auth.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
    console.log(req.body)
    const { username, email, password } = req.body;

  try {

    const isUsernameTaken = await User.findOne({ username });
    if (isUsernameTaken) {
      return res.status(400).json({ success: false, error: "Player name already exists" });
    }

    const isEmailTaken = await User.findOne({ email });
    if (isEmailTaken) {
      return res.status(400).json({ success: false, error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await User.create({ username, email, password:hashedPassword });
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: false, sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ success: true, data: user });

  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, error: "Player name already exists" });
    res.status(400).json({ success: false, error: err.message });
  }
};

export const loginUser = async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {

        return res.status(400).json({ success: false, message: "Credentials are required" });
    }

    const query = identifier.includes("@") ? { email: identifier } : { username: identifier };
    
  try {

    const user = await User.findOne(query);

    if (!user) {
      return res.status(400).json({ success: false, message: "User Does Not Exist" });
    }

    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
    
    if (!passwordMatch) {
      return res.status(400).json({ success: false, message: "Invalid Password" });
    }

    const { _id, username, email } = user;
    const accessToken = jwt.sign({ id: _id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: false, sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ success: true, message: "Login successful", data: { _id, username, email } });

  } catch (err) {
    console.error("Login error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
};
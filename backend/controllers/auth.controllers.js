import User from "../models/auth.models.js";
import Player from "../models/player.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const isProduction = process.env.NODE_ENV === "production";

export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

  try {

    const isUsernameTaken = await User.findOne({ username });
    if (isUsernameTaken) {
      return res.status(400).json({ success: false, message: "username already exists" });
    }

    const isEmailTaken = await User.findOne({ email });
    if (isEmailTaken) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ username, email, password:hashedPassword });
    const player = await Player.create({ name: username, user: user._id });

    user.player = player._id;
    await user.save();
    
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure:   isProduction,           // false on local (http), true on production (https)
      sameSite: isProduction ? "none" : "lax",  // lax works on local same-origin
      domain:   isProduction ? ".rankify.website" : undefined, // no domain restriction on local
      maxAge:   7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ success: true, message: "User Register Successfully!", data: { user, playerId: player._id }});

  } catch (err) {
    console.log("Registration error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email , password } = req.body;
  
  try {

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Credentials are required" });
    }
    
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "User Does Not Exist" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ success: false, message: "Invalid Password" });
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure:   isProduction,           // false on local (http), true on production (https)
      sameSite: isProduction ? "none" : "lax",  // lax works on local same-origin
      domain:   isProduction ? ".rankify.website" : undefined, // no domain restriction on local
      maxAge:   7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, message: "Login successful", data: user });

  } catch (err) {
    console.error("Login error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure:   isProduction,
    sameSite: isProduction ? "none" : "lax",
    domain:   isProduction ? ".rankify.website" : undefined,
  });
  res.status(200).json({ success: true, message: "Logout successful" });
}

export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("-password")
    .populate("player", "name rank score avatar");

  res.json({
    success: true,
    data: {
      _id:      user._id,
      username: user.username,
      email:    user.email,
      player:   user.player,       // full player object
      playerId: user.player?._id,  // shortcut
    }
  });
};
import User from "../models/auth.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",  // lax works now since same domain
      domain:   ".rankify.website",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ success: true, message: "User Register Successfully!", data: user});

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
      secure: true,
      sameSite: "none",  // lax works now since same domain
      domain:   ".rankify.website",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, message: "Login successful", data: user });

  } catch (err) {
    console.error("Login error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
};
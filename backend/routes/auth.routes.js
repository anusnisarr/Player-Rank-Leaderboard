import express from "express"
import * as auth  from "../controllers/auth.controllers.js";

const router = express.Router();


//Login POST
router.post("/login", auth.loginUser);

//Register POST
router.post("/register", auth.registerUser);


export default router;
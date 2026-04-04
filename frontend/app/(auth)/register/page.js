"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api"
import { container, card, title, input, button, link } from "@/lib/authStyles";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
        await api.post("/auth/register", {
          username,
          email,
          password
        });
        router.push("/")
    } catch (error) {
      console.log(error.response?.data || error.message);
      toast.error("Registration failed");
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <div style={title}>Create Account</div>

        <input
          style={input}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          style={input}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={button} onClick={handleRegister}>
          Register
        </button>

        <div style={link}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#FF4655" }}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
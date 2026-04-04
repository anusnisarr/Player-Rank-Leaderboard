"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api"
import toast from "react-hot-toast";
import { container, card, title, input, button, link } from "@/lib/authStyles";

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
        const res = await api.post("/auth/login", { identifier, password });
        console.log("Login response:", res.data);
        toast.success( res.message );
        router.push("/");
    } catch (error) {
        console.log(error.data);
        toast.error( error.message || "Some Error Occurred During Login" );
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <div style={title}>Login</div>

        <input
          style={input}
          placeholder="Email or Username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />

        <input
          style={input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={button} onClick={handleLogin}>
          Login
        </button>

        <div style={link}>
          Don’t have an account?{" "}
          <Link href="/register" style={{ color: "#FF4655" }}>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
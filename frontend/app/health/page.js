"use client";
import { useState, useEffect } from "react";
import { getHealth} from "@/lib/api";
import toast from "react-hot-toast";

export default function PlayerPage() {
 const [success, setSuccess] = useState(null);
  useEffect(() => {
    getHealth().then(r => setSuccess(r.status)).catch(() => toast.error("Player not found"));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Server Check</h1>
      {success ? (
        <div className="text-green-600">Software Running! Status: {success}</div>
      ) : (
        <div className="text-red-600">Software is not responding.</div>
      )}
    </div>
  );
}
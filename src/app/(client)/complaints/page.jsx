"use client";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext"; // Adjust path as needed
import { createClient } from "../utils/supabase/server";

export default function Complaint() {
  const { user } = useAuth();
  const [complaint, setComplaint] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("complaints")
        .insert([{ user_email: user.email, content: complaint }]);

      if (error) throw error;
      alert("Complaint submitted successfully");
      setComplaint("");
    } catch (error) {
      alert("Error submitting complaint: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold">Submit a Complaint</h1>
      <p>Email: {user?.email}</p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <textarea
          className="w-full rounded-lg border border-gray-300 p-2"
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          placeholder="Enter your complaint..."
          rows="5"
        />
        <button
          className="rounded-lg bg-primary-100 px-4 py-2 text-white"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>
    </div>
  );
}

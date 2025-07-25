// app/complaints/page.tsx
"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { createClient } from "@/app/utils/supabase/client";
import ComplaintForm from "@/components/ComplaintForm";
import { toastError, toastSuccess } from '@/app/utils/functions/toast';

export default function Complaint() {
  const { user } = useAuth();
  const router = useRouter();
  const [complaint, setComplaint] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matNum, setMatNum] = useState<string | null>(null);

  // Fetch matriculation number
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchMatNum = async () => {
      if (!user?.email) return;
      try {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from("users")
          .select("mat_num")
          .eq("email", user.email)
          .single();
        if (error) throw error;
        setMatNum(data?.mat_num || null);
      } catch (err) {
        console.error("Failed to fetch matriculation number:", err);
      }
    };

    fetchMatNum();
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = await createClient();
      const { error } = await supabase.from("complaints").insert([
        {
          user_email: user.email,
          matriculation_number: matNum,
          content: complaint,
          status: "pending",
        },
      ]);

      if (error) throw error;

      toastSuccess("Complaint submitted successfully");
      setComplaint("");
      router.push("/dashboard");
    } catch (error) {
      toastError("Error submitting complaint: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-20 min-h-screen">
      <h1 className="mb-4 text-2xl font-bold">Submit a Complaint</h1>

      <Suspense fallback={<div>Loading complaint form...</div>}>
        <ComplaintForm
          user={user}
          matNum={matNum}
          setComplaint={setComplaint}
        />
      </Suspense>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <textarea
          className="w-full rounded-lg border border-gray-300 p-2"
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          placeholder="Enter your complaint..."
          rows={10}
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

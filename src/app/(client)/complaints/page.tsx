"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { createClient } from "@/app/utils/supabase/client";
import formatTableName from "@/app/utils/formatTitle";

export default function Complaint() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [complaint, setComplaint] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matNum, setMatNum] = useState<string | null>(null);

  // Fetch mat_num and pre-fill complaint draft
  useEffect(() => {
    // Valid levels
    const validLevels = ["nd_1", "nd_2", "hnd_1", "hnd_2"];

    if (!user) {
      router.push("/login");
      return;
    }

    // Fetch matriculation number
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

    // Extract query parameters and generate complaint draft
    const level = searchParams.get("level");
    const semester = searchParams.get("semester");
    const session = searchParams.get("session");
    console.log(level);
    console.log(semester);
    console.log(session);

    if (level && semester && session && validLevels.includes(level)) {
      const tableName = `(${level}_${semester}_${session})`;
      console.log("Constructed tableName:", tableName);
      const formattedTableName = formatTableName(tableName);
      console.log("Formatted tableName:", formattedTableName);
      const draft = `Subject: Complaint Regarding Academic Results for ${formattedTableName}

  Dear [Recipient/Registrar's Office],

  I am writing to formally lodge a complaint regarding my academic results for ${formattedTableName}. My matriculation number is ${matNum || "[Your Matriculation Number]"}. Below are the details of my concern:

  [Please specify the issue, e.g., discrepancies in grades, missing results, or errors in course records.]

  I kindly request a review of my results and a response addressing this matter at your earliest convenience. Please let me know if additional documentation or information is required.

  Thank you for your attention to this matter.

  Sincerely,
  ${user?.email || "[Your Name]"}`;
      setComplaint(draft);
    } else {
      // Fallback draft if parameters are missing or invalid
      const draft = `Subject: Complaint Regarding Academic Results

  Dear [Recipient/Registrar's Office],

  I am writing to formally lodge a complaint regarding my academic results. My matriculation number is ${matNum || "[Your Matriculation Number]"}. Below are the details of my concern:

  [Please specify the issue, e.g., discrepancies in grades, missing results, or errors in course records.]

  I kindly request a review of my results and a response addressing this matter at your earliest convenience. Please let me know if additional documentation or information is required.

  Thank you for your attention to this matter.

  Sincerely,
  ${user?.email || "[Your Name]"}`;
      setComplaint(draft);
    }
  }, [searchParams, user, router, matNum]);

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

      alert("Complaint submitted successfully");
      setComplaint("");
      router.push("/dashboard");
    } catch (error) {
      alert("Error submitting complaint: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-20 min-h-screen">
      <h1 className="mb-4 text-2xl font-bold">Submit a Complaint</h1>

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

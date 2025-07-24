// app/components/ComplaintForm.tsx
"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import formatTableName from "@/app/utils/formatTitle";

interface ComplaintFormProps {
  user: { email: string } | null;
  matNum: string | null;
  setComplaint: (complaint: string) => void;
}

export default function ComplaintForm({ user, matNum, setComplaint }: ComplaintFormProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const validLevels = ["nd_1", "nd_2", "hnd_1", "hnd_2"];
    const level = searchParams.get("level");
    const semester = searchParams.get("semester");
    const session = searchParams.get("session");

    if (level && semester && session && validLevels.includes(level)) {
      const tableName = `(${level}_${semester}_${session})`;
      const formattedTableName = formatTableName(tableName);
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
  }, [searchParams, user, matNum, setComplaint]);

  return null; // This component only handles logic, no rendering
}
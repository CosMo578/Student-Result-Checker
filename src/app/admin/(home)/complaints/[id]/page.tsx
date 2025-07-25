"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/app/utils/supabase/client";
import Spinner from "@/components/Spinner";
import Link from "next/link";
import { toastError, toastSuccess, toastWarn } from '@/app/utils/functions/toast';

const EditComplain = () => {
  const params = useParams();
  const complainID = params.id;
  const supabase = createClient();
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminResponse, setAdminResponse] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isResolved, setIsResolved] = useState<boolean>(false);

  // Fetch complaint by ID
  useEffect(() => {
    const fetchComplaint = async () => {
      if (!complainID) {
        setError("No complaint ID provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("complaints")
          .select("*")
          .eq("id", complainID)
          .single();

        console.log("Fetched complaint:", data);
        console.log("Fetch error:", error);

        if (error) {
          setError(error.message);
        } else if (!data) {
          setError("Complaint not found");
        } else {
          setComplaint(data);
          setAdminResponse(data.admin_response || "");
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError((err as Error).message || "Failed to fetch complaint");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [complainID, supabase]);

  // Update complaint
  const updateResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminResponse || !complainID) {
      toastWarn("Please provide a response");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("complaints")
        .update({
          status: isResolved ? "resolved" : "pending",
          admin_response: adminResponse,
        })
        .eq("id", complainID)
        .select()
        .single();

      console.log("Updated complaint:", data);
      console.log("Update error:", error);

      if (error) throw error;

      toastSuccess("Response sent successfully");
      setComplaint(data); // Update state with the new complaint data
      setAdminResponse(data.admin_response || "");
    } catch (error) {
      console.error("Update error:", error);
      toastError("Error updating response: " + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  // Function to extract matriculation number from content
  const extractMatricNumber = (content: string): string => {
    const match = content.match(/My matriculation number is (\S+)/);
    return match ? match[1] : "N/A";
  };

  return (
    <div className="px-4 pb-8 pt-20">
      <Link
        href="/admin/complaints"
        className="mt-4 inline-block rounded-lg bg-primary-100 px-4 py-2 text-white"
      >
        Back to Complaints
      </Link>

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : !complaint ? (
        <p>No complaint found</p>
      ) : (
        <div className="mt-4">
          <div className="mb-4 flex items-center justify-between">
            <p>
              <strong>Email:</strong> {complaint.user_email || "N/A"}
            </p>
            <p>
              <strong>Matriculation Number:</strong>{" "}
              {extractMatricNumber(complaint.content || "")}
            </p>
            <p>
              <strong>Status:</strong> {complaint.status || "Pending"}
            </p>
          </div>

          <p>
            <strong>Content:</strong> {complaint.content || "N/A"}
          </p>

          <form onSubmit={updateResponse} className="mt-4 flex flex-col gap-4">
            <label className="space-y-4">
              <p className="text-xl">Admin Response</p>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-2"
                value={adminResponse || ""}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Enter your response"
                rows={5}
              />
            </label>

            <div className="flex w-2/6 cursor-pointer items-center rounded-md border border-gray-500 bg-gray-200 ps-4">
              <input
                id="status"
                type="checkbox"
                checked={isResolved} // Bind checkbox to state
                onChange={(e) => setIsResolved(e.target.checked)} // Update state on change
                name="bordered-checkbox"
                className="h-4 w-4 cursor-pointer rounded-lg bg-gray-500 text-primary-300 checked:bg-primary-300 checked:text-primary-300"
              />
              <label
                htmlFor="status"
                className="ms-2 w-full cursor-pointer py-4 text-sm font-medium text-gray-900"
              >
                Mark as Resolved
              </label>
            </div>

            <button
              className="rounded-lg bg-primary-100 disabled:bg-gray-300 px-4 py-2 text-white"
              type="submit"
              disabled={submitting || !adminResponse}
            >
              {submitting ? "Sending..." : "Send Response"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default EditComplain;

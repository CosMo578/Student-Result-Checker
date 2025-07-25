"use client";
import Link from "next/link";
import { createClient } from "../../../utils/supabase/client";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [pendingComplaintsCount, setPendingComplaintsCount] = useState(0);
  const [resolvedComplaintsCount, setResolvedComplaintsCount] = useState(0);
  const [resultsCount, setResultsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch complaints and calculate counts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const supabase = createClient();

        // Fetch complaints
        const { data: complaintData, error: complaintError } = await supabase
          .from("complaints")
          .select("*");

        if (complaintError) throw complaintError;

        // Fetch results
        const { data: resultData, error: resultError } = await supabase
          .from("results_metadata")
          .select("*");
        if (resultError) throw resultError;

        console.log("Fetched complaints:", complaintData);
        console.log("Fetched results:", resultData);

        // Calculate complaint counts
        const pendingCount = complaintData.filter(
          (complaint) => complaint.status.toLowerCase() === "pending",
        ).length;
        const resolvedCount = complaintData.filter(
          (complaint) => complaint.status.toLowerCase() === "resolved",
        ).length;

        setPendingComplaintsCount(pendingCount);
        setResolvedComplaintsCount(resolvedCount);
        setResultsCount(resultData.length);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const recentActivity = [
    { action: "Results uploaded for CS101", date: "2025-07-23" },
    { action: "Complaint #122 marked as completed", date: "2025-07-22" },
    { action: "New complaint #125 received", date: "2025-07-22" },
  ];

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto mt-20 max-w-screen-xl px-4 sm:px-6 lg:px-8">
        {/* Error Display */}
        {error && <div className="mb-4 text-red-500">{error}</div>}

        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-6 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-800">
              Total Results Uploaded
            </h2>
            <p className="text-2xl font-bold text-primary-300">
              {loading ? "Loading..." : resultsCount}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-800">
              Pending Complaints
            </h2>
            <p className="text-2xl font-bold text-primary-300">
              {loading ? "Loading..." : pendingComplaintsCount}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-800">
              Resolved Complaints
            </h2>
            <p className="text-2xl font-bold text-primary-300">
              {loading ? "Loading..." : resolvedComplaintsCount}{" "}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex justify-center gap-4">
          <Link href="/admin/upload">
            <button className="rounded-lg bg-primary-300 px-6 py-3 font-semibold text-white hover:bg-primary-500">
              Upload New Results
            </button>
          </Link>
          <Link href="/admin/results">
            <button className="rounded-lg bg-primary-300 px-6 py-3 font-semibold text-white hover:bg-primary-500">
              View All Results
            </button>
          </Link>
          <Link href="/admin/complaints">
            <button className="rounded-lg bg-primary-300 px-6 py-3 font-semibold text-white hover:bg-primary-500">
              View All Complaints
            </button>
          </Link>
        </div>

        {/* Recent Activity Feed */}
        {/* <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Recent Activity
          </h2>
          <ul className="space-y-2">
            {recentActivity.map((activity, index) => (
              <li key={index} className="text-gray-600">
                {activity.action}{" "}
                <span className="text-gray-400">({activity.date})</span>
              </li>
            ))}
          </ul>
        </div> */}

        {/* Recent Activity Feed */}
        <div className="pointer-events-none mb-8 select-none rounded-lg bg-white p-6 opacity-25 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Recent Activity
          </h2>
          <p className="text-gray-600">
            Coming soon: Display recent activity from complaints and results.
          </p>
        </div>

        {/* Placeholder for Future Result Updates */}
        <div className="pointer-events-none select-none rounded-lg bg-white p-6 opacity-25 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Pending Result Updates
          </h2>
          <p className="text-gray-600">
            Coming soon: Manage result updates for resolved complaints.
          </p>
          <button
            disabled
            className="mt-4 cursor-not-allowed rounded-lg bg-gray-300 px-6 py-3 font-semibold text-white"
          >
            Update Results (In Development)
          </button>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;

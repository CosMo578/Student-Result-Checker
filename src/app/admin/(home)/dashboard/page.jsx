"use client";
import Link from "next/link";
import { createClient } from "../../../utils/supabase/client";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [pendingComplaintsCount, setPendingComplaintsCount] = useState(0);
  const [resolvedComplaintsCount, setResolvedComplaintsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [complaints, setComplaints] = useState([]);

  // Fetch complaints and calculate counts
  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("complaints").select("*");

        if (error) throw error;

        console.log("Fetched complaints:", data);
        setComplaints(data || []);

        // Calculate counts based on status
        const pendingCount = data.filter(
          (complaint) => complaint.status.toLowerCase() === "pending",
        ).length;
        const resolvedCount = data.filter(
          (complaint) => complaint.status.toLowerCase() === "resolved",
        ).length;
        setPendingComplaintsCount(pendingCount);
        setResolvedComplaintsCount(resolvedCount);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);
  // Placeholder data (replace with API calls)
  const metrics = {
    totalResults: 1200,
    pendingComplaints: 15,
    resolvedComplaints: 45,
  };

  const pendingComplaints = [
    {
      id: 123,
      student: "John Doe",
      course: "CS101",
      date: "2025-07-20",
      status: "Pending",
    },
    {
      id: 124,
      student: "Jane Smith",
      course: "MATH201",
      date: "2025-07-21",
      status: "Pending",
    },
    {
      id: 125,
      student: "Ali Khan",
      course: "PHY101",
      date: "2025-07-22",
      status: "Pending",
    },
  ];

  const recentActivity = [
    { action: "Results uploaded for CS101", date: "2025-07-23" },
    { action: "Complaint #122 marked as completed", date: "2025-07-22" },
    { action: "New complaint #125 received", date: "2025-07-22" },
  ];

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto mt-20 max-w-screen-xl px-4 sm:px-6 lg:px-8">
        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-6 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-800">
              Total Results Uploaded
            </h2>
            <p className="text-2xl font-bold text-primary-300">
              {metrics.totalResults}
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
          <Link href="/upload">
            <button className="rounded-lg bg-primary-300 px-6 py-3 font-semibold text-white hover:bg-primary-500">
              Upload New Results
            </button>
          </Link>
          <Link href="/complaints">
            <button className="rounded-lg bg-primary-300 px-6 py-3 font-semibold text-white hover:bg-primary-500">
              View All Complaints
            </button>
          </Link>
        </div>

        {/* Recent Activity Feed */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
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
        </div>

        {/* Placeholder for Future Result Updates */}
        <div className="rounded-lg bg-white p-6 opacity-50 shadow">
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

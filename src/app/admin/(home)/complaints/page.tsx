"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../../utils/supabase/client";

export default function Complaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch complaints on mount
  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("complaints").select("*");

        if (error) throw error;

        console.log("Fetched complaints:", data);
        setComplaints(data || []);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // Function to extract matriculation number from content
  const extractMatricNumber = (content: string): string => {
    const match = content.match(/My matriculation number is (\S+)/);
    return match ? match[1] : "N/A";
  };

  return (
    <div className="px-4 pb-8 pt-20">
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-left text-sm text-gray-500 rtl:text-right">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Matriculation Number</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  Loading complaints...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-red-500">
                  Error fetching complaints: {error}
                </td>
              </tr>
            ) : complaints.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  No complaints found
                </td>
              </tr>
            ) : (
              complaints.map((complain, id) => (
                <tr
                  key={id}
                  className="border-b border-gray-200 odd:bg-white even:bg-gray-50"
                >
                  <th
                    scope="row"
                    className="whitespace-nowrap px-6 py-4 font-medium text-gray-900"
                  >
                    {complain.user_email || "N/A"}
                  </th>
                  <td className="px-6 py-4">
                    {extractMatricNumber(complain.content || "")}
                  </td>
                  <td className="px-6 py-4">
                    {complain.status || "Pending"}
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`/admin/complaints/${complain.id}`}
                      className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                    >
                      Edit
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
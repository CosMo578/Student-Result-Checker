"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { createClient } from "@/app/utils/supabase/client";
import { Spinner } from "flowbite-react";
import { toastSuccess } from '@/app/utils/functions/toast';

interface ResultTable {
  table_name: string;
  uploaded_at: string;
}

interface TableRow {
  id: number;
  [key: string]: any;
}

export default function ResultsAll() {
  const { user } = useAuth();
  const router = useRouter();
  const [tables, setTables] = useState<ResultTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [editingData, setEditingData] = useState<TableRow[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch table names starting with "csit"
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from("results_metadata")
          .select("table_name, uploaded_at")
          .ilike("table_name", "csit%")
          .order("uploaded_at", { ascending: false });

        if (error) throw error;

        setTables(data || []);
      } catch (err: any) {
        console.error("Failed to fetch tables:", err);
        setError("Failed to load results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [user, router]);

  // Fetch data for the selected table
  const handleEditClick = async (tableName: string) => {
    setSelectedTable(tableName);
    setLoading(true);
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from(tableName).select("*");
      if (error) throw error;

      setTableData(data || []);
      setEditingData(JSON.parse(JSON.stringify(data || []))); // Deep copy for editing
    } catch (err: any) {
      console.error("Failed to fetch table data:", err);
      setError("Failed to load table data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle cell value changes
  const handleCellChange = (
    rowIndex: number,
    column: string,
    value: string,
  ) => {
    setEditingData((prev) =>
      prev.map((row, i) =>
        i === rowIndex ? { ...row, [column]: value } : row,
      ),
    );
  };

  // Handle update to Supabase
  const handleUpdate = async () => {
    if (!selectedTable) return;
    setIsUpdating(true);
    try {
      const supabase = await createClient();
      const { error } = await supabase.from(selectedTable).upsert(editingData);
      if (error) throw error;

      setTableData(editingData); // Update displayed data
      toastSuccess("Table updated successfully");
    } catch (err: any) {
      console.error("Failed to update table:", err);
      setError("Failed to update table. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div className="mt-20 min-h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="mt-20 min-h-screen p-4">
      <h1 className="mb-4 text-2xl font-bold">All CSIT Results</h1>
      {tables.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Result Name
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Uploaded Date
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table) => (
                <tr key={table.table_name} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    {table.table_name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(table.uploaded_at).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      onClick={() => handleEditClick(table.table_name)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Editable Table for Selected Result */}
      {selectedTable && tableData.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">
            Editing: {selectedTable}
          </h2>
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-left text-sm text-gray-700 rtl:text-right">
              <thead className="bg-gray-50 text-xs uppercase text-gray-900">
                <tr>
                  {Object.keys(tableData[0]).map((column) => (
                    <th
                      key={column}
                      className="border border-gray-300 px-4 py-2 text-left"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {editingData.map((row, rowIndex) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {Object.keys(row).map((column) => (
                      <td
                        key={`${row.id}-${column}`}
                        className="w-auto min-w-32 border border-gray-300 px-4 py-2 text-center"
                      >
                        <input
                          type="text"
                          value={row[column] || ""}
                          onChange={(e) =>
                            handleCellChange(rowIndex, column, e.target.value)
                          }
                          className="w-full border-none bg-transparent focus:outline-none"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className={`mt-4 rounded-lg px-6 py-3 font-semibold text-white ${
              isUpdating
                ? "cursor-not-allowed bg-gray-300"
                : "bg-primary-300 hover:bg-primary-500"
            }`}
          >
            {isUpdating ? "Updating..." : "Update Table"}
          </button>
        </div>
      )}
    </div>
  );
}

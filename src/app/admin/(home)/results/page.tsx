"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { createClient } from "@/app/utils/supabase/client";
import { Spinner } from "flowbite-react";
import { toastSuccess, toastError } from "@/app/utils/functions/toast";

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

  /* Fetch all results tables (all departments) */
   useEffect(() => {
    setLoading(true)
    const fetchTables = async () => {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from("results_metadata")
          .select("table_name, uploaded_at")
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

  // Handle delete table
  const handleDelete = async (tableName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete ${tableName}? This will also delete associated files from cloud storage.`,
      )
    )
      return;

    setLoading(true);
    try {
      const supabase = await createClient();

      // Step 1: Delete file from cloud storage (reverse of upload)
      try {
        const filePath = `uploads/${tableName}.csv`;
        const { error: deleteFileError } = await supabase.storage
          .from("results")
          .remove([filePath]);

        if (deleteFileError) {
          // Check if file not found (404) - that's okay
          if (
            deleteFileError.message.includes("404") ||
            deleteFileError.message.includes("not found")
          ) {
            console.log("No CSV file found in storage to delete.");
          } else {
            console.warn(
              "Warning: Failed to delete storage file:",
              deleteFileError.message,
            );
          }
        } else {
          console.log("CSV file deleted successfully from storage.");
        }
      } catch (storageErr) {
        console.warn("Storage cleanup error:", storageErr);
        // Continue with other deletions even if storage fails
      }

      // Step 2: Delete metadata entry
      const { error: metaError } = await supabase
        .from("results_metadata")
        .delete()
        .eq("table_name", tableName);

      if (metaError) {
        // Check if it's a "no rows" error (which is actually success for deletion)
        if (
          metaError.message.includes("no rows") ||
          metaError.code === "PGRST116"
        ) {
          console.log("Metadata entry already deleted or not found.");
        } else {
          throw new Error(`Failed to delete metadata: ${metaError.message}`);
        }
      } else {
        console.log("Metadata entry deleted successfully.");
      }

      // Step 3: Delete table data
      const { error: tableError } = await supabase.rpc("drop_table_if_exists", {
        table_name: tableName,
      });

      if (tableError) {
        // Check if table already doesn't exist
        if (tableError.message.includes("does not exist")) {
          console.log("Table already does not exist.");
        } else {
          throw tableError;
        }
      } else {
        console.log("Table dropped successfully.");
      }

      // Update UI
      setTables((prev) =>
        prev.filter((table) => table.table_name !== tableName),
      );
      if (selectedTable === tableName) {
        setSelectedTable(null);
        setTableData([]);
        setEditingData([]);
      }

      toastSuccess("Table and associated data deleted successfully");
    } catch (err: any) {
      console.error("Failed to delete table:", err);
      toastError(`Failed to delete table: ${err.message}`);
    } finally {
      setLoading(false);
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
      <h1 className="mb-4 text-2xl font-bold">All Results</h1>
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
                      className="me-4 rounded-lg bg-primary-100 px-2 py-1 text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(table.table_name)}
                      className="rounded-lg bg-red-400 px-2 py-1 text-white"
                    >
                      Delete
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

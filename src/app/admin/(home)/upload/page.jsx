"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { createClient } from "../../../utils/supabase/client";
import Papa from "papaparse"; // For CSV parsing
import UploadComponent from "@/components/UploadComponent";
import {
  toastError,
  toastSuccess,
  toastWarn,
} from "@/app/utils/functions/toast";

const UploadResult = () => {
  const [files, setFiles] = useState([]);
  const supabase = createClient();
  const [resultData, setResultData] = useState({
    department: "",
    session: "",
    semester: "",
    level: "",
  });
  const [uploading, setUploading] = useState(false);

  // const handleResultUploading = async (e) => {
  //   e.preventDefault();

  //   if (files.length < 1) {
  //     toastWarn("A result file is required for a successful upload");
  //     return;
  //   }

  //   const file = files[0];

  //   // Create a custom table name using form values
  //   const safeTableName =
  //     `${resultData.department}_${resultData.level}_${resultData.semester}_${resultData.session}`
  //       .replace(/[^a-zA-Z0-9-_]/g, "_") // Replace spaces and special chars with underscores
  //       .toLowerCase();

  //   try {
  //     setUploading(true);

  //     // Parse CSV file
  //     const text = await file.text();
  //     const {
  //       data: csvData,
  //       meta,
  //       errors,
  //     } = Papa.parse(text, { header: true });

  //     console.log(csvData);

  //     if (errors.length > 0) {
  //       throw new Error("Invalid CSV format");
  //     }

  //     // Get headers and sanitize for SQL
  //     const headers = meta.fields || [];
  //     if (headers.length === 0) {
  //       throw new Error("No headers found in CSV");
  //     }

  //     // Map headers to SQL column definitions
  //     const columnDefinitions = headers.map((header) => {
  //       const safeColumnName = header
  //         .replace(/[^a-zA-Z0-9_]/g, "_")
  //         .toLowerCase();
  //       // Infer column type based on header name (customize as needed)
  //       if (
  //         header.toLowerCase().includes("grade") ||
  //         header.toLowerCase().includes("matriculation_number") ||
  //         header.toLowerCase().includes("remarks") ||
  //         header.toLowerCase().includes("names")
  //       ) {
  //         return `${safeColumnName} VARCHAR(255)`;
  //       } else if (
  //         header.toLowerCase().includes("gpa") ||
  //         header.toLowerCase().includes("tgp")
  //       ) {
  //         return `${safeColumnName} FLOAT`;
  //       } else if (
  //         header.toLowerCase().includes("units") ||
  //         header.toLowerCase().includes("attendance")
  //       ) {
  //         return `${safeColumnName} INTEGER`;
  //       } else {
  //         return `${safeColumnName} VARCHAR(255)`; // Default to VARCHAR
  //       }
  //     });

  //     // Create table SQL with dynamic columns
  //     const tableCreationSql = `
  //       CREATE TABLE ${safeTableName} (
  //         id SERIAL PRIMARY KEY,
  //         ${columnDefinitions.join(",\n          ")}
  //       );
  //     `;
  //     const { error: creationError } = await supabase.rpc("create_table", {
  //       table_name: safeTableName,
  //       sql_query: tableCreationSql,
  //     });

  //     if (creationError) throw creationError;

  //     console.log("Creation Error ", creationError);

  //     // Insert data into the new table
  //     const { error: insertError } = await supabase
  //       .from(safeTableName)
  //       .insert(csvData);

  //     console.log("Insert Error: ", insertError);
  //     if (insertError) throw insertError;

  //     // Optional: Upload file to storage for backup
  //     const extension = file.name.split(".").pop();
  //     const filePath = `uploads/${safeTableName}.${extension}`;
  //     const { error: uploadError } = await supabase.storage
  //       .from("results")
  //       .upload(filePath, file, {
  //         contentType: file.type,
  //       });

  //     console.log("Upload Error: ", uploadError);
  //     if (uploadError) throw uploadError;

  //     // Insert table name into table metadata
  //     const { error: metadataError } = await supabase
  //       .from("results_metadata")
  //       .insert([
  //         {
  //           table_name: safeTableName,
  //         },
  //       ]);

  //     console.log("Metadata Error: " + metadataError);
  //     if (metadataError) throw metadataError;

  //     toastSuccess("Result uploaded and table created successfully!");
  //     setResultData({
  //       department: "",
  //       session: "",
  //       semester: "",
  //       level: "",
  //     });
  //     setFiles([]);
  //     console.log(files);
  //   } catch (error) {
  //     console.error("Error processing result:", error);
  //     toastError(
  //       "Failed to process result. Please check the CSV format or try again.",
  //     );
  //   } finally {
  //     setUploading(false);
  //   }
  // };


  const handleResultUploading = async (e) => {
    e.preventDefault();

    if (
      !resultData.department ||
      !resultData.session ||
      !resultData.semester ||
      !resultData.level
    ) {
      toastWarn("All form fields are required");
      return;
    }

    if (files.length < 1) {
      toastWarn("A result file is required for a successful upload");
      return;
    }

    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      toastWarn("File size exceeds 10MB. Please upload a smaller file.");
      return;
    }
    if (!file.name.endsWith(".csv")) {
      toastWarn("Only CSV files are allowed.");
      return;
    }

    const safeTableName =
      `${resultData.department}_${resultData.level}_${resultData.semester}_${resultData.session}`
        .replace(/[^a-zA-Z0-9-_]/g, "_")
        .toLowerCase();

    try {
      setUploading(true);

      // Parse CSV file in chunks
      const csvData = [];
      await new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          chunk: (results, parser) => {
            if (results.errors.length > 0) {
              parser.abort();
              reject(
                new Error(
                  `CSV parsing errors: ${JSON.stringify(results.errors)}`,
                ),
              );
            }
            csvData.push(...results.data);
          },
          complete: () => resolve(),
          error: (err) => reject(err),
        });
      });

      if (csvData.length === 0) {
        throw new Error("No data found in CSV");
      }

      const headers = Object.keys(csvData[0]);
      if (headers.length === 0) {
        throw new Error("No headers found in CSV");
      }

      // Validate headers
      const invalidHeaders = headers.filter(
        (header) => !/^[a-z0-9_]+$/.test(header),
      );
      if (invalidHeaders.length > 0) {
        throw new Error(
          `Invalid headers: ${invalidHeaders.join(", ")}. Use lowercase and underscores.`,
        );
      }

      // Map headers to SQL column definitions
      const columnDefinitions = headers.map((header) => {
        const safeColumnName = header
          .replace(/[^a-zA-Z0-9_]/g, "_")
          .toLowerCase();
        if (
          header.includes("grade") ||
          header.includes("matriculation_number") ||
          header.includes("remarks") ||
          header.includes("names")
        ) {
          return `${safeColumnName} VARCHAR(255)`;
        } else if (header.includes("gpa") || header.includes("tgp")) {
          return `${safeColumnName} FLOAT`;
        } else if (header.includes("units") || header.includes("attendance")) {
          return `${safeColumnName} INTEGER`;
        }
        return `${safeColumnName} VARCHAR(255)`;
      });

      // Check if table exists
      const { data: tableExists } = await supabase
        .from("results_metadata")
        .select("table_name")
        .eq("table_name", safeTableName)
        .single();

      if (!tableExists) {
        const tableCreationSql = `
        CREATE TABLE ${safeTableName} (
          id SERIAL PRIMARY KEY,
          ${columnDefinitions.join(",\n          ")}
        );
      `;
        const startTime = performance.now();
        const { error: creationError } = await supabase.rpc("create_table", {
          table_name: safeTableName,
          sql_query: tableCreationSql,
        });
        console.log(`Table creation took ${performance.now() - startTime}ms`);
        if (creationError) {
          console.error("Table Creation Error:", creationError);
          throw new Error(`Failed to create table: ${creationError.message}`);
        }
      }

      // Insert data in batches
      const batchSize = 100;
      for (let i = 0; i < csvData.length; i += batchSize) {
        const batch = csvData.slice(i, i + batchSize);
        const startTime = performance.now();
        const { error: insertError } = await supabase
          .from(safeTableName)
          .insert(batch);
        console.log(
          `Batch insert (${i}-${i + batchSize}) took ${performance.now() - startTime}ms`,
        );
        if (insertError) {
          console.error("Insert Error:", insertError);
          throw new Error(`Failed to insert data: ${insertError.message}`);
        }
      }

      // Upload file to storage
      const extension = file.name.split(".").pop();
      const filePath = `uploads/${safeTableName}.${extension}`;
      const startTime = performance.now();
      const { error: uploadError } = await supabase.storage
        .from("results")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
        });
      console.log(`File upload took ${performance.now() - startTime}ms`);
      if (uploadError) {
        console.error("Upload Error:", uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      // Insert table name into metadata
      const { error: metadataError } = await supabase
        .from("results_metadata")
        .insert([{ table_name: safeTableName }]);
      if (metadataError) {
        console.error("Metadata Error:", metadataError);
        throw new Error(`Failed to update metadata: ${metadataError.message}`);
      }

      toastSuccess("Result uploaded and table created successfully!");
      setResultData({
        department: "",
        session: "",
        semester: "",
        level: "",
      });
      setFiles([]);
    } catch (error) {
      console.error("Error processing result:", error);
      toastError(`Failed to process result: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };
  return (
    <section className="mt-20 flex flex-col items-center px-6 lg:max-w-[90%]">
      <div className="w-full">
        <h2 className="text-2xl font-semibold">Tips for Uploading Result</h2>
        <ol className="list-inside list-decimal">
          <li>All headers must be in lowercase format</li>
          <li>Use underscore (_) instead of spaces for headers</li>
        </ol>
      </div>
      <form
        onSubmit={handleResultUploading}
        className="w-full space-y-4 pb-8 pt-8"
      >
        <UploadComponent setFiles={setFiles} />

        <div className="w-full">
          {files.map((file, index) => (
            <div
              className="flex items-center justify-between rounded-md bg-gray-200 p-3"
              key={index}
            >
              <p className="uppercase">
                {`${resultData.level} ${resultData.department} - ${resultData.semester}, ${resultData.session}`}
              </p>
              <button
                className="ms-4 rounded-md bg-red-500 p-2 text-white"
                type="button"
                onClick={() =>
                  setFiles(files.filter((f) => f.name !== file.name))
                }
              >
                <X />
              </button>
            </div>
          ))}
        </div>

        <div className="grid w-full items-center gap-8 md:grid-cols-2">
          <select
            className="w-full cursor-pointer rounded-md p-3"
            name="level"
            id="level"
            value={resultData.level}
            onChange={(e) =>
              setResultData({ ...resultData, level: e.target.value })
            }
            required
          >
            <option value="" disabled>
              Level
            </option>
            <option value="ND 1">ND 1</option>
            <option value="ND 2">ND 2</option>
            <option value="HND 1">HND 1</option>
            <option value="HND 2">HND 2</option>
          </select>

          <select
            className="w-full cursor-pointer rounded-md p-3"
            name="department"
            id="department"
            value={resultData.department}
            onChange={(e) =>
              setResultData({ ...resultData, department: e.target.value })
            }
            required
          >
            <option value="" disabled>
              Department
            </option>
            <option value="CSIT">
              Computer Science and Information Technology
            </option>
            <option value="CET">Computer Engineering Technology</option>
            <option value="PEG">Petroleum Engineering</option>
            <option value="PMBS">
              Petroleum Marketing and Business Administration
            </option>
            <option value="PNGPD">Petroleum and National Gas Processing</option>
            <option value="ISET">Industrial Safety</option>
            <option value="MEC">Mechanical</option>
            <option value="EEED">Electrical</option>
          </select>
        </div>

        <div className="grid w-full items-center gap-8 md:grid-cols-2">
          <select
            className="w-full cursor-pointer rounded-md p-3"
            name="semester"
            id="semester"
            value={resultData.semester}
            onChange={(e) =>
              setResultData({ ...resultData, semester: e.target.value })
            }
            required
          >
            <option value="" disabled>
              Semester
            </option>
            <option value="First Semester">First Semester</option>
            <option value="Second Semester">Second Semester</option>
          </select>

          <input
            className="rounded-md p-3"
            type="text"
            placeholder="Session e.g (2022/2023)"
            value={resultData.session}
            onChange={(e) =>
              setResultData({ ...resultData, session: e.target.value })
            }
            required
          />
        </div>

        <button
          type="submit"
          className="w-full cursor-pointer rounded-md bg-primary-100 py-3 font-semibold text-white"
          disabled={uploading || files.length === 0}
        >
          {uploading ? "Uploading result..." : "Upload Result"}
        </button>
      </form>
    </section>
  );
};

export default UploadResult;

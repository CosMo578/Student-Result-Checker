"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { createClient } from "../../../utils/supabase/client";
import Papa from "papaparse"; // For CSV parsing

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

  const handleResultUploading = async (e) => {
    e.preventDefault();

    if (files.length < 1) {
      alert("A result file is required for a successful upload");
      return;
    }

    const file = files[0];

    // Create a custom table name using form values
    const safeTableName =
      `${resultData.department}_${resultData.level}_${resultData.semester}_${resultData.session}`
        .replace(/[^a-zA-Z0-9-_]/g, "_") // Replace spaces and special chars with underscores
        .toLowerCase();

    try {
      setUploading(true);

      // Parse CSV file
      const text = await file.text();
      const { data: csvData, errors } = Papa.parse(text, { header: true });

      console.log("Process 1 Done");

      if (errors.length > 0) {
        throw new Error("Invalid CSV format");
      }

      // Create new table dynamically
      const tableCreationSql = `
        CREATE TABLE ${safeTableName} (
          id SERIAL PRIMARY KEY,
          matriculation_number VARCHAR(20) UNIQUE NOT NULL,
          attendance_percent INTEGER,
          com113_grade VARCHAR(2),
          com113_units INTEGER,
          com111_grade VARCHAR(2),
          com111_units INTEGER,
          com112_grade VARCHAR(2),
          com112_units INTEGER,
          com115_grade VARCHAR(2),
          com115_units INTEGER,
          com114_grade VARCHAR(2),
          com114_units INTEGER,
          mth111_grade VARCHAR(2),
          mth111_units INTEGER,
          gns101_grade VARCHAR(2),
          gns101_units INTEGER,
          gns127_grade VARCHAR(2),
          gns127_units INTEGER,
          pet101_grade VARCHAR(2),
          pet101_units INTEGER,
          ins104_grade VARCHAR(2),
          ins104_units INTEGER,
          tgp FLOAT,
          gpa FLOAT,
          remarks VARCHAR(50)
        );
      `;

      console.log("Process 2 Done");

      const { error: creationError } = await supabase.rpc("create_table", {
        table_name: safeTableName,
        sql_query: tableCreationSql,
      });

      console.log("Process 3 Done");

      if (creationError) throw creationError;

      // Insert data into the new table
      const { error: insertError } = await supabase
        .from(safeTableName)
        .insert(csvData);

      console.log("Process 1 Done");

      if (insertError) throw insertError;

      // Optional: Upload file to storage for backup
      const extension = file.name.split(".").pop();
      const filePath = `uploads/${safeTableName}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("results")
        .upload(filePath, file, {
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      alert("Result uploaded and table created successfully!");
      setResultData({
        department: "",
        session: "",
        semester: "",
        level: "",
      });
      setFiles([]);
    } catch (error) {
      console.error("Error processing result:", error);
      alert(
        "Failed to process result. Please check the CSV format or try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <section>
      <form
        onSubmit={handleResultUploading}
        className="mx-auto flex flex-col items-center space-y-4 px-4 pb-8 pt-20 lg:max-w-[80%]"
      >
        <div className="w-full">
          <label
            htmlFor="dropzone-file"
            className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pb-6 pt-5">
              <svg
                className="text-primary mb-4 size-12"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-base text-gray-500">
                <span className="font-semibold text-primary-100">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-sm text-gray-500">CSV (MAX. 10MB)</p>
            </div>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              accept=".csv"
              onChange={(e) => setFiles(Array.from(e.target.files))}
              multiple={false} // Disable multiple files
              required
            />
          </label>
        </div>

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

        <div className="grid w-full grid-cols-2 items-center gap-8">
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

        <div className="grid w-full grid-cols-2 items-center gap-8">
          <select
            className="w-full p-3 cursor-pointer rounded-md "
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
            className="rounded-md"
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
          disabled={uploading}
        >
          {uploading ? "Uploading result..." : "Upload Result"}
        </button>
      </form>
    </section>
  );
};

export default UploadResult;

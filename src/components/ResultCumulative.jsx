"use client";
import { useState, useEffect, Fragment } from "react";
import { toastWarn } from "@/app/utils/functions/toast";
import { createClient } from "@/app/utils/supabase/client";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Image from "next/image";
import { useRef } from "react";

const ResultCumulative = () => {
  const [queryData, setQueryData] = useState({
    levelOption: "",
    sessionNd1: "",
    sessionNd2: "",
  });
  const [matNum, setMatNum] = useState(null);
  const [cgpaData, setCgpaData] = useState({ cgpa: null, results: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const tableRef = useRef(null);

  // Fetch mat_num
  useEffect(() => {
    const fetchMatNum = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) throw new Error("User not authenticated");

        const { data, error } = await supabase
          .from("users")
          .select("mat_num")
          .eq("email", user.email)
          .single();
        if (error) throw error;
        setMatNum(data?.mat_num || null);
      } catch (err) {
        setError("Failed to fetch matriculation number");
        console.error(err);
      }
    };
    fetchMatNum();
  }, []);

  // Handle checkbox change (only one can be selected)
  const handleCheckboxChange = (option) => {
    setQueryData((prev) => ({
      ...prev,
      levelOption: prev.levelOption === option ? "" : option,
      sessionNd1: option === "full_session" ? prev.sessionNd1 : "",
      sessionNd2: option === "full_session" ? prev.sessionNd2 : "",
    }));
  };

  // Get remark based on CGPA
  const getRemark = (cgpa) => {
    if (!cgpa) return "-";
    if (cgpa >= 3.5) return "Distinction";
    if (cgpa >= 3.0) return "Upper Credit";
    if (cgpa >= 2.5) return "Lower Credit";
    if (cgpa >= 2.0) return "Pass";
    return "Fail";
  };

  // Calculate semester units
  const getSemesterUnits = (result) => {
    return Object.keys(result)
      .filter((key) => key.endsWith("_units"))
      .reduce((sum, key) => sum + (result[key] || 0), 0);
  };

  // Handle form submission to calculate CGPA
  const handleCalculateCGPA = async (e) => {
    e.preventDefault();
    if (!queryData.levelOption) {
      toastWarn("Please select a level option.");
      return;
    }
    if (queryData.levelOption === "nd_1" && !queryData.sessionNd1) {
      toastWarn("Please select a session for ND1.");
      return;
    }
    if (queryData.levelOption === "nd_2" && !queryData.sessionNd1) {
      toastWarn("Please select a session for ND2.");
      return;
    }
    if (queryData.levelOption === "full_session" && (!queryData.sessionNd1 || !queryData.sessionNd2)) {
      toastWarn("Please select sessions for both ND1 and ND2.");
      return;
    }
    if (queryData.levelOption === "full_session" && queryData.sessionNd2 < queryData.sessionNd1) {
      toastWarn("ND2 session cannot be earlier than ND1 session.");
      return;
    }

    setLoading(true);
    setError(null);
    setCgpaData({ cgpa: null, results: [] });

    try {
      const supabase = createClient();
      const department = matNum ? matNum.split("/")[2]?.toLowerCase() : "";
      if (!department) throw new Error("Invalid matriculation number");

      let tables = [];
      if (queryData.levelOption === "nd_1") {
        tables = [
          `${department}_nd_1_first_semester_${queryData.sessionNd1}`,
          `${department}_nd_1_second_semester_${queryData.sessionNd1}`,
        ];
      } else if (queryData.levelOption === "nd_2") {
        tables = [
          `${department}_nd_2_first_semester_${queryData.sessionNd1}`,
          `${department}_nd_2_second_semester_${queryData.sessionNd1}`,
        ];
      } else if (queryData.levelOption === "full_session") {
        tables = [
          `${department}_nd_1_first_semester_${queryData.sessionNd1}`,
          `${department}_nd_1_second_semester_${queryData.sessionNd1}`,
          `${department}_nd_2_first_semester_${queryData.sessionNd2}`,
          `${department}_nd_2_second_semester_${queryData.sessionNd2}`,
        ];
      }

      const results = [];
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .eq("matriculation_number", matNum)
          .single();
        if (error && error.code !== "PGRST116") {
          throw error;
        }
        if (data) {
          const semesterUnits = getSemesterUnits(data);
          results.push({ ...data, semesterUnits });
        } else {
          results.push(null);
        }
      }

      // Calculate CGPA as average of GPAs
      const validResults = results.filter((result) => result && result.semesterUnits > 0);
      if (validResults.length > 0) {
        const semesterGpas = validResults.map((result) =>
          result.tgp && result.semesterUnits > 0 ? (result.tgp / result.semesterUnits).toFixed(2) : 0
        );
        const cgpa = (semesterGpas.reduce((sum, gpa) => sum + parseFloat(gpa), 0) / semesterGpas.length).toFixed(2);
        setCgpaData({ cgpa: parseFloat(cgpa), results: validResults });
      }
    } catch (err) {
      setError("Failed to calculate CGPA: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Download PDF function
  const downloadPDF = async () => {
    if (!tableRef.current) return;

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const canvas = await html2canvas(tableRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pageWidth = 297;
    const pageHeight = 210;
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    doc.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    doc.save(`cgpa_${queryData.sessionNd1}_${queryData.sessionNd2 || queryData.sessionNd1}.pdf`);
  };

  // Define semester labels based on selection
  let semesterLabels = [];
  if (queryData.levelOption === "nd_1") {
    semesterLabels = ["SEM. I", "SEM. II"];
  } else if (queryData.levelOption === "nd_2") {
    semesterLabels = ["SEM. III", "SEM. IV"];
  } else if (queryData.levelOption === "full_session") {
    semesterLabels = ["SEM. I", "SEM. II", "SEM. III", "SEM. IV"];
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold capitalize">
        Calculate Your CGPA
      </h1>

      {/* CGPA Form */}
      <form onSubmit={handleCalculateCGPA} className="mt-4">
        <div className="mb-6 grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:gap-6">
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-5 w-5 cursor-pointer"
                checked={queryData.levelOption === "nd_1"}
                onChange={() => handleCheckboxChange("nd_1")}
              />
              <span className="text-gray-800">ND1 (Both Semesters)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-5 w-5 cursor-pointer"
                checked={queryData.levelOption === "nd_2"}
                onChange={() => handleCheckboxChange("nd_2")}
              />
              <span className="text-gray-800">ND2 (Both Semesters)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-5 w-5 cursor-pointer"
                checked={queryData.levelOption === "full_session"}
                onChange={() => handleCheckboxChange("full_session")}
              />
              <span className="text-gray-800">Full Session (ND1 + ND2)</span>
            </label>
          </div>

          <div className="flex flex-col gap-4">
            {queryData.levelOption && queryData.levelOption !== "full_session" && (
              <select
                className="w-full cursor-pointer rounded-md p-3"
                name="session"
                id="session"
                value={queryData.sessionNd1}
                onChange={(e) => setQueryData({ ...queryData, sessionNd1: e.target.value })}
                required
              >
                <option value="" disabled>
                  Session
                </option>
                <option value="2022_2023">2022/2023</option>
                <option value="2023_2024">2023/2024</option>
                <option value="2024_2025">2024/2025</option>
                <option value="2025_2026">2025/2026</option>
              </select>
            )}
            {queryData.levelOption === "full_session" && (
              <>
                <select
                  className="w-full cursor-pointer rounded-md p-3"
                  name="sessionNd1"
                  id="sessionNd1"
                  value={queryData.sessionNd1}
                  onChange={(e) => setQueryData({ ...queryData, sessionNd1: e.target.value })}
                  required
                >
                  <option value="" disabled>
                    ND1 Session
                  </option>
                  <option value="2022_2023">2022/2023</option>
                  <option value="2023_2024">2023/2024</option>
                  <option value="2024_2025">2024/2025</option>
                  <option value="2025_2026">2025/2026</option>
                </select>
                <select
                  className="w-full cursor-pointer rounded-md p-3"
                  name="sessionNd2"
                  id="sessionNd2"
                  value={queryData.sessionNd2}
                  onChange={(e) => setQueryData({ ...queryData, sessionNd2: e.target.value })}
                  required
                >
                  <option value="" disabled>
                    ND2 Session
                  </option>
                  <option value="2022_2023">2022/2023</option>
                  <option value="2023_2024">2023/2024</option>
                  <option value="2024_2025">2024/2025</option>
                  <option value="2025_2026">2025/2026</option>
                </select>
              </>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 rounded-lg bg-primary-100 px-4 py-2 text-white disabled:bg-gray-300"
          disabled={loading}
        >
          {loading ? "Calculating..." : "Calculate CGPA"}
        </button>
      </form>

      {/* CGPA Result */}
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {cgpaData.cgpa && (
        <div className="mt-6 w-max">
          <div
            ref={tableRef}
            className="rounded-lg border-2 border-black bg-white p-6"
          >
            <div className="mt-10 space-y-6">
              <Image
                className="mx-auto"
                src="/pti-logo.svg"
                alt="PTI logo"
                width={90}
                height={90}
              />
              <h1 className="text-center text-xl font-semibold">
                PETROLEUM TRAINING INSTITUTE, EFFURUN
              </h1>
              <h2 className="text-center text-lg font-semibold">
                CUMULATIVE GRADE POINT AVERAGE
              </h2>
              <div className="mx-auto flex w-fit items-center justify-center border border-black p-1">
                {queryData.levelOption === "full_session"
                  ? `${queryData.sessionNd1.replace("_", "/")} - ${queryData.sessionNd2.replace("_", "/")}`
                  : queryData.sessionNd1.replace("_", "/")}
              </div>
            </div>
            <table className="mt-8 w-full text-left text-sm text-gray-500">
              <thead className="text-xs uppercase text-gray-700">
                <tr>
                  <th
                    rowSpan="2"
                    scope="col"
                    className="border border-black px-6 py-3"
                  >
                    MATRICULATION NUMBER
                  </th>
                  {semesterLabels.map((label) => (
                    <th
                      key={label}
                      scope="col"
                      className="border border-black px-6 py-3 text-center"
                    >
                      {label} <br /> TGP | GPA
                    </th>
                  ))}
                  <th
                    rowSpan="2"
                    scope="col"
                    className="border border-black px-6 py-3"
                  >
                    CGPA
                  </th>
                  <th
                    rowSpan="2"
                    scope="col"
                    className="border border-black px-6 py-3"
                  >
                    REMARKS
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border border-black text-gray-900">
                  <td className="px-6 py-4 font-medium">{matNum}</td>
                  {cgpaData.results.map((result, i) => (
                    <td
                      key={i}
                      className="border border-black px-6 py-4 text-center"
                    >
                      {result
                        ? `${result.tgp || "-"} | ${result.semesterUnits > 0 ? (result.tgp / result.semesterUnits).toFixed(2) : "-"}`
                        : "- | -"}
                    </td>
                  ))}
                  <td className="border border-black px-6 py-4">
                    {cgpaData.cgpa}
                  </td>
                  <td className="border border-black px-6 py-4">
                    {getRemark(cgpaData.cgpa)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <button
            className="mt-4 rounded-lg bg-primary-100 px-4 py-2 text-white"
            onClick={downloadPDF}
            disabled={loading}
          >
            Download as PDF
          </button>
        </div>
      )}
      {!loading && !error && !cgpaData.cgpa && (
        <p className="mt-4 text-gray-600">
          Select an option and session(s) to calculate your CGPA.
        </p>
      )}
    </div>
  );
};

export default ResultCumulative;
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { useAuth } from "@/app/context/AuthContext";
import formatTableName from "@/app/utils/formatTitle";
import { toastWarn } from "@/app/utils/functions/toast";
import { createClient } from "@/app/utils/supabase/client";

import ResultCumulative from "@/components/ResultCumulative";

import Image from "next/image";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("results");
  const [matNum, setMatNum] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null); // Ref to capture table

  const [queryData, setQueryData] = useState({
    session: "",
    semester: "",
    level: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Fetch mat_num
  useEffect(() => {
    const fetchMatNum = async () => {
      if (!user?.email) return;
      try {
        const supabase = await createClient();
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
      } finally {
        setLoading(false);
      }
    };
    fetchMatNum();
  }, [user]);

  // Fetch results when semester and program are selected
  useEffect(() => {
    const department = ((matNum) => {
      if (!matNum) return "";
      const parts = matNum.split("/");
      return parts.length >= 4 ? parts[2].toLowerCase() : "";
    })(matNum);

    const fetchResults = async () => {
      if (
        !matNum ||
        !queryData.level ||
        !queryData.semester ||
        !queryData.session
      )
        return;

      setLoading(true);
      setError(null);

      try {
        const supabase = await createClient();

        const tableName = `${department}_${queryData.level}_${queryData.semester}_${queryData.session}`;

        console.log(tableName);

        const { data, error } = await supabase
          .from(tableName)
          .select("*")
          .eq("matriculation_number", matNum)
          .single();

        if (error) throw error;

        setResults(data ? [data] : []);
        console.log(data);
      } catch (err) {
        setError("Failed to fetch results: " + (err as Error).message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [matNum, queryData]);

  // Handle redirect to complaint page with query parameters
  const handleComplaintRedirect = () => {
    if (!queryData.level || !queryData.semester || !queryData.session) {
      toastWarn(
        "Please select level, semester, and session before submitting a complaint.",
      );
      return;
    }
    const queryParams = new URLSearchParams({
      level: queryData.level,
      semester: queryData.semester,
      session: queryData.session,
    }).toString();
    router.push(`/complaints?${queryParams}`);
  };

const downloadPDF = async () => {
  if (!tableRef.current) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const tableName = `(${queryData.level}_${queryData.semester}_${queryData.session})`;
  // Capture the table content with high initial quality
  const canvas = await html2canvas(tableRef.current, { scale: 2 }); // High resolution capture
  const imgData = canvas.toDataURL("image/png", 1.0); // Maximum PNG quality

  // Calculate dimensions with a fixed scale of 0.8
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const imgWidth = 190; // Width in mm, leaving 10mm margins
  const scaledHeight = ((canvas.height * imgWidth) / canvas.width) * 0.8; // Scale down height by 0.8
  const imgHeight = Math.min(pageHeight - 30, scaledHeight); // Limit to page height minus margins and title

  // Calculate centering positions
  const marginX = (pageWidth - imgWidth) / 2; // Horizontal centering
  const marginY = (pageHeight - imgHeight) / 2; // Vertical centering
  const positionY = Math.max(20, marginY); // Ensure minimum 20mm top margin for title

  // Add image (centered with adjusted height)
  doc.addImage(imgData, "PNG", marginX, positionY, imgWidth, imgHeight);

  doc.save(
    `results_${queryData.level}_${queryData.semester}_${queryData.session}.pdf`,
  );
};

  if (!user) return null;

  return (
    <div className="min-h-screen max-w-screen overflow-x-hidden pt-20">
      <div className="mx-auto mb-10 flex w-fit items-center gap-3 rounded-full bg-gray-100 p-2">
        <button
          className={`rounded-full p-3 ${tab == "results" ? "bg-primary-100 text-white" : "bg-gray-200 text-gray-500"}`}
          onClick={() => setTab("results")}
        >
          Results
        </button>
        <button
          className={`rounded-full p-3 ${tab == "CGPA" ? "bg-primary-100 text-white" : "bg-gray-200 text-gray-500"}`}
          onClick={() => setTab("CGPA")}
        >
          CGPA
        </button>
      </div>
      
      {tab == "results" ? (
        <div className='max-md:overflow-x-scroll'>
          <h1 className="mb-4 text-2xl font-bold capitalize">
            Fetch your result by filling all Input Fields
          </h1>

          {/* Semester and Program Selector */}
          <form className="mt-4 mb-6">
            <div className="grid w-full md:grid-cols-3  items-center gap-2 md:gap-6">
              <select
                className="w-full cursor-pointer rounded-md p-3"
                name="level"
                id="level"
                value={queryData.level}
                onChange={(e) =>
                  setQueryData({ ...queryData, level: e.target.value })
                }
                required
              >
                <option value="" disabled>
                  Level
                </option>
                <option value="nd_1">ND 1</option>
                <option value="nd_2">ND 2</option>
                <option value="hnd_1">HND 1</option>
                <option value="hnd_2">HND 2</option>
              </select>

              <select
                className="w-full cursor-pointer rounded-md p-3"
                name="session"
                id="session"
                value={queryData.session}
                onChange={(e) =>
                  setQueryData({ ...queryData, session: e.target.value })
                }
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

              <select
                className="w-full cursor-pointer rounded-md p-3"
                name="semester"
                id="semester"
                value={queryData.semester}
                onChange={(e) =>
                  setQueryData({ ...queryData, semester: e.target.value })
                }
                required
              >
                <option value="" disabled>
                  Semester
                </option>
                <option value="first_semester">First Semester</option>
                <option value="second_semester">Second Semester</option>
              </select>
            </div>
          </form>

          {/* Results Table */}
          {error && <p className="mt-4 text-red-500">{error}</p>}

          {loading && <p className="mt-4">Loading results...</p>}

          {results.length > 0 ? (
            <div className={`w-max md:mx-auto mb-8 ${error ? 'hidden' : ''}`}>
              <div
                ref={tableRef}
                className="rounded-lg border-2 border-black bg-white scale-[0.80]"
              >
                <div className="mt-10 space-y-6">
                  <Image
                    className="mx-auto"
                    src="/pti-logo.svg"
                    alt="PTI logo"
                    width={90}
                    height={90}
                  />

                  <div className="space-y-4">
                    <h1 className="text-center text-xl font-semibold">
                      PETROLEUM TRAINING INSTITUTE, EFFURUN
                    </h1>
                    <h2 className="text-center text-lg font-semibold">
                      END OF SEMESTER ACADEMIC RESULT
                    </h2>
                  </div>

                  <div className="mx-auto flex max-w-min items-center justify-center border border-black p-1">
                    {queryData.session.replace("_", "/")}
                  </div>
                </div>

                {results.map((result, id) => (
                  <div key={id} className="my-10 rounded-md px-8">
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 items-center border-b border-black p-2">
                        <h2 className="flex flex-col gap-1 px-6">
                          <span className="text-lg font-semibold">
                            {result.names}
                          </span>
                          <span className="text-sm">Student Name</span>
                        </h2>

                        <h2 className="flex flex-col gap-1 px-6">
                          <span className="text-lg font-semibold">
                            {result.matriculation_number}
                          </span>
                          <span className="text-sm">Matriculation Number</span>
                        </h2>
                      </div>

                      <div className="grid grid-cols-2 items-center border-b border-black p-2">
                        <h2 className="flex flex-col gap-1 px-6">
                          <span className="text-lg font-semibold uppercase">
                            {queryData.level.replace("_", " ")}
                          </span>
                          <span className="text-sm">Level</span>
                        </h2>

                        <h2 className="flex flex-col gap-1 px-6">
                          <span className="text-lg font-semibold capitalize">
                            {queryData.semester.replace("_", " ")}
                          </span>
                          <span className="text-sm">Semester</span>
                        </h2>
                      </div>
                    </div>

                    <div className="relative mt-12 overflow-x-auto">
                      <table className="my-8 w-full text-left text-sm text-gray-500 rtl:text-right">
                        <thead className="text-xs uppercase text-gray-700">
                          <tr>
                            <th scope="col" className="px-6 py-3">
                              S/N
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Course Code
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Units
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Score
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Grade
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(result)
                            .filter((key) => key.endsWith("_grade")) // Get keys like com113_grade, com111_grade, etc.
                            .map((gradeKey, index) => {
                              const courseCode = gradeKey
                                .replace("_grade", "")
                                .toUpperCase(); // Extract course code (e.g., COM113)
                              const unitsKey = gradeKey.replace(
                                "_grade",
                                "_units",
                              ); // Corresponding units key (e.g., com113_units)
                              const score = result[gradeKey] || "-"; // Get score or fallback to '-'
                              const units = result[unitsKey] || "-"; // Get units or fallback to '-'
                              const getGrade = (score) => {
                                if (typeof score !== "number" || isNaN(score))
                                  return "-";
                                score;
                                if (score >= 75) return "A";
                                if (score >= 70) return "AB";
                                if (score >= 65) return "B";
                                if (score >= 60) return "BC";
                                if (score >= 55) return "C";
                                if (score >= 50) return "CD";
                                if (score >= 45) return "D";
                                if (score >= 40) return "E";
                                return "F";
                              };
                              const grade = getGrade(parseInt(score, 10));

                              return (
                                <tr
                                  key={index}
                                  className="border-b border-black text-gray-900"
                                >
                                  <td className="px-6 py-4">{index + 1}</td>

                                  <th
                                    scope="row"
                                    className="whitespace-nowrap px-6 py-4 font-medium"
                                  >
                                    {courseCode}
                                  </th>
                                  <td className="px-6 py-4">{units}</td>
                                  <td className="px-6 py-4">{score}</td>
                                  <td className="px-6 py-4">{grade}</td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>

                      <div className="grid grid-cols-4">
                        <h2>TGP: {result.tgp}</h2>
                        <h2>GPA: {result.gpa}</h2>
                        <h2>REMARK: {result.remarks}</h2>
                        <h2>ATTENDANCE: {result.attendance_percent}</h2>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <h2
              className="text-center text-xl font-semibold"
              style={{ display: (error || loading) && "none" }}
            >
              No Result found
            </h2>
          )}

          {results.length > 0 && (
            <>
              <button
                className="mt-4 rounded-lg bg-primary-100 px-4 py-2 text-white"
                onClick={downloadPDF}
                disabled={loading}
              >
                Download as PDF
              </button>

              <button
                onClick={handleComplaintRedirect}
                disabled={loading}
                className="ml-6 mt-4 rounded-lg bg-primary-100 px-4 py-2 text-white"
              >
                Submit a Complaint
              </button>
            </>
          )}
        </div>
      ) : (
        <ResultCumulative />
      )}
    </div>
  );
}
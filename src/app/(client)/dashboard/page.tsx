"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { createClient } from "../../utils/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [matNum, setMatNum] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Generate and download PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(
      `Results for ${matNum} (${queryData.level}_${queryData.semester}_${queryData.session})`,
      10,
      10,
    );

    const headers = [["Course Code", "Units", "Score", "Grade"]];
    const body = Object.keys(results[0])
      .filter((key) => key.endsWith("_grade"))
      .map((gradeKey) => {
        const courseCode = gradeKey.replace("_grade", "").toUpperCase();
        const unitsKey = gradeKey.replace("_grade", "_units");
        const score = results[0][gradeKey] || "-";
        const units = results[0][unitsKey] || "-";
        const grade =
          score !== "-"
            ? score >= 70
              ? "A"
              : score >= 60
                ? "B"
                : score >= 50
                  ? "C"
                  : score >= 40
                    ? "D"
                    : "F"
            : "-";
        return [courseCode, units, score, grade];
      });

    autoTable(doc, {
      head: headers,
      body: body,
      foot: [
        [
          "TGP",
          results[0].tgp,
          "GPA",
          results[0].gpa,
          "Remarks",
          results[0].remarks,
        ],
      ],
    });

    doc.save(
      `results_${queryData.level}_${queryData.semester}_${queryData.session}.pdf`,
    );
  };
  if (!user) return null;

  return (
    <div className="min-h-screen p-10 pt-20">
      {/* Semester and Program Selector */}
      <form className="mt-4">
        <div className="mb-6 grid w-full grid-cols-3 items-center gap-6">
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
      {results.length > 0 && (
        <div className="mt-4">
          {results.map((result, id) => (
            <div key={id} className="rounded-md bg-gray-300 px-4 py-10">
              <h2 className="px-6">
                MATRICULATION NUBER: {result.matriculation_number}
              </h2>

              <div className="relative overflow-x-auto">
                <table className="my-8 w-full bg-gray-300 text-left text-sm text-gray-500 rtl:text-right">
                  <thead className="bg-gray-300 text-xs uppercase text-gray-700">
                    <tr>
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
                  {/* <tbody>
                    <tr className="border-b border-gray-100 bg-gray-300">
                      <th
                        scope="row"
                        className="whitespace-nowrap px-6 py-4 font-medium text-gray-900"
                      >
                        Apple MacBook Pro 17
                      </th>
                      <td className="px-6 py-4">Silver</td>
                      <td className="px-6 py-4">Laptop</td>
                      <td className="px-6 py-4">$2999</td>
                    </tr>
                    <tr className="border-b border-gray-200 bg-gray-300">
                      <th
                        scope="row"
                        className="whitespace-nowrap px-6 py-4 font-medium text-gray-900"
                      >
                        Microsoft Surface Pro
                      </th>
                      <td className="px-6 py-4">White</td>
                      <td className="px-6 py-4">Laptop PC</td>
                      <td className="px-6 py-4">$1999</td>
                    </tr>
                    <tr className="bg-gray-300">
                      <th
                        scope="row"
                        className="whitespace-nowrap px-6 py-4 font-medium text-gray-900"
                      >
                        Magic Mouse 2
                      </th>
                      <td className="px-6 py-4">Black</td>
                      <td className="px-6 py-4">Accessories</td>
                      <td className="px-6 py-4">$99</td>
                    </tr>
                  </tbody> */}
                  <tbody>
                    {Object.keys(result)
                      .filter((key) => key.endsWith("_grade")) // Get keys like com113_grade, com111_grade, etc.
                      .map((gradeKey, index) => {
                        const courseCode = gradeKey
                          .replace("_grade", "")
                          .toUpperCase(); // Extract course code (e.g., COM113)
                        const unitsKey = gradeKey.replace("_grade", "_units"); // Corresponding units key (e.g., com113_units)
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
                            className="border-b border-gray-200 bg-gray-300 text-gray-900"
                          >
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

                <div className="grid grid-cols-3">
                  <h2>TGP: {result.tgp}</h2>
                  <h2>GPA: {result.gpa}</h2>
                  <h2>REMARK: {result.remarks}</h2>
                </div>
              </div>
            </div>
          ))}

          <button
            className="mt-4 rounded-lg bg-primary-100 px-4 py-2 text-white"
            onClick={downloadPDF}
            disabled={loading}
          >
            Download as PDF
          </button>
        </div>
      )}
    </div>
  );
}

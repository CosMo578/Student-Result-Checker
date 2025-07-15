const formatTableName = (tableName: string): string => {
  // Remove parentheses
  const cleanName = tableName.replace(/^\(|\)$/g, "");

  // Split by underscores
  const parts = cleanName.split("_");
  if (parts.length < 5) {
    console.error(
      "Invalid tableName format, expected at least 5 underscores:",
      tableName,
    );
    return "Invalid Academic Session";
  }

  // Extract parts: department (ignored), level, semester (second + semester), session (year1 + year2)
  const [
    level,
    level2,
    semesterFirst,
    semesterSecond,
    sessionYear1,
    sessionYear2,
  ] = parts;

  // Format level (e.g., nd_2 → ND 2)
  const formattedLevel = level
    .replace(/^nd/, "ND")
    .replace(/^hnd/, "HND")
    .replace("_", " ");

  // Format semester (e.g., second + semester → Second Semester)
  const formattedSemester = `${semesterFirst.charAt(0).toUpperCase() + semesterFirst.slice(1)} ${semesterSecond.charAt(0).toUpperCase() + semesterSecond.slice(1)}`;

  // Format session (e.g., 2022 + 2023 → 2022/2023)
  const formattedSession = `${sessionYear1}/${sessionYear2}`;

  return `${formattedLevel + " " + level2}, ${formattedSemester}, ${formattedSession}`;
};

export default formatTableName;
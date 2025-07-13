import { supabase } from "@/app/lib/supabaseClient"; // Adjust path if needed

export const fetchUploadedFiles = async () => {
  const { data, error } = await supabase.storage
    .from("results")
    .list("uploads", {
      limit: 100,
      offset: 0,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) {
    console.error("Error fetching files:", error);
    return [];
  }

  console.log("Uploaded files:", data);
  return data;
};

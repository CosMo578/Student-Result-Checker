"use client";
import { createClient } from '../../../utils/supabase/client';
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    const loadFiles = async () => {
      const { data, error } = await supabase.storage
        .from("results")
        .list("uploads");

      if (!error && data) {
        setFiles(data);
      } else {
        console.error("Failed to fetch files", error);
      }
    };

    loadFiles();
  }, [supabase.storage]);

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">Uploaded Files</h2>
      <ul className="space-y-2">
        {files.map((file) => (
          <li key={file.name} className="text-blue-600">
            <a
              href={
                supabase.storage
                  .from("results")
                  .getPublicUrl(`uploads/${file.name}`).data.publicUrl
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              {file.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;

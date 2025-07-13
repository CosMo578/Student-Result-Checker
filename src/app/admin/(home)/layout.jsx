"use client";
import { AdminAuthProvider } from "../../context/AdminAuthContext";
import AdminNavBar from "../../../components/AdminNavBar";

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <AdminNavBar />
      <div className="mt-10 p-4 lg:ml-64">{children}</div>
    </AdminAuthProvider>
  );
}

"use client";
import { Bounce, ToastContainer } from 'react-toastify';
import { AdminAuthProvider } from "../context/AdminAuthContext";

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </AdminAuthProvider>
  );
}

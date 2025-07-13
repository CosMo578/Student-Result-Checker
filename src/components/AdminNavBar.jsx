"use client";
import Link from "next/link";
import Image from "next/image";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Upload } from "lucide-react";
import { MessageSquareDot } from "lucide-react";
import { useAdmin } from "../app/context/AdminAuthContext";

const AdminNavBar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const { admin, signOut } = useAdmin();

  const handleSignOut = async () => {
    try {
      await signOut();
      alert('Sign out Successful!!')
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <>
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white">
        <div className="p-5 py-7 lg:px-8 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start rtl:justify-end">
              <button
                onClick={() => setIsOpen((prev) => !prev)}
                type="button"
                className="inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 lg:hidden"
              >
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="h-6 w-6"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                  ></path>
                </svg>
              </button>

              <Link className="ms-2 flex text-primary-300 md:me-24" href="/">
                <Image
                  className="me-3 text-3xl"
                  src="/pti-logo.svg"
                  alt="PTI logo"
                  width={50}
                  height={50}
                />
              </Link>

              <h1 className="flex items-center gap-2">
                Hello Admin,
                {admin && <p className="text-sm lg:mb-4">{admin.email}</p>}
              </h1>
            </div>

            <button
              type="button"
              onClick={() => handleSignOut()}
              className="rounded-lg border-2 border-primary-100 bg-primary-100 px-4 py-2 text-center font-bold text-white hover:bg-transparent hover:text-primary-100"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white pt-32 transition-transform lg:translate-x-0 ${!isOpen && "-translate-x-full"}`}
      >
        <div className="h-full overflow-y-auto bg-white px-3 pb-4">
          <ul className="flex flex-col gap-5 font-medium">
            <Link href="/admin/dashboard">
              <li
                className={`${pathname == "/admin/dashboard" ? "bg-primary-100 text-white" : "bg-neutral-100 text-neutral-600"} group flex items-center gap-4 rounded-lg p-5`}
              >
                <Upload /> Dashboard
              </li>
            </Link>

            <Link href="/admin/upload">
              <li
                className={`${pathname == "/admin/upload" ? "bg-primary-100 text-white" : "bg-neutral-100 text-neutral-600"} group flex items-center gap-4 rounded-lg p-5`}
              >
                <Upload /> Upload Results
              </li>
            </Link>

            <Link href="/admin/complaints">
              <li
                className={`${pathname == "/admin/complaints" ? "bg-primary-100 text-white" : "bg-neutral-100 text-neutral-600"} group flex items-center gap-4 rounded-lg p-5`}
              >
                <MessageSquareDot /> Complaints
              </li>
            </Link>
          </ul>
        </div>
      </aside>
    </>
  );
};
export default AdminNavBar;

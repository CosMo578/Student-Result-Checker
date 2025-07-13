"use client";
import Link from "next/link";
import Image from "next/image";
import { useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FileText, LogOut, MessageSquareDot } from "lucide-react";
import { Menu, MenuItem, MenuItems, MenuButton } from "@headlessui/react";
import { useAuth } from "../app/context/AuthContext"; // Adjust path as needed
import { createClient } from "../app/utils/supabase/client";

const NavBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [matNum, setMatNum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch mat_num when user is available
  useEffect(() => {
    const fetchMatNum = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

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

  // Handle sign-out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      alert("Sign-out failed: " + error.message);
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

              <h1 className="flex items-center text-xl  font-semibold gap-3">
                Welcome back
                {user && (
                  <p className="text-sm">
                    {loading
                      ? "Loading..."
                      : error
                        ? "Error"
                        : matNum || "No matric number"}
                  </p>
                )}
              </h1>
            </div>

            <Menu as="div" className="relative ml-3">
              <MenuButton className="relative flex rounded-full bg-gray-800 text-sm">
                <span className="absolute -inset-1.5" />
                <span className="sr-only">Open user menu</span>
                <Image
                  className="cursor-pointer rounded-full"
                  src="/user-dummy.png"
                  alt="user photo"
                  width={50}
                  height={50}
                />
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
              >
                <MenuItem>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100"
                  >
                    <LogOut className="me-2 inline size-4" /> Sign out
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </nav>

      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white pt-32 transition-transform lg:translate-x-0 ${!isOpen && "-translate-x-full"}`}
      >
        <div className="h-full overflow-y-auto bg-white px-3 pb-4">
          <ul className="flex flex-col gap-5 font-medium">
            <Link href="/dashboard">
              <li
                className={`${pathname === "/dashboard" ? "bg-primary-100 text-white" : "bg-neutral-100 text-neutral-600"} group flex items-center gap-4 rounded-lg p-5`}
              >
                <FileText /> Results
              </li>
            </Link>

            <Link href="/complaints">
              <li
                className={`${pathname === "/complaints" ? "bg-primary-100 text-white" : "bg-neutral-100 text-neutral-600"} group flex items-center gap-4 rounded-lg p-5`}
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

export default NavBar;

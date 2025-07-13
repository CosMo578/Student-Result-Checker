"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../utils/supabase/client";

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient(); // Initialize Supabase client

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: adminData, error } = await supabase
          .from("admins")
          .select("*")
          .eq("email", session.user.email)
          .single();
        if (!error && adminData) {
          setAdmin({ ...session.user, ...adminData });
        } else {
          setAdmin(null);
          router.replace("/admin");
        }
      } else {
        setAdmin(null);
        router.replace("/admin");
      }
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: adminData, error } = await supabase
          .from("admins")
          .select("*")
          .eq("email", session.user.email)
          .single();
        if (!error && adminData) {
          setAdmin({ ...session.user, ...adminData });
        } else {
          setAdmin(null);
          router.replace("/admin");
        }
      } else {
        setAdmin(null);
        router.replace("/admin");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("*")
      .eq("email", email)
      .single();

    if (adminError || !adminData) {
      await supabase.auth.signOut(); // Sign out if not an admin
      throw new Error("Access denied: You are not an admin.");
    }

    setAdmin({ ...data.user, ...adminData });
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setAdmin(null);
    router.replace("/admin");
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminAuthContext);

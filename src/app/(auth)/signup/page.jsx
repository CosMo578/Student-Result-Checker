"use client";
import * as Yup from "yup";
import Link from "next/link";
import { useState } from "react";
import { Formik, Form } from "formik";
import { useRouter } from "next/navigation";

import { createClient } from "@/app/utils/supabase/client";
import { useAuth } from "@/app/context/AuthContext";

import {
  toastError,
  toastInfo,
  toastSuccess,
} from "@/app/utils/functions/toast";
import { Bounce, ToastContainer } from "react-toastify";

import PasswordInput from "@/components/PasswordInput";
import TextInput from "@/components/TextInput";


const Signup = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { signUp } = useAuth();
  const supabase = createClient();

  const initialValues = {
    matNum: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  function generateMatricPattern() {
    const currentYear = new Date().getFullYear();
    const sessionYear = currentYear - 2;
    const nextYear = currentYear - 1;

    return new RegExp(
      `^M\\.(${sessionYear.toString().slice(-2)}|${nextYear.toString().slice(-2)})\\/(ND|HND)\\/(CSIT|PEG|PNGPD|EEED|ESMT|SLT|PMBS|CET|ISET|MPRE|MEC|WEOT)\\/\\d{5}$`,
    );
  }

  const schemaObject = Yup.object({
    matNum: Yup.string()
      .matches(generateMatricPattern(), "Invalid matriculation number")
      .required("Matriculation number is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      )
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Please confirm your password"),
  });

  const handleSubmit = async (values, actions) => {
    setIsSubmitting(true);
    setError("");
    try {
      // Check if matriculation number is already registered
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("mat_num")
        .eq("mat_num", values.matNum)
        .single();

      if (existingUser) {
        toastInfo("Matriculation number is already registered.");
      }
      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116: no rows found
        toastError(checkError);
        throw checkError;
      }

      // Sign up with Supabase
      await signUp(values.email, values.password);

      if (error) toastError(error);

      // Store user details in users table
      const { error: insertError } = await supabase
        .from("users")
        .insert([{ mat_num: values.matNum, email: values.email }]);

      if (insertError) {
        // Roll back signup if user data insertion fails
        await supabase.auth.admin.deleteUser(data.user.id);
        toastError(insertError);
        throw insertError;
      }

      // Redirect to login page
      toastSuccess("Signup Successful");
      setTimeout(() => router.push("/login"), 1000);
    } catch (error) {
      toastError(error.message, "Signup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
      actions.setSubmitting(false);
    }
  };

  return (
    <section className="my-20 grid min-h-screen w-[100vw] py-10 lg:my-0 lg:place-items-center">
      <Formik
        initialValues={initialValues}
        validationSchema={schemaObject}
        onSubmit={handleSubmit}
      >
        <Form className="flex flex-col gap-5 p-6 lg:mx-auto lg:w-[50%]">
          <TextInput
            label="Mat. Number"
            name="matNum"
            id="matNum"
            type="text"
            placeholder="M.24/ND/CSIT/14***"
          />

          <TextInput
            label="Email Address"
            name="email"
            id="email"
            type="email"
            placeholder="tonystark@gmail.com"
          />

          <PasswordInput
            label="Enter Password"
            name="password"
            id="password"
            placeholder="*********"
          />

          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            id="confirmPassword"
            placeholder="*********"
          />

          <button
            className="w-full rounded-lg border-2 border-primary-100 bg-primary-100 px-5 py-2.5 text-center text-sm font-bold text-white hover:bg-transparent hover:text-primary-100 sm:w-auto"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Your Account..." : "Sign Up"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-center">
            Already have an account?{" "}
            <Link
              className="ms-2 cursor-pointer text-primary-100 hover:underline"
              href="/login"
            >
              Login
            </Link>
          </p>
        </Form>
      </Formik>

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
    </section>
  );
};

export default Signup;

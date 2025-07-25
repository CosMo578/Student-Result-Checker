"use client";
import * as Yup from "yup";
import Link from "next/link";
import { useState } from "react";
import { Formik, Form } from "formik";
import { useRouter } from "next/navigation";

import { createClient } from "@/app/utils/supabase/client";
import { useAuth } from "@/app/context/AuthContext";
import { toastError, toastSuccess } from "@/app/utils/functions/toast";

import PasswordInput from '@/components/PasswordInput'
import TextInput from '@/components/TextInput'

const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const supabase = createClient();
  const { signIn } = useAuth();

  const initialValues = {
    matNum: "",
    email: "",
    password: "",
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
    email: Yup.string().email("Invalid email address").required("Required"),
    password: Yup.string()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
      )
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  });

  const handleSubmit = async (values, actions) => {
    setIsSubmitting(true);

    try {
      // Verify or store matNum in the users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("mat_num")
        .eq("email", values.email)
        .single();

      if (userError && userError.code !== "PGRST116") {
        // PGRST116 is "no rows found" error
        toastError("Error fetching user data: " + userError.message);
        return;
      }

      if (userData && userData.mat_num !== values.matNum) {
        toastError("Matriculation number does not match the registered user.");
        return;
      }

      // Sign in using AuthContext's signIn function
      await signIn(values.email, values.password);

      // If no user data exists, insert it
      if (!userData) {
        const { error: insertError } = await supabase
          .from("users")
          .insert([{ email: values.email, mat_num: values.matNum }]);

        if (insertError) {
          throw new Error(
            "Error saving matriculation number: " + insertError.message,
          );
        }
      }
      toastSuccess("Login successful");
      router.push("/dashboard"); // Redirect to your desired route
    } catch (error) {
      toastError("Login failed: " + error.message);
    } finally {
      setIsSubmitting(false);
      actions.setSubmitting(false);
    }
  };

  return (
    <section className="grid min-h-screen my-20 lg:my-0 w-[100vw] py-10 lg:place-items-center">
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

          <button
            className="w-full rounded-lg bg-primary-100 px-5 py-2.5 text-center text-sm font-bold text-white sm:w-auto"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Validating Credentials..." : "Login"}
          </button>
          <p className="text-center">
            Don&apos;t have an account?{" "}
            <Link
              className="ms-2 cursor-pointer text-primary-100 hover:underline"
              href="/signup"
            >
              Sign Up
            </Link>
          </p>
        </Form>
      </Formik>

    </section>
  );
};

export default Login;

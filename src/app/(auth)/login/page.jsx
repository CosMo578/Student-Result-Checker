"use client";
import * as Yup from "yup";
import Link from "next/link";
import { useState } from "react";
import { Formik, Form } from "formik";
import { useRouter } from "next/navigation";

import { useField } from "formik";
import { Eye, EyeOff } from "lucide-react";

import { createClient } from "../../utils/supabase/client";
import { useAuth } from "../../context/AuthContext";

const PasswordInput = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label
        htmlFor={props.id || props.name}
        className="mb-2 block text-sm font-medium text-gray-900"
      >
        {label}
      </label>
      <div className="relative">
        <input
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          type={showPassword ? "text" : "password"}
          {...field}
          {...props}
        />
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-2xl"
          onClick={() => setShowPassword((prev) => !prev)}
          type="button"
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </button>
      </div>
      {meta.touched && meta.error ? (
        <div className="error text-red-600">{meta.error}</div>
      ) : null}
    </div>
  );
};

const TextInput = ({ label, ...props }) => {
  const [field, meta] = useField(props);

  return (
    <div>
      <label
        htmlFor={props.id || props.name}
        className="mb-2 block text-sm font-medium text-gray-900"
      >
        {label}
      </label>
      <input
        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        {...field}
        {...props}
      />
      {meta.touched && meta.error ? (
        <div className="error text-sm text-red-500">{meta.error}</div>
      ) : null}
    </div>
  );
};

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
      // Sign in using AuthContext's signIn function
      await signIn(values.email, values.password);

      // Verify or store matNum in the users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("mat_num")
        .eq("email", values.email)
        .single();

      if (userError && userError.code !== "PGRST116") {
        // PGRST116 is "no rows found" error
        throw new Error("Error fetching user data: " + userError.message);
      }

      if (userData && userData.mat_num !== values.matNum) {
        throw new Error(
          "Matriculation number does not match the registered user.",
        );
      }

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

      alert("Login successful");
      router.push("/dashboard"); // Redirect to your desired route
    } catch (error) {
      alert("Login failed: " + error.message);
    } finally {
      setIsSubmitting(false);
      actions.setSubmitting(false);
    }
  };

  return (
    <section className="grid min-h-screen w-[100vw] py-10 lg:place-items-center">
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

"use client";
import * as Yup from "yup";
import { useState } from "react";
import { Formik, Form } from "formik";
import { useRouter } from "next/navigation";

import TextInput from "@/components/TextInput";
import PasswordInput from "@/components/PasswordInput";

import { useAdmin } from "@/app/context/AdminAuthContext";
import { toastSuccess } from "../utils/functions/toast";
import { Bounce, ToastContainer } from 'react-toastify';

export default function AdminLogin() {
  const { signIn } = useAdmin();

  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    email: "",
    password: "",
  };

  const schemaObject = Yup.object({
    email: Yup.string().email("Invalid email address").required("Required"),
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setError("");
    const { email, password } = values;
    console.log("Log In initiated");

    try {
      await signIn(email, password);
      toastSuccess("Signin Successful");

      setTimeout(() => router.push("/admin/dashboard"), 1000);
    } catch (err) {
      toastError(err.message);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="grid h-screen w-[100vw] items-center lg:place-items-center">
      <Formik
        initialValues={initialValues}
        validationSchema={schemaObject}
        onSubmit={handleSubmit}
      >
        <Form className="flex flex-col gap-5 p-6 lg:mx-auto lg:w-[50%]">
          <TextInput
            label="Email Address"
            name="email"
            id="email"
            type="email"
            placeholder="jackmiller@gmail.com"
          />

          <PasswordInput
            label="Password"
            name="password"
            id="password"
            placeholder="*********"
          />

          <button
            className="w-full rounded-lg bg-primary-100 px-5 py-2.5 text-center text-sm font-bold text-white focus:outline-none focus:ring-4 sm:w-auto"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}
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
}

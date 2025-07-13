"use client";
import * as Yup from "yup";
import { useState } from "react";
import { Formik, Form } from "formik";
import { useRouter } from "next/navigation";
// import TextInput from "@/components/TextInput";
// import PasswordInput from "@/components/PasswordInput";

import { useAdmin } from '../context/AdminAuthContext';

import { useField } from "formik";
import { Eye, EyeOff } from "lucide-react";

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
    const { email, password } = values;
    console.log("Log In initiated")

    try {
      await signIn(email, password);
      router.push("/admin/dashboard");
    } catch (err) {
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
    </section>
  );
}

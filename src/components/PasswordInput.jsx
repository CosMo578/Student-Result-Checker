"use client";
import { useState } from "react";
import { useField } from "formik";
import { Eye, EyeOff } from "lucide-react";

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

export default PasswordInput;

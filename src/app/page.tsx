import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold">Welcome to Our Platform</h1>
      <p className="mt-4">Please log in or sign up to continue.</p>
      <div className="mt-6 flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-primary-100 px-4 py-2 text-white"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="rounded-lg bg-primary-100 px-4 py-2 text-white"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}

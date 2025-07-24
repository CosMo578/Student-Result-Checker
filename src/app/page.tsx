import Link from "next/link";
import Image from "next/image";

const Header = () => {
  return (
    <header className="bg-gray-50 py-4 shadow-md">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="md:flex md:items-center md:gap-12">
            <Link className="block text-primary-300" href="/">
              <span className="sr-only">Home</span>
              <Image
                src="/pti-logo.svg"
                alt="pti logo"
                width={50}
                height={50}
              />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="sm:flex sm:gap-4">
              <Link
                className="rounded-lg bg-primary-300 px-6 py-2.5 font-semibold text-white shadow hover:bg-primary-500"
                href="/login"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const Hero = () => {
  return (
    <section className='mt-14'>
      <div className="mx-auto max-w-screen-xl px-4 py-24 lg:flex lg:items-center">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Your Grades, One Click Away
            <strong className="block font-extrabold text-primary-300 sm:block">
              Fast. Simple. Secure.
            </strong>
            Anytime, Anywhere
          </h1>

          <p className="mt-4 text-gray-600 sm:text-lg/relaxed">
            Access your academic results instantly with a user-friendly
            platform designed to save you time and keep you informed.
          </p>

          <Link href="/signup">
            <button className="mt-4 rounded-bl-3xl rounded-tr-3xl border-2 border-primary-300  bg-primary-300 px-6 py-3 md:px-8 md:py-4 font-semibold text-white hover:bg-transparent hover:text-primary-300 transition-colors sm:w-auto">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default function LandingPage() {
  return (
    <div className="max-h-screen">
      <Header />
      <Hero />
    </div>
  );
}

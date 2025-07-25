import "./globals.css";
import { Outfit } from "next/font/google";
import { AuthProvider } from "./context/AuthContext";
import { Bounce, ToastContainer } from 'react-toastify';

const outfit = Outfit({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata = {
  title: "Student Result Checker",
  description:
    "A Student platform tailored to provide course materials, quizzes and an open chatroom for all to share knowledge and learn.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* className={outfit.className} */}
      <body>
        <AuthProvider>{children}</AuthProvider>
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
      </body>
    </html>
  );
}

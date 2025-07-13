import "./globals.css";
import { Outfit } from "next/font/google";
import { AuthProvider } from "./context/AuthContext";

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
      <body className={outfit.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

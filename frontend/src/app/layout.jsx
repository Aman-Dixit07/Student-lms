import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/lib/AuthProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: any) {
  return (
    <html lang="en">
      <body className="bg-[#0f0f0f] text-white">
        <AppProvider>
          <Toaster position="top-right" />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

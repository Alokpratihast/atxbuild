import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTopBtn from "@/components/ScrollToTopBtn";
import AuthModalWrapper from "@/components/AuthModalWrapper";
import Providers from "./Providers"; // ✅ Client wrapper
import { seedSuperAdmin } from "@/lib/seedSuperAdmin";



export const metadata = {
  title: "ATX Technologies",
  description: "My site description",
  icons: {
    icon: "/fevicon_atx6.ico", // this is the main favicon
  },
};

if (typeof window === "undefined") {
  seedSuperAdmin();
}



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <ScrollToTopBtn />
          <AuthModalWrapper />
          
        </Providers>
      </body>
    </html>
  );
}

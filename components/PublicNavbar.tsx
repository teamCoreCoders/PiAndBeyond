import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import Logo from "@/app/images/pi and beyond logo.png";

export default function PublicNavbar() {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Contact
            </Link>
          </div>
          <Link href="/">
            <Image src={Logo} alt="Logo" width={80} height={28} priority />
          </Link>


          <div className="flex items-center gap-3">
            <Link href="/studentAuth">
              <Button variant="outline">Student Login</Button>
            </Link>
            <Link href="/teacherAuth">
              <Button>Teacher Login</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

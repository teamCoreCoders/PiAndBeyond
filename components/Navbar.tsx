"use client";

import { useAuth } from "@/lib/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/app/images/pi and beyond logo.jpg";

export default function Navbar() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      if (user) {
        await signOut(auth);
      }
    } finally {
      try {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("teacherOverride");
          sessionStorage.removeItem("teacherOverrideEmail");
          sessionStorage.removeItem("teacherOverrideName");
        }
      } catch {}
      router.push("/login");
    }
  };

  if (!userData) return null;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href={
                userData.role === "teacher"
                  ? "/teacher/dashboard"
                  : "/student/dashboard"
              }
            >
              <Image src={Logo} alt="Logo" width={63} height={24} priority />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <div className="font-medium">{userData.name}</div>
              <div className="text-gray-500 capitalize">{userData.role}</div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

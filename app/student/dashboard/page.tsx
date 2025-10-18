"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ClassCard from "@/components/ClassCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  getSubjectsByStudent,
  joinSubjectByCode,
} from "@/lib/firestore-helpers";
import { PlusCircle } from "lucide-react";
import Footer from "@/components/Footer";
import Logo from "@/app/images/pi and beyond logo.png";
export default function StudentDashboard() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [open, setOpen] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "student")) {
      router.push("/login");
    }
  }, [user, userData, loading, router]);

  useEffect(() => {
    if (user && userData?.role === "student") {
      loadSubjects();
    }
  }, [user, userData]);

  const loadSubjects = async () => {
    if (!user) return;
    try {
      const data = await getSubjectsByStudent(user.uid);
      setSubjects(data);
    } catch (error) {
      console.error("Error loading subjects:", error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleJoinSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setJoining(true);
    setError("");

    try {
      await joinSubjectByCode(classCode.toUpperCase(), user.uid);
      setOpen(false);
      setClassCode("");
      loadSubjects();
    } catch (error: any) {
      setError(error.message || "Failed to join subject");
    } finally {
      setJoining(false);
    }
  };

  if (loading || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[100vh] bg-gray-50 flex flex-col">
      <Navbar />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src={Logo.src} alt="Watermark" className="w-[50%] opacity-20" />
      </div>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[70vh] md:min-h-[80vh] lg:min-h-[85vh] pb-16">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
              <p className="text-gray-600 mt-1">
                View assignments and submit your work
              </p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="gap-2 self-center md:self-auto w-full max-w-[200px] md:w-auto"
                >
                  <PlusCircle className="w-4 h-4" />
                  Join Subject
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Join Subject</DialogTitle>
                  <DialogDescription>
                    Enter the class code provided by your teacher
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleJoinSubject} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Class Code</label>
                    <Input
                      placeholder="Enter 6-character code"
                      value={classCode}
                      onChange={(e) =>
                        setClassCode(e.target.value.toUpperCase())
                      }
                      maxLength={6}
                      required
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={joining}>
                    {joining ? "Joining..." : "Join Subject"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loadingSubjects ? (
            <div className="text-center py-12">
              <div className="text-lg">Loading subjects...</div>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">No subjects yet</div>
              <p className="text-gray-400">
                Join a subject using the class code from your teacher
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <ClassCard
                  key={subject.id}
                  id={subject.id}
                  className={subject.className}
                  subject={subject.subjectName}
                  section=""
                  description={subject.description}
                  role="student"
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  createSubject,
  getSubjectsByBranch,
  deleteSubject,
} from "@/lib/firestore-helpers";
import { PlusCircle, BookOpen, Users, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function BranchDetailPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const branchId = params.id as string;

  const [branchData, setBranchData] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    className: "",
    subjectName: "",
    description: "",
  });

  useEffect(() => {
    if (!loading && userData?.role !== "teacher") {
      router.push("/login");
    }
  }, [userData, loading, router]);

  useEffect(() => {
    if (userData?.role === "teacher" && branchId) {
      loadBranchData();
      loadSubjects();
    }
  }, [userData, branchId]);

  const loadBranchData = async () => {
    const branchDoc = await getDoc(doc(db, "branches", branchId));
    if (branchDoc.exists()) {
      setBranchData({ id: branchDoc.id, ...branchDoc.data() });
    }
  };

  const loadSubjects = async () => {
    try {
      const data = await getSubjectsByBranch(branchId);
      setSubjects(data);
    } catch (error) {
      console.error("Error loading subjects:", error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await createSubject({
        branchId,
        teacherId: user.uid,
        ...formData,
      });
      setOpen(false);
      setFormData({ className: "", subjectName: "", description: "" });
      loadSubjects();
    } catch (error) {
      console.error("Error creating subject:", error);
    }
  };

  if (loading || !userData || !branchData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[70vh] md:min-h-[80vh] lg:min-h-[85vh] pb-16">
          <div className="mb-6">
            <Link href="/teacher/dashboard">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Branches
              </Button>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {branchData.branchName}
            </h1>
            <p className="text-gray-600 mt-1">{branchData.description}</p>
          </div>

          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Classes & Subjects
              </h2>
              <p className="text-gray-600 mt-1">
                Manage classes and subjects under this branch
              </p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Create New Class
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Class</DialogTitle>
                  <DialogDescription>
                    Add a new class with subject under this branch
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Class Name</label>
                    <Input
                      placeholder="e.g., First Year, Second Year"
                      value={formData.className}
                      onChange={(e) =>
                        setFormData({ ...formData, className: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject Name</label>
                    <Input
                      placeholder="e.g., Data Structures, Mathematics"
                      value={formData.subjectName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subjectName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Brief description of the class and subject"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Create Class
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loadingSubjects ? (
            <div className="text-center py-12">
              <div className="text-lg">Loading classes...</div>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">No classes yet</div>
              <p className="text-gray-400">
                Create your first class to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <Card
                  key={subject.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {subject.className}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {subject.subjectName}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={async () => {
                          if (
                            !confirm("Delete this class/subject and its data?")
                          )
                            return;
                          try {
                            await deleteSubject(subject.id);
                            loadSubjects();
                          } catch (error) {
                            console.error("Error deleting subject:", error);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {subject.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Link
                        href={`/teacher/subjects/${subject.id}`}
                        className="flex-1"
                      >
                        <Button className="w-full gap-2">
                          <Users className="w-4 h-4" />
                          Manage Students
                        </Button>
                      </Link>
                    </div>
                    <div className="mt-2 bg-blue-50 inline-block px-3 py-1 rounded">
                      <span className="text-sm text-gray-600">
                        Class Code:{" "}
                      </span>
                      <span className="font-mono font-bold text-blue-600">
                        {subject.classCode}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

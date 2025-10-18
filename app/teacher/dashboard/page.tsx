"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
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
  createBranch,
  getBranchesByTeacher,
  deleteBranch,
} from "@/lib/firestore-helpers";
import { PlusCircle, FolderTree, BookOpen, Users, Trash2 } from "lucide-react";
import Footer from "@/components/Footer";
import Link from "next/link";
import Logo from "@/app/images/pi and beyond logo.png";
export default function TeacherDashboard() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [branches, setBranches] = useState<any[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    branchName: "",
    description: "",
  });

  useEffect(() => {
    if (!loading && userData?.role !== "teacher") {
      router.push("/login");
    }
  }, [userData, loading, router]);

  useEffect(() => {
    if (userData?.role === "teacher") {
      loadBranches();
    }
  }, [userData]);

  const loadBranches = async () => {
    const teacherId = user?.uid || userData?.uid;
    if (!teacherId) return;
    try {
      const data = await getBranchesByTeacher(teacherId);
      setBranches(data);
    } catch (error) {
      console.error("Error loading branches:", error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const teacherId = user?.uid || userData?.uid;
    if (!teacherId) return;

    try {
      await createBranch({
        teacherId,
        ...formData,
      });
      setOpen(false);
      setFormData({ branchName: "", description: "" });
      loadBranches();
    } catch (error) {
      console.error("Error creating branch:", error);
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
    <div className="min-h-[100svh] bg-gray-50 flex flex-col">
      <Navbar />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src={Logo.src} alt="Watermark" className="w-[50%] opacity-20" />
      </div>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[70vh] md:min-h-[80vh] lg:min-h-[85vh] pb-16">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900">My Branches</h1>
              <p className="text-gray-600 mt-1">
                Organize your subjects by branches and manage classes
              </p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="gap-2 self-center md:self-auto w-full max-w-[220px] md:w-auto"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create New Branch
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Branch</DialogTitle>
                  <DialogDescription>
                    Add a new branch to organize your subjects
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Branch Name</label>
                    <Input
                      placeholder="e.g., Computer Science, Engineering"
                      value={formData.branchName}
                      onChange={(e) =>
                        setFormData({ ...formData, branchName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Brief description of the branch"
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
                    Create Branch
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loadingBranches ? (
            <div className="text-center py-12">
              <div className="text-lg">Loading branches...</div>
            </div>
          ) : branches.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">No branches yet</div>
              <p className="text-gray-400">
                Create your first branch to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch) => (
                <Card
                  key={branch.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FolderTree className="w-5 h-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl flex-1">
                        {branch.branchName}
                      </CardTitle>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={async () => {
                          if (
                            !confirm("Delete this branch and all its classes?")
                          )
                            return;
                          try {
                            await deleteBranch(branch.id);
                            loadBranches();
                          } catch (error) {
                            console.error("Error deleting branch:", error);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {branch.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Link
                        href={`/teacher/branches/${branch.id}`}
                        className="flex-1"
                      >
                        <Button className="w-full gap-2">
                          <BookOpen className="w-4 h-4" />
                          Manage Classes
                        </Button>
                      </Link>
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

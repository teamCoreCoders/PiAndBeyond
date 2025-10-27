"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  getStudentsBySubject,
  createSubjectAssignment,
  getAssignmentsBySubject,
  getSubmissionsBySubjectAssignment,
  uploadFile,
  gradeSubjectSubmission,
  removeStudentFromSubject,
  createStudyMaterial,
  getStudyMaterialsBySubject,
  deleteStudyMaterial,
} from "@/lib/firestore-helpers";
import {
  PlusCircle,
  Users,
  FileText,
  CheckCircle,
  Trash2,
  ArrowLeft,
  BookOpen,
  Download,
} from "lucide-react";
import Link from "next/link";

export default function SubjectDetailPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const subjectId = params.id as string;

  const [subjectData, setSubjectData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [marks, setMarks] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    // dueDate: "",
    file: null as File | null,
  });

  const [materialFormData, setMaterialFormData] = useState({
    title: "",
    description: "",
    file: null as File | null,
  });

  useEffect(() => {
    if (!loading && userData?.role !== "teacher") {
      router.push("/login");
    }
  }, [userData, loading, router]);

  useEffect(() => {
    if (userData?.role === "teacher" && subjectId) {
      loadSubjectData();
      loadStudents();
      loadAssignments();
      loadStudyMaterials();
    }
  }, [userData, subjectId]);

  const loadSubjectData = async () => {
    const subjectDoc = await getDoc(doc(db, "subjects", subjectId));
    if (subjectDoc.exists()) {
      setSubjectData({ id: subjectDoc.id, ...subjectDoc.data() });
    }
  };

  const loadStudents = async () => {
    const data = await getStudentsBySubject(subjectId);
    setStudents(data);
  };

  const loadAssignments = async () => {
    const data = await getAssignmentsBySubject(subjectId);
    setAssignments(data);

    const allSubmissions: any[] = [];
    for (const assignment of data) {
      const subs = await getSubmissionsBySubjectAssignment(assignment.id);
      allSubmissions.push(
        ...subs.map((s: any) => ({
          ...s,
          assignmentTitle: (assignment as any).title,
        }))
      );
    }
    setSubmissions(allSubmissions);
  };

  const loadStudyMaterials = async () => {
    const data = await getStudyMaterialsBySubject(subjectId);
    setStudyMaterials(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      let fileURL = "";
      if (formData.file) {
        fileURL = await uploadFile(
          formData.file,
          `subject-assignments/${subjectId}/${Date.now()}_${formData.file.name}`
        );
      }

      await createSubjectAssignment({
        subjectId,
        teacherId: user.uid,
        title: formData.title,
        description: formData.description,
        // dueDate: new Date(formData.dueDate),
        dueDate: new Date(),
        fileURL,
      });

      setOpen(false);
      setFormData({ title: "", description: "", file: null });
      loadAssignments();
    } catch (error) {
      console.error("Error creating assignment:", error);
    }
  };

  const handleGrade = async () => {
    if (!selectedSubmission || !marks) return;

    try {
      await gradeSubjectSubmission(selectedSubmission.id, parseFloat(marks));
      setGradeDialogOpen(false);
      setSelectedSubmission(null);
      setMarks("");
      loadAssignments();
    } catch (error) {
      console.error("Error grading submission:", error);
    }
  };

  const handleRemoveStudent = async (memberId: string) => {
    if (
      !confirm("Are you sure you want to remove this student from the subject?")
    )
      return;

    try {
      await removeStudentFromSubject(memberId);
      loadStudents();
    } catch (error) {
      console.error("Error removing student:", error);
    }
  };

  const handleMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !materialFormData.file) return;

    try {
      const fileURL = await uploadFile(
        materialFormData.file,
        `study-materials/${subjectId}/${Date.now()}_${
          materialFormData.file.name
        }`
      );

      await createStudyMaterial({
        subjectId,
        title: materialFormData.title,
        description: materialFormData.description,
        fileURL,
        uploadedBy: user.uid,
      });

      setMaterialDialogOpen(false);
      setMaterialFormData({ title: "", description: "", file: null });
      loadStudyMaterials();
    } catch (error) {
      console.error("Error uploading study material:", error);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm("Are you sure you want to delete this study material?"))
      return;

    try {
      await deleteStudyMaterial(materialId);
      loadStudyMaterials();
    } catch (error) {
      console.error("Error deleting study material:", error);
    }
  };

  if (loading || !subjectData) {
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
            <Link href={`/teacher/branches/${subjectData.branchId}`}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Branch
              </Button>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {subjectData.className}
            </h1>
            <p className="text-gray-600 mt-1">{subjectData.subjectName}</p>
            <div className="mt-2 bg-blue-50 inline-block px-3 py-1 rounded">
              <span className="text-sm text-gray-600">Class Code: </span>
              <span className="font-mono font-bold text-blue-600">
                {subjectData.classCode}
              </span>
            </div>
          </div>

          <Tabs defaultValue="students" className="space-y-6">
            <TabsList>
              <TabsTrigger value="students" className="gap-2">
                <Users className="w-4 h-4" />
                Students
              </TabsTrigger>
              <TabsTrigger value="assignments" className="gap-2">
                <FileText className="w-4 h-4" />
                Assignments
              </TabsTrigger>
              <TabsTrigger value="submissions" className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Submissions
              </TabsTrigger>
              <TabsTrigger value="materials" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Study Materials
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>Enrolled Students ({students.length})</CardTitle>
                  <CardDescription>
                    Students who have joined this subject
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {students.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No students have joined yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {students.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded"
                        >
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-gray-500">
                              {student.email}
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleRemoveStudent(student.memberId)
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assignments">
              <div className="flex justify-end mb-4">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <PlusCircle className="w-4 h-4" />
                      Create Assignment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create Assignment</DialogTitle>
                      <DialogDescription>
                        Add a new assignment for your students
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          placeholder="Assignment title"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Description
                        </label>
                        <Textarea
                          placeholder="Assignment description"
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

                      {/* <div className="space-y-2">
                        <label className="text-sm font-medium">Due Date</label>
                        <Input
                          type="datetime-local"
                          value={formData.dueDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dueDate: e.target.value,
                            })
                          }
                          required
                        />
                      </div> */}

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Attachment (optional)
                        </label>
                        <Input
                          type="file"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              file: e.target.files?.[0] || null,
                            })
                          }
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        Create Assignment
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {assignments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">No assignments yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <Card key={assignment.id}>
                      <CardHeader>
                        <CardTitle>{assignment.title}</CardTitle>
                        {/* <CardDescription>
                          Due: {assignment.dueDate?.toDate().toLocaleString()}
                        </CardDescription> */}
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">
                          {assignment.description}
                        </p>
                        {assignment.fileURL && (
                          <a
                            href={assignment.fileURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 text-sm hover:underline mt-2 inline-block"
                          >
                            View Attachment
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="submissions">
              <Card>
                <CardHeader>
                  <CardTitle>All Submissions</CardTitle>
                  <CardDescription>
                    Review and grade student submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submissions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No submissions yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {submissions.map((submission) => (
                        <div
                          key={submission.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded"
                        >
                          <div className="flex-1">
                            <div className="font-medium">
                              {submission.studentName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.assignmentTitle}
                            </div>
                            <div className="text-xs text-gray-400">
                              Submitted:{" "}
                              {submission.submittedAt
                                ?.toDate()
                                .toLocaleString()}
                            </div>
                            <a
                              href={submission.fileURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 text-sm hover:underline"
                            >
                              View Submission
                            </a>
                          </div>
                          <div className="text-right">
                            {submission.graded ? (
                              <div className="text-green-600 font-semibold">
                                Grade: {submission.marks}
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setGradeDialogOpen(true);
                                }}
                              >
                                Grade
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materials">
              <div className="flex justify-end mb-4">
                <Dialog
                  open={materialDialogOpen}
                  onOpenChange={setMaterialDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <PlusCircle className="w-4 h-4" />
                      Upload Study Material
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Upload Study Material</DialogTitle>
                      <DialogDescription>
                        Upload study materials for your students
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleMaterialSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          placeholder="Material title"
                          value={materialFormData.title}
                          onChange={(e) =>
                            setMaterialFormData({
                              ...materialFormData,
                              title: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Description
                        </label>
                        <Textarea
                          placeholder="Brief description of the material"
                          value={materialFormData.description}
                          onChange={(e) =>
                            setMaterialFormData({
                              ...materialFormData,
                              description: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">File</label>
                        <Input
                          type="file"
                          onChange={(e) =>
                            setMaterialFormData({
                              ...materialFormData,
                              file: e.target.files?.[0] || null,
                            })
                          }
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        Upload Material
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {studyMaterials.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">No study materials yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {studyMaterials.map((material) => (
                    <Card key={material.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                              {material.title}
                            </CardTitle>
                            <CardDescription className="mt-2">
                              {material.description}
                            </CardDescription>
                            <div className="text-xs text-gray-400 mt-2">
                              Uploaded:{" "}
                              {material.createdAt?.toDate().toLocaleString()}
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteMaterial(material.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <a
                          href={material.fileURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                        >
                          <Download className="w-4 h-4" />
                          Download Material
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <DialogDescription>
              Enter marks for this submission
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Marks</label>
              <Input
                type="number"
                placeholder="Enter marks"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                min="0"
                max="100"
              />
            </div>
            <Button onClick={handleGrade} className="w-full">
              Submit Grade
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  getAssignmentsBySubject,
  submitSubjectAssignment,
  getSubjectSubmissionStatus,
  uploadFile,
  getStudyMaterialsBySubject,
} from "@/lib/firestore-helpers";
import {
  FileText,
  Upload,
  CheckCircle,
  Clock,
  BookOpen,
  Download,
} from "lucide-react";

export default function StudentClassPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const subjectId = params.id as string;

  const [subjectData, setSubjectData] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "student")) {
      router.push("/login");
    }
  }, [user, userData, loading, router]);

  useEffect(() => {
    if (user && subjectId) {
      loadSubjectData();
      loadAssignments();
      loadStudyMaterials();
    }
  }, [user, subjectId]);

  const loadSubjectData = async () => {
    const subjectDoc = await getDoc(doc(db, "subjects", subjectId));
    if (subjectDoc.exists()) {
      setSubjectData({ id: subjectDoc.id, ...subjectDoc.data() });
    }
  };

  const loadAssignments = async () => {
    if (!user) return;

    const data = await getAssignmentsBySubject(subjectId);

    const assignmentsWithStatus = await Promise.all(
      data.map(async (assignment) => {
        const submission = await getSubjectSubmissionStatus(
          assignment.id,
          user.uid
        );
        return {
          ...assignment,
          submission,
        };
      })
    );

    setAssignments(assignmentsWithStatus);
  };

  const loadStudyMaterials = async () => {
    const data = await getStudyMaterialsBySubject(subjectId);
    setStudyMaterials(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file || !selectedAssignment) return;

    setSubmitting(true);

    try {
      const fileURL = await uploadFile(
        file,
        `subject-submissions/${subjectId}/${selectedAssignment.id}/${
          user.uid
        }_${Date.now()}_${file.name}`
      );

      await submitSubjectAssignment({
        assignmentId: selectedAssignment.id,
        studentId: user.uid,
        fileURL,
      });

      setOpen(false);
      setFile(null);
      setSelectedAssignment(null);
      loadAssignments();
    } catch (error) {
      console.error("Error submitting assignment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (assignment: any) => {
    if (!assignment.submission) {
      return <Badge variant="destructive">Pending</Badge>;
    }
    if (assignment.submission.graded) {
      return (
        <Badge className="bg-green-600">
          Graded: {assignment.submission.marks}
        </Badge>
      );
    }
    return <Badge variant="secondary">Submitted</Badge>;
  };

  if (loading || !subjectData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {subjectData.className}
          </h1>
          <p className="text-gray-600 mt-1">{subjectData.subjectName}</p>
        </div>

        <Tabs defaultValue="assignments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="assignments" className="gap-2">
              <FileText className="w-4 h-4" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="materials" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Study Materials
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assignments">
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
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle>{assignment.title}</CardTitle>
                          <CardDescription>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-4 h-4" />
                              Due:{" "}
                              {assignment.dueDate?.toDate().toLocaleString()}
                            </div>
                          </CardDescription>
                        </div>
                        {getStatusBadge(assignment)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600">
                        {assignment.description}
                      </p>

                      {assignment.fileURL && (
                        <a
                          href={assignment.fileURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-sm hover:underline inline-block"
                        >
                          View Assignment File
                        </a>
                      )}

                      {assignment.submission ? (
                        <div className="pt-3 border-t">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-green-600 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Submitted
                              </div>
                              <div className="text-xs text-gray-500">
                                {assignment.submission.submittedAt
                                  ?.toDate()
                                  .toLocaleString()}
                              </div>
                            </div>
                            <a
                              href={assignment.submission.fileURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 text-sm hover:underline"
                            >
                              View Submission
                            </a>
                          </div>
                          {assignment.submission.graded && (
                            <div className="mt-2 p-3 bg-green-50 rounded">
                              <div className="text-sm font-medium">
                                Grade: {assignment.submission.marks}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Button
                          className="gap-2"
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setOpen(true);
                          }}
                        >
                          <Upload className="w-4 h-4" />
                          Submit Assignment
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="materials">
            {studyMaterials.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">
                    No study materials available yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {studyMaterials.map((material) => (
                  <Card key={material.id}>
                    <CardHeader>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>
              Upload your completed assignment file
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Assignment File</label>
              <Input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitting || !file}
            >
              {submitting ? "Submitting..." : "Submit Assignment"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

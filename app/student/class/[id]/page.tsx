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
  getSubjectSubmissionsByStudent,
  deleteSubjectSubmission,
  uploadFile,
  getStudyMaterialsBySubject,
  getStudyMaterialFoldersBySubject,
} from "@/lib/firestore-helpers";
import {
  FileText,
  Upload,
  CheckCircle,
  // Clock,
  BookOpen,
  Download,
  Folder,
  Trash2,
} from "lucide-react";

export default function StudentClassPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const subjectId = params.id as string;

  const [subjectData, setSubjectData] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<any[]>([]);
  const [studyMaterialFolders, setStudyMaterialFolders] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "student")) {
      router.push("/");
    }
  }, [user, userData, loading, router]);

  useEffect(() => {
    if (user && subjectId) {
      loadSubjectData();
      loadAssignments();
      loadStudyMaterials();
      loadStudyMaterialFolders();
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
        const allSubmissions = await getSubjectSubmissionsByStudent(
          assignment.id,
          user.uid
        );
        const latestSubmission = allSubmissions.length > 0 ? allSubmissions[0] : null;
        
        // Store all submissions for this assignment
        setSubmissions(prev => ({
          ...prev,
          [assignment.id]: allSubmissions
        }));
        
        return {
          ...assignment,
          submission: latestSubmission,
          allSubmissions,
        };
      })
    );

    setAssignments(assignmentsWithStatus);
  };

  const loadStudyMaterials = async () => {
    const data = await getStudyMaterialsBySubject(subjectId);
    setStudyMaterials(data);
  };

  const loadStudyMaterialFolders = async () => {
    const data = await getStudyMaterialFoldersBySubject(subjectId);
    setStudyMaterialFolders(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedAssignment) return;

    // Check if this is the first submission
    const existingSubmissions = submissions[selectedAssignment.id] || 
                                selectedAssignment.allSubmissions || 
                                [];
    const isFirstSubmission = existingSubmissions.length === 0;

    // For first submission, use files (multiple), otherwise use file (single)
    if (isFirstSubmission) {
      if (!files || files.length === 0) return;
    } else {
      if (!file) return;
    }

    setSubmitting(true);

    try {
      if (isFirstSubmission && files) {
        // First submission: upload multiple files
        const filesArray = Array.from(files);
        for (const fileToUpload of filesArray) {
          const fileURL = await uploadFile(
            fileToUpload,
            `subject-submissions/${subjectId}/${selectedAssignment.id}/${
              user.uid
            }_${Date.now()}_${fileToUpload.name}`
          );

          await submitSubjectAssignment({
            assignmentId: selectedAssignment.id,
            studentId: user.uid,
            fileURL,
          });
        }
      } else if (file) {
        // Subsequent submissions: single file
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
      }

      setOpen(false);
      setFile(null);
      setFiles(null);
      setSelectedAssignment(null);
      loadAssignments();
    } catch (error) {
      console.error("Error submitting assignment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmission = async (submissionId: string, assignmentId: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;

    try {
      await deleteSubjectSubmission(submissionId);
      loadAssignments();
    } catch (error) {
      console.error("Error deleting submission:", error);
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
                          {/* <CardDescription>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-4 h-4" />
                              Due:{" "}
                              {assignment.dueDate?.toDate().toLocaleString()}
                            </div>
                          </CardDescription> */}
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

                      <div className="pt-3 border-t space-y-3">
                        {((assignment.allSubmissions && assignment.allSubmissions.length > 0) || 
                          (submissions[assignment.id] && submissions[assignment.id].length > 0)) ? (
                          <>
                            <div className="text-sm font-medium mb-2">
                              Your Submissions ({(assignment.allSubmissions || submissions[assignment.id] || []).length})
                            </div>
                            <div className="space-y-2">
                              {(assignment.allSubmissions || submissions[assignment.id] || []).map((submission: any) => (
                                <div
                                  key={submission.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                                >
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-green-600 flex items-center gap-2">
                                      <CheckCircle className="w-4 h-4" />
                                      Submitted
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {submission.submittedAt?.toDate().toLocaleString()}
                                    </div>
                                    {submission.graded && (
                                      <div className="text-sm font-medium text-green-700 mt-1">
                                        Grade: {submission.marks}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={submission.fileURL}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 text-sm hover:underline"
                                    >
                                      View
                                    </a>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteSubmission(submission.id, assignment.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : null}
                        <Button
                          className="gap-2 w-full"
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setFile(null);
                            setFiles(null);
                            setOpen(true);
                          }}
                        >
                          <Upload className="w-4 h-4" />
                          {((assignment.allSubmissions && assignment.allSubmissions.length > 0) || 
                            (submissions[assignment.id] && submissions[assignment.id].length > 0))
                            ? "Submit Again"
                            : "Submit Assignment"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="materials">
            {studyMaterialFolders.length === 0 && studyMaterials.filter(m => !m.folderId).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">
                    No study materials available yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Show folders */}
                {studyMaterialFolders.map((folder) => {
                  const folderMaterials = studyMaterials.filter(
                    (m) => m.folderId === folder.id
                  );
                  return (
                    <Card key={folder.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Folder className="w-5 h-5 text-blue-600" />
                          {folder.topicName}
                        </CardTitle>
                        {folder.description && (
                          <CardDescription className="mt-2">
                            {folder.description}
                          </CardDescription>
                        )}
                        <div className="text-xs text-gray-400 mt-2">
                          {folderMaterials.length} file(s)
                        </div>
                      </CardHeader>
                      <CardContent>
                        {folderMaterials.length === 0 ? (
                          <p className="text-sm text-gray-500 py-4">
                            No materials in this folder yet
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {folderMaterials.map((material) => (
                              <div
                                key={material.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded"
                              >
                                <div className="flex-1">
                                  <div className="font-medium text-sm">
                                    {material.title}
                                  </div>
                                  {material.description && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {material.description}
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-400 mt-1">
                                    Uploaded:{" "}
                                    {material.createdAt?.toDate().toLocaleString()}
                                  </div>
                                </div>
                                <a
                                  href={material.fileURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Show materials without folders */}
                {studyMaterials.filter((m) => !m.folderId).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        Other Materials
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {studyMaterials
                          .filter((m) => !m.folderId)
                          .map((material) => (
                            <div
                              key={material.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {material.title}
                                </div>
                                {material.description && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {material.description}
                                  </div>
                                )}
                                <div className="text-xs text-gray-400 mt-1">
                                  Uploaded:{" "}
                                  {material.createdAt?.toDate().toLocaleString()}
                                </div>
                              </div>
                              <a
                                href={material.fileURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </a>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog 
        open={open} 
        onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
            setFile(null);
            setFiles(null);
            setSelectedAssignment(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>
              {selectedAssignment && 
               ((submissions[selectedAssignment.id] || []).length === 0 || 
                (selectedAssignment.allSubmissions && selectedAssignment.allSubmissions.length === 0))
                ? "Upload your completed assignment files (you can select multiple files for your first submission)"
                : "Upload your completed assignment file"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedAssignment && 
             ((submissions[selectedAssignment.id] || []).length === 0 || 
              (selectedAssignment.allSubmissions && selectedAssignment.allSubmissions.length === 0)) ? (
              // First submission: allow multiple files
              <div className="space-y-2">
                <label className="text-sm font-medium">Assignment Files</label>
                <Input
                  type="file"
                  multiple
                  onChange={(e) => {
                    setFiles(e.target.files);
                    setFile(null);
                  }}
                  required
                />
                <p className="text-xs text-gray-500">
                  You can select multiple files for your first submission
                </p>
              </div>
            ) : (
              // Subsequent submissions: single file only
              <div className="space-y-2">
                <label className="text-sm font-medium">Assignment File</label>
                <Input
                  type="file"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] || null);
                    setFiles(null);
                  }}
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                submitting ||
                (selectedAssignment && 
                 ((submissions[selectedAssignment.id] || []).length === 0 || 
                  (selectedAssignment.allSubmissions && selectedAssignment.allSubmissions.length === 0))
                  ? !files || files.length === 0
                  : !file)
              }
            >
              {submitting ? "Submitting..." : "Submit Assignment"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

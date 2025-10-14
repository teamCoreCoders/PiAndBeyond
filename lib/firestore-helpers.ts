import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export function generateClassCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

export async function uploadFile(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export async function createClass(data: {
  teacherId: string;
  className: string;
  subject: string;
  section: string;
  description: string;
}) {
  const classCode = generateClassCode();
  return await addDoc(collection(db, 'classes'), {
    ...data,
    classCode,
    createdAt: Timestamp.now(),
  });
}

export async function getClassesByTeacher(teacherId: string) {
  const q = query(collection(db, 'classes'), where('teacherId', '==', teacherId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getClassesByStudent(studentId: string) {
  const q = query(collection(db, 'classMembers'), where('studentId', '==', studentId));
  const snapshot = await getDocs(q);
  const classIds = snapshot.docs.map(doc => doc.data().classId);

  if (classIds.length === 0) return [];

  const classes = [];
  for (const classId of classIds) {
    const classDoc = await getDoc(doc(db, 'classes', classId));
    if (classDoc.exists()) {
      classes.push({ id: classDoc.id, ...classDoc.data() });
    }
  }
  return classes;
}

export async function joinClassByCode(classCode: string, studentId: string) {
  const q = query(collection(db, 'classes'), where('classCode', '==', classCode));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error('Invalid class code');
  }

  const classId = snapshot.docs[0].id;

  const memberQuery = query(
    collection(db, 'classMembers'),
    where('classId', '==', classId),
    where('studentId', '==', studentId)
  );
  const memberSnapshot = await getDocs(memberQuery);

  if (!memberSnapshot.empty) {
    throw new Error('Already joined this class');
  }

  await addDoc(collection(db, 'classMembers'), {
    classId,
    studentId,
    joinedAt: Timestamp.now(),
  });

  return classId;
}

export async function getStudentsByClass(classId: string) {
  const q = query(collection(db, 'classMembers'), where('classId', '==', classId));
  const snapshot = await getDocs(q);

  const students = [];
  for (const memberDoc of snapshot.docs) {
    const studentId = memberDoc.data().studentId;
    const userDoc = await getDoc(doc(db, 'users', studentId));
    if (userDoc.exists()) {
      students.push({ id: userDoc.id, ...userDoc.data() });
    }
  }
  return students;
}

export async function createAssignment(data: {
  classId: string;
  teacherId: string;
  title: string;
  description: string;
  dueDate: Date;
  fileURL?: string;
}) {
  return await addDoc(collection(db, 'assignments'), {
    ...data,
    dueDate: Timestamp.fromDate(data.dueDate),
    createdAt: Timestamp.now(),
  });
}

export async function getAssignmentsByClass(classId: string) {
  const q = query(collection(db, 'assignments'), where('classId', '==', classId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function submitAssignment(data: {
  assignmentId: string;
  studentId: string;
  fileURL: string;
}) {
  return await addDoc(collection(db, 'submissions'), {
    ...data,
    submittedAt: Timestamp.now(),
    graded: false,
    marks: null,
  });
}

export async function getSubmissionsByAssignment(assignmentId: string) {
  const q = query(collection(db, 'submissions'), where('assignmentId', '==', assignmentId));
  const snapshot = await getDocs(q);

  const submissions = [];
  for (const subDoc of snapshot.docs) {
    const data = subDoc.data();
    const userDoc = await getDoc(doc(db, 'users', data.studentId));
    submissions.push({
      id: subDoc.id,
      ...data,
      studentName: userDoc.exists() ? userDoc.data().name : 'Unknown',
    });
  }
  return submissions;
}

export async function gradeSubmission(submissionId: string, marks: number) {
  const submissionRef = doc(db, 'submissions', submissionId);
  await updateDoc(submissionRef, {
    graded: true,
    marks,
    gradedAt: Timestamp.now(),
  });
}

export async function getSubmissionStatus(assignmentId: string, studentId: string) {
  const q = query(
    collection(db, 'submissions'),
    where('assignmentId', '==', assignmentId),
    where('studentId', '==', studentId)
  );
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

export async function removeStudentFromClass(classId: string, studentId: string) {
  const q = query(
    collection(db, 'classMembers'),
    where('classId', '==', classId),
    where('studentId', '==', studentId)
  );
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    await deleteDoc(doc(db, 'classMembers', snapshot.docs[0].id));
  }
}

export async function createBranch(data: {
  teacherId: string;
  branchName: string;
  description: string;
}) {
  return await addDoc(collection(db, 'branches'), {
    ...data,
    createdAt: Timestamp.now(),
  });
}

export async function getBranchesByTeacher(teacherId: string) {
  const q = query(collection(db, 'branches'), where('teacherId', '==', teacherId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createSubject(data: {
  branchId: string;
  className: string;
  subjectName: string;
  description: string;
  teacherId: string;
}) {
  const classCode = generateClassCode();
  return await addDoc(collection(db, 'subjects'), {
    ...data,
    classCode,
    createdAt: Timestamp.now(),
  });
}

export async function getSubjectsByBranch(branchId: string) {
  const q = query(collection(db, 'subjects'), where('branchId', '==', branchId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Delete a subject and its related data (members, assignments, submissions, materials)
export async function deleteSubject(subjectId: string) {
  // delete subject members
  const membersQ = query(collection(db, 'subjectMembers'), where('subjectId', '==', subjectId));
  const membersSnap = await getDocs(membersQ);
  await Promise.all(membersSnap.docs.map(d => deleteDoc(doc(db, 'subjectMembers', d.id))));

  // delete study materials
  const materialsQ = query(collection(db, 'studyMaterials'), where('subjectId', '==', subjectId));
  const materialsSnap = await getDocs(materialsQ);
  await Promise.all(materialsSnap.docs.map(d => deleteDoc(doc(db, 'studyMaterials', d.id))));

  // delete assignments and their submissions
  const assignmentsQ = query(collection(db, 'subjectAssignments'), where('subjectId', '==', subjectId));
  const assignmentsSnap = await getDocs(assignmentsQ);
  for (const a of assignmentsSnap.docs) {
    const assignmentId = a.id;
    const subsQ = query(collection(db, 'subjectSubmissions'), where('assignmentId', '==', assignmentId));
    const subsSnap = await getDocs(subsQ);
    await Promise.all(subsSnap.docs.map(s => deleteDoc(doc(db, 'subjectSubmissions', s.id))));
    await deleteDoc(doc(db, 'subjectAssignments', assignmentId));
  }

  // finally delete the subject itself
  await deleteDoc(doc(db, 'subjects', subjectId));
}

// Delete a branch and all of its subjects (and their related data)
export async function deleteBranch(branchId: string) {
  // delete all subjects under this branch (with cascade)
  const subjectsQ = query(collection(db, 'subjects'), where('branchId', '==', branchId));
  const subjectsSnap = await getDocs(subjectsQ);
  for (const s of subjectsSnap.docs) {
    await deleteSubject(s.id);
  }

  // delete the branch itself
  await deleteDoc(doc(db, 'branches', branchId));
}

export async function createStudyMaterial(data: {
  subjectId: string;
  title: string;
  description: string;
  fileURL: string;
  uploadedBy: string;
}) {
  return await addDoc(collection(db, 'studyMaterials'), {
    ...data,
    createdAt: Timestamp.now(),
  });
}

export async function getStudyMaterialsBySubject(subjectId: string) {
  const q = query(collection(db, 'studyMaterials'), where('subjectId', '==', subjectId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteStudyMaterial(materialId: string) {
  await deleteDoc(doc(db, 'studyMaterials', materialId));
}

export async function joinSubjectByCode(classCode: string, studentId: string) {
  const q = query(collection(db, 'subjects'), where('classCode', '==', classCode));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error('Invalid class code');
  }

  const subjectId = snapshot.docs[0].id;

  const memberQuery = query(
    collection(db, 'subjectMembers'),
    where('subjectId', '==', subjectId),
    where('studentId', '==', studentId)
  );
  const memberSnapshot = await getDocs(memberQuery);

  if (!memberSnapshot.empty) {
    throw new Error('Already joined this subject');
  }

  await addDoc(collection(db, 'subjectMembers'), {
    subjectId,
    studentId,
    joinedAt: Timestamp.now(),
  });

  return subjectId;
}

export async function getSubjectsByStudent(studentId: string) {
  const q = query(collection(db, 'subjectMembers'), where('studentId', '==', studentId));
  const snapshot = await getDocs(q);
  const subjectIds = snapshot.docs.map(doc => doc.data().subjectId);

  if (subjectIds.length === 0) return [];

  const subjects = [];
  for (const subjectId of subjectIds) {
    const subjectDoc = await getDoc(doc(db, 'subjects', subjectId));
    if (subjectDoc.exists()) {
      subjects.push({ id: subjectDoc.id, ...subjectDoc.data() });
    }
  }
  return subjects;
}

export async function getStudentsBySubject(subjectId: string) {
  const q = query(collection(db, 'subjectMembers'), where('subjectId', '==', subjectId));
  const snapshot = await getDocs(q);

  const students = [];
  for (const memberDoc of snapshot.docs) {
    const studentId = memberDoc.data().studentId;
    const userDoc = await getDoc(doc(db, 'users', studentId));
    if (userDoc.exists()) {
      students.push({
        id: userDoc.id,
        memberId: memberDoc.id,
        ...userDoc.data()
      });
    }
  }
  return students;
}

export async function removeStudentFromSubject(memberId: string) {
  await deleteDoc(doc(db, 'subjectMembers', memberId));
}

export async function createSubjectAssignment(data: {
  subjectId: string;
  teacherId: string;
  title: string;
  description: string;
  dueDate: Date;
  fileURL?: string;
}) {
  return await addDoc(collection(db, 'subjectAssignments'), {
    ...data,
    dueDate: Timestamp.fromDate(data.dueDate),
    createdAt: Timestamp.now(),
  });
}

export async function getAssignmentsBySubject(subjectId: string) {
  const q = query(collection(db, 'subjectAssignments'), where('subjectId', '==', subjectId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function submitSubjectAssignment(data: {
  assignmentId: string;
  studentId: string;
  fileURL: string;
}) {
  return await addDoc(collection(db, 'subjectSubmissions'), {
    ...data,
    submittedAt: Timestamp.now(),
    graded: false,
    marks: null,
  });
}

export async function getSubmissionsBySubjectAssignment(assignmentId: string) {
  const q = query(collection(db, 'subjectSubmissions'), where('assignmentId', '==', assignmentId));
  const snapshot = await getDocs(q);

  const submissions = [];
  for (const subDoc of snapshot.docs) {
    const data = subDoc.data();
    const userDoc = await getDoc(doc(db, 'users', data.studentId));
    submissions.push({
      id: subDoc.id,
      ...data,
      studentName: userDoc.exists() ? userDoc.data().name : 'Unknown',
    });
  }
  return submissions;
}

export async function gradeSubjectSubmission(submissionId: string, marks: number) {
  const submissionRef = doc(db, 'subjectSubmissions', submissionId);
  await updateDoc(submissionRef, {
    graded: true,
    marks,
    gradedAt: Timestamp.now(),
  });
}

export async function getSubjectSubmissionStatus(assignmentId: string, studentId: string) {
  const q = query(
    collection(db, 'subjectSubmissions'),
    where('assignmentId', '==', assignmentId),
    where('studentId', '==', studentId)
  );
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

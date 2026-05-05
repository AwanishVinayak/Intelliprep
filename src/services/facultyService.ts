import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Announcement, Project } from '../types';

export async function postAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>) {
  const colRef = collection(db, 'announcements');
  const docRef = await addDoc(colRef, {
    ...announcement,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getAnnouncements(role?: string) {
  const colRef = collection(db, 'announcements');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
}

export async function getStudentProjects(studentId?: string) {
  const colRef = collection(db, 'projects');
  const q = studentId ? query(colRef, where('studentId', '==', studentId)) : query(colRef);
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
}

export async function verifyProject(projectId: string) {
  const docRef = doc(db, 'projects', projectId);
  await updateDoc(docRef, { status: 'verified' });
}

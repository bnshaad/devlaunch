import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type Timestamp
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  type InternshipApplication,
  type InternshipApplicationInput
} from "@/types/application";

function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return (
    typeof value === "string" &&
    APPLICATION_STATUSES.includes(value as ApplicationStatus)
  );
}

function toApplication(id: string, data: DocumentData): InternshipApplication {
  return {
    id,
    userId: data.userId ?? "",
    company: data.company ?? "",
    role: data.role ?? "",
    location: data.location ?? "",
    jobUrl: data.jobUrl ?? "",
    source: data.source ?? "",
    status: isApplicationStatus(data.status) ? data.status : "saved",
    appliedDate: data.appliedDate ?? "",
    deadline: data.deadline ?? "",
    notes: data.notes ?? "",
    createdAt: data.createdAt as Timestamp | undefined,
    updatedAt: data.updatedAt as Timestamp | undefined
  };
}

function normalizeApplicationInput(
  data: InternshipApplicationInput
): InternshipApplicationInput {
  if (!isApplicationStatus(data.status)) {
    throw new Error("Choose a valid application status.");
  }

  return {
    company: data.company.trim(),
    role: data.role.trim(),
    location: data.location?.trim() ?? "",
    jobUrl: data.jobUrl?.trim() ?? "",
    source: data.source?.trim() ?? "",
    status: data.status,
    appliedDate: data.appliedDate?.trim() ?? "",
    deadline: data.deadline?.trim() ?? "",
    notes: data.notes?.trim() ?? ""
  };
}

function assertCurrentUserOwnsApplications(userId: string) {
  const currentUserId = auth.currentUser?.uid;

  if (!currentUserId) {
    throw new Error("You must be signed in to manage applications.");
  }

  if (currentUserId !== userId) {
    throw new Error("You can only manage your own applications.");
  }
}

function sortApplications(applications: InternshipApplication[]) {
  return applications.sort((firstApplication, secondApplication) => {
    const firstUpdatedAt = firstApplication.updatedAt?.toMillis?.() ?? 0;
    const secondUpdatedAt = secondApplication.updatedAt?.toMillis?.() ?? 0;

    return secondUpdatedAt - firstUpdatedAt;
  });
}

export async function createApplication(
  userId: string,
  data: InternshipApplicationInput
) {
  assertCurrentUserOwnsApplications(userId);

  const normalizedData = normalizeApplicationInput(data);
  const applicationRef = doc(collection(db, "applications"));

  await setDoc(applicationRef, {
    ...normalizedData,
    id: applicationRef.id,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return getApplicationById(applicationRef.id);
}

export async function getApplicationsByUser(userId: string) {
  const applicationsSnapshot = await getDocs(
    query(collection(db, "applications"), where("userId", "==", userId))
  );
  const applications = applicationsSnapshot.docs.map((applicationDoc) =>
    toApplication(applicationDoc.id, applicationDoc.data())
  );

  return sortApplications(applications);
}

export async function getApplicationById(applicationId: string) {
  const applicationSnapshot = await getDoc(
    doc(db, "applications", applicationId)
  );

  if (!applicationSnapshot.exists()) {
    return null;
  }

  return toApplication(applicationSnapshot.id, applicationSnapshot.data());
}

export async function updateApplication(
  applicationId: string,
  userId: string,
  data: InternshipApplicationInput
) {
  assertCurrentUserOwnsApplications(userId);

  const applicationRef = doc(db, "applications", applicationId);
  const existingApplication = await getApplicationById(applicationId);

  if (!existingApplication) {
    throw new Error("Application was not found.");
  }

  if (existingApplication.userId !== userId) {
    throw new Error("You can only edit your own applications.");
  }

  await updateDoc(applicationRef, {
    ...normalizeApplicationInput(data),
    updatedAt: serverTimestamp()
  });

  return getApplicationById(applicationId);
}

export async function deleteApplication(applicationId: string, userId: string) {
  assertCurrentUserOwnsApplications(userId);

  const existingApplication = await getApplicationById(applicationId);

  if (!existingApplication) {
    throw new Error("Application was not found.");
  }

  if (existingApplication.userId !== userId) {
    throw new Error("You can only delete your own applications.");
  }

  await deleteDoc(doc(db, "applications", applicationId));
}

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
import { type Project, type ProjectInput } from "@/types/project";

function toProject(id: string, data: DocumentData): Project {
  return {
    id,
    userId: data.userId ?? "",
    title: data.title ?? "",
    description: data.description ?? "",
    techStack: Array.isArray(data.techStack) ? data.techStack : [],
    githubUrl: data.githubUrl ?? "",
    liveUrl: data.liveUrl ?? "",
    imageUrl: data.imageUrl ?? "",
    featured: Boolean(data.featured),
    createdAt: data.createdAt as Timestamp | undefined,
    updatedAt: data.updatedAt as Timestamp | undefined
  };
}

function normalizeProjectInput(data: ProjectInput): ProjectInput {
  const title = data.title.trim();
  const description = data.description.trim();
  const githubUrl = data.githubUrl?.trim() ?? "";
  const liveUrl = data.liveUrl?.trim() ?? "";
  const imageUrl = data.imageUrl?.trim() ?? "";

  if (title.length < 3) {
    throw new Error("Title must be at least 3 characters.");
  }

  if (description.length < 10) {
    throw new Error("Description must be at least 10 characters.");
  }

  if (
    !isOptionalHttpUrl(githubUrl) ||
    !isOptionalHttpUrl(liveUrl) ||
    !isOptionalHttpUrl(imageUrl)
  ) {
    throw new Error("Project URLs must start with http:// or https://.");
  }

  return {
    title,
    description,
    techStack: Array.isArray(data.techStack)
      ? data.techStack
          .map((tech) => tech.trim())
          .filter(
            (tech, index, techStack) =>
              tech &&
              techStack.findIndex(
                (candidate) => candidate.toLowerCase() === tech.toLowerCase()
              ) === index
          )
          .slice(0, 20)
      : [],
    githubUrl,
    liveUrl,
    imageUrl,
    featured: Boolean(data.featured)
  };
}

function isOptionalHttpUrl(value: string) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function assertCurrentUserOwnsProjects(userId: string) {
  const currentUserId = auth.currentUser?.uid;

  if (!currentUserId) {
    throw new Error("You must be signed in to manage projects.");
  }

  if (currentUserId !== userId) {
    throw new Error("You can only manage your own projects.");
  }
}

function sortProjects(projects: Project[]) {
  return projects.sort((firstProject, secondProject) => {
    if (firstProject.featured !== secondProject.featured) {
      return firstProject.featured ? -1 : 1;
    }

    const firstUpdatedAt = firstProject.updatedAt?.toMillis?.() ?? 0;
    const secondUpdatedAt = secondProject.updatedAt?.toMillis?.() ?? 0;

    return secondUpdatedAt - firstUpdatedAt;
  });
}

export async function createProject(userId: string, data: ProjectInput) {
  assertCurrentUserOwnsProjects(userId);

  const normalizedData = normalizeProjectInput(data);

  if (!normalizedData.techStack.length) {
    throw new Error("Add at least one technology.");
  }

  const projectRef = doc(collection(db, "projects"));

  await setDoc(projectRef, {
    ...normalizedData,
    id: projectRef.id,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return getProjectById(projectRef.id);
}

export async function getProjectsByUser(userId: string) {
  const projectsSnapshot = await getDocs(
    query(collection(db, "projects"), where("userId", "==", userId))
  );
  const projects = projectsSnapshot.docs.map((projectDoc) =>
    toProject(projectDoc.id, projectDoc.data())
  );

  return sortProjects(projects);
}

export async function getProjectById(projectId: string) {
  const projectSnapshot = await getDoc(doc(db, "projects", projectId));

  if (!projectSnapshot.exists()) {
    return null;
  }

  return toProject(projectSnapshot.id, projectSnapshot.data());
}

export async function getProjectByIdForUser(projectId: string, userId: string) {
  assertCurrentUserOwnsProjects(userId);

  const project = await getProjectById(projectId);

  if (!project) {
    return null;
  }

  if (project.userId !== userId) {
    throw new Error("You can only view your own projects.");
  }

  return project;
}

export async function getFeaturedProjectsByUser(userId: string) {
  const projects = await getProjectsByUser(userId);

  return projects.filter((project) => project.featured);
}

export async function updateProject(
  projectId: string,
  userId: string,
  data: ProjectInput
) {
  assertCurrentUserOwnsProjects(userId);

  const projectRef = doc(db, "projects", projectId);
  const existingProject = await getProjectById(projectId);

  if (!existingProject) {
    throw new Error("Project was not found.");
  }

  if (existingProject.userId !== userId) {
    throw new Error("You can only edit your own projects.");
  }

  const normalizedData = normalizeProjectInput(data);

  if (!normalizedData.techStack.length) {
    throw new Error("Add at least one technology.");
  }

  await updateDoc(projectRef, {
    ...normalizedData,
    updatedAt: serverTimestamp()
  });

  return getProjectById(projectId);
}

export async function deleteProject(projectId: string, userId: string) {
  assertCurrentUserOwnsProjects(userId);

  const existingProject = await getProjectById(projectId);

  if (!existingProject) {
    throw new Error("Project was not found.");
  }

  if (existingProject.userId !== userId) {
    throw new Error("You can only delete your own projects.");
  }

  await deleteDoc(doc(db, "projects", projectId));
}

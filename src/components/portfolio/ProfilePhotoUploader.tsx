"use client";

/* eslint-disable @next/next/no-img-element */

import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  removeProfilePhoto,
  uploadProfilePhoto,
  validateProfilePhotoFile
} from "@/lib/profilePhoto";
import { type AppUser } from "@/types/user";
import { Button } from "@/components/ui/button";
import { WarmCard } from "@/components/shared/WarmCard";

type ProfilePhotoUploaderProps = {
  user: AppUser;
  displayName: string;
  onPhotoChanged: () => Promise<void>;
};

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2);

  return initials || "DL";
}

function formatFileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ProfilePhotoUploader({
  displayName,
  onPhotoChanged,
  user
}: ProfilePhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [operation, setOperation] = useState<"uploading" | "removing" | null>(
    null
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [uploadedPhotoPublicId, setUploadedPhotoPublicId] = useState<
    string | null
  >(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const savedPhotoUrl = photoRemoved ? "" : user.photoURL;
  const avatarUrl = previewUrl || uploadedPhotoUrl || savedPhotoUrl;
  const activePhotoPublicId = photoRemoved
    ? ""
    : uploadedPhotoPublicId || user.photoPublicId;
  const hasSavedPhoto = Boolean(
    !photoRemoved && (user.photoURL || user.photoPublicId || uploadedPhotoUrl)
  );
  const isSaving = operation !== null;

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function setNextPreviewUrl(url: string | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    previewUrlRef.current = url;
    setPreviewUrl(url);
  }

  function clearSelection() {
    setSelectedFile(null);
    setNextPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setMessage(null);
    setError(null);

    if (!file) {
      clearSelection();
      return;
    }

    const validationError = validateProfilePhotoFile(file);

    if (validationError) {
      clearSelection();
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    setNextPreviewUrl(URL.createObjectURL(file));
  }

  async function handleUpload() {
    if (!selectedFile || isSaving) {
      return;
    }

    setOperation("uploading");
    setMessage(null);
    setError(null);

    try {
      const result = await uploadProfilePhoto(selectedFile);
      setPhotoRemoved(false);
      setUploadedPhotoUrl(result.photoURL);
      setUploadedPhotoPublicId(result.photoPublicId);
      clearSelection();
      setMessage("Profile photo updated.");
      onPhotoChanged().catch((refreshError) => {
        console.warn("Profile photo refresh failed:", refreshError);
      });
    } catch (uploadError) {
      console.error("Profile photo upload failed:", uploadError);
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload your profile photo right now."
      );
    } finally {
      setOperation(null);
    }
  }

  async function handleRemove() {
    if (!hasSavedPhoto || isSaving) {
      return;
    }

    setOperation("removing");
    setMessage(null);
    setError(null);

    try {
      await removeProfilePhoto(activePhotoPublicId);
      setPhotoRemoved(true);
      setUploadedPhotoUrl(null);
      setUploadedPhotoPublicId(null);
      clearSelection();
      setMessage("Profile photo removed.");
      onPhotoChanged().catch((refreshError) => {
        console.warn("Profile photo refresh failed:", refreshError);
      });
    } catch (removeError) {
      console.error("Profile photo removal failed:", removeError);
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Unable to remove your profile photo right now."
      );
    } finally {
      setOperation(null);
    }
  }

  return (
    <WarmCard className="mb-8 w-full overflow-hidden rounded-3xl p-6 sm:p-8">
      <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start">
        <div className="h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-sahara-border/70 bg-sahara-surfaceLow sm:h-36 sm:w-36">
          {avatarUrl ? (
            <img
              alt={`${displayName} profile photo preview`}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              src={avatarUrl}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-serif text-4xl font-bold text-sahara-primary">
              {getInitials(displayName)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold uppercase tracking-wide text-sahara-muted">
            Profile photo
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-sahara-muted">
            Upload a JPG, PNG, or WEBP image up to 2 MB.
          </p>
          {selectedFile ? (
            <p
              className="mt-3 max-w-full truncate rounded-lg border border-sahara-border/60 bg-sahara-surfaceLow px-3 py-2 text-xs font-semibold text-sahara-primary"
              title={`${selectedFile.name} (${formatFileSize(selectedFile.size)})`}
            >
              Previewing {selectedFile.name} ({formatFileSize(selectedFile.size)})
            </p>
          ) : null}
          {message ? (
            <p className="mt-3 max-w-full break-words rounded-lg border border-green-700/20 bg-green-50 px-3 py-2 text-sm font-semibold text-green-800">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="mt-3 max-w-full break-words rounded-lg border border-sahara-tertiary/25 bg-sahara-tertiary/10 px-3 py-2 text-sm font-semibold leading-6 text-sahara-tertiary">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <label className="min-w-0">
          <input
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={isSaving}
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
          <span className="inline-flex h-11 w-full min-w-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-sahara-border/80 bg-transparent px-4 py-2 text-sm font-semibold text-sahara-text transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-sahara-surfaceLow">
            <ImageIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span className="truncate">Choose Image</span>
          </span>
        </label>

        <Button
          className="w-full min-w-0 px-4"
          disabled={!selectedFile || isSaving}
          onClick={handleUpload}
        >
          {operation === "uploading" ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 shrink-0 animate-spin" />
          ) : (
            <Upload aria-hidden="true" className="h-4 w-4 shrink-0" />
          )}
          <span className="truncate">
            {operation === "uploading" ? "Uploading..." : "Upload Photo"}
          </span>
        </Button>

        <Button
          className="w-full min-w-0 px-4 sm:col-span-2 xl:col-span-1"
          disabled={!hasSavedPhoto || isSaving}
          onClick={handleRemove}
          variant="secondary"
        >
          {operation === "removing" ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 shrink-0 animate-spin" />
          ) : (
            <Trash2 aria-hidden="true" className="h-4 w-4 shrink-0" />
          )}
          <span className="truncate">
            {operation === "removing" ? "Removing..." : "Remove Photo"}
          </span>
        </Button>
      </div>
    </WarmCard>
  );
}

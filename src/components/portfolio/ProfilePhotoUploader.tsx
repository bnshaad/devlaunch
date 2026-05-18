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
  const avatarUrl = previewUrl || user.photoURL;
  const hasSavedPhoto = Boolean(user.photoURL || user.photoPath);
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
      await uploadProfilePhoto(selectedFile, user.photoPath);
      await onPhotoChanged();
      clearSelection();
      setMessage("Profile photo updated.");
    } catch (uploadError) {
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
      await removeProfilePhoto(user.photoPath);
      await onPhotoChanged();
      clearSelection();
      setMessage("Profile photo removed.");
    } catch (removeError) {
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
    <WarmCard className="mb-6 p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-sahara-border/70 bg-sahara-surfaceLow">
          {avatarUrl ? (
            <img
              alt={`${displayName} profile photo preview`}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              src={avatarUrl}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-serif text-3xl font-bold text-sahara-primary">
              {getInitials(displayName)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-sahara-text">
            Profile photo
          </p>
          <p className="mt-2 text-sm leading-6 text-sahara-muted">
            Upload a JPG, PNG, or WEBP image up to 2 MB.
          </p>
          {selectedFile ? (
            <p className="mt-2 truncate text-xs font-semibold text-sahara-primary">
              Previewing {selectedFile.name} ({formatFileSize(selectedFile.size)})
            </p>
          ) : null}
          {message ? (
            <p className="mt-3 text-sm font-semibold text-green-800">{message}</p>
          ) : null}
          {error ? (
            <p className="mt-3 text-sm font-semibold text-sahara-tertiary">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label className="inline-flex">
          <input
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={isSaving}
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
          <span className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-sahara-border/80 bg-transparent px-5 py-2 text-sm font-semibold text-sahara-text transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-sahara-surfaceLow">
            <ImageIcon aria-hidden="true" className="h-4 w-4" />
            Choose Image
          </span>
        </label>

        <Button disabled={!selectedFile || isSaving} onClick={handleUpload}>
          {operation === "uploading" ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <Upload aria-hidden="true" className="h-4 w-4" />
          )}
          {operation === "uploading" ? "Uploading..." : "Upload Photo"}
        </Button>

        <Button
          disabled={!hasSavedPhoto || isSaving}
          onClick={handleRemove}
          variant="secondary"
        >
          {operation === "removing" ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 aria-hidden="true" className="h-4 w-4" />
          )}
          {operation === "removing" ? "Removing..." : "Remove Photo"}
        </Button>
      </div>
    </WarmCard>
  );
}

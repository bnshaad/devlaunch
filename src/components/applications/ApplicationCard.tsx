"use client";

import {
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  MapPin,
  PencilLine,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { type MouseEvent } from "react";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { WarmCard } from "@/components/shared/WarmCard";
import { buttonVariants } from "@/components/ui/button";
import { type InternshipApplication } from "@/types/application";

type ApplicationCardProps = {
  application: InternshipApplication;
  isDeleting?: boolean;
  onDelete: (application: InternshipApplication) => void;
};

function safeExternalUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  try {
    const url = new URL(trimmedValue);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

function formatDate(value: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

export function ApplicationCard({
  application,
  isDeleting = false,
  onDelete
}: ApplicationCardProps) {
  const jobUrl = safeExternalUrl(application.jobUrl);
  const appliedDate = formatDate(application.appliedDate);
  const deadline = formatDate(application.deadline);

  function handleDeleteClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onDelete(application);
  }

  return (
    <WarmCard className="flex h-full flex-col p-6 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-sahara-muted">
            <BriefcaseBusiness aria-hidden="true" className="h-4 w-4" />
            {application.company}
          </p>
          <h3 className="mt-2 font-serif text-3xl font-bold leading-tight text-sahara-text">
            {application.role}
          </h3>
        </div>
        <ApplicationStatusBadge
          className="self-start"
          status={application.status}
        />
      </div>

      <div className="mt-5 grid gap-3 text-sm leading-6 text-sahara-muted">
        {application.location ? (
          <p className="flex items-center gap-2">
            <MapPin aria-hidden="true" className="h-4 w-4 text-sahara-primary" />
            {application.location}
          </p>
        ) : null}
        {application.source ? (
          <p>
            <span className="font-semibold text-sahara-text">Source:</span>{" "}
            {application.source}
          </p>
        ) : null}
        {appliedDate || deadline ? (
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {appliedDate ? (
              <p className="flex items-center gap-2">
                <CalendarDays
                  aria-hidden="true"
                  className="h-4 w-4 text-sahara-primary"
                />
                Applied {appliedDate}
              </p>
            ) : null}
            {deadline ? (
              <p className="flex items-center gap-2">
                <CalendarDays
                  aria-hidden="true"
                  className="h-4 w-4 text-sahara-primary"
                />
                Deadline {deadline}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {application.notes ? (
        <p className="mt-5 line-clamp-4 text-sm leading-7 text-sahara-muted">
          {application.notes}
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-3 pt-7">
        <Link
          className={buttonVariants({ size: "sm", variant: "primary" })}
          href={`/dashboard/applications/${application.id}/edit`}
        >
          <PencilLine aria-hidden="true" className="h-4 w-4" />
          Edit
        </Link>
        <button
          className={buttonVariants({ size: "sm", variant: "secondary" })}
          disabled={isDeleting}
          onClick={handleDeleteClick}
          type="button"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
        {jobUrl ? (
          <a
            className={buttonVariants({ size: "sm", variant: "ghost" })}
            href={jobUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
            Job post
          </a>
        ) : null}
      </div>
    </WarmCard>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  APPLICATION_STATUSES,
  type InternshipApplicationInput
} from "@/types/application";

const urlSchema = z.string().trim().url();

function optionalUrl(message: string) {
  return z
    .string()
    .trim()
    .refine(
      (value) => value === "" || urlSchema.safeParse(value).success,
      message
    );
}

const applicationFormSchema = z.object({
  company: z
    .string()
    .trim()
    .min(2, "Company must be at least 2 characters.")
    .max(100, "Company must be 100 characters or fewer."),
  role: z
    .string()
    .trim()
    .min(2, "Role must be at least 2 characters.")
    .max(120, "Role must be 120 characters or fewer."),
  location: z.string().trim().max(100, "Location must be 100 characters or fewer."),
  jobUrl: optionalUrl("Enter a valid job URL, including https://"),
  source: z.string().trim().max(80, "Source must be 80 characters or fewer."),
  status: z.enum(APPLICATION_STATUSES),
  appliedDate: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Use the YYYY-MM-DD format."
    ),
  deadline: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Use the YYYY-MM-DD format."
    ),
  notes: z.string().trim().max(1000, "Notes must be 1000 characters or fewer.")
});

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

type ApplicationFormProps = {
  defaultValues: InternshipApplicationInput;
  onSubmit: (values: InternshipApplicationInput) => Promise<void>;
  submitLabel?: string;
};

const fieldClassName =
  "min-h-11 rounded-lg border border-sahara-border bg-white px-3 py-2 text-sm text-sahara-text outline-none transition placeholder:text-sahara-muted/70 focus:border-sahara-primary focus:ring-2 focus:ring-sahara-primary/15";

const statusLabels = {
  saved: "Saved",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected"
} satisfies Record<InternshipApplicationInput["status"], string>;

function normalizeValues(
  values: ApplicationFormValues
): InternshipApplicationInput {
  return {
    company: values.company,
    role: values.role,
    location: values.location,
    jobUrl: values.jobUrl,
    source: values.source,
    status: values.status,
    appliedDate: values.appliedDate,
    deadline: values.deadline,
    notes: values.notes
  };
}

export function ApplicationForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save Application"
}: ApplicationFormProps) {
  const {
    appliedDate,
    company,
    deadline,
    jobUrl,
    location,
    notes,
    role,
    source,
    status
  } = defaultValues;
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    control
  } = useForm<ApplicationFormValues>({
    defaultValues,
    resolver: zodResolver(applicationFormSchema)
  });
  const watchedValues = useWatch({ control });

  useEffect(() => {
    reset({
      appliedDate,
      company,
      deadline,
      jobUrl,
      location,
      notes,
      role,
      source,
      status
    });
  }, [
    appliedDate,
    company,
    deadline,
    jobUrl,
    location,
    notes,
    reset,
    role,
    source,
    status
  ]);

  async function submitForm(values: ApplicationFormValues) {
    if (isSubmitting) {
      return;
    }

    await onSubmit(normalizeValues(values));
  }

  return (
    <form className="space-y-8" noValidate onSubmit={handleSubmit(submitForm)}>
      <section className="rounded-2xl border border-sahara-border/60 bg-sahara-surface p-6 shadow-warm sm:p-8">
        <div>
          <h2 className="font-serif text-3xl font-bold text-sahara-text">
            Opportunity details
          </h2>
          <p className="mt-2 text-sm leading-6 text-sahara-muted">
            Capture the company, role, and current stage of the application.
          </p>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <FormFieldError
            error={errors.company?.message}
            id="company"
            label="Company"
          >
            <input
              className={`${fieldClassName} mt-2 w-full`}
              id="company"
              placeholder="Vercel"
              {...register("company")}
            />
          </FormFieldError>

          <FormFieldError error={errors.role?.message} id="role" label="Role">
            <input
              className={`${fieldClassName} mt-2 w-full`}
              id="role"
              placeholder="Frontend Engineering Intern"
              {...register("role")}
            />
          </FormFieldError>

          <FormFieldError
            error={errors.location?.message}
            id="location"
            label="Location"
          >
            <input
              className={`${fieldClassName} mt-2 w-full`}
              id="location"
              placeholder="Remote or San Francisco, CA"
              {...register("location")}
            />
          </FormFieldError>

          <FormFieldError
            error={errors.status?.message}
            id="status"
            label="Status"
          >
            <select
              className={`${fieldClassName} mt-2 w-full`}
              id="status"
              {...register("status")}
            >
              {APPLICATION_STATUSES.map((applicationStatus) => (
                <option key={applicationStatus} value={applicationStatus}>
                  {statusLabels[applicationStatus]}
                </option>
              ))}
            </select>
          </FormFieldError>
        </div>
      </section>

      <section className="rounded-2xl border border-sahara-border/60 bg-sahara-surface p-6 shadow-warm sm:p-8">
        <div>
          <h2 className="font-serif text-3xl font-bold text-sahara-text">
            Links and timeline
          </h2>
          <p className="mt-2 text-sm leading-6 text-sahara-muted">
            Optional fields can stay blank until you need them.
          </p>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <FormFieldError
            error={errors.jobUrl?.message}
            id="jobUrl"
            label="Job URL"
          >
            <input
              className={`${fieldClassName} mt-2 w-full`}
              id="jobUrl"
              placeholder="https://company.com/careers/internship"
              {...register("jobUrl")}
            />
          </FormFieldError>

          <FormFieldError error={errors.source?.message} id="source" label="Source">
            <input
              className={`${fieldClassName} mt-2 w-full`}
              id="source"
              placeholder="LinkedIn, referral, campus board"
              {...register("source")}
            />
          </FormFieldError>

          <FormFieldError
            error={errors.appliedDate?.message}
            id="appliedDate"
            label="Applied date"
          >
            <input
              className={`${fieldClassName} mt-2 w-full`}
              id="appliedDate"
              type="date"
              {...register("appliedDate")}
            />
          </FormFieldError>

          <FormFieldError
            error={errors.deadline?.message}
            id="deadline"
            label="Deadline"
          >
            <input
              className={`${fieldClassName} mt-2 w-full`}
              id="deadline"
              type="date"
              {...register("deadline")}
            />
          </FormFieldError>
        </div>
      </section>

      <section className="rounded-2xl border border-sahara-border/60 bg-sahara-surface p-6 shadow-warm sm:p-8">
        <div>
          <h2 className="font-serif text-3xl font-bold text-sahara-text">
            Notes
          </h2>
          <p className="mt-2 text-sm leading-6 text-sahara-muted">
            Keep role context, follow-up plans, and interview prep in one place.
          </p>
        </div>

        <div className="mt-7">
          <label className="text-sm font-semibold text-sahara-text" htmlFor="notes">
            Notes
          </label>
          <textarea
            className={`${fieldClassName} mt-2 min-h-40 w-full resize-y leading-6`}
            id="notes"
            placeholder="Recruiter contact, portfolio angle, interview prep, or follow-up reminders."
            {...register("notes")}
          />
          <p className="mt-2 text-xs text-sahara-muted">
            {watchedValues.notes?.length ?? 0}/1000 characters
          </p>
          {errors.notes ? (
            <p className="mt-2 text-sm font-medium text-sahara-tertiary">
              {errors.notes.message}
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex justify-end">
          <Button disabled={isSubmitting} type="submit">
            <Save aria-hidden="true" className="h-4 w-4" />
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </section>
    </form>
  );
}

function FormFieldError({
  children,
  error,
  id,
  label
}: {
  children: ReactNode;
  error?: string;
  id: string;
  label: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-sahara-text" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-2 text-sm font-medium text-sahara-tertiary">{error}</p>
      ) : null}
    </div>
  );
}

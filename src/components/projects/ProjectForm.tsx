"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { TechStackInput } from "@/components/projects/TechStackInput";
import { Button } from "@/components/ui/button";
import { type ProjectInput } from "@/types/project";

const httpUrlSchema = z
  .string()
  .trim()
  .url()
  .refine((value) => {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  });

function optionalUrl(message: string) {
  return z
    .string()
    .trim()
    .refine(
      (value) => value === "" || httpUrlSchema.safeParse(value).success,
      message
    );
}

const projectFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(100, "Title must be 100 characters or fewer."),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters.")
    .max(500, "Description must be 500 characters or fewer."),
  techStack: z
    .array(z.string().trim().max(30))
    .min(1, "Add at least one technology.")
    .max(20, "Add 20 technologies or fewer."),
  githubUrl: optionalUrl("Enter a valid GitHub URL, including https://"),
  liveUrl: optionalUrl("Enter a valid live demo URL, including https://"),
  imageUrl: optionalUrl("Enter a valid image URL, including https://"),
  featured: z.boolean()
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

type ProjectFormProps = {
  defaultValues: ProjectInput;
  submitLabel?: string;
  onSubmit: (values: ProjectInput) => Promise<void>;
};

const fieldClassName =
  "min-h-11 rounded-lg border border-sahara-border bg-white px-3 py-2 text-sm text-sahara-text outline-none transition placeholder:text-sahara-muted/70 focus:border-sahara-primary focus:ring-2 focus:ring-sahara-primary/15";

function normalizeValues(values: ProjectFormValues): ProjectInput {
  return {
    title: values.title,
    description: values.description,
    techStack: values.techStack,
    githubUrl: values.githubUrl,
    liveUrl: values.liveUrl,
    imageUrl: values.imageUrl,
    featured: values.featured
  };
}

export function ProjectForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save Project"
}: ProjectFormProps) {
  const {
    description,
    featured,
    githubUrl,
    imageUrl,
    liveUrl,
    techStack,
    title
  } = defaultValues;
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset
  } = useForm<ProjectFormValues>({
    defaultValues,
    resolver: zodResolver(projectFormSchema)
  });
  const [isSaving, setIsSaving] = useState(false);
  const watchedValues = useWatch({ control });

  useEffect(() => {
    reset({
      title,
      description,
      techStack,
      githubUrl,
      liveUrl,
      imageUrl,
      featured
    });
  }, [
    description,
    featured,
    githubUrl,
    imageUrl,
    liveUrl,
    reset,
    techStack,
    title
  ]);

  async function submitForm(values: ProjectFormValues) {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      await onSubmit(normalizeValues(values));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="space-y-8" noValidate onSubmit={handleSubmit(submitForm)}>
      <section className="rounded-2xl border border-sahara-border/60 bg-sahara-surface p-6 shadow-warm sm:p-8">
        <div>
          <h2 className="font-serif text-3xl font-bold text-sahara-text">
            Project story
          </h2>
          <p className="mt-2 text-sm leading-6 text-sahara-muted">
            Describe what the project does, how it was built, and why it matters.
          </p>
        </div>

        <div className="mt-7 grid gap-5">
          <FormFieldError error={errors.title?.message} id="title" label="Title">
            <input
              className={`${fieldClassName} mt-2 w-full`}
              id="title"
              placeholder="Campus marketplace"
              {...register("title")}
            />
          </FormFieldError>

          <div>
            <label
              className="text-sm font-semibold text-sahara-text"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              className={`${fieldClassName} mt-2 min-h-36 w-full resize-y leading-6`}
              id="description"
              placeholder="A marketplace that helps students exchange books, notes, and supplies across campus."
              {...register("description")}
            />
            <p className="mt-2 text-xs text-sahara-muted">
              {watchedValues.description?.length ?? 0}/500 characters
            </p>
            {errors.description ? (
              <p className="mt-2 text-sm font-medium text-sahara-tertiary">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <Controller
            control={control}
            name="techStack"
            render={({ field }) => (
              <div>
                <TechStackInput onChange={field.onChange} techStack={field.value} />
                {errors.techStack ? (
                  <p className="mt-2 text-sm font-medium text-sahara-tertiary">
                    {errors.techStack.message}
                  </p>
                ) : null}
              </div>
            )}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-sahara-border/60 bg-sahara-surface p-6 shadow-warm sm:p-8">
        <div>
          <h2 className="font-serif text-3xl font-bold text-sahara-text">
            Links and media
          </h2>
          <p className="mt-2 text-sm leading-6 text-sahara-muted">
            Optional links stay hidden when left empty.
          </p>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <FormFieldError
            error={errors.githubUrl?.message}
            id="githubUrl"
            label="GitHub URL"
          >
            <input
              className={`${fieldClassName} mt-2 w-full`}
              id="githubUrl"
              placeholder="https://github.com/username/project"
              {...register("githubUrl")}
            />
          </FormFieldError>

          <FormFieldError
            error={errors.liveUrl?.message}
            id="liveUrl"
            label="Live URL"
          >
            <input
              className={`${fieldClassName} mt-2 w-full`}
              id="liveUrl"
              placeholder="https://project-demo.dev"
              {...register("liveUrl")}
            />
          </FormFieldError>

          <div className="md:col-span-2">
            <FormFieldError
              error={errors.imageUrl?.message}
              id="imageUrl"
              label="Image URL"
            >
              <input
                className={`${fieldClassName} mt-2 w-full`}
                id="imageUrl"
                placeholder="https://example.com/project-cover.png"
                {...register("imageUrl")}
              />
            </FormFieldError>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-sahara-border/60 bg-sahara-background p-5">
          <label className="flex items-start gap-3">
            <input
              className="mt-1 h-4 w-4 rounded border-sahara-border text-sahara-primary focus:ring-sahara-primary/30"
              type="checkbox"
              {...register("featured")}
            />
            <span>
              <span className="block text-sm font-semibold text-sahara-text">
                Feature this project
              </span>
              <span className="mt-1 block text-sm leading-6 text-sahara-muted">
                Featured projects appear first on your dashboard and public portfolio.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-8 flex justify-end">
          <Button disabled={isSaving} type="submit">
            <Save aria-hidden="true" className="h-4 w-4" />
            {isSaving ? "Saving..." : submitLabel}
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

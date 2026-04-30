"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { SkillInput } from "@/components/portfolio/SkillInput";
import { Button } from "@/components/ui/button";
import { type PortfolioInput } from "@/types/portfolio";

const emailSchema = z.string().trim().email();
const urlSchema = z.string().trim().url();

function optionalTextUrl(message: string) {
  return z
    .string()
    .trim()
    .refine(
      (value) => value === "" || urlSchema.safeParse(value).success,
      message
    );
}

const optionalEmailSchema = z
  .string()
  .trim()
  .refine(
    (value) => !value || emailSchema.safeParse(value).success,
    "Enter a valid email address."
  );

const optionalUrlSchema = optionalTextUrl(
  "Enter a valid URL, including https://"
);

const portfolioFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(80, "Full name must be 80 characters or fewer."),
  headline: z
    .string()
    .trim()
    .min(3, "Headline must be at least 3 characters.")
    .max(100, "Headline must be 100 characters or fewer."),
  bio: z.string().trim().max(500, "Bio must be 500 characters or fewer."),
  location: z
    .string()
    .trim()
    .max(80, "Location must be 80 characters or fewer."),
  email: optionalEmailSchema,
  githubUrl: optionalUrlSchema,
  linkedinUrl: optionalUrlSchema,
  websiteUrl: optionalUrlSchema,
  skills: z.array(z.string().trim().max(30)).max(20),
  isPublic: z.boolean()
});

export type PortfolioFormValues = z.infer<typeof portfolioFormSchema>;

type PortfolioFormProps = {
  defaultValues: PortfolioInput;
  onSubmit: (values: PortfolioInput) => Promise<void>;
  onValuesChange?: (values: PortfolioInput) => void;
};

const fieldClassName =
  "min-h-11 rounded-lg border border-sahara-border bg-white px-3 py-2 text-sm text-sahara-text outline-none transition placeholder:text-sahara-muted/70 focus:border-sahara-primary focus:ring-2 focus:ring-sahara-primary/15";

function normalizeValues(values: PortfolioFormValues): PortfolioInput {
  return {
    fullName: values.fullName,
    headline: values.headline,
    bio: values.bio,
    location: values.location,
    email: values.email,
    githubUrl: values.githubUrl,
    linkedinUrl: values.linkedinUrl,
    websiteUrl: values.websiteUrl,
    skills: values.skills,
    isPublic: values.isPublic
  };
}

export function PortfolioForm({
  defaultValues,
  onSubmit,
  onValuesChange
}: PortfolioFormProps) {
  const {
    bio,
    email,
    fullName,
    githubUrl,
    headline,
    isPublic,
    linkedinUrl,
    location,
    skills,
    websiteUrl
  } = defaultValues;
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset
  } = useForm<PortfolioFormValues>({
    defaultValues,
    resolver: zodResolver(portfolioFormSchema)
  });

  const watchedValues = useWatch({ control });

  useEffect(() => {
    reset({
      fullName,
      headline,
      bio,
      location,
      email,
      githubUrl,
      linkedinUrl,
      websiteUrl,
      skills,
      isPublic
    });
  }, [
    bio,
    email,
    fullName,
    githubUrl,
    headline,
    isPublic,
    linkedinUrl,
    location,
    reset,
    skills,
    websiteUrl
  ]);

  useEffect(() => {
    onValuesChange?.(
      normalizeValues({
        fullName: watchedValues.fullName ?? "",
        headline: watchedValues.headline ?? "",
        bio: watchedValues.bio ?? "",
        location: watchedValues.location ?? "",
        email: watchedValues.email ?? "",
        githubUrl: watchedValues.githubUrl ?? "",
        linkedinUrl: watchedValues.linkedinUrl ?? "",
        websiteUrl: watchedValues.websiteUrl ?? "",
        skills: watchedValues.skills ?? [],
        isPublic: watchedValues.isPublic ?? false
      })
    );
  }, [onValuesChange, watchedValues]);

  async function submitForm(values: PortfolioFormValues) {
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
            Story
          </h2>
          <p className="mt-2 text-sm leading-6 text-sahara-muted">
            Shape the first details recruiters see on your portfolio.
          </p>
        </div>

        <div className="mt-7 grid gap-5">
          <div>
            <label
              className="text-sm font-semibold text-sahara-text"
              htmlFor="fullName"
            >
              Full name
            </label>
            <input
              className={`${fieldClassName} mt-2 w-full`}
              id="fullName"
              placeholder="Your public display name"
              {...register("fullName")}
            />
            <p className="mt-2 text-xs leading-5 text-sahara-muted">
              This name appears on your public portfolio.
            </p>
            {errors.fullName ? (
              <p className="mt-2 text-sm font-medium text-sahara-tertiary">
                {errors.fullName.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              className="text-sm font-semibold text-sahara-text"
              htmlFor="headline"
            >
              Headline
            </label>
            <input
              className={`${fieldClassName} mt-2 w-full`}
              id="headline"
              placeholder="Frontend developer building calm, useful interfaces"
              {...register("headline")}
            />
            {errors.headline ? (
              <p className="mt-2 text-sm font-medium text-sahara-tertiary">
                {errors.headline.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-semibold text-sahara-text" htmlFor="bio">
              Bio
            </label>
            <textarea
              className={`${fieldClassName} mt-2 min-h-36 w-full resize-y leading-6`}
              id="bio"
              placeholder="Share what you build, what you care about, and the kind of roles you are pursuing."
              {...register("bio")}
            />
            <p className="mt-2 text-xs text-sahara-muted">
              {watchedValues.bio?.length ?? 0}/500 characters
            </p>
            {errors.bio ? (
              <p className="mt-2 text-sm font-medium text-sahara-tertiary">
                {errors.bio.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              className="text-sm font-semibold text-sahara-text"
              htmlFor="location"
            >
              Location
            </label>
            <input
              className={`${fieldClassName} mt-2 w-full`}
              id="location"
              placeholder="Bengaluru, India"
              {...register("location")}
            />
            {errors.location ? (
              <p className="mt-2 text-sm font-medium text-sahara-tertiary">
                {errors.location.message}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-sahara-border/60 bg-sahara-surface p-6 shadow-warm sm:p-8">
        <div>
          <h2 className="font-serif text-3xl font-bold text-sahara-text">
            Links
          </h2>
          <p className="mt-2 text-sm leading-6 text-sahara-muted">
            Add contact and profile links. Empty optional fields stay hidden.
          </p>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <FormFieldError
            error={errors.email?.message}
            id="email"
            label="Email"
          >
            <input
              className={`${fieldClassName} mt-2 w-full`}
              id="email"
              placeholder="you@example.com"
              type="email"
              {...register("email")}
            />
          </FormFieldError>

          <FormFieldError
            error={errors.websiteUrl?.message}
            id="websiteUrl"
            label="Website"
          >
            <input
              className={`${fieldClassName} mt-2 w-full`}
              id="websiteUrl"
              placeholder="https://your-site.dev"
              type="url"
              {...register("websiteUrl")}
            />
          </FormFieldError>

          <FormFieldError
            error={errors.githubUrl?.message}
            id="githubUrl"
            label="GitHub"
          >
            <input
              className={`${fieldClassName} mt-2 w-full`}
              id="githubUrl"
              placeholder="https://github.com/username"
              type="url"
              {...register("githubUrl")}
            />
          </FormFieldError>

          <FormFieldError
            error={errors.linkedinUrl?.message}
            id="linkedinUrl"
            label="LinkedIn"
          >
            <input
              className={`${fieldClassName} mt-2 w-full`}
              id="linkedinUrl"
              placeholder="https://linkedin.com/in/username"
              type="url"
              {...register("linkedinUrl")}
            />
          </FormFieldError>
        </div>
      </section>

      <section className="rounded-2xl border border-sahara-border/60 bg-sahara-surface p-6 shadow-warm sm:p-8">
        <Controller
          control={control}
          name="skills"
          render={({ field }) => (
            <SkillInput onChange={field.onChange} skills={field.value} />
          )}
        />

        <div className="mt-8 rounded-xl border border-sahara-border/60 bg-sahara-background p-5">
          <label className="flex items-start gap-3">
            <input
              className="mt-1 h-4 w-4 rounded border-sahara-border text-sahara-primary focus:ring-sahara-primary/30"
              type="checkbox"
              {...register("isPublic")}
            />
            <span>
              <span className="block text-sm font-semibold text-sahara-text">
                Make portfolio public
              </span>
              <span className="mt-1 block text-sm leading-6 text-sahara-muted">
                Public portfolios can be viewed using your /dev/username link.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-8 flex justify-end">
          <Button disabled={isSubmitting} type="submit">
            <Save aria-hidden="true" className="h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Portfolio"}
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

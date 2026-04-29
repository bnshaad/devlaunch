"use client";

import { Plus, X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";

type TechStackInputProps = {
  techStack: string[];
  onChange: (techStack: string[]) => void;
  maxTech?: number;
  maxTechLength?: number;
};

export function TechStackInput({
  techStack,
  onChange,
  maxTech = 20,
  maxTechLength = 30
}: TechStackInputProps) {
  const [techText, setTechText] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function addTech() {
    const nextTech = techText.trim();

    if (!nextTech) {
      setMessage("Enter a technology before adding it.");
      return;
    }

    if (nextTech.length > maxTechLength) {
      setMessage(`Keep each technology to ${maxTechLength} characters or fewer.`);
      return;
    }

    if (techStack.some((tech) => tech.toLowerCase() === nextTech.toLowerCase())) {
      setMessage("That technology is already listed.");
      return;
    }

    if (techStack.length >= maxTech) {
      setMessage(`You can add up to ${maxTech} technologies.`);
      return;
    }

    onChange([...techStack, nextTech]);
    setTechText("");
    setMessage(null);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addTech();
    }
  }

  function removeTech(techToRemove: string) {
    onChange(techStack.filter((tech) => tech !== techToRemove));
    setMessage(null);
  }

  return (
    <div>
      <label
        className="text-sm font-semibold text-sahara-text"
        htmlFor="project-tech"
      >
        Tech stack
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          className="min-h-11 flex-1 rounded-lg border border-sahara-border bg-white px-3 py-2 text-sm text-sahara-text outline-none transition focus:border-sahara-primary focus:ring-2 focus:ring-sahara-primary/15"
          id="project-tech"
          maxLength={maxTechLength}
          onChange={(event) => setTechText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Next.js, Firebase, TypeScript"
          type="text"
          value={techText}
        />
        <Button className="sm:w-auto" onClick={addTech} variant="secondary">
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add
        </Button>
      </div>
      <p className="mt-2 text-xs leading-5 text-sahara-muted">
        Add at least one technology. Press Enter or use Add.
      </p>
      {message ? (
        <p className="mt-2 text-sm font-medium text-sahara-tertiary">{message}</p>
      ) : null}
      {techStack.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <span
              className="inline-flex items-center gap-2 rounded-full border border-sahara-border/70 bg-sahara-background px-3 py-1 text-xs font-semibold text-sahara-muted"
              key={tech}
            >
              {tech}
              <button
                aria-label={`Remove ${tech}`}
                className="rounded-full text-sahara-muted transition hover:text-sahara-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sahara-primary/40"
                onClick={() => removeTech(tech)}
                type="button"
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

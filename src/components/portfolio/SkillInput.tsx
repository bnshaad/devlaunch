"use client";

import { Plus, X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  MAX_PORTFOLIO_SKILL_LENGTH,
  MAX_PORTFOLIO_SKILLS,
  normalizeSkills
} from "@/lib/skills";

type SkillInputProps = {
  skills: string[];
  onChange: (skills: string[]) => void;
  maxSkills?: number;
  maxSkillLength?: number;
};

export function SkillInput({
  skills,
  onChange,
  maxSkills = MAX_PORTFOLIO_SKILLS,
  maxSkillLength = MAX_PORTFOLIO_SKILL_LENGTH
}: SkillInputProps) {
  const [skillText, setSkillText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const normalizedSkills = normalizeSkills(skills, maxSkills);

  function addSkill() {
    const nextSkill = skillText.trim();

    if (!nextSkill) {
      setMessage("Enter a skill before adding it.");
      return;
    }

    if (nextSkill.length > maxSkillLength) {
      setMessage(`Keep each skill to ${maxSkillLength} characters or fewer.`);
      return;
    }

    if (
      normalizedSkills.some(
        (skill) => skill.toLowerCase() === nextSkill.toLowerCase()
      )
    ) {
      setMessage("That skill is already listed.");
      return;
    }

    if (normalizedSkills.length >= maxSkills) {
      setMessage(`You can add up to ${maxSkills} skills.`);
      return;
    }

    onChange(normalizeSkills([...normalizedSkills, nextSkill], maxSkills));
    setSkillText("");
    setMessage(null);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  }

  function removeSkill(skillToRemove: string) {
    onChange(normalizedSkills.filter((skill) => skill !== skillToRemove));
    setMessage(null);
  }

  return (
    <div>
      <label
        className="text-sm font-semibold text-sahara-text"
        htmlFor="portfolio-skill"
      >
        Skills
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          className="min-h-11 flex-1 rounded-lg border border-sahara-border bg-white px-3 py-2 text-sm text-sahara-text outline-none transition focus:border-sahara-primary focus:ring-2 focus:ring-sahara-primary/15"
          id="portfolio-skill"
          maxLength={maxSkillLength}
          onChange={(event) => setSkillText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="React, Firebase, Tailwind"
          type="text"
          value={skillText}
        />
        <Button
          className="sm:w-auto"
          onClick={addSkill}
          type="button"
          variant="secondary"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add
        </Button>
      </div>
      <p className="mt-2 text-xs leading-5 text-sahara-muted">
        Add up to {maxSkills} skills. Press Enter or use Add.
      </p>
      {message ? (
        <p className="mt-2 text-sm font-medium text-sahara-tertiary">{message}</p>
      ) : null}
      {normalizedSkills.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {normalizedSkills.map((skill) => (
            <span
              className="inline-flex items-center gap-2 rounded-full border border-sahara-border/70 bg-sahara-background px-3 py-1 text-xs font-semibold text-sahara-muted"
              key={skill}
            >
              {skill}
              <button
                aria-label={`Remove ${skill}`}
                className="rounded-full text-sahara-muted transition hover:text-sahara-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sahara-primary/40"
                onClick={() => removeSkill(skill)}
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

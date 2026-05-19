export const MAX_PORTFOLIO_SKILLS = 20;
export const MAX_PORTFOLIO_SKILL_LENGTH = 30;

export function normalizeSkills(
  value: unknown,
  maxSkills = MAX_PORTFOLIO_SKILLS
) {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalizedSkills: string[] = [];
  const seenSkills = new Set<string>();

  for (const skill of value) {
    if (typeof skill !== "string") {
      continue;
    }

    const normalizedSkill = skill.trim();
    const normalizedKey = normalizedSkill.toLowerCase();

    if (!normalizedSkill || seenSkills.has(normalizedKey)) {
      continue;
    }

    normalizedSkills.push(normalizedSkill);
    seenSkills.add(normalizedKey);

    if (normalizedSkills.length >= maxSkills) {
      break;
    }
  }

  return normalizedSkills;
}

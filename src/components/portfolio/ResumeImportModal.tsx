"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Briefcase,
  Check,
  ChevronDown,
  ChevronUp,
  Code2,
  FileText,
  Github,
  Globe,
  Linkedin,
  Loader2,
  Mail,
  Sparkles,
  Trash2,
  Upload,
  User,
  X
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { parseResumeWithAi } from "@/services/aiService";
import { type AiResumeOutput } from "@/lib/aiResumeSchema";
import { normalizeSkills } from "@/lib/skills";
import { type PortfolioInput } from "@/types/portfolio";
import { type Project, type ProjectInput } from "@/types/project";
import { Button } from "@/components/ui/button";

type ResumeImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentPortfolio?: PortfolioInput | null;
  existingProjects?: Project[];
  onApply: (data: {
    portfolio: PortfolioInput;
    selectedProjects: ProjectInput[];
  }) => Promise<void> | void;
};

type Step = "input" | "processing" | "review";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ResumeImportModal({
  isOpen,
  onClose,
  currentPortfolio,
  existingProjects = [],
  onApply
}: ResumeImportModalProps) {
  const [step, setStep] = useState<Step>("input");
  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // AI Extraction Result
  const [extractedData, setExtractedData] = useState<AiResumeOutput | null>(null);

  // Review selections
  const [selectedFields, setSelectedFields] = useState({
    fullName: true,
    headline: true,
    bio: true,
    location: true,
    email: true,
    githubUrl: true,
    linkedinUrl: true,
    websiteUrl: true,
    skills: true
  });

  // Editable review state
  const [reviewFullName, setReviewFullName] = useState("");
  const [reviewHeadline, setReviewHeadline] = useState("");
  const [reviewBio, setReviewBio] = useState("");
  const [reviewLocation, setReviewLocation] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewGithub, setReviewGithub] = useState("");
  const [reviewLinkedin, setReviewLinkedin] = useState("");
  const [reviewWebsite, setReviewWebsite] = useState("");
  const [reviewSkills, setReviewSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState("");

  // Projects selection and edits
  const [selectedProjectIndices, setSelectedProjectIndices] = useState<Set<number>>(new Set());
  const [reviewProjects, setReviewProjects] = useState<ProjectInput[]>([]);
  const [expandedProjectIndex, setExpandedProjectIndex] = useState<number | null>(null);

  // Processing animation stepper
  const [processingStatus, setProcessingStatus] = useState("Analyzing document structure...");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset modal state when closed or opened
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("input");
        setSelectedFile(null);
        setPastedText("");
        setError(null);
        setExtractedData(null);
        setIsApplying(false);
      }, 300);
    }
  }, [isOpen]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("File exceeds the 4MB limit. Please upload a smaller PDF or paste text.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf") && !file.name.toLowerCase().endsWith(".txt")) {
      setError("Please upload a PDF (.pdf) or text (.txt) file.");
      return;
    }

    setSelectedFile(file);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("File exceeds the 4MB limit. Please upload a smaller PDF or paste text.");
      return;
    }

    setSelectedFile(file);
  };

  const handleStartExtraction = async () => {
    setError(null);

    if (inputMode === "file" && !selectedFile) {
      setError("Please select a resume file to upload.");
      return;
    }

    if (inputMode === "text" && pastedText.trim().length < 30) {
      setError("Please paste at least 30 characters of resume text.");
      return;
    }

    setStep("processing");

    // Realistic stepper feedback
    const t1 = setTimeout(() => setProcessingStatus("Synthesizing headline, bio & skills..."), 1200);
    const t2 = setTimeout(() => setProcessingStatus("Extracting software engineering projects..."), 2500);

    try {
      const result = await parseResumeWithAi({
        file: inputMode === "file" ? selectedFile : null,
        text: inputMode === "text" ? pastedText : undefined
      });

      clearTimeout(t1);
      clearTimeout(t2);

      setExtractedData(result);

      // Populate review state
      setReviewFullName(result.portfolio.fullName || currentPortfolio?.fullName || "");
      setReviewHeadline(result.portfolio.headline || currentPortfolio?.headline || "");
      setReviewBio(result.portfolio.bio || currentPortfolio?.bio || "");
      setReviewLocation(result.portfolio.location || currentPortfolio?.location || "");
      setReviewEmail(result.portfolio.email || currentPortfolio?.email || "");
      setReviewGithub(result.portfolio.githubUrl || currentPortfolio?.githubUrl || "");
      setReviewLinkedin(result.portfolio.linkedinUrl || currentPortfolio?.linkedinUrl || "");
      setReviewWebsite(result.portfolio.websiteUrl || currentPortfolio?.websiteUrl || "");
      setReviewSkills(normalizeSkills(result.portfolio.skills));

      // Match extracted projects against existing projects by title
      const initialSelectedProjects = new Set<number>();
      const existingTitles = new Set(existingProjects.map((p) => p.title.toLowerCase().trim()));

      result.projects.forEach((proj, idx) => {
        const isDuplicate = existingTitles.has(proj.title.toLowerCase().trim());
        if (!isDuplicate) {
          initialSelectedProjects.add(idx);
        }
      });

      setReviewProjects(result.projects);
      setSelectedProjectIndices(initialSelectedProjects);
      setStep("review");
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      setStep("input");
      setError(err instanceof Error ? err.message : "Failed to analyze resume.");
    }
  };

  const toggleField = (field: keyof typeof selectedFields) => {
    setSelectedFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const removeSkill = (skillToRemove: string) => {
    setReviewSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const addCustomSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    setReviewSkills((prev) => normalizeSkills([...prev, trimmed]));
    setNewSkillInput("");
  };

  const toggleProject = (index: number) => {
    setSelectedProjectIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleApply = async () => {
    if (!extractedData) return;
    setIsApplying(true);
    setError(null);

    try {
      const mergedPortfolio: PortfolioInput = {
        fullName: selectedFields.fullName ? reviewFullName : (currentPortfolio?.fullName ?? ""),
        headline: selectedFields.headline ? reviewHeadline : (currentPortfolio?.headline ?? ""),
        bio: selectedFields.bio ? reviewBio : (currentPortfolio?.bio ?? ""),
        location: selectedFields.location ? reviewLocation : (currentPortfolio?.location ?? ""),
        email: selectedFields.email ? reviewEmail : (currentPortfolio?.email ?? ""),
        githubUrl: selectedFields.githubUrl ? reviewGithub : (currentPortfolio?.githubUrl ?? ""),
        linkedinUrl: selectedFields.linkedinUrl ? reviewLinkedin : (currentPortfolio?.linkedinUrl ?? ""),
        websiteUrl: selectedFields.websiteUrl ? reviewWebsite : (currentPortfolio?.websiteUrl ?? ""),
        skills: selectedFields.skills ? reviewSkills : (currentPortfolio?.skills ?? []),
        isPublic: currentPortfolio?.isPublic ?? false
      };

      const selectedProjectsToCreate = reviewProjects
        .filter((_, idx) => selectedProjectIndices.has(idx))
        .map((proj) => ({
          ...proj,
          title: proj.title.trim().length >= 3 ? proj.title.trim() : "Portfolio Project",
          description:
            proj.description.trim().length >= 10
              ? proj.description.trim()
              : `${proj.description.trim()} built with modern technologies.`,
          techStack:
            proj.techStack && proj.techStack.length > 0
              ? proj.techStack
              : ["TypeScript"]
        }));

      await onApply({
        portfolio: mergedPortfolio,
        selectedProjects: selectedProjectsToCreate
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply imported portfolio details.");
    } finally {
      setIsApplying(false);
    }
  };

  // Duplicate checker helper
  const isDuplicateProject = (title: string) => {
    const norm = title.toLowerCase().trim();
    return existingProjects.some((p) => p.title.toLowerCase().trim() === norm);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={step === "processing" ? undefined : onClose}
          className="fixed inset-0 bg-sahara-text/50 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl rounded-2xl border border-sahara-border/80 bg-sahara-surface shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-sahara-border/60 px-6 py-4 bg-sahara-surface">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sahara-primary/10 text-sahara-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-sahara-text">
                  AI Resume-to-Portfolio Importer
                </h3>
                <p className="text-xs text-sahara-muted">
                  {step === "input" && "Upload your resume or paste text to generate your developer portfolio."}
                  {step === "processing" && "Analyzing resume and synthesizing portfolio draft..."}
                  {step === "review" && "Review what AI found and select what to add to your portfolio."}
                </p>
              </div>
            </div>
            {step !== "processing" && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-sahara-muted hover:bg-sahara-surfaceLow hover:text-sahara-text transition"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {error && (
              <div className="rounded-xl border border-sahara-tertiary/30 bg-sahara-tertiary/10 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-sahara-tertiary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-sahara-tertiary">{error}</p>
                </div>
              </div>
            )}

            {/* STEP 1: INPUT */}
            {step === "input" && (
              <div className="space-y-6">
                {/* Tabs */}
                <div className="flex rounded-xl bg-sahara-surfaceLow p-1 border border-sahara-border/60">
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode("file");
                      setError(null);
                    }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
                      inputMode === "file"
                        ? "bg-sahara-surface text-sahara-text shadow-sm"
                        : "text-sahara-muted hover:text-sahara-text"
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    Upload PDF / Text File
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode("text");
                      setError(null);
                    }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
                      inputMode === "text"
                        ? "bg-sahara-surface text-sahara-text shadow-sm"
                        : "text-sahara-muted hover:text-sahara-text"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    Paste Resume Text
                  </button>
                </div>

                {inputMode === "file" ? (
                  <div>
                    {!selectedFile ? (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                          isDragging
                            ? "border-sahara-primary bg-sahara-primary/5 scale-[1.01]"
                            : "border-sahara-border/80 hover:border-sahara-primary/50 bg-sahara-background/50 hover:bg-sahara-surfaceLow"
                        }`}
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sahara-primary/10 text-sahara-primary">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-sahara-text">
                            Drag & drop your resume here, or <span className="text-sahara-primary underline">browse</span>
                          </p>
                          <p className="mt-1 text-xs text-sahara-muted">
                            Supports PDF (.pdf) or Plain Text (.txt) up to 4MB
                          </p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.txt,application/pdf,text/plain"
                          className="hidden"
                          onChange={handleFileInputChange}
                        />
                      </div>
                    ) : (
                      <div className="rounded-xl border border-sahara-border/80 bg-sahara-surfaceLow p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sahara-primary/10 text-sahara-primary">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-sahara-text truncate max-w-xs sm:max-w-md">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-sahara-muted">
                              {formatBytes(selectedFile.size)} • Ready to analyze
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="rounded-lg p-2 text-sahara-muted hover:bg-sahara-tertiary/10 hover:text-sahara-tertiary transition"
                          title="Remove file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-sahara-text mb-2">
                      Resume or Career Profile Text
                    </label>
                    <textarea
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Paste your resume contents, career summary, or LinkedIn 'About' text here..."
                      className="w-full min-h-[180px] rounded-xl border border-sahara-border/80 bg-white p-3.5 text-sm text-sahara-text placeholder:text-sahara-muted/60 focus:border-sahara-primary focus:ring-2 focus:ring-sahara-primary/15 outline-none transition"
                    />
                    <p className="mt-1.5 text-right text-xs text-sahara-muted">
                      {pastedText.length.toLocaleString()} characters
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-sahara-border/60 bg-sahara-surfaceLow/60 p-4">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed text-sahara-muted">
                      <strong className="text-sahara-text">Zero data loss:</strong> You will review every single detail
                      before anything is saved. Existing fields will not be overwritten without your explicit confirmation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PROCESSING */}
            {step === "processing" && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-5">
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-sahara-primary/15 animate-ping opacity-75" />
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sahara-primary text-white shadow-warm">
                    <Sparkles className="h-8 w-8 animate-pulse text-amber-200" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-xl font-bold text-sahara-text">
                    Extracting Portfolio Details
                  </h4>
                  <p className="text-sm text-sahara-muted animate-pulse">
                    {processingStatus}
                  </p>
                </div>
                <div className="max-w-xs w-full bg-sahara-surfaceLow rounded-full h-1.5 overflow-hidden relative">
                  <motion.div
                    className="bg-sahara-primary h-full w-1/2 rounded-full absolute"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                  />
                </div>
                <p className="text-xs text-sahara-muted">Usually completes in 2-3 seconds</p>
              </div>
            )}

            {/* STEP 3: REVIEW & MERGE STAGING */}
            {step === "review" && extractedData && (
              <div className="space-y-6">
                {/* Career Snapshot Header */}
                {extractedData.summary && (
                  <div className="rounded-xl border border-sahara-primary/30 bg-sahara-primary/5 p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-sahara-primary">
                        Detected Career Profile
                      </p>
                      <p className="font-serif text-base font-bold text-sahara-text mt-0.5">
                        {extractedData.summary.primaryDomain || "Software Engineer"}
                        {extractedData.summary.yearsOfExperience ? ` • ${extractedData.summary.yearsOfExperience}` : ""}
                      </p>
                    </div>
                    {extractedData.summary.topStrengths?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {extractedData.summary.topStrengths.map((str, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-md bg-white border border-sahara-border/60 px-2 py-0.5 text-xs text-sahara-muted"
                          >
                            {str}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Section 1: Profile & Story */}
                <div className="rounded-xl border border-sahara-border/70 bg-sahara-background/40 p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-sahara-border/40 pb-2.5">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-sahara-primary" />
                      <h4 className="font-serif text-sm font-bold text-sahara-text">
                        Profile & Story
                      </h4>
                    </div>
                    <span className="text-xs text-sahara-muted">Select fields to import</span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Full Name */}
                    <div className="rounded-lg border border-sahara-border/60 bg-sahara-surface p-3">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-xs font-semibold text-sahara-muted uppercase">Full Name</span>
                        <input
                          type="checkbox"
                          checked={selectedFields.fullName}
                          onChange={() => toggleField("fullName")}
                          className="h-4 w-4 rounded border-sahara-border text-sahara-primary focus:ring-sahara-primary/20"
                        />
                      </label>
                      <input
                        type="text"
                        value={reviewFullName}
                        onChange={(e) => setReviewFullName(e.target.value)}
                        disabled={!selectedFields.fullName}
                        className="mt-1.5 w-full rounded border border-sahara-border/60 px-2.5 py-1 text-sm text-sahara-text disabled:opacity-50 outline-none focus:border-sahara-primary"
                      />
                    </div>

                    {/* Location */}
                    <div className="rounded-lg border border-sahara-border/60 bg-sahara-surface p-3">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-xs font-semibold text-sahara-muted uppercase">Location</span>
                        <input
                          type="checkbox"
                          checked={selectedFields.location}
                          onChange={() => toggleField("location")}
                          className="h-4 w-4 rounded border-sahara-border text-sahara-primary focus:ring-sahara-primary/20"
                        />
                      </label>
                      <input
                        type="text"
                        value={reviewLocation}
                        onChange={(e) => setReviewLocation(e.target.value)}
                        disabled={!selectedFields.location}
                        placeholder="e.g. San Francisco, CA"
                        className="mt-1.5 w-full rounded border border-sahara-border/60 px-2.5 py-1 text-sm text-sahara-text disabled:opacity-50 outline-none focus:border-sahara-primary"
                      />
                    </div>
                  </div>

                  {/* Headline */}
                  <div className="rounded-lg border border-sahara-border/60 bg-sahara-surface p-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-semibold text-sahara-muted uppercase">Headline</span>
                      <input
                        type="checkbox"
                        checked={selectedFields.headline}
                        onChange={() => toggleField("headline")}
                        className="h-4 w-4 rounded border-sahara-border text-sahara-primary focus:ring-sahara-primary/20"
                      />
                    </label>
                    <input
                      type="text"
                      value={reviewHeadline}
                      onChange={(e) => setReviewHeadline(e.target.value)}
                      disabled={!selectedFields.headline}
                      maxLength={100}
                      className="mt-1.5 w-full rounded border border-sahara-border/60 px-2.5 py-1 text-sm text-sahara-text disabled:opacity-50 outline-none focus:border-sahara-primary"
                    />
                    <p className="mt-1 text-right text-[11px] text-sahara-muted">
                      {reviewHeadline.length}/100 chars
                    </p>
                  </div>

                  {/* Bio */}
                  <div className="rounded-lg border border-sahara-border/60 bg-sahara-surface p-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-semibold text-sahara-muted uppercase">Bio / Summary</span>
                      <input
                        type="checkbox"
                        checked={selectedFields.bio}
                        onChange={() => toggleField("bio")}
                        className="h-4 w-4 rounded border-sahara-border text-sahara-primary focus:ring-sahara-primary/20"
                      />
                    </label>
                    <textarea
                      rows={3}
                      value={reviewBio}
                      onChange={(e) => setReviewBio(e.target.value)}
                      disabled={!selectedFields.bio}
                      maxLength={500}
                      className="mt-1.5 w-full rounded border border-sahara-border/60 p-2 text-sm text-sahara-text disabled:opacity-50 outline-none focus:border-sahara-primary"
                    />
                    <p className="mt-1 text-right text-[11px] text-sahara-muted">
                      {reviewBio.length}/500 chars
                    </p>
                  </div>
                </div>

                {/* Section 2: Contact & Social Links */}
                <div className="rounded-xl border border-sahara-border/70 bg-sahara-background/40 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-sahara-border/40 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-sahara-primary" />
                      <h4 className="font-serif text-sm font-bold text-sahara-text">
                        Detected Links & Contact
                      </h4>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* GitHub */}
                    <div className="rounded-lg border border-sahara-border/60 bg-sahara-surface p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Github className="h-4 w-4 text-sahara-muted flex-shrink-0" />
                        <input
                          type="text"
                          value={reviewGithub}
                          onChange={(e) => setReviewGithub(e.target.value)}
                          placeholder="GitHub URL"
                          disabled={!selectedFields.githubUrl}
                          className="w-full text-xs text-sahara-text bg-transparent outline-none disabled:opacity-50"
                        />
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedFields.githubUrl}
                        onChange={() => toggleField("githubUrl")}
                        className="h-3.5 w-3.5 rounded border-sahara-border text-sahara-primary"
                      />
                    </div>

                    {/* LinkedIn */}
                    <div className="rounded-lg border border-sahara-border/60 bg-sahara-surface p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Linkedin className="h-4 w-4 text-sahara-muted flex-shrink-0" />
                        <input
                          type="text"
                          value={reviewLinkedin}
                          onChange={(e) => setReviewLinkedin(e.target.value)}
                          placeholder="LinkedIn URL"
                          disabled={!selectedFields.linkedinUrl}
                          className="w-full text-xs text-sahara-text bg-transparent outline-none disabled:opacity-50"
                        />
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedFields.linkedinUrl}
                        onChange={() => toggleField("linkedinUrl")}
                        className="h-3.5 w-3.5 rounded border-sahara-border text-sahara-primary"
                      />
                    </div>

                    {/* Email */}
                    <div className="rounded-lg border border-sahara-border/60 bg-sahara-surface p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Mail className="h-4 w-4 text-sahara-muted flex-shrink-0" />
                        <input
                          type="email"
                          value={reviewEmail}
                          onChange={(e) => setReviewEmail(e.target.value)}
                          placeholder="Contact Email"
                          disabled={!selectedFields.email}
                          className="w-full text-xs text-sahara-text bg-transparent outline-none disabled:opacity-50"
                        />
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedFields.email}
                        onChange={() => toggleField("email")}
                        className="h-3.5 w-3.5 rounded border-sahara-border text-sahara-primary"
                      />
                    </div>

                    {/* Website */}
                    <div className="rounded-lg border border-sahara-border/60 bg-sahara-surface p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Globe className="h-4 w-4 text-sahara-muted flex-shrink-0" />
                        <input
                          type="text"
                          value={reviewWebsite}
                          onChange={(e) => setReviewWebsite(e.target.value)}
                          placeholder="Website or Portfolio URL"
                          disabled={!selectedFields.websiteUrl}
                          className="w-full text-xs text-sahara-text bg-transparent outline-none disabled:opacity-50"
                        />
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedFields.websiteUrl}
                        onChange={() => toggleField("websiteUrl")}
                        className="h-3.5 w-3.5 rounded border-sahara-border text-sahara-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Technical Skills */}
                <div className="rounded-xl border border-sahara-border/70 bg-sahara-background/40 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-sahara-border/40 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-sahara-primary" />
                      <h4 className="font-serif text-sm font-bold text-sahara-text">
                        Extracted Skills ({reviewSkills.length})
                      </h4>
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <span className="text-xs text-sahara-muted">Import skills</span>
                      <input
                        type="checkbox"
                        checked={selectedFields.skills}
                        onChange={() => toggleField("skills")}
                        className="h-3.5 w-3.5 rounded border-sahara-border text-sahara-primary"
                      />
                    </label>
                  </div>

                  {selectedFields.skills && (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {reviewSkills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 rounded-full bg-sahara-surface border border-sahara-border px-2.5 py-1 text-xs font-medium text-sahara-text"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="text-sahara-muted hover:text-sahara-tertiary transition"
                              title={`Remove ${skill}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Add Custom Skill */}
                      <div className="flex gap-2 max-w-xs">
                        <input
                          type="text"
                          value={newSkillInput}
                          onChange={(e) => setNewSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomSkill();
                            }
                          }}
                          placeholder="Add another skill..."
                          className="flex-1 rounded-lg border border-sahara-border/70 px-2.5 py-1 text-xs text-sahara-text bg-white outline-none focus:border-sahara-primary"
                        />
                        <button
                          type="button"
                          onClick={addCustomSkill}
                          className="rounded-lg bg-sahara-surfaceLow border border-sahara-border/80 px-2.5 py-1 text-xs font-semibold text-sahara-text hover:bg-sahara-border/40"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4: Extracted Projects */}
                <div className="rounded-xl border border-sahara-border/70 bg-sahara-background/40 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-sahara-border/40 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-sahara-primary" />
                      <h4 className="font-serif text-sm font-bold text-sahara-text">
                        Detected Projects ({reviewProjects.length})
                      </h4>
                    </div>
                    <span className="text-xs text-sahara-muted">
                      {selectedProjectIndices.size} selected to create
                    </span>
                  </div>

                  {reviewProjects.length === 0 ? (
                    <p className="text-xs text-sahara-muted italic py-2">
                      No standalone projects found on the resume. You can add projects manually in the Projects tab.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {reviewProjects.map((project, idx) => {
                        const isSelected = selectedProjectIndices.has(idx);
                        const isDuplicate = isDuplicateProject(project.title);
                        const isExpanded = expandedProjectIndex === idx;

                        return (
                          <div
                            key={idx}
                            className={`rounded-xl border transition-all ${
                              isSelected
                                ? "border-sahara-primary/40 bg-sahara-surface shadow-xs"
                                : "border-sahara-border/60 bg-sahara-surface/60 opacity-75"
                            }`}
                          >
                            <div className="p-3.5 flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleProject(idx)}
                                  className="mt-1 h-4 w-4 rounded border-sahara-border text-sahara-primary focus:ring-sahara-primary/20 flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-bold text-sahara-text">
                                      {project.title}
                                    </span>
                                    {isDuplicate && (
                                      <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 text-[10px] font-semibold">
                                        Already in your projects
                                      </span>
                                    )}
                                    {project.featured && (
                                      <span className="rounded-full bg-sahara-primary/10 text-sahara-primary border border-sahara-primary/20 px-2 py-0.5 text-[10px] font-semibold">
                                        Featured
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-1 text-xs text-sahara-muted line-clamp-2">
                                    {project.description}
                                  </p>
                                  {project.techStack?.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {project.techStack.map((tech, tIdx) => (
                                        <span
                                          key={tIdx}
                                          className="rounded bg-sahara-surfaceLow px-1.5 py-0.5 text-[10px] text-sahara-text"
                                        >
                                          {tech}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </label>

                              <button
                                type="button"
                                onClick={() => setExpandedProjectIndex(isExpanded ? null : idx)}
                                className="p-1 text-sahara-muted hover:text-sahara-text rounded"
                              >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </button>
                            </div>

                            {/* Expanded edit drawer */}
                            {isExpanded && (
                              <div className="px-4 pb-4 pt-1 border-t border-sahara-border/40 space-y-3 bg-sahara-background/30 rounded-b-xl">
                                <div>
                                  <label className="text-[11px] font-semibold text-sahara-muted uppercase">
                                    Project Title
                                  </label>
                                  <input
                                    type="text"
                                    value={project.title}
                                    onChange={(e) => {
                                      const next = [...reviewProjects];
                                      next[idx] = { ...next[idx], title: e.target.value };
                                      setReviewProjects(next);
                                    }}
                                    className="mt-1 w-full rounded border border-sahara-border/60 bg-white px-2.5 py-1 text-xs text-sahara-text outline-none focus:border-sahara-primary"
                                  />
                                </div>
                                <div>
                                  <label className="text-[11px] font-semibold text-sahara-muted uppercase">
                                    Description
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={project.description}
                                    onChange={(e) => {
                                      const next = [...reviewProjects];
                                      next[idx] = { ...next[idx], description: e.target.value };
                                      setReviewProjects(next);
                                    }}
                                    className="mt-1 w-full rounded border border-sahara-border/60 bg-white p-2 text-xs text-sahara-text outline-none focus:border-sahara-primary"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-sahara-border/60 px-6 py-4 bg-sahara-surfaceLow/60 flex items-center justify-between">
            {step === "input" && (
              <>
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleStartExtraction}
                  disabled={inputMode === "file" ? !selectedFile : pastedText.trim().length < 30}
                >
                  <Sparkles className="h-4 w-4" />
                  Extract Portfolio Data
                </Button>
              </>
            )}

            {step === "processing" && (
              <div className="w-full flex justify-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setStep("input");
                    setError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}

            {step === "review" && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setStep("input")}
                  disabled={isApplying}
                >
                  Back to Upload
                </Button>
                <Button onClick={handleApply} disabled={isApplying}>
                  {isApplying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Apply to Portfolio Draft
                      {selectedProjectIndices.size > 0 && ` (+${selectedProjectIndices.size} Projects)`}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

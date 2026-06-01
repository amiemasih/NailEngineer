/**
 * Canonical nail-service stages used to train the Nail Engineer AI model.
 * Mirrors the "Picture Setup for Training AI Model" spec (Steps 1–6).
 *
 * Each step maps to its OWN folder (prefix) inside the Supabase storage
 * bucket, so uploaded images land neatly separated by stage:
 *   nail-training-data/step-1-before/...
 *   nail-training-data/step-3-push-back-cuticles/...
 *
 * Shared by the client uploader and the server API, so keep it free of
 * server-only imports.
 */

export type TrainingStep = {
  /** Stable key used by the API and as the storage folder name. */
  id: string;
  /** Storage folder (prefix) inside the bucket. Same as id for clarity. */
  folder: string;
  /** Display number, e.g. "1" or "5 / 6". */
  number: string;
  title: string;
  optional?: boolean;
  /** Guidance from the labeling spec, shown to the tech. */
  hint: string;
  /** Shown to the tech after a successful submission of this step. */
  praise: string;
};

export const TRAINING_STEPS: TrainingStep[] = [
  {
    id: "step-1-before",
    folder: "step-1-before",
    number: "1",
    title: "Before",
    hint: "The starting nail before any work: existing polish or a bare nail.",
    praise: "prep looks amazing!",
  },
  {
    id: "step-2-polish-removal",
    folder: "step-2-polish-removal",
    number: "2",
    title: "Polish Removal",
    optional: true,
    hint: "Mid polish removal. Optional, only when there was polish to take off.",
    praise: "the polish removal shots look great!",
  },
  {
    id: "step-3-push-back-cuticles",
    folder: "step-3-push-back-cuticles",
    number: "3",
    title: "Push Back Cuticles",
    hint: "Cuticles pushed back, first step of cuticle work.",
    praise: "that cuticle work looks amazing!",
  },
  {
    id: "step-4-clean-cuticle",
    folder: "step-4-clean-cuticle",
    number: "4",
    title: "Clean Cuticle",
    hint: "Cuticle cleaned, no trim yet (ball bit / cleanup in frame is fine).",
    praise: "those clean cuticles look amazing!",
  },
  {
    id: "step-5-6-trim-buffed-nails",
    folder: "step-5-6-trim-buffed-nails",
    number: "5 / 6",
    title: "Trim Cuticles & / or Buffed Nails",
    hint: "Cuticles trimmed and/or the nail buffed and prepped.",
    praise: "the trim & buff shots look amazing!",
  },
];

export const TRAINING_STEP_IDS = TRAINING_STEPS.map((s) => s.id);

export function getTrainingStep(id: string): TrainingStep | null {
  return TRAINING_STEPS.find((s) => s.id === id) ?? null;
}

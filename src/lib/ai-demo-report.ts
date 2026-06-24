/**
 * Scripted "Nail Prep Feedback Report" for the public demo (/ai-demo).
 *
 * Nothing here calls a real model. It mirrors the kind of per-finger, per-stage
 * prep feedback the Nail Engineer AI is built to produce, paired with real
 * prep photos curated into /public/ai-demo. Stages map to the training steps in
 * training-steps.ts (the same stages techs upload to on the dashboard).
 */

export type Tone = "good" | "warn" | "bad";

export type FingerFinding = {
  finger: string;
  status: string;
  /** Either an `issues` line (problems) or an `observation` line (all good). */
  issues?: string;
  observation?: string;
  cause?: string;
  fix?: string;
  /** e.g. { label: "Retention Impact", value: "High" }. */
  retention?: { label: string; value: string };
};

export type ReportStage = {
  number: string;
  title: string;
  /** Curated photo in /public/ai-demo. */
  photo?: string;
  overallStatus?: string;
  overallResult?: string;
  fingers: FingerFinding[];
};

export type PrepReport = {
  prepScore: number;
  estimatedRetention: string;
  overallStatus: string;
  topIssues: string[];
  stages: ReportStage[];
  finalRecommendation: string[];
  expectedResult: string;
};

/** Color a status chip: green for done, red for real corrections, amber otherwise. */
export function statusTone(status: string): Tone {
  if (/^complete$/i.test(status.trim())) return "good";
  if (/needs correction/i.test(status)) return "bad";
  return "warn";
}

/** Color a retention chip from an impact word or a "N+ weeks" estimate. */
export function retentionTone(value: string): Tone {
  if (/high/i.test(value)) return "bad";
  if (/medium/i.test(value)) return "warn";
  if (/low/i.test(value)) return "good";
  if (/4\+/.test(value)) return "good";
  if (/3\+/.test(value)) return "warn";
  return "bad"; // 2+ weeks or lower
}

export const PREP_REPORT: PrepReport = {
  prepScore: 82,
  estimatedRetention: "2–4+ weeks",
  overallStatus: "Minor corrections needed before product application",
  topIssues: [
    "Overfiling on thumb and pinky",
    "Uneven e-file pressure causing dents",
    "Remaining cuticle tissue on index and pinky",
    "Additional cleaning needed under the proximal nail fold",
    "Hangnails that should be removed before application",
  ],
  stages: [
    {
      number: "1",
      title: "Before Prep",
      photo: "/ai-demo/stage-before.jpg",
      fingers: [
        {
          finger: "Thumb",
          status: "Needs Correction",
          issues: "Ring of fire, redness",
          cause: "Overfiling or incorrect e-file angle",
          fix: "Use lighter pressure and keep the e-file bit parallel to the nail plate",
          retention: { label: "Retention Impact", value: "Medium" },
        },
        {
          finger: "Index",
          status: "Needs Prep",
          issues: "Cuticle attached to nail plate",
          cause: "Cuticle has not been lifted yet",
          fix: "Push back and lift cuticle before cleaning",
          retention: { label: "Retention Impact", value: "High" },
        },
        {
          finger: "Middle",
          status: "Needs Prep",
          issues: "Cuticle attached to nail plate",
          cause: "Cuticle has not been lifted yet",
          fix: "Push back and lift cuticle before cleaning",
          retention: { label: "Retention Impact", value: "High" },
        },
        {
          finger: "Ring",
          status: "Needs Prep",
          issues: "Cuticle attached to nail plate",
          cause: "Cuticle has not been lifted yet",
          fix: "Push back and lift cuticle before cleaning",
          retention: { label: "Retention Impact", value: "High" },
        },
        {
          finger: "Pinky",
          status: "Needs Correction",
          issues: "Cuticle attached, nail plate dent, redness",
          cause: "Overfiling or incorrect e-file angle",
          fix: "Use lighter pressure and adjust the e-file angle",
          retention: { label: "Retention Impact", value: "High" },
        },
      ],
    },
    {
      number: "2",
      title: "Push Back Cuticles",
      photo: "/ai-demo/stage-push-back.jpg",
      overallStatus: "Complete",
      overallResult: "Cuticles were successfully lifted on all nails",
      fingers: [
        {
          finger: "Thumb",
          status: "Complete",
          observation: "White debris is visible from the lifted cuticle",
          fix: "Continue to the cleaning step",
          retention: { label: "Retention Impact", value: "Low" },
        },
        {
          finger: "Index",
          status: "Complete",
          observation: "Cuticle properly lifted",
          retention: { label: "Retention Impact", value: "Low" },
        },
        {
          finger: "Middle",
          status: "Complete",
          observation: "Cuticle properly lifted",
          retention: { label: "Retention Impact", value: "Low" },
        },
        {
          finger: "Ring",
          status: "Complete",
          observation: "Cuticle properly lifted",
          retention: { label: "Retention Impact", value: "Low" },
        },
        {
          finger: "Pinky",
          status: "Complete",
          observation: "Cuticle properly lifted",
          retention: { label: "Retention Impact", value: "Low" },
        },
      ],
    },
    {
      number: "3",
      title: "Clean Under Proximal Nail Fold",
      photo: "/ai-demo/stage-clean.jpg",
      overallStatus: "Mostly Complete",
      overallResult: "Dust appears to be removed from all nails",
      fingers: [
        {
          finger: "Middle",
          status: "Needs Minor Correction",
          issues: "Small dent in nail plate",
          cause: "Uneven or excessive pressure with cuticle bit",
          fix: "Use even, parallel pressure when cleaning under the proximal nail fold",
          retention: { label: "Retention Impact", value: "Medium" },
        },
        {
          finger: "Ring",
          status: "Needs Minor Correction",
          issues: "Small dent in nail plate",
          cause: "Uneven or excessive pressure with cuticle bit",
          fix: "Use even, parallel pressure when cleaning under the proximal nail fold",
          retention: { label: "Retention Impact", value: "Medium" },
        },
      ],
    },
    {
      number: "4",
      title: "Trim Cuticles",
      photo: "/ai-demo/stage-trim-buff.jpg",
      fingers: [
        {
          finger: "Thumb",
          status: "Complete",
          observation: "Cuticle properly trimmed",
          fix: "No correction needed",
          retention: { label: "Retention Impact", value: "Low" },
        },
        {
          finger: "Index",
          status: "Needs Correction",
          issues: "Remaining cuticle on left side, hangnail present",
          cause: "Cuticle was not fully trimmed",
          fix: "Trim remaining cuticle and remove hangnail",
          retention: { label: "Retention Impact", value: "Medium" },
        },
        {
          finger: "Middle",
          status: "Mostly Complete",
          issues: "Left side needs additional cleaning",
          cause: "Cuticle or dust may remain near the sidewall",
          fix: "Use a cuticle bit or sanding band to refine the left side",
          retention: { label: "Retention Impact", value: "Medium" },
        },
        {
          finger: "Ring",
          status: "Mostly Complete",
          issues: "Residual dust present",
          cause: "Dust was not fully removed after trimming",
          fix: "Clean the nail surface and cuticle area before application",
          retention: { label: "Retention Impact", value: "Medium" },
        },
        {
          finger: "Pinky",
          status: "85% Complete",
          issues: "Remaining cuticle tissue",
          cause: "Cuticle was not fully removed",
          fix: "Use cuticle nippers to remove remaining tissue",
          retention: { label: "Retention Impact", value: "Medium" },
        },
      ],
    },
    {
      number: "5",
      title: "Buff Nail",
      photo: "/ai-demo/stage-trim-buff.jpg",
      fingers: [
        {
          finger: "Thumb",
          status: "Complete",
          observation: "Nail is properly prepped",
          fix: "Ready for product application",
          retention: { label: "Estimated Retention", value: "4+ weeks" },
        },
        {
          finger: "Index",
          status: "Complete",
          observation: "Nail is properly prepped",
          fix: "Ready for product application",
          retention: { label: "Estimated Retention", value: "4+ weeks" },
        },
        {
          finger: "Middle",
          status: "90% Complete",
          issues: "Hangnail on left side",
          cause: "Hangnail was not removed during prep",
          fix: "Cut hangnail to prevent dirt from collecting near the nail",
          retention: { label: "Estimated Retention", value: "3+ weeks" },
        },
        {
          finger: "Ring",
          status: "80% Complete",
          issues: "Proximal nail fold needs additional cleaning",
          cause: "Remaining debris or cuticle near the nail fold",
          fix: "Clean underneath the proximal nail fold to prevent lifting",
          retention: { label: "Estimated Retention", value: "2+ weeks" },
        },
        {
          finger: "Pinky",
          status: "80% Complete",
          issues: "Proximal nail fold needs additional cleaning, hangnails on left side",
          cause: "Remaining debris and skin near the nail fold",
          fix: "Clean underneath the proximal nail fold and remove hangnails",
          retention: { label: "Estimated Retention", value: "2+ weeks" },
        },
      ],
    },
  ],
  finalRecommendation: [
    "Use lighter, more even e-file pressure to avoid overfiling and nail plate dents.",
    "Clean thoroughly underneath the proximal nail fold, especially on the ring and pinky fingers.",
    "Remove any remaining cuticle tissue on the index and pinky fingers.",
    "Trim and remove all hangnails to create a clean seal around the nail.",
  ],
  expectedResult:
    "Once these small corrections are completed, the nails will be well-prepped for application with improved adhesion, reduced risk of lifting, and stronger retention potential of up to 4+ weeks. Overall, this is a solid prep with only a few refinements needed to achieve a professional-quality result.",
};

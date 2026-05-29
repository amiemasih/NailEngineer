/**
 * Scripted samples for the public "see how the AI works" demo (/ai-demo).
 *
 * Nothing here calls a real model. Each sample pairs a drawn nail "photo"
 * (rendered as SVG in AiDemo.tsx) with illustrative feedback that mirrors the
 * real training pipeline stages in training-steps.ts, so the demo stays
 * consistent with how the product is meant to behave.
 */

export type NailVariant = "chipped-gel" | "bare-natural" | "cuticles-pushed";

export type DemoSample = {
  id: string;
  /** Fake filename, shown as a chip to sell the "uploaded photo" feel. */
  filename: string;
  /** Short human label for the thumbnail. */
  caption: string;
  variant: NailVariant;
  analysis: {
    stageNumber: string;
    stageTitle: string;
    /** One-line read on the current state of the nail. */
    condition: string;
    /** 0-100, shown as a confidence meter. */
    confidence: number;
    /** Bullet points: what the model "sees". */
    observations: string[];
    /** The recommended next stage in the service. */
    nextStepNumber: string;
    nextStepTitle: string;
    /** Paragraph of advice on how to do that next step. */
    advice: string;
    /** Optional one-line pro tip. */
    tip?: string;
  };
};

export const DEMO_SAMPLES: DemoSample[] = [
  {
    id: "chipped-gel",
    filename: "IMG_4821.jpg",
    caption: "Grown-out gel",
    variant: "chipped-gel",
    analysis: {
      stageNumber: "1",
      stageTitle: "Before",
      condition: "Two-week-old gel with lifting at the edges.",
      confidence: 93,
      observations: [
        "Old gel polish chipping near the free edge",
        "~2 mm regrowth gap visible at the cuticle",
        "Cuticles slightly overgrown onto the nail plate",
      ],
      nextStepNumber: "2",
      nextStepTitle: "Polish Removal",
      advice:
        "Start by soaking off the existing gel before any cuticle work. Wrap each nail in an acetone-soaked cotton pad, leave for 10 to 12 minutes, then gently push the softened product off with a wooden stick. Avoid scraping bare nail.",
      tip: "Lightly buff the shine off the gel first so the acetone penetrates faster.",
    },
  },
  {
    id: "bare-natural",
    filename: "IMG_5092.jpg",
    caption: "Bare natural nail",
    variant: "bare-natural",
    analysis: {
      stageNumber: "1",
      stageTitle: "Before",
      condition: "Healthy bare nail, no product to remove.",
      confidence: 89,
      observations: [
        "Bare natural nail, nothing to soak off",
        "Cuticle is dry and slightly lifted",
        "Minor surface ridges toward the tip",
      ],
      nextStepNumber: "3",
      nextStepTitle: "Push Back Cuticles",
      advice:
        "No polish to remove, so skip straight to cuticle prep. Apply a cuticle remover, wait about 60 seconds, then push the softened cuticle back gently with a wooden stick held at a low angle. Let the product do the work.",
      tip: "Skipping Step 2 here is correct. The AI flags it as optional when no polish is detected.",
    },
  },
  {
    id: "cuticles-pushed",
    filename: "IMG_5310.jpg",
    caption: "Cuticles pushed back",
    variant: "cuticles-pushed",
    analysis: {
      stageNumber: "3",
      stageTitle: "Push Back Cuticles",
      condition: "Cuticles pushed, ready to be cleaned.",
      confidence: 91,
      observations: [
        "Cuticles have been pushed back cleanly",
        "Loose dead skin (pterygium) still on the plate",
        "No trimming done yet",
      ],
      nextStepNumber: "4",
      nextStepTitle: "Clean Cuticle",
      advice:
        "The cuticles are pushed but not cleaned. Use a ball or cleanup bit (or a curette by hand) to gently lift the dead tissue off the nail plate before any trimming. Work in light passes so you don't catch living skin.",
      tip: "Keep the bit moving and flat against the plate to avoid rings of fire.",
    },
  },
];

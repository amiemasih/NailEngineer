import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const foundation = await prisma.course.create({
    data: {
      slug: "salon-foundation",
      title: "Salon Foundation",
      subtitle: "Hygiene, tools, and prep like a licensed tech",
      description:
        "Build safe, professional habits before you touch polish. Covers sanitation, nail anatomy, tool selection, and client consultation—the invisible work that makes results look expensive.",
      level: "Beginner",
      durationMins: 240,
      order: 1,
      modules: {
        create: [
          {
            title: "Safety & workspace",
            summary: "OSHA-minded setup, disinfection, and protecting skin and lungs.",
            order: 1,
            lessons: {
              create: [
                {
                  title: "The clean hand ritual",
                  durationMins: 12,
                  order: 1,
                  contentMd: `## Why sanitation is non-negotiable

Cross-contamination is the fastest way to lose trust—and in many regions, your license. Treat every service as if the next client is immunocompromised.

### Your baseline flow
1. Wash hands with soap; dry with lint-free towels.
2. Disinfect the table and lamp bases between clients.
3. Use single-use files where required; metal implements must be scrubbed, soaked, and bagged per local rules.

### Pro move
Keep a **visible** sanitation checklist at your station. Clients notice—and it justifies premium pricing.`,
                },
                {
                  title: "Ventilation & ergonomics",
                  durationMins: 10,
                  order: 2,
                  contentMd: `## Breathe easy, work longer

Dust from filing and vapors from products accumulate. A small desk fan pointed *away* from the client, plus a source-capture habit (file downward), reduces particle load.

### Ergonomics checklist
- Elbows relaxed; shoulders down.
- Wrist neutral when holding the hand—rotate the client's finger, not your wrist.
- Magnification lamp at 12–18 inches; adjust before you start, not mid-stroke.`,
                },
              ],
            },
          },
          {
            title: "Natural nail prep",
            summary: "Cuticle care, shaping, and surface prep without damage.",
            order: 2,
            lessons: {
              create: [
                {
                  title: "Shape language: file mechanics",
                  durationMins: 18,
                  order: 1,
                  contentMd: `## File direction matters

Use a **180-grit** file for natural nail shaping on most clients. Coarser grits are for length removal on enhancements only.

### Squoval vs almond
- Map the sidewalls first; the free edge follows.
- Check symmetry from the client's POV—they see the mirror image you don't.

### Rule of thumb
If the nail plate feels hot, you've filed too aggressively. Pause, oil, reassess.`,
                },
                {
                  title: "Cuticle work without trauma",
                  durationMins: 15,
                  order: 2,
                  contentMd: `## Living skin vs dead cuticle

Soften with cuticle remover or a warm soak. Push with a **rounded** pusher; never slice living tissue unless you are trained and permitted.

### The eponychium
The thin seal at the base protects the matrix. Your goal is a clean *pocket* for product, not a bloodless line at any cost.`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const gelArt = await prisma.course.create({
    data: {
      slug: "gel-structure-art",
      title: "Gel Structure & Line Art",
      subtitle: "Thin overlays, apex placement, and brush control",
      description:
        "Move from polish-only to structured gel. Learn builder application for strength without bulk, curing discipline, and fine liner techniques for salon-grade nail art.",
      level: "Intermediate",
      durationMins: 360,
      order: 2,
      modules: {
        create: [
          {
            title: "Builder gel fundamentals",
            summary: "Zones, viscosity choices, and curing you can trust.",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Apex and stress zone",
                  durationMins: 22,
                  order: 1,
                  contentMd: `## Where strength lives

The apex sits slightly back from the free edge, over the stress line. Too flat and nails flex-crack; too thick and they look like plastic.

### Layering strategy
1. Thin slip layer, cure.
2. Build body in **zones**: sidewalls, then bridge, refine with brush pressure.

### Cure hygiene
Cap the free edge every layer. Ambiguity in cure time = service breakdown in week two.`,
                },
                {
                  title: "Choosing viscosity",
                  durationMins: 14,
                  order: 2,
                  contentMd: `## Self-leveling vs builder

Self-leveling gels flow—great for overlays on disciplined nails. Thicker builders hold architecture on longer beds or when correcting ridges.

### Temperature note
Cold product drags; warm hands in pockets before service. Warm product in winter can run—reduce ambient heat at your lamp.`,
                },
              ],
            },
          },
          {
            title: "Micro line art",
            summary: "Pull lines, dots, and negative space with control.",
            order: 2,
            lessons: {
              create: [
                {
                  title: "Liner brush physics",
                  durationMins: 16,
                  order: 1,
                  contentMd: `## The stroke is in the pivot

Load the belly of a long liner, not the tip. Anchor your pinky on the table or the client's finger—**stability beats talent**.

### Practice grid
On a tip or practice card: parallel lines, S-curves, and hairpin turns. Speed comes from repetition, not pressure.

### Top coat strategy
Matte vs glossy changes perceived precision. Matte forgives micro wobble; glossy reveals every micron.`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const care = await prisma.course.create({
    data: {
      slug: "nail-health-recovery",
      title: "Nail Health & Recovery",
      subtitle: "When to pause enhancements and how to rehab",
      description:
        "Recognize common pathologies, know when to refer out, and guide clients through recovery plans—builds authority and long-term retention.",
      level: "All levels",
      durationMins: 120,
      order: 3,
      modules: {
        create: [
          {
            title: "Reading the nail plate",
            summary: "Color, texture, and separation—what to document.",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Onycholysis and moisture",
                  durationMins: 11,
                  order: 1,
                  contentMd: `## When white space isn't aesthetic

Lifting at the free edge can be mechanical or fungal-adjacent. **Don't guess in silence**—photograph, note, and refer when outside scope.

### Client coaching
Waterlogging from dish jobs or long swims changes adhesion. Recovery often means a break from overlays—not a failure, a reset.`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seeded courses:", foundation.slug, gelArt.slug, care.slug);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

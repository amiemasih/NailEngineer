import type { Promotion } from "@/lib/promotions";

export function activePromotionsForService(
  serviceId: string,
  promos: Promotion[],
): Promotion[] {
  return promos.filter(
    (p) => !p.applicableServiceIds?.length || p.applicableServiceIds.includes(serviceId),
  );
}

import { redirect } from "next/navigation";

export default function LegacyTechDashboardRedirect() {
  redirect("/tech/dashboard");
}

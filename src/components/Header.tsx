import { getSession } from "@/lib/auth";
import { HeaderShell } from "@/components/HeaderShell";

export async function Header() {
  const session = await getSession();
  return <HeaderShell session={session} />;
}

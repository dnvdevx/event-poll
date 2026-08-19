import { cookies } from "next/headers";

export const ADMIN_PASSWORD = "thanimaoc";

export async function isAdmin() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  return auth?.value === ADMIN_PASSWORD;
}
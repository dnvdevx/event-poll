import { cookies } from "next/headers";

export async function isAdmin() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  return auth?.value === process.env.ADMIN_PASSWORD;
}
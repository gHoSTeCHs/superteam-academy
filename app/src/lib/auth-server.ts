import "server-only";
import { headers } from "next/headers";
import { auth } from "./auth";

export async function getServerSession() {
  const response = await auth.api.getSession({
    headers: await headers(),
  });

  if (!response) return null;

  return { user: response.user, session: response.session };
}

"use server";

import { cookies } from "next/headers";

export async function savePersonalName(name: string) {
  const cookieStore = await cookies();

  const trimmedName = name.trim();

  if (trimmedName === "") {
    // Delete cookie if name is empty or only spaces
    cookieStore.delete("personalName");
  } else {
    // Save to cookie (expires in 1 year)
    cookieStore.set("personalName", trimmedName, {
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      path: "/",
    });
  }

  return { success: true };
}

import { redirect } from "next/navigation";

// Landing route → the HR dashboard (auth-gating comes with the NextAuth phase).
export default function Root() {
  redirect("/dashboard");
}

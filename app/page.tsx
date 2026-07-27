import { SportApp } from "./sport-app";
import { getSuiteUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getSuiteUser();
  return <SportApp user={user} />;
}

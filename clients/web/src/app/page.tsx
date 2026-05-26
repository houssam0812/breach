import { HealthStatusCard } from "../features/health/ui/HealthStatusCard";

export default async function Page() {
  return (
    <main>
      <h1>Breach Web Frontend</h1>
      <p>This is the separate web frontend codebase.</p>
      <HealthStatusCard />
    </main>
  );
}

import { getHealthStatus } from "../data/getHealth";

export async function HealthStatusCard() {
  const health = await getHealthStatus();

  return <div className="card">{health}</div>;
}

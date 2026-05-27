export type AlertPolicy = {
  name: string;
  metric: string;
  threshold: string;
  severity: "critical" | "high" | "medium";
  route: "pager" | "slack" | "email";
};

export const baselineAlertPolicies: AlertPolicy[] = [
  {
    name: "API error rate spike",
    metric: "api.error_rate_5m",
    threshold: "> 5%",
    severity: "critical",
    route: "pager",
  },
  {
    name: "Queue lag sustained",
    metric: "jobs.queue_lag_seconds",
    threshold: "> 120 for 10m",
    severity: "high",
    route: "slack",
  },
  {
    name: "Job failure spike",
    metric: "jobs.failed_count_10m",
    threshold: "> 20",
    severity: "high",
    route: "slack",
  },
];

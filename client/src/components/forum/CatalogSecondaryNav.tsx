import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { Link as RouterLink, useLocation } from "react-router-dom";

const TABS = [
  { path: "/trainings", label: "Trainings" },
  { path: "/certifications", label: "Certifications" },
  { path: "/services", label: "Services" },
] as const;

export function CatalogSecondaryNav() {
  const { pathname } = useLocation();
  const value = TABS.find((t) => pathname.startsWith(t.path))?.path ?? false;

  return (
    <Tabs
      value={value}
      variant="scrollable"
      scrollButtons="auto"
      sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", minHeight: 44 }}
    >
      {TABS.map((tab) => (
        <Tab
          key={tab.path}
          label={tab.label}
          value={tab.path}
          component={RouterLink}
          to={tab.path}
          sx={{ minHeight: 44, textTransform: "none", fontWeight: 600 }}
        />
      ))}
    </Tabs>
  );
}

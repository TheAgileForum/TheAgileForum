import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { FORUM_INK, FORUM_TEAL } from "../../lib/forum-brand";

type ResourcesPageShellProps = {
  title: string;
  summary: string;
  breadcrumbs?: { label: string; to?: string }[];
  children?: ReactNode;
};

export function ResourcesPageShell({ title, summary, breadcrumbs, children }: ResourcesPageShellProps) {
  return (
    <Stack spacing={3} sx={{ py: { xs: 1, sm: 2 } }}>
      {breadcrumbs?.length ? (
        <Breadcrumbs aria-label="Resources breadcrumb" sx={{ fontSize: "0.875rem" }}>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            if (isLast || !crumb.to) {
              return (
                <Typography key={crumb.label} color="text.primary" sx={{ fontSize: "inherit" }}>
                  {crumb.label}
                </Typography>
              );
            }
            return (
              <Link
                key={crumb.label}
                component={RouterLink}
                to={crumb.to}
                underline="hover"
                color="inherit"
                sx={{ fontSize: "inherit" }}
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      ) : null}

      <Box
        sx={{
          borderLeft: `3px solid ${FORUM_TEAL}`,
          pl: 2.5,
          py: 0.5,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ color: FORUM_INK, fontFamily: '"Fraunces", Georgia, serif', fontWeight: 560 }}
        >
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 640 }}>
          {summary}
        </Typography>
      </Box>

      {children}
    </Stack>
  );
}

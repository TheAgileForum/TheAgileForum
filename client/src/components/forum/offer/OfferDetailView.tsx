import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import type { CatalogDisplayPrice } from "../../../lib/catalog-display-price";
import type { CatalogOffering } from "../../../lib/forum-api";
import { openMentorBooking } from "../../../lib/mentor-booking";
import { EmiAffordabilityModule } from "../EmiAffordabilityModule";
import { StickyMobileCta } from "../StickyMobileCta";
import {
  OFFER_ACCENT,
  OFFER_ACCENT_DEEP,
  OFFER_INK,
  OFFER_INK_SOFT,
  OFFER_MUTED,
  OFFER_PAPER,
  type OfferPageExtras,
} from "./offerContent";

const WRAP = { width: "100%", maxWidth: 1120, mx: "auto", px: { xs: 2.5, sm: 3 } } as const;
const SECONDARY_CTA_SX = {
  minHeight: 52,
  px: 2,
  py: 1.1,
  borderRadius: "12px",
  justifyContent: "center",
  textTransform: "none",
  fontWeight: 700,
  color: OFFER_INK,
  borderColor: "rgba(15,159,143,0.28)",
  bgcolor: "rgba(15,159,143,0.08)",
  boxShadow: "inset 0 0 0 1px rgba(15,159,143,0.04)",
  "&:hover": {
    borderColor: OFFER_ACCENT,
    bgcolor: "rgba(15,159,143,0.14)",
  },
  "&:focus-visible": {
    outline: "3px solid rgba(15,159,143,0.26)",
    outlineOffset: 2,
  },
} as const;

type ScheduleOption = { id: string; label: string };

type OfferDetailViewProps = {
  offering: CatalogOffering;
  extras: OfferPageExtras;
  catalogLink: string;
  displayPrice: CatalogDisplayPrice;
  inclusions: string[];
  scheduleOptions: ScheduleOption[];
  schedulePrompt?: string;
  scheduleRef: string;
  onScheduleChange: (id: string) => void;
  onEnroll: () => void;
  onCheckout: () => void;
  adding: boolean;
  error: string | null;
  userLoggedIn: boolean;
};

function Section({
  id,
  alt,
  children,
}: {
  id?: string;
  alt?: boolean;
  children: ReactNode;
}) {
  return (
    <Box
      id={id}
      component="section"
      sx={{
        py: { xs: 5, md: 7 },
        bgcolor: alt ? "#eef3f7" : OFFER_PAPER,
        scrollMarginTop: 88,
      }}
    >
      <Box sx={WRAP}>{children}</Box>
    </Box>
  );
}

function SectionHead({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <Box sx={{ mb: 3, maxWidth: 640 }}>
      <Typography
        sx={{
          fontSize: "0.72rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight: 600,
          color: OFFER_ACCENT_DEEP,
          mb: 1,
        }}
      >
        {eyebrow}
      </Typography>
      <Typography
        variant="h3"
        component="h2"
        sx={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: OFFER_INK,
          fontSize: { xs: "1.55rem", md: "2rem" },
          mb: lead ? 1 : 0,
        }}
      >
        {title}
      </Typography>
      {lead ? (
        <Typography sx={{ color: OFFER_MUTED, fontSize: "0.98rem" }}>{lead}</Typography>
      ) : null}
    </Box>
  );
}

function Chip({ children, teal }: { children: ReactNode; teal?: boolean }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        m: 0,
        px: 1.25,
        py: 0.45,
        borderRadius: 999,
        fontSize: "0.72rem",
        fontWeight: 600,
        letterSpacing: "0.02em",
        lineHeight: 1.35,
        whiteSpace: "normal",
        wordBreak: "break-word",
        maxWidth: "100%",
        bgcolor: teal ? "rgba(15,159,143,0.14)" : "rgba(15,28,46,0.06)",
        color: teal ? OFFER_ACCENT_DEEP : OFFER_INK,
      }}
    >
      {children}
    </Box>
  );
}

export function OfferDetailView({
  offering,
  extras,
  catalogLink,
  displayPrice,
  inclusions,
  scheduleOptions,
  schedulePrompt,
  scheduleRef,
  onScheduleChange,
  onEnroll,
  onCheckout,
  adding,
  error,
  userLoggedIn,
}: OfferDetailViewProps) {
  const priceLabel = displayPrice.saleFormatted;
  const scheduleRequired = offering.scheduleBound;
  const canEnroll = !scheduleRequired || Boolean(scheduleRef);
  const durationChipLabel = offering.durationLabel
    ? offering.durationLabel
    : offering.durationHours
      ? `${offering.durationHours} hrs`
      : null;
  const showDurationChip =
    Boolean(durationChipLabel) &&
    !(
      offering.certificationName &&
      durationChipLabel &&
      offering.certificationName.toLowerCase().includes(durationChipLabel.toLowerCase())
    );
  const jumpLinks = [
    { href: "#overview", label: "Overview" },
    extras.benefits?.length ? { href: "#benefits", label: "Benefits" } : null,
    extras.demand ? { href: "#demand", label: "Demand growth" } : null,
    { href: "#learn", label: "What you'll learn" },
    extras.curriculum.length ? { href: "#curriculum", label: "Curriculum" } : null,
    scheduleRequired ? { href: "#schedule", label: "Schedule" } : null,
    extras.certImageUrl ? { href: "#cert-look", label: extras.certNavLabel ?? "Certification" } : null,
    { href: "#audience", label: "Who it's for" },
    { href: "#includes", label: "Includes" },
    { href: "#faq", label: "FAQ" },
    extras.examGuidelines ? { href: "#exam-guidelines", label: "Exam guidelines" } : null,
  ].filter(Boolean) as Array<{ href: string; label: string }>;

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box sx={{ bgcolor: OFFER_PAPER, color: OFFER_INK, pb: { xs: 10, sm: 0 } }}>
      {/* Hero */}
      <Box
        component="header"
        sx={{
          position: "relative",
          overflow: "hidden",
          color: "#e8eef4",
          py: { xs: 4.5, md: 6 },
          background: `
            radial-gradient(ellipse 80% 60% at 85% 20%, rgba(15, 159, 143, 0.22), transparent 55%),
            radial-gradient(ellipse 50% 40% at 10% 80%, rgba(15, 159, 143, 0.1), transparent 50%),
            linear-gradient(165deg, #071018 0%, ${OFFER_INK} 45%, ${OFFER_INK_SOFT} 100%)
          `,
        }}
      >
        <Box sx={WRAP}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.35fr 0.9fr" },
              gap: { xs: 3, md: 4.5 },
              alignItems: "start",
            }}
          >
            <Box>
              <Breadcrumbs
                aria-label="Catalog breadcrumb"
                sx={{
                  mb: 2,
                  "& .MuiBreadcrumbs-separator": { color: "rgba(232,238,244,0.4)" },
                  "& a": { color: "rgba(232,238,244,0.55)", "&:hover": { color: "#7ee0d4" } },
                  "& .MuiTypography-root": { color: "rgba(232,238,244,0.8)" },
                }}
              >
                <Link component={RouterLink} to={catalogLink} underline="hover">
                  Catalog
                </Link>
                <Typography>{offering.certificationName ?? offering.title}</Typography>
              </Breadcrumbs>

              <Typography
                sx={{
                  fontSize: "0.72rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: "#7ee0d4",
                  mb: 1,
                }}
              >
                {extras.heroEyebrow ?? "Scaled Agile · Live weekend workshop"}
              </Typography>

              <Typography
                component="h1"
                sx={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                  color: "#fff",
                  fontSize: { xs: "1.75rem", md: "2.35rem" },
                  maxWidth: "22ch",
                  mb: 1.5,
                }}
              >
                {offering.title}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: "center", flexWrap: "wrap" }}>
                <Typography sx={{ color: "#f5b942", letterSpacing: "0.02em", fontSize: "1.05rem" }} aria-hidden>
                  ★★★★★
                </Typography>
                <Typography sx={{ fontWeight: 700, color: "#fff" }}>{extras.rating.score}</Typography>
                <Typography sx={{ fontSize: "0.82rem", color: "rgba(232,238,244,0.62)" }}>
                  {extras.rating.meta}
                </Typography>
              </Stack>

              {offering.summary ? (
                <Typography sx={{ fontSize: "1rem", color: "rgba(232,238,244,0.82)", maxWidth: 540, mb: 2 }}>
                  {offering.summary}
                </Typography>
              ) : null}

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  columnGap: 1.25,
                  rowGap: 1.25,
                  mb: 2.5,
                }}
              >
                {extras.benefitPills.map((pill) => (
                  <Box
                    key={pill}
                    sx={{
                      m: 0,
                      px: 1.5,
                      py: 0.6,
                      borderRadius: "10px",
                      border: "1px solid rgba(255,255,255,0.12)",
                      bgcolor: "rgba(255,255,255,0.04)",
                      fontSize: "0.8rem",
                      lineHeight: 1.35,
                      color: "rgba(232,238,244,0.9)",
                      whiteSpace: "normal",
                      maxWidth: "100%",
                    }}
                  >
                    {pill}
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.25,
                }}
              >
                {extras.keyBenefits.map((b) => (
                  <Box
                    key={b.title}
                    sx={{
                      p: 1.5,
                      borderRadius: "12px",
                      bgcolor: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, color: "#fff", fontSize: "0.9rem", mb: 0.35 }}>
                      {b.title}
                    </Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: "rgba(232,238,244,0.62)" }}>
                      {b.detail}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {extras.heroImageUrl ? (
                <Box
                  sx={{
                    mt: 2.5,
                    borderRadius: "14px",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.12)",
                    maxWidth: 560,
                  }}
                >
                  <Box
                    component="img"
                    src={extras.heroImageUrl}
                    alt={extras.heroImageAlt ?? offering.title}
                    loading="eager"
                    sx={{ width: "100%", display: "block", aspectRatio: "16 / 9", objectFit: "cover" }}
                  />
                </Box>
              ) : null}
            </Box>

            {/* Pricing card */}
            <Box
              id="enroll"
              component="aside"
              sx={{
                bgcolor: "#fff",
                color: OFFER_INK,
                borderRadius: "16px",
                p: { xs: 2.25, sm: 2.75 },
                boxShadow: "0 12px 40px rgba(10, 22, 40, 0.12)",
                border: "1px solid rgba(15,28,46,0.08)",
                scrollMarginTop: 88,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  columnGap: 1.25,
                  rowGap: 1.25,
                  mb: 1.5,
                }}
              >
                <Chip teal>{extras.kindChip ?? "Certification"}</Chip>
                {offering.certificationName ? <Chip>{offering.certificationName}</Chip> : null}
                {showDurationChip && durationChipLabel ? <Chip>{durationChipLabel}</Chip> : null}
              </Box>

              <Typography
                sx={{
                  fontSize: "0.72rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: OFFER_MUTED,
                  fontWeight: 600,
                }}
              >
                Investment
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                aria-label={`Price: ${displayPrice.saleFormatted}`}
                sx={{ alignItems: "baseline", flexWrap: "wrap", mt: 0.5 }}
              >
                {displayPrice.mrpFormatted ? (
                  <Typography
                    component="s"
                    aria-label={`Original price ${displayPrice.mrpFormatted}`}
                    sx={{ color: "#7b8794", fontSize: { xs: "0.95rem", sm: "1rem" } }}
                  >
                    {displayPrice.mrpFormatted}
                  </Typography>
                ) : null}
                <Typography
                  component="span"
                  aria-label={`Current price ${displayPrice.saleFormatted}`}
                  sx={{
                    fontFamily: '"Fraunces", Georgia, serif',
                    fontWeight: 700,
                    fontSize: { xs: "2rem", md: "2.25rem" },
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                  }}
                >
                  {displayPrice.saleFormatted}
                </Typography>
              </Stack>
              {displayPrice.discountLabel ? (
                <Box
                  sx={{
                    display: "inline-flex",
                    maxWidth: "100%",
                    mt: 1,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: "999px",
                    bgcolor: "#fef3c7",
                    color: "#92400e",
                    fontSize: { xs: "0.74rem", sm: "0.78rem" },
                    fontWeight: 700,
                    lineHeight: 1.35,
                    whiteSpace: "normal",
                  }}
                >
                  {displayPrice.discountLabel}
                </Box>
              ) : null}
              {scheduleRequired ? (
                <Box sx={{ mt: 1.25, mb: 1 }}>
                  <Typography sx={{ color: OFFER_MUTED, fontSize: "0.85rem", fontWeight: 700 }}>
                    Select Schedule:
                  </Typography>
                  {schedulePrompt ? (
                    <Typography sx={{ color: OFFER_MUTED, fontSize: "0.85rem", mt: 0.2 }}>
                      {schedulePrompt}
                    </Typography>
                  ) : null}
                </Box>
              ) : (
                <Typography sx={{ color: OFFER_MUTED, fontSize: "0.85rem", mt: 0.75, mb: 1 }}>
                  Ready to enroll
                </Typography>
              )}

              <EmiAffordabilityModule
                amount={offering.priceQuote?.amount ?? offering.defaultUnitPrice}
                currency={offering.priceQuote?.currency ?? offering.currency}
                offerId={offering.code}
                installmentPlans={offering.priceQuote?.installmentPlans}
              />
              <Typography sx={{ color: OFFER_MUTED, fontSize: "0.8rem", mt: 0.75, mb: 2 }}>
                Or book a mentor call before you enroll
              </Typography>

              <Stack spacing={1}>
                {scheduleRequired ? (
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => scrollTo("schedule")}
                    sx={{ fontWeight: 700 }}
                  >
                    Select Schedule
                  </Button>
                ) : null}
                <Button
                  variant={scheduleRequired ? "outlined" : "contained"}
                  size="large"
                  fullWidth
                  disabled={adding || !canEnroll}
                  onClick={() => void onEnroll()}
                  sx={{ fontWeight: 700 }}
                >
                  {adding ? "Adding…" : "Enroll now"}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  href={extras.brochureMailto}
                  target={extras.brochureMailto.startsWith("http") ? "_blank" : undefined}
                  rel={extras.brochureMailto.startsWith("http") ? "noopener noreferrer" : undefined}
                  startIcon={<DownloadOutlinedIcon fontSize="small" />}
                  sx={SECONDARY_CTA_SX}
                >
                  {extras.brochureCtaLabel ?? "Download Course Content & Brochure"}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => openMentorBooking()}
                  startIcon={<CalendarMonthOutlinedIcon fontSize="small" />}
                  sx={SECONDARY_CTA_SX}
                >
                  Book mentor
                </Button>
              </Stack>

              <Box sx={{ mt: 2.5, pt: 2, borderTop: "1px solid rgba(15,28,46,0.1)" }}>
                <Typography sx={{ fontWeight: 600, fontSize: "0.88rem", mb: 1 }}>What&apos;s included</Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.25 }}>
                  {inclusions.slice(0, 5).map((item) => (
                    <Typography
                      key={item}
                      component="li"
                      variant="body2"
                      sx={{ color: OFFER_MUTED, mb: 0.5 }}
                    >
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>

              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 2, color: OFFER_MUTED, fontSize: "0.78rem", justifyContent: "center" }}
              >
                <span>Secure checkout</span>
                <span>·</span>
                <span>{extras.trustLine ?? "SPC-led delivery"}</span>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Jump nav */}
      <Box
        sx={{
          position: "sticky",
          top: { xs: 56, sm: 72 },
          zIndex: 20,
          bgcolor: "rgba(243,246,249,0.92)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(15,28,46,0.1)",
          overflowX: "auto",
        }}
      >
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ ...WRAP, py: 1, flexWrap: "nowrap", width: "max-content", minWidth: "100%" }}
        >
          {jumpLinks.map((link) => (
            <Button
              key={link.href}
              size="small"
              href={link.href}
              sx={{
                color: OFFER_MUTED,
                fontWeight: 500,
                fontSize: "0.8rem",
                whiteSpace: "nowrap",
                "&:hover": { color: OFFER_ACCENT_DEEP },
              }}
            >
              {link.label}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* Overview */}
      <Section id="overview" alt>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr" },
            gap: 4,
          }}
        >
          <Box>
            <SectionHead eyebrow="Course overview" title={extras.overviewTitle} />
            <Typography sx={{ color: OFFER_MUTED, mb: 2 }}>{extras.overviewBody}</Typography>
            {extras.overviewPracticeTitle || extras.overviewPracticeBody ? (
              <>
                <Typography sx={{ fontWeight: 600, mb: 0.75 }}>
                  {extras.overviewPracticeTitle ?? "Key responsibilities you'll practice"}
                </Typography>
                <Typography sx={{ color: OFFER_MUTED }}>
                  {extras.overviewPracticeBody ??
                    "Team and program facilitation (including PI Planning), coaching with powerful questions, cross-team dependency management, flow and quality practices, and preparing for Inspect & Adapt."}
                </Typography>
              </>
            ) : null}
            {extras.overviewExpectationsTitle || extras.overviewExpectationsBody ? (
              <>
                <Typography sx={{ fontWeight: 600, mt: 2.25, mb: 0.75 }}>
                  {extras.overviewExpectationsTitle ?? "What you can expect"}
                </Typography>
                <Typography sx={{ color: OFFER_MUTED }}>{extras.overviewExpectationsBody}</Typography>
              </>
            ) : null}
          </Box>
          <Stack spacing={1.5}>
            {extras.overviewStats.map((stat) => (
              <Box
                key={stat.num}
                sx={{
                  p: 2,
                  borderRadius: "14px",
                  bgcolor: "#fff",
                  border: "1px solid rgba(15,28,46,0.08)",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Fraunces", Georgia, serif',
                    fontWeight: 600,
                    fontSize: "1.35rem",
                    color: OFFER_ACCENT_DEEP,
                  }}
                >
                  {stat.num}
                </Typography>
                <Typography sx={{ color: OFFER_MUTED, fontSize: "0.85rem" }}>{stat.label}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Section>

      {/* Mentorship benefits */}
      {extras.benefits?.length ? (
        <Section id="benefits">
          <SectionHead
            eyebrow="Mentorship benefits"
            title={extras.benefitsTitle ?? "Why this mentorship works"}
            lead={extras.benefitsLead}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
              gap: 2.25,
            }}
          >
            {extras.benefits.map((benefit) => (
              <Box
                key={benefit.title}
                component="article"
                sx={{
                  minWidth: 0,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  bgcolor: "#fff",
                  border: "1px solid rgba(15,28,46,0.1)",
                  borderRadius: "16px",
                  boxShadow: "0 8px 26px rgba(10,22,40,0.06)",
                }}
              >
                <Box
                  sx={{
                    height: { xs: 164, sm: 180 },
                    p: 2.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    background:
                      "radial-gradient(circle at 50% 10%, rgba(15,159,143,0.12), transparent 55%), linear-gradient(145deg, #f9fbfc, #e8eef4)",
                    borderBottom: "1px solid rgba(15,28,46,0.1)",
                  }}
                >
                  {benefit.images.map((image) => (
                    <Box
                      key={image.src}
                      component="img"
                      src={image.src}
                      alt={image.alt}
                      loading="lazy"
                      sx={{
                        width: benefit.images.length > 1 ? "calc(50% - 8px)" : "100%",
                        maxWidth: benefit.images.length > 1 ? 128 : "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  ))}
                </Box>
                <Box sx={{ p: 2.5, display: "flex", flex: 1, flexDirection: "column" }}>
                  <Typography component="h3" sx={{ fontWeight: 700, fontSize: "1rem", lineHeight: 1.35, mb: 1 }}>
                    {benefit.title}
                  </Typography>
                  <Typography sx={{ color: OFFER_MUTED, fontSize: "0.86rem" }}>{benefit.detail}</Typography>
                  {benefit.note ? (
                    <Typography
                      sx={{
                        color: OFFER_ACCENT_DEEP,
                        fontSize: "0.72rem",
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: "1px solid rgba(15,28,46,0.1)",
                      }}
                    >
                      {benefit.note}
                    </Typography>
                  ) : null}
                </Box>
              </Box>
            ))}
          </Box>
        </Section>
      ) : null}

      {/* Demand growth */}
      {extras.demand ? (
        <Section id="demand">
          <SectionHead
            eyebrow="Career signal"
            title="Significant Demand Growth"
            lead="Scrum Master talent stays in demand as enterprises scale Agile — salary, employers, and openings at a glance."
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 2,
              mb: 3,
            }}
          >
            <DemandCard title="Annual Salary">
              <Stack direction="row" spacing={2} sx={{ height: 140, justifyContent: "center", alignItems: "flex-end" }}>
                {[
                  { label: "Min", val: extras.demand.salary.min, h: 48 },
                  { label: "Max", val: extras.demand.salary.max, h: 110 },
                  { label: "Average", val: extras.demand.salary.avg, h: 72 },
                ].map((bar) => (
                  <Stack key={bar.label} spacing={0.5} sx={{ alignItems: "center" }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>{bar.val}</Typography>
                    <Box
                      sx={{
                        width: 36,
                        height: bar.h,
                        borderRadius: "8px 8px 4px 4px",
                        bgcolor: OFFER_ACCENT,
                        opacity: bar.label === "Average" ? 1 : 0.55,
                      }}
                    />
                    <Typography sx={{ fontSize: "0.72rem", color: OFFER_MUTED }}>{bar.label}</Typography>
                  </Stack>
                ))}
              </Stack>
            </DemandCard>
            <DemandCard title="Hiring Companies">
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {extras.demand.employers.map((name) => (
                  <Box
                    key={name}
                    sx={{
                      px: 1.25,
                      py: 0.6,
                      borderRadius: "999px",
                      bgcolor: "rgba(15,159,143,0.1)",
                      color: OFFER_ACCENT_DEEP,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                    }}
                  >
                    {name}
                  </Box>
                ))}
              </Box>
            </DemandCard>
            <DemandCard title="Available Jobs">
              <Typography
                sx={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontWeight: 700,
                  fontSize: "2.25rem",
                  color: OFFER_ACCENT_DEEP,
                  textAlign: "center",
                }}
              >
                {extras.demand.jobsCount}
              </Typography>
              <Typography sx={{ color: OFFER_MUTED, textAlign: "center", fontSize: "0.88rem" }}>
                {extras.demand.jobsLabel}
              </Typography>
            </DemandCard>
          </Box>
          <Stack spacing={1}>
            {extras.demand.paragraphs.map((p) => (
              <Typography key={p} sx={{ color: OFFER_MUTED, fontSize: "0.92rem" }}>
                {p}
              </Typography>
            ))}
          </Stack>
        </Section>
      ) : null}

      {/* What you'll learn */}
      <Section id="learn" alt>
        <SectionHead
          eyebrow="Outcomes"
          title="What you'll learn"
          lead={extras.learnLead ?? "Skills you can use on Monday after the workshop."}
        />
        {extras.videoUrl && extras.videoThumb ? (
          <Box sx={{ mb: 3.5 }}>
            {extras.videoCaption ? (
              <Typography sx={{ color: OFFER_MUTED, mb: 1.25, fontSize: "0.9rem" }}>
                {extras.videoCaption}
              </Typography>
            ) : null}
            <Box
              component="a"
              href={extras.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={extras.videoCaption ?? "Watch course video"}
              sx={{
                position: "relative",
                display: "block",
                borderRadius: "14px",
                overflow: "hidden",
                border: "1px solid rgba(15,28,46,0.1)",
                "&:hover .play-badge": { transform: "scale(1.06)" },
              }}
            >
              <Box
                component="img"
                src={extras.videoThumb}
                alt="Course overview video thumbnail"
                loading="lazy"
                sx={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover", display: "block" }}
              />
              <Box
                className="play-badge"
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  transition: "transform 0.2s ease",
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: "rgba(10,22,40,0.78)",
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                  }}
                >
                  <PlayArrowIcon sx={{ fontSize: 36 }} />
                </Box>
              </Box>
            </Box>
          </Box>
        ) : null}
        {offering.learningOutcomes?.length ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
              gap: 1.5,
            }}
          >
            {offering.learningOutcomes.map((item, i) => (
              <Box
                key={item}
                sx={{
                  p: 2,
                  borderRadius: "14px",
                  bgcolor: "#fff",
                  border: "1px solid rgba(15,28,46,0.08)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: OFFER_ACCENT,
                    letterSpacing: "0.08em",
                    mb: 0.75,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>{item}</Typography>
              </Box>
            ))}
          </Box>
        ) : null}
      </Section>

      {/* Curriculum */}
      {extras.curriculum.length ? (
        <Section id="curriculum">
          <SectionHead
            eyebrow="Curriculum"
            title={extras.curriculumTitle ?? "Modules that mirror how ARTs really work"}
            lead={
              extras.curriculumLead ??
              `${extras.curriculum.length} modules — from foundations through PI planning, iteration execution, and AI for Scrum Masters.`
            }
          />
          {extras.curriculum.map((mod, i) => (
            <Accordion
              key={mod.title}
              defaultExpanded={i === 0}
              disableGutters
              elevation={0}
              sx={{
                mb: 1,
                borderRadius: "12px !important",
                border: "1px solid rgba(15,28,46,0.1)",
                bgcolor: "#fff",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "8px",
                      bgcolor: "rgba(15,159,143,0.14)",
                      color: OFFER_ACCENT_DEEP,
                      display: "grid",
                      placeItems: "center",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                    }}
                  >
                    {i + 1}
                  </Box>
                  <Typography sx={{ fontWeight: 600 }}>{mod.title}</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ color: OFFER_MUTED, mb: mod.bullets?.length ? 1 : 0 }}>
                  {mod.summary}
                </Typography>
                {mod.bullets?.length ? (
                  <Box component="ul" sx={{ m: 0, pl: 2.25 }}>
                    {mod.bullets.map((b) => (
                      <Typography key={b} component="li" variant="body2" sx={{ color: OFFER_MUTED, mb: 0.4 }}>
                        {b}
                      </Typography>
                    ))}
                  </Box>
                ) : null}
              </AccordionDetails>
            </Accordion>
          ))}
        </Section>
      ) : null}

      {/* Schedule */}
      {scheduleRequired ? (
        <Section id="schedule" alt>
          <SectionHead
            eyebrow="Upcoming batches"
            title="Pick a schedule that fits"
            lead="Schedule is attached to your cart line before checkout."
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            {scheduleOptions.map((opt, idx) => {
              const selected = scheduleRef === opt.id;
              return (
                <Box
                  key={opt.id}
                  sx={{
                    p: 2.5,
                    borderRadius: "14px",
                    bgcolor: "#fff",
                    border: selected ? `2px solid ${OFFER_ACCENT}` : "1px solid rgba(15,28,46,0.1)",
                    boxShadow: selected ? "0 8px 24px rgba(15,159,143,0.15)" : "none",
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>{opt.label}</Typography>
                      <Typography sx={{ color: OFFER_MUTED, fontSize: "0.85rem", mt: 0.5 }}>
                        Live virtual · Mentor-led
                      </Typography>
                    </Box>
                    {idx === 0 ? <Chip teal>Next cohort</Chip> : <Chip>Open</Chip>}
                  </Stack>
                  <Typography
                    sx={{
                      mt: 1.5,
                      mb: 2,
                      fontSize: "0.85rem",
                      color: selected ? OFFER_ACCENT_DEEP : OFFER_MUTED,
                      fontWeight: selected ? 600 : 400,
                    }}
                  >
                    {selected ? "Selected · Continue to enroll" : "Select to continue"}
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <Button
                      variant={selected ? "contained" : "outlined"}
                      onClick={() => onScheduleChange(opt.id)}
                      sx={{ fontWeight: 700 }}
                    >
                      {selected ? "Selected" : "Select this schedule"}
                    </Button>
                    <Button
                      variant="text"
                      disabled={!selected || adding}
                      onClick={() => void onEnroll()}
                      sx={{ fontWeight: 600 }}
                    >
                      Enroll
                    </Button>
                  </Stack>
                </Box>
              );
            })}
          </Box>
          {error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : null}
        </Section>
      ) : null}

      {/* Certification look */}
      {extras.certImageUrl ? (
        <Section id="cert-look">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.85fr 1.15fr" },
              gap: 4,
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid rgba(15,28,46,0.1)",
                bgcolor: "#fff",
                boxShadow: "0 12px 40px rgba(10, 22, 40, 0.1)",
              }}
            >
              <Box
                component="img"
                src={extras.certImageUrl}
                alt={extras.certImageAlt ?? "Program credential or experience"}
                loading="lazy"
                sx={{ width: "100%", display: "block" }}
              />
            </Box>
            <Box>
              <SectionHead
                eyebrow={extras.certSectionEyebrow ?? "Your credential"}
                title={
                  extras.certSectionTitle ??
                  "How your AI-Empowered SAFe Scrum Master Certification looks like"
                }
                lead={
                  extras.certSectionLead ??
                  "Industry-recognized credential after you pass the official exam — shareable badge and proof of role-ready facilitation skills."
                }
              />
              <Box component="ul" sx={{ m: 0, pl: 0, listStyle: "none" }}>
                {(extras.certBullets ?? []).map((b) => (
                  <Stack key={b} direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Typography sx={{ color: OFFER_ACCENT, fontWeight: 700 }}>✓</Typography>
                    <Typography sx={{ color: OFFER_MUTED }}>{b}</Typography>
                  </Stack>
                ))}
              </Box>
            </Box>
          </Box>
        </Section>
      ) : null}

      {/* Who it's for */}
      <Section id="audience" alt>
        <SectionHead
          eyebrow="Audience"
          title={extras.audienceTitle ?? "Who should attend"}
          lead={
            extras.audienceLead ??
            "Built for people stepping into — or leveling up — the Scrum Master role inside SAFe."
          }
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 1.5,
          }}
        >
          {extras.audience.map((a) => (
            <Box
              key={a.role}
              sx={{
                p: 2.25,
                borderRadius: "14px",
                bgcolor: "#fff",
                border: "1px solid rgba(15,28,46,0.08)",
              }}
            >
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{a.role}</Typography>
              <Typography sx={{ color: OFFER_MUTED, fontSize: "0.9rem" }}>{a.detail}</Typography>
            </Box>
          ))}
        </Box>
      </Section>

      {/* Includes */}
      <Section id="includes" alt={!extras.certImageUrl}>
        <SectionHead
          eyebrow="What's in the box"
          title="Everything in your enrollment"
          lead="Transparent inclusions from the catalog — no plan-matrix maze."
        />
        <Box
          component="ul"
          sx={{
            m: 0,
            p: 0,
            listStyle: "none",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 1.25,
            mb: 3,
          }}
        >
          {inclusions.map((item) => (
            <Stack
              key={item}
              direction="row"
              spacing={1.25}
              sx={{
                p: 1.75,
                borderRadius: "12px",
                bgcolor: "#fff",
                border: "1px solid rgba(15,28,46,0.08)",
              }}
            >
              <Typography sx={{ color: OFFER_ACCENT, fontWeight: 700 }}>✓</Typography>
              <Typography sx={{ fontSize: "0.92rem" }}>{item}</Typography>
            </Stack>
          ))}
        </Box>
        <Box
          id="brochure"
          sx={{
            p: 2.5,
            borderRadius: "14px",
            bgcolor: "rgba(15,159,143,0.08)",
            border: "1px solid rgba(15,159,143,0.2)",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { sm: "center" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography sx={{ fontSize: "0.95rem" }}>
            <strong>{extras.brochureCtaLabel ?? "Download Course Content & Brochure"}</strong>
            {" — "}
            module outline, outcomes, and cohort details.
          </Typography>
          <Button
            variant="contained"
            href={extras.brochureMailto}
            target={extras.brochureMailto.startsWith("http") ? "_blank" : undefined}
            rel={extras.brochureMailto.startsWith("http") ? "noopener noreferrer" : undefined}
            sx={{ fontWeight: 700, flexShrink: 0 }}
          >
            {extras.brochureMailto.startsWith("http") ? "Download syllabus" : "Download brochure"}
          </Button>
        </Box>
      </Section>

      {/* Mentor */}
      <Section id="mentor">
        <Box
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: "16px",
            background: `linear-gradient(135deg, ${OFFER_INK} 0%, ${OFFER_INK_SOFT} 100%)`,
            color: "#e8eef4",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2.5,
            alignItems: { sm: "center" },
          }}
        >
          {extras.mentorImageUrl ? (
            <Box
              component="img"
              src={extras.mentorImageUrl}
              alt={extras.mentorName ?? "Program mentor"}
              loading="lazy"
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
                border: "2px solid rgba(126,224,212,0.45)",
              }}
            />
          ) : (
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "rgba(15,159,143,0.35)",
                flexShrink: 0,
              }}
              aria-hidden
            />
          )}
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: "#7ee0d4",
                mb: 0.75,
              }}
            >
              {extras.mentorName ? `Mentor · ${extras.mentorName}` : "Mentor-first, not brochure-first"}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontWeight: 600,
                fontSize: "1.35rem",
                color: "#fff",
                mb: 0.75,
              }}
            >
              {extras.mentorHeadline ?? "Talk to a mentor before you commit"}
            </Typography>
            <Typography sx={{ color: "rgba(232,238,244,0.72)", mb: 2, maxWidth: 520 }}>
              {extras.mentorBody ??
                "Not sure if this is the right next step? Book a short mentor conversation — role fit, cohort timing, and whether mock interview add-ons help your goal."}
            </Typography>
            <Button
              variant="contained"
              onClick={() => openMentorBooking()}
              sx={{ fontWeight: 700, bgcolor: OFFER_ACCENT, "&:hover": { bgcolor: OFFER_ACCENT_DEEP } }}
            >
              Book mentor call
            </Button>
          </Box>
        </Box>
      </Section>

      {/* FAQ */}
      <Section id="faq" alt>
        <SectionHead
          eyebrow="FAQ"
          title="Common questions"
          lead="Clear answers — training logistics plus official exam basics."
        />
        <Stack spacing={3}>
          {extras.faqGroups.map((group) => (
            <Box key={group.title}>
              <Typography sx={{ fontWeight: 700, mb: 1.25, fontSize: "1.05rem" }}>{group.title}</Typography>
              {group.items.map((item, i) => (
                <Accordion
                  key={item.question}
                  defaultExpanded={i === 0}
                  disableGutters
                  elevation={0}
                  sx={{
                    mb: 1,
                    borderRadius: "12px !important",
                    border: "1px solid rgba(15,28,46,0.1)",
                    bgcolor: "#fff",
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>{item.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography sx={{ color: OFFER_MUTED }}>{item.answer}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ))}
        </Stack>
      </Section>

      {/* Exam guidelines */}
      {extras.examGuidelines ? (
        <Section id="exam-guidelines">
          <SectionHead
            eyebrow="Official exam"
            title="Exam guidelines"
            lead="Domain weighting from Scaled Agile’s SAFe Scrum Master certification page — use this with your workshop notes and practice exam."
          />
          <Box
            sx={{
              overflowX: "auto",
              borderRadius: "14px",
              border: "1px solid rgba(15,28,46,0.1)",
              bgcolor: "#fff",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: OFFER_INK, color: "#fff" }}>Domain</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: OFFER_INK, color: "#fff" }}>Topics</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {extras.examGuidelines.domains.map((row) => (
                  <TableRow key={row.domain}>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        verticalAlign: "top",
                        width: { md: "36%" },
                        borderColor: "rgba(15,28,46,0.08)",
                      }}
                    >
                      {row.domain}
                    </TableCell>
                    <TableCell sx={{ borderColor: "rgba(15,28,46,0.08)" }}>
                      <Box component="ul" sx={{ m: 0, pl: 2.25 }}>
                        {row.topics.map((t) => (
                          <Typography key={t} component="li" variant="body2" sx={{ color: OFFER_MUTED, mb: 0.35 }}>
                            {t}
                          </Typography>
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          <Typography sx={{ mt: 2, color: OFFER_MUTED, fontSize: "0.85rem" }}>
            {extras.examGuidelines.footnote} Source:{" "}
            <Link href={extras.examGuidelines.sourceUrl} target="_blank" rel="noopener noreferrer">
              scaledagile.com/certification/scrum-master
            </Link>
          </Typography>
        </Section>
      ) : null}

      {/* Final CTA + corporate */}
      <Section alt>
        <Box
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: "16px",
            background: `linear-gradient(135deg, ${OFFER_INK} 0%, ${OFFER_INK_SOFT} 100%)`,
            color: "#fff",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { md: "center" },
            justifyContent: "space-between",
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontWeight: 600,
                fontSize: "1.45rem",
                mb: 0.75,
              }}
            >
              {extras.finalCtaTitle ?? "Ready to facilitate at scale?"}
            </Typography>
            <Typography sx={{ color: "rgba(232,238,244,0.72)" }}>
              {extras.finalCtaLead ??
                `Select your schedule, enroll at ${priceLabel}, or book a mentor if you want a second opinion first.`}
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            {scheduleRequired ? (
              <Button
                variant="contained"
                onClick={() => scrollTo("schedule")}
                sx={{ fontWeight: 700, bgcolor: OFFER_ACCENT, "&:hover": { bgcolor: OFFER_ACCENT_DEEP } }}
              >
                Select Schedule
              </Button>
            ) : (
              <Button
                variant="contained"
                disabled={adding}
                onClick={() => void onEnroll()}
                sx={{ fontWeight: 700, bgcolor: OFFER_ACCENT, "&:hover": { bgcolor: OFFER_ACCENT_DEEP } }}
              >
                Enroll now
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={() => openMentorBooking()}
              sx={{ fontWeight: 600, color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}
            >
              Book mentor
            </Button>
          </Stack>
        </Box>

        <Box
          sx={{
            p: 2.5,
            borderRadius: "14px",
            bgcolor: "#fff",
            border: "1px solid rgba(15,28,46,0.1)",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { sm: "center" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography>
            <strong>Corporate Training or more than 5 people — Contact us</strong> for private cohorts, custom
            schedules, and volume pricing.
          </Typography>
          <Button variant="contained" href={extras.corporateMailto} sx={{ fontWeight: 700, flexShrink: 0 }}>
            Contact us
          </Button>
        </Box>

        {!scheduleRequired && error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3 }}>
          <Button variant="outlined" component={RouterLink} to="/cart" size="large">
            View cart
          </Button>
          <Button variant="text" size="large" onClick={onCheckout}>
            {userLoggedIn ? "Checkout" : "Sign in to checkout"}
          </Button>
        </Stack>
      </Section>

      <StickyMobileCta
        label={scheduleRequired && !scheduleRef ? "Select Schedule" : "Enroll now"}
        disabled={adding}
        onClick={() => {
          if (scheduleRequired && !scheduleRef) {
            scrollTo("schedule");
            return;
          }
          void onEnroll();
        }}
        secondary={
          <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.8rem", textAlign: "center" }}>
            {priceLabel} · Secure checkout
          </Typography>
        }
      />
    </Box>
  );
}

function DemandCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box
      sx={{
        p: 2.25,
        borderRadius: "14px",
        bgcolor: "#fff",
        border: "1px solid rgba(15,28,46,0.08)",
        minHeight: 200,
      }}
    >
      <Typography sx={{ fontWeight: 700, mb: 2 }}>{title}</Typography>
      {children}
    </Box>
  );
}

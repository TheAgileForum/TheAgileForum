import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TelegramIcon from "@mui/icons-material/Telegram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import YouTubeIcon from "@mui/icons-material/YouTube";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

const INK = "#0a1628";
const TEAL = "#0f9f8f";

const EXPLORE_LINKS = [
  { label: "Trainings", to: "/trainings" },
  { label: "Certifications", to: "/certifications" },
  { label: "Services", to: "/services" },
  { label: "Resources", to: "/resources" },
  { label: "Webinars", to: "/webinars" },
  { label: "Assessment", to: "/diagnosis/step-1" },
] as const;

const COMPANY_LINKS = [
  { label: "About", to: "/about" },
  { label: "Contact", href: "mailto:contact@theagileforum.com" },
  {
    label: "WhatsApp",
    href: "https://wa.me/+13322662360?text=Hi_TheAgileForum,I'm_interested_in_trainings_and_certification_program",
  },
] as const;

const LEGAL_LINKS = [
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
  { label: "Refund policy", to: "/refund-policy" },
] as const;

const SOCIAL_LINKS = [
  {
    label: "WhatsApp",
    href: "https://wa.me/+13322662360?text=Hi_TheAgileForum,I'm_interested_in_trainings_and_certification_program",
    Icon: WhatsAppIcon,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UC6TPM50YEN9kjS1zVoPwbGA",
    Icon: YouTubeIcon,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/theagileforum",
    Icon: LinkedInIcon,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/agileforum/",
    Icon: InstagramIcon,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/TheAgileForum",
    Icon: FacebookIcon,
  },
  {
    label: "Telegram",
    href: "https://t.me/ScrumMasterCertification",
    Icon: TelegramIcon,
  },
] as const;

const columnTitleSx = {
  color: "rgba(255,255,255,0.55)",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  fontSize: "0.7rem",
  fontWeight: 600,
  mb: 1.5,
};

const footerLinkSx = {
  color: "rgba(255,255,255,0.78)",
  textDecoration: "none",
  fontSize: "0.875rem",
  display: "block",
  py: 0.35,
  "&:hover": { color: TEAL },
};

function FooterColumnTitle({ children }: { children: string }) {
  return <Typography sx={columnTitleSx}>{children}</Typography>;
}

export function TrustFooter() {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        bgcolor: INK,
        color: "rgba(255,255,255,0.85)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Box
        sx={{
          maxWidth: 1100,
          mx: "auto",
          px: { xs: 2.5, sm: 3 },
          pt: { xs: 5, md: 6 },
          pb: { xs: 3, md: 4 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gap: { xs: 4, md: 5 },
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1.4fr 1fr 1fr",
              md: "1.6fr 1fr 1fr",
            },
          }}
        >
          <Stack spacing={1.5}>
            <Box
              component={RouterLink}
              to="/"
              sx={{ display: "inline-flex", textDecoration: "none", alignSelf: "flex-start" }}
            >
              <Box
                component="img"
                src="/logo-the-agile-forum.png"
                alt="The Agile Forum"
                sx={{ height: 36, width: "auto", display: "block" }}
              />
            </Box>
            <Typography
              sx={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: "1.05rem",
                color: "rgba(255,255,255,0.92)",
                fontWeight: 560,
              }}
            >
              Develop. Grow. Succeed.
            </Typography>
            <Link
              href="mailto:contact@theagileforum.com"
              sx={{ ...footerLinkSx, color: TEAL, "&:hover": { color: "#12b5a3" } }}
            >
              contact@theagileforum.com
            </Link>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)", pt: 0.5 }}>
              Connect &amp; follow
            </Typography>
            <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: "wrap" }}>
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <IconButton
                  key={label}
                  component="a"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  size="small"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    "&:hover": { color: TEAL, bgcolor: "rgba(15,159,143,0.12)" },
                  }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              ))}
            </Stack>
          </Stack>

          <Box>
            <FooterColumnTitle>Explore</FooterColumnTitle>
            <Stack spacing={0.25}>
              {EXPLORE_LINKS.map((item) => (
                <Link key={item.to} component={RouterLink} to={item.to} sx={footerLinkSx}>
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Box>

          <Box>
            <FooterColumnTitle>Company</FooterColumnTitle>
            <Stack spacing={0.25}>
              {COMPANY_LINKS.map((item) =>
                "to" in item ? (
                  <Link key={item.label} component={RouterLink} to={item.to} sx={footerLinkSx}>
                    {item.label}
                  </Link>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={item.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                    sx={footerLinkSx}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </Stack>
            <Typography
              variant="body2"
              sx={{ mt: 2.5, color: "rgba(255,255,255,0.45)", maxWidth: 260, lineHeight: 1.55 }}
            >
              Practical Scrum &amp; SAFe paths with mentor-guided clarity — not a generic course dump.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            mt: { xs: 4, md: 5 },
            pt: 2.5,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { sm: "center" },
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap" }}>
            {LEGAL_LINKS.map((item) => (
              <Link key={item.to} component={RouterLink} to={item.to} sx={{ ...footerLinkSx, fontSize: "0.8rem" }}>
                {item.label}
              </Link>
            ))}
          </Stack>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)" }}>
            ©{year} TheAgileForum. All Rights Reserved.
          </Typography>
        </Box>

        <Typography
          variant="caption"
          sx={{ display: "block", mt: 1.5, color: "rgba(255,255,255,0.35)", textAlign: { sm: "right" } }}
        >
          Trusted by agile practitioners · Secure checkout · Consent-first assessment
        </Typography>
      </Box>
    </Box>
  );
}

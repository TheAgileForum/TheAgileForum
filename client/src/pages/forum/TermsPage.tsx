import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

const INK = "#0a1628";
const TEAL = "#0f9f8f";

const LAST_UPDATED = "July 11, 2026";

type SectionProps = {
  title: string;
  children: ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <Box component="section">
      <Typography
        variant="h6"
        component="h2"
        sx={{ color: INK, fontWeight: 600, fontSize: "1.05rem", mb: 1 }}
      >
        {title}
      </Typography>
      <Stack spacing={1.25}>{children}</Stack>
    </Box>
  );
}

function P({ children }: { children: ReactNode }) {
  return (
    <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
      {children}
    </Typography>
  );
}

export function TermsPage() {
  return (
    <Stack spacing={3} sx={{ py: { xs: 1, sm: 2 }, maxWidth: 720 }}>
      <Box sx={{ borderLeft: `3px solid ${TEAL}`, pl: 2.5, py: 0.5 }}>
        <Typography
          variant="h4"
          sx={{ color: INK, fontFamily: '"Fraunces", Georgia, serif', fontWeight: 560 }}
        >
          Terms and conditions
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 560 }}>
          Rules that govern use of The Agile Forum site, online virtual training, assessments,
          programs, and related digital services.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Last updated: {LAST_UPDATED}
        </Typography>
      </Box>

      <Section title="1. Acceptance of Terms">
        <P>
          The Agile Forum (“we”, “us”) provides a career and education platform for Agile
          professionals — including assessments, learning recommendations, online virtual
          trainings, certifications, and mentor-guided services. By accessing or using
          theagileforum.com and related digital services (the “Site”), you agree to these Terms
          and Conditions. If you do not agree, do not use the Site.
        </P>
        <P>
          You must be old enough to form a binding contract in your jurisdiction (typically 18
          or older). We may change, suspend, or discontinue features of the Site at any time.
        </P>
      </Section>

      <Section title="2. Payment and Registration">
        <P>
          Registration for online virtual training and other paid offerings requires accurate,
          complete information. You agree to keep your account details current, protect your
          login credentials, and notify us promptly if you suspect unauthorized access. You are
          responsible for activity under your account.
        </P>
        <P>
          Prices are shown in the currency indicated at checkout. Payment is processed by our
          payment providers (for example Razorpay). By completing a purchase you authorize the
          charge for the selected items and are responsible for applicable taxes where required.
          Program details (format, schedule, inclusions) may be updated before purchase; the
          checkout and confirmation materials control what you buy. Failed or disputed payments
          may result in delayed or revoked access until the issue is resolved.
        </P>
      </Section>

      <Section title="3. Intellectual Property">
        <P>
          Course materials, videos, documents, assessment content, branding, layouts, and other
          Site content are owned by The Agile Forum or its licensors and are protected by
          intellectual property laws. You receive a limited, non-exclusive, non-transferable
          license to access purchased or free content for your own learning. You may not copy,
          redistribute, sell, scrape, reverse engineer, or create derivative works from our
          materials except as we expressly allow in writing or as required by law.
        </P>
      </Section>

      <Section title="4. Code of Conduct">
        <P>
          You agree to use the Site and our services in compliance with all applicable laws and
          these terms. You may not use the Site for any illegal or unauthorized purpose. Without
          limitation, you agree not to:
        </P>
        <Box
          component="ul"
          sx={{
            m: 0,
            pl: 2.5,
            color: "text.secondary",
            "& li": { lineHeight: 1.7, mb: 0.5 },
          }}
        >
          <li>Harass, defraud, or harm others, or violate applicable law</li>
          <li>Share account access, assessment answers for cheating, or paid materials with unauthorized parties</li>
          <li>Attempt to disrupt, probe, or gain unauthorized access to systems or other users’ data</li>
          <li>Upload malware or use bots/scrapers in ways that overload or abuse the Site</li>
          <li>Misrepresent your identity, affiliation, or credentials in connection with the Site</li>
        </Box>
      </Section>

      <Section title="5. Cancellation and Refund Policy">
        <P>
          Cancellation eligibility, refund timelines, and how to request a refund are described
          in our{" "}
          <Link component={RouterLink} to="/refund-policy" sx={{ color: TEAL }}>
            Refund policy
          </Link>
          . Where that policy and these terms conflict on cancellations or refunds, the Refund
          policy controls for that topic.
        </P>
      </Section>

      <Section title="6. Limitation of Liability">
        <P>
          The Site and all content are provided “as is” and “as available.” To the fullest
          extent permitted by law, we disclaim warranties of merchantability, fitness for a
          particular purpose, and non-infringement. We do not warrant that the Site will be
          error-free, secure, or uninterrupted, or that assessments or programs will produce
          specific career or certification results.
        </P>
        <P>
          To the fullest extent permitted by law, The Agile Forum and its operators will not be
          liable for indirect, incidental, special, consequential, or punitive damages, or for
          lost profits, data, or goodwill, arising from your use of the Site or any program. Our
          total liability for claims relating to the Site or a purchase will not exceed the
          amount you paid us for the specific offering giving rise to the claim in the twelve
          months before the claim, or zero if you paid nothing. Some jurisdictions do not allow
          certain limitations; in those cases our liability is limited to the maximum extent
          allowed by law.
        </P>
      </Section>

      <Section title="7. Termination">
        <P>
          We may suspend or terminate your access to the Site or any program if you violate
          these terms, fail to pay for paid offerings, or if we reasonably believe your account
          poses a security or abuse risk. You may stop using the Site at any time and close your
          account by contacting us. Provisions that by their nature should survive (including
          intellectual property, limitation of liability, and governing law) will survive
          termination.
        </P>
      </Section>

      <Section title="8. Governing Law">
        <P>
          These terms are governed by the laws of the jurisdiction in which The Agile Forum
          operates, without regard to conflict-of-law principles. Courts in that jurisdiction
          will have exclusive venue for disputes arising from these terms or your use of the
          Site, except where mandatory consumer-protection rules require otherwise.
        </P>
      </Section>

      <Section title="9. Changes to Terms">
        <P>
          We may update these terms from time to time. When we do, we will revise the “Last
          updated” date above. Continued use of the Site after a change means you accept the
          updated terms. If you do not agree, stop using the Site and close your account if you
          have one.
        </P>
      </Section>

      <Section title="10. Contact Us">
        <P>
          Questions about these terms:{" "}
          <Link href="mailto:contact@theagileforum.com" sx={{ color: TEAL }}>
            contact@theagileforum.com
          </Link>
          .
        </P>
      </Section>

      <Section title="Assessments and recommendations">
        <P>
          Career and skills assessments, scores, and path recommendations are informational
          tools meant to help you reflect and explore options. They are not hiring decisions,
          licensed career counseling, or guarantees of job outcomes, promotions, or
          certification success. You remain responsible for how you use assessment results.
        </P>
      </Section>

      <Section title="Privacy">
        <P>
          How we collect and use personal data is described in our{" "}
          <Link component={RouterLink} to="/privacy" sx={{ color: TEAL }}>
            Privacy policy
          </Link>
          . By using the Site you also acknowledge that policy.
        </P>
      </Section>

      <Link
        component={RouterLink}
        to="/"
        underline="hover"
        sx={{ color: TEAL, alignSelf: "flex-start" }}
      >
        ← Back to home
      </Link>
    </Stack>
  );
}

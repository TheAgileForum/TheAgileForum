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

export function PrivacyPage() {
  return (
    <Stack spacing={3} sx={{ py: { xs: 1, sm: 2 }, maxWidth: 720 }}>
      <Box sx={{ borderLeft: `3px solid ${TEAL}`, pl: 2.5, py: 0.5 }}>
        <Typography
          variant="h4"
          sx={{ color: INK, fontFamily: '"Fraunces", Georgia, serif', fontWeight: 560 }}
        >
          Privacy policy
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 560 }}>
          How The Agile Forum collects, uses, and protects personal data for online virtual
          training and related project management services.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Last updated: {LAST_UPDATED}
        </Typography>
      </Box>

      <Section title="1. Introduction">
        <P>
          The Agile Forum (“we”, “us”) provides online virtual training and project
          management–related services — including assessments, learning recommendations,
          certifications, and mentor-guided practice — through theagileforum.com and related
          digital services (the “Site”). This Privacy Policy explains what information we
          collect, how we use it, and the choices available to you.
        </P>
        <P>
          By using the Site you acknowledge this policy. Use of the Site is also governed by
          our{" "}
          <Link component={RouterLink} to="/terms" sx={{ color: TEAL }}>
            Terms and conditions
          </Link>
          .
        </P>
      </Section>

      <Section title="2. Information We Collect">
        <P>
          We may collect personal information that you provide when you register, make a
          purchase, take an assessment, or contact us, including:
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
          <li>
            <strong>Name, email, and contact details</strong> you share when creating an
            account, enrolling, or reaching out to us
          </li>
          <li>
            <strong>Account and login data</strong> needed to sign in and manage your profile
          </li>
          <li>
            <strong>Payment information</strong> related to orders (items, amounts,
            timestamps). Card or UPI details are processed by our payment providers (for
            example Razorpay); we do not store full card numbers on our servers
          </li>
          <li>
            <strong>Assessment and skill-gap data</strong> — answers and results from career
            or skills assessments, stored so we can show progress and tailor recommendations
          </li>
          <li>
            <strong>Usage and device data</strong> such as browser type, pages visited, and
            approximate location derived from IP address, to keep the Site secure and
            understand how it is used
          </li>
        </Box>
      </Section>

      <Section title="3. How We Use Your Information">
        <P>We use the information we collect to:</P>
        <Box
          component="ul"
          sx={{
            m: 0,
            pl: 2.5,
            color: "text.secondary",
            "& li": { lineHeight: 1.7, mb: 0.5 },
          }}
        >
          <li>Provide online virtual training and related project management services</li>
          <li>Process payments, send confirmations, and handle support or refund requests</li>
          <li>Communicate with you about your account, purchases, course materials, or important service updates</li>
          <li>Deliver assessments, recommendations, account features, and program access</li>
          <li>Maintain security, prevent abuse, and meet legal or regulatory obligations</li>
        </Box>
        <P>
          We may also use non-personal or aggregated information for analytics and to improve
          our services, Site experience, and course materials. We do not use assessment answers
          for unrelated advertising.
        </P>
      </Section>

      <Section title="4. Sharing Your Information">
        <P>
          We do not sell, trade, or rent your personal information to others. We may share
          information with trusted third parties who assist us in operating the Site,
          conducting our business, or serving you — for example hosting, email delivery,
          analytics, and payment processing — provided those parties agree to keep this
          information confidential and use it only to provide those services.
        </P>
        <P>
          We may also disclose information if required by law or to protect the rights and
          safety of users and The Agile Forum.
        </P>
      </Section>

      <Section title="5. Security Measures">
        <P>
          We take reasonable measures to protect your personal information against
          unauthorized access, alteration, disclosure, or destruction. No method of
          transmission over the Internet or electronic storage is completely secure, so we
          cannot guarantee absolute security. Please use a strong password and keep your login
          details private.
        </P>
      </Section>

      <Section title="6. Cookies">
        <P>
          We use cookies and similar technologies to enhance your experience on the Site — for
          example sign-in session, cart state, and limited analytics to understand traffic and
          improve pages. You can disable cookies through your browser settings; doing so may
          affect some features, including login or checkout.
        </P>
      </Section>

      <Section title="7. Links to Other Websites">
        <P>
          The Site may contain links to other websites. We are not responsible for the privacy
          practices or content of those third-party sites. We encourage you to read the privacy
          policies of any website you visit from a link on our Site.
        </P>
      </Section>

      <Section title="8. Changes to Privacy Policy">
        <P>
          We may update this Privacy Policy at any time. When we do, we will revise the “Last
          updated” date above. Your continued use of the Site after a change means you accept
          the updated policy.
        </P>
      </Section>

      <Section title="9. Contact Us">
        <P>
          Questions about this Privacy Policy or your personal data:{" "}
          <Link href="mailto:contact@theagileforum.com" sx={{ color: TEAL }}>
            contact@theagileforum.com
          </Link>
          .
        </P>
      </Section>

      <Section title="Retention">
        <P>
          We keep account and assessment data while your account is active and for a reasonable
          period afterward if needed for support, disputes, or legal requirements. Order records
          are retained as needed for accounting and consumer-protection obligations. You may ask
          us to delete account data where we are not required to keep it.
        </P>
      </Section>

      <Section title="Your choices and rights">
        <P>
          Depending on where you live, you may have rights to access, correct, or delete personal
          data, or to object to certain processing. To make a request, email{" "}
          <Link href="mailto:contact@theagileforum.com" sx={{ color: TEAL }}>
            contact@theagileforum.com
          </Link>
          . We will respond within a reasonable time and may need to verify your identity first.
        </P>
      </Section>

      <Section title="Children">
        <P>
          The Agile Forum is intended for professionals and adult learners. We do not knowingly
          collect personal data from children under 16. If you believe a child has provided data
          to us, contact us and we will take appropriate steps to remove it.
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

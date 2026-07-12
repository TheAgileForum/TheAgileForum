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

export function RefundPolicyPage() {
  return (
    <Stack spacing={3} sx={{ py: { xs: 1, sm: 2 }, maxWidth: 720 }}>
      <Box sx={{ borderLeft: `3px solid ${TEAL}`, pl: 2.5, py: 0.5 }}>
        <Typography
          variant="h4"
          sx={{ color: INK, fontFamily: '"Fraunces", Georgia, serif', fontWeight: 560 }}
        >
          Refund and cancellation policy
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 560 }}>
          Eligibility, timelines, and how to request a refund or transfer for The Agile Forum
          online virtual training and related paid programs.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Last updated: {LAST_UPDATED}
        </Typography>
      </Box>

      <Section title="1. Acceptance of Terms">
        <P>
          The Agile Forum (“we”, “us”, “TAF”) provides online virtual training and related
          project management services through theagileforum.com and related digital services
          (the “Site”). By registering for a course or program, making a purchase, or using the
          Site, you acknowledge this Refund and Cancellation Policy together with our{" "}
          <Link component={RouterLink} to="/terms" sx={{ color: TEAL }}>
            Terms and conditions
          </Link>{" "}
          and{" "}
          <Link component={RouterLink} to="/privacy" sx={{ color: TEAL }}>
            Privacy policy
          </Link>
          . If you do not agree, do not enroll or complete a purchase.
        </P>
      </Section>

      <Section title="2. Payment and Registration">
        <P>
          Registration for online virtual training and other paid offerings requires accurate,
          complete information. Payment is processed by our payment providers (for example
          Razorpay). By completing a purchase you authorize the charge for the selected items
          and confirm that you have reviewed applicable program details, schedules, and this
          refund policy before checkout.
        </P>
        <P>
          Program access, confirmations, and refund eligibility are tied to the purchase and
          schedule reflected in your order confirmation. Failed or disputed payments may delay
          or revoke access until the issue is resolved.
        </P>
      </Section>

      <Section title="3. Intellectual Property">
        <P>
          Course materials, videos, documents, assessment content, branding, and other Site
          content are owned by The Agile Forum or its licensors. You receive a limited license
          for your own learning only. Unauthorized copying, redistribution, sharing of paid
          materials, or other intellectual property violations may result in removal from a
          program without refund, as described in section 4.3 and our{" "}
          <Link component={RouterLink} to="/terms" sx={{ color: TEAL }}>
            Terms and conditions
          </Link>
          .
        </P>
      </Section>

      <Section title="4. Refund and Cancellation Policy">
        <P>
          The following rules apply to cancellations and refunds for paid online virtual
          training and related programs, unless a specific offering’s checkout disclosure states
          otherwise in writing.
        </P>
      </Section>

      <Section title="4.1 General Refund Eligibility">
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
            <strong>Cancel three (3) or more days before the scheduled start:</strong> you are
            eligible for a refund of the course fee, subject to the processing rules below.
          </li>
          <li>
            <strong>Cancel within three (3) days of the scheduled start:</strong> no refund is
            available.
          </li>
          <li>
            <strong>After the course has started:</strong> no refund is available, including for
            partial attendance or early withdrawal.
          </li>
        </Box>
        <P>
          Cancellation requests must be submitted in writing using the contact details in
          section 6, and must clearly identify your order, course, and preferred refund or
          transfer outcome.
        </P>
      </Section>

      <Section title="4.2 Refund Processing Time">
        <P>
          Approved refunds are typically processed within five to seven (5–7) working days after
          we confirm eligibility. Refunds are issued to the original payment method. Bank,
          card, or payment-gateway charges may be deducted where applicable; timing of credit
          appearing on your statement depends on your bank or provider.
        </P>
      </Section>

      <Section title="4.3 Non-Refundable Circumstances">
        <P>Refunds are not available in the following situations:</P>
        <Box
          component="ul"
          sx={{
            m: 0,
            pl: 2.5,
            color: "text.secondary",
            "& li": { lineHeight: 1.7, mb: 0.5 },
          }}
        >
          <li>No-show or failure to attend without a timely cancellation under section 4.1</li>
          <li>
            Violation of intellectual property rules or unauthorized sharing of course materials
          </li>
          <li>
            Technical issues on the participant’s side (device, network, software, or local
            connectivity) that prevent attendance
          </li>
          <li>
            Removal from a program for misconduct or breach of our code of conduct under the{" "}
            <Link component={RouterLink} to="/terms" sx={{ color: TEAL }}>
              Terms and conditions
            </Link>
          </li>
        </Box>
      </Section>

      <Section title="4.4 Course Rescheduling and Transfers">
        <P>
          Subject to availability, you may request a transfer to another session of the{" "}
          <strong>same course</strong> if you notify us at least three (3) days before the
          originally scheduled start. A transfer or administrative fee may apply. Transfers are
          not a substitute for a refund when eligibility under section 4.1 has already expired.
        </P>
      </Section>

      <Section title="5. Exceptional Cases">
        <P>
          If The Agile Forum cancels or materially reschedules a course, you may choose a full
          refund of the amount paid for that course or enrollment in a future session of the
          same offering at no additional course fee (subject to availability).
        </P>
        <P>
          Medical emergencies or similar exceptional circumstances may be considered on a
          case-by-case basis when supported by appropriate documentation. Approval is at our
          reasonable discretion and does not create a standing exception to sections 4.1–4.3.
        </P>
      </Section>

      <Section title="6. Contact for Refunds">
        <P>
          To request a cancellation, refund, or transfer, email{" "}
          <Link href="mailto:contact@theagileforum.com" sx={{ color: TEAL }}>
            contact@theagileforum.com
          </Link>{" "}
          with your full name, order or registration details, course name and start date, and
          the reason for your request. You may also reach us on WhatsApp at{" "}
          <Link
            href="https://wa.me/+13322662360?text=Hi_TheAgileForum,I'd_like_help_with_a_refund_or_cancellation"
            sx={{ color: TEAL }}
            target="_blank"
            rel="noopener noreferrer"
          >
            +1 332 266 2360
          </Link>
          .
        </P>
        <P>
          We aim to acknowledge refund-related requests promptly and will confirm next steps,
          eligibility, and any documentation needed.
        </P>
      </Section>

      <Section title="7. Changes and Acknowledgment">
        <P>
          We reserve the right to modify this Refund and Cancellation Policy. When we do, we
          will revise the “Last updated” date above. Continued enrollment or use of the Site
          after a change means you accept the updated policy for future purchases, except where
          mandatory consumer-protection rules require otherwise for an existing order.
        </P>
        <P>
          By enrolling in a course or completing a purchase, you acknowledge that you have read
          and understood this policy, including refund windows, non-refundable circumstances,
          and contact procedures.
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

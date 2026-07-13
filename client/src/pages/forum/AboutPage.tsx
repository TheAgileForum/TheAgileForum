import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

const INK = "#0a1628";
const TEAL = "#0f9f8f";

function P({ children }: { children: string }) {
  return (
    <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
      {children}
    </Typography>
  );
}

export function AboutPage() {
  return (
    <Stack spacing={3} sx={{ py: { xs: 1, sm: 2 }, maxWidth: 720 }}>
      <Box
        sx={{
          borderLeft: `3px solid ${TEAL}`,
          pl: 2.5,
          py: 0.5,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ color: INK, fontFamily: '"Fraunces", Georgia, serif', fontWeight: 560 }}
        >
          The Agile Forum Story
        </Typography>
      </Box>

      <Stack spacing={2.5} component="section">
        <P>
          We believe in making you successful. That&apos;s why our online practical training
          courses were born from a profound passion, a common vision, and an unwavering
          dedication to making real practical learning accessible worldwide.
        </P>
        <P>
          Our distinctive approach to practical education aims to empower Scrum Masters and
          Agile Project Managers by immersing them in live Jira projects, offering
          comprehensive end-to-end training for success and interview preparation.
        </P>
        <P>
          At the core of our mission lies a steadfast commitment to providing accessible,
          real-world project training, all in pursuit of your success. We warmly welcome you
          to explore our wide-ranging offerings, thoughtfully designed for learners of every
          background and proficiency level.
        </P>
        <P>
          The Agile Forum is significantly enhancing the lives of Scrum Masters worldwide by
          offering a wealth of resources and opportunities and the best Scrum Master
          training. Through expert insights and real-time articles, Scrum Masters can stay
          updated with the latest industry trends and best practices. Personalized mentorship
          on live projects provides hands-on experience and guidance, ensuring practical
          knowledge application. Exclusive certification discounts make professional
          development more accessible, while comprehensive exam resources aid in effective
          preparation. Members enjoy direct access to workshops and 1:1 sessions with
          industry experts, fostering continuous learning and professional growth. Engaging
          polls and discussions create a vibrant community for sharing experiences and
          insights. Additionally, The Agile Forum and Scrum Master Forum offer job
          opportunities and job assistance, helping Scrum Masters advance their careers and
          achieve their professional goals.
        </P>
      </Stack>

      <Button
        component={RouterLink}
        to="/diagnosis/step-1"
        variant="contained"
        sx={{ alignSelf: "flex-start", bgcolor: TEAL, "&:hover": { bgcolor: "#0b7a6e" } }}
      >
        Start Assessment →
      </Button>
    </Stack>
  );
}

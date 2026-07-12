import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

const INK = "#0a1628";
const TEAL = "#0f9f8f";

type Testimonial = {
  name: string;
  role: string;
  quote: string;
  /** Vimeo or YouTube watch/embed URL from theagileforum.com / Vimeo channels */
  videoUrl?: string;
  company?: string;
};

const LINKEDIN_POSTS = [
  {
    urn: "urn:li:share:7474811272262234114",
    height: 571,
  },
  {
    urn: "urn:li:share:7472005988393361408",
    height: 659,
  },
  {
    urn: "urn:li:share:7471160124468838400",
    height: 645,
  },
  {
    urn: "urn:li:share:7452948586650079232",
    height: 668,
  },
  {
    urn: "urn:li:share:7356391269129965570",
    height: 583,
  },
  {
    urn: "urn:li:ugcPost:7291781558250704896",
    height: 600,
  },
] as const;

const FACEBOOK_POSTS = [
  {
    href: "https://www.facebook.com/john.k.2000/posts/pfbid0j4a6MwjxBwWdpFiaT4QpyE1d4LxapmnuFYQR9WR6uX4RebLhH6KNcVtCLcXZ9Nybl",
    width: 500,
    height: 250,
  },
] as const;

/**
 * Real learner stories from theagileforum.com Success Stories carousel +
 * WhatsApp screenshots on /feedback-and-success (OCR’d quotes).
 * Vimeo IDs matched by learner name on vimeo.com/theagileforum and vimeo.com/agileforum.
 */
const LINKEDIN_REVIEW_SCREENSHOTS = [
  {
    src: "/testimonials/richa-gupta-linkedin-review.png",
    alt: "LinkedIn review by Richa Gupta, PMP®, CSM® — 5.0 stars, January 31, 2025",
    name: "Richa Gupta, PMP®, CSM®",
    meta: "5.0 · January 31, 2025 · Career Development Coaching",
  },
] as const;

/** Live LinkedIn embeds shown beside review screenshots (not in LINKEDIN_POSTS — avoid duplicate). */
const LINKEDIN_REVIEW_EMBEDS = [
  {
    urn: "urn:li:share:7377396042931036160",
    height: 647,
    title: "LinkedIn recommendation embed",
  },
] as const;

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Richa Gupta, PMP®, CSM®",
    role: "Project Manager",
    company: "Career Development Coaching · LinkedIn · Jan 2025",
    quote:
      "I recently had the opportunity to complete Dhirendra Verma’s Scrum Master mentorship program. This course took my understanding in agile practices to the next level. Dhirendra's practical approach, especially with hands-on guidance on JIRA, Confluence, and real-world Scrum events, made the concepts come alive. His teaching style is engaging, thorough, and easy to follow. I highly recommend this program to anyone aspiring to be a competent Scrum Master or improve their agile expertise.",
  },
  {
    name: "Almas V",
    role: "Scrum Master",
    quote:
      "Any person giving the interview wants is confidence, and this course targets exactly that. I hold an offer currently and got shortlisted for another company's 2nd round. I am very thankful to you and this course. Highly recommended.",
    videoUrl: "https://player.vimeo.com/video/1041809793",
  },
  {
    name: "Valine",
    role: "Scrum Master",
    company: "USA",
    quote:
      "I wanted to take a moment to express my deepest gratitude to Dhirender for all that you have done for me. Your guidance, support, and mentorship have played a pivotal role in my professional development and growth. I took the mentorship class with Dhirender. The 3 week's program was very impactful, filled with deep knowledge of Scrum, Kanban, XP, BDD, TDD, and many other agile-related practices. Upon completion, I took the SAFE Advanced Scrum Master with Dhirender again, and this put me up the chart. Thanks to your mentorship, I was able to secure a job as a Scrum Master that I am truly passionate about and proud of. For all those yet to take the mentorship class and other Agile certifications with Dhirender, please do not waste time. This program changes lives.",
    videoUrl: "https://player.vimeo.com/video/1042034393",
  },
  {
    name: "Yamini Thakur",
    role: "Scrum Master",
    quote:
      "I wanted to inform I have been selected for Wipro and AB inBev a brazilian brewery company for scrum master role. I surely owe this to DV and his amazing mentorship. The topics covered the briefing of knowledge is best in class. I am thankful for him for this career transition.",
    videoUrl: "https://player.vimeo.com/video/1042882969",
  },
  {
    name: "Jetinder Singh",
    role: "Product Manager",
    company: "Optum Health · USA",
    quote:
      "I am Jetinder Singh, working as a Product Manager in the IAM domain with Optum Health. Start of 2024, I attended an exceptional training program led by Dhiren of Agile Forum, focusing on Scrum Master, Agile Methodologies, and SAFe Agile Practices. As a Business Analyst with 16 years of industry experience, I can confidently say that this was the most comprehensive and impactful agile training I've ever participated in. The program stood out for its practical approach, incorporating live projects and real-time examples that bridged the gap between theory and application. Thanks to this training, I feel confident in my ability to lead Agile transformations. It has truly been a career-defining experience.",
    videoUrl: "https://player.vimeo.com/video/1042882790",
  },
  {
    name: "Shashank",
    role: "Scrum Master · Project Manager",
    company: "Cognizant",
    quote:
      "I got placed at Cognizant as Project Manager with a 140% hike. I would like to Thank Mr. DV for his amazing training and guidance throughout this period. This three week training and all the docs he provided, really helped me in SAFe certifications and now a role as a manager. I'd completely recommend y'all SM aspirants to join his trainings. Thanks a ton DV.",
    videoUrl: "https://player.vimeo.com/video/1042911533",
  },
  {
    name: "Madhuri",
    role: "Scrum Master",
    quote:
      "I thought of a job switch and the interview left me disappointed. I determined at that moment to avoid a repeat of failure. I identified my gaps in 2 areas: interview preparation and overall knowledge. I connected with DV and discovered his extensive practical knowledge. His coaching significantly boosted my confidence. The three-week training program has completely transformed my understanding, covering topics in a highly practical manner. I now confidently can attend interviews without any major preparation and have secured 4 offers. I highly recommend my AGILE GURU to anyone looking to enhance their Agile skills.",
    videoUrl: "https://player.vimeo.com/video/1042911496",
  },
  {
    name: "Nazish",
    role: "Scrum Master",
    company: "Capgemini",
    quote:
      "Thank You Dhirender Sir. I got selected internally in Capgemini for PM/Scrum role. From November month I was looking to get transformation. But the core issue was for more than 12+ experience, no one want to onboard someone who has not had practical hands on Scrum. Thanks to the 3 week mentorship program that helped me to not only understand Scrum but various practices, methods and process. This would not have been possible with the 2 day course + certification program. The hands on Jira was added advantage.",
    videoUrl: "https://player.vimeo.com/video/1042882929",
  },
  {
    name: "Neha Yawale",
    role: "Scrum Master",
    company: "Synechron",
    quote:
      "I am happy to share with you that I got an offer from Synechron for a scrum master role with 50% hike. Thanks DV, for all your help and cooperation! Your mentorship program made me confident and excel in all types of framework scrum/xp/kanban and JIRA/confluence tools. I rejoined his live classes again for free that also made me confident although the journey was difficult, but every class was a huge motivation.",
    videoUrl: "https://player.vimeo.com/video/1042882989",
  },
  {
    name: "Hemanth",
    role: "Scrum Master",
    quote:
      "Thanks for training, mentoring and guidance you provided during the session. The roleplays and curriculum was well structured and gave more knowledge on scrum. You motivated us to read more concepts and got more clarity under your guidance. Thank you.",
    videoUrl: "https://player.vimeo.com/video/1042882904",
  },
  // --- Additional stories from /feedback-and-success (WhatsApp screenshot OCR) ---
  {
    name: "Eshwar Sharma",
    role: "Scrum Master",
    quote:
      "Hello @DV and all, I got 3 offers from MNCs for scrum master position with 80% hike being the highest. I took DV's course in June and it helped a lot in cracking the interviews. Thanks a lot @DV for the guidance you gave and for the support which you are still giving.",
  },
  {
    name: "Lakshmi",
    role: "Agile Project Manager",
    quote:
      "I'm thrilled to share the news that I've been offered a position as a Agile Project Manager with an impressive 80% salary increase. Furthermore, I have another offer on the pipeline for a Scrum Master role, which promises a salary increase of 100%. I'm extremely grateful for the guidance and insights Our coach-Dhirender Verma have provided due 3 week mentorship, it developed expertise in Jira (JQL) and practical understanding of scrum events during the course. I look forwards for continued guidance in my career and recommend you all his scrum master mentorship program.",
  },
  {
    name: "Aamani",
    role: "Scrum Master",
    company: "Non-IT background",
    quote:
      "Hello everyone, so glad to tell you that I got a job with almost 90-100% hike. All thanks to Dhirender. His material and the classes were so helpful, I made my own notes with the help of these sessions. Though I struggled with lots of interviews as I'm from non IT background, I never lost the confidence. I'm so happy and grateful that I enrolled to this program.",
  },
  {
    name: "Bhaskar G.",
    role: "Scrum Master",
    company: "US-based company · Non-IT background",
    quote:
      "I'm thrilled to share that I've been selected for one of the US based companies. I wanted to express my heartfelt gratitude for your guidance and mentorship during the Scrum Master training, your insights and expertise played a significant role in my success, and your training has not only equipped me with the necessary skills but also instilled confidence to overcome fear of Non-IT background. I'm truly grateful to your support and advises all the time.",
    videoUrl: "https://player.vimeo.com/video/1042911413",
  },
  {
    name: "Komal",
    role: "Scrum Master",
    company: "Deloitte USI",
    quote:
      "Hello All I received the offer letter for Deloitte USI!!! Thank you so much @DV. Being from a non technical background, must say that you have invested a lot of time in me to make me understand everything so well! The hands-on sessions on Jira you taught are so very helpful!",
  },
  {
    name: "Guri",
    role: "Scrum Master",
    company: "Capgemini · Delhi-NCR",
    quote:
      "I would like to thank @DV and other people in the group due to which I scored an opportunity with Capgemini. Thankyou so much.",
  },
  {
    name: "Meenakshi Raina",
    role: "Agile Coach",
    quote:
      "Hi Devendra, Thank you for your guidance.. I want to share my happiness with you..I became an agile coach in my organisation and today I gave my first workshop.",
  },
  {
    name: "Farah",
    role: "Manager",
    quote:
      "I wanted to thank you for the Scrum Master Mentorship training program of 3 weeks. The training was really worth attending where live examples were given in reference to each topic. There was a constant motivation to read the best practices and improve knowledge. The training helped me in overall awareness of the Scrum Master's roles and responsibilities. This training gave me a practical view of days which a Scrum team goes through in a project/s with live Jira tool. I learnt Jira tool in detail with guided steps for Boards, JQL queries, dashboards and much more. Together, as a team we practiced the Agile coaching role plays in different situations. I learnt many other frameworks like Kanban, XP etc. Your guidance has been invaluable, and I feel well equipped for this role.",
    videoUrl: "https://player.vimeo.com/video/1042882769",
  },
  {
    name: "Harpreet",
    role: "Scrum Master",
    quote:
      "Shared landing a Scrum Master role after mentorship — watch the video success story.",
    videoUrl: "https://player.vimeo.com/video/1042882875",
  },
  {
    name: "Belinda",
    role: "Scrum Master",
    quote:
      "Shared landing a Scrum Master role after mentorship — watch the video success story.",
    videoUrl: "https://player.vimeo.com/video/1042882838",
  },
  {
    name: "Kratika",
    role: "Scrum Master",
    quote:
      "Shared landing a Scrum Master role after mentorship — watch the video success story.",
    videoUrl: "https://player.vimeo.com/video/1042911452",
  },
  {
    name: "Jyoti",
    role: "Scrum Master",
    quote:
      "I would like to thank you for the Scrum Master Mentorship training provided. It was a well structured 3 weeks detailed class covering all aspects. The class was interactive, thought provoking and complex concepts were explained in simple terms with day to day scenario examples. The scrum ceremony role playing was effective and gave a good insight. Also the practical use of JIRA tool was extremely helpful. I will highly recommend Dhirender's class to aspiring Scrum Masters and seasoned Scrum Masters to get in depth knowledge in Agile and Scrum.",
    videoUrl: "https://player.vimeo.com/video/1042913183",
  },
  {
    name: "Guru Pras",
    role: "Scrum Master",
    quote:
      "I have attended the 3 weeks scrum master - masterclass from Dhirender. Scrum Master training provided by DV was extremely insightful and well-structured and the DV's deep understanding of Agile and Scrum principles added tremendous value. Training was very interactive with the discussions and real-world examples made the concepts easy to grasp and apply.",
    videoUrl: "https://player.vimeo.com/video/1042913103",
  },
  {
    name: "Vema",
    role: "Scrum Master",
    company: "Singapore",
    quote:
      "Hi DV, 3 weeks flies so fast and I'm overwhelmed with the lesson learned. This is what I'm looking for, practical knowledge with real-life examples with JIRA. 2days CSM only about Scrum and not about how to run the Scrum, with your coaching I'm confident to identify the gap and bridge the gap with the lesson learned. You have tons of patience to entertain our questions, never once you ever said \"I'll get back to you on that\". You are the Walking Scrum Knowledge Database, I'm glad to be part of your coaching session. I'm recommending this training to those whom wants to enhance and excel in Scrum.",
  },
  {
    name: "Pooja",
    role: "Scrum Master",
    company: "USA",
    quote:
      "I attended the 3 week training recently with Dhiren. While I have attended other trainings before this, I want to confirm this training was by far most helpful and practical. The others that I attended always focused on scrum guide theory part, but here I got practical understanding of why and how each ceremonies can be benefitted provided we execute it the rite way. I am feeling more confident with my work. Thank you Dhiren for all the knowledge you shared. Glad I joined the program.",
  },
  {
    name: "Arti Bhardwaj",
    role: "Scrum Master",
    quote:
      "It was a great 3 weeks Scrum Master training with The AgileForum Trainings by Dhirender Verma. Live jira project was very helpful and informative. I would recommend everyone to join these classes before attempting Scrum certifications or career switch to Scrum Master. Dhirendra was very patient and make me comfortable to ask any questions as well as encouraged everyone to participate.",
  },
  {
    name: "Bhavani",
    role: "Aspiring Business Analyst",
    company: "Finance background",
    quote:
      "I actually come from a finance background and looking for BA jobs. Though I learned through online on Agile and Scrum, it was just the theoretical knowledge, but wasn't sure how to apply and where to apply. I have joined this master class after the batch has commenced, Dhirender had made sure that I understand each and every concept in detail. I have seen the live scenarios what actually happens in an organisation and that really boosted my confidence. Now I am pretty much confident to take up interviews and answer them. The practical use of JIRA and scrum role play was very helpful to me. I would strongly recommend Dhirender for any starters like me.",
  },
];

function toEmbedSrc(url: string): { embedSrc: string; externalUrl: string; kind: "youtube" | "vimeo" | "other" } {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]+)/,
  );
  if (youtubeMatch) {
    const id = youtubeMatch[1];
    return {
      embedSrc: `https://www.youtube.com/embed/${id}`,
      externalUrl: `https://www.youtube.com/watch?v=${id}`,
      kind: "youtube",
    };
  }
  const vimeoMatch = url.match(/(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    const id = vimeoMatch[1];
    return {
      embedSrc: `https://player.vimeo.com/video/${id}`,
      externalUrl: `https://vimeo.com/${id}`,
      kind: "vimeo",
    };
  }
  return { embedSrc: url, externalUrl: url, kind: "other" };
}

function VideoEmbed({ url, title }: { url: string; title: string }) {
  const { embedSrc, externalUrl, kind } = toEmbedSrc(url);
  const canEmbed = kind === "youtube" || kind === "vimeo";

  return (
    <Box sx={{ mt: 1 }}>
      {canEmbed ? (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            pt: "56.25%",
            borderRadius: 1,
            overflow: "hidden",
            bgcolor: INK,
            border: "1px solid rgba(10,22,40,0.12)",
          }}
        >
          <Box
            component="iframe"
            src={embedSrc}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: 0,
            }}
          />
        </Box>
      ) : null}
      <Link
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: "inline-block",
          mt: 1,
          color: TEAL,
          fontWeight: 600,
          fontSize: "0.875rem",
          textDecoration: "none",
          "&:hover": { textDecoration: "underline" },
        }}
      >
        Watch video →
      </Link>
    </Box>
  );
}

export function TestimonialsPage() {
  return (
    <Stack spacing={3} sx={{ py: { xs: 1, sm: 2 } }}>
      <Box
        sx={{
          borderLeft: `3px solid ${TEAL}`,
          pl: 2.5,
          py: 0.5,
        }}
      >
        <Typography
          variant="h4"
          sx={{ color: INK, fontFamily: '"Fraunces", Georgia, serif', fontWeight: 560 }}
        >
          Testimonials
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 560 }}>
          Real success stories from learners who landed Scrum Master and Product roles with The
          Agile Forum mentorship — with video where published on Vimeo and theagileforum.com.
        </Typography>
      </Box>

      <Box component="section" aria-label="LinkedIn success posts">
        <Typography sx={{ color: INK, fontWeight: 600, fontSize: "0.9rem", mb: 0.5 }}>
          From LinkedIn
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, maxWidth: 560 }}>
          Recent learner successes shared on LinkedIn.
        </Typography>
        <Box
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" },
            alignItems: "start",
          }}
        >
          {LINKEDIN_POSTS.map((post) => {
            const embedSrc = `https://www.linkedin.com/embed/feed/update/${post.urn}?collapsed=1`;
            const viewHref = `https://www.linkedin.com/feed/update/${post.urn}`;
            return (
              <Box
                key={post.urn}
                sx={{
                  border: "1px solid rgba(10,22,40,0.1)",
                  borderLeft: `3px solid ${TEAL}`,
                  bgcolor: "rgba(15,159,143,0.04)",
                  px: { xs: 1.5, sm: 2 },
                  py: 2,
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 504,
                    mx: "auto",
                    overflowX: "auto",
                    WebkitOverflowScrolling: "touch",
                    border: "1px solid rgba(10,22,40,0.08)",
                    bgcolor: "#fff",
                  }}
                >
                  <Box
                    component="iframe"
                    src={embedSrc}
                    title="LinkedIn success post"
                    allowFullScreen
                    loading="lazy"
                    sx={{
                      display: "block",
                      border: 0,
                      width: 504,
                      height: post.height,
                      maxWidth: "none",
                    }}
                  />
                </Box>
                <Link
                  href={viewHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "inline-block",
                    mt: 1.25,
                    color: TEAL,
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  View on LinkedIn →
                </Link>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box component="section" aria-label="LinkedIn recommendation screenshots">
        <Typography sx={{ color: INK, fontWeight: 600, fontSize: "0.9rem", mb: 0.5 }}>
          LinkedIn reviews
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, maxWidth: 560 }}>
          Recommendations shared on LinkedIn.
        </Typography>
        <Box
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            alignItems: "start",
          }}
        >
          {LINKEDIN_REVIEW_SCREENSHOTS.map((review) => (
            <Box
              key={review.src}
              component="figure"
              sx={{
                m: 0,
                border: "1px solid rgba(10,22,40,0.1)",
                borderLeft: `3px solid ${TEAL}`,
                borderRadius: 1,
                bgcolor: "rgba(15,159,143,0.04)",
                px: { xs: 1.5, sm: 2 },
                py: 2,
                maxWidth: 560,
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  border: "1px solid rgba(10,22,40,0.1)",
                  borderRadius: 1,
                  overflow: "hidden",
                  bgcolor: "#fff",
                }}
              >
                <Box
                  component="img"
                  src={review.src}
                  alt={review.alt}
                  loading="lazy"
                  sx={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                  }}
                />
              </Box>
              <Box component="figcaption" sx={{ mt: 1.25 }}>
                <Typography sx={{ color: INK, fontWeight: 600, fontSize: "0.9rem" }}>
                  {review.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {review.meta}
                </Typography>
              </Box>
            </Box>
          ))}
          {LINKEDIN_REVIEW_EMBEDS.map((post) => {
            const embedSrc = `https://www.linkedin.com/embed/feed/update/${post.urn}?collapsed=1`;
            const viewHref = `https://www.linkedin.com/feed/update/${post.urn}`;
            return (
              <Box
                key={post.urn}
                sx={{
                  border: "1px solid rgba(10,22,40,0.1)",
                  borderLeft: `3px solid ${TEAL}`,
                  borderRadius: 1,
                  bgcolor: "rgba(15,159,143,0.04)",
                  px: { xs: 1.5, sm: 2 },
                  py: 2,
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 504,
                    mx: "auto",
                    overflowX: "auto",
                    WebkitOverflowScrolling: "touch",
                    border: "1px solid rgba(10,22,40,0.08)",
                    bgcolor: "#fff",
                  }}
                >
                  <Box
                    component="iframe"
                    src={embedSrc}
                    title={post.title}
                    allowFullScreen
                    loading="lazy"
                    sx={{
                      display: "block",
                      border: 0,
                      width: 504,
                      height: post.height,
                      maxWidth: "none",
                    }}
                  />
                </Box>
                <Link
                  href={viewHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "inline-block",
                    mt: 1.25,
                    color: TEAL,
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  View on LinkedIn →
                </Link>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box component="section" aria-label="Facebook success posts">
        <Typography sx={{ color: INK, fontWeight: 600, fontSize: "0.9rem", mb: 0.5 }}>
          From Facebook
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, maxWidth: 560 }}>
          Learner successes shared on Facebook.
        </Typography>
        <Box
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" },
            alignItems: "start",
          }}
        >
          {FACEBOOK_POSTS.map((post) => {
            const embedSrc = `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(post.href)}&show_text=true&width=${post.width}`;
            return (
              <Box
                key={post.href}
                sx={{
                  border: "1px solid rgba(10,22,40,0.1)",
                  borderLeft: `3px solid ${TEAL}`,
                  bgcolor: "rgba(15,159,143,0.04)",
                  px: { xs: 1.5, sm: 2 },
                  py: 2,
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: post.width,
                    mx: "auto",
                    overflowX: "auto",
                    WebkitOverflowScrolling: "touch",
                    border: "1px solid rgba(10,22,40,0.08)",
                    bgcolor: "#fff",
                  }}
                >
                  <Box
                    component="iframe"
                    src={embedSrc}
                    title="Facebook success post"
                    scrolling="no"
                    frameBorder={0}
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    loading="lazy"
                    sx={{
                      display: "block",
                      border: 0,
                      overflow: "hidden",
                      width: post.width,
                      height: post.height,
                      maxWidth: "none",
                    }}
                  />
                </Box>
                <Link
                  href={post.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "inline-block",
                    mt: 1.25,
                    color: TEAL,
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  View on Facebook →
                </Link>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box component="section" aria-label="Learner success stories">
        <Typography sx={{ color: INK, fontWeight: 600, fontSize: "0.9rem", mb: 0.5 }}>
          Success stories &amp; reviews
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, maxWidth: 640 }}>
          Quotes from learners — including WhatsApp success posts from{" "}
          <Link
            href="https://www.theagileforum.com/feedback-and-success"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: TEAL }}
          >
            feedback-and-success
          </Link>
          . Video embeds matched by name on Vimeo where available.
        </Typography>
        <Box
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          }}
        >
          {TESTIMONIALS.map((item) => (
            <Box
              key={item.name}
              component="article"
              sx={{
                border: "1px solid rgba(10,22,40,0.1)",
                borderLeft: `3px solid ${TEAL}`,
                bgcolor: "rgba(15,159,143,0.04)",
                px: 2.5,
                py: 2.25,
                display: "flex",
                flexDirection: "column",
                gap: 1.25,
              }}
            >
              <Typography
                sx={{
                  color: INK,
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontSize: "1.05rem",
                  fontWeight: 500,
                  lineHeight: 1.55,
                  fontStyle: "italic",
                }}
              >
                &ldquo;{item.quote}&rdquo;
              </Typography>
              <Box sx={{ mt: "auto", pt: 0.5 }}>
                <Typography sx={{ color: INK, fontWeight: 600, fontSize: "0.9rem" }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.role}
                  {item.company ? ` · ${item.company}` : ""}
                </Typography>
              </Box>
              {item.videoUrl ? (
                <VideoEmbed url={item.videoUrl} title={`${item.name} success story`} />
              ) : null}
            </Box>
          ))}
        </Box>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 640 }}>
        Sourced from Success Stories on{" "}
        <Link
          href="https://www.theagileforum.com/"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: TEAL }}
        >
          theagileforum.com
        </Link>
        , WhatsApp screenshots on{" "}
        <Link
          href="https://www.theagileforum.com/feedback-and-success"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: TEAL }}
        >
          /feedback-and-success
        </Link>
        , and learner videos on{" "}
        <Link
          href="https://vimeo.com/theagileforum"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: TEAL }}
        >
          Vimeo
        </Link>
        .
      </Typography>

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

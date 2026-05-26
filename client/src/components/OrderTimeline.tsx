import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import Stack from "@mui/material/Stack";
import Step from "@mui/material/Step";
import StepConnector from "@mui/material/StepConnector";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import type { StepIconProps } from "@mui/material/StepIcon";

const Connector = styled(StepConnector)(({ theme }) => ({
  "& .MuiStepConnector-line": {
    borderColor: theme.palette.divider,
  },
}));

function TimelineStepIcon(props: StepIconProps) {
  const { active, completed } = props;
  if (completed) {
    return <CheckCircleIcon color="success" />;
  }
  return <RadioButtonUncheckedIcon color={active ? "primary" : "disabled"} />;
}

export type TimelineStep = { key: string; label: string; done: boolean };

type Props = {
  steps: TimelineStep[];
  variant?: "customer" | "internal";
};

/** UX-DR5 — order progress timeline. */
export function OrderTimeline({ steps, variant = "customer" }: Props) {
  const active = steps.findIndex((s) => !s.done);
  const activeStep = active === -1 ? steps.length : active;

  if (variant === "internal") {
    return (
      <Stepper activeStep={activeStep} alternativeLabel connector={<Connector />}>
        {steps.map((s) => (
          <Step key={s.key} completed={s.done}>
            <StepLabel slots={{ stepIcon: TimelineStepIcon }}>
              <Typography variant="caption" component="span">
                {s.label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    );
  }

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" color="text.secondary">
        Order timeline
      </Typography>
      <Stepper activeStep={activeStep} orientation="vertical" connector={<Connector />}>
        {steps.map((s) => (
          <Step key={s.key} completed={s.done}>
            <StepLabel slots={{ stepIcon: TimelineStepIcon }}>{s.label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Stack>
  );
}

import { useTranslation } from "react-i18next";
import { JourneyStageCard, type JourneyStage } from "./journey-stage-card";

interface JourneyProgressProps {
  stages: JourneyStage[];
  /** 0-based index of the stage the user is currently working towards. */
  activeIndex: number;
}

/** The Opsly journey: Understand → Improve → Automate → Measure.
 *  Four stages presented as one connected track.
 *  Desktop: 4 columns · Tablet: 2×2 · Mobile: vertical list. */
export function JourneyProgress({ stages, activeIndex }: JourneyProgressProps) {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="journey-heading">
      <h2
        id="journey-heading"
        className="mb-3 text-sm font-medium text-muted-foreground"
      >
        {t("dashboard.journey.title")}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage, i) => (
          <JourneyStageCard
            key={stage.key}
            stage={stage}
            index={i + 1}
            active={i === activeIndex}
          />
        ))}
      </div>
    </section>
  );
}

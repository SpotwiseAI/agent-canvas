import { cn } from "#/utils/utils";
import type { ConversationStatusBucketId } from "./conversation-panel-list-helpers";

const BUCKET_COLOR: Record<ConversationStatusBucketId, string> = {
  in_progress: "var(--oh-warning)",
  in_review: "var(--oh-status-success)",
  done: "var(--oh-status-success)",
};

// Linear/Conductor-style progress glyph: a thin outer ring with a solid pie
// wedge filling it. The wedge is a circle whose stroke-width equals its
// diameter, so the stroke paints a filled disc; `strokeDasharray` then clips
// it to a fraction of the circumference, and the -90° rotation starts the fill
// at 12 o'clock.
const PIE_FRACTION: Partial<Record<ConversationStatusBucketId, number>> = {
  in_progress: 0.5,
  in_review: 0.75,
};

const PIE_RADIUS = 2.25;
const PIE_CIRCUMFERENCE = 2 * Math.PI * PIE_RADIUS;

interface StatusBucketIconProps {
  bucketId: ConversationStatusBucketId;
  className?: string;
}

export function StatusBucketIcon({
  bucketId,
  className,
}: StatusBucketIconProps) {
  const color = BUCKET_COLOR[bucketId];
  const svgClass = cn("h-3.5 w-3.5 shrink-0", className);

  if (bucketId === "done") {
    return (
      <svg
        data-testid={`status-bucket-icon-${bucketId}`}
        viewBox="0 0 14 14"
        className={svgClass}
        aria-hidden
      >
        <circle cx="7" cy="7" r="6" fill={color} />
        <path
          d="M4.3 7.2 6.1 9 9.8 4.9"
          fill="none"
          stroke="var(--oh-surface)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  const fraction = PIE_FRACTION[bucketId] ?? 0;
  return (
    <svg
      data-testid={`status-bucket-icon-${bucketId}`}
      viewBox="0 0 14 14"
      className={svgClass}
      aria-hidden
    >
      <circle
        cx="7"
        cy="7"
        r="5.25"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />
      <circle
        cx="7"
        cy="7"
        r={PIE_RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={PIE_RADIUS * 2}
        strokeDasharray={`${PIE_CIRCUMFERENCE * fraction} ${PIE_CIRCUMFERENCE}`}
        transform="rotate(-90 7 7)"
      />
    </svg>
  );
}

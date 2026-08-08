import type { ReactNode } from "react";
import { Badge, Card, ProgressBar, Stack } from "react-bootstrap";
import { CalendarDays, CircleDollarSign, Users, Sparkles } from "lucide-react";
import { SignedCampaignMedia } from "@/components/common/SignedMedia";

interface CampaignCardProps {
  name: string;
  category: string;
  reward: string;
  period: string;
  workers: string;
  status?: string;
  thumbnailUrl?: string;
  thumbnailType?: "IMAGE" | "VIDEO";  suggested?: boolean;
  workersFilled?: number;
  workersCapacity?: number;
    daysRemaining?: number;
  children?: ReactNode;
}

export function CampaignCard({
  name,
  category,
  reward,
  period,
  workers,
  status = "Active",
  thumbnailUrl,
  thumbnailType,
  suggested = false,
  workersFilled,
  workersCapacity,
  daysRemaining,
  children,
}: CampaignCardProps) {
  const periodTone =
    daysRemaining === undefined
      ? "text-secondary"
      : daysRemaining <= 1
        ? "text-danger fw-semibold"
        : daysRemaining <= 3
          ? "text-warning-emphasis fw-semibold"
          : "text-secondary";

  const showWorkerBar =
    workersFilled !== undefined &&
    workersCapacity !== undefined &&
    workersCapacity > 0;
  const workerPercent = showWorkerBar
    ? Math.min(100, Math.round((workersFilled! / workersCapacity!) * 100))
    : 0;

  return (
    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
      {thumbnailUrl && (
        <SignedCampaignMedia
          objectKeyOrUrl={thumbnailUrl}
          mediaType={thumbnailType ?? "IMAGE"}
          alt={name}
          className="w-100"
          style={{ height: 140, objectFit: "cover" }}
        />
      )}
      <Card.Body className="p-4">
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div className="min-w-0">
            <Badge
              bg="primary"
              className="bg-primary-subtle text-primary-emphasis fw-semibold rounded-pill px-2 py-1"
            >
              {category}
            </Badge>
            <h3 className="mt-3 fs-5 fw-bold text-truncate" title={name}>
              {name}
            </h3>
          </div>
          <Badge
            bg={
              status === "PAUSED"
                ? "warning"
                : status === "DRAFT"
                  ? "secondary"
                  : "success"
            }
            className={`text-nowrap ${
              status === "PAUSED"
                ? "bg-warning-subtle text-warning-emphasis"
                : status === "DRAFT"
                  ? "bg-secondary-subtle text-secondary-emphasis"
                  : "bg-success-subtle text-success-emphasis"
            }`}
          >
            {status}
          </Badge>
        </div>

        {suggested && (
          <div className="d-flex align-items-center gap-2 mt-3 text-primary small fw-semibold">
            <Sparkles size={14} />
            <span>Suggested for active workers</span>
          </div>
        )}

        <Stack
          direction="horizontal"
          gap={4}
          className={`${suggested ? "mt-3" : "mt-4"} flex-wrap text-secondary small`}
        >
          <span className="d-flex align-items-center gap-2">
            <CircleDollarSign size={16} />
            {reward}
          </span>
          <span className={`d-flex align-items-center gap-2 ${periodTone}`}>
            <CalendarDays size={16} />
            {period}
          </span>
          <span className="d-flex align-items-center gap-2">
            <Users size={16} />
            {workers}
          </span>
        </Stack>

        {showWorkerBar && (
          <ProgressBar
            now={workerPercent}
            className="mt-2"
            style={{ height: 5 }}
            variant={
              workerPercent >= 100
                ? "success"
                : workerPercent >= 60
                  ? "primary"
                  : "secondary"
            }
          />
        )}

        {children && <div className="border-top mt-3 pt-3">{children}</div>}
      </Card.Body>
    </Card>
  );
}

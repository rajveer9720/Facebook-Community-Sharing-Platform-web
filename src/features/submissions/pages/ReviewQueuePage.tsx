import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  OverlayTrigger,
  Popover,
  Row,
  Spinner,
  Stack,
  Table,
} from "react-bootstrap";
import {
  ShieldCheck,
  FileSearch,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SignedProofImage } from "@/components/common/SignedMedia";
import { Can } from "@/casl/AbilityContext";
import {
  useGetSubmissionsQuery,
  useReviewSubmissionMutation,
} from "@/features/submissions/submissionsApi";
import { formatMoney, formatDate } from "@/utils/format";
import type { ReviewDecision } from "@/types/submission";

function isToday(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).toDateString() === new Date().toDateString();
}

function toPercent(value: number | null): number {
  if (value === null) return 0;
  return value <= 1 ? Math.round(value * 100) : Math.round(value);
}

function formatRiskPercent(value: number | null): string {
  if (value === null) return "0%";
  return `${value <= 1 ? Math.round(value * 100) : Math.round(value)}%`;
}

function formatFraudSignals(signals: Record<string, unknown>): string {
  const entries = Object.entries(signals);
  if (entries.length === 0) {
    return "";
  }

  return entries.map(([key, value]) => `${key}=${String(value)}`).join(", ");
}

// ---- NEW: readable parsing of the AI explanation string ----

const CHECK_LABELS: Record<string, string> = {
  screenshot: "Screenshot present",
  ocrText: "OCR text matched",
  captionMatch: "Caption match",
  imageMatch: "Image match",
  groupNameMatch: "Group name match",
  dateVisible: "Date visible",
  timeVisible: "Time visible",
};

function parseExplanation(explanation: string): {
  notes: string[];
  checks: { label: string; passed: boolean }[];
} {
  const segments = explanation
    .split("|")
    .map((segment) => segment.trim())
    .filter(Boolean);

  const notes: string[] = [];
  const checks: { label: string; passed: boolean }[] = [];

  segments.forEach((segment) => {
    // Confidence is already shown in its own column, skip duplicating it here
    if (/^confidence\s+\d+%$/i.test(segment)) {
      return;
    }

    const checksMatch = segment.match(/^AI checks:\s*(.+)$/i);
    if (checksMatch) {
      checksMatch[1]
        .split(",")
        .map((pair) => pair.trim())
        .filter(Boolean)
        .forEach((pair) => {
          const [rawKey, rawValue] = pair.split("=").map((part) => part.trim());
          if (!rawKey) return;
          checks.push({
            label: CHECK_LABELS[rawKey] ?? rawKey,
            passed: rawValue?.toLowerCase() === "true",
          });
        });
      return;
    }

    notes.push(segment);
  });

  return { notes, checks };
}

type InsightSubmission = {
  explanation: string;
  fraudRiskScore: number | null;
  riskFlag: boolean;
  fraudSignals: Record<string, unknown>;
};

function DecisionInsightCell({
  submission,
}: {
  submission: InsightSubmission;
}) {
  const { notes, checks } = parseExplanation(submission.explanation);
  const passedCount = checks.filter((check) => check.passed).length;
  const hasChecks = checks.length > 0;
  const hasSignals = Object.keys(submission.fraudSignals).length > 0;

  const popover = (
    <Popover style={{ maxWidth: 340 }}>
      <Popover.Header as="h6">AI verification details</Popover.Header>
      <Popover.Body>
        {notes.length > 0 && (
          <ul className="ps-3 mb-2 small">
            {notes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        )}
        {hasChecks && (
          <div className="d-flex flex-column gap-1 mb-2">
            {checks.map((check, idx) => (
              <div key={idx} className="d-flex align-items-center gap-2 small">
                {check.passed ? (
                  <CheckCircle2
                    size={14}
                    className="text-success flex-shrink-0"
                  />
                ) : (
                  <XCircle size={14} className="text-danger flex-shrink-0" />
                )}
                <span>{check.label}</span>
              </div>
            ))}
          </div>
        )}
        {hasSignals && (
          <div className="text-secondary small border-top pt-2">
            Signals: {formatFraudSignals(submission.fraudSignals)}
          </div>
        )}
      </Popover.Body>
    </Popover>
  );

  return (
    <Stack gap={1} style={{ minWidth: 220, maxWidth: 300 }}>
      {notes[0] && (
        <div className="small text-secondary text-truncate" title={notes[0]}>
          {notes[0]}
        </div>
      )}

      <div className="d-flex align-items-center gap-2 flex-wrap">
        {hasChecks && (
          <Badge
            bg={passedCount === checks.length ? "success" : "secondary"}
            className={
              passedCount === checks.length
                ? "bg-success-subtle text-success-emphasis"
                : "bg-secondary-subtle text-secondary-emphasis"
            }
          >
            {passedCount}/{checks.length} checks passed
          </Badge>
        )}
        {submission.fraudRiskScore !== null && (
          <Badge bg="light" text="dark" className="border">
            Fraud risk {formatRiskPercent(submission.fraudRiskScore)}
          </Badge>
        )}
        {submission.riskFlag && (
          <Badge
            bg="warning"
            className="bg-warning-subtle text-warning-emphasis"
          >
            Risk flag
          </Badge>
        )}
      </div>

      <OverlayTrigger
        trigger="click"
        placement="left"
        rootClose
        overlay={popover}
      >
        <Button
          variant="link"
          size="sm"
          className="p-0 text-decoration-none align-self-start"
        >
          View details
        </Button>
      </OverlayTrigger>
    </Stack>
  );
}

export default function ReviewQueuePage() {
  const { data: submissions, isLoading } = useGetSubmissionsQuery();
  const [reviewSubmission, { isLoading: isReviewing }] =
    useReviewSubmissionMutation();
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const queue =
    submissions
      ?.filter((s) => s.status === "PENDING" || s.status === "MANUAL_REVIEW")
      .map((s) => ({
        ...s,
        confidence: toPercent(s.verificationConfidence),
        explanation:
          s.verificationExplanation ??
          "Awaiting verification explanation from engine.",
        riskFlag:
          s.flaggedForFraud ||
          s.duplicateProofDetected ||
          s.duplicateUrlDetected,
      })) ?? [];
  const approvedToday =
    submissions?.filter((s) => s.status === "APPROVED" && isToday(s.reviewedAt))
      .length ?? 0;
  const rejectedToday =
    submissions?.filter((s) => s.status === "REJECTED" && isToday(s.reviewedAt))
      .length ?? 0;

  async function handleDecision(id: string, decision: ReviewDecision) {
    setError("");
    setActioningId(id);
    try {
      await reviewSubmission({ id, decision }).unwrap();
    } catch (submitError) {
      const message =
        submitError && typeof submitError === "object" && "data" in submitError
          ? (submitError as { data?: { message?: string } }).data?.message
          : undefined;
      setError(message ?? "Unable to update this submission.");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div>
      <p className="text-primary fw-semibold mb-1">Proof verification</p>
      <h1 className="fs-3 fw-bold">Verification queue</h1>
      <p className="text-secondary">
        Review pending and manual-review submissions, inspect proof, and
        approve, reject or request resubmission.
      </p>

      <Row className="g-3 mt-1">
        <Col sm={4}>
          <StatCard label="In queue" value={String(queue.length)} />
        </Col>
        <Col sm={4}>
          <StatCard label="Approved today" value={String(approvedToday)} />
        </Col>
        <Col sm={4}>
          <StatCard label="Rejected today" value={String(rejectedToday)} />
        </Col>
      </Row>

      {error && (
        <Alert
          variant="danger"
          className="mt-3"
          dismissible
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      <Card className="border-0 shadow-sm rounded-4 mt-4">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <ShieldCheck className="text-primary" size={18} />
            <h2 className="fs-5 fw-semibold mb-0">Verification assistant</h2>
          </div>
          <Row className="g-3">
            <Col md={4}>
              <div className="rounded-4 border p-3 h-100">
                <div className="d-flex align-items-center gap-2 text-primary mb-2">
                  <FileSearch size={16} />
                  <span className="small fw-semibold">Proof review</span>
                </div>
                <p className="fw-semibold mb-0">
                  Screenshot, URL and group evidence checked together
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="rounded-4 border p-3 h-100">
                <div className="d-flex align-items-center gap-2 text-primary mb-2">
                  <Sparkles size={16} />
                  <span className="small fw-semibold">AI confidence</span>
                </div>
                <p className="fw-semibold mb-0">
                  High confidence items can be auto-routed for approval
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="rounded-4 border p-3 h-100">
                <p className="text-secondary small mb-1">Risk note</p>
                <Badge
                  bg="warning"
                  className="bg-warning-subtle text-warning-emphasis"
                >
                  Manual review recommended
                </Badge>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-4 mt-4">
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="p-4">
              <Spinner animation="border" size="sm" />
            </div>
          ) : queue.length === 0 ? (
            <div className="p-4 text-secondary">The review queue is empty.</div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Worker</th>
                    <th>Campaign</th>
                    <th>Group</th>
                    <th>Proof</th>
                    <th>Reward</th>
                    <th>AI score</th>
                    <th style={{ minWidth: 220 }}>Decision insight</th>
                    <th>Status</th>
                    <th className="pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((submission) => (
                    <tr key={submission.id}>
                      <td className="ps-4 fw-semibold">
                        {submission.workerName}
                      </td>
                      <td>{submission.campaignName}</td>
                      <td>{submission.groupName}</td>
                      <td>
                        {submission.proofUrl ? (
                          <>
                            <SignedProofImage
                              submissionId={submission.id}
                              className="rounded-2 border"
                              style={{
                                maxHeight: 60,
                                maxWidth: 80,
                                objectFit: "cover",
                                display: "block",
                                marginBottom: 4,
                              }}
                            />
                            <div className="text-secondary small">
                              {formatDate(submission.submittedAt)}
                            </div>
                          </>
                        ) : (
                          <span className="text-secondary">No proof URL</span>
                        )}
                      </td>
                      <td>{formatMoney(submission.rewardMinor)}</td>
                      <td>
                        <Badge
                          bg={
                            submission.confidence >= 88
                              ? "success"
                              : submission.confidence >= 75
                                ? "warning"
                                : "danger"
                          }
                          className={
                            submission.confidence >= 88
                              ? "bg-success-subtle text-success-emphasis"
                              : submission.confidence >= 75
                                ? "bg-warning-subtle text-warning-emphasis"
                                : "bg-danger-subtle text-danger-emphasis"
                          }
                        >
                          {submission.confidence}%
                        </Badge>
                        <div className="text-secondary small mt-1">
                          {submission.confidence >= 88
                            ? "High"
                            : submission.confidence >= 75
                              ? "Medium"
                              : "Low"}{" "}
                          confidence
                        </div>
                      </td>
                      <td>
                        <DecisionInsightCell submission={submission} />
                      </td>
                      <td>
                        <StatusBadge status={submission.status} />
                      </td>
                      <td className="pe-4">
                        <Can I="review" a="Submission">
                          <Stack direction="horizontal" gap={2}>
                            <Button
                              size="sm"
                              variant="success"
                              disabled={
                                isReviewing && actioningId === submission.id
                              }
                              onClick={() =>
                                handleDecision(submission.id, "APPROVE")
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              disabled={
                                isReviewing && actioningId === submission.id
                              }
                              onClick={() =>
                                handleDecision(submission.id, "REJECT")
                              }
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              disabled={
                                isReviewing && actioningId === submission.id
                              }
                              onClick={() =>
                                handleDecision(
                                  submission.id,
                                  "REQUEST_RESUBMISSION",
                                )
                              }
                            > 
                              Resubmit
                            </Button>
                          </Stack>
                        </Can>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

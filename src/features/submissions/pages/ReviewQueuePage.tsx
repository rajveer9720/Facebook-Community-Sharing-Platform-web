import { useState } from 'react';
import { Alert, Badge, Button, Card, Col, Row, Spinner, Stack, Table } from 'react-bootstrap';
import { ShieldCheck, FileSearch, Sparkles } from 'lucide-react';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SignedProofImage } from '@/components/common/SignedMedia';
import { useGetSubmissionsQuery, useReviewSubmissionMutation } from '@/features/submissions/submissionsApi';
import { formatMoney, formatDate } from '@/utils/format';
import type { ReviewDecision } from '@/types/submission';

function isToday(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).toDateString() === new Date().toDateString();
}

function toPercent(value: number | null): number {
  if (value === null) return 0;
  return value <= 1 ? Math.round(value * 100) : Math.round(value);
}

function formatRiskPercent(value: number | null): string {
  if (value === null) return '0%';
  return `${value <= 1 ? Math.round(value * 100) : Math.round(value)}%`;
}

function formatFraudSignals(signals: Record<string, unknown>): string {
  const entries = Object.entries(signals);
  if (entries.length === 0) {
    return '';
  }

  return entries
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(', ');
}

export default function ReviewQueuePage() {
  const { data: submissions, isLoading } = useGetSubmissionsQuery();
  const [reviewSubmission, { isLoading: isReviewing }] = useReviewSubmissionMutation();
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const queue =
    submissions
      ?.filter((s) => s.status === 'PENDING' || s.status === 'MANUAL_REVIEW')
      .map((s) => ({
        ...s,
        confidence: toPercent(s.verificationConfidence),
        explanation: s.verificationExplanation ?? 'Awaiting verification explanation from engine.',
        riskFlag: s.flaggedForFraud || s.duplicateProofDetected || s.duplicateUrlDetected,
      })) ?? [];
  const approvedToday = submissions?.filter((s) => s.status === 'APPROVED' && isToday(s.reviewedAt)).length ?? 0;
  const rejectedToday = submissions?.filter((s) => s.status === 'REJECTED' && isToday(s.reviewedAt)).length ?? 0;

  async function handleDecision(id: string, decision: ReviewDecision) {
    setError('');
    setActioningId(id);
    try {
      await reviewSubmission({ id, decision }).unwrap();
    } catch (submitError) {
      const message =
        submitError && typeof submitError === 'object' && 'data' in submitError
          ? (submitError as { data?: { message?: string } }).data?.message
          : undefined;
      setError(message ?? 'Unable to update this submission.');
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div>
      <p className="text-primary fw-semibold mb-1">Proof verification</p>
      <h1 className="fs-3 fw-bold">Verification queue</h1>
      <p className="text-secondary">
        Review pending and manual-review submissions, inspect proof, and approve, reject or request resubmission.
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
        <Alert variant="danger" className="mt-3" dismissible onClose={() => setError('')}>
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
                <p className="fw-semibold mb-0">Screenshot, URL and group evidence checked together</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="rounded-4 border p-3 h-100">
                <div className="d-flex align-items-center gap-2 text-primary mb-2">
                  <Sparkles size={16} />
                  <span className="small fw-semibold">AI confidence</span>
                </div>
                <p className="fw-semibold mb-0">High confidence items can be auto-routed for approval</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="rounded-4 border p-3 h-100">
                <p className="text-secondary small mb-1">Risk note</p>
                <Badge bg="warning" className="bg-warning-subtle text-warning-emphasis">Manual review recommended</Badge>
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
                    <th>Decision insight</th>
                    <th>Status</th>
                    <th className="pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((submission) => (
                    <tr key={submission.id}>
                      <td className="ps-4 fw-semibold">{submission.workerName}</td>
                      <td>{submission.campaignName}</td>
                      <td>{submission.groupName}</td>
                      <td>
                        {submission.proofUrl ? (
                          <>
                            <SignedProofImage
                              submissionId={submission.id}
                              className="rounded-2 border"
                              style={{ maxHeight: 60, maxWidth: 80, objectFit: 'cover', display: 'block', marginBottom: 4 }}
                            />
                            <div className="text-secondary small">{formatDate(submission.submittedAt)}</div>
                          </>
                        ) : (
                          <span className="text-secondary">No proof URL</span>
                        )}
                      </td>
                      <td>{formatMoney(submission.rewardMinor)}</td>
                      <td>
                        <div className="fw-semibold">{submission.confidence}%</div>
                        <div className="text-secondary small">
                          {submission.confidence >= 88 ? 'High' : submission.confidence >= 75 ? 'Medium' : 'Low'} confidence
                        </div>
                      </td>
                      <td>
                        <div className="small">{submission.explanation}</div>
                        {submission.fraudRiskScore !== null && (
                          <div className="small text-secondary mt-1">Fraud risk: {formatRiskPercent(submission.fraudRiskScore)}</div>
                        )}
                        {submission.riskFlag && (
                          <Badge bg="warning" className="bg-warning-subtle text-warning-emphasis mt-1">
                            Risk flag
                          </Badge>
                        )}
                        {Object.keys(submission.fraudSignals).length > 0 && (
                          <div className="text-secondary small mt-1">Signals: {formatFraudSignals(submission.fraudSignals)}</div>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={submission.status} />
                      </td>
                      <td className="pe-4">
                        <Stack direction="horizontal" gap={2}>
                          <Button
                            size="sm"
                            variant="success"
                            disabled={isReviewing && actioningId === submission.id}
                            onClick={() => handleDecision(submission.id, 'APPROVE')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={isReviewing && actioningId === submission.id}
                            onClick={() => handleDecision(submission.id, 'REJECT')}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            disabled={isReviewing && actioningId === submission.id}
                            onClick={() => handleDecision(submission.id, 'REQUEST_RESUBMISSION')}
                          >
                            Resubmit
                          </Button>
                        </Stack>
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

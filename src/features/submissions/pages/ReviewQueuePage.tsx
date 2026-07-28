import { useState } from 'react';
import { Alert, Button, Card, Col, Row, Spinner, Stack, Table } from 'react-bootstrap';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useGetSubmissionsQuery, useReviewSubmissionMutation } from '@/features/submissions/submissionsApi';
import { formatMoney, formatDate } from '@/utils/format';
import type { ReviewDecision } from '@/types/submission';

function isToday(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).toDateString() === new Date().toDateString();
}

export default function ReviewQueuePage() {
  const { data: submissions, isLoading } = useGetSubmissionsQuery();
  const [reviewSubmission, { isLoading: isReviewing }] = useReviewSubmissionMutation();
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const queue = submissions?.filter((s) => s.status === 'PENDING' || s.status === 'MANUAL_REVIEW') ?? [];
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
                        <a href={submission.proofUrl} target="_blank" rel="noreferrer">
                          View post
                        </a>
                        <div className="text-secondary small">{formatDate(submission.submittedAt)}</div>
                      </td>
                      <td>{formatMoney(submission.rewardMinor)}</td>
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

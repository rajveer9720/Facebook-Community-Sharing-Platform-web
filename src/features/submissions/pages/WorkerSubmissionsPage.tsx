import { Card, Spinner, Table } from 'react-bootstrap';
import { useAppSelector } from '@/app/hooks';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useGetSubmissionsQuery } from '@/features/submissions/submissionsApi';
import { formatMoney, formatDate } from '@/utils/format';

export default function WorkerSubmissionsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const { data: submissions, isLoading } = useGetSubmissionsQuery(user ? { workerId: user.id } : undefined);

  return (
    <div>
      <p className="text-primary fw-semibold mb-1">Your activity</p>
      <h1 className="fs-3 fw-bold">My submissions</h1>
      <p className="text-secondary">Track pending, manual-review, approved and rejected proofs here.</p>

      <Card className="border-0 shadow-sm rounded-4 mt-3">
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="p-4">
              <Spinner animation="border" size="sm" />
            </div>
          ) : submissions && submissions.length > 0 ? (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Campaign</th>
                    <th>Group</th>
                    <th>Submitted</th>
                    <th>Reward</th>
                    <th>Status</th>
                    <th className="pe-4">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id}>
                      <td className="ps-4 fw-semibold">{submission.campaignName}</td>
                      <td>{submission.groupName}</td>
                      <td>{formatDate(submission.submittedAt)}</td>
                      <td>{formatMoney(submission.rewardMinor)}</td>
                      <td>
                        <StatusBadge status={submission.status} />
                      </td>
                      <td className="pe-4 text-secondary small">{submission.reviewNote ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="p-4 text-secondary">
              Submission upload is available from each claimed campaign assignment. Evidence supports post URLs,
              group details and the posted caption.
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

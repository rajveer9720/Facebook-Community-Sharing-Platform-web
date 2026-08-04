import { Badge, Card, Spinner, Table } from 'react-bootstrap';
import { useGetAdminWorkerPerformanceQuery } from '@/features/workerPerformance/workerPerformanceApi';

function normalizeRate(value: number): number {
  return Math.round(value <= 1 ? value * 100 : value);
}

export default function AdminWorkersPage() {
  const { data, isLoading } = useGetAdminWorkerPerformanceQuery();
  const workers = data?.items ?? [];

  return (
    <div>
      <p className="text-primary fw-semibold mb-1">Workforce</p>
      <h1 className="fs-3 fw-bold">Workers</h1>
      <p className="text-secondary">Every registered worker with their current trust score and performance.</p>

      <Card className="border-0 shadow-sm rounded-4 mt-4">
        <Card.Header className="bg-white fw-bold border-0 pt-4 px-4">All workers ({workers.length})</Card.Header>
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="p-4">
              <Spinner animation="border" size="sm" />
            </div>
          ) : workers.length === 0 ? (
            <div className="p-4 text-secondary">No workers registered yet.</div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Name</th>
                    <th>Email</th>
                    <th>Tier</th>
                    <th>Trust score</th>
                    <th>Approval rate</th>
                    <th>Fraud risk</th>
                    <th className="pe-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((worker) => (
                    <tr key={worker.workerId}>
                      <td className="ps-4 fw-semibold">{worker.workerName || worker.workerId}</td>
                      <td>{worker.email || '—'}</td>
                      <td>{worker.tier}</td>
                      <td>
                        <Badge
                          bg={worker.trustScore >= 80 ? 'success' : worker.trustScore >= 50 ? 'warning' : 'danger'}
                          className={
                            worker.trustScore >= 80
                              ? 'bg-success-subtle text-success-emphasis'
                              : worker.trustScore >= 50
                                ? 'bg-warning-subtle text-warning-emphasis'
                                : 'bg-danger-subtle text-danger-emphasis'
                          }
                        >
                          {Math.round(worker.trustScore)}
                        </Badge>
                      </td>
                      <td>{normalizeRate(worker.approvalRate)}%</td>
                      <td>{normalizeRate(worker.fraudRiskScore)}%</td>
                      <td className="pe-4">
                        {worker.isFlagged ? (
                          <Badge bg="danger" className="bg-danger-subtle text-danger-emphasis">
                            Flagged
                          </Badge>
                        ) : (
                          <Badge bg="success" className="bg-success-subtle text-success-emphasis">
                            Active
                          </Badge>
                        )}
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

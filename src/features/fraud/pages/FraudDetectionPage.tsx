import { Badge, Card, Col, OverlayTrigger, Row, Spinner, Table, Tooltip } from 'react-bootstrap';
import { AlertTriangle, Fingerprint, ScanSearch, ShieldAlert } from 'lucide-react';
import { useGetSubmissionsQuery } from '@/features/submissions/submissionsApi';
import { useGetGroupCoverageQuery } from '@/features/groups/groupsApi';
import { formatDate } from '@/utils/format';

function normalizeRiskScore(value: number | null): number {
  if (value === null) return 0;
  return value <= 1 ? value * 100 : value;
}

function riskLevel(score: number): 'High' | 'Medium' | 'Flagged' {
  if (score >= 85) return 'High';
  if (score >= 65) return 'Medium';
  return 'Flagged';
}

function formatFraudSignals(signals: Record<string, unknown>): string {
  const entries = Object.entries(signals);
  if (entries.length === 0) {
    return '';
  }

  return entries.map(([key, value]) => `${key}=${String(value)}`).join(', ');
}

export default function FraudDetectionPage() {
  const { data: submissions, isLoading: submissionsLoading } = useGetSubmissionsQuery();
  const { data: coverage, isLoading: coverageLoading } = useGetGroupCoverageQuery();

  const suspicious = (submissions ?? [])
    .filter((entry) => entry.flaggedForFraud || normalizeRiskScore(entry.fraudRiskScore) >= 65 || entry.duplicateProofDetected || entry.duplicateUrlDetected)
    .sort((a, b) => normalizeRiskScore(b.fraudRiskScore) - normalizeRiskScore(a.fraudRiskScore))
    .slice(0, 8);

  const highRiskCount = suspicious.filter((entry) => riskLevel(normalizeRiskScore(entry.fraudRiskScore)) === 'High').length;
  const mediumRiskCount = suspicious.filter((entry) => riskLevel(normalizeRiskScore(entry.fraudRiskScore)) === 'Medium').length;

  return (
    <div>
      <p className="text-primary fw-semibold mb-1">Fraud prevention</p>
      <h1 className="fs-3 fw-bold">Fraud detection desk</h1>
      <p className="text-secondary">Track suspicious proof behavior and route high-risk submissions to manual review.</p>

      {submissionsLoading || coverageLoading ? (
        <Spinner animation="border" size="sm" className="mt-2" />
      ) : (
        <Row className="g-3 mt-1">
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-2 mb-2 text-danger">
                  <ShieldAlert size={16} />
                  <span className="small fw-semibold">High risk</span>
                </div>
                <p className="fs-4 fw-bold mb-0">{highRiskCount}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-2 mb-2 text-warning">
                  <AlertTriangle size={16} />
                  <span className="small fw-semibold">Medium risk</span>
                </div>
                <p className="fs-4 fw-bold mb-0">{mediumRiskCount}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                  <ScanSearch size={16} />
                  <span className="small fw-semibold">Duplicate rate</span>
                </div>
                <p className="fs-4 fw-bold mb-0">{Math.round((coverage?.duplicateGroupRate ?? 0) * 100)}%</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-2 mb-2 text-secondary">
                  <Fingerprint size={16} />
                  <span className="small fw-semibold">Flagged queue</span>
                </div>
                <p className="fs-4 fw-bold mb-0">{suspicious.length}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Card className="border-0 shadow-sm rounded-4 mt-4">
        <Card.Header className="bg-white fw-bold border-0 pt-4 px-4">Suspicious submission queue</Card.Header>
        <Card.Body className="p-0">
          {submissionsLoading ? (
            <div className="p-4">
              <Spinner animation="border" size="sm" />
            </div>
          ) : suspicious.length === 0 ? (
            <div className="p-4 text-secondary">No suspicious submissions detected right now.</div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Worker</th>
                    <th>Campaign</th>
                    <th>Group</th>
                    <th>Submitted</th>
                    <th>Risk score</th>
                    <th className="pe-4">Risk level</th>
                  </tr>
                </thead>
                <tbody>
                  {suspicious.map((row) => {
                    const level = riskLevel(normalizeRiskScore(row.fraudRiskScore));
                    const badgeBg = level === 'High' ? 'danger' : level === 'Medium' ? 'warning' : 'secondary';
                    const badgeClass =
                      level === 'High'
                        ? 'bg-danger-subtle text-danger-emphasis'
                        : level === 'Medium'
                          ? 'bg-warning-subtle text-warning-emphasis'
                          : 'bg-secondary-subtle text-secondary-emphasis';
                    return (
                    <tr key={row.id}>
                      <td className="ps-4 fw-semibold">{row.workerName}</td>
                      <td>{row.campaignName}</td>
                      <td>{row.groupName}</td>
                      <td>{formatDate(row.submittedAt)}</td>
                      <td>{Math.round(normalizeRiskScore(row.fraudRiskScore))}</td>
                      <td className="pe-4">
                        <Badge bg={badgeBg} className={badgeClass}>
                          {level}
                        </Badge>
                        {Object.keys(row.fraudSignals).length > 0 && (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`fraud-signals-${row.id}`}>{formatFraudSignals(row.fraudSignals)}</Tooltip>}
                          >
                            <div
                              className="small text-secondary mt-1 text-truncate"
                              style={{ maxWidth: 280, cursor: 'help' }}
                            >
                              {formatFraudSignals(row.fraudSignals)}
                            </div>
                          </OverlayTrigger>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

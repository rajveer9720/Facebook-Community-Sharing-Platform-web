import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { StatCard } from '@/components/common/StatCard';
import { useGetAdminOverviewQuery } from '@/features/analytics/analyticsApi';

export default function AdminDashboardPage() {
  const { data, isLoading } = useGetAdminOverviewQuery();

  return (
    <div>
      <p className="text-primary fw-semibold mb-1">Admin Console</p>
      <h1 className="fs-3 fw-bold">Platform overview</h1>
      <p className="text-secondary">Monitor workers, campaigns and group coverage.</p>

      {isLoading ? (
        <Spinner animation="border" size="sm" />
      ) : (
        <Row className="g-3 mt-1">
          <Col xs={6} md={3}>
            <StatCard label="Total workers" value={String(data?.totalWorkers ?? 0)} />
          </Col>
          <Col xs={6} md={3}>
            <StatCard label="Running campaigns" value={String(data?.runningCampaigns ?? 0)} />
          </Col>
          <Col xs={6} md={3}>
            <StatCard label="Pending reviews" value={String(data?.pendingReviews ?? 0)} />
          </Col>
          <Col xs={6} md={3}>
            <StatCard label="Unique groups" value={String(data?.uniqueGroups ?? 0)} />
          </Col>
        </Row>
      )}

      <Card className="border-0 shadow-sm rounded-4 mt-4">
        <Card.Body className="p-4">
          <h2 className="fs-5 fw-semibold">Campaign and group intelligence is active</h2>
          <p className="mt-2 text-secondary mb-0">
            Campaign assignments, proof verification, personal group libraries and cooldown-aware recommendations
            now share one workflow.
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}

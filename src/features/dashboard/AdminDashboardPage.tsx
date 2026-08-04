import { Row, Col, Card, Spinner, Stack } from 'react-bootstrap';
import { ArrowRight, Briefcase, ClipboardCheck, BadgeDollarSign, Users, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '@/components/common/StatCard';
import { useGetAdminOverviewQuery } from '@/features/analytics/analyticsApi';
import { useGetAdminWorkerPerformanceQuery } from '@/features/workerPerformance/workerPerformanceApi';
import { ROUTES } from '@/routes/routePaths';

export default function AdminDashboardPage() {
  const { data, isLoading } = useGetAdminOverviewQuery();
  const { data: performance, isLoading: performanceLoading } = useGetAdminWorkerPerformanceQuery();
  const performanceItems = performance?.items ?? [];
  const flaggedWorkers = performanceItems.filter((worker) => worker.isFlagged).length;
  const highTrustWorkers = performanceItems.filter((worker) => worker.trustScore >= 80).length;

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

      <Row className="g-3 mt-2">
        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start gap-3">
                <div>
                  <p className="text-primary fw-semibold mb-1">Operations snapshot</p>
                  <h2 className="fs-5 fw-semibold mb-2">Keep the platform moving</h2>
                  <p className="text-secondary mb-0">Review queue, campaign performance and payouts all in one view.</p>
                </div>
                <Link className="btn btn-outline-secondary btn-sm" to={ROUTES.admin.analytics}>
                  Open analytics <ArrowRight size={16} />
                </Link>
              </div>
              <Row className="g-3 mt-3">
                <Col xs={6} md={3}>
                  <div className="rounded-4 border p-3 h-100">
                    <Users size={18} className="text-primary mb-2" />
                    <p className="small text-secondary mb-1">Workers</p>
                    <p className="fw-semibold mb-0">{data?.totalWorkers ?? 0}</p>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="rounded-4 border p-3 h-100">
                    <Briefcase size={18} className="text-primary mb-2" />
                    <p className="small text-secondary mb-1">Campaigns</p>
                    <p className="fw-semibold mb-0">{data?.runningCampaigns ?? 0}</p>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="rounded-4 border p-3 h-100">
                    <ClipboardCheck size={18} className="text-primary mb-2" />
                    <p className="small text-secondary mb-1">Pending</p>
                    <p className="fw-semibold mb-0">{data?.pendingReviews ?? 0}</p>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="rounded-4 border p-3 h-100">
                    <BadgeDollarSign size={18} className="text-primary mb-2" />
                    <p className="small text-secondary mb-1">Groups</p>
                    <p className="fw-semibold mb-0">{data?.uniqueGroups ?? 0}</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <p className="text-primary fw-semibold mb-1">Quick actions</p>
              <h2 className="fs-5 fw-semibold mb-3">Jump into key workflows</h2>
              <Stack gap={2}>
                <Link className="btn btn-dark w-100 justify-content-between d-flex align-items-center" to={ROUTES.admin.newCampaign}>
                  Create campaign <ArrowRight size={16} />
                </Link>
                <Link className="btn btn-outline-secondary w-100 justify-content-between d-flex align-items-center" to={ROUTES.admin.review}>
                  Review submissions <ArrowRight size={16} />
                </Link>
                <Link className="btn btn-outline-secondary w-100 justify-content-between d-flex align-items-center" to={ROUTES.admin.withdrawals}>
                  Manage payouts <ArrowRight size={16} />
                </Link>
                <Link className="btn btn-outline-secondary w-100 justify-content-between d-flex align-items-center" to={ROUTES.admin.analytics}>
                  Review analytics <BarChart3 size={16} />
                </Link>
              </Stack>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm rounded-4 mt-3">
        <Card.Body className="p-4">
          <p className="text-primary fw-semibold mb-1">Priority focus</p>
          <h2 className="fs-5 fw-semibold mb-2">Keep quality and payout reliability high</h2>
          <p className="text-secondary mb-0">Use the queue to balance approvals, resolve payout bottlenecks and protect group quality standards.</p>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-4 mt-3">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start gap-3">
            <p className="text-primary fw-semibold mb-1">Worker performance</p>
            <Link className="btn btn-outline-secondary btn-sm" to={ROUTES.admin.workers}>
              View all workers <ArrowRight size={16} />
            </Link>
          </div>
          {performanceLoading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <Row className="g-3">
              <Col sm={6} md={3}>
                <StatCard label="Flagged workers" value={String(flaggedWorkers)} />
              </Col>
              <Col sm={6} md={3}>
                <StatCard label="High-trust workers" value={String(highTrustWorkers)} />
              </Col>
              <Col sm={6} md={3}>
                <StatCard label="Performance records" value={String(performanceItems.length)} />
              </Col>
              <Col sm={6} md={3}>
                <StatCard
                  label="Avg fraud risk"
                  value={`${Math.round(
                    (performanceItems.reduce((sum, worker) => sum + worker.fraudRiskScore, 0) /
                      Math.max(1, performanceItems.length)) *
                      100,
                  )}%`}
                />
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

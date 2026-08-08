import { Row, Col, Card, Spinner, Stack, Badge } from "react-bootstrap";
import {
  ArrowRight,
  Briefcase,
  ClipboardCheck,
  BadgeDollarSign,
  Users,
  BarChart3,
  Layers,
} from "lucide-react";
import { Link } from "react-router-dom";
import { StatCard } from "@/components/common/StatCard";
import { useGetAdminOverviewQuery } from "@/features/analytics/analyticsApi";
import { useGetAdminWorkerPerformanceQuery } from "@/features/workerPerformance/workerPerformanceApi";
import { useGetWithdrawalsQuery } from "@/features/wallet/walletApi";
import { ROUTES } from "@/routes/routePaths";
import { Can, useAbility } from "@/casl/AbilityContext";

// ---- NEW: small colored icon chip so each metric is visually distinct ----
function MetricTile({
  icon,
  tone,
  label,
  value,
}: {
  icon: React.ReactNode;
  tone: "primary" | "success" | "warning" | "info";
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-4 border p-3 h-100">
      <div
        className={`bg-${tone}-subtle text-${tone === "warning" ? "warning-emphasis" : tone} d-inline-flex align-items-center justify-content-center rounded-3 mb-2`}
        style={{ width: 32, height: 32 }}
      >
        {icon}
      </div>
      <p className="small text-secondary mb-1">{label}</p>
      <p className="fw-semibold mb-0">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const ability = useAbility();
  const canSeeWorkers = ability.can("read", "WorkerDirectory");
  const canSeeCampaigns = ability.can("read", "Campaign");
  const canSeeSubmissions = ability.can("read", "Submission");
  const canSeeGroups = ability.can("read", "Group");
  const canSeeWithdrawals = ability.can("review", "Withdrawal");

  const { data, isLoading } = useGetAdminOverviewQuery();
  const { data: performance, isLoading: performanceLoading } =
    useGetAdminWorkerPerformanceQuery(undefined, {
      skip: !canSeeWorkers,
    });
  const { data: withdrawals, isLoading: withdrawalsLoading } =
    useGetWithdrawalsQuery(undefined, {
      skip: !canSeeWithdrawals,
    });

  const performanceItems = performance?.items ?? [];
  const flaggedWorkers = performanceItems.filter(
    (worker) => worker.isFlagged,
  ).length;
  const highTrustWorkers = performanceItems.filter(
    (worker) => worker.trustScore >= 80,
  ).length;
  const pendingWithdrawals =
    withdrawals?.items.filter((item) => item.status === "PENDING").length ?? 0;

  const avgFraudRisk = Math.round(
    performanceItems.reduce((sum, worker) => sum + worker.fraudRiskScore, 0) /
      Math.max(1, performanceItems.length),
  );
  const fraudRiskTone =
    avgFraudRisk >= 50 ? "danger" : avgFraudRisk >= 25 ? "warning" : "success";

  const showOperationsSnapshot =
    canSeeCampaigns || canSeeSubmissions || canSeeGroups || canSeeWorkers;

  return (
    <div>
      <p className="text-primary fw-semibold mb-1">Admin Console</p>
      <h1 className="fs-3 fw-bold">Platform overview</h1>
      <p className="text-secondary">
        Monitor workers, campaigns and group coverage.
      </p>

      {isLoading ? (
        <Spinner animation="border" size="sm" />
      ) : (
        <Row className="g-3 mt-1">
          {canSeeWorkers && (
            <Col xs={6} md={3} lg={2}>
              <StatCard
                label="Total workers"
                value={String(data?.totalWorkers ?? 0)}
              />
            </Col>
          )}
          {canSeeCampaigns && (
            <Col xs={6} md={3} lg={2}>
              <StatCard
                label="Running campaigns"
                value={String(data?.runningCampaigns ?? 0)}
              />
            </Col>
          )}
          {canSeeSubmissions && (
            <Col xs={6} md={3} lg={2}>
              <StatCard
                label="Pending reviews"
                value={String(data?.pendingReviews ?? 0)}
              />
            </Col>
          )}
          {canSeeGroups && (
            <Col xs={6} md={3} lg={2}>
              <StatCard
                label="Unique groups"
                value={String(data?.uniqueGroups ?? 0)}
              />
            </Col>
          )}
          {canSeeWithdrawals && (
            <Col xs={6} md={3} lg={2}>
              <StatCard
                label="Pending withdrawals"
                value={String(withdrawalsLoading ? "—" : pendingWithdrawals)}
              />
            </Col>
          )}
        </Row>
      )}

      <Row className="g-3 mt-2">
        {showOperationsSnapshot && (
          <Col lg={7}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div>
                    <p className="text-primary fw-semibold mb-1">
                      Operations snapshot
                    </p>
                    <h2 className="fs-5 fw-semibold mb-2">
                      Keep the platform moving
                    </h2>
                    <p className="text-secondary mb-0">
                      Review queue, campaign performance and payouts all in one
                      view.
                    </p>
                  </div>
                  <Can I="read" a="FinanceAnalytics">
                    <Link
                      className="btn btn-outline-secondary btn-sm text-nowrap"
                      to={ROUTES.admin.analytics}
                    >
                      Open analytics <ArrowRight size={16} />
                    </Link>
                  </Can>
                </div>
                <Row className="g-3 mt-3">
                  {canSeeWorkers && (
                    <Col xs={6} md={3}>
                      <MetricTile
                        tone="primary"
                        icon={<Users size={16} />}
                        label="Workers"
                        value={data?.totalWorkers ?? 0}
                      />
                    </Col>
                  )}
                  {canSeeCampaigns && (
                    <Col xs={6} md={3}>
                      <MetricTile
                        tone="success"
                        icon={<Briefcase size={16} />}
                        label="Campaigns"
                        value={data?.runningCampaigns ?? 0}
                      />
                    </Col>
                  )}
                  {canSeeSubmissions && (
                    <Col xs={6} md={3}>
                      <MetricTile
                        tone="warning"
                        icon={<ClipboardCheck size={16} />}
                        label="Pending"
                        value={data?.pendingReviews ?? 0}
                      />
                    </Col>
                  )}
                  {canSeeGroups && (
                    <Col xs={6} md={3}>
                      <MetricTile
                        tone="info"
                        icon={<Layers size={16} />}
                        label="Groups"
                        value={data?.uniqueGroups ?? 0}
                      />
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        )}
        <Col lg={showOperationsSnapshot ? 5 : 12}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <p className="text-primary fw-semibold mb-1">Quick actions</p>
              <h2 className="fs-5 fw-semibold mb-3">Jump into key workflows</h2>
              <Stack gap={2}>
                <Can I="manage" a="Campaign">
                  <Link
                    className="btn btn-dark w-100 justify-content-between d-flex align-items-center"
                    to={ROUTES.admin.newCampaign}
                  >
                    <span className="d-flex align-items-center gap-2">
                      <Briefcase size={16} />
                      Create campaign
                    </span>
                    <ArrowRight size={16} />
                  </Link>
                </Can>
                <Can I="read" a="Submission">
                  <Link
                    className="btn btn-outline-secondary w-100 justify-content-between d-flex align-items-center"
                    to={ROUTES.admin.review}
                  >
                    <span className="d-flex align-items-center gap-2">
                      <ClipboardCheck size={16} />
                      Review submissions
                    </span>
                    <ArrowRight size={16} />
                  </Link>
                </Can>
                <Can I="review" a="Withdrawal">
                  <Link
                    className="btn btn-outline-secondary w-100 justify-content-between d-flex align-items-center"
                    to={ROUTES.admin.withdrawals}
                  >
                    <span className="d-flex align-items-center gap-2">
                      <BadgeDollarSign size={16} />
                      Manage payouts
                    </span>
                    <ArrowRight size={16} />
                  </Link>
                </Can>
                <Can I="read" a="FinanceAnalytics">
                  <Link
                    className="btn btn-outline-secondary w-100 justify-content-between d-flex align-items-center"
                    to={ROUTES.admin.analytics}
                  >
                    <span className="d-flex align-items-center gap-2">
                      <BarChart3 size={16} />
                      Review analytics
                    </span>
                    <ArrowRight size={16} />
                  </Link>
                </Can>
              </Stack>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm rounded-4 mt-3">
        <Card.Body className="p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <p className="text-primary fw-semibold mb-1">Priority focus</p>
            <h2 className="fs-5 fw-semibold mb-2">
              Keep quality and payout reliability high
            </h2>
            <p className="text-secondary mb-0">
              Use the queue to balance approvals, resolve payout bottlenecks and
              protect group quality standards.
            </p>
          </div>
          <Can I="read" a="Submission">
            <Link
              className="btn btn-dark text-nowrap d-flex align-items-center gap-2"
              to={ROUTES.admin.review}
            >
              Open review queue <ArrowRight size={16} />
            </Link>
          </Can>
        </Card.Body>
      </Card>

      {canSeeWorkers && (
        <Card className="border-0 shadow-sm rounded-4 mt-3">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-start gap-3">
              <p className="text-primary fw-semibold mb-1">
                Worker performance
              </p>
              <Link
                className="btn btn-outline-secondary btn-sm"
                to={ROUTES.admin.workers}
              >
                View all workers <ArrowRight size={16} />
              </Link>
            </div>
            {performanceLoading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <Row className="g-3">
                <Col sm={6} md={3}>
                  <StatCard
                    label="Flagged workers"
                    value={String(flaggedWorkers)}
                  />
                </Col>
                <Col sm={6} md={3}>
                  <StatCard
                    label="High-trust workers"
                    value={String(highTrustWorkers)}
                  />
                </Col>
                <Col sm={6} md={3}>
                  <StatCard
                    label="Performance records"
                    value={String(performanceItems.length)}
                  />
                </Col>
                <Col sm={6} md={3}>
                  <div className="d-flex align-items-center gap-2 h-100">
                    <StatCard
                      label="Avg fraud risk"
                      value={`${avgFraudRisk}%`}
                    />
                    <Badge
                      bg={fraudRiskTone}
                      className={`bg-${fraudRiskTone}-subtle text-${fraudRiskTone}-emphasis`}
                    >
                      {fraudRiskTone === "danger"
                        ? "High"
                        : fraudRiskTone === "warning"
                          ? "Moderate"
                          : "Low"}
                    </Badge>
                  </div>
                </Col>
              </Row>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

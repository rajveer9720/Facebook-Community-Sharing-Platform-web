import { Row, Col, Card, Spinner, Alert, Stack } from "react-bootstrap";
import {
  ArrowRight,
  Briefcase,
  Sparkles,
  Target,
  Wallet as WalletIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { ROUTES } from "@/routes/routePaths";
import { StatCard } from "@/components/common/StatCard";
import { useGetCampaignsQuery } from "@/features/campaigns/campaignsApi";
import { useGetSubmissionsQuery } from "@/features/submissions/submissionsApi";
import { useGetMyWalletQuery } from "@/features/wallet/walletApi";
import { formatMoney } from "@/utils/format";

function isSameDay(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

export default function WorkerDashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const { data: campaigns, isLoading: campaignsLoading } = useGetCampaignsQuery(
    { status: "ACTIVE" },
  );
  const { data: submissions, isLoading: submissionsLoading } =
    useGetSubmissionsQuery(user ? { workerId: user.id } : undefined);
  const {
    data: wallet,
    isLoading: walletLoading,
    error: walletError,
  } = useGetMyWalletQuery();

  const pendingVerification =
    submissions?.filter(
      (s) => s.status === "PENDING" || s.status === "MANUAL_REVIEW",
    ).length ?? 0;
  const todaysEarningsMinor =
    submissions
      ?.filter(
        (s) =>
          s.status === "APPROVED" && s.reviewedAt && isSameDay(s.reviewedAt),
      )
      .reduce((sum, s) => sum + s.rewardMinor, 0) ?? 0;

  const isLoading = campaignsLoading || submissionsLoading || walletLoading;

  return (
    <div>
      <p className="text-primary fw-semibold mb-1">Worker Dashboard</p>
      <h1 className="fs-3 fw-bold">
        Welcome back{user ? `, ${user.firstName}` : ""}
      </h1>
      <p className="text-secondary">
        Complete approved campaigns and track your earnings.
      </p>

      {walletError && (
        <Alert variant="danger">Unable to load your wallet right now.</Alert>
      )}

      {isLoading ? (
        <Spinner animation="border" size="sm" />
      ) : (
        <Row className="g-3 mt-1">
          <Col xs={6} md={3}>
            <StatCard
              label="Available campaigns"
              value={String(campaigns?.length ?? 0)}
            />
          </Col>
          <Col xs={6} md={3}>
            <StatCard
              label="Pending verification"
              value={String(pendingVerification)}
            />
          </Col>
          <Col xs={6} md={3}>
            <StatCard
              label="Today's earnings"
              value={formatMoney(todaysEarningsMinor)}
            />
          </Col>
          <Col xs={6} md={3}>
            <StatCard
              label="Wallet balance"
              value={formatMoney(wallet?.availableMinor ?? 0, wallet?.currency)}
            />
          </Col>
        </Row>
      )}

      <Row className="g-3 mt-2">
        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start gap-3">
                <div>
                  <p className="text-primary fw-semibold mb-1">Your progress</p>
                  <h2 className="fs-5 fw-semibold mb-2">
                    Stay on top of your work
                  </h2>
                  <p className="text-secondary mb-0">
                    Jump back into active campaigns, review submissions and
                    track earnings.
                  </p>
                </div>
                <Link
                  className="btn btn-outline-secondary btn-sm"
                  to={ROUTES.worker.campaigns}
                >
                  Open campaigns <ArrowRight size={16} />
                </Link>
              </div>
              <div className="rounded-4 border p-3 mt-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Target className="text-primary" size={18} />
                  <p className="fw-semibold mb-0">Keep your momentum strong</p>
                </div>
                <p className="text-secondary mb-0">
                  Aim for two high-quality submissions this week so your review
                  queue stays lean and your earnings grow faster.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <p className="text-primary fw-semibold mb-1">Quick actions</p>
              <h2 className="fs-5 fw-semibold mb-3">Take the next step</h2>
              <Stack gap={2}>
                <Link
                  className="btn btn-dark w-100 justify-content-between d-flex align-items-center"
                  to={ROUTES.worker.campaigns}
                >
                  Claim a campaign <ArrowRight size={16} />
                </Link>
                <Link
                  className="btn btn-outline-secondary w-100 justify-content-between d-flex align-items-center"
                  to={ROUTES.worker.submissions}
                >
                  View submissions <ArrowRight size={16} />
                </Link>
                <Link
                  className="btn btn-outline-secondary w-100 justify-content-between d-flex align-items-center"
                  to={ROUTES.worker.groups}
                >
                  Manage groups <ArrowRight size={16} />
                </Link>
                <Link
                  className="btn btn-outline-secondary w-100 justify-content-between d-flex align-items-center"
                  to={ROUTES.worker.wallet}
                >
                  Withdraw earnings <WalletIcon size={16} />
                </Link>
              </Stack>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mt-3">
        <Col lg={12}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Sparkles className="text-primary" size={18} />
                <p className="text-primary fw-semibold mb-0">
                  Recommended next step
                </p>
              </div>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div className="d-flex align-items-center gap-2">
                  <Briefcase size={18} className="text-secondary" />
                  <p className="text-secondary mb-0">
                    Pick the task with the best reward and the nearest deadline
                    to keep your streak moving.
                  </p>
                </div>
                <Link
                  className="btn btn-outline-secondary"
                  to={ROUTES.worker.campaigns}
                >
                  Open campaign board <ArrowRight size={16} />
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

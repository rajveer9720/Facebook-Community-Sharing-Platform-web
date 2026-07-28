import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useAppSelector } from '@/app/hooks';
import { StatCard } from '@/components/common/StatCard';
import { useGetCampaignsQuery } from '@/features/campaigns/campaignsApi';
import { useGetSubmissionsQuery } from '@/features/submissions/submissionsApi';
import { useGetMyWalletQuery } from '@/features/wallet/walletApi';
import { formatMoney } from '@/utils/format';

function isSameDay(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

export default function WorkerDashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const { data: campaigns, isLoading: campaignsLoading } = useGetCampaignsQuery({ status: 'ACTIVE' });
  const { data: submissions, isLoading: submissionsLoading } = useGetSubmissionsQuery(
    user ? { workerId: user.id } : undefined,
  );
  const { data: wallet, isLoading: walletLoading, error: walletError } = useGetMyWalletQuery();

  const pendingVerification = submissions?.filter((s) => s.status === 'PENDING' || s.status === 'MANUAL_REVIEW').length ?? 0;
  const todaysEarningsMinor =
    submissions
      ?.filter((s) => s.status === 'APPROVED' && s.reviewedAt && isSameDay(s.reviewedAt))
      .reduce((sum, s) => sum + s.rewardMinor, 0) ?? 0;

  const isLoading = campaignsLoading || submissionsLoading || walletLoading;

  return (
    <div>
      <p className="text-primary fw-semibold mb-1">Worker Dashboard</p>
      <h1 className="fs-3 fw-bold">Welcome back{user ? `, ${user.firstName}` : ''}</h1>
      <p className="text-secondary">Complete approved campaigns and track your earnings.</p>

      {walletError && <Alert variant="danger">Unable to load your wallet right now.</Alert>}

      {isLoading ? (
        <Spinner animation="border" size="sm" />
      ) : (
        <Row className="g-3 mt-1">
          <Col xs={6} md={3}>
            <StatCard label="Available campaigns" value={String(campaigns?.length ?? 0)} />
          </Col>
          <Col xs={6} md={3}>
            <StatCard label="Pending verification" value={String(pendingVerification)} />
          </Col>
          <Col xs={6} md={3}>
            <StatCard label="Today's earnings" value={formatMoney(todaysEarningsMinor)} />
          </Col>
          <Col xs={6} md={3}>
            <StatCard label="Wallet balance" value={formatMoney(wallet?.availableMinor ?? 0, wallet?.currency)} />
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

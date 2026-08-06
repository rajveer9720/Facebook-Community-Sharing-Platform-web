import { Card, Col, Row, Spinner } from 'react-bootstrap';
import { ShieldCheck, Star, Wallet as WalletIcon, Trophy } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { useGetMyWalletQuery } from '@/features/wallet/walletApi';
import { useGetMyWorkerPerformanceQuery } from '@/features/workerPerformance/workerPerformanceApi';
import { formatMoney } from '@/utils/format';

export default function WorkerProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  const { data: wallet, isLoading: walletLoading } = useGetMyWalletQuery();
  const { data: performance, isLoading: performanceLoading } = useGetMyWorkerPerformanceQuery();
  const isLoading = walletLoading || performanceLoading;

  return (
    <div>
      <p className="text-primary fw-semibold mb-1">Worker profile</p>
      <h1 className="fs-3 fw-bold">{user?.firstName} {user?.lastName}</h1>
      <p className="text-secondary">Track your quality score, trust profile and performance history.</p>

      <Card className="border-0 shadow-sm rounded-4 mt-3">
        <Card.Body className="p-4">
          <Row className="g-3 align-items-center">
            <Col md={8}>
              <h2 className="fs-5 fw-semibold mb-1">Account overview</h2>
              <p className="text-secondary mb-0">{user?.email}</p>
            </Col>
            <Col md={4}>
              <div className="rounded-4 border p-3 text-center">
                <p className="text-secondary small mb-1">Trust score</p>
                <p className="fs-3 fw-bold mb-0">{performance?.trustScore ?? 0}</p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {isLoading ? (
        <Spinner animation="border" size="sm" className="mt-4" />
      ) : (
        <Row className="g-3 mt-1">
          <Col sm={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-2 mb-2 text-success">
                  <ShieldCheck size={16} />
                  <span className="small fw-semibold">Approval rate</span>
                </div>
                <p className="fs-4 fw-bold mb-0">{Math.round((performance?.approvalRate ?? 0) * 100)}%</p>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-2 mb-2 text-warning">
                  <Star size={16} />
                  <span className="small fw-semibold">Quality score</span>
                </div>
                <p className="fs-4 fw-bold mb-0">{performance?.qualityScore ?? 0}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                  <WalletIcon size={16} />
                  <span className="small fw-semibold">Balance</span>
                </div>
                <p className="fs-4 fw-bold mb-0">{formatMoney(wallet?.availableMinor ?? 0, wallet?.currency)}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-2 mb-2 text-danger">
                  <Trophy size={16} />
                  <span className="small fw-semibold">Fraud risk</span>
                </div>
                <p className="fs-4 fw-bold mb-0">{Math.round(performance?.fraudRiskScore ?? 0)}%</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {!isLoading && performance && (
        <Card className="border-0 shadow-sm rounded-4 mt-3">
          <Card.Body className="p-4">
            <h2 className="fs-6 fw-semibold mb-3">Performance signals</h2>
            <Row className="g-3 small">
              <Col sm={6} lg={3}>
                <p className="text-secondary mb-1">Tier</p>
                <p className="fw-semibold mb-0">{performance.tier}</p>
              </Col>
              <Col sm={6} lg={3}>
                <p className="text-secondary mb-1">Active days</p>
                <p className="fw-semibold mb-0">{performance.activeDays}</p>
              </Col>
              <Col sm={6} lg={3}>
                <p className="text-secondary mb-1">Avg completion</p>
                <p className="fw-semibold mb-0">{Math.round(performance.averageCompletionMinutes)} min</p>
              </Col>
              <Col sm={6} lg={3}>
                <p className="text-secondary mb-1">Duplicate rate</p>
                <p className="fw-semibold mb-0">{Math.round(performance.duplicateRate * 100)}%</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

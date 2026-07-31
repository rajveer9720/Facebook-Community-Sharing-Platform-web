import { useState } from 'react';
import { Alert, Button, Card, Col, Row, Spinner, Stack, Table } from 'react-bootstrap';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  useCompleteWithdrawalMutation,
  useGetWithdrawalsQuery,
  useReviewWithdrawalMutation,
} from '@/features/wallet/walletApi';
import { formatMoney, formatDate } from '@/utils/format';

export default function WithdrawalsPage() {
  const { data, isLoading } = useGetWithdrawalsQuery();
  const [reviewWithdrawal] = useReviewWithdrawalMutation();
  const [completeWithdrawal] = useCompleteWithdrawalMutation();
  const [error, setError] = useState('');

  async function handleAction(promise: Promise<unknown>) {
    setError('');
    try {
      await promise;
    } catch (actionError) {
      const message =
        actionError && typeof actionError === 'object' && 'data' in actionError
          ? (actionError as { data?: { message?: string } }).data?.message
          : undefined;
      setError(message ?? 'Unable to update this withdrawal.');
    }
  }

  return (
    <div>
      <p className="text-primary fw-semibold mb-1">Payouts</p>
      <h1 className="fs-3 fw-bold">Withdrawal management</h1>
      <p className="text-secondary">Approve, reject and mark worker withdrawal requests as paid.</p>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Row className="g-3 mt-2">
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <p className="text-secondary small mb-1">Pending</p>
              <p className="fs-4 fw-bold mb-0">{data?.items.filter((item) => item.status === 'PENDING').length ?? 0}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <p className="text-secondary small mb-1">Approved</p>
              <p className="fs-4 fw-bold mb-0">{data?.items.filter((item) => item.status === 'APPROVED').length ?? 0}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <p className="text-secondary small mb-1">Paid</p>
              <p className="fs-4 fw-bold mb-0">{data?.items.filter((item) => item.status === 'COMPLETED').length ?? 0}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm rounded-4 mt-3">
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="p-4">
              <Spinner animation="border" size="sm" />
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Worker</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Requested</th>
                    <th>Status</th>
                    <th className="pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items.length ? (
                    data.items.map((withdrawal) => (
                      <tr key={withdrawal.id}>
                        <td className="ps-4">
                          <div className="fw-semibold">
                            {withdrawal.worker.firstName} {withdrawal.worker.lastName}
                          </div>
                          <div className="text-secondary small">{withdrawal.worker.email}</div>
                        </td>
                        <td>{formatMoney(withdrawal.amountMinor, withdrawal.currency)}</td>
                        <td>{withdrawal.paymentMethod}</td>
                        <td>{formatDate(withdrawal.requestedAt)}</td>
                        <td>
                          <StatusBadge status={withdrawal.status} />
                        </td>
                        <td className="pe-4">
                          <Stack direction="horizontal" gap={2}>
                            {withdrawal.status === 'PENDING' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleAction(reviewWithdrawal({ id: withdrawal.id, action: 'APPROVE' }).unwrap())}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleAction(reviewWithdrawal({ id: withdrawal.id, action: 'REJECT' }).unwrap())}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {withdrawal.status === 'APPROVED' && (
                              <Button size="sm" variant="dark" onClick={() => handleAction(completeWithdrawal({ id: withdrawal.id }).unwrap())}>
                                Mark paid
                              </Button>
                            )}
                          </Stack>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center text-secondary py-4">
                        No withdrawals have been submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

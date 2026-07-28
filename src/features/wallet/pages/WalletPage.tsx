import { useState } from 'react';
import { Alert, Button, Card, Col, Form as BsForm, Row, Spinner } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useCreateWithdrawalMutation, useGetMyWalletQuery } from '@/features/wallet/walletApi';
import { formatMoney } from '@/utils/format';
import type { PaymentMethod } from '@/types/wallet';

interface WithdrawalFormValues {
  amount: string;
  paymentMethod: PaymentMethod;
}

const initialValues: WithdrawalFormValues = { amount: '', paymentMethod: 'Bank transfer' };

export default function WalletPage() {
  const { data: wallet, isLoading } = useGetMyWalletQuery();
  const [createWithdrawal] = useCreateWithdrawalMutation();
  const [message, setMessage] = useState('');
  const [messageVariant, setMessageVariant] = useState<'success' | 'danger'>('success');

  const validationSchema = Yup.object({
    amount: Yup.number()
      .typeError('Enter a number')
      .positive('Enter an amount greater than zero')
      .max((wallet?.availableMinor ?? 0) / 100, 'Amount exceeds your available balance')
      .required('Amount is required'),
    paymentMethod: Yup.string().required(),
  });

  async function handleSubmit(values: WithdrawalFormValues, resetForm: () => void) {
    setMessage('');
    try {
      await createWithdrawal({
        amountMinor: Math.round(Number(values.amount) * 100),
        paymentMethod: values.paymentMethod,
        paymentDetails: { accountReference: 'Update securely before production' },
      }).unwrap();
      setMessageVariant('success');
      setMessage('Withdrawal request submitted.');
      resetForm();
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      setMessageVariant('danger');
      setMessage(errorMessage ?? 'Request failed. Please try again.');
    }
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 720 }}>
      <p className="text-primary fw-semibold mb-1">Earnings</p>
      <h1 className="fs-3 fw-bold">Wallet</h1>
      <p className="text-secondary">Track pending rewards, available earnings and withdrawals.</p>

      {isLoading ? (
        <Spinner animation="border" size="sm" />
      ) : (
        <Row className="g-3 mt-1">
          {[
            ['Available', wallet?.availableMinor],
            ['Pending', wallet?.pendingMinor],
            ['Withdrawal hold', wallet?.withdrawalHoldMinor],
            ['Total', wallet?.totalMinor],
          ].map(([label, value]) => (
            <Col xs={6} key={label as string}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body>
                  <p className="text-secondary small mb-1">{label}</p>
                  <p className="fs-5 fw-semibold mb-0">{formatMoney(Number(value ?? 0), wallet?.currency)}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Card className="border-0 shadow-sm rounded-4 mt-4">
        <Card.Body className="p-4">
          <h2 className="fs-5 fw-semibold mb-3">Request withdrawal</h2>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            enableReinitialize
            onSubmit={(values, helpers) =>
              handleSubmit(values, helpers.resetForm).finally(() => helpers.setSubmitting(false))
            }
          >
            {({ isSubmitting }) => (
              <Form noValidate>
                <BsForm.Group className="mb-3" controlId="amount">
                  <BsForm.Label className="fw-semibold small">Amount (£)</BsForm.Label>
                  <Field name="amount" type="number" min="1" step="0.01" as={BsForm.Control} />
                  <ErrorMessage name="amount" component="div" className="text-danger small mt-1" />
                </BsForm.Group>
                <BsForm.Group className="mb-3" controlId="paymentMethod">
                  <BsForm.Label className="fw-semibold small">Payment method</BsForm.Label>
                  <Field name="paymentMethod" as={BsForm.Select}>
                    <option>Bank transfer</option>
                    <option>PayPal</option>
                    <option>Other</option>
                  </Field>
                </BsForm.Group>
                <Button type="submit" variant="dark" className="w-100" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting…' : 'Submit request'}
                </Button>
                {message && (
                  <Alert variant={messageVariant} className="mt-3 mb-0 py-2 small">
                    {message}
                  </Alert>
                )}
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </div>
  );
}

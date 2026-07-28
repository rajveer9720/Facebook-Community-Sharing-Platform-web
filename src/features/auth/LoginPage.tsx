import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Container, Form as BsForm } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '@/app/hooks';
import { useLoginMutation } from './authApi';
import { sessionEstablished } from './authSlice';
import { ROUTES } from '@/routes/routePaths';

interface LoginFormValues {
  email: string;
  password: string;
}

const initialValues: LoginFormValues = {
  email: 'worker@example.com',
  password: 'Worker@12345',
};

const validationSchema = Yup.object({
  email: Yup.string().email('Enter a valid email address').required('Email is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login] = useLoginMutation();
  const [formError, setFormError] = useState('');

  async function handleSubmit(values: LoginFormValues, helpers: FormikHelpers<LoginFormValues>) {
    setFormError('');
    try {
      const result = await login(values).unwrap();
      dispatch(sessionEstablished(result));
      navigate(result.user.role === 'WORKER' ? ROUTES.worker.root : ROUTES.admin.root, { replace: true });
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      setFormError(message ?? 'Login failed. Please try again.');
    } finally {
      helpers.setSubmitting(false);
    }
  }

  return (
    <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card className="border-0 shadow-sm rounded-4" style={{ maxWidth: 440, width: '100%' }}>
        <Card.Body className="p-4 p-sm-5">
          <p className="text-primary fw-semibold mb-1">Secure sign in</p>
          <h1 className="fs-3 fw-bold mb-4">Access your dashboard</h1>

          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ isSubmitting }) => (
              <Form noValidate>
                <BsForm.Group className="mb-3" controlId="email">
                  <BsForm.Label className="fw-semibold small">Email</BsForm.Label>
                  <Field name="email" type="email" as={BsForm.Control} />
                  <ErrorMessage name="email" component="div" className="text-danger small mt-1" />
                </BsForm.Group>

                <BsForm.Group className="mb-4" controlId="password">
                  <BsForm.Label className="fw-semibold small">Password</BsForm.Label>
                  <Field name="password" type="password" as={BsForm.Control} />
                  <ErrorMessage name="password" component="div" className="text-danger small mt-1" />
                </BsForm.Group>

                {formError && (
                  <Alert variant="danger" className="py-2 small">
                    {formError}
                  </Alert>
                )}

                <Button type="submit" variant="primary" className="w-100 fw-semibold" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in…' : 'Sign in'}
                </Button>

                <p className="mt-3 text-secondary small mb-0">
                  Seeded accounts &mdash; worker: worker@example.com / Worker@12345, admin: admin@example.com /
                  Admin@12345
                </p>
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </Container>
  );
}

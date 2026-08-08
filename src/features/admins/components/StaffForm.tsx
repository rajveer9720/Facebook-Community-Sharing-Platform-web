import { useState } from 'react';
import { Alert, Button, Col, Form as BsForm, Row } from 'react-bootstrap';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import type { Role } from '@/types/role';

export interface StaffFormValues {
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
}

export const emptyStaffFormValues: StaffFormValues = { email: '', firstName: '', lastName: '', roleId: '' };

const validationSchema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  roleId: Yup.string().required('Select a role'),
});

interface StaffFormProps {
  roles: Role[];
  initialValues?: StaffFormValues;
  submitLabel?: string;
  submittingLabel?: string;
  onSubmit: (values: StaffFormValues) => Promise<void>;
}

export function StaffForm({
  roles,
  initialValues = emptyStaffFormValues,
  submitLabel = 'Create staff account',
  submittingLabel = 'Creating…',
  onSubmit,
}: StaffFormProps) {
  const [formError, setFormError] = useState('');

  async function handleSubmit(values: StaffFormValues) {
    setFormError('');
    try {
      await onSubmit(values);
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      setFormError(message ?? 'Unable to save this staff account. Please try again.');
    }
  }

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize>
      {({ isSubmitting, values, handleChange, errors, touched }) => (
        <Form noValidate>
          <Row className="g-3">
            <Col md={6}>
              <BsForm.Group controlId="staffFirstName">
                <BsForm.Label className="fw-semibold small">First name</BsForm.Label>
                <BsForm.Control
                  name="firstName"
                  value={values.firstName}
                  onChange={handleChange}
                  isInvalid={touched.firstName && !!errors.firstName}
                />
                <BsForm.Control.Feedback type="invalid">{errors.firstName}</BsForm.Control.Feedback>
              </BsForm.Group>
            </Col>
            <Col md={6}>
              <BsForm.Group controlId="staffLastName">
                <BsForm.Label className="fw-semibold small">Last name</BsForm.Label>
                <BsForm.Control
                  name="lastName"
                  value={values.lastName}
                  onChange={handleChange}
                  isInvalid={touched.lastName && !!errors.lastName}
                />
                <BsForm.Control.Feedback type="invalid">{errors.lastName}</BsForm.Control.Feedback>
              </BsForm.Group>
            </Col>
            <Col md={6}>
              <BsForm.Group controlId="staffEmail">
                <BsForm.Label className="fw-semibold small">Email</BsForm.Label>
                <BsForm.Control
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  isInvalid={touched.email && !!errors.email}
                />
                <BsForm.Control.Feedback type="invalid">{errors.email}</BsForm.Control.Feedback>
              </BsForm.Group>
            </Col>
            <Col md={6}>
              <BsForm.Group controlId="staffRole">
                <BsForm.Label className="fw-semibold small">Role</BsForm.Label>
                <BsForm.Select
                  name="roleId"
                  value={values.roleId}
                  onChange={handleChange}
                  isInvalid={touched.roleId && !!errors.roleId}
                >
                  <option value="">Select a role…</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </BsForm.Select>
                <BsForm.Control.Feedback type="invalid">{errors.roleId}</BsForm.Control.Feedback>
              </BsForm.Group>
            </Col>
          </Row>

          {formError && (
            <Alert variant="danger" className="mt-3 py-2 small">
              {formError}
            </Alert>
          )}

          <div className="d-flex justify-content-end mt-4">
            <Button type="submit" variant="dark" disabled={isSubmitting}>
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

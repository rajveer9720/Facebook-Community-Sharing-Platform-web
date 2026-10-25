import { useState } from 'react';
import { Alert, Button, Card, Col, Form as BsForm, Row } from 'react-bootstrap';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { PERMISSION_GROUPS, permissionKey } from '../permissionGroups';

export interface RoleFormValues {
  name: string;
  description: string;
  permissionKeys: string[];
}

const validationSchema = Yup.object({
  name: Yup.string().required('Role name is required'),
  description: Yup.string(),
});

const GROUPED = PERMISSION_GROUPS.reduce<Record<string, typeof PERMISSION_GROUPS>>((acc, item) => {
  (acc[item.group] ??= []).push(item);
  return acc;
}, {});

interface RoleFormProps {
  initialValues: RoleFormValues;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (values: RoleFormValues) => Promise<void>;
}

export function RoleForm({ initialValues, submitLabel, submittingLabel, onSubmit }: RoleFormProps) {
  const [formError, setFormError] = useState('');

  async function handleSubmit(values: RoleFormValues) {
    setFormError('');
    try {
      await onSubmit(values);
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      setFormError(message ?? 'Unable to save this role. Please try again.');
    }
  }

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize>
      {({ isSubmitting, values, setFieldValue, handleChange }) => {
        function togglePermission(key: string, checked: boolean) {
          setFieldValue(
            'permissionKeys',
            checked ? [...values.permissionKeys, key] : values.permissionKeys.filter((existing) => existing !== key),
          );
        }

        return (
          <Form noValidate>
            <Row className="g-3">
              <Col md={6}>
                <BsForm.Group controlId="roleName">
                  <BsForm.Label className="fw-semibold small">Role name</BsForm.Label>
                  <BsForm.Control name="name" value={values.name} onChange={handleChange} placeholder="e.g. Community Lead" />
                </BsForm.Group>
              </Col>
              <Col md={6}>
                <BsForm.Group controlId="roleDescription">
                  <BsForm.Label className="fw-semibold small">Description (optional)</BsForm.Label>
                  <BsForm.Control
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    placeholder="What this role is for"
                  />
                </BsForm.Group>
              </Col>
            </Row>

            <div className="mt-4">
              <p className="fw-semibold small mb-3">Permissions</p>
              <Row className="g-3">
                {Object.entries(GROUPED).map(([group, items]) => (
                  <Col md={6} key={group}>
                    <Card className="border-0 bg-light rounded-4 h-100">
                      <Card.Body className="p-3">
                        <p className="text-primary fw-semibold small mb-2">{group}</p>
                        {items.map((item) => {
                          const key = permissionKey(item.action, item.subject);
                          return (
                            <BsForm.Check
                              key={key}
                              type="checkbox"
                              id={`perm-${key}`}
                              label={item.label}
                              className="small mb-2"
                              checked={values.permissionKeys.includes(key)}
                              onChange={(event) => togglePermission(key, event.target.checked)}
                            />
                          );
                        })}
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

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
        );
      }}
    </Formik>
  );
}

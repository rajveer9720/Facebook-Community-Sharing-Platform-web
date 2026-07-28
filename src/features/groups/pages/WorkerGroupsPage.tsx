import { useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form as BsForm, Modal, Row, Spinner, Stack } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useGetWorkerGroupLibraryQuery, useSubmitGroupDiscoveryMutation } from '@/features/groups/groupsApi';
import { formatDate } from '@/utils/format';

interface DiscoveryFormValues {
  name: string;
  category: string;
  country: string;
  memberCount: string;
}

const initialValues: DiscoveryFormValues = { name: '', category: 'Technology', country: '', memberCount: '' };

const validationSchema = Yup.object({
  name: Yup.string().required('Group name is required'),
  category: Yup.string().required(),
  country: Yup.string().required('Country is required'),
  memberCount: Yup.number().typeError('Enter a whole number').integer().positive().required('Member count is required'),
});

export default function WorkerGroupsPage() {
  const { data: library, isLoading } = useGetWorkerGroupLibraryQuery();
  const [submitDiscovery] = useSubmitGroupDiscoveryMutation();
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  async function handleSubmit(values: DiscoveryFormValues, resetForm: () => void) {
    await submitDiscovery({
      name: values.name,
      category: values.category,
      country: values.country,
      memberCount: Number(values.memberCount),
    }).unwrap();
    setSuccessMessage(`"${values.name}" was submitted for moderation review.`);
    setShowModal(false);
    resetForm();
  }

  return (
    <div>
      <p className="text-primary fw-semibold mb-1">Personal Group Library</p>
      <Stack direction="horizontal" className="justify-content-between flex-wrap gap-3 align-items-end">
        <div>
          <h1 className="fs-3 fw-bold">Your Facebook groups</h1>
          <p className="text-secondary mb-0">
            Approved groups are saved automatically and recommended after their cooldown expires.
          </p>
        </div>
        <Button variant="dark" onClick={() => setShowModal(true)}>
          Submit a new group
        </Button>
      </Stack>

      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage('')} className="mt-3">
          {successMessage}
        </Alert>
      )}

      {isLoading ? (
        <Spinner animation="border" size="sm" className="mt-3" />
      ) : (
        <Row className="g-3 mt-1">
          {library?.map((entry) => {
            const available = !entry.availableAt || new Date(entry.availableAt).getTime() <= Date.now();
            return (
              <Col key={entry.id} xs={12}>
                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
                      <div>
                        <h2 className="fs-5 fw-bold mb-0">{entry.group.name}</h2>
                        <p className="text-secondary small mb-0">
                          {entry.group.category} &middot; {entry.group.country}
                        </p>
                      </div>
                      <Badge bg="success" className="bg-success-subtle text-success-emphasis fw-bold px-3 py-2 rounded-pill">
                        Quality {entry.group.qualityScore}
                      </Badge>
                    </div>
                    <Row className="g-3 mt-2 small">
                      <Col xs={6} md={4}>
                        <p className="text-secondary mb-0">Times used</p>
                        <p className="fw-bold mb-0">{entry.timesUsed}</p>
                      </Col>
                      <Col xs={6} md={4}>
                        <p className="text-secondary mb-0">Last posted</p>
                        <p className="fw-bold mb-0">{entry.lastPostedAt ? formatDate(entry.lastPostedAt) : '—'}</p>
                      </Col>
                      <Col xs={6} md={4}>
                        <p className="text-secondary mb-0">Status</p>
                        <p className={`fw-bold mb-0 ${available ? 'text-success' : 'text-warning'}`}>
                          {available ? 'Available now' : 'Available soon'}
                        </p>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">Submit a new group</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values, helpers) => handleSubmit(values, helpers.resetForm).finally(() => helpers.setSubmitting(false))}
        >
          {({ isSubmitting }) => (
            <Form noValidate>
              <Modal.Body>
                <BsForm.Group className="mb-3" controlId="discoveryName">
                  <BsForm.Label className="fw-semibold small">Group name</BsForm.Label>
                  <Field name="name" as={BsForm.Control} />
                  <ErrorMessage name="name" component="div" className="text-danger small mt-1" />
                </BsForm.Group>
                <BsForm.Group className="mb-3" controlId="discoveryCategory">
                  <BsForm.Label className="fw-semibold small">Category</BsForm.Label>
                  <Field name="category" as={BsForm.Select}>
                    <option>Technology</option>
                    <option>Business</option>
                    <option>Finance</option>
                    <option>Jobs</option>
                  </Field>
                </BsForm.Group>
                <BsForm.Group className="mb-3" controlId="discoveryCountry">
                  <BsForm.Label className="fw-semibold small">Country</BsForm.Label>
                  <Field name="country" as={BsForm.Control} />
                  <ErrorMessage name="country" component="div" className="text-danger small mt-1" />
                </BsForm.Group>
                <BsForm.Group controlId="discoveryMemberCount">
                  <BsForm.Label className="fw-semibold small">Member count</BsForm.Label>
                  <Field name="memberCount" type="number" min="1" as={BsForm.Control} />
                  <ErrorMessage name="memberCount" component="div" className="text-danger small mt-1" />
                </BsForm.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting…' : 'Submit for review'}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
}

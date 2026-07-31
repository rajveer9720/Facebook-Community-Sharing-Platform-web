import { useState } from 'react';
import { Alert, Button, Card, Col, Form as BsForm, Modal, Row, Spinner } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { useGetCampaignsQuery } from '@/features/campaigns/campaignsApi';
import { useGetGroupsQuery } from '@/features/groups/groupsApi';
import { useCreateProofUploadUrlMutation, useCreateSubmissionMutation } from '@/features/submissions/submissionsApi';
import { formatMoney, daysRemaining } from '@/utils/format';
import type { Campaign } from '@/types/campaign';

interface SubmissionFormValues {
  groupId: string;
  proofUrl: string;
  caption: string;
}

const validationSchema = Yup.object({
  groupId: Yup.string().required('Choose the group you posted in'),
  proofUrl: Yup.string().url('Enter a valid post URL').required('Proof URL is required'),
  caption: Yup.string().min(10, 'Add a short description of the post').required('Caption is required'),
});

export default function WorkerCampaignsPage() {
  const { data: campaigns, isLoading } = useGetCampaignsQuery({ status: 'ACTIVE' });
  const { data: groups } = useGetGroupsQuery({ status: 'APPROVED' });
  const [createSubmission] = useCreateSubmissionMutation();
  const [createProofUploadUrl, { isLoading: generatingUploadUrl }] = useCreateProofUploadUrlMutation();
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [uploadInfo, setUploadInfo] = useState('');

  async function handleSubmit(values: SubmissionFormValues, resetForm: () => void) {
    if (!activeCampaign) return;
    setSubmitError('');
    try {
      await createSubmission({
        campaignId: activeCampaign.id,
        groupId: values.groupId,
        proofUrl: values.proofUrl,
        caption: values.caption,
      }).unwrap();
      setSuccessMessage(`Submission recorded for "${activeCampaign.name}". It is now awaiting verification.`);
      setActiveCampaign(null);
      resetForm();
      setUploadInfo('');
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      setSubmitError(message ?? 'Unable to record this submission. Please try again.');
    }
  }

  async function handleGenerateUploadUrl(setFieldValue: (field: string, value: string) => void) {
    setSubmitError('');
    setUploadInfo('');
    try {
      const result = await createProofUploadUrl({
        fileName: `proof-${Date.now()}.jpg`,
        contentType: 'image/jpeg',
      }).unwrap();
      setFieldValue('proofUrl', result.proofUrl);
      setUploadInfo('Signed upload URL created. Upload your evidence using this URL, then submit proof.');
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      setSubmitError(message ?? 'Unable to create a signed upload URL.');
    }
  }

  return (
    <div>
      <p className="text-primary fw-semibold mb-1">Available work</p>
      <h1 className="fs-3 fw-bold">Campaigns</h1>
      <p className="text-secondary">Choose relevant campaigns and follow all Facebook group rules.</p>

      <Card className="border-0 shadow-sm rounded-4 mb-3">
        <Card.Body className="p-4">
          <p className="text-primary fw-semibold mb-1">Submission checklist</p>
          <h2 className="fs-5 fw-semibold mb-2">Make every proof submission review-ready</h2>
          <p className="text-secondary mb-0">Use an approved group, a valid post URL and a clear description so the review queue can move faster.</p>
        </Card.Body>
      </Card>

      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {isLoading ? (
        <Spinner animation="border" size="sm" />
      ) : (
        <Row className="g-3 mt-1">
          {campaigns?.map((campaign) => (
            <Col key={campaign.id} md={6} lg={4}>
              <div className="d-flex flex-column h-100 gap-2">
                <CampaignCard
                  name={campaign.name}
                  category={campaign.category}
                  reward={`Earn ${formatMoney(campaign.rewardPerPostMinor)}`}
                  period={`Expires in ${daysRemaining(campaign.endDate)} days`}
                  workers={`${campaign.workersJoined} / ${campaign.maximumWorkers} workers`}
                />
                <Button variant="dark" onClick={() => setActiveCampaign(campaign)}>
                  Claim task
                </Button>
              </div>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={Boolean(activeCampaign)} onHide={() => setActiveCampaign(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">Submit proof &mdash; {activeCampaign?.name}</Modal.Title>
        </Modal.Header>
        <Formik<SubmissionFormValues>
          initialValues={{ groupId: '', proofUrl: '', caption: '' }}
          validationSchema={validationSchema}
          onSubmit={(values, helpers) => handleSubmit(values, helpers.resetForm).finally(() => helpers.setSubmitting(false))}
        >
          {({ isSubmitting, setFieldValue }) => (
            <Form noValidate>
              <Modal.Body>
                {submitError && (
                  <Alert variant="danger" className="py-2 small">
                    {submitError}
                  </Alert>
                )}
                {uploadInfo && (
                  <Alert variant="info" className="py-2 small">
                    {uploadInfo}
                  </Alert>
                )}
                <BsForm.Group className="mb-3" controlId="groupId">
                  <BsForm.Label className="fw-semibold small">Group you posted in</BsForm.Label>
                  <Field name="groupId" as={BsForm.Select}>
                    <option value="">Select an approved group</option>
                    {groups?.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="groupId" component="div" className="text-danger small mt-1" />
                </BsForm.Group>
                <BsForm.Group className="mb-3" controlId="proofUrl">
                  <BsForm.Label className="fw-semibold small">Post URL</BsForm.Label>
                  <Field name="proofUrl" as={BsForm.Control} placeholder="https://facebook.com/groups/..." />
                  <Button
                    type="button"
                    variant="outline-secondary"
                    size="sm"
                    className="mt-2"
                    disabled={generatingUploadUrl}
                    onClick={() => handleGenerateUploadUrl(setFieldValue)}
                  >
                    {generatingUploadUrl ? 'Generating upload URL…' : 'Generate signed upload URL'}
                  </Button>
                  <ErrorMessage name="proofUrl" component="div" className="text-danger small mt-1" />
                </BsForm.Group>
                <BsForm.Group controlId="caption">
                  <BsForm.Label className="fw-semibold small">Posted caption</BsForm.Label>
                  <Field id="caption" name="caption" as="textarea" rows={3} className="form-control" />
                  <ErrorMessage name="caption" component="div" className="text-danger small mt-1" />
                </BsForm.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="outline-secondary" onClick={() => setActiveCampaign(null)}>
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

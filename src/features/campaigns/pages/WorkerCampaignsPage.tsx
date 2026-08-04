import { useState } from 'react';
import { Alert, Button, Card, Col, Form as BsForm, Modal, Row, Spinner } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { useGetCampaignsQuery } from '@/features/campaigns/campaignsApi';
import { useGetGroupsQuery } from '@/features/groups/groupsApi';
import { useCreateSubmissionMutation, useUploadProofMutation } from '@/features/submissions/submissionsApi';
import { formatMoney, daysRemaining } from '@/utils/format';
import { SignedCampaignMedia } from '@/components/common/SignedMedia';
import type { Campaign } from '@/types/campaign';

interface SubmissionFormValues {
  groupId: string;
  proofUrl: string;
  facebookPostUrl: string;
  groupName: string;
  caption: string;
}

function buildValidationSchema(campaign: Campaign | null) {
  return Yup.object({
    groupId: Yup.string().required('Choose the group you posted in'),
    proofUrl: Yup.string().url('Enter a valid screenshot URL').required('Screenshot proof URL is required'),
    facebookPostUrl: campaign?.verificationSettings.facebookPostUrlRequired
      ? Yup.string().url('Enter a valid Facebook post URL').required('Facebook post URL is required')
      : Yup.string().url('Enter a valid Facebook post URL').optional(),
    groupName: campaign?.verificationSettings.groupNameRequired
      ? Yup.string().trim().required('Group name is required')
      : Yup.string().trim().optional(),
    caption: Yup.string().min(10, 'Add a short description of the post').required('Caption is required'),
  });
}

export default function WorkerCampaignsPage() {
  const { data: campaigns, isLoading } = useGetCampaignsQuery({ status: 'ACTIVE' });
  const { data: groups } = useGetGroupsQuery({ status: 'APPROVED' });
  const [createSubmission] = useCreateSubmissionMutation();
  const [uploadProof] = useUploadProofMutation();
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    variant: 'success' | 'warning';
    message: string;
    detail: string | null;
  } | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [copiedVariantIndex, setCopiedVariantIndex] = useState<number | null>(null);

  async function handleCopyCaption(index: number, caption: string) {
    await navigator.clipboard.writeText(caption);
    setCopiedVariantIndex(index);
    window.setTimeout(() => setCopiedVariantIndex((current) => (current === index ? null : current)), 2000);
  }

  async function handleSubmit(values: SubmissionFormValues, resetForm: () => void) {
    if (!activeCampaign) return;
    setSubmitError('');
    try {
      const submission = await createSubmission({
        campaignId: activeCampaign.id,
        groupId: values.groupId,
        proofUrl: values.proofUrl,
        facebookPostUrl: values.facebookPostUrl.trim() || undefined,
        groupName: values.groupName.trim() || undefined,
        caption: values.caption,
      }).unwrap();

      const aiUnavailable = submission.verificationExplanation?.includes('AI checks unavailable') ?? false;
      if (submission.status === 'APPROVED') {
        setSubmissionResult({
          variant: 'success',
          message: `Submission for "${activeCampaign.name}" was auto-approved.`,
          detail: submission.reviewNote,
        });
      } else if (aiUnavailable) {
        setSubmissionResult({
          variant: 'warning',
          message: `Submission for "${activeCampaign.name}" was recorded, but AI verification could not run right now.`,
          detail: 'Your proof was sent for manual review instead — this can take longer to approve.',
        });
      } else {
        setSubmissionResult({
          variant: 'success',
          message: `Submission for "${activeCampaign.name}" was recorded and is awaiting verification.`,
          detail: submission.reviewNote,
        });
      }
      setActiveCampaign(null);
      resetForm();
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      setSubmitError(message ?? 'Unable to record this submission. Please try again.');
    }
  }

  async function handleProofFileSelect(file: File | undefined, setFieldValue: (field: string, value: string) => void) {
    if (!file) return;
    setSubmitError('');
    setUploadingProof(true);
    try {
      const { proofUrl } = await uploadProof({
        file,
        campaignId: activeCampaign?.id ? Number(activeCampaign.id) : undefined,
      }).unwrap();
      setFieldValue('proofUrl', proofUrl);
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : error instanceof Error
            ? error.message
            : undefined;
      setSubmitError(message ?? 'Unable to upload screenshot proof.');
    } finally {
      setUploadingProof(false);
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
          <p className="text-secondary mb-0">Use an approved group, upload screenshot proof, add caption, and include Facebook URL/group name when required.</p>
        </Card.Body>
      </Card>

      {submissionResult && (
        <Alert variant={submissionResult.variant} dismissible onClose={() => setSubmissionResult(null)}>
          <div className="fw-semibold">{submissionResult.message}</div>
          {submissionResult.detail && <div className="small mt-1 mb-0">{submissionResult.detail}</div>}
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
                  thumbnailUrl={campaign.mediaVariants[0]?.mediaUrl}
                  thumbnailType={campaign.mediaVariants[0]?.mediaType}
                />
                <Button variant="dark" onClick={() => setActiveCampaign(campaign)}>
                  Claim task
                </Button>
              </div>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={Boolean(activeCampaign)} onHide={() => setActiveCampaign(null)} centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">Submit proof &mdash; {activeCampaign?.name}</Modal.Title>
        </Modal.Header>
        <Formik<SubmissionFormValues>
          initialValues={{ groupId: '', proofUrl: '', facebookPostUrl: '', groupName: '', caption: '' }}
          validationSchema={buildValidationSchema(activeCampaign)}
          onSubmit={(values, helpers) => handleSubmit(values, helpers.resetForm).finally(() => helpers.setSubmitting(false))}
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form
              noValidate
              className="d-flex flex-column"
              style={{ flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}
            >
              <Modal.Body>
                {activeCampaign && activeCampaign.mediaVariants.length > 0 && (
                  <Card className="border-0 bg-light rounded-4 mb-3">
                    <Card.Body className="p-3">
                      <p className="text-primary fw-semibold mb-1">Content pool</p>
                      <p className="fw-semibold mb-2">Copy a caption and use its matching media to post</p>
                      <Row className="g-2">
                        {activeCampaign.mediaVariants.map((variant, index) => (
                          <Col xs={12} sm={6} key={index}>
                            <div className="bg-white border rounded-3 p-2 h-100 d-flex flex-column gap-2">
                              <SignedCampaignMedia
                                objectKeyOrUrl={variant.mediaUrl}
                                mediaType={variant.mediaType}
                                alt={`Campaign media ${index + 1}`}
                                className="rounded-2 w-100"
                                style={{ maxHeight: 140, objectFit: 'cover' }}
                                showDownload
                                downloadFileName={`campaign-${index + 1}.${variant.mediaType === 'VIDEO' ? 'mp4' : 'jpg'}`}
                              />
                              <p className="small text-secondary mb-0 flex-grow-1">{variant.caption}</p>
                              <Button type="button" variant="outline-secondary" size="sm" onClick={() => handleCopyCaption(index, variant.caption)}>
                                {copiedVariantIndex === index ? 'Copied!' : 'Copy caption'}
                              </Button>
                            </div>
                          </Col>
                        ))}
                      </Row>
                      <div className="small text-secondary mt-2 mb-0">Pick any variant above, post it to your group, then submit proof below.</div>
                    </Card.Body>
                  </Card>
                )}
                {submitError && (
                  <Alert variant="danger" className="py-2 small">
                    {submitError}
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
                  <BsForm.Label className="fw-semibold small">Screenshot proof</BsForm.Label>
                  <BsForm.Control
                    type="file"
                    accept="image/*"
                    disabled={uploadingProof}
                    onChange={(event) => {
                      const input = event.target as HTMLInputElement;
                      void handleProofFileSelect(input.files?.[0], setFieldValue);
                      input.value = '';
                    }}
                  />
                  {uploadingProof && (
                    <div className="d-flex align-items-center gap-2 text-secondary small mt-1">
                      <Spinner animation="border" size="sm" /> Uploading screenshot…
                    </div>
                  )}
                  {values.proofUrl && (
                    <div className="mt-2">
                      <img src={values.proofUrl} alt="Screenshot proof preview" className="rounded-3 border" style={{ maxHeight: 140 }} />
                    </div>
                  )}
                  <ErrorMessage name="proofUrl" component="div" className="text-danger small mt-1" />
                </BsForm.Group>
                <BsForm.Group className="mb-3" controlId="facebookPostUrl">
                  <BsForm.Label className="fw-semibold small">
                    Facebook post URL
                    {activeCampaign?.verificationSettings.facebookPostUrlRequired ? ' *' : ''}
                  </BsForm.Label>
                  <Field name="facebookPostUrl" as={BsForm.Control} placeholder="https://facebook.com/groups/..." />
                  <ErrorMessage name="facebookPostUrl" component="div" className="text-danger small mt-1" />
                </BsForm.Group>
                <BsForm.Group className="mb-3" controlId="groupName">
                  <BsForm.Label className="fw-semibold small">
                    Group name
                    {activeCampaign?.verificationSettings.groupNameRequired ? ' *' : ''}
                  </BsForm.Label>
                  <Field name="groupName" as={BsForm.Control} placeholder="Exact Facebook group name used in post" />
                  <ErrorMessage name="groupName" component="div" className="text-danger small mt-1" />
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

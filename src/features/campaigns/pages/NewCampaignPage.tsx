import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Col, Form as BsForm, Row, Spinner, Stack } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useCreateCampaignMutation, useUploadCampaignMediaMutation } from '@/features/campaigns/campaignsApi';
import { ROUTES } from '@/routes/routePaths';
import { CAMPAIGN_CATEGORIES, type CampaignCategory, type CampaignPriority } from '@/types/campaign';

interface NewCampaignFormValues {
  name: string;
  category: CampaignCategory;
  priority: CampaignPriority;
  startDate: string;
  endDate: string;
  budget: string;
  reward: string;
  maximumWorkers: string;
  maximumPostsPerWorker: string;
  dailyPostingLimit: string;
  instructions: string;
  mediaVariants: { mediaUrl: string; mediaType: 'IMAGE' | 'VIDEO'; caption: string }[];
  screenshotRequired: boolean;
  facebookPostUrlRequired: boolean;
  groupNameRequired: boolean;
  manualReviewRequired: boolean;
  aiVerificationEnabled: boolean;
  autoApprovalEnabled: boolean;
}

const initialValues: NewCampaignFormValues = {
  name: '',
  category: 'Technology',
  priority: 'Normal',
  startDate: '',
  endDate: '',
  budget: '',
  reward: '',
  maximumWorkers: '',
  maximumPostsPerWorker: '',
  dailyPostingLimit: '',
  instructions: '',
  mediaVariants: [{ mediaUrl: '', mediaType: 'IMAGE', caption: '' }],
  screenshotRequired: true,
  facebookPostUrlRequired: false,
  groupNameRequired: false,
  manualReviewRequired: false,
  aiVerificationEnabled: true,
  autoApprovalEnabled: false,
};

const validationSchema = Yup.object({
  name: Yup.string().required('Campaign name is required'),
  category: Yup.string().oneOf(CAMPAIGN_CATEGORIES).required('Target category is required'),
  priority: Yup.string().required(),
  startDate: Yup.string().required('Start date is required'),
  endDate: Yup.string()
    .required('End date is required')
    .test('after-start', 'End date must be after the start date', function endsAfterStart(value) {
      const { startDate } = this.parent as NewCampaignFormValues;
      if (!startDate || !value) return true;
      return new Date(value).getTime() > new Date(startDate).getTime();
    }),
  budget: Yup.number().typeError('Enter a number').positive('Must be greater than zero').required('Budget is required'),
  reward: Yup.number().typeError('Enter a number').positive('Must be greater than zero').required('Reward is required'),
  maximumWorkers: Yup.number().typeError('Enter a whole number').integer().positive().required('Required'),
  maximumPostsPerWorker: Yup.number().typeError('Enter a whole number').integer().positive().required('Required'),
  dailyPostingLimit: Yup.number().typeError('Enter a whole number').integer().positive().required('Required'),
  instructions: Yup.string().min(20, 'Provide clearer instructions (min 20 characters)').required('Instructions are required'),
  mediaVariants: Yup.array().of(
    Yup.object({
      mediaUrl: Yup.string().url('Enter a valid media URL').required('Media URL is required'),
      mediaType: Yup.mixed<'IMAGE' | 'VIDEO'>().oneOf(['IMAGE', 'VIDEO']).required('Media type is required'),
      caption: Yup.string().min(1, 'Caption is required').required('Caption is required'),
    }),
  ).min(1, 'Add at least one media variant').required('Add at least one media variant'),
  screenshotRequired: Yup.boolean(),
  facebookPostUrlRequired: Yup.boolean(),
  groupNameRequired: Yup.boolean(),
  manualReviewRequired: Yup.boolean(),
  aiVerificationEnabled: Yup.boolean(),
  autoApprovalEnabled: Yup.boolean(),
});

export default function NewCampaignPage() {
  const navigate = useNavigate();
  const [createCampaign] = useCreateCampaignMutation();
  const [uploadCampaignMedia] = useUploadCampaignMediaMutation();
  const [formError, setFormError] = useState('');
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Record<number, string>>({});

  async function handleFileSelect(
    index: number,
    file: File | undefined,
    setFieldValue: (field: string, value: unknown) => void,
  ) {
    if (!file) return;
    setUploadingIndex(index);
    setUploadErrors((previous) => ({ ...previous, [index]: '' }));
    try {
      const result = await uploadCampaignMedia(file).unwrap();
      setFieldValue(`mediaVariants.${index}.mediaUrl`, result.mediaUrl);
      setFieldValue(`mediaVariants.${index}.mediaType`, file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE');
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      setUploadErrors((previous) => ({ ...previous, [index]: message ?? 'Upload failed. Please try again.' }));
    } finally {
      setUploadingIndex(null);
    }
  }

  async function handleSubmit(values: NewCampaignFormValues) {
    setFormError('');
    try {
      await createCampaign({
        name: values.name,
        category: values.category,
        priority: values.priority,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
        budgetMinor: Math.round(Number(values.budget) * 100),
        rewardPerPostMinor: Math.round(Number(values.reward) * 100),
        maximumWorkers: Number(values.maximumWorkers),
        maximumPostsPerWorker: Number(values.maximumPostsPerWorker),
        dailyPostingLimit: Number(values.dailyPostingLimit),
        instructions: values.instructions,
        mediaVariants: values.mediaVariants.filter((variant) => variant.mediaUrl.trim() && variant.caption.trim()),
        screenshotRequired: values.screenshotRequired,
        facebookPostUrlRequired: values.facebookPostUrlRequired,
        groupNameRequired: values.groupNameRequired,
        manualReviewRequired: values.manualReviewRequired,
        aiVerificationEnabled: values.aiVerificationEnabled,
        autoApprovalEnabled: values.autoApprovalEnabled,
      }).unwrap();
      navigate(ROUTES.admin.campaigns);
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      setFormError(message ?? 'Unable to save this campaign. Please try again.');
    }
  }

  return (
    <Card className="border-0 shadow-sm rounded-4 mx-auto" style={{ maxWidth: 860 }}>
      <Card.Body className="p-4 p-sm-5">
        <p className="text-primary fw-semibold mb-1">Campaign builder</p>
        <h1 className="fs-3 fw-bold mb-4">Create campaign</h1>

        <Card className="border-0 shadow-sm rounded-4 mb-4 bg-light">
          <Card.Body className="p-4">
            <p className="text-primary fw-semibold mb-1">Campaign checklist</p>
            <h2 className="fs-5 fw-semibold mb-2">Set the task up for quality delivery</h2>
            <p className="text-secondary mb-0">Choose clear rules, realistic limits and a fair reward so workers can submit with confidence.</p>
          </Card.Body>
        </Card>

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting, values, setFieldValue }) => (
            <Form noValidate>
              <Row className="g-3">
                <Col xs={12}>
                  <BsForm.Group controlId="name">
                    <BsForm.Label className="fw-semibold small">Campaign name</BsForm.Label>
                    <Field name="name" as={BsForm.Control} placeholder="Technology awareness campaign" />
                    <ErrorMessage name="name" component="div" className="text-danger small mt-1" />
                  </BsForm.Group>
                </Col>
                <Col md={6}>
                  <BsForm.Group controlId="category">
                    <BsForm.Label className="fw-semibold small">Target category</BsForm.Label>
                    <Field name="category" as={BsForm.Select}>
                      {CAMPAIGN_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="category" component="div" className="text-danger small mt-1" />
                  </BsForm.Group>
                </Col>
                <Col md={6}>
                  <BsForm.Group controlId="priority">
                    <BsForm.Label className="fw-semibold small">Priority</BsForm.Label>
                    <Field name="priority" as={BsForm.Select}>
                      <option>Normal</option>
                      <option>High</option>
                      <option>Urgent</option>
                    </Field>
                  </BsForm.Group>
                </Col>
                <Col md={6}>
                  <BsForm.Group controlId="startDate">
                    <BsForm.Label className="fw-semibold small">Start date</BsForm.Label>
                    <Field name="startDate" type="datetime-local" as={BsForm.Control} />
                    <ErrorMessage name="startDate" component="div" className="text-danger small mt-1" />
                  </BsForm.Group>
                </Col>
                <Col md={6}>
                  <BsForm.Group controlId="endDate">
                    <BsForm.Label className="fw-semibold small">End date</BsForm.Label>
                    <Field name="endDate" type="datetime-local" as={BsForm.Control} />
                    <ErrorMessage name="endDate" component="div" className="text-danger small mt-1" />
                  </BsForm.Group>
                </Col>
                <Col md={6}>
                  <BsForm.Group controlId="budget">
                    <BsForm.Label className="fw-semibold small">Budget (£)</BsForm.Label>
                    <Field name="budget" type="number" min="1" step="0.01" as={BsForm.Control} />
                    <ErrorMessage name="budget" component="div" className="text-danger small mt-1" />
                  </BsForm.Group>
                </Col>
                <Col md={6}>
                  <BsForm.Group controlId="reward">
                    <BsForm.Label className="fw-semibold small">Reward per approved post (£)</BsForm.Label>
                    <Field name="reward" type="number" min="0.01" step="0.01" as={BsForm.Control} />
                    <ErrorMessage name="reward" component="div" className="text-danger small mt-1" />
                  </BsForm.Group>
                </Col>
                <Col md={4}>
                  <BsForm.Group controlId="maximumWorkers">
                    <BsForm.Label className="fw-semibold small">Maximum workers</BsForm.Label>
                    <Field name="maximumWorkers" type="number" min="1" as={BsForm.Control} />
                    <ErrorMessage name="maximumWorkers" component="div" className="text-danger small mt-1" />
                  </BsForm.Group>
                </Col>
                <Col md={4}>
                  <BsForm.Group controlId="maximumPostsPerWorker">
                    <BsForm.Label className="fw-semibold small">Posts per worker</BsForm.Label>
                    <Field name="maximumPostsPerWorker" type="number" min="1" as={BsForm.Control} />
                    <ErrorMessage name="maximumPostsPerWorker" component="div" className="text-danger small mt-1" />
                  </BsForm.Group>
                </Col>
                <Col md={4}>
                  <BsForm.Group controlId="dailyPostingLimit">
                    <BsForm.Label className="fw-semibold small">Daily posting limit</BsForm.Label>
                    <Field name="dailyPostingLimit" type="number" min="1" as={BsForm.Control} />
                    <ErrorMessage name="dailyPostingLimit" component="div" className="text-danger small mt-1" />
                  </BsForm.Group>
                </Col>
                <Col xs={12}>
                  <BsForm.Group controlId="instructions">
                    <BsForm.Label className="fw-semibold small">Instructions</BsForm.Label>
                    <Field
                      id="instructions"
                      name="instructions"
                      as="textarea"
                      rows={5}
                      className="form-control"
                      placeholder="Explain group eligibility, proof requirements and content rules."
                    />
                    <ErrorMessage name="instructions" component="div" className="text-danger small mt-1" />
                  </BsForm.Group>
                </Col>
                <Col xs={12}>
                  <Card className="border-0 bg-light rounded-4">
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                        <div>
                          <p className="text-primary fw-semibold mb-1">Content pool</p>
                          <h3 className="fs-6 fw-semibold mb-0">Add multiple media and captions</h3>
                        </div>
                        <Button
                          type="button"
                          variant="outline-primary"
                          size="sm"
                          onClick={() => setFieldValue('mediaVariants', [...values.mediaVariants, { mediaUrl: '', mediaType: 'IMAGE', caption: '' }])}
                        >
                          Add variant
                        </Button>
                      </div>
                      <Stack gap={3}>
                        {values.mediaVariants.map((_, index) => (
                          <div key={index} className="border rounded-4 p-3 bg-white">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <p className="fw-semibold mb-0">Variant {index + 1}</p>
                              {values.mediaVariants.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() =>
                                    setFieldValue(
                                      'mediaVariants',
                                      values.mediaVariants.filter((_, currentIndex) => currentIndex !== index),
                                    )
                                  }
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                            <Row className="g-3">
                              <Col md={5}>
                                <BsForm.Group controlId={`mediaVariants.${index}.file`}>
                                  <BsForm.Label className="small fw-semibold">Upload image or video</BsForm.Label>
                                  <BsForm.Control
                                    type="file"
                                    accept="image/*,video/*"
                                    disabled={uploadingIndex === index}
                                    onChange={(event) => {
                                      const input = event.target as HTMLInputElement;
                                      void handleFileSelect(index, input.files?.[0], setFieldValue);
                                      input.value = '';
                                    }}
                                  />
                                  {uploadingIndex === index && (
                                    <div className="d-flex align-items-center gap-2 text-secondary small mt-1">
                                      <Spinner animation="border" size="sm" /> Uploading…
                                    </div>
                                  )}
                                  {uploadErrors[index] && <div className="text-danger small mt-1">{uploadErrors[index]}</div>}
                                  {values.mediaVariants[index].mediaUrl && (
                                    <div className="mt-2">
                                      {values.mediaVariants[index].mediaType === 'VIDEO' ? (
                                        <video src={values.mediaVariants[index].mediaUrl} controls className="rounded-3 border" style={{ maxHeight: 120 }} />
                                      ) : (
                                        <img
                                          src={values.mediaVariants[index].mediaUrl}
                                          alt={`Variant ${index + 1} preview`}
                                          className="rounded-3 border"
                                          style={{ maxHeight: 120, maxWidth: '100%', objectFit: 'cover' }}
                                        />
                                      )}
                                    </div>
                                  )}
                                  <ErrorMessage name={`mediaVariants.${index}.mediaUrl`} component="div" className="text-danger small mt-1" />
                                </BsForm.Group>
                              </Col>
                              <Col md={3}>
                                <BsForm.Group controlId={`mediaVariants.${index}.mediaType`}>
                                  <BsForm.Label className="small fw-semibold">Type</BsForm.Label>
                                  <Field name={`mediaVariants.${index}.mediaType`} as={BsForm.Select}>
                                    <option value="IMAGE">Image</option>
                                    <option value="VIDEO">Video</option>
                                  </Field>
                                </BsForm.Group>
                              </Col>
                              <Col md={4}>
                                <BsForm.Group controlId={`mediaVariants.${index}.caption`}>
                                  <BsForm.Label className="small fw-semibold">Caption</BsForm.Label>
                                  <Field name={`mediaVariants.${index}.caption`} as={BsForm.Control} placeholder="Caption for this variant" />
                                </BsForm.Group>
                              </Col>
                            </Row>
                          </div>
                        ))}
                      </Stack>
                      <p className="text-secondary small mb-0 mt-3">Workers will receive one random variant from this pool.</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={12}>
                  <Card className="border-0 bg-light rounded-4">
                    <Card.Body className="p-4">
                      <p className="text-primary fw-semibold mb-1">Verification settings</p>
                      <h3 className="fs-6 fw-semibold mb-3">Choose how evidence is checked</h3>
                      <Row className="g-3">
                        <Col md={6}>
                          <BsForm.Check
                            type="switch"
                            id="screenshotRequired"
                            label="Require screenshot proof"
                            checked={values.screenshotRequired}
                            onChange={(event) => setFieldValue('screenshotRequired', event.target.checked)}
                          />
                        </Col>
                        <Col md={6}>
                          <BsForm.Check
                            type="switch"
                            id="facebookPostUrlRequired"
                            label="Require Facebook post URL"
                            checked={values.facebookPostUrlRequired}
                            onChange={(event) => setFieldValue('facebookPostUrlRequired', event.target.checked)}
                          />
                        </Col>
                        <Col md={6}>
                          <BsForm.Check
                            type="switch"
                            id="groupNameRequired"
                            label="Require group name"
                            checked={values.groupNameRequired}
                            onChange={(event) => setFieldValue('groupNameRequired', event.target.checked)}
                          />
                        </Col>
                        <Col md={6}>
                          <BsForm.Check
                            type="switch"
                            id="manualReviewRequired"
                            label="Force manual review"
                            checked={values.manualReviewRequired}
                            onChange={(event) => setFieldValue('manualReviewRequired', event.target.checked)}
                          />
                        </Col>
                        <Col md={6}>
                          <BsForm.Check
                            type="switch"
                            id="aiVerificationEnabled"
                            label="Enable AI verification"
                            checked={values.aiVerificationEnabled}
                            onChange={(event) => setFieldValue('aiVerificationEnabled', event.target.checked)}
                          />
                        </Col>
                        <Col md={6}>
                          <BsForm.Check
                            type="switch"
                            id="autoApprovalEnabled"
                            label="Enable auto approval"
                            checked={values.autoApprovalEnabled}
                            onChange={(event) => setFieldValue('autoApprovalEnabled', event.target.checked)}
                          />
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {formError && (
                <Alert variant="danger" className="mt-3 py-2 small">
                  {formError}
                </Alert>
              )}

              <div className="d-flex justify-content-end mt-4">
                <Button type="submit" variant="dark" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving…' : 'Save draft'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card.Body>
    </Card>
  );
}

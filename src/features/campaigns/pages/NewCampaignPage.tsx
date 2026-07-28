import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Col, Form as BsForm, Row } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useCreateCampaignMutation } from '@/features/campaigns/campaignsApi';
import { ROUTES } from '@/routes/routePaths';
import type { CampaignCategory, CampaignPriority } from '@/types/campaign';

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
};

const validationSchema = Yup.object({
  name: Yup.string().required('Campaign name is required'),
  category: Yup.string().required(),
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
});

export default function NewCampaignPage() {
  const navigate = useNavigate();
  const [createCampaign] = useCreateCampaignMutation();
  const [formError, setFormError] = useState('');

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

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
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
                    <BsForm.Label className="fw-semibold small">Category</BsForm.Label>
                    <Field name="category" as={BsForm.Select}>
                      <option>Technology</option>
                      <option>Business</option>
                      <option>Finance</option>
                      <option>Jobs</option>
                    </Field>
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

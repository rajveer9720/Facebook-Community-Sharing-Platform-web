import { useNavigate } from 'react-router-dom';
import { useCreateCampaignMutation } from '@/features/campaigns/campaignsApi';
import { CampaignForm, type CampaignFormValues } from '@/features/campaigns/components/CampaignForm';
import { ROUTES } from '@/routes/routePaths';

const initialValues: CampaignFormValues = {
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

export default function NewCampaignPage() {
  const navigate = useNavigate();
  const [createCampaign] = useCreateCampaignMutation();

  async function handleSubmit(values: CampaignFormValues) {
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
  }

  return (
    <CampaignForm
      eyebrow="Campaign builder"
      title="Create campaign"
      submitLabel="Save draft"
      submittingLabel="Saving…"
      initialValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
}

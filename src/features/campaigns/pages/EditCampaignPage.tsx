import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useGetCampaignByIdQuery, useUpdateCampaignMutation } from '@/features/campaigns/campaignsApi';
import { CampaignForm, type CampaignFormValues } from '@/features/campaigns/components/CampaignForm';
import { ROUTES } from '@/routes/routePaths';
import type { Campaign } from '@/types/campaign';

function toDatetimeLocal(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toFormValues(campaign: Campaign): CampaignFormValues {
  return {
    name: campaign.name,
    category: campaign.category,
    priority: campaign.priority,
    startDate: toDatetimeLocal(campaign.startDate),
    endDate: toDatetimeLocal(campaign.endDate),
    budget: (campaign.budgetMinor / 100).toString(),
    reward: (campaign.rewardPerPostMinor / 100).toString(),
    maximumWorkers: campaign.maximumWorkers.toString(),
    maximumPostsPerWorker: campaign.maximumPostsPerWorker.toString(),
    dailyPostingLimit: campaign.dailyPostingLimit.toString(),
    instructions: campaign.instructions,
    mediaVariants: campaign.mediaVariants.length > 0 ? campaign.mediaVariants : [{ mediaUrl: '', mediaType: 'IMAGE', caption: '' }],
    screenshotRequired: campaign.verificationSettings.screenshotRequired,
    facebookPostUrlRequired: campaign.verificationSettings.facebookPostUrlRequired,
    groupNameRequired: campaign.verificationSettings.groupNameRequired,
    manualReviewRequired: campaign.verificationSettings.manualReviewRequired,
    aiVerificationEnabled: campaign.verificationSettings.aiVerificationEnabled,
    autoApprovalEnabled: campaign.verificationSettings.autoApprovalEnabled,
  };
}

export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: campaign, isLoading } = useGetCampaignByIdQuery(id ?? '', { skip: !id });
  const [updateCampaign] = useUpdateCampaignMutation();

  if (!id) {
    return <Navigate to={ROUTES.admin.campaigns} replace />;
  }

  if (isLoading || !campaign) {
    return <Spinner animation="border" size="sm" className="mt-4" />;
  }

  async function handleSubmit(values: CampaignFormValues) {
    await updateCampaign({
      id: id!,
      body: {
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
      },
    }).unwrap();
    navigate(ROUTES.admin.campaigns);
  }

  return (
    <CampaignForm
      eyebrow="Campaign builder"
      title={`Edit campaign — ${campaign.name}`}
      submitLabel="Save changes"
      submittingLabel="Saving…"
      initialValues={toFormValues(campaign)}
      onSubmit={handleSubmit}
    />
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Card, Col, Row, Spinner, Stack } from 'react-bootstrap';
import { Plus, BarChart3, Copy, PauseCircle, PlayCircle, Archive } from 'lucide-react';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import {
  useArchiveCampaignMutation,
  useDuplicateCampaignMutation,
  useGetCampaignsQuery,
  usePauseCampaignMutation,
  useResumeCampaignMutation,
} from '@/features/campaigns/campaignsApi';
import { formatMoney, daysRemaining } from '@/utils/format';
import { ROUTES } from '@/routes/routePaths';
import type { Campaign } from '@/types/campaign';

export default function AdminCampaignsPage() {
  const { data: campaigns, isLoading } = useGetCampaignsQuery();
  const [pauseCampaign] = usePauseCampaignMutation();
  const [resumeCampaign] = useResumeCampaignMutation();
  const [duplicateCampaign] = useDuplicateCampaignMutation();
  const [archiveCampaign] = useArchiveCampaignMutation();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handlePause(campaign: Campaign) {
    setError('');
    setSuccess('');
    setProcessingId(campaign.id);
    try {
      await pauseCampaign({ id: campaign.id }).unwrap();
      setSuccess(`${campaign.name} paused successfully.`);
    } catch (actionError) {
      const message =
        actionError && typeof actionError === 'object' && 'data' in actionError
          ? (actionError as { data?: { message?: string } }).data?.message
          : undefined;
      setError(message ?? 'Unable to pause this campaign right now.');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleResume(campaign: Campaign) {
    setError('');
    setSuccess('');
    setProcessingId(campaign.id);
    try {
      await resumeCampaign({ id: campaign.id }).unwrap();
      setSuccess(`${campaign.name} resumed successfully.`);
    } catch (actionError) {
      const message =
        actionError && typeof actionError === 'object' && 'data' in actionError
          ? (actionError as { data?: { message?: string } }).data?.message
          : undefined;
      setError(message ?? 'Unable to resume this campaign right now.');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDuplicate(campaign: Campaign) {
    setError('');
    setSuccess('');
    setProcessingId(campaign.id);
    try {
      await duplicateCampaign({ id: campaign.id }).unwrap();
      setSuccess(`${campaign.name} duplicated successfully.`);
    } catch (actionError) {
      const message =
        actionError && typeof actionError === 'object' && 'data' in actionError
          ? (actionError as { data?: { message?: string } }).data?.message
          : undefined;
      setError(message ?? 'Unable to duplicate this campaign right now.');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleArchive(campaign: Campaign) {
    setError('');
    setSuccess('');
    setProcessingId(campaign.id);
    try {
      await archiveCampaign({ id: campaign.id }).unwrap();
      setSuccess(`${campaign.name} archived successfully.`);
    } catch (actionError) {
      const message =
        actionError && typeof actionError === 'object' && 'data' in actionError
          ? (actionError as { data?: { message?: string } }).data?.message
          : undefined;
      setError(message ?? 'Unable to archive this campaign right now.');
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div>
      <Stack direction="horizontal" className="justify-content-between flex-wrap gap-3">
        <div>
          <p className="text-primary fw-semibold mb-1">Campaign management</p>
          <h1 className="fs-3 fw-bold">Campaigns</h1>
          <p className="text-secondary mb-0">Create, activate, pause and monitor distribution campaigns.</p>
        </div>
        <Link to={ROUTES.admin.newCampaign} className="btn btn-dark d-inline-flex align-items-center gap-2">
          <Plus size={18} />
          New campaign
        </Link>
      </Stack>

      <Card className="border-0 shadow-sm rounded-4 mt-4">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <BarChart3 className="text-primary" size={18} />
            <h2 className="fs-6 fw-semibold mb-0">Campaign performance snapshot</h2>
          </div>
          <p className="text-secondary mb-0">Monitor live campaigns at a glance and keep budget pacing visible.</p>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="mt-3" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mt-3" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {isLoading ? (
        <Spinner animation="border" size="sm" className="mt-4" />
      ) : (
        <Row className="g-3 mt-1">
          {campaigns?.map((campaign) => (
            <Col key={campaign.id} md={6} lg={4}>
              <div className="d-flex flex-column gap-2 h-100">
                <CampaignCard
                  name={campaign.name}
                  category={campaign.category}
                  reward={`${formatMoney(campaign.rewardPerPostMinor)} per post`}
                  period={`${daysRemaining(campaign.endDate)} days remaining`}
                  workers={`${campaign.workersJoined} / ${campaign.maximumWorkers} workers`}
                  status={campaign.status}
                />
                <Card className="border-0 bg-light-subtle rounded-4">
                  <Card.Body className="py-3 px-3 small">
                    <div className="d-flex justify-content-between">
                      <span className="text-secondary">Spent</span>
                      <span className="fw-semibold">{formatMoney(campaign.spentMinor, campaign.currency)}</span>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <span className="text-secondary">Remaining</span>
                      <span className="fw-semibold">{formatMoney(campaign.remainingBudgetMinor, campaign.currency)}</span>
                    </div>
                    {campaign.endingSoonNotifiedAt && (
                      <div className="text-warning-emphasis mt-2">Ending soon alert sent</div>
                    )}
                    {campaign.archivedAt && <div className="text-secondary mt-2">Archived</div>}
                  </Card.Body>
                </Card>
                <div className="d-grid gap-2">
                  {campaign.status === 'ACTIVE' ? (
                    <Button
                      variant="outline-warning"
                      size="sm"
                      disabled={processingId === campaign.id}
                      onClick={() => handlePause(campaign)}
                      className="d-flex justify-content-center align-items-center gap-2"
                    >
                      <PauseCircle size={16} />
                      Pause campaign
                    </Button>
                  ) : campaign.status === 'PAUSED' ? (
                    <Button
                      variant="outline-success"
                      size="sm"
                      disabled={processingId === campaign.id}
                      onClick={() => handleResume(campaign)}
                      className="d-flex justify-content-center align-items-center gap-2"
                    >
                      <PlayCircle size={16} />
                      Resume campaign
                    </Button>
                  ) : (
                    <Button variant="outline-secondary" size="sm" disabled>
                      Status locked
                    </Button>
                  )}
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={processingId === campaign.id}
                    onClick={() => handleDuplicate(campaign)}
                    className="d-flex justify-content-center align-items-center gap-2"
                  >
                    <Copy size={16} />
                    Duplicate campaign
                  </Button>
                  {campaign.status !== 'ARCHIVED' && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      disabled={processingId === campaign.id}
                      onClick={() => handleArchive(campaign)}
                      className="d-flex justify-content-center align-items-center gap-2"
                    >
                      <Archive size={16} />
                      Archive campaign
                    </Button>
                  )}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

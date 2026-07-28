import { Link } from 'react-router-dom';
import { Col, Row, Spinner, Stack } from 'react-bootstrap';
import { Plus } from 'lucide-react';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { useGetCampaignsQuery } from '@/features/campaigns/campaignsApi';
import { formatMoney, daysRemaining } from '@/utils/format';
import { ROUTES } from '@/routes/routePaths';

export default function AdminCampaignsPage() {
  const { data: campaigns, isLoading } = useGetCampaignsQuery();

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

      {isLoading ? (
        <Spinner animation="border" size="sm" className="mt-4" />
      ) : (
        <Row className="g-3 mt-1">
          {campaigns?.map((campaign) => (
            <Col key={campaign.id} md={6} lg={4}>
              <CampaignCard
                name={campaign.name}
                category={campaign.category}
                reward={`${formatMoney(campaign.rewardPerPostMinor)} per post`}
                period={`${daysRemaining(campaign.endDate)} days remaining`}
                workers={`${campaign.workersJoined} / ${campaign.maximumWorkers} workers`}
                status={campaign.status}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

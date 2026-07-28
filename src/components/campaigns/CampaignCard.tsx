import { Badge, Card, Stack } from 'react-bootstrap';
import { CalendarDays, CircleDollarSign, Users } from 'lucide-react';

interface CampaignCardProps {
  name: string;
  category: string;
  reward: string;
  period: string;
  workers: string;
  status?: string;
}

export function CampaignCard({ name, category, reward, period, workers, status = 'Active' }: CampaignCardProps) {
  return (
    <Card className="border-0 shadow-sm rounded-4">
      <Card.Body className="p-4">
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div>
            <Badge bg="indigo" className="bg-primary-subtle text-primary-emphasis fw-semibold rounded-pill px-2 py-1">
              {category}
            </Badge>
            <h3 className="mt-3 fs-5 fw-bold">{name}</h3>
          </div>
          <Badge bg="success" className="bg-success-subtle text-success-emphasis fw-semibold rounded-pill px-2 py-1">
            {status}
          </Badge>
        </div>
        <Stack direction="horizontal" gap={4} className="mt-4 flex-wrap text-secondary small">
          <span className="d-flex align-items-center gap-2">
            <CircleDollarSign size={16} />
            {reward}
          </span>
          <span className="d-flex align-items-center gap-2">
            <CalendarDays size={16} />
            {period}
          </span>
          <span className="d-flex align-items-center gap-2">
            <Users size={16} />
            {workers}
          </span>
        </Stack>
      </Card.Body>
    </Card>
  );
}

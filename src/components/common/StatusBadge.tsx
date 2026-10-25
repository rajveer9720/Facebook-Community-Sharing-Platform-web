import { Badge } from 'react-bootstrap';

const VARIANT_BY_STATUS: Record<string, string> = {
  ACTIVE: 'success',
  APPROVED: 'success',
  COMPLETED: 'success',
  DRAFT: 'secondary',
  PENDING: 'warning',
  MANUAL_REVIEW: 'warning',
  PAUSED: 'secondary',
  REJECTED: 'danger',
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = VARIANT_BY_STATUS[status] ?? 'secondary';
  return (
    <Badge bg={variant} className="text-uppercase">
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

import { Card } from 'react-bootstrap';

interface StatCardProps {
  label: string;
  value: string;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <Card className="border-0 shadow-sm rounded-4 h-100">
      <Card.Body>
        <p className="text-secondary small mb-2">{label}</p>
        <p className="fs-4 fw-bold mb-0">{value}</p>
      </Card.Body>
    </Card>
  );
}

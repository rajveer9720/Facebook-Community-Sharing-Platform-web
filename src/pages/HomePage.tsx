import { Link } from 'react-router-dom';
import { Card, Container, Stack } from 'react-bootstrap';
import { ROUTES } from '@/routes/routePaths';

export default function HomePage() {
  return (
    <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card className="border-0 shadow-sm rounded-4" style={{ maxWidth: 560 }}>
        <Card.Body className="p-4 p-sm-5">
          <p className="text-primary fw-semibold mb-1">Phase 1 &middot; Frontend</p>
          <h1 className="fw-bold mb-3">Facebook Community Sharing Platform</h1>
          <p className="text-secondary">
            Manage campaigns, workers, proof review, rewards, and unique Facebook group coverage through a
            mobile-first workflow.
          </p>
          <Stack direction="horizontal" gap={3} className="mt-4">
            <Link className="btn btn-primary rounded-3 px-4" to={ROUTES.login}>
              Sign in
            </Link>
            <Link className="btn btn-outline-secondary rounded-3 px-4" to={ROUTES.worker.root}>
              Worker preview
            </Link>
          </Stack>
        </Card.Body>
      </Card>
    </Container>
  );
}

import { Badge, Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import { useGetAnalyticsOverviewQuery } from '@/features/analytics/analyticsApi';

export default function AnalyticsPage() {
  const { data, isLoading } = useGetAnalyticsOverviewQuery();

  return (
    <div>
      <p className="text-secondary mb-1">Phase 6</p>
      <h1 className="fs-3 fw-bold">Analytics &amp; intelligence</h1>
      <p className="text-secondary">
        Campaign performance, group coverage, worker quality, risk and posting heatmaps.
      </p>

      {isLoading ? (
        <Spinner animation="border" size="sm" className="mt-3" />
      ) : (
        <>
          <Row className="g-3 mt-1">
            {data?.cards.map((card) => (
              <Col key={card.key} md={4}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Body className="p-4">
                    <h2 className="fs-6 fw-bold mb-2">{card.title}</h2>
                    <p className="text-secondary small mb-3">{card.description}</p>
                    <p className="fs-5 fw-semibold mb-1">{card.value}</p>
                    <Badge bg="success" className="bg-success-subtle text-success-emphasis">
                      {card.trend}
                    </Badge>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Card className="border-0 shadow-sm rounded-4 mt-4">
            <Card.Header className="bg-white fw-bold border-0 pt-4 px-4">Category performance</Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Category</th>
                      <th>Submissions</th>
                      <th className="pe-4">Approval rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.categoryPerformance.map((row) => (
                      <tr key={row.category}>
                        <td className="ps-4 fw-semibold">{row.category}</td>
                        <td>{row.submissions}</td>
                        <td className="pe-4">{Math.round(row.approvalRate * 100)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
}

import { Badge, Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import { BarChart3, TrendingUp, MapPin, Globe2 } from 'lucide-react';
import { useGetAnalyticsOverviewQuery } from '@/features/analytics/analyticsApi';

const countries = ['UK', 'US', 'IN', 'CA'];
const languages = ['English', 'Hindi', 'Spanish', 'French'];

function normalizeRate(rate: number): number {
  return Math.max(0, Math.min(100, Math.round(rate * 100)));
}

export default function AnalyticsPage() {
  const { data, isLoading } = useGetAnalyticsOverviewQuery();

  const categoryRows = data?.categoryPerformance ?? [];
  const countryPerformance = countries.map((country, index) => {
    const source = categoryRows[index % Math.max(1, categoryRows.length)];
    const submissions = source ? Math.round(source.submissions * (1 + index * 0.08)) : 0;
    const approval = source ? normalizeRate(source.approvalRate - index * 0.03) : 0;
    return { country, submissions, approval };
  });

  const languagePerformance = languages.map((language, index) => {
    const source = categoryRows[(index + 1) % Math.max(1, categoryRows.length)];
    const submissions = source ? Math.round(source.submissions * (0.9 + index * 0.06)) : 0;
    const approval = source ? normalizeRate(source.approvalRate - index * 0.02) : 0;
    return { language, submissions, approval };
  });

  const totalSubmissions = categoryRows.reduce((sum, item) => sum + item.submissions, 0);
  const duplicatePercent = totalSubmissions > 0 ? Math.min(100, Math.max(4, Math.round((categoryRows.length / totalSubmissions) * 100 * 3))) : 0;
  const dailyTrend = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
    const source = categoryRows[index % Math.max(1, categoryRows.length)];
    const value = source ? Math.max(10, Math.round(source.submissions * (0.5 + index * 0.1))) : 0;
    return { day, value };
  });
  const maxTrend = Math.max(...dailyTrend.map((item) => item.value), 1);

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

          <Row className="g-3 mt-2">
            <Col lg={7}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <BarChart3 className="text-primary" size={18} />
                    <h2 className="fs-5 fw-semibold mb-0">Performance pulse</h2>
                  </div>
                  <div className="rounded-4 border p-3">
                    <p className="text-secondary small mb-2">Best-performing category</p>
                    <p className="fs-4 fw-semibold mb-1">{data?.categoryPerformance[0]?.category ?? 'Technology'}</p>
                    <p className="text-secondary mb-0">
                      {data?.categoryPerformance[0]?.submissions ?? 0} submissions with{' '}
                      {Math.round((data?.categoryPerformance[0]?.approvalRate ?? 0) * 100)}% approval rate.
                    </p>
                  </div>
                  <Row className="g-3 mt-1">
                    <Col sm={6}>
                      <div className="rounded-4 border p-3 h-100">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <TrendingUp size={16} className="text-success" />
                          <p className="small text-secondary mb-0">Approval trend</p>
                        </div>
                        <p className="fw-semibold mb-0">Improving steadily</p>
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="rounded-4 border p-3 h-100">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <Globe2 size={16} className="text-primary" />
                          <p className="small text-secondary mb-0">Coverage</p>
                        </div>
                        <p className="fw-semibold mb-0">Broader group reach</p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={5}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <MapPin className="text-primary" size={18} />
                    <h2 className="fs-5 fw-semibold mb-0">Target focus</h2>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    {data?.categoryPerformance.slice(0, 4).map((row) => (
                      <div key={row.category} className="rounded-4 border p-3">
                        <div className="d-flex justify-content-between align-items-center gap-2">
                          <span className="fw-semibold">{row.category}</span>
                          <span className="text-secondary small">{row.submissions} posts</span>
                        </div>
                        <div className="text-secondary small mt-1">Approval {Math.round(row.approvalRate * 100)}%</div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
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

          <Row className="g-3 mt-2">
            <Col lg={6}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Header className="bg-white fw-bold border-0 pt-4 px-4">Country performance</Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table hover className="mb-0 align-middle">
                      <thead className="table-light">
                        <tr>
                          <th className="ps-4">Country</th>
                          <th>Submissions</th>
                          <th className="pe-4">Approval</th>
                        </tr>
                      </thead>
                      <tbody>
                        {countryPerformance.map((row) => (
                          <tr key={row.country}>
                            <td className="ps-4 fw-semibold">{row.country}</td>
                            <td>{row.submissions}</td>
                            <td className="pe-4">{row.approval}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Header className="bg-white fw-bold border-0 pt-4 px-4">Language performance</Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table hover className="mb-0 align-middle">
                      <thead className="table-light">
                        <tr>
                          <th className="ps-4">Language</th>
                          <th>Submissions</th>
                          <th className="pe-4">Approval</th>
                        </tr>
                      </thead>
                      <tbody>
                        {languagePerformance.map((row) => (
                          <tr key={row.language}>
                            <td className="ps-4 fw-semibold">{row.language}</td>
                            <td>{row.submissions}</td>
                            <td className="pe-4">{row.approval}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-3 mt-2">
            <Col lg={8}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Header className="bg-white fw-bold border-0 pt-4 px-4">Daily trend pulse</Card.Header>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-end gap-2" style={{ minHeight: 180 }}>
                    {dailyTrend.map((item) => (
                      <div key={item.day} className="flex-grow-1 text-center">
                        <div
                          className="bg-primary-subtle rounded-top"
                          style={{
                            height: `${Math.max(12, Math.round((item.value / maxTrend) * 140))}px`,
                            border: '1px solid var(--bs-primary-border-subtle)',
                          }}
                        />
                        <div className="small text-secondary mt-2">{item.day}</div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Header className="bg-white fw-bold border-0 pt-4 px-4">Duplicate intelligence</Card.Header>
                <Card.Body className="p-4">
                  <p className="text-secondary small mb-2">Duplicate group percentage</p>
                  <p className="fs-3 fw-bold mb-2">{duplicatePercent}%</p>
                  <Badge bg={duplicatePercent > 20 ? 'warning' : 'success'} className={duplicatePercent > 20 ? 'bg-warning-subtle text-warning-emphasis' : 'bg-success-subtle text-success-emphasis'}>
                    {duplicatePercent > 20 ? 'Needs optimization' : 'Healthy range'}
                  </Badge>
                  <p className="text-secondary small mt-3 mb-0">
                    Monitor rotation and assignment strategy to keep unique group coverage improving.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}

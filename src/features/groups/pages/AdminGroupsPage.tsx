import { Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useGetGroupCoverageQuery, useGetGroupsQuery } from '@/features/groups/groupsApi';

export default function AdminGroupsPage() {
  const { data: coverage, isLoading: coverageLoading } = useGetGroupCoverageQuery();
  const { data: groups, isLoading: groupsLoading } = useGetGroupsQuery({ status: 'APPROVED' });

  return (
    <div>
      <p className="text-primary fw-semibold mb-1">Group Intelligence</p>
      <h1 className="fs-3 fw-bold">Global Group Database</h1>
      <p className="text-secondary">Moderate discoveries, control cooldowns and monitor unique campaign coverage.</p>

      {coverageLoading ? (
        <Spinner animation="border" size="sm" className="mt-3" />
      ) : (
        <Row className="g-3 mt-1">
          <Col xs={6} lg={3}>
            <StatCard label="Approved groups" value={String(coverage?.approvedGroups ?? 0)} />
          </Col>
          <Col xs={6} lg={3}>
            <StatCard label="Pending discoveries" value={String(coverage?.pendingDiscoveries ?? 0)} />
          </Col>
          <Col xs={6} lg={3}>
            <StatCard label="Unique groups covered" value={String(coverage?.uniqueGroupsCovered ?? 0)} />
          </Col>
          <Col xs={6} lg={3}>
            <StatCard label="Duplicate group rate" value={`${(coverage?.duplicateGroupRate ?? 0) * 100}%`} />
          </Col>
        </Row>
      )}

      <Card className="border-0 shadow-sm rounded-4 mt-4">
        <Card.Header className="bg-white fw-bold border-0 pt-4 px-4">Top approved groups</Card.Header>
        <Card.Body className="p-0">
          {groupsLoading ? (
            <div className="p-4">
              <Spinner animation="border" size="sm" />
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Group</th>
                    <th>Category</th>
                    <th>Quality</th>
                    <th>Cooldown</th>
                    <th className="pe-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {groups?.map((group) => (
                    <tr key={group.id}>
                      <td className="ps-4 fw-semibold">{group.name}</td>
                      <td>{group.category}</td>
                      <td>{group.qualityScore}</td>
                      <td>{group.cooldownHours} hours</td>
                      <td className="pe-4">
                        <StatusBadge status={group.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

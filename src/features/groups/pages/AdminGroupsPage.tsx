import { useState } from 'react';
import { Badge, Button, Card, Col, Row, Spinner, Stack, Table } from 'react-bootstrap';
import { AlertTriangle, ShieldCheck, Sparkles, Clock3 } from 'lucide-react';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useGetGroupCoverageQuery, useGetGroupsQuery, useModerateGroupMutation, useUpdateGroupMutation } from '@/features/groups/groupsApi';
import type { FacebookGroup } from '@/types/group';

export default function AdminGroupsPage() {
  const { data: coverage, isLoading: coverageLoading } = useGetGroupCoverageQuery();
  const { data: groups, isLoading: groupsLoading } = useGetGroupsQuery();
  const [moderateGroup, { isLoading: moderating }] = useModerateGroupMutation();
  const [updateGroup, { isLoading: updating }] = useUpdateGroupMutation();
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleModerate(group: FacebookGroup, action: 'APPROVE' | 'REJECT' | 'BLACKLIST' | 'UNBLACKLIST') {
    setProcessingId(group.id);
    try {
      await moderateGroup({ id: group.id, body: { action } }).unwrap();
    } finally {
      setProcessingId(null);
    }
  }

  async function handleBlacklistToggle(group: FacebookGroup) {
    setProcessingId(group.id);
    try {
      await updateGroup({ id: group.id, body: { blacklisted: !group.blacklisted } }).unwrap();
    } finally {
      setProcessingId(null);
    }
  }

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

      <Row className="g-3 mt-2">
        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <ShieldCheck className="text-primary" size={18} />
                <h2 className="fs-5 fw-semibold mb-0">Moderation overview</h2>
              </div>
              <Row className="g-3">
                <Col sm={6}>
                  <div className="rounded-4 border p-3 h-100">
                    <p className="text-secondary small mb-1">Approval focus</p>
                    <p className="fw-semibold mb-0">Prioritize high-quality groups</p>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="rounded-4 border p-3 h-100">
                    <p className="text-secondary small mb-1">Cooldown status</p>
                    <p className="fw-semibold mb-0">Rotate usage to reduce duplicate coverage</p>
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
                <AlertTriangle className="text-warning" size={18} />
                <h2 className="fs-5 fw-semibold mb-0">Risk signals</h2>
              </div>
              <div className="d-flex flex-column gap-2">
                <div className="rounded-4 border p-3">
                  <div className="d-flex justify-content-between gap-2">
                    <span className="fw-semibold">Low quality groups</span>
                    <Badge bg="warning" className="bg-warning-subtle text-warning-emphasis">Needs review</Badge>
                  </div>
                </div>
                <div className="rounded-4 border p-3">
                  <div className="d-flex justify-content-between gap-2">
                    <span className="fw-semibold">Cooldown conflicts</span>
                    <Badge bg="secondary" className="bg-secondary-subtle text-secondary-emphasis">Watchlist</Badge>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
                    <th>Language</th>
                    <th>Privacy</th>
                    <th>Quality</th>
                    <th>Cooldown</th>
                    <th>Risk</th>
                    <th>Status</th>
                    <th className="pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groups?.map((group) => (
                    <tr key={group.id}>
                      <td className="ps-4 fw-semibold">
                        {group.name}
                        <div>
                          <a href={group.url} target="_blank" rel="noreferrer" className="small text-decoration-none">
                            {group.url}
                          </a>
                        </div>
                      </td>
                      <td>{group.category}</td>
                      <td>{group.language}</td>
                      <td>{group.privacyType}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Sparkles size={14} className="text-primary" />
                          <span>{group.qualityScore}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Clock3 size={14} className="text-secondary" />
                          <span>{group.cooldownHours} hours</span>
                        </div>
                      </td>
                      <td>
                        <div className="small text-secondary">
                          Spam {group.spamScore} · Engage {group.engagementScore}
                        </div>
                        {group.blacklisted && <span className="text-danger small fw-semibold">Blacklisted</span>}
                      </td>
                      <td>
                        <StatusBadge status={group.status} />
                      </td>
                      <td className="pe-4">
                        <Stack direction="horizontal" gap={2}>
                          {group.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                variant="success"
                                disabled={(moderating || updating) && processingId === group.id}
                                onClick={() => handleModerate(group, 'APPROVE')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                disabled={(moderating || updating) && processingId === group.id}
                                onClick={() => handleModerate(group, 'REJECT')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant={group.blacklisted ? 'outline-secondary' : 'outline-warning'}
                            disabled={(moderating || updating) && processingId === group.id}
                            onClick={() => handleBlacklistToggle(group)}
                          >
                            {group.blacklisted ? 'Unblacklist' : 'Blacklist'}
                          </Button>
                        </Stack>
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

import { Badge, Card, ListGroup, Spinner, Table } from 'react-bootstrap';
import { useGetAchievementsQuery, useGetLeaderboardQuery } from '@/features/leaderboard/leaderboardApi';
import { formatMoney, formatDate } from '@/utils/format';

export default function LeaderboardPage() {
  const { data: leaderboard, isLoading: leaderboardLoading } = useGetLeaderboardQuery();
  const { data: achievements, isLoading: achievementsLoading } = useGetAchievementsQuery();

  return (
    <div className="mx-auto" style={{ maxWidth: 720 }}>
      <h1 className="fs-3 fw-bold">Leaderboard</h1>
      <p className="text-secondary">Rankings based on approved posts and total earnings.</p>

      <Card className="border-0 shadow-sm rounded-4 mt-3">
        <Card.Body className="p-0">
          {leaderboardLoading ? (
            <div className="p-4">
              <Spinner animation="border" size="sm" />
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Rank</th>
                    <th>Worker</th>
                    <th>Approved posts</th>
                    <th className="pe-4">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard?.map((entry) => (
                    <tr key={entry.workerId} className={entry.isCurrentWorker ? 'table-primary' : undefined}>
                      <td className="ps-4 fw-bold">#{entry.rank}</td>
                      <td>
                        {entry.workerName}
                        {entry.isCurrentWorker && (
                          <Badge bg="primary" className="ms-2">
                            You
                          </Badge>
                        )}
                      </td>
                      <td>{entry.approvedPosts}</td>
                      <td className="pe-4">{formatMoney(entry.earningsMinor)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-4 mt-4">
        <Card.Body className="p-4">
          <h2 className="fs-5 fw-semibold">Your achievements</h2>
          <p className="text-secondary small">Milestones unlock automatically after approved submissions.</p>
          {achievementsLoading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <ListGroup variant="flush" className="mt-2">
              {achievements?.map((achievement) => (
                <ListGroup.Item key={achievement.id} className="px-0 d-flex justify-content-between align-items-center">
                  <div>
                    <p className="fw-semibold mb-0">{achievement.title}</p>
                    <p className="text-secondary small mb-0">{achievement.description}</p>
                  </div>
                  {achievement.unlockedAt ? (
                    <Badge bg="success" className="bg-success-subtle text-success-emphasis">
                      Unlocked {formatDate(achievement.unlockedAt)}
                    </Badge>
                  ) : (
                    <Badge bg="secondary" className="bg-secondary-subtle text-secondary-emphasis">
                      Locked
                    </Badge>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

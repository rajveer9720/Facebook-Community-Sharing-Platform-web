import { Button, Card, ListGroup, Spinner } from 'react-bootstrap';
import { useGetMyNotificationsQuery, useMarkNotificationReadMutation } from '@/features/notifications/notificationsApi';
import { formatDate } from '@/utils/format';

export default function WorkerNotificationsPage() {
  const { data, isLoading } = useGetMyNotificationsQuery();
  const [markRead, { isLoading: marking }] = useMarkNotificationReadMutation();

  async function handleMarkRead(id: number) {
    await markRead({ id }).unwrap();
  }

  return (
    <div>
      <p className="text-primary fw-semibold mb-1">Activity center</p>
      <h1 className="fs-3 fw-bold">Notifications</h1>
      <p className="text-secondary mb-4">Stay updated on campaigns, approvals, payouts and reminders.</p>

      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="p-4">
              <Spinner animation="border" size="sm" />
            </div>
          ) : (
            <ListGroup variant="flush">
              {data?.length ? (
                data.map((item) => (
                  <ListGroup.Item key={item.id} className="px-4 py-3">
                    <div className="d-flex justify-content-between gap-2 flex-wrap">
                      <h2 className="fs-6 fw-semibold mb-1">{item.title}</h2>
                      <span className="text-secondary small">{formatDate(item.createdAt)}</span>
                    </div>
                    <p className="text-secondary mb-2">{item.message}</p>
                    {!item.read && (
                      <Button size="sm" variant="outline-secondary" disabled={marking} onClick={() => handleMarkRead(item.id)}>
                        Mark as read
                      </Button>
                    )}
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className="px-4 py-4 text-secondary">No notifications yet.</ListGroup.Item>
              )}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

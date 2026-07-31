import { Button, Card, ListGroup, Spinner } from 'react-bootstrap';
import { Bell, CheckCircle2, Clock3, Gift, Sparkles } from 'lucide-react';
import { useGetMyNotificationsQuery, useMarkNotificationReadMutation } from '@/features/notifications/notificationsApi';
import { formatDate } from '@/utils/format';

function iconForType(type: string) {
  if (type.includes('submission') || type.includes('review')) return CheckCircle2;
  if (type.includes('campaign')) return Sparkles;
  if (type.includes('withdrawal') || type.includes('wallet')) return Gift;
  return Clock3;
}

export default function WorkerNotificationsPage() {
  const { data, isLoading } = useGetMyNotificationsQuery();
  const [markRead, { isLoading: marking }] = useMarkNotificationReadMutation();

  async function handleMarkRead(id: string) {
    await markRead({ id }).unwrap();
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <Bell className="text-primary" size={20} />
        <div>
          <p className="text-primary fw-semibold mb-1">Activity center</p>
          <h1 className="fs-3 fw-bold mb-0">Notifications</h1>
        </div>
      </div>
      <p className="text-secondary mb-4">Stay updated on campaigns, approvals, payouts and reminders.</p>

      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="p-4">
              <Spinner animation="border" size="sm" />
            </div>
          ) : (
            <ListGroup variant="flush">
              {data?.items.length ? (
                data.items.map((item) => {
                  const Icon = iconForType(item.type.toLowerCase());
                  const toneClass = item.readAt ? 'bg-secondary-subtle' : 'bg-primary-subtle';
                  const iconClass = item.readAt ? 'text-secondary' : 'text-primary';
                  return (
                    <ListGroup.Item key={item.id} className="px-4 py-3 d-flex gap-3 align-items-start">
                      <div className={`rounded-circle p-2 ${toneClass}`}>
                        <Icon size={16} className={iconClass} />
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between gap-2 flex-wrap">
                          <h2 className="fs-6 fw-semibold mb-1">{item.title}</h2>
                          <span className="text-secondary small">{formatDate(item.createdAt)}</span>
                        </div>
                        <p className="text-secondary mb-2">{item.detail}</p>
                        {!item.readAt && (
                          <Button size="sm" variant="outline-secondary" disabled={marking} onClick={() => handleMarkRead(item.id)}>
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </ListGroup.Item>
                  );
                })
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

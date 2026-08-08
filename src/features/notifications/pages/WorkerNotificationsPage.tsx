import { useMemo, useState } from "react";
import { Badge, Button, Card, ListGroup, Spinner } from "react-bootstrap";
import {
  useGetMyNotificationsQuery,
  useMarkNotificationReadMutation,
} from "@/features/notifications/notificationsApi";
import { formatDate } from "@/utils/format";

export default function WorkerNotificationsPage() {
  const { data, isLoading } = useGetMyNotificationsQuery();
  const [markRead, { isLoading: marking }] = useMarkNotificationReadMutation();
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<number | null>(null);

  const unreadItems = useMemo(
    () => data?.filter((item) => !item.read) ?? [],
    [data],
  );
  const unreadCount = unreadItems.length;

  async function handleMarkRead(id: number) {
    setMarkingId(id);
    try {
      await markRead({ id }).unwrap();
    } finally {
      setMarkingId(null);
    }
  }

  async function handleMarkAllRead() {
    if (!unreadItems.length) return;
    setMarkingAll(true);
    try {
      await Promise.all(
        unreadItems.map((item) => markRead({ id: item.id }).unwrap()),
      );
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <p className="text-primary fw-semibold mb-1">Activity center</p>
          <h1 className="fs-3 fw-bold mb-1">
            Notifications{" "}
            {unreadCount > 0 && (
              <Badge bg="danger" pill className="align-middle fs-6 ms-1">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-secondary mb-0">
            Stay updated on campaigns, approvals, payouts and reminders.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="primary"
            disabled={markingAll || marking}
            onClick={handleMarkAllRead}
          >
            {markingAll ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Marking all...
              </>
            ) : (
              `Mark all as read (${unreadCount})`
            )}
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="p-4 text-center">
              <Spinner animation="border" size="sm" />
            </div>
          ) : (
            <ListGroup variant="flush">
              {data?.length ? (
                data.map((item) => (
                  <ListGroup.Item
                    key={item.id}
                    className="px-4 py-3"
                    style={{
                      backgroundColor: item.read
                        ? "transparent"
                        : "rgba(13, 110, 253, 0.05)",
                      borderLeft: item.read
                        ? "3px solid transparent"
                        : "3px solid #0d6efd",
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    <div className="d-flex justify-content-between gap-2 flex-wrap align-items-start">
                      <div className="d-flex align-items-center gap-2">
                        {!item.read && (
                          <span
                            className="rounded-circle"
                            style={{
                              width: 8,
                              height: 8,
                              backgroundColor: "#0d6efd",
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <h2 className="fs-6 fw-semibold mb-0">{item.title}</h2>
                      </div>
                      <span className="text-secondary small">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-secondary mb-2 mt-1">{item.message}</p>
                    {!item.read && (
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        disabled={markingId === item.id || markingAll}
                        onClick={() => handleMarkRead(item.id)}
                      >
                        {markingId === item.id ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          "Mark as read"
                        )}
                      </Button>
                    )}
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className="px-4 py-5 text-center text-secondary">
                  No notifications yet.
                </ListGroup.Item>
              )}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

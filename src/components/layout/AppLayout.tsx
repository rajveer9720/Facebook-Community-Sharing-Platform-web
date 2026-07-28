import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { signedOut } from '@/features/auth/authSlice';
import { ROUTES } from '@/routes/routePaths';

const workerNavItems = [
  { to: ROUTES.worker.root, label: 'Dashboard', end: true },
  { to: ROUTES.worker.campaigns, label: 'Campaigns', end: false },
  { to: ROUTES.worker.submissions, label: 'Submissions', end: false },
  { to: ROUTES.worker.groups, label: 'My groups', end: false },
  { to: ROUTES.worker.wallet, label: 'Wallet', end: false },
  { to: ROUTES.worker.leaderboard, label: 'Leaderboard', end: false },
];

const adminNavItems = [
  { to: ROUTES.admin.root, label: 'Overview', end: true },
  { to: ROUTES.admin.campaigns, label: 'Campaigns', end: false },
  { to: ROUTES.admin.review, label: 'Review queue', end: false },
  { to: ROUTES.admin.groups, label: 'Groups', end: false },
  { to: ROUTES.admin.withdrawals, label: 'Withdrawals', end: false },
  { to: ROUTES.admin.analytics, label: 'Analytics', end: false },
];

export function AppLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'ADMIN';
  const navItems = isAdmin ? adminNavItems : workerNavItems;

  function handleLogout() {
    dispatch(signedOut());
    navigate(ROUTES.login, { replace: true });
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-body-tertiary">
      <Navbar bg="white" className="border-bottom shadow-sm" expand="md" sticky="top">
        <Container fluid="lg">
          <Navbar.Brand as={Link} to={isAdmin ? ROUTES.admin.root : ROUTES.worker.root} className="fw-bold">
            Facebook Community Sharing
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto">
              {navItems.map((item) => (
                <Nav.Link key={item.to} as={NavLink} to={item.to} end={item.end}>
                  {item.label}
                </Nav.Link>
              ))}
            </Nav>
            <div className="d-flex align-items-center gap-3">
              {user && (
                <span className="text-secondary small">
                  {user.firstName} {user.lastName} &middot; <span className="text-uppercase">{user.role}</span>
                </span>
              )}
              <Button variant="outline-secondary" size="sm" onClick={handleLogout}>
                Sign out
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container fluid="lg" className="flex-grow-1 py-4">
        <Outlet />
      </Container>
    </div>
  );
}

import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button, Container, Nav, Navbar, Offcanvas } from "react-bootstrap";
import {
  Home,
  Briefcase,
  ClipboardList,
  Wallet,
  Trophy,
  Layers3,
  UserCircle2,
  LogOut,
  ShieldAlert,
  Bell,
  Users,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useLogoutMutation } from "@/features/auth/authApi";
import { signedOut } from "@/features/auth/authSlice";
import { ROUTES } from "@/routes/routePaths";
import { BottomNav, type BottomNavItem } from "@/components/layout/BottomNav";
import { readSession } from "@/utils/session";

const workerNavItems = [
  { to: ROUTES.worker.root, label: "Dashboard", end: true, icon: Home },
  {
    to: ROUTES.worker.profile,
    label: "Profile",
    end: false,
    icon: UserCircle2,
  },
  {
    to: ROUTES.worker.campaigns,
    label: "Campaigns",
    end: false,
    icon: Briefcase,
  },
  {
    to: ROUTES.worker.submissions,
    label: "Submissions",
    end: false,
    icon: ClipboardList,
  },
  { to: ROUTES.worker.groups, label: "My groups", end: false, icon: Layers3 },
  { to: ROUTES.worker.wallet, label: "Wallet", end: false, icon: Wallet },
  {
    to: ROUTES.worker.notifications,
    label: "Notifications",
    end: false,
    icon: Bell,
  },
  {
    to: ROUTES.worker.leaderboard,
    label: "Leaderboard",
    end: false,
    icon: Trophy,
  },
];

const adminNavItems = [
  { to: ROUTES.admin.root, label: "Overview", end: true, icon: Home },
  { to: ROUTES.admin.workers, label: "Workers", end: false, icon: Users },
  {
    to: ROUTES.admin.campaigns,
    label: "Campaigns",
    end: false,
    icon: Briefcase,
  },
  {
    to: ROUTES.admin.review,
    label: "Review queue",
    end: false,
    icon: ClipboardList,
  },
  { to: ROUTES.admin.groups, label: "Groups", end: false, icon: Layers3 },
  {
    to: ROUTES.admin.withdrawals,
    label: "Withdrawals",
    end: false,
    icon: Wallet,
  },
  { to: ROUTES.admin.analytics, label: "Analytics", end: false, icon: Trophy },
  {
    to: ROUTES.admin.fraud,
    label: "Fraud desk",
    end: false,
    icon: ShieldAlert,
  },
];

const workerBottomNavItems: BottomNavItem[] = [
  { to: ROUTES.worker.root, label: "Home", icon: Home, end: true },
  { to: ROUTES.worker.profile, label: "Profile", icon: UserCircle2 },
  { to: ROUTES.worker.campaigns, label: "Campaigns", icon: Briefcase },
  { to: ROUTES.worker.submissions, label: "Submissions", icon: ClipboardList },
  { to: ROUTES.worker.wallet, label: "Wallet", icon: Wallet },
  { to: ROUTES.worker.leaderboard, label: "Rank", icon: Trophy },
];

const adminBottomNavItems: BottomNavItem[] = [
  { to: ROUTES.admin.root, label: "Home", icon: Home, end: true },
  { to: ROUTES.admin.campaigns, label: "Campaigns", icon: Briefcase },
  { to: ROUTES.admin.review, label: "Review", icon: ClipboardList },
  { to: ROUTES.admin.fraud, label: "Fraud", icon: ShieldAlert },
  { to: ROUTES.admin.analytics, label: "Analytics", icon: Layers3 },
];

export function AppLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [showProfile, setShowProfile] = useState(false);
  const [logout] = useLogoutMutation();
  const isAdmin = user?.role === "ADMIN";
  const navItems = isAdmin ? adminNavItems : workerNavItems;
  const bottomNavItems = isAdmin ? adminBottomNavItems : workerBottomNavItems;

  async function handleLogout() {
    const refreshToken = readSession()?.refreshToken;
    try {
      await logout(refreshToken ? { refreshToken } : undefined).unwrap();
    } catch {
    }
    setShowProfile(false);
    dispatch(signedOut());
    navigate(ROUTES.login, { replace: true });
  }

  const initials =
    `${user?.firstName?.[0] ?? "U"}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="vh-100 d-flex flex-column bg-body-tertiary">
      <div className="d-flex flex-grow-1" style={{ minHeight: 0 }}>
        <aside
          className="d-none d-md-flex flex-column border-end bg-white p-3"
          style={{ width: 280, height: "100%" }}
        >
          <Link
            to={isAdmin ? ROUTES.admin.root : ROUTES.worker.root}
            className="text-decoration-none text-dark fw-bold fs-5 d-block mb-4"
          >
            Facebook Community Sharing
          </Link>
          <p className="text-secondary small mb-3">Operations workspace</p>
          <Nav className="flex-column gap-1">
            {navItems.map(({ to, label, end, icon: Icon }) => (
              <Nav.Link
                key={to}
                as={NavLink}
                to={to}
                end={end}
                className="rounded-3 px-3 py-2 d-flex align-items-center gap-2 text-dark"
              >
                <Icon size={16} />
                <span>{label}</span>
              </Nav.Link>
            ))}
          </Nav>
        </aside>

        <div
          className="flex-grow-1 d-flex flex-column"
          style={{ minHeight: 0, overflowY: "auto" }}
        >
          <Navbar
            bg="white"
            className="border-bottom shadow-sm"
            expand="md"
            sticky="top"
          >
            <Container fluid="lg">
              <Navbar.Brand
                as={Link}
                to={isAdmin ? ROUTES.admin.root : ROUTES.worker.root}
                className="fw-bold d-flex align-items-center gap-2"
              >
                <span
                  className="rounded-circle bg-dark text-white d-inline-flex align-items-center justify-content-center"
                  style={{ width: 32, height: 32 }}
                >
                  {initials}
                </span>
                <span>Facebook Community Sharing</span>
              </Navbar.Brand>
              <div className="d-flex align-items-center gap-2 ms-auto">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="rounded-circle d-flex align-items-center justify-content-center p-2"
                  onClick={() => setShowProfile(true)}
                >
                  <UserCircle2 size={16} />
                </Button>
              </div>
            </Container>
          </Navbar>

          <Container fluid="lg" className="flex-grow-1 py-4 pb-5 pb-md-4">
            <Outlet />
          </Container>
        </div>
      </div>

      <Offcanvas
        show={showProfile}
        onHide={() => setShowProfile(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Profile</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="d-flex flex-column gap-3">
            <div className="rounded-4 bg-light p-4 text-center">
              <div
                className="rounded-circle bg-dark text-white mx-auto d-flex align-items-center justify-content-center fw-bold"
                style={{ width: 64, height: 64 }}
              >
                {initials}
              </div>
              <h3 className="fs-5 fw-semibold mt-3 mb-1">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-secondary mb-0">{user?.email}</p>
              <span className="badge rounded-pill bg-primary-subtle text-primary-emphasis mt-2 text-uppercase">
                {user?.role}
              </span>
            </div>

            <div className="border rounded-4 p-3">
              <p className="fw-semibold mb-2">Account details</p>
              <ul className="list-unstyled small text-secondary mb-0">
                <li className="mb-2">
                  Role:{" "}
                  <span className="text-dark fw-semibold">
                    {user?.role === "ADMIN" ? "Administrator" : "Worker"}
                  </span>
                </li>
                <li className="mb-2">
                  Status: <span className="text-dark fw-semibold">Active</span>
                </li>
                <li>
                  Workspace:{" "}
                  <span className="text-dark fw-semibold">
                    Community sharing platform
                  </span>
                </li>
              </ul>
            </div>

            <Button
              variant="outline-secondary"
              className="w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Sign out
            </Button>
            {!isAdmin && (
              <Link
                to={ROUTES.worker.profile}
                className="btn btn-dark w-100"
                onClick={() => setShowProfile(false)}
              >
                Open full profile
              </Link>
            )}
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      <BottomNav items={bottomNavItems} />
    </div>
  );
}

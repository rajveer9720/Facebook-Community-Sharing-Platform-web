import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Container,
  Form as BsForm,
} from "react-bootstrap";
import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  useForgotPasswordMutation,
  useLoginMutation,
  useRegisterMutation,
  useResetPasswordMutation,
} from "./authApi";
import { sessionEstablished, sessionExpiredNoticeDismissed } from "./authSlice";
import { ROUTES } from "@/routes/routePaths";
import type { UserRole } from "@/types/common";

interface LoginFormValues {
  email: string;
  password: string;
}

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialValues: LoginFormValues = {
  email: "",
  password: "",
};

const registerInitialValues: RegisterFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

const registerValidationSchema = Yup.object({
  firstName: Yup.string().trim().required("First name is required"),
  lastName: Yup.string().trim().required("Last name is required"),
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

interface LoginPageProps {
  audience?: UserRole | "ALL";
}

const loginContent: Record<
  UserRole | "ALL",
  { badge: string; title: string; button: string }
> = {
  ALL: {
    badge: "Secure sign in",
    title: "Access your dashboard",
    button: "Sign in",
  },
  WORKER: {
    badge: "Worker sign in",
    title: "Access worker dashboard",
    button: "Sign in as worker",
  },
  ADMIN: {
    badge: "Admin sign in",
    title: "Access admin dashboard",
    button: "Sign in as admin",
  },
};

export default function LoginPage({ audience = "ALL" }: LoginPageProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const sessionExpired = useAppSelector((state) => state.auth.sessionExpired);
  const [login] = useLoginMutation();
  const [register] = useRegisterMutation();
  const [forgotPassword, { isLoading: isForgotSubmitting }] =
    useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetSubmitting }] =
    useResetPasswordMutation();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [formError, setFormError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetPasswordMessage, setResetPasswordMessage] = useState("");
  const [resetPasswordError, setResetPasswordError] = useState("");
  const content = loginContent[audience];

  async function handleSubmit(
    values: LoginFormValues,
    helpers: FormikHelpers<LoginFormValues>,
  ) {
    setFormError("");
    try {
      const result = await login(values).unwrap();

      if (audience !== "ALL" && result.user.role !== audience) {
        setFormError(
          `This account is ${result.user.role.toLowerCase()} type. Please use the correct login page.`,
        );
        return;
      }

      dispatch(sessionEstablished(result));
      navigate(
        result.user.role === "WORKER" ? ROUTES.worker.root : ROUTES.admin.root,
        { replace: true },
      );
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      setFormError(message ?? "Login failed. Please try again.");
    } finally {
      helpers.setSubmitting(false);
    }
  }

  async function handleRegisterSubmit(
    values: RegisterFormValues,
    helpers: FormikHelpers<RegisterFormValues>,
  ) {
    setFormError("");
    try {
      const result = await register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
      }).unwrap();

      dispatch(sessionEstablished(result));
      navigate(
        result.user.role === "WORKER" ? ROUTES.worker.root : ROUTES.admin.root,
        { replace: true },
      );
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      setFormError(message ?? "Registration failed. Please try again.");
    } finally {
      helpers.setSubmitting(false);
    }
  }

  async function handleForgotPasswordSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setForgotPasswordError("");
    setForgotPasswordMessage("");

    if (!forgotEmail.trim()) {
      setForgotPasswordError("Enter your registered email address.");
      return;
    }

    try {
      const response = await forgotPassword({
        email: forgotEmail.trim(),
      }).unwrap();
      setForgotPasswordMessage(
        response.resetToken
          ? `${response.message}. Reset token: ${response.resetToken}`
          : response.message,
      );
      if (response.resetToken) {
        setResetToken(response.resetToken);
      }
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      setForgotPasswordError(
        message ?? "Unable to process forgot password right now.",
      );
    }
  }

  async function handleResetPasswordSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setResetPasswordError("");
    setResetPasswordMessage("");

    if (!resetToken.trim() || !newPassword) {
      setResetPasswordError("Enter the reset token and a new password.");
      return;
    }

    try {
      const response = await resetPassword({
        resetToken: resetToken.trim(),
        newPassword,
      }).unwrap();
      setResetPasswordMessage(response.message);
      setNewPassword("");
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      setResetPasswordError(message ?? "Unable to reset password right now.");
    }
  }

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <Card
        className="border-0 shadow-sm rounded-4"
        style={{ maxWidth: 440, width: "100%" }}
      >
        <Card.Body className="p-4 p-sm-5">
          <p className="text-primary fw-semibold mb-1">{content.badge}</p>
          <h1 className="fs-3 fw-bold mb-4">{content.title}</h1>

          {sessionExpired && (
            <Alert
              variant="warning"
              className="py-2 small"
              dismissible
              onClose={() => dispatch(sessionExpiredNoticeDismissed())}
            >
              Your session has expired. Please sign in again.
            </Alert>
          )}

          {audience === "WORKER" && (
            <div className="d-flex gap-2 mb-3">
              <Button
                type="button"
                variant={authMode === "login" ? "primary" : "outline-primary"}
                size="sm"
                onClick={() => {
                  setAuthMode("login");
                  setFormError("");
                }}
              >
                Login
              </Button>
              <Button
                type="button"
                variant={
                  authMode === "register" ? "primary" : "outline-primary"
                }
                size="sm"
                onClick={() => {
                  setAuthMode("register");
                  setFormError("");
                  setShowForgotPassword(false);
                }}
              >
                Create account
              </Button>
            </div>
          )}

          {(audience !== "WORKER" || authMode === "login") && (
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form noValidate>
                  <BsForm.Group className="mb-3" controlId="email">
                    <BsForm.Label className="fw-semibold small">
                      Email
                    </BsForm.Label>
                    <Field name="email" type="email" as={BsForm.Control} />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-danger small mt-1"
                    />
                  </BsForm.Group>

                  <BsForm.Group className="mb-4" controlId="password">
                    <BsForm.Label className="fw-semibold small">
                      Password
                    </BsForm.Label>
                    <Field
                      name="password"
                      type="password"
                      as={BsForm.Control}
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-danger small mt-1"
                    />
                  </BsForm.Group>

                  {formError && (
                    <Alert variant="danger" className="py-2 small">
                      {formError}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 fw-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing in…" : content.button}
                  </Button>

                  {audience === "ALL" && (
                    <p className="mt-3 text-secondary small mb-0">
                      Use your registered account credentials to access your
                      workspace.
                    </p>
                  )}

                  {audience !== "ALL" && (
                    <p className="mt-3 mb-0 small">
                      <Link
                        to={
                          audience === "WORKER"
                            ? ROUTES.loginAdmin
                            : ROUTES.loginWorker
                        }
                      >
                        Switch to {audience === "WORKER" ? "admin" : "worker"}{" "}
                        login
                      </Link>
                    </p>
                  )}

                  <div className="mt-3 d-flex gap-3 flex-wrap small">
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={() => setShowForgotPassword((value) => !value)}
                    >
                      Forgot password?
                    </button>
                  </div>

                  {showForgotPassword && (
                    <div className="mt-3 border rounded-3 p-3 bg-light">
                      <p className="mb-2 small fw-semibold">Forgot password</p>
                      <BsForm onSubmit={handleForgotPasswordSubmit}>
                        <BsForm.Group
                          className="mb-2"
                          controlId="forgotPasswordEmail"
                        >
                          <BsForm.Label className="small">
                            Registered email
                          </BsForm.Label>
                          <BsForm.Control
                            type="email"
                            value={forgotEmail}
                            onChange={(event) =>
                              setForgotEmail(event.target.value)
                            }
                            placeholder="you@example.com"
                          />
                        </BsForm.Group>
                        {forgotPasswordError && (
                          <Alert
                            variant="danger"
                            className="py-2 px-3 small mb-2"
                          >
                            {forgotPasswordError}
                          </Alert>
                        )}
                        {forgotPasswordMessage && (
                          <Alert
                            variant="success"
                            className="py-2 px-3 small mb-2"
                          >
                            {forgotPasswordMessage}
                          </Alert>
                        )}
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isForgotSubmitting}
                        >
                          {isForgotSubmitting ? "Sending…" : "Send reset token"}
                        </Button>
                      </BsForm>

                      <hr className="my-3" />

                      <p className="mb-2 small fw-semibold">Reset password</p>
                      <BsForm onSubmit={handleResetPasswordSubmit}>
                        <BsForm.Group
                          className="mb-2"
                          controlId="resetToken"
                        >
                          <BsForm.Label className="small">
                            Reset token
                          </BsForm.Label>
                          <BsForm.Control
                            type="text"
                            value={resetToken}
                            onChange={(event) =>
                              setResetToken(event.target.value)
                            }
                            placeholder="Paste the reset token"
                          />
                        </BsForm.Group>
                        <BsForm.Group
                          className="mb-2"
                          controlId="newPassword"
                        >
                          <BsForm.Label className="small">
                            New password
                          </BsForm.Label>
                          <BsForm.Control
                            type="password"
                            value={newPassword}
                            onChange={(event) =>
                              setNewPassword(event.target.value)
                            }
                            placeholder="At least 8 characters"
                          />
                        </BsForm.Group>
                        {resetPasswordError && (
                          <Alert
                            variant="danger"
                            className="py-2 px-3 small mb-2"
                          >
                            {resetPasswordError}
                          </Alert>
                        )}
                        {resetPasswordMessage && (
                          <Alert
                            variant="success"
                            className="py-2 px-3 small mb-2"
                          >
                            {resetPasswordMessage}
                          </Alert>
                        )}
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isResetSubmitting}
                        >
                          {isResetSubmitting ? "Resetting…" : "Reset password"}
                        </Button>
                      </BsForm>
                    </div>
                  )}
                </Form>
              )}
            </Formik>
          )}

          {audience === "WORKER" && authMode === "register" && (
            <Formik
              initialValues={registerInitialValues}
              validationSchema={registerValidationSchema}
              onSubmit={handleRegisterSubmit}
            >
              {({ isSubmitting }) => (
                <Form noValidate>
                  <BsForm.Group className="mb-3" controlId="firstName">
                    <BsForm.Label className="fw-semibold small">
                      First name
                    </BsForm.Label>
                    <Field name="firstName" type="text" as={BsForm.Control} />
                    <ErrorMessage
                      name="firstName"
                      component="div"
                      className="text-danger small mt-1"
                    />
                  </BsForm.Group>

                  <BsForm.Group className="mb-3" controlId="lastName">
                    <BsForm.Label className="fw-semibold small">
                      Last name
                    </BsForm.Label>
                    <Field name="lastName" type="text" as={BsForm.Control} />
                    <ErrorMessage
                      name="lastName"
                      component="div"
                      className="text-danger small mt-1"
                    />
                  </BsForm.Group>

                  <BsForm.Group className="mb-3" controlId="registerEmail">
                    <BsForm.Label className="fw-semibold small">
                      Email
                    </BsForm.Label>
                    <Field name="email" type="email" as={BsForm.Control} />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-danger small mt-1"
                    />
                  </BsForm.Group>

                  <BsForm.Group className="mb-3" controlId="registerPassword">
                    <BsForm.Label className="fw-semibold small">
                      Password
                    </BsForm.Label>
                    <Field
                      name="password"
                      type="password"
                      as={BsForm.Control}
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-danger small mt-1"
                    />
                  </BsForm.Group>

                  <BsForm.Group className="mb-4" controlId="confirmPassword">
                    <BsForm.Label className="fw-semibold small">
                      Confirm password
                    </BsForm.Label>
                    <Field
                      name="confirmPassword"
                      type="password"
                      as={BsForm.Control}
                    />
                    <ErrorMessage
                      name="confirmPassword"
                      component="div"
                      className="text-danger small mt-1"
                    />
                  </BsForm.Group>

                  {formError && (
                    <Alert variant="danger" className="py-2 small">
                      {formError}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 fw-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Creating account…"
                      : "Create worker account"}
                  </Button>

                  <p className="mt-3 mb-0 small">
                    <Link to={ROUTES.loginAdmin}>
                      Admin account? Sign in from admin login
                    </Link>
                  </p>
                </Form>
              )}
            </Formik>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

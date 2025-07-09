import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, db, googleProvider } from "../../firebase/config";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Form as BForm,
  Alert,
} from "react-bootstrap";
import { FcGoogle } from "react-icons/fc";
import './AuthPage.css'

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

  const toggleForm = () => {
    setFormError("");
    setIsRegister((prev) => !prev);
  };

  const initialValues = {
    displayName: "",
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    displayName: isRegister
      ? Yup.string().min(2, "Too short").required("Name is required")
      : Yup.string(),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Minimum 6 characters")
      .required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setFormError("");
    try {
      if (isRegister) {
        const res = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        await updateProfile(res.user, {
          displayName: values.displayName,
        });
        await setDoc(doc(db, "users", res.user.uid), {
          uid: res.user.uid,
          displayName: values.displayName,
          email: values.email,
        });
      } else {
        await signInWithEmailAndPassword(auth, values.email, values.password);
      }
      navigate("/");
    } catch (err) {
      setFormError(err.message);
    }
    setSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        },
        { merge: true }
      );
      navigate("/");
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
  <div className="auth-container">
    {/* Left: Welcome Panel */}
    <div className="auth-left">
      <div className="welcome-content">
        <h1>ChartBox</h1>
        <p className="subtitle">Connecting brains one bug at a time....</p>
        <ul className="funny-lines">
          <li>Welcome to WeChartBox</li>
          <li>Free Messages to All Friends and make messaging fun with friends</li>
        </ul>
      </div>
    </div>

    {/* Right: Login/Register Form */}
    <div className="auth-right">
      <div className="auth-card">
        <h3 className="text-center mb-3">
          {isRegister ? "Register" : "Login"}
        </h3>

        {formError && <Alert variant="danger">{formError}</Alert>}

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              {isRegister && (
                <BForm.Group className="mb-3">
                  <BForm.Label>Full Name</BForm.Label>
                  <Field
                    name="displayName"
                    className="form-control"
                    placeholder="Enter your name"
                  />
                  <ErrorMessage
                    name="displayName"
                    component="div"
                    className="text-danger"
                  />
                </BForm.Group>
              )}

              <BForm.Group className="mb-3">
                <BForm.Label>Email address</BForm.Label>
                <Field
                  name="email"
                  type="email"
                  className="form-control"
                  placeholder="Enter email"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-danger"
                />
              </BForm.Group>

              <BForm.Group className="mb-3">
                <BForm.Label>Password</BForm.Label>
                <Field
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder="Enter password"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-danger"
                />
              </BForm.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100"
                disabled={isSubmitting}
              >
                {isRegister ? "Sign Up" : "Log In"}
              </Button>
            </Form>
          )}
        </Formik>

        <div className="text-center my-3">
          <small>
            {isRegister ? "Already have an account?" : "New here?"}{" "}
            <span className="switch-link" onClick={toggleForm}>
              {isRegister ? "Login" : "Register"}
            </span>
          </small>
        </div>

        <hr />

        <Button
          variant="outline-danger"
          className="w-100"
          onClick={handleGoogleLogin}
        >
          <FcGoogle size={20} className="me-2" />
          Sign in with Google
        </Button>
      </div>
    </div>
  </div>
);

};

export default AuthPage;

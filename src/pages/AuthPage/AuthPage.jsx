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
import { Button, Form as BForm, Alert } from "react-bootstrap";
import { FcGoogle } from "react-icons/fc";
import './AuthPage.css';

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
    password: Yup.string().min(6, "Minimum 6 characters").required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setFormError("");
    try {
      if (isRegister) {
        const res = await createUserWithEmailAndPassword(auth, values.email, values.password);
        await updateProfile(res.user, { displayName: values.displayName });
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
    <div className="auth-container-split">
      {/* Left Side: Welcome Text */}
      <div className="auth-left-split">
        <div className="welcome-text">
          <h1 className="desktop-heading">ChatBox</h1>
          <p className="subtitle">Welcome to ChatBox — where every message builds a connection.</p>
          <ul className="funny-lines">
            <li>Connecting you securely…</li>
            <li>Crafting the perfect place to talk…</li>
            <li>No messages yet. Start a conversation worth remembering.</li>
          </ul>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="auth-right-split">
        {/* Mobile heading */}
        <div className="mobile-app-name">ChatBox</div>

        <div className="auth-form">
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
                    <Field
                      name="displayName"
                      className="form-control"
                      placeholder="Full Name"
                    />
                    <ErrorMessage name="displayName" component="div" className="text-danger" />
                  </BForm.Group>
                )}

                <BForm.Group className="mb-3">
                  <Field
                    name="email"
                    type="email"
                    className="form-control"
                    placeholder="Email"
                  />
                  <ErrorMessage name="email" component="div" className="text-danger" />
                </BForm.Group>

                <BForm.Group className="mb-3">
                  <Field
                    name="password"
                    type="password"
                    className="form-control"
                    placeholder="Password"
                  />
                  <ErrorMessage name="password" component="div" className="text-danger" />
                </BForm.Group>

                <Button variant="primary" type="submit" className="w-100" disabled={isSubmitting}>
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

          <Button variant="outline-danger" className="w-100" onClick={handleGoogleLogin}>
            <FcGoogle size={20} className="me-2" />
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;


import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Row,
  Col,
} from "reactstrap";

import { useForm } from "react-hook-form";
import api from "api/axios";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid,isSubmitting },
  } = useForm({
mode: "onChange",
  reValidateMode: "onChange",
});

const onSubmit = async (data) => {
  try {
  const res = await api.post("/login", data);
  toast.success("Login successful");
  localStorage.setItem("token", res.data.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.data.user)||"");
  navigate("/admin/index");

} catch (error) {
  toast.error(error.response?.data?.message || "Login failed");
}
};

  return (
    <>
      <Col lg="5" md="7">
        <Card className="bg-secondary shadow border-0">
          <CardHeader className="bg-transparent pb-5">
            <div className="text-muted text-center mt-2 mb-3">
              <small>Sign in with</small>
            </div>
            <div className="btn-wrapper text-center">
              <Button
                className="btn-neutral btn-icon"
                color="default"
                href="#pablo"
                onClick={(e) => e.preventDefault()}
              >
                <span className="btn-inner--icon">
                  <img
                    alt="..."
                    src={
                      require("../../assets/img/icons/common/github.svg")
                        .default
                    }
                  />
                </span>
                <span className="btn-inner--text">Github</span>
              </Button>
              <Button
                className="btn-neutral btn-icon"
                color="default"
                href="#pablo"
                onClick={(e) => e.preventDefault()}
              >
                <span className="btn-inner--icon">
                  <img
                    alt="..."
                    src={
                      require("../../assets/img/icons/common/google.svg")
                        .default
                    }
                  />
                </span>
                <span className="btn-inner--text">Google</span>
              </Button>
            </div>
          </CardHeader>
          <CardBody className="px-lg-5 py-lg-5">
            <div className="text-center text-muted mb-4">
              <small>Or sign in with credentials</small>
            </div>
<Form role="form" onSubmit={handleSubmit(onSubmit)}>
  {/* Email */}
  <FormGroup className="mb-3">
    <InputGroup
      className={`input-group-alternative ${
        errors.email ? "is-invalid" : ""
      }`}
    >
      <InputGroupAddon addonType="prepend">
        <InputGroupText>
          <i className="ni ni-email-83" />
        </InputGroupText>
      </InputGroupAddon>

      <input
      className={`form-control ${errors.email ? "is-invalid":""}`}
        placeholder="Email"
        type="email"
        name="email"
        autoComplete="new-email"
        invalid={!!errors.email}
        {...register("email", {
          required: "Email is required",
          pattern: {
            value: /^\S+@\S+$/i,
            message: "Enter a valid email",
          },
        })}
      />
    </InputGroup>

    {errors.email && (
      <div className="invalid-feedback d-block">
        {errors.email.message}
      </div>
    )}
  </FormGroup>

  {/* Password */}
  <FormGroup>
    <InputGroup
      className={`input-group-alternative ${
        errors.password ? "is-invalid" : ""
      }`}
    >
      <InputGroupAddon addonType="prepend">
        <InputGroupText>
          <i className="ni ni-lock-circle-open" />
        </InputGroupText>
      </InputGroupAddon>

      <input
        placeholder="Password"
        className={`form-control ${errors.password ? "is-invalid" : ""}`}
        type="password"
        name="password"
        autoComplete="new-password"
        invalid={!!errors.password}
        {...register("password", {
          required: "Password is required",
          minLength: {
            value: 6,
            message: "Minimum 6 characters",
          },
        })}
      />
    </InputGroup>

    {errors.password && (
      <div className="invalid-feedback d-block">
        {errors.password.message}
      </div>
    )}
  </FormGroup>

  {/* Remember Me */}
  <div className="custom-control custom-control-alternative custom-checkbox">
    <input
      className="custom-control-input"
      id="customCheckLogin"
      type="checkbox"
      {...register("remember")}
    />
    <label
      className="custom-control-label"
      htmlFor="customCheckLogin"
    >
      <span className="text-muted">Remember me</span>
    </label>
  </div>

  {/* Submit */}
  <div className="text-center">
<Button
  className="my-4"
  color="primary"
  type="submit"
  disabled={!isValid || isSubmitting}
>
  {isSubmitting ? "Signing in..." : "Sign in"}
</Button>
  </div>
</Form>
          </CardBody>
        </Card>
        <Row className="mt-3">
          <Col xs="6">
            <a
              className="text-light"
              href="#pablo"
              onClick={(e) => e.preventDefault()}
            >
              <small>Forgot password?</small>
            </a>
          </Col>
          <Col className="text-right" xs="6">
            <a
              className="text-light"
              href="#pablo"
              onClick={(e) => e.preventDefault()}
            >
              <small>Create new account</small>
            </a>
          </Col>
        </Row>
      </Col>
    </>
  );
};

export default Login;

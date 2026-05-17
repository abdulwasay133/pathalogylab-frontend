import { Container, Row, Col } from "reactstrap";

const UserHeader = () => {
  return (
    <div
      className="header pb-8 pt-6 pt-md-7 d-flex align-items-center "
        style={{
    position: "relative",
    backgroundImage: `
      linear-gradient(
        rgba(0, 0, 0, 0.55),
        rgba(0, 0, 0, 0.55)
      ),
      url('/images/one.png')
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    overflow: "hidden",
  }}
    >
      <Container className="d-flex align-items-center" fluid >
        <Row >
          <Col style={{ width: "100%" }}>
            <div className="d-flex align-items-center mb-3" style={{ gap: 14 }}>
              <span
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "rgba(255,255,255,.2)",
                  border: "1px solid rgba(255,255,255,.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  color: "#fff",
                }}
              >
                <i className="fa-solid fa-gear" />
              </span>
              <div>
                <h1 className="mb-1" style={{ fontWeight: 800, fontSize: "1.75rem", color: "#fff" }}>
                  Laboratory Settings
                </h1>
                <p className="mt-0 mb-0" style={{ color: "rgba(255,255,255,.85)", fontSize: 14 }}>
                  Manage lab profile, branding, and security preferences
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UserHeader;

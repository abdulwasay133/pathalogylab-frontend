import { Card, CardBody, CardHeader, Container, Row } from "reactstrap";
import T from "theme/tokens";
import { getVariant } from "theme/pageVariants";

/**
 * Standard page chrome: gradient header spacer + card with title row.
 * Layout only — does not change business logic.
 */
export function PageHeader({ icon, variant = "primary", title, subtitle, badge, actions }) {
  const v = getVariant(variant);
  return (
    <div className="lims-page-toolbar">
      <div className="d-flex align-items-center" style={{ gap: 12, minWidth: 0 }}>
        <span
          className="lims-page-icon"
          style={{ background: v.gradient, boxShadow: "0 4px 14px rgba(59,108,244,.25)" }}
        >
          <i className={`${icon} text-white`} />
        </span>
        <div style={{ minWidth: 0 }}>
          <h3 className="mb-0 lims-page-title">{title}</h3>
          {subtitle && <p className="mb-0 lims-page-subtitle">{subtitle}</p>}
        </div>
      </div>
      {(badge != null && badge !== "") || actions ? (
        <div className="d-flex align-items-center flex-wrap" style={{ gap: 10 }}>
          {badge != null && badge !== "" && (
            <span
              className="lims-count-badge"
              style={{
                background: v.badgeBg,
                color: v.badgeColor,
                border: `1px solid ${v.badgeBorder}`,
              }}
            >
              {badge}
            </span>
          )}
          {actions}
        </div>
      ) : null}
    </div>
  );
}

export function PageCard({
  icon,
  variant = "primary",
  title,
  subtitle,
  badge,
  headerActions,
  children,
  bodyClassName = "",
  bodyStyle,
  flushBody = false,
  className = "",
}) {
  return (
    <Card className={`lims-page-card shadow border-0 ${className}`}>
      {(title || subtitle || icon) && (
        <CardHeader className="lims-page-card-header border-0">
          <PageHeader
            icon={icon}
            variant={variant}
            title={title}
            subtitle={subtitle}
            badge={badge}
            actions={headerActions}
          />
        </CardHeader>
      )}
      <CardBody
        className={`${flushBody ? "lims-page-card-body-flush" : "lims-page-card-body"} ${bodyClassName}`}
        style={bodyStyle}
      >
        {children}
      </CardBody>
    </Card>
  );
}

export default function PageShell({
  variant = "primary",
  icon,
  title,
  subtitle,
  badge,
  headerActions,
  children,
  flushBody = false,
  bodyStyle,
}) {
  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8" />
      <Container className="mt--9" fluid>
        <Row>
          <div className="col">
            <PageCard
              icon={icon}
              variant={variant}
              title={title}
              subtitle={subtitle}
              badge={badge}
              headerActions={headerActions}
              flushBody={flushBody}
              bodyStyle={bodyStyle}
            >
              {children}
            </PageCard>
          </div>
        </Row>
      </Container>
    </>
  );
}

export function PageToolbarCard({ children, className = "" }) {
  return (
    <Card className={`lims-page-card shadow border-0 mb-4 ${className}`}>
      <CardBody className="lims-toolbar-card-body">{children}</CardBody>
    </Card>
  );
}

export const searchInputStyle = {
  borderRadius: T.radius.md,
  border: `1px solid ${T.colors.border}`,
  padding: "9px 12px 9px 36px",
  fontSize: 13,
  color: T.colors.text,
  outline: "none",
  background: "#f8fafc",
  width: 240,
  transition: "border .15s, box-shadow .15s, background .15s",
};

export const SearchIconWrap = ({ children }) => (
  <span
    style={{
      position: "absolute",
      left: 12,
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: 13,
      color: T.colors.textMuted,
      pointerEvents: "none",
    }}
  >
    {children}
  </span>
);

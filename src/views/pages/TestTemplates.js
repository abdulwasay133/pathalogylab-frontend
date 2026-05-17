import InvoiceTemplateDesigner from "components/InvoiceTemplateDesigner";
import { PageHeader } from "components/layout/PageShell";
import { Card, CardBody, Container } from "reactstrap";

const TestTemplates = () => {
  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8" />
      <Container className="mt--9 lims-template-page" fluid>
        <Card className="lims-page-card shadow border-0 mb-3">
          <CardBody className="lims-page-card-header py-3">
            <PageHeader
              icon="fa-solid fa-file-lines"
              variant="template"
              title="Template Designer"
              subtitle="Design and customize lab report & invoice templates"
            />
          </CardBody>
        </Card>

        <Card className="lims-page-card shadow border-0" style={{ flex: 1, minHeight: "72vh" }}>
          <CardBody className="p-0" style={{ height: "calc(100vh - 220px)", minHeight: 560 }}>
            <InvoiceTemplateDesigner
              className="new"
              onSave={(template) =>
                fetch("/api/test", {
                  method: "POST",
                  body: JSON.stringify(template),
                })
              }
            />
          </CardBody>
        </Card>
      </Container>
    </>
  );
};

export default TestTemplates;

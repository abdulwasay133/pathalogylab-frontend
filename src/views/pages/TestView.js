import React from "react";
import InvoiceTemplateDesigner from "components/InvoiceTemplateDesigner";
import { useParams } from "react-router-dom";

const TestView = () => {
    const { id } = useParams();

  console.log("Null",id);
  return (
    <>
      <div className="header bg-gradient-info pt-6">
        <div className="templateDesigner">
            <InvoiceTemplateDesigner className="new" id={id}
              onSave={(template) => fetch("/api/templates", {
                method: "POST",
                body: JSON.stringify(template)
              })}
            />
        </div>
      </div>


    </>
  );
};

export default TestView;



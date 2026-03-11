import React from "react";
import InvoiceTemplateDesigner from "components/InvoiceTemplateDesigner";

const Index = () => {

  return (
    <>
      <div className="header bg-gradient-info pt-6">
        <div className="templateDesigner">
            <InvoiceTemplateDesigner className="new" 
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

export default Index;



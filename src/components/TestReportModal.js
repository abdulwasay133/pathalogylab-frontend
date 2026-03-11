import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from "reactstrap";
import api from "api/axios";

export default function TestReportModal({ test, isOpen, toggle,isEdit }) {

  const [html, setHtml] = useState("");

  const getTest = async () => {
    console.log('edit test')
    try {
      const res = await api.get(`/patient-tests/${test.id}`);
      console.log(res.data.data.html)
      setHtml(res.data.data.html);
    } catch (error) {
      console.error("Failed to fetch test", error);
    }
  }
  useEffect(() => {
    // console.log(isEdit);
    if(isEdit === false){
        if(!test) return;
      setHtml(test.test.html);
    }else{
        getTest();
    }
  }, [test]);

  if (!test) return null;

  const handleSave = async () => {
    try {
        const report = document.getElementById("report").innerHTML
        console.log(report);
      const res = await api.put(`/patient-tests/${test.id}`, {
        html: report
      });
      console.log('response',res);

      alert("Report saved successfully");

      toggle();

    } catch (error) {
      console.error("Failed to save report", error);
      
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">

      <ModalHeader toggle={toggle}>
        Test Report - {test?.test?.test_name}
      </ModalHeader>

      <ModalBody>

        <div className="p-3 border">

          <h4 className="text-center mb-4">
            {test?.test?.test_name} Report
          </h4>

          <hr />

          {/* Editable HTML */}
         
          {/* Editable HTML */}
          {/* <div
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(test?.test?.html)
  }}
/> */}
<div id="report">
          <div
            dangerouslySetInnerHTML={{
              __html: html
            }}
          />

        </div>
        </div>

      </ModalBody>

      <ModalFooter>

        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>

        <Button color="primary" onClick={handleSave}>
          Save
        </Button>

      </ModalFooter>

    </Modal>
  );
}
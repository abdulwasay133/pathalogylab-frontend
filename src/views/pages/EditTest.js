import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardBody, CardHeader, Container, Row } from "reactstrap";
import "./EditTest.css";
import api from "api/axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

function EditTest() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { register, handleSubmit, reset } = useForm({
    mode: "onChange",
  });

  // Fetch test data
  const getTest = async () => {
    try {
      const res = await api.get(`/test/${id}`);
      reset(res.data.data); // populate form
      console.log('ok');
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (id) {
      getTest();
    }
  }, [id]);

  // Update API
  const onSubmit = async (data) => {
    console.log("record",data);
    try {
        const payload = {
            test_name: data.test_name,
            test_short_name: data.test_short_name,
            amount: data.amount

        }
      const res = await api.put(`/test/${id}`, data);
      console.log(res);
      if(res.status===200){
      toast.success(res.data.message);
      navigate("/admin/test-management");
      }else{
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8"></div>

      <Container className="mt--9" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <h3 className="mb-0">Edit Test Details {id}</h3>
              </CardHeader>

              <CardBody>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="row">

                    {/* Test Name */}
                    <div className="col-md-6">
                      <div className="mt-4">
                        <label className="form-label">Test Name</label>
                        <input
                          type="text"
                          className="form-control"
                          {...register("test_name")}
                        />
                      </div>
                    </div>

                    {/* Test Short Name */}
                    <div className="col-md-6">
                      <div className="mt-4">
                        <label className="form-label">Test Short Name</label>
                        <input
                          type="text"
                          className="form-control"
                          {...register("test_short_name")}
                        />
                      </div>
                    </div>

                    {/* Test ID */}
                    <div className="col-md-4">
                      <div className="mt-4">
                        <label className="form-label">Test ID</label>
                        <input
                          type="text"
                          className="form-control"
                          readOnly
                          {...register("test_id")}
                        />
                      </div>
                    </div>

                    {/* Test Price */}
                    <div className="col-md-4">
                      <div className="mt-4">
                        <label className="form-label">Test Price</label>
                        <input
                          type="text"
                          className="form-control"
                          {...register("amount")}
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-md-4">
                      <div className="mt-4">
                        <div className="mx-4">
                          <label>Status</label>
                        </div>

                        <label className="switch mt-1 mx-4">
                          <input type="checkbox" {...register("is_active")} />
                          <span className="slider"></span>
                        </label>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="mx-auto mt-4">
                      <button
                        type="submit"
                        className="btn btn-primary mt-4 px-5 py-2"
                      >
                        Update
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate("/admin/test-management")
                        }
                        className="btn btn-outline-secondary mt-4 px-5 py-2"
                      >
                        Cancel
                      </button>
                    </div>

                  </div>
                </form>
              </CardBody>
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
}

export default EditTest;
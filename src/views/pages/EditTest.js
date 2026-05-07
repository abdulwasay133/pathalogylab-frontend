import api from "api/axios";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Card, CardBody, CardHeader, Container, Row } from "reactstrap";

function EditTest() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, isDirty },
  } = useForm({ mode: "onChange" });

  const isActive = watch("is_active");

  /* ── fetch test ── */
  const getTest = async () => {
    try {
      const res = await api.get(`/test/${id}`);
      reset(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load test data.");
    }
  };

  useEffect(() => {
    if (id) getTest();
  }, [id]);

  /* ── submit ── */
  const onSubmit = async (data) => {
    try {
      const res = await api.put(`/test/${id}`, {
        test_name:       data.test_name,
        test_short_name: data.test_short_name,
        amount:          data.amount,
        is_active:       data.is_active ? 1 : 0,
      });
      if (res.status === 200) {
        toast.success(res.data.message || "Test updated successfully.");
        navigate("/admin/test-management");
      } else {
        toast.error(res.data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update test.");
    }
  };

  /* ── field style ── */
  const inputStyle = {
    borderRadius: 8,
    border: "1px solid #e0e6ed",
    padding: "10px 14px",
    fontSize: 14,
    color: "#32325d",
    background: "#fff",
    width: "100%",
    outline: "none",
    transition: "border .15s, box-shadow .15s",
  };

  const readonlyStyle = {
    ...inputStyle,
    background: "#f8f9fe",
    color: "#8898aa",
    cursor: "not-allowed",
  };

  /* ── render ── */
  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8" />

      <Container className="mt--9" fluid>
        <Row>
          <div className="col">
            <Card
              className="shadow border-0"
              style={{ borderRadius: 16, overflow: "hidden" }}
            >
              {/* ── Header ── */}
              <CardHeader
                className="bg-white border-0"
                style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f0f0f0" }}
              >
                <div className="d-flex align-items-center justify-content-between flex-wrap"
                  style={{ gap: 12 }}>

                  <div className="d-flex align-items-center" style={{ gap: 10 }}>
                    <span style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: "linear-gradient(135deg,#fb6340,#fbb140)",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 18,
                    }}>
                      <i className="fa-solid fa-pen-to-square text-white"></i>
                    </span>
                    <div>
                      <h3 className="mb-0" style={{ fontWeight: 700, color: "#32325d" }}>
                        Edit Test
                      </h3>
                      <p className="mb-0" style={{ fontSize: 12, color: "#8898aa" }}>
                        Test ID: <strong style={{ color: "#5e72e4" }}>#{id}</strong>
                      </p>
                    </div>
                  </div>

                  {/* back button */}
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{
                      borderRadius: 8, fontWeight: 600, fontSize: 13,
                      background: "#f8f9fe", border: "1px solid #e0e6ed",
                      color: "#525f7f", padding: "7px 16px",
                    }}
                    onClick={() => navigate("/admin/test-management")}
                  >
                    ← Back to Tests
                  </button>
                </div>
              </CardHeader>

              {/* ── Body ── */}
              <CardBody style={{ padding: "2rem 1.75rem" }}>
                <form onSubmit={handleSubmit(onSubmit)}>

                  {/* ─ section label ─ */}
                  <div className="d-flex align-items-center mb-4" style={{ gap: 8 }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: 7,
                      background: "linear-gradient(135deg,#5e72e4,#825ee4)",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 13,
                    }}><i className="fa-solid fa-dna text-white"></i></span>
                    <h6 className="mb-0 text-muted" style={{ letterSpacing: 1, fontSize: 11 }}>
                      TEST INFORMATION
                    </h6>
                  </div>

                  <div className="row">

                    {/* Test Name */}
                    <div className="col-md-6 mb-4">
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#525f7f", marginBottom: 6, display: "block" }}>
                        Test Name <span style={{ color: "#f5365c" }}>*</span>
                      </label>
                      <input
                        type="text"
                        style={inputStyle}
                        placeholder="e.g. Complete Blood Count"
                        {...register("test_name", { required: true })}
                        onFocus={e => {
                          e.target.style.border = "1px solid #5e72e4";
                          e.target.style.boxShadow = "0 0 0 3px rgba(94,114,228,.1)";
                        }}
                        onBlur={e => {
                          e.target.style.border = "1px solid #e0e6ed";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>

                    {/* Short Name */}
                    <div className="col-md-6 mb-4">
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#525f7f", marginBottom: 6, display: "block" }}>
                        Short Name <span style={{ color: "#f5365c" }}>*</span>
                      </label>
                      <input
                        type="text"
                        style={inputStyle}
                        placeholder="e.g. CBC"
                        {...register("test_short_name", { required: true })}
                        onFocus={e => {
                          e.target.style.border = "1px solid #5e72e4";
                          e.target.style.boxShadow = "0 0 0 3px rgba(94,114,228,.1)";
                        }}
                        onBlur={e => {
                          e.target.style.border = "1px solid #e0e6ed";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>

                    {/* Test ID (readonly) */}
                    <div className="col-md-4 mb-4">
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#525f7f", marginBottom: 6, display: "block" }}>
                        Test ID
                      </label>
                      <input
                        type="text"
                        style={readonlyStyle}
                        readOnly
                        {...register("test_id")}
                      />
                    </div>

                    {/* Price */}
                    <div className="col-md-4 mb-4">
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#525f7f", marginBottom: 6, display: "block" }}>
                        Price (PKR) <span style={{ color: "#f5365c" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <span style={{
                          position: "absolute", left: 12, top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: 13, color: "#8898aa", fontWeight: 600,
                          pointerEvents: "none",
                        }}>
                          PKR
                        </span>
                        <input
                          type="number"
                          style={{ ...inputStyle, paddingLeft: 46 }}
                          placeholder="0"
                          {...register("amount", { required: true, min: 0 })}
                          onFocus={e => {
                            e.target.style.border = "1px solid #5e72e4";
                            e.target.style.boxShadow = "0 0 0 3px rgba(94,114,228,.1)";
                          }}
                          onBlur={e => {
                            e.target.style.border = "1px solid #e0e6ed";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                      </div>
                    </div>

                    {/* Status toggle */}
                    <div className="col-md-4 mb-4">
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#525f7f", marginBottom: 6, display: "block" }}>
                        Status
                      </label>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 14px", borderRadius: 8,
                        border: "1px solid #e0e6ed", background: "#fff",
                        height: 44,
                      }}>
                        {/* custom toggle */}
                        <label style={{ position: "relative", width: 42, height: 22, cursor: "pointer", marginBottom: 0, flexShrink: 0 }}>
                          <input
                            type="checkbox"
                            style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
                            {...register("is_active")}
                          />
                          <span style={{
                            position: "absolute", inset: 0, borderRadius: 999,
                            background: isActive ? "#2dce89" : "#cbd3da",
                            transition: "background .2s",
                          }} />
                          <span style={{
                            position: "absolute",
                            width: 16, height: 16, borderRadius: "50%",
                            background: "#fff", top: 3,
                            left: isActive ? 23 : 3,
                            transition: "left .2s",
                            boxShadow: "0 1px 4px rgba(0,0,0,.2)",
                          }} />
                        </label>
                        <span style={{
                          fontSize: 13, fontWeight: 600,
                          color: isActive ? "#2dce89" : "#8898aa",
                        }}>
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* ── Divider ── */}
                  <hr style={{ borderColor: "#f0f0f0", margin: "0.5rem 0 1.5rem" }} />

                  {/* ── Action buttons ── */}
                  <div className="d-flex align-items-center" style={{ gap: 12 }}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        borderRadius: 8, fontWeight: 600, fontSize: 14,
                        padding: "10px 32px", border: "none",
                        background: "linear-gradient(135deg,#5e72e4,#825ee4)",
                        color: "#fff", cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(94,114,228,.35)",
                        opacity: isSubmitting ? 0.7 : 1,
                        transition: "opacity .2s",
                      }}
                    >
                      {isSubmitting ? "Saving…" : "Update Test"}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/admin/test-management")}
                      style={{
                        borderRadius: 8, fontWeight: 600, fontSize: 14,
                        padding: "10px 24px",
                        background: "#f8f9fe",
                        border: "1px solid #e0e6ed",
                        color: "#525f7f", cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
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
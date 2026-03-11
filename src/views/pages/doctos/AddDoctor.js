import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "api/axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Card, CardBody, CardHeader, Container, Row } from "reactstrap";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

function AddDoctor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [specializations, setSpecializations] = useState([]);
const [specInput, setSpecInput] = useState("");

const {
  register,
  control,
  handleSubmit,
  setValue,
  formState: { errors, isValid, isSubmitting },
} = useForm({
  mode: "onChange",
  reValidateMode: "onChange",
});

const handleSpecializationKeyDown = (e) => {
  if (e.key === "Enter" && specInput.trim() !== "") {
    e.preventDefault();

    if (!specializations.includes(specInput.trim())) {
      setSpecializations([...specializations, specInput.trim()]);
    }

    setSpecInput("");
  }
};

const removeSpecialization = (index) => {
  const updated = specializations.filter((_, i) => i !== index);
  setSpecializations(updated);
};

  // Fetch test data


 

  // Update API
  const onSubmit = async (data) => {
    try {
        const payload = {
            ...data,
            specializations: specializations
        }
        let res;

    if (id) {
      res = await api.put(`/doctors/${id}`, payload);
    } else {
      res = await api.post("/doctors", payload);
    }
    
      toast.success(res.data.message);
      navigate("/admin/doctors-management");
    } catch (error) {
      console.log(error);
    }

  };

  useEffect(() => {
  if (id) {
    fetchDoctor();
  }
}, [id]);

const fetchDoctor = async () => {
  try {
    const res = await api.get(`/doctors/${id}`);
    const doctor = res.data.data;
console.log(doctor);
    setValue("doctor_name", doctor.name);
    setValue("email", doctor.email);
    setValue("phone", doctor.phone);
    setValue("qualification", doctor.qualifications);
    setValue("gender", doctor.gender);
    setValue("commission", doctor.commission_percentage);
    setValue("address", doctor.address);

    if (doctor.speciality) {
      setSpecializations(doctor.speciality);
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
                <h3 className="mb-0">{id ? "Update Doctor" : "Add Doctor"}</h3>
              </CardHeader>

              <CardBody>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="row">

                    {/* Test Name */}
                    <div className="col-md-6">
                      <div className="mt-4">
                        <label className="form-label">Doctor Name</label>
                            <input
                            type="text"
                            placeholder="Jhon Deo"
                            className={errors.doctor_name ? "form-control is-invalid" : "form-control"}
                            {...register("doctor_name", {
                                required: "Doctor name is required",
                                minLength: {
                                value: 3,
                                message: "Minimum 3 characters required"
                                }
                            })}
                            />

                            {errors.doctor_name && (
                            <small className="text-danger">{errors.doctor_name.message}</small>
                            )}
                      </div>
                    </div>

                    {/* Test Short Name */}
                    <div className="col-md-6">
                      <div className="mt-4">
                        <label className="form-label">Email</label>
                        <input
                        placeholder="jhondeo@gmail.com"
  type="email"
  className={errors.email ? "form-control is-invalid" : "form-control"}
  {...register("email", {
    required: "Email is required",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Invalid email address"
    }
  })}
/>

{errors.email && (
  <small className="text-danger">{errors.email.message}</small>
)}
                      </div>
                    </div>

                    {/* Test ID */}
                    <div className="col-md-4">
                      <div className="mt-4">
                        <label className="form-label">Phone</label>
                        <input
  type="number"
  placeholder="0300-0000000"
  className={`form-control ${errors.phone ? "is-invalid" : ""}`}
  {...register("phone", {
    required: "Phone number is required",
  })}
/>

{errors.phone && (
  <small className="text-danger">{errors.phone.message}</small>
)}
                      </div>
                    </div>

                    {/* Test Price */}
                    <div className="col-md-4">
                      <div className="mt-4">
                        <label className="form-label">Qualification</label>
                        <input
                          type="text"
                          className={errors.qualification ? "form-control is-invalid" : "form-control"}
                          placeholder="Highest Qualification"
                          {...register("qualification", { required: "Qualification is required" })}
                        />
                      </div>

                      {errors.qualification && (
                        <small className="text-danger">{errors.qualification.message}</small>
                      )}
                    </div>

                                        <div className="col-md-4">
                      <div className="mt-4">
                          <label>Gender</label>
<select
  className={errors.gender ? "form-control is-invalid" : "form-control"}
  {...register("gender", { required: "Gender is required" })}
>
  <option value="">Select Gender</option>
  <option value="male">Male</option>
  <option value="female">Female</option>
</select>

{errors.gender && <small className="text-danger">{errors.gender.message}</small>}
                      </div>
                    </div>

                    {/* Status */}
<div className="col-md-12">
  <div className="mt-4">
    <label className="form-label">Specializations</label>

    <input
      type="text"
      className="form-control"
      placeholder="Type specialization and press Enter"
      value={specInput}
      onChange={(e) => setSpecInput(e.target.value)}
      onKeyDown={handleSpecializationKeyDown}
    />

    {/* Badges */}
    <div className="mt-2">
      {specializations.map((spec, index) => (
        <span
          key={index}
          className="badge bg-primary me-2 mb-2"
          style={{ fontSize: "13px", padding: "8px",color:'white' ,marginRight:'5px' }}
        >
          {spec}
          <button
            type="button"
            onClick={() => removeSpecialization(index)}
            style={{
              border: "none",
              background: "transparent",
              color: "white",
              marginLeft: "6px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  </div>
</div>



                    <div className="col-md-4">
                      <div className="mt-4">
  <label>Commission in Percentage</label>
  <input
    type="number"
    placeholder="0%"
    className={`form-control ${errors.commission ? "is-invalid" : ""}`}
    {...register("commission", {
      required: "Commission is required",
      valueAsNumber: true,
      min: { value: 0, message: "Minimum 0%" },
      max: { value: 100, message: "Maximum 100%" },
    })}
  />

  {errors.commission?.message && (
    <small className="text-danger">{errors.commission.message}</small>
  )}
</div>
                      
                    </div>

                    <div className="col-md-7 mt-4">
                    <div
                        className="mt-4 d-flex align-items-center"
                        style={{
                        backgroundColor: "#fff3cd",
                        border: "1px solid #ffeeba",
                        color: "#856404",
                        padding: "10px 15px",
                        borderRadius: "6px",
                        }}
                    >
                        <WarningAmberIcon style={{ marginRight: "8px" }} />
                        <span>Make sure to add the commission in percentage.Between 0% to 100%</span>
                    </div>
                    </div>

                    <div className="col-md-12">
                      <div className="mt-4">
                          <label>Address</label>
                          <textarea
                          rows={3}
                          type="text"
                          className={errors.address ? "form-control is-invalid" : "form-control"}
                          {...register("address", { required: "Address is required" })}
                        />
                        {errors.address && (
                        <small className="text-danger">{errors.address.message}</small>
                        )}
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="mx-auto mt-4">
<button
  disabled={!isValid || isSubmitting}
  type="submit"
  className="btn btn-primary mt-4 px-5 py-2 d-flex align-items-center justify-content-center"
>
  {isSubmitting ? (
    <>
      <span
        className="spinner-border spinner-border-sm mr-2"
        role="status"
      ></span>
      Submitting...
    </>
  ) : (
    id ? "Update Doctor" : "Add Doctor"
  )}
</button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate("/admin/doctors-management")
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

export default AddDoctor;
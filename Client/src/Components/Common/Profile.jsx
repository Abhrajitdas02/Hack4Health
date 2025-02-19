import axios from "axios";
import React from "react";
import { useState, useEffect } from "react";
import User from "../../Asset/Profile/User.jpg";
import { TbEdit } from "react-icons/tb";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import NotFound from "../../Asset/Profile/NotFound.png";

const Profile = () => {
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const { token } = useSelector((state) => state.auth);
  const [userDetails, setUserDetails] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showMedicationModal, setShowMedicationModal] = useState(null);
  const [updateMedicationStatus, setUpdateMedicationStatus] = useState(false);

  const [appointmentsPerPage, setAppointmentsPerPage] = useState(1);
  const [medicationsPerPage, setMedicationsPerPage] = useState(1);

  const [currentAppointmentIndex, setcurrentAppointmentIndex] = useState(0);
  const [currentMedicationIndex, setCurrentMedicationIndex] = useState(0);
  const appointmentEndIndex = currentAppointmentIndex + appointmentsPerPage;
  const medicationEndIndex = currentMedicationIndex + medicationsPerPage;

  const [loading, setLoading] = useState({
    appointments: true,
    medications: true,
    userDetails: true,
  });
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const getAppointments = async () => {
    try {
      setLoading((prev) => ({ ...prev, appointments: true }));
      const response = await axios.get(
        `${BASE_URL}/api/v1/user/getAppointments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAppointments(response?.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading((prev) => ({ ...prev, appointments: false }));
    }
  };

  const getMedications = async () => {
    try {
      setLoading((prev) => ({ ...prev, medications: true }));
      const response = await axios.get(
        `${BASE_URL}/api/v1/medication/getMedication`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMedications(response?.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading((prev) => ({ ...prev, medications: false }));
    }
  };

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        setLoading((prev) => ({ ...prev, userDetails: true }));
        const response = await axios.get(`${BASE_URL}/api/v1/user/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserDetails(response?.data);
      } catch (e) {
        console.error(e.message);
      } finally {
        setLoading((prev) => ({ ...prev, userDetails: false }));
      }
    };
    getUserDetails();
  }, [token]);

  useEffect(() => {
    getAppointments();
  }, [token]);

  useEffect(() => {
    getMedications();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setAppointmentsPerPage(2);
        setMedicationsPerPage(2);
      } else {
        setAppointmentsPerPage(1);
        setMedicationsPerPage(2);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleMedicationClick = (medication) => {
    setSelectedMedication(medication);
    setShowMedicationModal(true);
  };

  const updateStatus = async (medication) => {
    try {
      setUpdateMedicationStatus(true);
      const status = medication.status === "Live" ? "Pause" : "Live";
      await axios.put(
        `${BASE_URL}/api/v1/medication/updateStatus`,
        {
          medicationId: medication._id,
          status: status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Medication updated successfully");
      getMedications();
    } catch (err) {
      console.error(err);
      toast.error("Please Try Again");
    } finally {
      setUpdateMedicationStatus(false);
    }
  };

  const handleConfirmAppointmentCancel = async () => {
    try {
      toast.loading();
      await axios.delete(`${BASE_URL}/api/v1/user/cancelAppointment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          appointmentId: selectedAppointment._id,
        },
      });
      toast.dismiss();
      toast.success("Appointment Cancelled Successfully");
      getAppointments();
    } catch (error) {
      toast.error("Please Try Again");
      console.error(error);
    } finally {
      setShowAppointmentModal(false);
    }
  };

  const handleConfirmMedicationDelete = async () => {
    try {
      toast.loading();
      await axios.delete(`${BASE_URL}/api/v1/medication/deleteMedication`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          medicationId: selectedMedication._id,
        },
      });
      toast.dismiss();
      toast.success("Medication Deleted Successfully");
      getMedications();
    } catch (error) {
      toast.error("Please Try Again");
      console.error(error);
    } finally {
      setShowMedicationModal(false);
    }
  };

  const handleNextAppointment = () => {
    if (appointmentEndIndex < appointments.appointments.length) {
      setcurrentAppointmentIndex(currentAppointmentIndex + appointmentsPerPage);
    }
  };

  const handlePreviousAppointment = () => {
    if (currentAppointmentIndex > 0) {
      setcurrentAppointmentIndex(currentAppointmentIndex - appointmentsPerPage);
    }
  };

  const handleNextMedication = () => {
    if (medicationEndIndex < medications.data.length) {
      setCurrentMedicationIndex(currentMedicationIndex + medicationsPerPage);
    }
  };

  const handlePreviousMedication = () => {
    if (currentMedicationIndex > 0) {
      setCurrentMedicationIndex(currentMedicationIndex - medicationsPerPage);
    }
  };

  const SkeletonLoader = () => {
    return (
      <div className="animate-pulse flex flex-col gap-y-4 border border-white rounded-[15px] bg-black p-4">
        <div className="h-6 bg-gray-400 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
        <div className="flex space-x-2 mt-4">
          <div className="h-8 bg-gray-500 rounded w-1/4"></div>
          <div className="h-8 bg-gray-500 rounded w-1/4"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[100vh] w-[99vw] dark:bg-black bg-white dark:bg-dot-white/[0.2] bg-dot-black/[0.2] overflow-clip">
      <div className="flex flex-col">
        <div className="flex xl:flex-row flex-col gap-y-10 mt-[1.9%] lg:justify-center lg:gap-x-20 items-center">
          <div>
            {loading.userDetails ? (
              <div className="animate-pulse rounded-full bg-gray-400 lg:h-[400px] h-[350px] lg:w-[400px] w-[350px]" />
            ) : (
              <img
                src={User}
                className="rounded-full lg:h-[400px] h-[350px] lg:w-[400px] w-[350px]"
                alt="Doctor"
              />
            )}
          </div>

          <div className="xl:w-[2px] w-[70%] xl:h-[400px] h-[5px] bg-white rounded-md" />

          <div className="flex items-center">
            <div className="flex flex-col gap-y-5 lg:justify-center items-center">
              {loading.userDetails ? (
                <>
                  <div className="animate-pulse flex lg:flex-row flex-col lg:items-baseline items-center lg:gap-x-4 lg:gap-y-0 gap-y-4">
                    <div className="text-gray-300 text-5xl uppercase text-center first-letter:text-6xl">
                      Name <span className="lg:inline-block hidden">-</span>{" "}
                    </div>
                    <div className="h-8 bg-gray-300 rounded w-64"></div>
                  </div>

                  <div className="animate-pulse flex lg:flex-row flex-col lg:items-baseline items-center lg:gap-x-4 lg:gap-y-0 gap-y-4">
                    <div className="text-gray-300 text-5xl uppercase text-center first-letter:text-6xl">
                      Email <span className="lg:inline-block hidden">-</span>{" "}
                    </div>
                    <div className="h-8 bg-gray-300 rounded w-64"></div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex lg:flex-row flex-col gap-x-5 lg:items-baseline gap-y-3">
                    <div className="text-gray-300 text-5xl uppercase text-center first-letter:text-6xl">
                      Name <span className="lg:inline-block hidden">-</span>{" "}
                    </div>
                    <div className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-xl lg:text-3xl font-bold uppercase select-none tracking-[1px] text-center">
                      {userDetails?.user?.name}
                    </div>
                  </div>

                  <div className="flex lg:flex-row flex-col gap-x-5 lg:items-baseline gap-y-3">
                    <div className="text-gray-300 text-5xl uppercase text-center first-letter:text-6xl">
                      Email <span className="lg:inline-block hidden">-</span>{" "}
                    </div>
                    <div className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-xl lg:text-3xl font-bold select-none tracking-[1px] text-center">
                      {userDetails?.user?.email}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="xl:w-0 w-[70%] xl:h-[380px] h-[5px] bg-white rounded-md mx-auto mt-[5%]" />

        {/* APPOINTMENTS */}
        <div className="flex flex-col w-full lg:-mt-[28%] -mt-[12%]">
          <div className="select-none text-gray-300 lg:text-5xl text-4xl uppercase first-letter:text-6xl tracking-[2px] mx-auto mt-[178px]">
            Your
          </div>
          <div className="select-none text-gray-300 lg:text-5xl text-4xl uppercase first-letter:text-6xl tracking-[2px] mx-auto mt-[1%]">
            Appointment
          </div>

          <div className="grid md:grid-cols-2 grid-cols-1 gap-x-12 w-full lg:p-20 p-10 gap-y-4">
            {loading.appointments && loading.medications ? (
              <>
                <SkeletonLoader />
                <SkeletonLoader />
              </>
            ) : (
              appointments?.appointments
                ?.slice(currentAppointmentIndex, appointmentEndIndex)
                ?.map((appointment, index) => (
                  <div
                    key={index}
                    className={`h-fit w-full flex flex-col gap-y-4 border border-white rounded-[15px] bg-black p-4`}
                  >
                    <div className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-xl lg:text-3xl font-bold select-none tracking-[1px] text-center underline decoration-slate-500 underline-offset-4">
                      {currentAppointmentIndex + index + 1}
                    </div>
                    {/* NAME */}
                    <div className="flex gap-x-4 justify-center lg:items-baseline lg:flex-row flex-col">
                      <div className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-xl lg:text-2xl font-bold uppercase select-none tracking-[1px] text-center first-letter:text-3xl lg:no-underline underline decoration-slate-500 underline-offset-4">
                        Doctor <span className="lg:inline hidden">-</span>{" "}
                      </div>
                      <div className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-md lg:text-2xl font-bold uppercase select-none tracking-[1px] text-center lg:first-letter:text-3xl first-letter:text-xl lg:mt-0 mt-[1%]">
                        {appointment?.doctorId?.name}
                      </div>
                    </div>
                    {/* EMAIL */}
                    <div className="flex gap-x-4 justify-center lg:items-baseline lg:flex-row flex-col">
                      <div className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-xl lg:text-2xl font-bold uppercase select-none tracking-[1px] text-center first-letter:text-3xl lg:no-underline underline decoration-slate-500 underline-offset-4">
                        Email <span className="lg:inline hidden">-</span>{" "}
                      </div>
                      <div className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-md lg:text-2xl font-bold select-none tracking-[1px] text-center lg:mt-0 mt-[1%] line-clamp-1">
                        {appointment?.doctorId?.email}
                      </div>
                    </div>
                    {/* DAY */}
                    <div className="flex gap-x-4 justify-center lg:items-baseline lg:flex-row flex-col">
                      <div className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-xl lg:text-2xl font-bold uppercase select-none tracking-[1px] text-center first-letter:text-3xl lg:no-underline underline decoration-slate-500 underline-offset-4">
                        Date <span className="lg:inline hidden">-</span>{" "}
                      </div>
                      <div className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-md lg:text-2xl font-bold select-none tracking-[1px] text-center lg:mt-0 mt-[1%]">
                        {appointment?.slotId?.day}
                      </div>
                    </div>
                    {/* TIME */}
                    <div className="flex gap-x-4 justify-center lg:items-baseline lg:flex-row flex-col">
                      <div className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-xl lg:text-2xl font-bold uppercase select-none tracking-[1px] text-center first-letter:text-3xl lg:no-underline underline decoration-slate-500 underline-offset-4">
                        Time <span className="lg:inline hidden">-</span>{" "}
                      </div>
                      <div className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-md lg:text-2xl font-bold select-none tracking-[1px] text-center lg:mt-0 mt-[1%]">
                        {appointment?.slotId?.time}
                      </div>
                    </div>
                    <div className="flex w-full justify-center gap-x-2">
                      <button
                        type="submit"
                        className="text-white bg-gradient-to-b from-neutral-200 to-neutral-600 rounded-lg py-2 px-4 mt-4 uppercase tracking-[2px] z-10"
                        onClick={() =>
                          window.open(`${appointment.link}`, "_blank")
                        }
                      >
                        Join
                      </button>
                      <button
                        type="submit"
                        className={`text-white bg-gradient-to-b from-neutral-200 to-neutral-600 rounded-lg py-2 px-4 mt-4 uppercase tracking-[2px] ${
                          appointment.canCancel
                            ? "cursor-pointer"
                            : "opacity-50 cursor-not-allowed"
                        } z-10`}
                        disabled={!appointment.canCancel}
                        onClick={() => handleAppointmentClick(appointment)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* No appointments message */}
          {!loading.appointments &&
            !loading.medications &&
            appointments?.appointments?.length === 0 && (
              <div className="text-zinc-400 md:text-4xl text-xl uppercase tracking-[2px] w-full flex justify-center -mt-[6%] mb-[3%] p-4">
                <div>
                  <span className="md:text-5xl text-2xl">N</span>o{" "}
                  <span className="md:text-5xl text-2xl ml-1">A</span>ppointment{" "}
                  <span className="md:text-5xl text-2xl ml-1">F</span>ound
                </div>
                <div>
                  <img
                    src={NotFound}
                    alt="No result"
                    height={80}
                    width={80}
                    className="md:block hidden"
                  />
                </div>
              </div>
            )}

          {appointments?.appointments?.length > 0 && (
            <div className="flex justify-center gap-x-6 -mt-[2%]">
              <div
                className={`p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-400 hover:text-white transition-colors duration-200 ${
                  currentAppointmentIndex === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                onClick={handlePreviousAppointment}
              >
                <FaArrowLeft className="text-lg" />
              </div>
              <div
                className={`p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-400 hover:text-white transition-colors duration-200 ${
                  appointmentEndIndex >= appointments?.appointments?.length
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                onClick={handleNextAppointment}
              >
                <FaArrowRight className="text-lg" />
              </div>
            </div>
          )}
        </div>
      </div>
      {/* MEDICATION */}
      <div
        className={`flex flex-col w-full ${
          medications?.data?.length > 0 ? "-mt-[7%]" : "md:-mt-[10%] -mt-[38%]"
        }`}
      >
        <div className="select-none text-gray-300 lg:text-5xl text-4xl uppercase first-letter:text-6xl tracking-[2px] mx-auto mt-[178px]">
          Your
        </div>
        <div className="select-none text-gray-300 lg:text-5xl text-4xl uppercase first-letter:text-6xl tracking-[2px] mx-auto mt-[1%]">
          Medication
        </div>

        <div className="grid md:grid-cols-2 grid-cols-1 gap-x-12 w-full lg:p-20 p-10 gap-y-4">
          {loading.appointments && loading.medications ? (
            <>
              <SkeletonLoader />
              <SkeletonLoader />
            </>
          ) : (
            medications?.data
              ?.slice(currentMedicationIndex, medicationEndIndex)
              ?.map((medication, index) => (
                <div
                  key={index}
                  className={`h-fit w-full flex flex-col gap-y-4 border border-white rounded-[15px] bg-black p-4 relative`}
                >
                  <TbEdit className="absolute right-2 top-2 text-gray-400 cursor-pointer lg:text-3xl text-2xl" />
                  <div className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-xl lg:text-3xl font-bold select-none tracking-[1px] text-center underline decoration-slate-500 underline-offset-4">
                    {currentMedicationIndex + index + 1}
                  </div>
                  {/* NAME */}
                  <div className="flex gap-x-4 justify-center lg:items-baseline lg:flex-row flex-col">
                    <div className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-xl lg:text-2xl font-bold uppercase select-none tracking-[1px] text-center first-letter:text-3xl lg:no-underline underline decoration-slate-500 underline-offset-4">
                      Name <span className="lg:inline hidden">-</span>{" "}
                    </div>
                    <div className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-md lg:text-2xl font-bold uppercase select-none tracking-[1px] text-center lg:first-letter:text-3xl first-letter:text-xl lg:mt-0 mt-[1%]">
                      {medication?.name}
                    </div>
                  </div>
                  {/* DAYS */}
                  <div className="flex gap-x-4 justify-center lg:items-baseline lg:flex-row flex-col">
                    <div className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-xl lg:text-2xl font-bold uppercase select-none tracking-[1px] text-center first-letter:text-3xl lg:no-underline underline decoration-slate-500 underline-offset-4">
                      Day <span className="lg:inline hidden">-</span>{" "}
                    </div>
                    {medication.days.map((day, idx) => (
                      <li
                        key={idx}
                        className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-md lg:text-xl font-bold select-none tracking-[1px] text-center lg:mt-0 mt-[1%] line-clamp-1 uppercase"
                      >
                        <span className="text-2xl">{idx + 1}.</span> {day}
                      </li>
                    ))}
                  </div>
                  {/* TIME */}
                  <div className="flex gap-x-4 justify-center lg:items-baseline lg:flex-row flex-col">
                    <div className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-xl lg:text-2xl font-bold uppercase select-none tracking-[1px] text-center first-letter:text-3xl lg:no-underline underline decoration-slate-500 underline-offset-4">
                      Time <span className="lg:inline hidden">-</span>{" "}
                    </div>
                    {medication.times.map((time, idx) => (
                      <li
                        key={idx}
                        className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-md lg:text-xl font-bold select-none tracking-[1px] text-center lg:mt-0 mt-[1%] line-clamp-1 uppercase"
                      >
                        <span className="text-2xl">{idx + 1}.</span> {time}
                      </li>
                    ))}
                  </div>
                  {/* DOSAGE */}
                  <div className="flex gap-x-4 justify-center lg:items-baseline lg:flex-row flex-col">
                    <div className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-xl lg:text-2xl font-bold uppercase select-none tracking-[1px] text-center first-letter:text-3xl lg:no-underline underline decoration-slate-500 underline-offset-4">
                      Dosage <span className="lg:inline hidden">-</span>{" "}
                    </div>
                    <div className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-md lg:text-2xl font-bold uppercase select-none tracking-[1px] text-center lg:first-letter:text-3xl first-letter:text-xl lg:mt-0 mt-[1%]">
                      {medication?.dosage}
                    </div>
                  </div>
                  <div className="flex w-full justify-center gap-x-2">
                    <TbEdit
                      size={24}
                      className="cursor-pointer"
                      onClick={() => {
                        /* handle edit functionality here */
                      }}
                    />
                    <button
                      type="submit"
                      className={`text-white bg-gradient-to-b from-neutral-200 to-neutral-600 rounded-lg py-2 px-4 mt-4 uppercase tracking-[2px] ${
                        updateMedicationStatus && "cursor-wait"
                      }`}
                      disabled={updateMedicationStatus}
                      onClick={() => updateStatus(medication)}
                    >
                      {medication.status === "Live" ? "Pause" : "Live"}
                    </button>
                    <button
                      type="submit"
                      className="text-white bg-gradient-to-b from-neutral-200 to-neutral-600 rounded-lg py-2 px-4 mt-4 uppercase tracking-[2px]"
                      onClick={() => handleMedicationClick(medication)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>

        {!loading.appointments &&
          !loading.medications &&
          medications?.data?.length === 0 && (
            <div className="text-zinc-400 md:text-4xl text-xl uppercase tracking-[2px] w-full flex justify-center -mt-[6%] mb-[3%] p-4">
              <div>
                <span className="md:text-5xl text-2xl">N</span>o{" "}
                <span className="md:text-5xl text-2xl ml-1">M</span>edication{" "}
                <span className="md:text-5xl text-2xl ml-1">F</span>ound
              </div>
              <div>
                <img
                  src={NotFound}
                  alt="No result"
                  height={80}
                  width={80}
                  className="md:block hidden"
                />
              </div>
            </div>
          )}

        {medications?.data?.length > 0 && (
          <div className="flex justify-center gap-x-6 -mt-[2%] mb-2">
            <div
              className={`p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-400 hover:text-white transition-colors duration-200
            ${
              currentMedicationIndex === 0 || medications?.data?.length === 1
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
              onClick={
                medications?.data?.length > 1 && currentMedicationIndex > 0
                  ? handlePreviousMedication
                  : null
              }
            >
              <FaArrowLeft className="text-lg" />
            </div>

            <div
              className={`p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-400 hover:text-white transition-colors duration-200
            ${
              medicationEndIndex >= medications?.data?.length ||
              medications?.data?.length === 1
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
              onClick={
                medications?.data?.length > 1 &&
                medicationEndIndex < medications?.data?.length
                  ? handleNextMedication
                  : null
              }
            >
              <FaArrowRight className="text-lg" />
            </div>
          </div>
        )}
      </div>
      {/* MODAL */}
      <div>
        {/* Appointment Modal */}
        {showAppointmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
            <div
              className="absolute inset-0 bg-black opacity-50"
              onClick={() => setShowAppointmentModal(false)}
            ></div>
            <div className="relative bg-white p-8 rounded-md shadow-md">
              <h2 className="text-2xl mb-4 uppercase tracking-[1.5px]">
                Confirm Cancel
              </h2>
              <p className="uppercase tracking-[1.2px]">
                Are you sure you want to cancel the appointment for{" "}
                {selectedAppointment.day} at {selectedAppointment.time}?
              </p>
              <div className="flex justify-end mt-4">
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded-md mr-4 uppercase tracking-[1.2px]"
                  onClick={handleConfirmAppointmentCancel}
                >
                  Yes
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md uppercase tracking-[1.2px]"
                  onClick={() => setShowAppointmentModal(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Medication Modal */}
        {showMedicationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
            <div
              className="absolute inset-0 bg-black opacity-50"
              onClick={() => setShowMedicationModal(false)}
            ></div>
            <div className="relative bg-white p-8 rounded-md shadow-md">
              <h2 className="text-2xl mb-4 uppercase tracking-[1.5px]">
                Confirm Delete
              </h2>
              <p className="uppercase tracking-[1.2px]">
                Are you sure you want to delete the Medication for{" "}
                {selectedMedication.name}?
              </p>
              <div className="flex justify-end mt-4">
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded-md mr-4 uppercase tracking-[1.2px]"
                  onClick={handleConfirmMedicationDelete}
                >
                  Yes
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md uppercase tracking-[1.2px]"
                  onClick={() => setShowMedicationModal(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

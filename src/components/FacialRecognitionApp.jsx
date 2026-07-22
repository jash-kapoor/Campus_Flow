import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";
import * as XLSX from "xlsx";
import JSZip from "jszip";

// --- CONFIGURATION ---
const API_URL = "http://localhost:5001/api";
// Ensure JWT is attached for all requests from this module
axios.interceptors.request.use((config) => {
  const stored = localStorage.getItem("userInfo");
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- PREDEFINED DATA ---
const PREDEFINED_SUBJECTS = [
  "Engineering Maths-I",
  "Physics",
  "Intro to Programming",
  "Digital Design",
  "Communication Skills",
  "Physics Lab",
  "Programming Lab",
  "Digital Design Lab",
  "Data Structures",
  "Object-Oriented Programming",
  "Discrete Mathematics",
  "Computer Organization",
  "Operating Systems",
  "Data Structures Lab",
  "OOP Lab",
  "OS Lab",
  "Applied Chemistry",
  "Basic Electrical Engineering",
  "Engineering Mechanics",
  "Workshop Practice",
  "Applied Chemistry Lab",
  "Basic Electrical Engineering Lab",
  "Workshop",
  "Signals & Systems",
  "Analog Electronics",
  "Digital Circuits",
  "Network Theory",
  "Electromagnetic Fields",
  "Analog Electronics Lab",
  "Digital Circuits Lab",
  "Network Theory Lab",
  "Database Management",
  "Software Engineering",
  "Computer Networks",
  "DBMS Lab",
  "Networks Lab",
].sort();

// --- HELPER COMPONENTS ---
const Spinner = ({ text = "Loading..." }) => (
  <div className="flex flex-col justify-center items-center h-full my-10">
    <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
    <p className="mt-4 text-gray-500">{text}</p>
  </div>
);
const Alert = ({ message, type = "error" }) => {
  if (!message) return null;
  const typeClasses =
    type === "error"
      ? "bg-red-100 border-red-400 text-red-700"
      : "bg-green-100 border-green-400 text-green-700";
  return (
    <div
      className={`border px-4 py-3 rounded-md my-4 text-center text-sm ${typeClasses}`}
      role="alert"
    >
      {message}
    </div>
  );
};
const MultiSelectDropdown = ({
  placeholder,
  allOptions,
  selectedOptions,
  setSelectedOptions,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customOption, setCustomOption] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) =>
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  const handleAddCustom = () => {
    if (
      customOption &&
      !selectedOptions.includes(customOption) &&
      !allOptions.includes(customOption)
    ) {
      setSelectedOptions([...selectedOptions, customOption]);
      setCustomOption("");
    }
  };
  const filteredOptions = allOptions.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border rounded-md bg-white text-left overflow-hidden whitespace-nowrap text-ellipsis"
      >
        <span
          className={
            selectedOptions.length > 0 ? "text-gray-800" : "text-gray-400"
          }
        >
          {selectedOptions.length > 0
            ? selectedOptions.join(", ")
            : placeholder}
        </span>
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 border rounded-md"
            />
          </div>
          {filteredOptions.map((option) => (
            <label
              key={option}
              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedOptions.includes(option)}
                onChange={() => handleSelect(option)}
                className="mr-2 h-4 w-4"
              />
              {option}
            </label>
          ))}
          <div className="p-2 border-t flex gap-2">
            <input
              type="text"
              placeholder="Add custom subject"
              value={customOption}
              onChange={(e) => setCustomOption(e.target.value)}
              className="flex-grow w-full px-2 py-1 border rounded-md"
            />
            <button
              type="button"
              onClick={handleAddCustom}
              className="bg-gray-200 px-3 rounded-md hover:bg-gray-300 text-sm font-semibold"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
const BatchListItem = ({ batch, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="text-sm p-2 border-b">
      <div className="w-full flex justify-between items-center text-left">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-grow flex items-center font-semibold text-gray-700"
        >
          <svg
            className={`w-4 h-4 transition-transform mr-2 ${
              isOpen ? "rotate-90" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          {batch.name}
        </button>
        <button
          onClick={() => onDelete(batch._id)}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      {isOpen && (
        <div className="mt-2 pl-8 text-gray-600">
          <p className="font-semibold">Subjects:</p>
          <ul className="list-disc pl-5">
            {batch.subjects.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          {batch.labs && batch.labs.length > 0 && (
            <>
              <p className="font-semibold mt-1">Labs:</p>
              <ul className="list-disc pl-5">
                {batch.labs.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// --- PAGE COMPONENTS ---

const ClassCell = ({ entry, onStartAttendance }) => {
  if (typeof entry === "string" && entry === "LUNCH")
    return (
      <div className="font-semibold text-gray-500 text-center h-full flex items-center justify-center">
        LUNCH
      </div>
    );
  if (!entry || !entry.subject)
    return (
      <div className="text-gray-400 text-center h-full flex items-center justify-center">
        ·
      </div>
    );
  const isTeacherAvailable = entry.teacher && entry.teacher !== "Not Available";
  const bgColor = isTeacherAvailable
    ? "bg-blue-100 hover:bg-blue-200"
    : "bg-red-100 hover:bg-red-200";
  const textColor = isTeacherAvailable ? "text-blue-800" : "text-red-800";
  return (
    <button
      onClick={() => isTeacherAvailable && onStartAttendance(entry.subject)}
      className={`w-full h-full p-2 rounded-lg transition-colors duration-200 text-left ${bgColor} ${textColor}`}
      disabled={!isTeacherAvailable}
    >
      <p className="font-bold text-sm">{entry.subject}</p>
      <p className="text-xs">{entry.teacher}</p>
      <p className="text-xs font-medium">Room: {entry.room}</p>
    </button>
  );
};

const LoginPage = ({ onLoginSuccess, setPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(`${API_URL}/users/login`, {
        email,
        password,
      });
      onLoginSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Welcome Back
      </h2>
      {error && <Alert message={error} />}
      <form onSubmit={submitHandler}>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Logging In..." : "Login"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-4">
        Don't have an account?{" "}
        <button
          onClick={() => setPage("register")}
          className="font-semibold text-blue-600 hover:underline"
        >
          Register here
        </button>
      </p>
    </div>
  );
};

const RegisterPage = ({ onRegisterSuccess, setPage }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(`${API_URL}/users`, {
        name,
        email,
        password,
      });
      onRegisterSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Create Account
      </h2>
      {error && <Alert message={error} />}
      <form onSubmit={submitHandler}>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-4">
        Already have an account?{" "}
        <button
          onClick={() => setPage("login")}
          className="font-semibold text-blue-600 hover:underline"
        >
          Login here
        </button>
      </p>
    </div>
  );
};

const AttendancePage = ({ batchName, subject, teacherName, onBack }) => {
  const videoRef = useRef();
  const [status, setStatus] = useState("Loading Models...");
  const [labeledDescriptors, setLabeledDescriptors] = useState(null);
  const [presentStudents, setPresentStudents] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    const loadAndStart = async () => {
      try {
        const { data: students } = await axios.get(
          `${API_URL}/students?batchName=${batchName}`
        );
        if (students.length === 0) {
          setStatus("No students registered for this batch.");
          return;
        }
        const descriptors = students.map(
          (student) =>
            new faceapi.LabeledFaceDescriptors(student.name, [
              new Float32Array(student.faceDescriptor),
            ])
        );
        setLabeledDescriptors(descriptors);
        startVideo();
      } catch (err) {
        setStatus("Error loading student data.");
      }
    };
    loadAndStart();
  }, [batchName]);
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStatus("Ready to Capture");
        }
      })
      .catch((err) => setStatus("Camera permission denied."));
  };
  const handleCapture = async () => {
    if (!labeledDescriptors) {
      setStatus("Student face data not ready.");
      return;
    }
    setStatus("Detecting faces...");
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();
    const recognizedStudents = new Set();
    detections.forEach((detection) => {
      const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
      if (bestMatch.label !== "unknown")
        recognizedStudents.add(bestMatch.label);
    });
    setPresentStudents(Array.from(recognizedStudents));
    setStatus(`Found ${recognizedStudents.size} students. Review and save.`);
  };
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: allStudents } = await axios.get(
        `${API_URL}/students?batchName=${batchName}`
      );
      const presentStudentIds = allStudents
        .filter((s) => presentStudents.includes(s.name))
        .map((s) => s._id);
      await axios.post(`${API_URL}/attendance`, {
        date: new Date(),
        batchName,
        subject,
        teacherName,
        presentStudents: presentStudentIds,
      });
      alert("Attendance saved successfully!");
      onBack();
    } catch (err) {
      alert("Failed to save attendance.");
    } finally {
      setIsSaving(false);
    }
  };
  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ["Attendance Report"],
      ["Date", new Date().toLocaleDateString()],
      ["Batch", batchName],
      ["Subject", subject],
      [],
      ["S.No", "Student Name"],
    ];
    presentStudents.forEach((name, index) => {
      wsData.push([index + 1, name]);
    });
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(
      wb,
      `Attendance_${batchName}_${subject}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );
  };
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <button
        onClick={onBack}
        className="mb-4 bg-gray-200 px-3 py-1 rounded-md text-sm hover:bg-gray-300"
      >
        ← Back to Dashboard
      </button>
      <h2 className="text-2xl font-bold text-center mb-2">Take Attendance</h2>
      <p className="text-center text-gray-600 mb-4">
        {batchName} - {subject}
      </p>
      <div className="text-center font-semibold mb-4">{status}</div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full rounded-lg border"
          ></video>
          <button
            onClick={handleCapture}
            disabled={status !== "Ready to Capture"}
            className="w-full mt-4 bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            Capture Attendance
          </button>
        </div>
        <div className="flex-1 border rounded-lg p-4 bg-gray-50">
          <h3 className="font-bold mb-2">
            Recognized Students ({presentStudents.length})
          </h3>
          <ul className="list-disc pl-5 h-64 overflow-y-auto">
            {presentStudents.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={presentStudents.length === 0 || isSaving}
              className="flex-1 bg-green-500 text-white font-semibold py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400"
            >
              {isSaving ? "Saving..." : "Save to DB"}
            </button>
            <button
              onClick={handleExport}
              disabled={presentStudents.length === 0}
              className="flex-1 bg-gray-500 text-white font-semibold py-2 rounded-md hover:bg-gray-600 disabled:bg-gray-400"
            >
              Export Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PhotoAttendancePage = ({ batches, userInfo, onBack }) => {
  const [selectedBatch, setSelectedBatch] = useState("");
  const [allStudentsInBatch, setAllStudentsInBatch] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [status, setStatus] = useState(
    "Please select a batch and upload a photo."
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [presentStudents, setPresentStudents] = useState([]);

  useEffect(() => {
    if (!selectedBatch) {
      setAllStudentsInBatch([]);
      return;
    }
    const fetchStudents = async () => {
      try {
        setStatus("Fetching student data for the batch...");
        const { data } = await axios.get(
          `${API_URL}/students?batchName=${selectedBatch}`
        );
        setAllStudentsInBatch(data);
        setStatus("Ready to process photo.");
      } catch (err) {
        setStatus("Error: Could not fetch student data.");
        setAllStudentsInBatch([]);
      }
    };
    fetchStudents();
  }, [selectedBatch]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setPresentStudents([]);
    }
  };

  const handleProcessPhoto = async () => {
    if (!photoFile || allStudentsInBatch.length === 0) {
      setStatus("Please select a batch, its students, and a photo first.");
      return;
    }
    setIsProcessing(true);
    setStatus("Processing... Preparing face descriptors.");

    try {
      const labeledDescriptors = allStudentsInBatch.map(
        (student) =>
          new faceapi.LabeledFaceDescriptors(student.name, [
            new Float32Array(student.faceDescriptor),
          ])
      );
      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);

      setStatus("Detecting faces in the group photo...");
      const image = await faceapi.bufferToImage(photoFile);
      const detections = await faceapi
        .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      setStatus(
        `Found ${detections.length} faces. Matching with student database...`
      );

      const recognizedStudents = new Set();
      detections.forEach((detection) => {
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
        if (bestMatch.label !== "unknown") {
          recognizedStudents.add(bestMatch.label);
        }
      });

      setPresentStudents(Array.from(recognizedStudents));
      setStatus(
        `Recognition complete. Found ${recognizedStudents.size} students. Please review and save.`
      );
    } catch (err) {
      setStatus("An error occurred during face recognition.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAttendance = async () => {
    if (!selectedBatch || presentStudents.length === 0) {
      alert("No students recognized or batch not selected.");
      return;
    }
    const subjectForAttendance = "Group Photo Attendance";

    const presentStudentIds = allStudentsInBatch
      .filter((student) => presentStudents.includes(student.name))
      .map((student) => student._id);

    try {
      await axios.post(`${API_URL}/attendance`, {
        date: new Date(),
        batchName: selectedBatch,
        subject: subjectForAttendance,
        teacherName: userInfo.name,
        presentStudents: presentStudentIds,
      });
      alert("Attendance saved successfully!");
      onBack();
    } catch (err) {
      alert("Failed to save attendance.");
    }
  };

  const absentStudents = useMemo(() => {
    return allStudentsInBatch
      .map((s) => s.name)
      .filter((name) => !presentStudents.includes(name));
  }, [allStudentsInBatch, presentStudents]);

  return (
    <div className="container mx-auto p-8 max-w-5xl">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <button
          onClick={onBack}
          className="mb-4 bg-gray-200 px-3 py-1 rounded-md text-sm hover:bg-gray-300"
        >
          ← Back to Dashboard
        </button>
        <h2 className="text-2xl font-bold text-center mb-4">
          Attendance from Group Photo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1. Select Batch
                </label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white"
                  required
                >
                  <option value="">-- Select a Batch --</option>
                  {batches.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  2. Upload Group Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm"
                />
              </div>
              <button
                onClick={handleProcessPhoto}
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                disabled={isProcessing || !photoFile || !selectedBatch}
              >
                {isProcessing ? "Processing..." : "3. Recognize Students"}
              </button>
            </div>
            <p className="text-center text-gray-600 mt-4 text-sm font-semibold">
              {status}
            </p>
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Class"
                className="mt-4 rounded-lg shadow-md w-full"
              />
            )}
          </div>
          <div className="border rounded-lg p-4 bg-gray-50 h-full">
            <h3 className="text-xl font-bold text-gray-700 mb-4">
              Recognition Results
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-600">
                  Present ({presentStudents.length})
                </h4>
                <ul className="list-disc pl-5 mt-2 h-64 overflow-y-auto text-sm">
                  {presentStudents.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-600">
                  Absent ({absentStudents.length})
                </h4>
                <ul className="list-disc pl-5 mt-2 h-64 overflow-y-auto text-sm">
                  {absentStudents.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              onClick={handleSaveAttendance}
              className="w-full mt-6 bg-green-500 text-white font-semibold py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400"
              disabled={isProcessing || presentStudents.length === 0}
            >
              Save Attendance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Find the BulkUploadPage component in your App.jsx and replace it with this ---

const BulkUploadPage = ({ batches, onBack }) => {
  const [selectedBatch, setSelectedBatch] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMessage, setProgressMessage] = useState(
    "Please select a batch and upload the required files."
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleBulkUpload = async () => {
    if (!selectedBatch || !excelFile || !zipFile) {
      setError(
        "Please select a batch and upload both the Excel and ZIP files."
      );
      return;
    }

    setIsProcessing(true);
    setError("");
    setSuccess("");

    try {
      // Step 1: Read the Excel file
      setProgressMessage("Reading student data from Excel file...");
      const reader = new FileReader();
      reader.readAsArrayBuffer(excelFile);
      const studentData = await new Promise((resolve, reject) => {
        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          resolve(json);
        };
        reader.onerror = reject;
      });

      if (!studentData[0]?.Name || !studentData[0]?.RollNumber) {
        throw new Error(
          "Excel file must have 'Name' and 'RollNumber' columns."
        );
      }

      // Step 2: Read the ZIP file (Robust version)
      setProgressMessage("Unzipping photo files...");
      const zip = await JSZip.loadAsync(zipFile);
      const imageFiles = {};
      // This loop now handles files inside folders
      for (const fullPath in zip.files) {
        const file = zip.files[fullPath];
        if (
          !file.dir &&
          (file.name.endsWith(".jpg") ||
            file.name.endsWith(".jpeg") ||
            file.name.endsWith(".png"))
        ) {
          // Extract just the filename from the full path (e.g., "photos/TS01.jpg" -> "TS01.jpg")
          const filename = fullPath.split("/").pop();
          const fileData = await file.async("blob");
          // Store it with a lowercase key for case-insensitive matching
          imageFiles[filename.toLowerCase()] = fileData;
        }
      }

      // Step 3: Process each student
      const studentsToUpload = [];
      for (let i = 0; i < studentData.length; i++) {
        const student = studentData[i];
        // Trim whitespace from roll number
        const rollNumber = student.RollNumber.toString().trim();
        setProgressMessage(
          `Processing student ${i + 1}/${studentData.length}: ${student.Name}`
        );

        // Case-insensitive lookup for the image file
        const lowerCaseRoll = rollNumber.toLowerCase();
        const imageFile =
          imageFiles[`${lowerCaseRoll}.jpg`] ||
          imageFiles[`${lowerCaseRoll}.jpeg`] ||
          imageFiles[`${lowerCaseRoll}.png`];

        if (!imageFile) {
          console.warn(
            `Photo not found for Roll Number: ${rollNumber}. Skipping.`
          );
          continue; // Skip this student if no photo is found
        }

        // Generate face descriptor
        const image = await faceapi.bufferToImage(imageFile);
        const detection = await faceapi
          .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          studentsToUpload.push({
            name: student.Name,
            rollNumber: rollNumber,
            batchName: selectedBatch,
            faceDescriptor: Array.from(detection.descriptor),
          });
        } else {
          console.warn(
            `No face detected for Roll Number: ${rollNumber}. Skipping.`
          );
        }
      }

      if (studentsToUpload.length === 0) {
        throw new Error(
          "Processing complete, but no valid students with matching photos were found to upload."
        );
      }

      // Step 4: Send data to the backend
      setProgressMessage("Uploading processed data to the server...");
      const { data } = await axios.post(`${API_URL}/students/bulk`, {
        students: studentsToUpload,
      });
      setSuccess(data.message || "Bulk upload completed successfully!");
      setProgressMessage("Done.");
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred during the upload process.");
      setProgressMessage("Process failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <button
          onClick={onBack}
          className="mb-4 bg-gray-200 px-3 py-1 rounded-md text-sm hover:bg-gray-300"
        >
          ← Back to Dashboard
        </button>
        <h2 className="text-2xl font-bold text-center mb-6">
          Bulk Upload Students
        </h2>

        {error && <Alert message={error} type="error" />}
        {success && <Alert message={success} type="success" />}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              1. Select Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-white"
              required
            >
              <option value="">-- Select a Batch --</option>
              {batches.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              2. Upload Student Data (Excel)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Must contain columns: `Name` and `RollNumber`
            </p>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => setExcelFile(e.target.files[0])}
              className="w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              3. Upload Student Photos (ZIP)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Image files inside must be named by roll number (e.g., `TS01.jpg`)
            </p>
            <input
              type="file"
              accept=".zip"
              onChange={(e) => setZipFile(e.target.files[0])}
              className="w-full text-sm"
            />
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleBulkUpload}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Start Bulk Upload"}
          </button>
          {isProcessing && (
            <p className="text-center text-gray-600 mt-4 text-sm font-semibold">
              {progressMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- ADMIN DASHBOARD ---
const AdminDashboard = ({ userInfo, onLogout, onNavigate }) => {
  const navigate = useNavigate();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [timetables, setTimetables] = useState([]);
  const [selectedBatchName, setSelectedBatchName] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [classrooms, setClassrooms] = useState("CR1, CR2, CR3, CR4, CR5");
  const [labs, setLabs] = useState("LB1, LB2, LB3, LB4");
  const [newTeacherName, setNewTeacherName] = useState("");
  const [selectedTeacherSubjects, setSelectedTeacherSubjects] = useState([]);
  const [newBatchName, setNewBatchName] = useState("");
  const [selectedBatchSubjects, setSelectedBatchSubjects] = useState([]);
  const [selectedBatchLabs, setSelectedBatchLabs] = useState([]);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentRoll, setNewStudentRoll] = useState("");
  const [newStudentBatch, setNewStudentBatch] = useState("");
  const [newStudentPhoto, setNewStudentPhoto] = useState(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("timetable");

  useEffect(() => {
    const loadModels = async () => {
      try {
        // The path to the models should be relative to the public folder
        const modelPath = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
          faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Error loading models:", err);
        setError(
          "Failed to load AI models. Please check the 'public/models' folder and refresh."
        );
      }
    };
    loadModels();
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [teachersRes, batchesRes, studentsRes, timetablesRes] =
        await Promise.all([
          axios.get(`${API_URL}/teachers`),
          axios.get(`${API_URL}/timetables/batch`),
          axios.get(`${API_URL}/students`),
          axios.get(`${API_URL}/timetables`),
        ]);
      setTeachers(teachersRes.data);
      setBatches(batchesRes.data);
      setStudents(studentsRes.data);
      setTimetables(timetablesRes.data);
      if (batchesRes.data.length > 0 && !selectedBatchName)
        setSelectedBatchName(batchesRes.data[0].name);
    } catch (err) {
      setError("Failed to fetch initial data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudentPhoto) {
      setError("Please upload a reference photo.");
      return;
    }
    setIsProcessingPhoto(true);
    setError("");

    try {
      const image = await faceapi.bufferToImage(newStudentPhoto);
      const detection = await faceapi
        .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError("No face detected. Please use a clear photo.");
        setIsProcessingPhoto(false);
        return;
      }

      await axios.post(`${API_URL}/students`, {
        name: newStudentName,
        rollNumber: newStudentRoll,
        batchName: newStudentBatch,
        faceDescriptor: Array.from(detection.descriptor),
      });

      setNewStudentName("");
      setNewStudentRoll("");
      setNewStudentBatch("");
      setNewStudentPhoto(null);
      const fileInput = document.getElementById("student-photo-input");
      if (fileInput) fileInput.value = "";

      fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to add student."
      );
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/teachers`, {
        name: newTeacherName,
        subjects: selectedTeacherSubjects,
      });
      setNewTeacherName("");
      setSelectedTeacherSubjects([]);
      fetchData();
    } catch (err) {
      setError("Failed to add teacher.");
    }
  };
  const handleAddBatch = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/timetables/batch`, {
        name: newBatchName,
        subjects: selectedBatchSubjects,
        labs: selectedBatchLabs,
      });
      setNewBatchName("");
      setSelectedBatchSubjects([]);
      setSelectedBatchLabs([]);
      fetchData();
      if (!selectedBatchName) {
        setSelectedBatchName(newBatchName);
      }
    } catch (err) {
      setError("Failed to add batch.");
    }
  };
  const handleDeleteTeacher = async (teacherId) => {
    if (window.confirm("Are you sure?")) {
      try {
        await axios.delete(`${API_URL}/teachers/${teacherId}`);
        fetchData();
      } catch (err) {
        setError("Failed to delete teacher.");
      }
    }
  };
  const handleDeleteBatch = async (batchId) => {
    if (window.confirm("Are you sure?")) {
      try {
        await axios.delete(`${API_URL}/timetables/batch/${batchId}`);
        fetchData();
      } catch (err) {
        setError("Failed to delete batch.");
      }
    }
  };
  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    setSuccess("");
    try {
      const generationConfig = {
        classrooms: classrooms
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        labs: labs
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const { data } = await axios.post(
        `${API_URL}/timetables/generate`,
        generationConfig
      );
      setSuccess(data.message || "Timetables generated successfully!");
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate timetables.");
    } finally {
      setGenerating(false);
    }
  };

  const batchNamesForDropdown = useMemo(
    () => batches.map((b) => b.name).sort(),
    [batches]
  );
  const selectedTimetable = useMemo(
    () => timetables.find((t) => t.batchName === selectedBatchName),
    [timetables, selectedBatchName]
  );
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const timeSlots = [
    "09:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "12:00-13:00",
    "13:00-14:00",
    "14:00-15:00",
    "15:00-16:00",
    "16:00-17:00",
  ];

  return (
    <div className="container mx-auto p-4 sm:p-8 max-w-7xl">
      <header className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left mb-6">
        <div>
          <button
            onClick={() => navigate("/")}
            className="mb-4 bg-gray-200 px-3 py-1 rounded-md text-sm hover:bg-gray-300"
          >
            ← Back to Home
          </button>
          <h1 className="text-4xl font-bold text-gray-800">
            Facial Recognition Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome, <span className="font-semibold">{userInfo.name}</span>
          </p>
        </div>
        <button
          onClick={onLogout}
          className="mt-4 sm:mt-0 bg-red-500 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </header>
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("timetable")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "timetable"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Timetable & Management
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "reports"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Attendance Reports
          </button>
          <button
            onClick={() => onNavigate("photoAttendance", { batches: batches })}
            className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Photo Attendance
          </button>
          <button
            onClick={() => onNavigate("bulkUpload", { batches: batches })}
            className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Bulk Upload Students
          </button>
        </nav>
      </div>
      {error && <Alert message={error} />}
      {success && <Alert message={success} type="success" />}
      {activeTab === "timetable" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              {" "}
              <h3 className="text-xl font-bold text-gray-700 mb-4">
                Manage Teachers
              </h3>{" "}
              <form onSubmit={handleAddTeacher} className="space-y-3">
                <input
                  type="text"
                  placeholder="Teacher Name"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
                <MultiSelectDropdown
                  placeholder="Select Subjects"
                  allOptions={PREDEFINED_SUBJECTS}
                  selectedOptions={selectedTeacherSubjects}
                  setSelectedOptions={setSelectedTeacherSubjects}
                />
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 font-semibold w-full"
                >
                  Add Teacher
                </button>
              </form>
              <div className="mt-4 h-48 overflow-y-auto border rounded-md p-2 bg-gray-50">
                <div className="text-sm p-2 border-b font-semibold text-gray-700">
                  Existing Teachers
                </div>
                {teachers.map((t) => (
                  <div
                    key={t._id}
                    className="flex justify-between items-center text-sm p-2 border-b"
                  >
                    <span>
                      {t.name}{" "}
                      <span className="text-gray-500">
                        ({t.subjects.join(", ")})
                      </span>
                    </span>
                    <button
                      onClick={() => handleDeleteTeacher(t._id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>{" "}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              {" "}
              <h3 className="text-xl font-bold text-gray-700 mb-4">
                Manage Batches
              </h3>{" "}
              <form onSubmit={handleAddBatch} className="space-y-3">
                <input
                  type="text"
                  placeholder="Batch Name"
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
                <MultiSelectDropdown
                  placeholder="Select Subjects"
                  allOptions={PREDEFINED_SUBJECTS.filter(
                    (s) => !s.toLowerCase().includes("lab")
                  )}
                  selectedOptions={selectedBatchSubjects}
                  setSelectedOptions={setSelectedBatchSubjects}
                />
                <MultiSelectDropdown
                  placeholder="Select Labs"
                  allOptions={PREDEFINED_SUBJECTS.filter((s) =>
                    s.toLowerCase().includes("lab")
                  )}
                  selectedOptions={selectedBatchLabs}
                  setSelectedOptions={setSelectedBatchLabs}
                />
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 font-semibold w-full"
                >
                  Add Batch
                </button>
              </form>
              <div className="mt-4 h-48 overflow-y-auto border rounded-md bg-gray-50">
                <div className="text-sm p-2 border-b font-semibold text-gray-700">
                  Existing Batches
                </div>
                {batches.map((b) => (
                  <BatchListItem
                    key={b._id}
                    batch={b}
                    onDelete={handleDeleteBatch}
                  />
                ))}
              </div>{" "}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              {" "}
              <h3 className="text-xl font-bold text-gray-700 mb-4">
                Manage Students
              </h3>{" "}
              <form onSubmit={handleAddStudent} className="space-y-3">
                <input
                  type="text"
                  placeholder="Student Name"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
                <input
                  type="text"
                  placeholder="Roll Number"
                  value={newStudentRoll}
                  onChange={(e) => setNewStudentRoll(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
                <select
                  value={newStudentBatch}
                  onChange={(e) => setNewStudentBatch(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white"
                  required
                >
                  <option value="">Select Batch</option>
                  {batches.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <input
                  id="student-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewStudentPhoto(e.target.files[0])}
                  className="w-full text-sm"
                />
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 font-semibold w-full"
                  disabled={!modelsLoaded || isProcessingPhoto}
                >
                  {modelsLoaded
                    ? isProcessingPhoto
                      ? "Processing Photo..."
                      : "Add Student"
                    : "Loading AI Models..."}
                </button>
              </form>
              <div className="mt-4 h-48 overflow-y-auto border rounded-md p-2 bg-gray-50">
                <div className="text-sm p-2 border-b font-semibold text-gray-700">
                  Existing Students
                </div>
                {students.map((s) => (
                  <div key={s._id} className="text-sm p-2 border-b">
                    {s.name} ({s.rollNumber}) - {s.batchName}
                  </div>
                ))}
              </div>{" "}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h3 className="text-xl font-bold text-gray-700 mb-4">
              Generate & View Timetables
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classrooms
                </label>
                <textarea
                  rows="2"
                  value={classrooms}
                  onChange={(e) => setClassrooms(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Labs
                </label>
                <textarea
                  rows="2"
                  value={labs}
                  onChange={(e) => setLabs(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                ></textarea>
              </div>
              <button
                onClick={handleGenerate}
                className="w-full h-full bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700"
                disabled={generating}
              >
                {generating ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
          {loading ? (
            <Spinner />
          ) : (
            batchNamesForDropdown.length > 0 && (
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
                <div className="flex justify-center mb-6">
                  <select
                    value={selectedBatchName}
                    onChange={(e) => setSelectedBatchName(e.target.value)}
                    className="px-4 py-2 border rounded-md shadow-sm bg-white"
                  >
                    <option value="">Select Batch</option>
                    {batchNamesForDropdown.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedTimetable ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="p-3 font-semibold text-left text-xs text-gray-400 uppercase w-32">
                            Time Slot
                          </th>
                          {weekdays.map((day) => (
                            <th
                              key={day}
                              className="p-3 font-semibold text-center text-xs text-gray-400 uppercase"
                            >
                              {day}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {timeSlots.map((slot) => (
                          <tr key={slot} className="border-t">
                            <td className="p-3 font-medium text-sm text-gray-600 align-top">
                              {slot}
                            </td>
                            {weekdays.map((day) => (
                              <td
                                key={day}
                                className="p-2 align-top"
                                style={{ minWidth: "150px", height: "80px" }}
                              >
                                <ClassCell
                                  entry={
                                    selectedTimetable.schedule[day]?.[slot]
                                  }
                                  onStartAttendance={(subject) =>
                                    onNavigate("attendance", {
                                      batchName: selectedTimetable.batchName,
                                      subject,
                                      teacherName: userInfo.name,
                                    })
                                  }
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-600">
                    Timetable not generated for this batch.
                  </div>
                )}
              </div>
            )
          )}
        </>
      )}
      {activeTab === "reports" && <ReportsPage batches={batches} />}
    </div>
  );
};

// --- REPORTS PAGE ---
const ReportsPage = ({ batches }) => {
  const [selectedBatch, setSelectedBatch] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAttendanceData = async () => {
    if (!selectedBatch) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(
        `${API_URL}/attendance/reports?batchName=${selectedBatch}`
      );
      setAttendanceData(data);
    } catch (err) {
      setError("Failed to fetch attendance data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBatch) {
      fetchAttendanceData();
    }
  }, [selectedBatch]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-700 mb-4">
          Attendance Reports
        </h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-white"
            >
              <option value="">-- Select a Batch --</option>
              {batches.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchAttendanceData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            disabled={!selectedBatch || loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && <Alert message={error} />}

      {attendanceData.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h4 className="text-lg font-semibold text-gray-700 mb-4">
            Attendance Summary
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-600">
                    Subject
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-600">
                    Teacher
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-600">
                    Present
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-600">
                    Total
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-600">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((record, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3 text-sm">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-sm">{record.subject}</td>
                    <td className="p-3 text-sm">{record.teacherName}</td>
                    <td className="p-3 text-sm">
                      {record.presentStudents?.length || 0}
                    </td>
                    <td className="p-3 text-sm">{record.totalStudents || 0}</td>
                    <td className="p-3 text-sm">
                      {record.totalStudents > 0
                        ? `${Math.round(
                            ((record.presentStudents?.length || 0) /
                              record.totalStudents) *
                              100
                          )}%`
                        : "0%"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedBatch && attendanceData.length === 0 && !loading && (
        <div className="text-center p-8 text-gray-600">
          No attendance records found for this batch.
        </div>
      )}
    </div>
  );
};

// --- MAIN APP CONTROLLER ---
function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [page, setPage] = useState({ name: "login", props: {} });
  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
      setPage({ name: "dashboard", props: {} });
    }
  }, []);
  const handleLoginSuccess = (data) => {
    localStorage.setItem("userInfo", JSON.stringify(data));
    setUserInfo(data);
    setPage({ name: "dashboard", props: {} });
  };
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUserInfo(null);
    setPage({ name: "login", props: {} });
  };
  const handleNavigate = (pageName, props = {}) => {
    setPage({ name: pageName, props });
  };

  const renderContent = () => {
    if (!userInfo) {
      return (
        <div className="flex items-center justify-center h-screen">
          {page.name === "login" ? (
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              setPage={(p) => handleNavigate(p)}
            />
          ) : (
            <RegisterPage
              onRegisterSuccess={handleLoginSuccess}
              setPage={(p) => handleNavigate(p)}
            />
          )}
        </div>
      );
    }
    switch (page.name) {
      case "attendance":
        return (
          <AttendancePage
            {...page.props}
            onBack={() => handleNavigate("dashboard")}
          />
        );
      case "photoAttendance":
        return (
          <PhotoAttendancePage
            {...page.props}
            userInfo={userInfo}
            onBack={() => handleNavigate("dashboard")}
          />
        );
      case "bulkUpload":
        return (
          <BulkUploadPage
            {...page.props}
            onBack={() => handleNavigate("dashboard")}
          />
        );
      case "dashboard":
      default:
        return (
          <AdminDashboard
            userInfo={userInfo}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />
        );
    }
  };
  return (
    <div className="bg-gray-100 min-h-screen font-sans">{renderContent()}</div>
  );
}

export default App;

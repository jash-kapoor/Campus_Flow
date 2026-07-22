import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- CONFIGURATION ---
const API_URL = "http://localhost:5001/api";
// Attach JWT to all requests if available
axios.interceptors.request.use((config) => {
  const stored = localStorage.getItem('userInfo');
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- PREDEFINED DATA ---
// const PREDEFINED_SUBJECTS = [
//   "Engineering Maths-I", "Physics", "Intro to Programming", "Digital Design", "Communication Skills", "Physics Lab", "Programming Lab", "Digital Design Lab",
//   "Data Structures", "Object-Oriented Programming", "Discrete Mathematics", "Computer Organization", "Operating Systems", "Data Structures Lab", "OOP Lab", "OS Lab",
//   "Applied Chemistry", "Basic Electrical Engineering", "Engineering Mechanics", "Workshop Practice", "Applied Chemistry Lab", "Basic Electrical Engineering Lab", "Workshop",
//   "Signals & Systems", "Analog Electronics", "Digital Circuits", "Network Theory", "Electromagnetic Fields", "Analog Electronics Lab", "Digital Circuits Lab", "Network Theory Lab",
//   "Database Management", "Software Engineering", "Computer Networks", "DBMS Lab", "Networks Lab",
// ].sort();


const PREDEFINED_SUBJECTS = [
  // Semester I Courses
  "Digital Design (DD)", 
  "Engineering Physics (EP)", 
  "Fundamentals of Computer Programming (FCP)", 
  "Engineering Mathematics - I (EM-I)", 
  "Electrical Circuit Analysis (ECA)",
  "Indian Constitution (IC)",
  "Digital Design Lab (DD LAB)",
  "ICT Workshop - I Lab (ICTW-I LAB)",
  "Engineering Physics Lab (EP LAB)", 
  "Fundamentals of Computer Programming Lab (FCP LAB)", 
  "Physics Lab (PHY LAB)", 
  // "ADVOCATE Session (ADVOCATE)", // Listed as a session with an instructor's title

  // Semester III Courses
  "Principles of Fundamentals of Programming Structures (PFPS)", 
  "Probability & Statistical Analysis (P&SA)", 
  "Automata and Formal Languages (A&FL)", 
  "Discrete Mathematical Structures (DMS)", 
  "Operating Systems (OS)", 
  "Economics & Business Management (E&BM)", 
  "Signals & Systems (S&S)", 
  "Electronic Circuits (EC)", 
  "Electrical Networks (EN)", 
  "DBMS Lab", 
  "PFPS Lab", 
  "OS Lab", 
  "Signals & Systems Lab (S&S LAB)", 
  "Electronic Circuits Lab (EC LAB)", // Appears as EC LAB-2, EC LAB-3

  // Semester V Courses
  "Image Processing & Computer Vision (IP&CV)", 
  "Cloud Computing & Big Data Infrastructure (CC&BDI)", 
  "Object Oriented Programming (OOP)", 
  "Wireless Communication (WC)", 
  "Nanoscale Device Engineering (NDE)",
  "Innovation & Entrepreneurship (I&E)", 
  "Fuzzy & Neural Networks (F&NN)", 
  "Computer Graphics (CG)", 
  "High-Performance Computing (HPC)", 
  "Data Science (DS)", 
  "Image Processing & Computer Vision Lab (IP&CV Lab)", 
  "Cloud Computing & Big Data Infrastructure Lab (CC&BDI Lab)", 
  "Wireless Communication Lab (WC Lab)", 
  "Data Science Lab (DS Lab)", 
  "Computer Graphics Lab (CG Lab)", 
  "HPC Lab", 

  // Semester VII Courses
  "Behavioral Aspects of Law (BaL)", 
  "Cyber Ethics & Professional Practice (CE&PP)", 
  "Natural Language Processing (NLP)", 
  "Artificial Intelligence (Al)", 
  "Internet of Things (IOT)", 
  "NS", // Unspecified subject name
  "Natural Language Processing Lab (NLP Lab)", 
  "NS Lab", 
  "AI Lab", 
  "Communication Lab (CL Lab)",
  "IOT Lab", 

  // Generic Labs appearing across semesters (CSE/ECE)
  "Computer Science Lab (CS LAB)",
  "Extra Curricular Activity (ECA)" // Treated as a non-academic slot in the time table
].sort();
// --- HELPER COMPONENTS ---
const Spinner = () => (
  <div className="flex justify-center items-center h-full my-10">
    <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
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

const ClassCell = ({ entry }) => {
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
  const roomColor = isTeacherAvailable ? "text-gray-600" : "text-red-600";
  return (
    <div
      className={`p-2 rounded-lg h-full transition-colors duration-200 ${bgColor} ${textColor}`}
    >
      <p className="font-bold text-sm">{entry.subject}</p>
      <p className={`text-xs ${roomColor}`}>{entry.teacher}</p>
      <p className={`text-xs font-medium ${roomColor}`}>Room: {entry.room}</p>
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

  const handleSelect = (option) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

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

// --- AUTH PAGES (MODIFIED for Email Login) ---
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
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(
          err.response?.data?.message || "An error occurred during login."
        );
      }
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
          <label className="block text-gray-700 font-semibold mb-1">Email</label>
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
      const { data } = await axios.post(`${API_URL}/users`, { name, email, password });
      onRegisterSuccess(data);
    } catch (err) {
      console.error('Register error:', err);
      if (err.response?.status === 400) {
        setError(err.response?.data?.message || "User already exists or invalid data.");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(
          err.response?.data?.message || "An error occurred during registration."
        );
      }
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
          <label className="block text-gray-700 font-semibold mb-1">Email</label>
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

// --- ADMIN DASHBOARD ---
const AdminDashboard = ({ userInfo, onLogout }) => {
  const [timetables, setTimetables] = useState([]);
  const [selectedBatchName, setSelectedBatchName] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [classrooms, setClassrooms] = useState("CR1, CR2, CR3, CR4, CR5");
  const [labs, setLabs] = useState("LB1, LB2, LB3, LB4");

  const [newTeacherName, setNewTeacherName] = useState("");
  const [selectedTeacherSubjects, setSelectedTeacherSubjects] = useState([]);
  const [newBatchName, setNewBatchName] = useState("");
  const [selectedBatchSubjects, setSelectedBatchSubjects] = useState([]);
  const [selectedBatchLabs, setSelectedBatchLabs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Invite member state
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Check if user is authenticated
      const stored = localStorage.getItem('userInfo');
      if (!stored) {
        setError("Please login to access the dashboard.");
        setLoading(false);
        return;
      }

      const [teachersRes, batchesRes, timetablesRes] = await Promise.all([
        axios.get(`${API_URL}/teachers`),
        axios.get(`${API_URL}/timetables/batch`),
        axios.get(`${API_URL}/timetables`),
      ]);
      setTeachers(teachersRes.data || []);
      setBatches(batchesRes.data || []);
      setTimetables(timetablesRes.data || []);
      if (batchesRes.data && batchesRes.data.length > 0 && !selectedBatchName) {
        setSelectedBatchName(batchesRes.data[0].name);
      } else if (!batchesRes.data || batchesRes.data.length === 0) {
        setSelectedBatchName("");
      }
    } catch (err) {
      console.error('Fetch data error:', err);
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        // Clear invalid token
        localStorage.removeItem('userInfo');
        window.location.reload();
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to fetch initial data. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/teachers`, {
        name: newTeacherName,
        subjects: selectedTeacherSubjects,
      });
      setNewTeacherName("");
      setSelectedTeacherSubjects([]);
      setSuccess("Teacher added successfully!");
      fetchData();
    } catch (err) {
      console.error('Add teacher error:', err);
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem('userInfo');
        window.location.reload();
      } else {
        setError(err.response?.data?.message || "Failed to add teacher.");
      }
    }
  };
  const handleInvite = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await axios.post(`${API_URL}/users/invite`, {
        name: inviteName,
        email: inviteEmail,
        password: invitePassword,
      });
      setInviteName("");
      setInviteEmail("");
      setInvitePassword("");
      setSuccess("Member invited successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to invite member.");
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
      setSelectedBatchName(newBatchName);
      setNewBatchName("");
      setSelectedBatchSubjects([]);
      setSelectedBatchLabs([]);
      setSuccess("Batch added successfully!");
      fetchData();
    } catch (err) {
      console.error('Add batch error:', err);
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem('userInfo');
        window.location.reload();
      } else {
        setError(err.response?.data?.message || "Failed to add batch.");
      }
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        await axios.delete(`${API_URL}/teachers/${teacherId}`);
        setSuccess("Teacher deleted successfully!");
        fetchData();
      } catch (err) {
        console.error('Delete teacher error:', err);
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
          localStorage.removeItem('userInfo');
          window.location.reload();
        } else {
          setError(err.response?.data?.message || "Failed to delete teacher.");
        }
      }
    }
  };
  const handleDeleteBatch = async (batchId) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      try {
        await axios.delete(`${API_URL}/timetables/batch/${batchId}`);
        setSuccess("Batch deleted successfully!");
        fetchData();
      } catch (err) {
        console.error('Delete batch error:', err);
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
          localStorage.removeItem('userInfo');
          window.location.reload();
        } else {
          setError(err.response?.data?.message || "Failed to delete batch.");
        }
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
      console.error('Generate timetables error:', err);
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem('userInfo');
        window.location.reload();
      } else {
        setError(err.response?.data?.message || "Failed to generate timetables.");
      }
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
      <header className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Timetable Generator</h1>
          <p className="text-gray-500 mt-1">
            Welcome, <span className="font-semibold">{userInfo.name}</span>
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-500 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-gray-600 transition-colors"
          >
            ← Back to Home
          </button>
          <button
            onClick={onLogout}
            className="bg-red-500 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {error && <Alert message={error} />}
      {success && <Alert message={success} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {userInfo.role === 'admin' && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-700 mb-4">Invite Member</h3>
            <form onSubmit={handleInvite} className="space-y-3">
              <input type="text" placeholder="Name" value={inviteName} onChange={(e)=>setInviteName(e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
              <input type="email" placeholder="Email" value={inviteEmail} onChange={(e)=>setInviteEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
              <input type="password" placeholder="Temp Password" value={invitePassword} onChange={(e)=>setInvitePassword(e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-semibold w-full">Invite</button>
            </form>
          </div>
        )}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-700 mb-4">
            Manage Teachers
          </h3>
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
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-700 mb-4">
            Manage Batches
          </h3>
          <form onSubmit={handleAddBatch} className="space-y-3">
            <input
              type="text"
              placeholder="Batch Name (e.g., FY-CSE)"
              value={newBatchName}
              onChange={(e) => setNewBatchName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
            <MultiSelectDropdown
              placeholder="Select Subjects"
              allOptions={PREDEFINED_SUBJECTS.filter(
                (s) =>
                  !s.toLowerCase().includes("lab") &&
                  !s.toLowerCase().includes("workshop")
              )}
              selectedOptions={selectedBatchSubjects}
              setSelectedOptions={setSelectedBatchSubjects}
            />
            <MultiSelectDropdown
              placeholder="Select Labs"
              allOptions={PREDEFINED_SUBJECTS.filter(
                (s) =>
                  s.toLowerCase().includes("lab") ||
                  s.toLowerCase().includes("workshop")
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
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h3 className="text-xl font-bold text-gray-700 mb-4">
          Generate Timetable
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
            className="w-full h-full bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            disabled={generating}
          >
            {generating ? "Generating..." : "Generate All Timetables"}
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
                <option value="">Select a Batch</option>
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
                              entry={selectedTimetable.schedule[day]?.[slot]}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : selectedBatchName ? (
              <div className="text-center p-8 text-gray-600">
                No timetable generated for this batch yet. Click "Generate All
                Timetables".
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500">
                Please select a batch to view its timetable.
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

// --- MAIN APP CONTROLLER ---
function TimetableApp() {
  const [userInfo, setUserInfo] = useState(null);
  const [page, setPage] = useState("login");
  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo(parsedUserInfo);
      } catch (error) {
        console.error('Error parsing user info:', error);
        localStorage.removeItem("userInfo");
        setUserInfo(null);
      }
    }
  }, []);
  const handleLoginSuccess = (data) => {
    localStorage.setItem("userInfo", JSON.stringify(data));
    setUserInfo(data);
  };
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUserInfo(null);
    setPage("login");
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      {userInfo ? (
        <AdminDashboard userInfo={userInfo} onLogout={handleLogout} />
      ) : page === "login" ? (
        <div className="flex items-center justify-center h-screen">
          <LoginPage onLoginSuccess={handleLoginSuccess} setPage={setPage} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <RegisterPage
            onRegisterSuccess={handleLoginSuccess}
            setPage={setPage}
          />
        </div>
      )}
    </div>
  );
}

export default TimetableApp;

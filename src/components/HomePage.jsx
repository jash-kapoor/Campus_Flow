import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Campus Flow
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Academic Management System
          </p>
          <p className="text-lg text-gray-500">
            Choose your preferred module to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Timetable Generator */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Timetable Generator
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Create and manage academic timetables with automated scheduling. 
                Add teachers, batches, and subjects to generate optimized timetables.
              </p>
              <button
                onClick={() => navigate('/timetable')}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Launch Timetable Generator
              </button>
            </div>
          </div>

          {/* Facial Recognition Attendance */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Facial Recognition Attendance
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Advanced attendance monitoring using facial recognition technology. 
                Take attendance with live camera or group photos, generate reports.
              </p>
              <button
                onClick={() => navigate('/facial-recognition')}
                className="w-full bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Launch Attendance Monitor
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Both modules share the same backend and user authentication system
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

# CampusFlow- Academic Management System

A comprehensive academic management system that combines timetable generation and facial recognition attendance monitoring.

## Features

### 🗓️ Timetable Generator
- Create and manage academic timetables with automated scheduling
- Add teachers, batches, and subjects
- Generate optimized timetables with conflict resolution
- Multi-tenant support for different institutions

### 👥 Facial Recognition Attendance
- Live camera attendance monitoring
- Group photo attendance processing
- Bulk student upload with Excel + ZIP photos
- Attendance reports and analytics
- Face recognition using face-api.js

## Project Structure

```
merged_project/
├── src/
│   ├── components/
│   │   ├── HomePage.jsx          # Landing page with project selection
│   │   ├── TimetableApp.jsx      # Timetable generator module
│   │   └── FacialRecognitionApp.jsx # Facial recognition module
│   ├── App.jsx                   # Main app with routing
│   └── main.jsx                  # Entry point
├── backend/                      # Node.js/Express backend
│   ├── config/                   # Database configuration
│   ├── controllers/              # API controllers
│   ├── middleware/               # Authentication middleware
│   ├── models/                   # MongoDB schemas
│   ├── routes/                   # API routes
│   └── utils/                    # Utility functions
├── public/
│   └── models/                   # Face recognition AI models
└── package.json
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Modern web browser with camera support (for facial recognition)

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd merged_project
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   npm run backend:install
   ```

4. **Set up environment variables:**
   Create a `.env` file in the `backend` directory:
   ```env
   MONGO_URI=mongodb://localhost:27017
   JWT_SECRET=your_jwt_secret_here
   MASTER_DB_NAME=aafok_master
   TENANT_DB_PREFIX=aafok_tenant_
   PORT=5001
   ```

5. **Start the backend server:**
   ```bash
   npm run backend
   ```

6. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

7. **Access the application:**
   - Open your browser and go to `http://localhost:3000`
   - Choose between Timetable Generator or Facial Recognition Attendance

## Usage

### Home Page
- Select "Timetable Generator" for academic scheduling
- Select "Facial Recognition Attendance" for attendance monitoring
- Both modules share the same backend and authentication

### Timetable Generator
1. Register/Login as an admin
2. Add teachers with their subject expertise
3. Create batches with subjects and labs
4. Configure classrooms and labs
5. Generate optimized timetables
6. View and manage timetables

### Facial Recognition Attendance
1. Register/Login as an admin
2. Add students with face photos
3. Use bulk upload for multiple students
4. Take attendance using live camera or group photos
5. Generate attendance reports

## API Endpoints

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users` - User registration
- `POST /api/users/invite` - Invite member (admin only)

### Timetable Management
- `GET /api/timetables` - Get all timetables
- `POST /api/timetables/generate` - Generate timetables
- `GET /api/timetables/batch` - Get all batches
- `POST /api/timetables/batch` - Create/update batch
- `DELETE /api/timetables/batch/:id` - Delete batch

### Teacher Management
- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Add teacher
- `DELETE /api/teachers/:id` - Delete teacher

### Student Management
- `GET /api/students` - Get all students
- `POST /api/students` - Add student
- `POST /api/students/bulk` - Bulk upload students

### Attendance
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/report` - Get attendance reports

## Technologies Used

### Frontend
- React 19
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- face-api.js (for facial recognition)
- XLSX (for Excel processing)
- JSZip (for ZIP file handling)

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- CORS


## Multi-Tenant Architecture

The system supports multiple institutions through tenant isolation:
- Each tenant has its own database
- User authentication is tenant-scoped
- Data is completely isolated between tenants

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team.

# Student Learning Management System (LMS)

A comprehensive, full-stack Learning Management System built for instructors to create courses and for students to enroll, track their progress, and complete lessons.

**Live Link** -https://student-lms-4t3w.vercel.app/

## 🚀 Required Deliverables Completed

✅ **Course creation + lesson creation workflow**: Instructors can easily create new courses, edit the courses, delete the courses and add lessons and delete the lessons.

✅ **Enrollment + completion tracking**: Students can enroll in courses, mark lessons as completed, track their overall progress and Download the certificate upon completion of the course.

✅ **Instructor + Student dashboards**: Dedicated, feature-rich dashboards catered to the roles of both instructor and student.

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js](https://nextjs.org/) (v16) with React 19
- **Styling**: Tailwind CSS & build-in animations
- **UI Components**: shadcn/ui (Radix UI & shadcn/ui)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React-Hot-toast

### Backend

- **Framework**: Node.js with Express (v5)
- **Database ORM**: Prisma (v7 adapter for PostgreSQL)
- **Database**: PostgreSQL (NeonDB)
- **Authentication**: JWT (JSON Web Tokens) & bcrypt for password hashing
- **File Storage**: Cloudinary (for course images/videos) & Multer
- **Validation**: Zod

---

## 📚 API Documentation

The complete API Documentation for this project is available. You can find the **Postman Collection** included in this repository to test the endpoints locally:

- [**`Student LMS API.postman_collection.json`**](./Student%20LMS%20API.postman_collection.json)

---

## ⚙️ Local Development Setup

### Prerequisites

- Node.js (v22+)
- PostgreSQL Database URL
- Cloudinary Account (for media uploads)

### 1. Clone the repository

```bash
git clone <your-github-repo-url>
cd student-lms
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Set up environment variables
PORT=5000
NODE_ENV=production
FRONTEND_URL=""


#Database
DATABASE_URL=""

#JWT
JWT_SECRET_KEY=""

#Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""


# Run Prisma migrations
npm run migrate
# or npx prisma db push

# Start the development server
npm run dev
```

### 3. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Set up environment variables
NEXT_PUBLIC_API_URL="http://localhost:5000"

# Start the frontend application
npm run dev
```

---

## 🌟 Core Features & Workflows

### 👩‍🏫 Instructor Features

-Instructor can create, update & delete course
-Instructor can add & delete lessons to the course
-Instructor can view all the courses and its lessons created by him
-Instructor can see the students enrolled and progress in his course

### 🎓 Student Features

-Student can view all the courses and view its lessons
-Student can enroll in a course
-Student can mark lessons as completed or uncompleted
-Student can view his progress in the course
-Student can download the certificate upon completion of the course

---

## 🌐 Deployment Details

- **Frontend** - Vercel (Free tier)
- **Backend** - Railway (Free tier)

---

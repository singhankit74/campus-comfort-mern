# Campus Comfort: MERN Stack Hostel Management System

A comprehensive hostel management system built using the MERN (MongoDB, Express, React, Node.js) stack. This system allows for efficient management of student hostel accommodations, including enrollment, room allocation, issue reporting, feedback submission, and notice distribution.

![Campus Comfort Banner](https://via.placeholder.com/1200x400?text=Campus+Comfort+Hostel+Management+System)

## 🚀 Features

- **User Authentication & Authorization**
  - Secure login with JWT authentication
  - Role-based access (Admin and Student roles)
  - Protected routes and API endpoints

- **Student Enrollment Management**
  - Students can apply for hostel accommodation
  - Multiple enrollment statuses (Pending, Approved, Rejected, Room Allocated)
  - Special preference options (AC rooms, preferred roommates, floor preferences)

- **Room Management**
  - Track room availability, capacity, and occupancy
  - Assign and relocate students to appropriate rooms
  - Filter rooms by type, block, and occupancy

- **Issue Reporting System**
  - Students can report maintenance and other issues
  - Track issue status (Open, In Progress, Resolved)
  - Admin can manage and update issue status

- **Feedback System**
  - Students can submit feedback about facilities and services
  - Admin can review and respond to feedback
  - Status tracking (Pending, Reviewed, Implemented)

- **Notice Board**
  - Admin can post important notices
  - Students can view all notices
  - Central communication channel

- **Real-time Chat System**
  - Direct messaging between students and staff
  - Group chat functionality for hostel blocks or departments
  - Real-time message delivery with Socket.io
  - Typing indicators and read receipts
  - Chat history persistence

- **Dashboard & Analytics**
  - Summarized statistics and key metrics
  - Visual representation of occupancy and enrollment data
  - Quick access to pending tasks and actions

## 🛠️ Technologies Used

### Frontend
- **React.js** - JavaScript library for building the user interface
- **Redux & Redux Toolkit** - State management
- **React Router** - Navigation and routing
- **Ant Design** - UI component library
- **Bootstrap 5** - CSS framework for responsive design
- **Axios** - HTTP client for API requests
- **React-Toastify** - Notification system

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT (JSON Web Tokens)** - Authentication
- **bcrypt.js** - Password hashing
- **Socket.io** - Real-time bidirectional communication

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

## 🔧 Installation & Setup

1. **Clone the repository**
   ```
   git clone https://github.com/yourusername/campus-comfort-mern.git
   cd campus-comfort-mern
   ```

2. **Install server dependencies**
   ```
   npm install
   ```

3. **Install client dependencies**
   ```
   cd client
   npm install
   cd ..
   ```

4. **Create a .env file in the project root with the following variables**
   ```
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

5. **Run the development server**
   ```
   npm run dev
   ```
   This will start both the backend server and the React frontend concurrently.

## 🏗️ Project Structure

```
campus-comfort-mern/
├── client/                  # React frontend
│   ├── public/              # Static files
│   └── src/                 # Source code
│       ├── components/      # Reusable components
│       │   ├── chat/        # Chat components
│       │   └── ...          # Other components
│       ├── context/         # React context providers
│       ├── pages/           # Page components
│       ├── redux/           # Redux state management
│       │   ├── slices/      # Redux Toolkit slices
│       │   └── services/    # API services
│       └── App.js           # Main application component
└── server/                  # Node.js backend
    ├── controllers/         # Route controllers
    ├── middleware/          # Express middleware
    ├── models/              # Mongoose models
    │   ├── ChatRoom.js      # Chat room model
    │   └── ...              # Other models
    ├── routes/              # Express routes
    ├── socketHandlers/      # Socket.io event handlers
    └── server.js            # Main server file
```

## 🔐 User Roles & Permissions

### Admin
- Manage student enrollments (approve/reject)
- Allocate rooms to students
- Post notices
- Handle issues and feedback
- View all dashboards and reports

### Student
- Apply for hostel accommodation
- Report issues
- Submit feedback
- View notices
- View personal enrollment status

## 🌟 Key Improvements & Optimizations

1. **Pagination Implementation**
   - Efficient handling of large datasets
   - Customizable page size
   - Improved UI/UX for navigating through records

2. **Filtering and Searching**
   - Server-side filtering for better performance
   - Multiple filter options (status, room type, etc.)
   - Responsive and fast search functionality

3. **Responsive Design**
   - Mobile-friendly interface
   - Adaptive layout for different screen sizes
   - Optimized user experience across devices

## 📸 Screenshots

| Dashboard | Room Allocation | Chat System |
|:---------:|:--------------:|:------------:|
| ![Dashboard](https://via.placeholder.com/400x300?text=Dashboard) | ![Room Allocation](https://via.placeholder.com/400x300?text=Room+Allocation) | ![Chat System](https://via.placeholder.com/400x300?text=Chat+System) |

| Notices | Issues | Feedback |
|:-------:|:------:|:--------:|
| ![Notices](https://via.placeholder.com/400x300?text=Notices) | ![Issues](https://via.placeholder.com/400x300?text=Issues) | ![Feedback](https://via.placeholder.com/400x300?text=Feedback) |

## 📊 API Documentation

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/auth/login` | POST | User login | Public |
| `/api/auth/register` | POST | Student registration | Public |
| `/api/enrollments` | GET | Get all enrollments | Admin |
| `/api/enrollments/me` | GET | Get user's enrollments | Student |
| `/api/enrollments/:id` | GET | Get enrollment by ID | Admin, Owner |
| `/api/enrollments` | POST | Create new enrollment | Student |
| `/api/enrollments/:id` | PUT | Update enrollment | Admin |
| `/api/rooms` | GET | Get all rooms | Admin |
| `/api/rooms/:id` | GET | Get room by ID | Admin |
| `/api/rooms` | POST | Create new room | Admin |
| `/api/issues` | GET | Get all issues | Admin |
| `/api/issues/me` | GET | Get user's issues | Student |
| `/api/notices` | GET | Get all notices | All Users |
| `/api/notices` | POST | Create notice | Admin |
| `/api/chat/rooms` | GET | Get user's chat rooms | Authenticated |
| `/api/chat/direct/:userId` | GET | Create/get direct chat | Authenticated |
| `/api/chat/group` | POST | Create group chat | Authenticated |
| `/api/chat/:chatId/messages` | GET | Get chat messages | Chat Participant |
| `/api/chat/users` | GET | Get users for chat | Authenticated |

## 🔍 Future Enhancements

- **Email Verification**: Implementing email verification for registration
- **Google Sign-in**: Adding OAuth2.0 with Google provider
- **Real-time Notifications**: Using WebSockets for instant updates
- **Mobile Application**: Native mobile apps for better accessibility
- **Advanced Reporting**: Enhanced analytics and reporting capabilities
- **Payment Integration**: Online payment for hostel fees
- **Multi-language Support**: Internationalization for diverse user base
- **File Sharing in Chat**: Allow sharing documents and images in chats

## 👥 Contributors

- Ankit Kumar Singh - Lead Developer

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [React Documentation](https://reactjs.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/)
- [Redux Documentation](https://redux.js.org/)
- [Ant Design](https://ant.design/)
- [Bootstrap](https://getbootstrap.com/) 
# Google Classroom MVP

A modern classroom management platform built with Next.js and Firebase, featuring separate dashboards for teachers and students.

## Features

### Teacher Dashboard
- Create and manage multiple classes
- Generate unique class codes for student enrollment
- Create assignments with file attachments and due dates
- View all enrolled students
- Review and grade student submissions
- Track submission status for all assignments

### Student Dashboard
- Join classes using class codes
- View all enrolled classes
- Access assignments with due dates
- Submit assignments with file uploads
- View grades and submission status

## Tech Stack

- **Frontend**: Next.js 13 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: Firebase Auth (Email/Password)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Icons**: Lucide React

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Once created, click on the web icon (</>) to add a web app
4. Register your app and copy the configuration object

### 2. Enable Firebase Services

#### Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method

#### Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Choose "Start in production mode"
4. Select your preferred location
5. Click "Enable"

#### Storage
1. Go to **Storage**
2. Click "Get started"
3. Choose "Start in production mode"
4. Click "Done"

### 3. Configure Firestore Security Rules

Go to Firestore Database → Rules and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    match /classes/{classId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.teacherId == request.auth.uid;
    }

    match /classMembers/{memberId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow delete: if request.auth != null && resource.data.studentId == request.auth.uid;
    }

    match /assignments/{assignmentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.teacherId == request.auth.uid;
    }

    match /submissions/{submissionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.studentId;
      allow update: if request.auth != null;
    }
  }
}
```

### 4. Configure Storage Security Rules

Go to Storage → Rules and replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /assignments/{classId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    match /submissions/{classId}/{assignmentId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### For Teachers

1. Sign up and select "Teacher" as your role
2. Create a new class from your dashboard
3. Share the class code with your students
4. Create assignments with descriptions, due dates, and optional file attachments
5. Review student submissions and assign grades

### For Students

1. Sign up and select "Student" as your role
2. Join a class using the class code provided by your teacher
3. View assignments and their due dates
4. Submit your work by uploading files
5. Check your grades once assignments are graded

## Project Structure

```
/app
  ├── login/                  # Login page
  ├── signup/                 # Signup page with role selection
  ├── teacher/
  │   ├── dashboard/          # Teacher dashboard
  │   └── class/[id]/         # Individual class management
  └── student/
      ├── dashboard/          # Student dashboard
      └── class/[id]/         # Class view and assignments

/components
  ├── ui/                     # shadcn/ui components
  ├── Navbar.tsx              # Navigation bar
  └── ClassCard.tsx           # Class card component

/lib
  ├── firebase.ts             # Firebase configuration
  ├── auth-context.tsx        # Authentication context
  └── firestore-helpers.ts    # Firestore helper functions
```

## Firebase Collections

- **users**: User profiles with role (teacher/student)
- **classes**: Class information with teacher ID and class code
- **classMembers**: Junction table for student enrollments
- **assignments**: Assignment details with class reference
- **submissions**: Student submissions with grades

## Build

To create a production build:

```bash
npm run build
npm start
```

## License

MIT

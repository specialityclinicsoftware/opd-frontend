# Medical OPD Management System - Frontend

## Overview

A complete React-based frontend application for managing Outpatient Department (OPD) operations in healthcare facilities.

## Features Implemented

### 1. Dashboard
- Overview statistics (Total Patients, Today's Visits)
- Quick patient search by phone number
- Recent visits display (last 10)
- Quick action buttons for new patient registration and visits

### 2. Patient Management
- **Patient List**: Browse all registered patients with search functionality
- **Patient Registration**: Register new patients with demographics
- **Patient Details**: View complete patient information, visit history, and recent prescriptions
- Delete patient functionality with confirmation

### 3. Visit Entry
- Comprehensive visit form with all medical fields:
  - Patient selection
  - Visit date and consulting doctor
  - Vitals (Pulse, BP, SpO2, Temperature)
  - History (Chief Complaints, Past/Family/Marital History)
  - General Examination (Pallor, Icterus, Clubbing, etc.)
  - Systemic Examination (CVS, RS, PA, CNS)
  - Assessment & Plan (Diagnosis, Treatment, Investigation, Advice)
  - Blood Investigations (dynamic array)
  - Review date

### 4. Prescription Management
- Create prescriptions linked to visits
- Multiple medications support (dynamic form)
- Medication details:
  - Medicine name, dosage, frequency
  - Duration, route, timing
  - Special instructions
- Diagnosis and additional notes

### 5. Patient History Timeline
- Chronological timeline of all visits and prescriptions
- Visual distinction between visits and prescriptions
- Detailed view of all medical information
- Easy navigation back to patient details

## Project Structure

```
src/
├── pages/
│   ├── Dashboard/
│   │   └── Dashboard.tsx         # Main dashboard page
│   ├── Patients/
│   │   ├── PatientList.tsx       # List all patients
│   │   ├── PatientRegister.tsx   # Register new patient
│   │   └── PatientDetails.tsx    # Patient details and history
│   ├── Visits/
│   │   ├── VisitNew.tsx          # Create new visit
│   │   └── VisitEdit.tsx         # Edit visit (placeholder)
│   ├── Prescriptions/
│   │   └── PrescriptionNew.tsx   # Create prescription
│   └── History/
│       └── PatientHistory.tsx    # Complete patient timeline
├── components/
│   └── Layout/
│       ├── Layout.tsx            # Main layout wrapper
│       └── Navbar.tsx            # Navigation bar
├── services/
│   ├── api.ts                    # Axios configuration
│   ├── patientService.ts         # Patient API calls
│   ├── visitService.ts           # Visit API calls
│   └── medicationService.ts      # Medication API calls
├── types/
│   ├── patient.ts                # Patient types
│   ├── visit.ts                  # Visit types
│   ├── medication.ts             # Medication types
│   ├── api.ts                    # API response types
│   └── index.ts                  # Type exports
├── App.tsx                       # Main app with routing
├── main.tsx                      # App entry point
├── index.css                     # Global styles
└── App.css                       # App-level styles
```

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool and dev server

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Dashboard | Main dashboard with stats |
| `/patients` | PatientList | List all patients |
| `/patients/register` | PatientRegister | Register new patient |
| `/patients/:id` | PatientDetails | Patient details page |
| `/visits/new` | VisitNew | Create new visit |
| `/visits/:id/edit` | VisitEdit | Edit visit (placeholder) |
| `/prescriptions/new` | PrescriptionNew | Create prescription |
| `/history/:patientId` | PatientHistory | Complete patient timeline |

## Backend Connection

The app connects to the backend API at `http://localhost:3001`

**Required Backend Endpoints:**
- `POST /api/patients/register` - Register patient
- `GET /api/patients/` - Get all patients
- `GET /api/patients/search?phoneNumber={phone}` - Search by phone
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `POST /api/visits/` - Create visit
- `GET /api/visits/patient/:patientId` - Get patient visits
- `GET /api/visits/:id` - Get visit by ID
- `POST /api/medications/` - Create prescription
- `GET /api/medications/patient/:patientId` - Get patient medications

## Setup Instructions

### Prerequisites

**IMPORTANT:** This project requires Node.js version 20.19+ or 22.12+

Current Node.js version detected: 18.20.8 (not compatible)

### Steps

1. **Upgrade Node.js** (if needed):
   ```bash
   # Using nvm (recommended)
   nvm install 20
   nvm use 20

   # Or download from https://nodejs.org/
   ```

2. **Install Dependencies** (already done):
   ```bash
   npm install
   ```

3. **Start Backend Server**:
   Ensure your backend is running on http://localhost:3001

4. **Start Frontend Dev Server**:
   ```bash
   npm run dev
   ```

5. **Open Browser**:
   Navigate to http://localhost:5173 (or the URL shown in terminal)

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` folder.

## Features & Functionality

### Patient Registration
- Simple form with name, phone, age, gender, address
- Phone number validation (10 digits, unique)
- Age validation (0-150)

### Visit Entry
- Patient selection dropdown
- Comprehensive medical examination form
- Dynamic blood investigation fields
- All fields are optional except patient and doctor

### Prescription
- Linked to specific visits
- Multiple medications per prescription
- Predefined options for frequency and route
- Print-friendly layout

### Patient Details
- Quick overview of patient demographics
- Recent prescriptions (last 5)
- Complete visit history
- Quick action buttons for new visit/prescription

### Timeline View
- Chronological display of all medical events
- Visual distinction between visits (green) and prescriptions (purple)
- Expandable details for each event
- Easy to read format

## Styling

- Clean, professional medical interface
- Responsive design for mobile and desktop
- Card-based layout for better organization
- Consistent color scheme:
  - Primary: #3498db (blue)
  - Success: #27ae60 (green)
  - Danger: #e74c3c (red)
  - Purple: #9b59b6 (for prescriptions)

## Future Enhancements

- [ ] Visit edit functionality
- [ ] Print prescription feature
- [ ] Export patient history to PDF
- [ ] Advanced search and filters
- [ ] Data visualization on dashboard
- [ ] Appointment scheduling
- [ ] User authentication
- [ ] Role-based access control
- [ ] Offline mode with local storage
- [ ] Image upload for reports

## Notes

- All form validations are client-side
- Error handling for API failures
- Loading states for better UX
- Confirmation dialogs for destructive actions
- Inline styles used for simplicity (can be refactored to CSS modules or styled-components)

## Troubleshooting

### Node.js Version Error
If you see "Vite requires Node.js version 20.19+ or 22.12+":
- Upgrade Node.js using nvm or download from nodejs.org
- Run `node --version` to verify

### Backend Connection Error
If you see API errors:
- Ensure backend is running on port 3001
- Check CORS is enabled on backend
- Verify API endpoints match the backend routes

### TypeScript Errors
Run type checking:
```bash
npx tsc --noEmit
```

## Contact & Support

For issues or questions about the application, refer to the prompt.txt file for complete API documentation.

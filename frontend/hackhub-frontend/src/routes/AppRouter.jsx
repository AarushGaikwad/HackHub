import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Public pages
import LandingPage from '../pages/public/LandingPage';
import AuthPage from '../pages/public/AuthPage';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';

// Participant pages
import ParticipantDashboard from '../pages/participant/ParticipantDashboard';
import HackathonDetailPage from '../pages/participant/HackathonDetailPage';
import TeamPage from '../pages/participant/TeamPage';
import SubmissionPage from '../pages/participant/SubmissionPage';
import ProfilePage from '../pages/participant/ProfilePage';

// Organizer pages
import OrganizerDashboard from '../pages/organizer/OrganizerDashboard';

// Judge pages
import JudgeDashboard from '../pages/judge/JudgeDashboard';


const AppRouter = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <BrowserRouter>
            <Routes>

                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route
                    path="/login"
                    element={
                        isAuthenticated
                            ? <Navigate to={getDashboard(user?.role)} replace />
                            : <AuthPage />
                    }
                />

                {/* Admin routes */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Participant routes */}
                <Route
                    path="/participant/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['PARTICIPANT']}>
                            <ParticipantDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path='/participant/hackathon/:id'
                    element={
                        <ProtectedRoute allowedRoles={['PARTICIPANT']}>
                            <HackathonDetailPage/>
                        </ProtectedRoute>
                    }
                />

                <Route 
                    path="/participant/teams"
                    element={
                        <ProtectedRoute allowedRoles={['PARTICIPANT']}>
                            <TeamPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/participant/submission/:teamRegistrationId"
                    element={
                        <ProtectedRoute allowedRoles={['PARTICIPANT']}>
                            <SubmissionPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/profile"
                    element={
                        <ProtectedRoute allowedRoles={['PARTICIPANT', 'ORGANIZER', 'JUDGE', 'ADMIN']}>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />

                {/* Organizer routes */}
                <Route
                    path="/organizer/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['ORGANIZER']}>
                            <OrganizerDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Judge routes */}
                <Route
                    path="/judge/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['JUDGE']}>
                            <JudgeDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
        </BrowserRouter>
    );
};

const getDashboard = (role) => {
    const map = {
        ADMIN: '/admin/dashboard',
        ORGANIZER: '/organizer/dashboard',
        JUDGE: '/judge/dashboard',
        PARTICIPANT: '/participant/dashboard',
    };
    return map[role] || '/';
};

export default AppRouter;
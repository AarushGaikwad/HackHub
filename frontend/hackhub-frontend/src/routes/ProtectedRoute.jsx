import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();

    // Not logged in → redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Wrong role → redirect to their dashboard
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        const dashboardMap = {
            ADMIN: '/admin/dashboard',
            ORGANIZER: '/organizer/dashboard',
            JUDGE: '/judge/dashboard',
            PARTICIPANT: '/participant/dashboard',
        };
        return <Navigate to={dashboardMap[user?.role] || '/login'} replace />;
    }

    return children;
};

export default ProtectedRoute;
import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '@/context/AuthContext'

interface LoginRouteProps{
    children: React.ReactNode;
}

const LoginRoute = ({ children }: LoginRouteProps) => {
    const { token } = useContext(AuthContext);

    if(!token) {
        // No autenticado, redirige a login
        return <Navigate to="/login" replace />;
    }

    // Autenticado, renderiza el componente hijo
    return children;
};

export default LoginRoute;
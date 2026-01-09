import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to the new dedicated login page
        navigate('/login');
    }, [navigate]);

    return null;
};

export default Login;
import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen bg-legion-light flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center mb-4">
            <img
              src="/legion-logo.png"
              alt="Legion"
              className="w-32 h-32 object-contain"
            />
            <h1 className="text-4xl font-bold text-legion-navy tracking-wide">
              LEGION
            </h1>
          </div>
          <p className="text-gray-600">Command your tasks with precision</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-legion-navy mb-6">
            Welcome Back
          </h2>
          <LoginForm />

          <div className="mt-6 text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/register" className="text-legion-tech-blue hover:underline font-medium">
              Register
            </Link>
          </div>
          <div className="mt-6 text-center">
            <span className="text-gray-600">Have an invitation? </span>
            <Link to="/invite/accept" className="text-legion-tech-blue hover:underline font-medium">
              Invitation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
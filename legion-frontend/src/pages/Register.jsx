import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';

const Register = () => {
  return (
    <div className="min-h-screen bg-legion-light flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-1 mb-4">
            <img
              src="/legion-logo.png"
              alt="Legion"
              className="w-24 h-24 object-contain"
            />
            <h1 className="text-3xl font-bold text-legion-navy tracking-wide">
              LEGION
            </h1>
          </div>
          <p className="text-gray-600">Command your tasks with precision</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-legion-navy mb-6">
            Create Account
          </h2>
          <RegisterForm />

          <div className="mt-6 text-center">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className="text-legion-tech-blue hover:underline font-medium">
              Login
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

export default Register;
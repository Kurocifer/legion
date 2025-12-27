import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';
import { invitationAPI } from '../api/invitation';
import { authAPI } from '../api/auth';

const AcceptInvite = () => {
  const { token: urlToken } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState('token');
  const [loading, setLoading] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [token, setToken] = useState(urlToken || '');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (urlToken) {
      verifyToken(urlToken);
    }
  }, [urlToken]);

  const verifyToken = async (inviteToken) => {
    setLoading(true);
    try {
      const data = await invitationAPI.getInvitationByToken(inviteToken);
      setInvitation(data);
      setFormData((prev) => ({ ...prev, email: data.email }));
      setStep('details');
    } catch (error) {
      console.error('Failed to verify token:', error);
      alert('Invalid or expired invitation token');
      setStep('token');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = (e) => {
    e.preventDefault();
    if (!token.trim()) {
      alert('Please enter an invitation token');
      return;
    }
    verifyToken(token.trim());
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await authAPI.acceptInvitation(token, {
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
      });

      setStep('success');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      alert(error.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-legion-navy">Accept Invitation</h1>
          <p className="text-gray-600 mt-2">Join your team's workspace</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Step 1: Enter Token */}
          {step === 'token' && (
            <form onSubmit={handleVerifyToken}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invitation Token
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your invitation token here"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-2">
                  You should have received this token via email or from your admin
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-legion-gold text-legion-navy rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying...' : 'Verify Token'}
                <ArrowRight size={20} />
              </button>
            </form>
          )}

          {/* Step 2: Enter Details */}
          {step === 'details' && invitation && (
            <div>
              {/* Invitation Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  You're invited to join <strong>{invitation.workspaceName}</strong> as{' '}
                  <strong>{invitation.role}</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Email: {invitation.email}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
                      placeholder="Loyd Le Kurocfer"
                    />
                  </div>
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>

                {/* Email (readonly) */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-legion-gold text-legion-navy rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Accept Invitation & Join'}
                </button>
              </form>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-legion-navy mb-2">Welcome Aboard!</h2>
              <p className="text-gray-600 mb-4">
                Your account has been created successfully
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to login page in 3 seconds...
              </p>
            </div>
          )}
        </div>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/login')}
            className="text-legion-tech-blue hover:underline"
          >
            Already have an account? Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvite;
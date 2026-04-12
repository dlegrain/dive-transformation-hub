import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { registerParticipant, findParticipantByEmail } from '../../lib/participant';

type Tab = 'register' | 'login';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tab, setTab] = useState<Tab>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Register form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [institution, setInstitution] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await registerParticipant({
      firstName,
      lastName,
      institution,
      email: registerEmail,
    });
    setLoading(false);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    // Pre-populate store data
    const storeData = localStorage.getItem('dive-hub-data');
    const parsed = storeData ? JSON.parse(storeData) : {};
    parsed.institutionName = result.group.institution_name || institution;
    parsed.assessorName = result.participant.name;
    localStorage.setItem('dive-hub-data', JSON.stringify(parsed));

    login(result.participant, result.group, result.session);
    navigate('/module1', { replace: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await findParticipantByEmail(loginEmail);
    setLoading(false);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    // Pre-populate store data
    const storeData = localStorage.getItem('dive-hub-data');
    const parsed = storeData ? JSON.parse(storeData) : {};
    parsed.institutionName = result.group.institution_name || '';
    parsed.assessorName = result.participant.name;
    localStorage.setItem('dive-hub-data', JSON.stringify(parsed));

    login(result.participant, result.group, result.session);
    navigate('/module1', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">DIVE</h1>
          <p className="text-primary-300 mt-1">Transformation Hub</p>
          <p className="text-primary-400 text-sm mt-3">
            DIVE Seminar 2026 — Ho Chi Minh City
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => { setTab('register'); setError(''); }}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                tab === 'register'
                  ? 'text-primary-700 border-b-2 border-primary-600 bg-primary-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              First Time
            </button>
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                tab === 'login'
                  ? 'text-primary-700 border-b-2 border-primary-600 bg-primary-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Already Registered
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Institution</label>
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Ho Chi Minh City University of Technology"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="john.doe@university.edu.vn"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {loading ? 'Joining...' : 'Join the Seminar'}
              </button>
            </form>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="john.doe@university.edu.vn"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {loading ? 'Signing in...' : 'Continue'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-primary-500 text-xs mt-6">
          Digital Innovation in Vietnamese Education
        </p>
      </div>
    </div>
  );
}

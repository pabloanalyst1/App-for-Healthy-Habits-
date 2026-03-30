import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import authService from '../services/authService';
import '../styles/auth.css';

export default function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    preferences: {
      darkMode: false,
      notifications: true,
      language: 'en',
    }
  });
  const [formData, setFormData] = useState({
    name: '',
    preferences: {
      darkMode: false,
      notifications: true,
      language: 'en',
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/');
      return;
    }
    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userService.getProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        preferences: data.preferences || {
          darkMode: false,
          notifications: true,
          language: 'en',
        }
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePreferenceChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        [name]: type === 'checkbox' ? checked : value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      await userService.updateProfile(formData.name, formData.preferences);
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      // Reload profile to confirm changes
      await loadProfile();
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #f8fafc 45%, #eef2ff 100%)',
        fontFamily: 'Arial, sans-serif',
        padding: '28px',
      }}
    >
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            background: 'white',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: '#15803d',
                fontSize: '28px',
              }}
            >
              Settings
            </h1>
            <p
              style={{
                margin: '6px 0 0 0',
                color: '#64748b',
                fontSize: '14px',
              }}
            >
              Manage your profile and preferences
            </p>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Back to Dashboard
          </button>
        </div>

        {/* Form */}
        <div
          style={{
            background: 'white',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
          }}
        >
          {error && (
            <div
              style={{
                background: '#fee2e2',
                color: '#dc2626',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: '#dcfce7',
                color: '#166534',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email (read-only) */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#374151',
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: '#f3f4f6',
                  color: '#64748b',
                  boxSizing: 'border-box',
                  cursor: 'not-allowed',
                }}
              />
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Email cannot be changed
              </p>
            </div>

            {/* Name */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#374151',
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Preferences Section */}
            <div style={{ marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              <h3
                style={{
                  margin: '0 0 16px 0',
                  color: '#0f172a',
                  fontSize: '16px',
                }}
              >
                Preferences
              </h3>

              {/* Dark Mode */}
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="darkMode"
                  checked={formData.preferences.darkMode}
                  onChange={handlePreferenceChange}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    marginRight: '8px',
                  }}
                />
                <label
                  style={{
                    fontWeight: '500',
                    color: '#374151',
                    cursor: 'pointer',
                    margin: 0,
                  }}
                >
                  Enable Dark Mode
                </label>
              </div>

              {/* Notifications */}
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="notifications"
                  checked={formData.preferences.notifications}
                  onChange={handlePreferenceChange}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    marginRight: '8px',
                  }}
                />
                <label
                  style={{
                    fontWeight: '500',
                    color: '#374151',
                    cursor: 'pointer',
                    margin: 0,
                  }}
                >
                  Enable Notifications
                </label>
              </div>

              {/* Language */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#374151',
                  }}
                >
                  Language
                </label>
                <select
                  name="language"
                  value={formData.preferences.language}
                  onChange={handlePreferenceChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                background: saving ? '#9ca3af' : '#15803d',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

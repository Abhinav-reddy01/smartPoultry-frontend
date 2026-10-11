import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken } from '../api';

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password) {
      setError('Enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const credentials = {
        username: form.email.trim(),
        email: form.email.trim(),
        password: form.password,
      };
      const data = isRegistering
        ? await api.register(credentials)
        : await api.login(credentials);

      if (!data || !data.token) {
        throw new Error(
          data?.message ||
          'Login failed: no authentication token was returned.'
        );
      }

      setToken(data.token);

      localStorage.setItem(
        'poultry_user',
        JSON.stringify(
          data.user || { username: form.email.trim() }
        )
      );

      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err.message || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="login-visual-inner">
          <div className="login-brand">
            <div className="login-logo" aria-hidden="true">🐔</div>
            <span>FIELDHOUSE <span className="login-brand-dot">/</span> FARM SYSTEMS</span>
          </div>

          <div className="login-story">
            <div className="login-kicker">A clearer view of your operation</div>
            <h1>Good decisions<br />start in the coop.</h1>

            <p>
              Keep your flock, finances and daily numbers moving in the same direction.
            </p>
          </div>

          <div className="login-feature-grid">
            <div>
              <span className="feature-index">01</span>
              <b>Egg sales</b>
              <span>Daily collection &amp; sales</span>
            </div>

            <div>
              <span className="feature-index">02</span>
              <b>Farm costs</b>
              <span>Every expense accounted</span>
            </div>

            <div>
              <span className="feature-index">03</span>
              <b>Tax records</b>
              <span>Rates kept in view</span>
            </div>

            <div>
              <span className="feature-index">04</span>
              <b>Performance</b>
              <span>Income, costs &amp; profit</span>
            </div>
          </div>

          <div className="login-visual-footer">
            <span>FARM MANAGEMENT, WITH THE FULL PICTURE</span>
            <span>EST. FOR EVERY DAY</span>
          </div>
        </div>
      </div>

      <div className="login-panel">
        <form className="login-card" onSubmit={submit} aria-busy={loading}>
          <div className="eyebrow"><span className="login-status-dot" /> FARM ADMINISTRATOR</div>

          <h2>{isRegistering ? 'Create your account' : 'Welcome back'}</h2>

          <p className="muted">
            {isRegistering
              ? 'Set up your farm workspace access.'
              : 'Sign in to your farm workspace.'}
          </p>

          <div className="login-field">
            <label htmlFor="email">Email address</label>

            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              value={form.email}
              placeholder="you@yourfarm.com"
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="login-field">
            <div className="login-label-row">
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <input
              id="password"
              className="input"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              minLength={isRegistering ? 8 : undefined}
              value={form.password}
              placeholder="Enter your password"
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              required
            />
          </div>

          {error && (
            <div className="alert error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="primary-btn full"
            disabled={loading}
          >
            <span>
              {loading
                ? (isRegistering ? 'Creating account...' : 'Signing in...')
                : (isRegistering ? 'Create account' : 'Sign in to your farm')}
            </span>
            {!loading && <span className="login-button-arrow" aria-hidden="true">&#8594;</span>}
          </button>

          <p className="login-note">
            {isRegistering
              ? 'Use at least 8 characters for your password.'
              : 'Your farm workspace is protected.'}
          </p>

          <button
            type="button"
            className="login-switch"
            onClick={() => {
              setError('');
              setIsRegistering((registering) => !registering);
            }}
          >
            {isRegistering
              ? 'Already have an account? Sign in'
              : 'New to the farm system? Create an account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

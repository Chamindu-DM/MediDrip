import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

function LoginScreen() {
  const { signIn } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState(null);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      await signIn();
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Sign in was cancelled or failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="w-96 min-h-[480px] flex flex-col login-gradient relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
      <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-white/5 rounded-full" />
      <div className="absolute top-40 right-8 w-24 h-24 bg-white/5 rounded-full" />

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 relative z-10">
        {/* Logo / Icon */}
        <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <svg
            className="w-10 h-10 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        </div>

        <h1 className="text-white text-2xl font-semibold font-instrument mb-2">
          MediDrip
        </h1>
        <p className="text-white/70 text-sm font-instrument text-center mb-10 leading-5">
          Clinical fluid tracking &<br />
          smart hydration reminders
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {['Track Intake', 'Log Output', 'Smart Alerts'].map((feature) => (
            <span
              key={feature}
              className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-xs font-instrument font-medium"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="w-full mb-3 px-3 py-2 bg-red-500/20 border border-red-400/30 rounded-lg text-white/90 text-xs font-instrument text-center">
            {error}
          </div>
        )}

        {/* Sign in button */}
        <button
          onClick={handleSignIn}
          disabled={isSigningIn}
          id="login-button"
          className="w-full py-3.5 bg-white rounded-xl text-brand-primary text-base font-semibold font-instrument 
                     shadow-lg shadow-black/20 hover:bg-white/95 hover:shadow-xl 
                     active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2
                     disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSigningIn ? (
            <>
              <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Sign in with Asgardeo
            </>
          )}
        </button>
      </div>

      {/* Footer */}
      <div className="pb-6 pt-4 text-center relative z-10">
        <p className="text-white/40 text-xs font-instrument">
          Secured by WSO2 Asgardeo
        </p>
      </div>
    </div>
  );
}

export default LoginScreen;

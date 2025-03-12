import React, { useState } from 'react';
import { useRouter } from 'next/router';

interface PhoneSignInProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const PhoneSignIn: React.FC<PhoneSignInProps> = ({ onSuccess, onError }) => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'verification'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic validation
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/auth/phone/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code');
      }
      
      setVerificationId(data.verificationId);
      setStep('verification');
    } catch (error) {
      console.error('Error sending verification code:', error);
      setError(error instanceof Error ? error.message : 'Failed to send verification code');
      if (onError) onError(error instanceof Error ? error.message : 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/auth/phone/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationId,
          verificationCode,
          phoneNumber,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify code');
      }
      
      // Store the token in localStorage or cookies
      localStorage.setItem('token', data.token);
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess();
      
      // Redirect to the home page or the callback URL
      const callbackUrl = router.query.callbackUrl as string || '/';
      router.push(callbackUrl);
    } catch (error) {
      console.error('Error verifying code:', error);
      setError(error instanceof Error ? error.message : 'Failed to verify code');
      if (onError) onError(error instanceof Error ? error.message : 'Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendCode = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/auth/phone/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification code');
      }
      
      setVerificationId(data.verificationId);
    } catch (error) {
      console.error('Error resending verification code:', error);
      setError(error instanceof Error ? error.message : 'Failed to resend verification code');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mt-8">
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {step === 'phone' ? (
        <form onSubmit={handlePhoneSubmit} className="space-y-6">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="mt-1">
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isLoading ? 'Sending Code...' : 'Send Verification Code'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerificationSubmit} className="space-y-6">
          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <div className="mt-1">
              <input
                id="verificationCode"
                name="verificationCode"
                type="text"
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="123456"
                maxLength={6}
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Change Phone Number
              </button>
            </div>
            <div className="text-sm">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isLoading}
                className="font-medium text-blue-600 hover:text-blue-500 disabled:text-blue-300"
              >
                Resend Code
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default PhoneSignIn; 
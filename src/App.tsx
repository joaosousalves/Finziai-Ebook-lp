import React, { useState } from 'react';
import { supabase } from './lib/supabase';

function App() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    ageRange: ''
  });

  const [formErrors, setFormErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    ageRange: false
  });

  const [submitStatus, setSubmitStatus] = useState<{
    message: string;
    type: 'error' | 'success' | '';
    downloadUrl?: string;
  }>({ message: '', type: '' });

  const ageRanges = [
    '-15',
    '15-20',
    '20-25',
    '25-30',
    '30-40',
    '40-50',
    '50-60',
    '60-65',
    '65+'
  ];

  const validateForm = () => {
    const errors = {
      firstName: !formData.firstName.trim(),
      lastName: !formData.lastName.trim(),
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
      ageRange: !formData.ageRange
    };
    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const generateDownloadToken = () => {
    return crypto.randomUUID();
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitStatus({ message: '', type: '' });

    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('leadCapture')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        setSubmitStatus({
          message: 'This email is already registered. Please use a different email address.',
          type: 'error'
        });
        return;
      }

      // Generate a unique download token
      const downloadToken = generateDownloadToken();

      // Start a transaction by inserting the lead first
      const { error: leadError } = await supabase
        .from('leadCapture')
        .insert([
          {
            name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
            email: formData.email,
            idade: formData.ageRange
          }
        ]);

      if (leadError) throw leadError;

      // Create download record
      const { error: downloadError } = await supabase
        .from('downloads')
        .insert([
          {
            email: formData.email,
            token: downloadToken,
            used: false
          }
        ]);

      if (downloadError) throw downloadError;

      // Create the download URL
      const downloadUrl = `/api/download?token=${downloadToken}`;

      setSubmitStatus({
        message: 'Thank you for registering! Click the button below to download your free ebook.',
        type: 'success',
        downloadUrl
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        ageRange: ''
      });

    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus({
        message: 'An error occurred. Please try again later.',
        type: 'error'
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: false }));
    setSubmitStatus({ message: '', type: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header/Navigation */}
      <nav className="relative bg-white">
        <div className="max-w-6xl mx-auto px-8 pt-6 pb-16">
          <div className="flex justify-center items-center gap-2 bg-white">
            <img 
              src="/assets/Logo.png" 
              alt="Finziai Logo" 
              className="w-12 h-12"
            />
            <span className="text-3xl font-bold text-gray-900">FinziAi</span>
          </div>
          <div className="text-center mt-8 bg-white">
            <h1 className="text-4xl sm:text-5xl font-light text-gray-900">
              MASTER THE ART OF
              <span className="block font-bold mt-2">FINANCIAL FREEDOM</span>
            </h1>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 pb-32">
        {/* First Section: Intro Text and Image */}
        <div className="flex flex-col-reverse lg:flex-row gap-12 items-center mb-24 relative mt-24">
          <div className="lg:w-1/2 flex items-center justify-center min-h-[200px]">
            <p className="text-lg text-gray-600 text-center max-w-lg">
              Transform your financial future with our comprehensive guide to personal finance, investment strategies, and wealth building. Learn the secrets that financial experts use to create lasting prosperity and security.
            </p>
          </div>
          <div className="lg:w-1/2 relative mb-12 lg:mb-0">
            <img
              src="/assets/ebook_cover.png"
              alt="Ebook Preview"
              className="w-[355px] h-[533px] object-cover mx-auto rounded-lg shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]"
            />
          </div>
        </div>

        {/* Second Section: Guide Points and Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-48">
          {/* Left Column - Guide Points */}
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              THIS GUIDE WILL TEACH YOU:
            </h2>
            <ul className="space-y-4">
              {[
                'Smart investment strategies for beginners and experts',
                'Proven methods to eliminate debt and build wealth',
                'Advanced techniques for passive income generation'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-1.5 h-4 w-4 rounded-full bg-blue-600 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column - Form */}
          <form onSubmit={handleDownload} className="bg-white p-8 rounded-lg shadow-sm space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.firstName && <p className="text-red-500 text-xs mt-1">Required field</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.lastName && <p className="text-red-500 text-xs mt-1">Required field</p>}
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {formErrors.email && <p className="text-red-500 text-xs mt-1">Valid email required</p>}
            </div>

            <div>
              <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700 mb-1">
                Age Range
              </label>
              <select
                id="ageRange"
                name="ageRange"
                value={formData.ageRange}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${formErrors.ageRange ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select age range</option>
                {ageRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
              {formErrors.ageRange && <p className="text-red-500 text-xs mt-1">Please select an age range</p>}
            </div>

            {submitStatus.message && (
              <div className={`p-3 rounded-md ${
                submitStatus.type === 'error' 
                  ? 'bg-red-50 text-red-700' 
                  : 'bg-green-50 text-green-700'
              }`}>
                {submitStatus.message}
                {submitStatus.type === 'success' && submitStatus.downloadUrl && (
                  <a
                    href={submitStatus.downloadUrl}
                    className="block mt-3 text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download Ebook
                  </a>
                )}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              GET YOUR FREE EBOOK
            </button>
            <p className="text-sm text-gray-500 text-center">
              No credit card required. Instant access.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;
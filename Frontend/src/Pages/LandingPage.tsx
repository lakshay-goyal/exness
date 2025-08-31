import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <Navbar />

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Welcome to <span className="text-blue-400">Exness</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Experience the future of trading with our advanced platform. 
          Real-time data, powerful analytics, and seamless execution.
        </p>
        <div className="space-x-4">
          <Link 
            to="/signup" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-block"
          >
            Start Trading Now
          </Link>
          <button className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
            Learn More
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">
          Why Choose Exness?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Lightning Fast</h3>
            <p className="text-gray-300">
              Execute trades with millisecond precision using our high-performance infrastructure.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Secure & Reliable</h3>
            <p className="text-gray-300">
              Bank-grade security with 99.9% uptime guarantee for your peace of mind.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Advanced Analytics</h3>
            <p className="text-gray-300">
              Powerful tools and insights to help you make informed trading decisions.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Trading Journey?
          </h2>
          <p className="text-gray-300 mb-8">
            Join thousands of traders who trust Exness for their trading needs.
          </p>
          <Link 
            to="/signup" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-block"
          >
            Create Your Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/20 py-8">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p>&copy; 2024 Exness. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

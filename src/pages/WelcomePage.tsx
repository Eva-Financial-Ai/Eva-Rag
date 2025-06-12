import { useAuth0 } from '@auth0/auth0-react';
import { ArrowRightIcon, CheckCircleIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import React from 'react';
import ModernEVALogo from '../components/common/EVALogo';

const WelcomePage: React.FC = () => {
  const { loginWithRedirect, isLoading } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect({
      appState: {
        returnTo: '/dashboard'
      }
    });
  };

  const handleSignup = () => {
    loginWithRedirect({
      appState: {
        returnTo: '/onboarding'
      },
      authorizationParams: {
        screen_hint: 'signup'
      }
    });
  };

  const features = [
    {
      icon: SparklesIcon,
      title: 'AI-Powered Financing',
      description: 'Leverage advanced AI to find the best financing options for your business needs.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Compliant',
      description: 'Bank-level security with full regulatory compliance for your peace of mind.'
    },
    {
      icon: CheckCircleIcon,
      title: 'Fast Approvals',
      description: 'Get pre-qualified in minutes and receive funding decisions in hours, not days.'
    }
  ];

  const businessTypes = [
    {
      title: 'Small Business Owners',
      description: 'Quick access to working capital and equipment financing',
      benefits: ['Fast applications', 'Competitive rates', 'Flexible terms']
    },
    {
      title: 'Growing Enterprises',
      description: 'Scalable financing solutions for expansion and growth',
      benefits: ['Growth capital', 'Strategic planning', 'Multi-product options']
    },
    {
      title: 'Real Estate Investors',
      description: 'Specialized commercial real estate financing',
      benefits: ['Property analysis', 'Fast closings', 'Portfolio management']
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ModernEVALogo width={120} height={40} className="mx-auto mb-4" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <ModernEVALogo width={150} height={50} className="h-12 w-auto" />
            <div className="flex space-x-4">
              <button
                onClick={handleLogin}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleSignup}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              The Future of Business
              <span className="block text-yellow-400">Financing is Here</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              EVA AI connects businesses with the perfect financing solutions using cutting-edge artificial intelligence and comprehensive market data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSignup}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center"
              >
                Start Your Application
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={handleLogin}
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Sign In to Continue
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose EVA AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Revolutionary technology meets personalized service to deliver the financing experience your business deserves.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tailored Solutions for Every Business
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From startups to enterprises, EVA AI adapts to your unique business needs and growth stage.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {businessTypes.map((type, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-8 hover:border-blue-300 transition-colors">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{type.title}</h3>
                <p className="text-gray-600 mb-6">{type.description}</p>
                <ul className="space-y-2">
                  {type.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-gray-700">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Business Financing?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of businesses that have already discovered the power of AI-driven financing solutions.
          </p>
          <button
            onClick={handleSignup}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center"
          >
            Get Started Today
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <ModernEVALogo width={120} height={40} className="h-10 w-auto mb-4 md:mb-0" />
            <div className="text-gray-600 text-sm">
              © 2024 EVA AI Finance. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
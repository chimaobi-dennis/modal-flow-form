import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Shield, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface SubscriptionPlan {
  id: string;
  title: string;
  price: string;
  priceAmount: number;
  currency: string;
  description: string;
  features: string[];
}

const PremiumCheckout: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plan] = useState<SubscriptionPlan>({
    id: 'premium',
    title: 'Premium Service',
    price: '300',
    priceAmount: 300,
    currency: 'SEK',
    description: 'Complete Success Package with AI-Powered Matching',
    features: [
      'One-Year Full Access Subscription',
      'AI-Powered Program Matching',
      'Personalized AI Match Explanations',
      'Contextual Program Ranking',
      'Expert Consultation (1-on-1)',
      'Enhanced Application Support',
      '98% Admission Success Rate',
      'Complete Document Reviews',
      'Priority Customer Support',
      'Scholarship Matching Service',
      'Visa Application Assistance',
    ],
  });

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      // Create Stripe checkout session
      const response = await axios.post('/api/v1/checkout', {
        plan_id: plan.id,
        price: plan.priceAmount,
        currency: plan.currency,
      });

      if (response.data.success) {
        // Redirect to Stripe checkout
        window.location.href = response.data.checkout_url;
      } else {
        toast.error(response.data.message || 'Failed to create checkout session');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Upgrade to Premium
          </h1>
          <p className="text-lg text-gray-600">
            Unlock AI-powered matching and expert guidance
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Details */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-900">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.title}
              </h2>
              <p className="text-gray-600">{plan.description}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-5xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-2xl text-gray-600 ml-2">
                  {plan.currency}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">One-time payment for 1 year</p>
            </div>

            <div className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-gray-900 text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Proceed to Payment
                </>
              )}
            </button>
          </div>

          {/* Security & Benefits */}
          <div className="space-y-6">
            {/* Security Badge */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-green-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Secure Payment
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Your payment is processed securely through Stripe. We never store your card details.
              </p>
              <div className="flex items-center space-x-4">
                <img
                  src="/images/stripe-badge.png"
                  alt="Stripe"
                  className="h-8"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-sm text-gray-500">256-bit SSL encryption</span>
              </div>
            </div>

            {/* What You Get */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What happens after payment?
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                    1
                  </div>
                  <p className="text-gray-700">
                    Instant activation of Premium features
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                    2
                  </div>
                  <p className="text-gray-700">
                    AI-powered program matching enabled
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                    3
                  </div>
                  <p className="text-gray-700">
                    Access to expert consultation booking
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                    4
                  </div>
                  <p className="text-gray-700">
                    Priority support and enhanced features
                  </p>
                </div>
              </div>
            </div>

            {/* Money Back Guarantee */}
            <div className="bg-green-50 rounded-2xl shadow-lg p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                30-Day Money-Back Guarantee
              </h3>
              <p className="text-gray-700">
                Not satisfied? Get a full refund within 30 days, no questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Can I cancel my subscription?
              </h4>
              <p className="text-gray-600">
                This is a one-time payment for 1 year of access. There's no recurring billing. After 1 year, you can choose to renew if you wish.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, Mastercard, American Express) and debit cards through our secure Stripe payment processor.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                How does AI matching work?
              </h4>
              <p className="text-gray-600">
                Our AI analyzes your profile, interests, and goals to provide contextual program rankings and personalized explanations for each match, helping you find the perfect fit.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Is my payment information secure?
              </h4>
              <p className="text-gray-600">
                Yes! We use Stripe for payment processing, which is PCI-DSS compliant and uses 256-bit SSL encryption. We never store your card details on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumCheckout;

import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />

      <main className="flex-1 pt-32 px-6 max-w-4xl mx-auto pb-16">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl md:text-5xl font-light mb-4">Cancellation Policy</h1>
            <p className="text-gray-600 text-lg">
              Understanding our flexible cancellation terms
            </p>
          </div>

          {/* Main Policy */}
          <div className="bg-gray-50 rounded-3xl p-8 space-y-6">
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-black flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-medium mb-2">48-Hour Free Cancellation</h2>
                <p className="text-gray-700">
                  Cancel your reservation free of charge up to 48 hours before your scheduled check-in time.
                  No questions asked, no fees charged.
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="space-y-6">
            <h2 className="text-2xl font-light">How It Works</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-6 bg-white border border-gray-100 rounded-2xl">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium mb-1">Before 48-Hour Window</h3>
                  <p className="text-sm text-gray-600">
                    Cancel anytime before the 48-hour deadline for a full refund. The cancellation deadline
                    is shown on your booking details.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white border border-gray-100 rounded-2xl">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium mb-1">After 48-Hour Window</h3>
                  <p className="text-sm text-gray-600">
                    Cancellations made within 48 hours of check-in are not eligible for refund.
                    The booking amount will be retained.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white border border-gray-100 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium mb-1">Host Cancellations</h3>
                  <p className="text-sm text-gray-600">
                    If a host cancels your confirmed booking, you'll receive a full refund automatically
                    and a credit toward your next stay.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Examples */}
          <div className="space-y-6">
            <h2 className="text-2xl font-light">Examples</h2>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-medium mb-3">Scenario 1: Early Cancellation ✅</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>• <strong>Check-in:</strong> December 20, 2025 at 3:00 PM</p>
                <p>• <strong>Cancellation deadline:</strong> December 18, 2025 at 3:00 PM</p>
                <p>• <strong>You cancel on:</strong> December 15, 2025</p>
                <p className="text-green-700 font-medium mt-3">
                  ✓ Result: Full refund issued
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-medium mb-3">Scenario 2: Late Cancellation ❌</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>• <strong>Check-in:</strong> December 20, 2025 at 3:00 PM</p>
                <p>• <strong>Cancellation deadline:</strong> December 18, 2025 at 3:00 PM</p>
                <p>• <strong>You cancel on:</strong> December 19, 2025</p>
                <p className="text-red-700 font-medium mt-3">
                  ✗ Result: No refund (deadline passed)
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="space-y-6">
            <h2 className="text-2xl font-light">Frequently Asked Questions</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">When will I receive my refund?</h3>
                <p className="text-sm text-gray-600">
                  Refunds are processed within 5-10 business days and will appear on your original payment method.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Can I modify my booking instead of cancelling?</h3>
                <p className="text-sm text-gray-600">
                  Yes, you can contact the host to request date changes. If the new dates are available,
                  modifications don't count as cancellations.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">What if there's an emergency?</h3>
                <p className="text-sm text-gray-600">
                  We understand that emergencies happen. Contact our support team at support@hbnb.com
                  with documentation, and we'll review your case individually.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">How do I cancel my booking?</h3>
                <p className="text-sm text-gray-600">
                  Go to your Profile → Trips → Select the booking → Click "Cancel booking".
                  You'll see if you're within the free cancellation window before confirming.
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-black text-white rounded-3xl p-8 text-center">
            <h2 className="text-xl font-light mb-2">Still Have Questions?</h2>
            <p className="text-white/80 mb-4">
              Our support team is here to help
            </p>
            <a
              href="mailto:support@hbnb.com"
              className="inline-block bg-white text-black px-6 py-3 rounded-2xl font-medium hover:bg-gray-100 transition"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

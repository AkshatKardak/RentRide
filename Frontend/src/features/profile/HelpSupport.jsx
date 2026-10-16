import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  Send,
  ChevronDown,
  Book,
  FileText
} from 'lucide-react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { useTheme } from '@/context/ThemeContext';

const HelpSupport = () => {
  const { theme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('faq');
  const [openFaq, setOpenFaq] = useState(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    category: 'booking',
    message: ''
  });

  const faqs = [
    {
      question: 'How do I book a car?',
      answer: 'Browse our car fleet, select your preferred vehicle, choose pickup/dropoff dates and location, then proceed to payment. You\'ll receive instant confirmation via email and SMS.'
    },
    {
      question: 'What documents do I need?',
      answer: 'You need a valid driver\'s license, government-issued ID (Aadhar/Passport), and a credit/debit card for payment. All documents should be valid for at least 6 months.'
    },
    {
      question: 'Can I modify my booking?',
      answer: 'Yes, you can modify your booking up to 24 hours before pickup time. Go to My Bookings, select your reservation, and click "Modify Booking".'
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'Free cancellation up to 48 hours before pickup. Cancellations within 48 hours are subject to a 25% fee. No-shows result in full charge.'
    },
    {
      question: 'Is insurance included?',
      answer: 'Yes, all rentals include basic insurance coverage. You can purchase additional comprehensive coverage during booking for extra protection.'
    },
    {
      question: 'What if the car breaks down?',
      answer: 'Contact our 24/7 roadside assistance immediately. We\'ll either send help or provide a replacement vehicle at no additional cost.'
    }
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    console.log('Support ticket:', contactForm);
    alert('Your message has been sent! We\'ll get back to you within 24 hours.');
    setContactForm({ subject: '', category: 'booking', message: '' });
  };

  return (
    <div 
      className="min-h-screen pb-20"
      style={{ backgroundColor: theme?.background || '#f9fafb' }}
    >
      <DashboardNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 
              className="text-4xl font-bold mb-2"
              style={{ color: theme?.text || '#111827' }}
            >
              Help & Support
            </h1>
            <p style={{ color: theme?.textSecondary || '#6b7280' }}>
              We're here to help you 24/7
            </p>
          </div>

          {/* Quick Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div 
              className="rounded-2xl p-6 border text-center hover:shadow-lg transition"
              style={{ 
                backgroundColor: theme?.card || '#ffffff',
                borderColor: theme?.border || '#e5e7eb'
              }}
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="text-green-600" size={24} />
              </div>
              <h3 
                className="font-bold mb-1"
                style={{ color: theme?.text || '#111827' }}
              >
                24/7 Phone Support
              </h3>
              <p 
                className="text-sm mb-2"
                style={{ color: theme?.textSecondary || '#6b7280' }}
              >
                Instant help anytime
              </p>
              <a href="tel:+911800123456" className="text-green-600 font-semibold text-lg">
                1800-123-456
              </a>
            </div>

            <div 
              className="rounded-2xl p-6 border text-center hover:shadow-lg transition"
              style={{ 
                backgroundColor: theme?.card || '#ffffff',
                borderColor: theme?.border || '#e5e7eb'
              }}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="text-blue-600" size={24} />
              </div>
              <h3 
                className="font-bold mb-1"
                style={{ color: theme?.text || '#111827' }}
              >
                Email Support
              </h3>
              <p 
                className="text-sm mb-2"
                style={{ color: theme?.textSecondary || '#6b7280' }}
              >
                Response within 24 hours
              </p>
              <a href="mailto:support@rentride.com" className="text-blue-600 font-semibold">
                support@rentride.com
              </a>
            </div>

            <div 
              className="rounded-2xl p-6 border text-center hover:shadow-lg transition"
              style={{ 
                backgroundColor: theme?.card || '#ffffff',
                borderColor: theme?.border || '#e5e7eb'
              }}
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="text-purple-600" size={24} />
              </div>
              <h3 
                className="font-bold mb-1"
                style={{ color: theme?.text || '#111827' }}
              >
                Live Chat
              </h3>
              <p 
                className="text-sm mb-2"
                style={{ color: theme?.textSecondary || '#6b7280' }}
              >
                Chat with our team
              </p>
              <button className="text-purple-600 font-semibold">
                Start Chat →
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b" style={{ borderColor: theme?.border }}>
            {[
              { id: 'faq', label: 'FAQs', icon: HelpCircle },
              { id: 'contact', label: 'Contact Us', icon: MessageCircle },
              { id: 'guides', label: 'Guides', icon: Book }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-6 py-3 font-semibold transition flex items-center gap-2 ${
                  activeTab === id
                    ? 'text-green-600 border-b-2 border-green-600'
                    : ''
                }`}
                style={{ color: activeTab === id ? undefined : theme?.textSecondary }}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>

          {/* FAQ Section */}
          {activeTab === 'faq' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-2xl border overflow-hidden"
                  style={{ 
                    backgroundColor: theme?.card || '#ffffff',
                    borderColor: theme?.border || '#e5e7eb'
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <span 
                      className="font-semibold text-left"
                      style={{ color: theme?.text || '#111827' }}
                    >
                      {faq.question}
                    </span>
                    <ChevronDown 
                      size={20}
                      className={`transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                      style={{ color: theme?.textSecondary }}
                    />
                  </button>
                  {openFaq === index && (
                    <div 
                      className="px-6 pb-4 border-t"
                      style={{ 
                        color: theme?.textSecondary || '#6b7280',
                        borderColor: theme?.border
                      }}
                    >
                      <p className="pt-4">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {/* Contact Form */}
          {activeTab === 'contact' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div 
                className="rounded-3xl p-8 border max-w-2xl mx-auto"
                style={{ 
                  backgroundColor: theme?.card || '#ffffff',
                  borderColor: theme?.border || '#e5e7eb'
                }}
              >
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div>
                    <label 
                      className="block text-sm font-semibold mb-2"
                      style={{ color: theme?.text || '#111827' }}
                    >
                      Category
                    </label>
                    <select
                      value={contactForm.category}
                      onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500"
                      style={{
                        backgroundColor: theme?.background || '#f9fafb',
                        borderColor: theme?.border || '#e5e7eb',
                        color: theme?.text || '#111827'
                      }}
                    >
                      <option value="booking">Booking Issue</option>
                      <option value="payment">Payment Issue</option>
                      <option value="damage">Damage Report</option>
                      <option value="technical">Technical Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-semibold mb-2"
                      style={{ color: theme?.text || '#111827' }}
                    >
                      Subject
                    </label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      placeholder="Brief description of your issue"
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500"
                      style={{
                        backgroundColor: theme?.background || '#f9fafb',
                        borderColor: theme?.border || '#e5e7eb',
                        color: theme?.text || '#111827'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-semibold mb-2"
                      style={{ color: theme?.text || '#111827' }}
                    >
                      Message
                    </label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Please provide detailed information about your issue..."
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      style={{
                        backgroundColor: theme?.background || '#f9fafb',
                        borderColor: theme?.border || '#e5e7eb',
                        color: theme?.text || '#111827'
                      }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Send size={20} />
                    Send Message
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Guides Section */}
          {activeTab === 'guides' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                { title: 'Getting Started', description: 'Learn how to book your first car' },
                { title: 'Payment Methods', description: 'Accepted payment options' },
                { title: 'Booking Modifications', description: 'How to change or cancel bookings' },
                { title: 'Insurance Guide', description: 'Understanding coverage options' },
                { title: 'Damage Reporting', description: 'Steps to report vehicle damage' },
                { title: 'Safety Guidelines', description: 'Important safety information' }
              ].map((guide, index) => (
                <div
                  key={index}
                  className="rounded-2xl p-6 border hover:shadow-lg transition cursor-pointer"
                  style={{ 
                    backgroundColor: theme?.card || '#ffffff',
                    borderColor: theme?.border || '#e5e7eb'
                  }}
                >
                  <FileText className="text-green-500 mb-3" size={32} />
                  <h3 
                    className="font-bold text-lg mb-2"
                    style={{ color: theme?.text || '#111827' }}
                  >
                    {guide.title}
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: theme?.textSecondary || '#6b7280' }}
                  >
                    {guide.description}
                  </p>
                  <button className="text-green-600 font-semibold mt-3 text-sm">
                    Read More →
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default HelpSupport;

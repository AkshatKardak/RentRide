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
import { useTheme } from '@/hooks/useTheme';

const HelpSupport = () => {
  const { isDarkMode } = useTheme();
  
  const [activeTab, setActiveTab] = useState('faq');
  const [openFaq, setOpenFaq] = useState(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    category: 'booking',
    message: ''
  });

  const faqs = [
    {
      question: 'How do I reserve a verified vehicle?',
      answer: 'Browse our authenticated fleet, select your preferred model, choose pickup/dropoff dates and metro hub, then proceed to escrow settlement. You will receive an instant cryptographically hashed booking confirmation.'
    },
    {
      question: 'What documents are required for digital check-in?',
      answer: 'You need an active Indian Driving License, Aadhaar/Passport proof of identity, and an active payment method. All documents are verified via our automated KYC layer.'
    },
    {
      question: 'Can I modify my booking dates or location?',
      answer: 'Yes, modifications can be requested up to 24 hours before pickup. Visit My Bookings and select Modify Reservation.'
    },
    {
      question: 'What is the security deposit policy?',
      answer: 'A standard refundable deposit of ₹500 is placed in digital escrow during payment. Upon damage inspection clearance at drop-off, the escrow is automatically unlocked.'
    },
    {
      question: 'How does the AI Damage Detection work?',
      answer: 'Before driving away and upon return, snap 3-5 photos of the vehicle exterior. Our AI scan model inspects panels, detects surface scratches, and records the vehicle baseline on the ledger.'
    },
    {
      question: 'What if the car requires roadside assistance?',
      answer: 'Our 24/7 emergency dispatch team can be reached directly via phone or the in-app AI Assistant. A replacement vehicle or on-site technician will be dispatched promptly.'
    }
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert('Your message has been sent! Our support team will respond within 24 hours.');
    setContactForm({ subject: '', category: 'booking', message: '' });
  };

  return (
    <div className="min-h-screen bg-bg text-text pb-20 transition-colors duration-300 font-sans">
      <DashboardNavbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight text-text mb-2">
              Help & Concierge Support
            </h1>
            <p className="text-xs md:text-sm text-muted">
              24/7 dedicated fleet support, live chat assistance, and knowledge guides
            </p>
          </div>

          {/* Quick Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="rounded-3xl p-6 border border-border bg-surface text-center hover:border-primary/40 transition-colors shadow-xs">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-3 text-primary">
                <Phone size={22} />
              </div>
              <h3 className="font-display font-bold text-sm text-text mb-1">
                24/7 Phone Concierge
              </h3>
              <p className="text-xs text-muted mb-2 font-mono">
                Instant priority response
              </p>
              <a href="tel:+911800123456" className="text-primary font-mono font-bold text-sm hover:underline">
                1800-123-456
              </a>
            </div>

            <div className="rounded-3xl p-6 border border-border bg-surface text-center hover:border-primary/40 transition-colors shadow-xs">
              <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-3 text-accent">
                <Mail size={22} />
              </div>
              <h3 className="font-display font-bold text-sm text-text mb-1">
                Executive Desk
              </h3>
              <p className="text-xs text-muted mb-2 font-mono">
                Response within 2 hours
              </p>
              <a href="mailto:support@rentride.com" className="text-accent font-mono font-bold text-xs hover:underline">
                support@rentride.com
              </a>
            </div>

            <div className="rounded-3xl p-6 border border-border bg-surface text-center hover:border-primary/40 transition-colors shadow-xs">
              <div className="w-12 h-12 bg-surface-sunken border border-border rounded-2xl flex items-center justify-center mx-auto mb-3 text-primary">
                <MessageCircle size={22} />
              </div>
              <h3 className="font-display font-bold text-sm text-text mb-1">
                AI Fleet Assistant
              </h3>
              <p className="text-xs text-muted mb-2 font-mono">
                Real-time recommendations
              </p>
              <a href="/aiassistant" className="text-primary font-bold text-xs hover:underline">
                Launch Assistant →
              </a>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border">
            {[
              { id: 'faq', label: 'FAQs', icon: HelpCircle },
              { id: 'contact', label: 'Contact Us', icon: MessageCircle },
              { id: 'guides', label: 'Guides', icon: Book }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-6 py-3 font-semibold text-xs transition flex items-center gap-2 border-b-2 font-mono ${
                  activeTab === id
                    ? 'text-primary border-primary font-bold'
                    : 'text-muted border-transparent hover:text-text'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
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
                  className="rounded-2xl border border-border bg-surface overflow-hidden shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-surface-sunken/40 transition-colors text-left"
                  >
                    <span className="font-bold text-sm text-text">
                      {faq.question}
                    </span>
                    <ChevronDown 
                      size={18}
                      className={`text-subtle transition-transform ${openFaq === index ? 'rotate-180 text-primary' : ''}`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4 border-t border-border bg-surface-sunken/20">
                      <p className="pt-3 text-xs text-muted leading-relaxed">
                        {faq.answer}
                      </p>
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
              <div className="rounded-3xl p-8 border border-border bg-surface max-w-2xl mx-auto shadow-xs">
                <form onSubmit={handleContactSubmit} className="space-y-5 text-xs">
                  <div>
                    <label className="block font-mono font-bold uppercase tracking-wider mb-2 text-muted">
                      Inquiry Category
                    </label>
                    <select
                      value={contactForm.category}
                      onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface-sunken text-text focus:outline-none focus:border-primary"
                    >
                      <option value="booking">Booking & Reservation</option>
                      <option value="payment">Escrow & Payment</option>
                      <option value="damage">Damage Inspection Claim</option>
                      <option value="technical">Technical Support</option>
                      <option value="other">Other Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono font-bold uppercase tracking-wider mb-2 text-muted">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      placeholder="Brief summary of inquiry"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface-sunken text-text focus:outline-none focus:border-primary placeholder:text-muted"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-mono font-bold uppercase tracking-wider mb-2 text-muted">
                      Message
                    </label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Please provide details regarding your trip or account..."
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface-sunken text-text focus:outline-none focus:border-primary resize-none placeholder:text-muted"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md shadow-primary/20 text-xs"
                  >
                    <Send size={16} />
                    <span>Send Message to Operations</span>
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {[
                { title: 'Getting Started', description: 'Selecting, booking, and unlocking your verified rental car' },
                { title: 'Escrow Settlement', description: 'Transparent Razorpay gateway security deposits and refunds' },
                { title: 'Booking Changes', description: 'Extending trip duration, changing drop-off hub, or cancellation' },
                { title: 'Insurance Shield', description: 'Coverage scopes, zero-dep protections, and deductible policies' },
                { title: 'AI Damage Inspection', description: 'Photo submission tips to protect your deposit upon return' },
                { title: 'Safety & FastTag', description: 'Highway toll usage, 24/7 roadside assistance, and speed limits' }
              ].map((guide, index) => (
                <div
                  key={index}
                  className="rounded-3xl p-6 border border-border bg-surface hover:border-primary/40 transition-colors cursor-pointer shadow-xs"
                >
                  <FileText className="text-primary mb-3" size={28} />
                  <h3 className="font-display font-bold text-base text-text mb-1.5">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    {guide.description}
                  </p>
                  <span className="text-primary font-bold mt-3 text-xs inline-flex items-center gap-1">
                    Read Guide →
                  </span>
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

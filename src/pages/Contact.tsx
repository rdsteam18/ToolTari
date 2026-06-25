import React, { useState } from 'react';
import ToolSEO from '../components/tool/ToolSEO';
import Button from '../components/ui/Button';
import { Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    // Simulate sending email request
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    }, 1000);
  };

  return (
    <>
      <ToolSEO
        title="Contact Our Team"
        description="Get in touch with the ToolTari team for support questions, feature requests, partnership feedback, or security audits."
      />

      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-10">
        
        {/* Contact Info Sidebar */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Contact Us</h1>
            <p className="text-sm text-slate-500">We'd love to hear from you. Get in touch with our team.</p>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg"><Mail className="h-5 w-5" /></div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                <a href="mailto:support@tooltari.in" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-smooth">
                  support@tooltari.in
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg"><MessageSquare className="h-5 w-5" /></div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Social Channels</span>
                <span className="text-sm text-slate-500">Instagram: @tooltari.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Container */}
        <div className="flex-[1.5] bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center text-center py-8 gap-4 animate-fade-in">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full">
                <CheckCircle className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Message Received!</h3>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                Thank you for contacting ToolTari. Our team will review your ticket and reply within 24-48 business hours.
              </p>
              <Button onClick={() => setIsSubmitted(false)} variant="secondary" className="mt-2 text-xs">
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-800 text-lg mb-2">Send a Message</h3>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-300 focus:bg-white rounded-lg text-sm transition-smooth outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-300 focus:bg-white rounded-lg text-sm transition-smooth outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us about your issue, suggestion, or request..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-300 focus:bg-white rounded-lg text-sm transition-smooth outline-none resize-none"
                />
              </div>

              <Button type="submit" isLoading={loading} className="w-full mt-2 font-bold py-2.5 flex items-center justify-center gap-1.5">
                Submit Message <Send className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>

      </div>
    </>
  );
}
export { Contact };

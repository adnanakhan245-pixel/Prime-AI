import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  MessageSquare, 
  AlertCircle,
  Building2
} from 'lucide-react';
import { submitClientInboundEmail } from '../services/db';

interface ClientContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCompanyId?: string;
}

export const ClientContactModal: React.FC<ClientContactModalProps> = ({
  isOpen,
  onClose,
  targetCompanyId
}) => {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'CLIENT' | 'VENDOR' | 'INVESTOR' | 'TEAM' | 'LEGAL'>('CLIENT');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderEmail.trim() || !subject.trim() || !message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await submitClientInboundEmail({
        senderName,
        senderEmail,
        subject,
        message,
        category,
        companyId: targetCompanyId
      });

      if (res.success) {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to dispatch message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setSenderName('');
    setSenderEmail('');
    setSubject('');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-[#FFD700]/30 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Direct Client Email &amp; Inquiry</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                Direct Dispatch 24/7
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Send your message directly to the executive inbox without waiting for admin approval.
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-black border border-emerald-500/40 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Email Sent Successfully!</h3>
              <p className="text-xs text-emerald-400 font-semibold mt-1">
                Your message has been directly received in our executive inbox.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-left space-y-1.5 text-neutral-300">
              <div className="text-white font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
                Automated Receipt Confirmed
              </div>
              <p className="text-[11px] text-neutral-400">
                Subject: <strong className="text-white">{subject}</strong>
              </p>
              <p className="text-[11px] text-neutral-400">
                Sender: <strong className="text-white">{senderName} ({senderEmail})</strong>
              </p>
              <p className="text-[10px] text-emerald-400/90 pt-1">
                An executive response is queued and will be dispatched to your email address shortly.
              </p>
            </div>

            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-[#FFD700] hover:bg-[#FFE55C] text-black font-extrabold text-xs rounded-xl cursor-pointer transition-colors shadow-lg"
            >
              Send Another Message / Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Michael Vance"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD700]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  Your Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="michael@acme.com"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD700]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Project Proposal & Next Steps"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD700]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-white/20 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-[#FFD700]"
                >
                  <option value="CLIENT">Client Inquiry</option>
                  <option value="VENDOR">Vendor / Partner</option>
                  <option value="INVESTOR">Investor Outreach</option>
                  <option value="TEAM">Direct Team Message</option>
                  <option value="LEGAL">Legal / Contracts</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Your Message / Inquiry *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Type your message, questions, or requirements here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-neutral-900 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFD700] resize-none"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-neutral-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>100% Client Self-Service:</strong> Your email is processed instantly 24/7 without waiting for admin authorization.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs transition-all shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending Message...' : 'Send Message to Executive Team'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

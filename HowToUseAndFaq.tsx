import React from 'react';
import {
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Download,
  Share2,
  Sparkles
} from 'lucide-react';
import { translations } from '../translations';

interface HowToUseAndFaqProps {
  lang: 'en' | 'bn';
}

export const HowToUseAndFaq: React.FC<HowToUseAndFaqProps> = ({ lang }) => {
  const t = translations[lang];

  const steps = [
    {
      num: '01',
      title: lang === 'en' ? 'Copy Reel Link' : 'রিল লিংক কপি করুন',
      desc: lang === 'en'
        ? 'Open Facebook, Instagram, YouTube Shorts, or TikTok. Tap Share and copy the video URL.'
        : 'ফেসবুক, ইনস্টাগ্রাম, ইউটিউব শর্টস বা টিকটক অ্যাপে গিয়ে শেয়ার অপশন থেকে লিংক কপি করুন।'
    },
    {
      num: '02',
      title: lang === 'en' ? 'Paste & Preview' : 'পেস্ট ও প্রিভিউ',
      desc: lang === 'en'
        ? 'Paste the link in SnapRill. Watch instant live preview and check video duration/audio.'
        : 'SnapRill-এ লিংক পেস্ট করে সাথে সাথে ফুল কোয়ালিটি লাইভ ভিডিও প্রিভিউ দেখুন।'
    },
    {
      num: '03',
      title: lang === 'en' ? 'Download to Folder' : 'ফোল্ডারে ডাউনলোড করুন',
      desc: lang === 'en'
        ? 'Click "Download HD MP4" or choose Audio MP3. The file saves directly to your device downloads folder.'
        : '"Download HD MP4" বাটনে ক্লিক করুন। সরাসরি আপনার ডিভাইস ফোল্ডারে সেভ হয়ে যাবে।'
    },
    {
      num: '04',
      title: lang === 'en' ? 'AI Repurpose' : 'এআই দিয়ে ভাইরাল হোন',
      desc: lang === 'en'
        ? 'Use our AI Creator Studio to generate 5 high-converting captions, viral tags, and Bengali scripts.'
        : 'এআই ক্রিয়েটর স্টুডিও থেকে ৫টি ভাইরাল ক্যাপশন, ট্যাগ ও রি-পোস্ট স্ক্রিপ্ট সংগ্রহ করুন।'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-12">
      {/* 4-Step Visual Process */}
      <div className="space-y-6">
        <div className="text-center space-y-1.5">
          <span className="text-xs uppercase font-extrabold text-rose-400 tracking-wider font-mono">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {lang === 'en' ? 'Simple 4-Step Process' : 'সহজ ৪টি ধাপে ডাউনলোড ও এআই স্টুডিও'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 relative"
            >
              <div className="text-2xl font-black font-mono text-rose-500/40">
                {step.num}
              </div>
              <h3 className="text-sm font-bold text-white">
                {step.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="space-y-6">
        <div className="text-center space-y-1.5">
          <span className="text-xs uppercase font-extrabold text-indigo-400 tracking-wider font-mono">
            Answers & Help
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.faqTitle}
          </h2>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t.faq1Q}</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-6">
              {t.faq1A}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t.faq2Q}</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-6">
              {t.faq2A}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{t.faq3Q}</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-6">
              {t.faq3A}
            </p>
          </div>
        </div>
      </div>

      {/* Safety & Fair Use Notice */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Fair Use & Privacy Protection</span>
        </div>
        <p className="text-[11px] text-slate-500 max-w-xl mx-auto leading-relaxed">
          SnapRill does not host copyright-infringing materials on its servers. We respect creator rights and provide this utility for personal, offline archival, fair-use review, and research purposes.
        </p>
      </div>
    </div>
  );
};

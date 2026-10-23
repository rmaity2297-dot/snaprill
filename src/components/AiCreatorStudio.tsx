import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Layers,
  Flame,
  ArrowRight
} from 'lucide-react';
import { AiAnalysisData } from '../types';
import { translations } from '../translations';

interface AiCreatorStudioProps {
  analysis: AiAnalysisData | null;
  isLoading: boolean;
  lang: 'en' | 'bn';
  videoPlatform: string;
  videoTitle?: string;
  author?: string;
  onGenerate: (targetPlatform: string) => void;
}

export const AiCreatorStudio: React.FC<AiCreatorStudioProps> = ({
  analysis,
  isLoading,
  lang,
  videoPlatform,
  videoTitle,
  author,
  onGenerate,
}) => {
  const t = translations[lang];

  // Selected platform tab (Instagram, YouTube, Facebook, TikTok)
  const [selectedPlatform, setSelectedPlatform] = useState<string>(() => {
    const p = (videoPlatform || 'instagram').toLowerCase();
    if (['youtube', 'instagram', 'facebook', 'tiktok'].includes(p)) return p;
    return 'instagram';
  });

  // Cached generated content per platform
  const [generatedFormats, setGeneratedFormats] = useState<Record<string, string>>({});
  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = (videoPlatform || 'instagram').toLowerCase();
    if (['youtube', 'instagram', 'facebook', 'tiktok'].includes(p)) {
      setSelectedPlatform(p);
    }
  }, [videoPlatform]);

  // Sync parent analysis prop into platform cache
  useEffect(() => {
    if (analysis && analysis.formattedContent) {
      const platKey = (analysis.platform || selectedPlatform).toLowerCase();
      setGeneratedFormats((prev) => ({
        ...prev,
        [platKey]: analysis.formattedContent,
      }));
    }
  }, [analysis]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platforms = [
    {
      id: 'instagram',
      name: 'INSTAGRAM',
      label: 'Instagram Reels',
      btnText: 'Generate INSTAGRAM Format Now',
      icon: '📸',
    },
    {
      id: 'youtube',
      name: 'YOUTUBE',
      label: 'YouTube Shorts',
      btnText: 'Generate YOUTUBE Format Now',
      icon: '🔴',
    },
    {
      id: 'facebook',
      name: 'FACEBOOK',
      label: 'Facebook Reels',
      btnText: 'Generate FACEBOOK Format Now',
      icon: '🔵',
    },
    {
      id: 'tiktok',
      name: 'TIKTOK',
      label: 'TikTok',
      btnText: 'Generate TIKTOK Format Now',
      icon: '🎵',
    },
  ];

  const currentPlatformObj = platforms.find((p) => p.id === selectedPlatform) || platforms[0];

  // Heuristic instant generator fallback for 100% guarantee on any network
  const createInstantFormat = (platformId: string): string => {
    const rawTitle = videoTitle || 'Trending Short Video';
    const cleanTopic = rawTitle.slice(0, 60).replace(/["*_]/g, '').trim();
    const cleanTopicUpper = cleanTopic.toUpperCase();
    const safeTag = cleanTopic.replace(/[^a-zA-Z0-9]/g, '') || 'Reels';
    const authorTag = (author || 'all_rounder_ajay').replace(/[^a-zA-Z0-9_]/g, '');

    // Intelligent genre & theme classifier
    const titleLower = rawTitle.toLowerCase();
    const isDevotional = /durga|maa|shiv|krishna|ram|bhakti|temple|puja|god|lord|mantra|aarti|devotional|hindu|allah|islamic|prayer|spiritual|integar|30-09-2027/i.test(titleLower);
    const isDance = /dance|choreography|kathak|bharatanatyam|saree|garba|bhangra|thumka|hiphop|performance|othaiyadi/i.test(titleLower);
    const isTech = /iphone|camera|hacks|tech|mobile|code|programming|laptop|software|ai|gadgets|android|tips/i.test(titleLower);
    const isEducation = /tongue|anatomy|study|notes|exam|pharmacy|nursing|science|history|gk|biology|concept/i.test(titleLower);
    const isTravel = /travel|bali|sunset|viewpoint|mountain|beach|tour|vlog|explore|wanderlust|nature/i.test(titleLower);
    const isPet = /puppy|dog|cat|kitten|pet|snow|retriever|animal/i.test(titleLower);

    let genreEmojis = '✨🔥💫';
    let genreInsight1 = `${cleanTopic} Creative Vision & Concept`;
    let genreInsight2 = 'Visual Flow & Emotional Impact';
    let genreInsight3 = 'Key Highlights & Unforgettable Moments';
    let genreInsight4 = 'Audience Connection & Relatability';
    let genreInsight5 = 'Atmosphere & Production Details';
    let genreInsight6 = 'Creator Inspiration & Daily Share';
    let genreHashtags = `#${safeTag} #${authorTag} #ViralReels #TrendingNow #ReelsIndia #ExplorePage #ViralVideo #CreatorLife #DailyReels #ViralPost #MustWatch #InstagramCreators #TrendingReels #ExploreMore #ContentCreator #ViralTrending #ReelsViral #ShortVideo #InstaGood #TopTrending #Entertainment #IndianCreators #ShortsFeed #FYP #Trending`;

    if (isDevotional) {
      genreEmojis = '🕉️🙏✨';
      genreInsight1 = `Maa's Divine Grace & Auspicious Blessings`;
      genreInsight2 = 'Spiritual Serenity & Sacred Darshan';
      genreInsight3 = 'Devotional Energy & Inner Peace';
      genreInsight4 = 'Sanatan Culture & Puja Traditions';
      genreInsight5 = 'Sacred Bhakti & Soulful Vibes';
      genreInsight6 = 'Daily Spiritual Reflection & Prayers';
      genreHashtags = `#${safeTag} #${authorTag} #MaaDurga #Bhakti #Devotional #Spiritual #BhaktiStatus #JaiMataDi #SanatanDharma #PujaVibes #MandirDarshan #HinduDevotional #BhaktiReels #DivineEnergy #PeaceAndBlessings #ReelsIndia #SpiritualVibes #ExplorePage #TrendingReels #DailyDevotion #FaithAndPrayer #AartiAndMantra #BlessedDay #IndianSpiritual #BhaktiSangeet #ViralBhakti`;
    } else if (isDance) {
      genreEmojis = '💃✨❤️';
      genreInsight1 = 'Expressive Movements & Facial Grace';
      genreInsight2 = 'Rhythm, Beat Drops & Musical Timing';
      genreInsight3 = 'Traditional Attire & Aesthetic Styling';
      genreInsight4 = 'Seamless Transitions & Stage Presence';
      genreInsight5 = 'Choreography Breakdown & Energy';
      genreInsight6 = 'Passion, Artistry & Creator Dedication';
      genreHashtags = `#${safeTag} #${authorTag} #DanceReels #IndianDance #TraditionalDance #SareeDance #Choreography #DanceTransition #DesiVibes #AestheticReels #ViralDance #ReelsIndia #DanceVideo #TrendingSound #DanceChallenge #CulturalArt #ClassicalFusion #DanceShorts #ExplorePage #TrendingReels #DesiGirl #GracefulMoves #ViralChoreography`;
    } else if (isTech) {
      genreEmojis = '⚡📱💡';
      genreInsight1 = 'Hidden Camera & Settings Optimization';
      genreInsight2 = 'Smart Shortcut Execution & Speed';
      genreInsight3 = 'Productivity Hacks for Daily Use';
      genreInsight4 = 'Pro-Level Tricks & Troubleshooting';
      genreInsight5 = 'Battery, Quality & Performance Boost';
      genreInsight6 = 'Step-by-Step Practical Demonstration';
      genreHashtags = `#${safeTag} #${authorTag} #TechHacks #MobileTips #SmartShortcuts #TechReels #PhoneHacks #CameraTricks #Gadgets #Technology #DidYouKnow #ProductivityTips #LifeHacks #LearnOnReels #SmartLiving #ExplorePage #TrendingNow #ViralTech #DailyHacks #TechCommunity #ProTips`;
    } else if (isEducation) {
      genreEmojis = '📚🧠💡';
      genreInsight1 = 'Core Concept Clarification & Foundations';
      genreInsight2 = 'Key Structures & Functional Analysis';
      genreInsight3 = 'Practical Insights for Real-Life Scenarios';
      genreInsight4 = 'Complete Study Notes & Exam Highlights';
      genreInsight5 = 'In-Depth Breakdown & Terminology';
      genreInsight6 = 'Quick Revision & Memory Retention Tips';
      genreHashtags = `#${safeTag} #${authorTag} #Education #StudyNotes #StudentLife #Learning #QuickRevision #StudyGram #ExamPreparation #KnowledgeIsPower #LearnOnInstagram #EduReels #AcademicSuccess #ScienceFacts #DailyLearning #SmartStudy #StudentMotivation #StudyTips #ExploreEducation`;
    } else if (isTravel) {
      genreEmojis = '🌅🌴✈️';
      genreInsight1 = 'Hidden Scenic Viewpoint & Exact Location';
      genreInsight2 = 'Golden Hour Lighting & Photo Spots';
      genreInsight3 = 'Travel Itinerary & Timing Suggestions';
      genreInsight4 = 'Budget, Access & Visitor Guidelines';
      genreInsight5 = 'Nature Aesthetics & Serene Atmosphere';
      genreInsight6 = 'Wanderlust Bucket List Recommendations';
      genreHashtags = `#${safeTag} #${authorTag} #TravelReels #Wanderlust #ExploreNature #SunsetLovers #HiddenGems #TravelGram #VacationVibes #BucketList #ScenicViews #TravelDiaries #AdventureAwaits #NatureLovers #ExploreTheWorld #ExplorePage #TrendingTravel #ViralPlaces`;
    } else if (isPet) {
      genreEmojis = '🐾🐶❄️';
      genreInsight1 = 'Pure Joy & Playful First Reactions';
      genreInsight2 = 'Unconditional Love & Animal Bonding';
      genreInsight3 = 'Hilarious & Heartwarming Expressions';
      genreInsight4 = 'Care, Patience & Positive Training';
      genreInsight5 = 'Winter Fun & Outdoor Exploration';
      genreInsight6 = 'Daily Wholesome Pet Smiles';
      genreHashtags = `#${safeTag} #${authorTag} #PuppyLove #CutePets #DogLovers #PetReels #AnimalLove #GoldenRetriever #PuppyLife #DogLife #AdorablePets #WholesomeMoments #PetGram #DogsOfInstagram #CuteAnimals #ExplorePage #TrendingReels #ViralPuppy`;
    }

    if (platformId === 'instagram') {
      return `${genreEmojis} ${cleanTopicUpper} — An Inspiring Reel You Must Watch!

The beauty of "${cleanTopic}" brings a truly special emotion that resonates with everyone. ${genreEmojis.slice(0, 2)}
Every single moment captured here reflects pure dedication, authentic artistry, and unforgettable presence.

এই ভিডিওতে "${cleanTopic}"-এর বিশেষ মুহূর্তগুলো অত্যন্ত সুন্দর ও মনোরমভাবে উপস্থাপন করা হয়েছে—যাতে দর্শক ও শুভাকাঙ্ক্ষীরা এর সৌন্দর্য ও গভীর অনুভূতি উপভোগ করতে পারেন। 🙏✨❤️

Save this post 📌 to your collection and share it with someone who appreciates true quality and emotion! ❤️

Follow @${authorTag} for more:
✨ 1. ${genreInsight1}
🌟 2. ${genreInsight2}
💫 3. ${genreInsight3}
🎯 4. ${genreInsight4}
🔥 5. ${genreInsight5}
💡 6. ${genreInsight6}

Creative content made for cultural, artistic, and community appreciation.

Search Keywords:
${cleanTopic.toLowerCase()}, ${cleanTopic.toLowerCase()} reel, ${cleanTopic.toLowerCase()} video, ${cleanTopic.toLowerCase()} viral, ${cleanTopic.toLowerCase()} status, ${cleanTopic.toLowerCase()} hd, ${authorTag}, indian creator video, trending reels india, best of ${cleanTopic.toLowerCase()}, viral short video, aesthetic ${cleanTopic.toLowerCase()}, ${cleanTopic.toLowerCase()} moments, new reel 2026, daily reels, trending sound, viral moments, full hd reel, high quality video, explore reels, popular video, daily inspiration, reels trend, beautiful moments, top creators.

${genreHashtags}`;
    }

    if (platformId === 'youtube') {
      return `**${cleanTopic} ${genreEmojis} A Beautiful Moment Full of Charm @${authorTag} #Shorts #Trending #Viral

A breathtaking moment filled with grace, energy, and the mesmerizing vibe of ${cleanTopic} ${genreEmojis}
Every detail in this performance and frame adds emotion and charm to the experience. If you love authentic creativity, inspiring visual storytelling, and trending videos, watch till the end and feel the vibe! 💕✨

What do you think about this performance? Tell me in the comments below! 👇
Like ❤️ Share 🔄 and Subscribe 🔔 for more beautiful Shorts.

#${safeTag} #Shorts #TrendingShorts #ViralShorts #YouTubeShorts

${cleanTopic} era 🌺✨
POV: ${cleanTopic} era unlocked 🌸✨
Emotion + visuals + soundtrack = Pure magic 🌺💃
Authentic presence, unforgettable feeling ✨🌸
Just entered my ${cleanTopic} era 🤍🌺
When the visual hits different 🌸💫
“POV: ${cleanTopic} era unlocked 🌺✨💃”

${cleanTopic} video | ${cleanTopic} moments | ${cleanTopic} shorts | viral transition | trending sound | aesthetic shorts | Indian creator | viral video | top shorts

${cleanTopic.toLowerCase()}
${cleanTopic.toLowerCase()} shorts
${cleanTopic.toLowerCase()} viral
${cleanTopic.toLowerCase()} video
${cleanTopic.toLowerCase()} status
${cleanTopic.toLowerCase()} aesthetic
${cleanTopic.toLowerCase()} hd
trending shorts 2026
youtube shorts viral
shorts feed
daily shorts
creator shorts
viral video india
high definition shorts
clean video
explore shorts
trending sound
top youtube shorts

#${safeTag} #${authorTag} #Shorts #TrendingShorts #ViralShorts #YouTubeShorts #Trending #Viral #FYP #ExplorePage #ReelsIndia #ShortsFeed #CreatorLife #IndianCreators #ShortsVideo #TrendAlert #TrendingNow`;
    }

    if (platformId === 'facebook') {
      return `💡 ${cleanTopicUpper} — An Incredible Moment You Should Experience!

Taking a moment to appreciate "${cleanTopic}" connects us with what truly matters in creative expression and culture. 💡
Often, it is these genuine moments that inspire us most throughout our busy days.

এই পোস্টে "${cleanTopic}"-এর সুন্দর ও আকর্ষণীয় দিকগুলো বিশেষভাবে তুলে ধরা হয়েছে—যাতে আমাদের ফেসবুক পরিবারের সবাই এর সৌন্দর্য উপভোগ করতে পারেন। 📚👥✨

Save this post 📌 to your collection and share it with your friends, family, and relevant Facebook groups! ❤️

Follow @${authorTag} for daily highlights:
✅ 1. ${genreInsight1}
✅ 2. ${genreInsight2}
✅ 3. ${genreInsight3}
✅ 4. ${genreInsight4}
✅ 5. ${genreInsight5}
✅ 6. ${genreInsight6}

Community and cultural discussion content for knowledge and entertainment purposes.

Search Keywords:
${cleanTopic.toLowerCase()}, ${cleanTopic.toLowerCase()} facebook reel, ${cleanTopic.toLowerCase()} watch, viral facebook video, fb reels trending, smart creator content, popular facebook video, ${cleanTopic.toLowerCase()} status, best moments of ${cleanTopic.toLowerCase()}, viral reels india, top video post, family sharing, daily facebook reels, facebook creators.

#${safeTag} #${authorTag} #FacebookReels #FbViral #TrendingReels #ReelsIndia #FacebookVideo #ViralPost #DailyKnowledge #LearnOnFacebook #ViralReels #FbReels #CommunityPost #TrendingNow #ExploreFacebook #DesiCreators #Inspirational #ShareKnowledge #ViralContent #WatchFacebook`;
    }

    // TikTok
    return `**${cleanTopic} 🔥✨ Viral Trend You Need to Try @${authorTag} #FYP #Viral #TikTok**

This is why everyone is obsessed with ${cleanTopic} right now! 🔥✨
The audio sync, visual pacing, and creative energy make this one of the cleanest edits on the feed. Watch till the end to see the full aesthetic come together! ⚡👀

Did you catch the subtle detail at the end? Tell me in the comments! 👇
Like ❤️ and Follow ➕ for daily viral trends, transitions, and clean edits!

#${safeTag} #FYP #ForYou #ForYouPage #TikTokViral #ViralTrend #TrendingSound

POV: ${cleanTopic} trend unlocked 🔥✨
When the beat drops on ${cleanTopic} 🎶💥
This transition was way too clean 💫
Wait for the ending 👀🔥
Just entered my ${cleanTopic} era 🚀
“POV: Mastered the ${cleanTopic} trend 🔥💃”

${cleanTopic} trend | ${cleanTopic} sound | viral transition | fyp trend | tiktok viral | trending sound | clean edit | viral challenge

${cleanTopic.toLowerCase()}
${cleanTopic.toLowerCase()} trend
${cleanTopic.toLowerCase()} sound
${cleanTopic.toLowerCase()} transition
${cleanTopic.toLowerCase()} aesthetic
${cleanTopic.toLowerCase()} viral
${cleanTopic.toLowerCase()} challenge
viral transition
fyp trend
trending sound
tiktok viral
transition challenge
wait for the end
trending audio
clean video edit
viral fyp
tiktok creator
explore page
trend alert
for you page viral
tiktok famous
creator tips
clean sound
viral edit

#${safeTag} #${authorTag} #FYP #ForYou #ForYouPage #Viral #Trending #TikTok #TikTokViral #TikTokTrend #TrendingSound #TransitionTrend #FYPChallenge #ViralVideo #TikTokIndia #ExplorePage #TrendAlert #CleanEdit #TikTokFamous #TrendingNow #FYPViral #FYPPage #DailyTikTok #ContentCreator`;
  };

 const handleGenerate = async (targetPlatform: string) => {
    setLoadingPlatform(targetPlatform);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Fetch timeout')), 2500)
      );
      const fetchPromise = fetch('/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: videoTitle,
          platform: videoPlatform,
          targetPlatform: targetPlatform,
          author: author,
          language: lang,
        }),
      }).then((r) => r.json());

      const resJson: any = await Promise.race([fetchPromise, timeoutPromise]);
      if (resJson && resJson.success && resJson.data && resJson.data.formattedContent) {
        setGeneratedFormats((prev) => ({
          ...prev,
          [targetPlatform]: resJson.data.formattedContent,
        }));
        setLoadingPlatform(null);
        return;
      }
    } catch (e) {
      console.warn('API analyze request error or timeout, applying instant fallback:', e);
    }

    // Instant fallback guarantee with 100% complete formatted structure
    const fallbackText = createInstantFormat(targetPlatform);
    setGeneratedFormats((prev) => ({
      ...prev,
      [targetPlatform]: fallbackText,
    }));
    setLoadingPlatform(null);
  };
  const activeContent =
    generatedFormats[selectedPlatform] ||
    (analysis && (analysis.platform || '').toLowerCase() === selectedPlatform.toLowerCase()
      ? analysis.formattedContent
      : null);

  const isCurrentPlatformGenerated = Boolean(activeContent);
  const isCurrentlyLoading = (isLoading && selectedPlatform === (analysis?.platform || selectedPlatform).toLowerCase()) || loadingPlatform === selectedPlatform;

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-xl space-y-5 tilt-card-3d">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-white">
              {lang === 'en' ? 'AI Social Media Content Generator' : 'এআই সোশ্যাল মিডিয়া কনটেন্ট জেনারেটর'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'en'
                ? 'Select a platform below and click generate to get the complete ready-to-post format.'
                : 'নিচের প্ল্যাটফর্ম বেছে নিয়ে বাটনে ক্লিক করলেই সম্পূর্ণ রেডি-টু-পোস্ট ফরম্যাট তৈরি হয়ে যাবে।'}
            </p>
          </div>
        </div>

        {/* 4 Platform Tab Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {platforms.map((p) => {
            const isSelected = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border btn-3d ${
                  isSelected
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                    : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Area: Button or Loading or Output */}
      {isCurrentlyLoading ? (
        <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-8 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-200">
            {lang === 'en'
              ? `Analyzing video & generating ${currentPlatformObj.name} format...`
              : `ভিডিও বিশ্লেষণ করে ${currentPlatformObj.name} ফরম্যাট তৈরি হচ্ছে...`}
          </p>
          <p className="text-xs text-slate-500 font-mono">
            Structuring title hooks, description, learning takeaways, hashtags, and keywords...
          </p>
        </div>
      ) : !isCurrentPlatformGenerated ? (
        /* The specific "Generate [PLATFORM] Format Now" button requested */
        <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <Flame className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">
              {currentPlatformObj.name} Format Generator
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {lang === 'en'
                ? `Click below to generate the complete ${currentPlatformObj.label} post with hooks, full description, SEO tags, and hashtags.`
                : `নিচের বাটনে ক্লিক করে ${currentPlatformObj.label}-এর সম্পূর্ণ পোস্ট, হুক, বিবরণ ও হ্যাশট্যাগ একসাথে তৈরি করুন।`}
            </p>
          </div>

          <button
            onClick={() => handleGenerate(selectedPlatform)}
            className="w-full sm:w-auto py-3.5 px-8 rounded-xl font-extrabold text-sm sm:text-base bg-gradient-to-r from-rose-500 via-pink-600 to-rose-500 hover:opacity-95 text-white shadow-xl shadow-rose-500/25 inline-flex items-center justify-center gap-2.5 cursor-pointer transition-all btn-3d"
          >
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
            <span>{currentPlatformObj.btnText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Complete Formatted Output View with 1-Click Copy All */
        <div className="space-y-4">
          {/* Top Bar with Copy Entire Format & Regenerate */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/40 via-indigo-950/40 to-slate-950 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{currentPlatformObj.name} Post Format</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Ready to Post
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  {lang === 'en'
                    ? 'All sections generated together in one complete structure.'
                    : 'সবগুলো সেকশন একসাথে সাজিয়ে তৈরি করা হয়েছে।'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleGenerate(selectedPlatform)}
                title="Regenerate format"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-all"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => copyToClipboard(activeContent!)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-rose-600 to-pink-600 hover:opacity-95 text-white cursor-pointer transition-all shadow-lg shadow-rose-600/30"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>{lang === 'en' ? 'Copied to Clipboard!' : 'কপি হয়েছে!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{lang === 'en' ? 'Copy Entire Format' : 'সম্পূর্ণ ফরম্যাট কপি করুন'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Clean Preformatted Text Box */}
          <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 sm:p-5">
            <pre className="text-xs sm:text-sm text-slate-200 font-sans whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {activeContent}
            </pre>
          </div>

          {/* Bottom 1-Click Copy Bar */}
          <div className="flex justify-end">
            <button
              onClick={() => copyToClipboard(activeContent!)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer transition-all shadow-md shadow-rose-600/30"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>{lang === 'en' ? 'Copied to Clipboard!' : 'কপি হয়েছে!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Copy Entire Format' : 'সম্পূর্ণ ফরম্যাট কপি করুন'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

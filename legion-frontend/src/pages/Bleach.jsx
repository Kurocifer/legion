import { useState } from 'react';
import { Swords, Zap, Flame, Sparkles, RefreshCw } from 'lucide-react';

const Bleach = () => {
  const [bankaiActivated, setBankaiActivated] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(null);

  const bleachQuotes = [
    {
      quote: "If fate is a millstone, then we are the grist. There is nothing we can do. So I wish for strength. If I cannot protect them from the wheel, then give me a strong blade, and enough strength... to shatter fate.",
      character: "Ichigo Kurosaki"
    },
    {
      quote: "We fear that which we cannot see.",
      character: "Tōsen Kaname"
    },
    {
      quote: "Laws exist only for those who cannot live without clinging to them.",
      character: "Aizen Sōsuke"
    },
    {
      quote: "The difference in strength... What you seek... is there.",
      character: "Kenpachi Zaraki"
    },
    {
      quote: "I'm not Superman, so I can't say anything big like 'I'll protect everyone on Earth!' I'm not a modest guy who will say 'It's enough if I can protect as many people as my two hands can handle' either. I want to protect... a mountain-load of people.",
      character: "Ichigo Kurosaki"
    },
    {
      quote: "We should not shed tears. That is the defeat of the body by the heart. It is proof that we are beings that cannot even control our own bodies.",
      character: "Byakuya Kuchiki"
    },
    {
      quote: "In this world, perfection is an illusion. No matter how hard you work, there will always be a flaw. The true measure of a person is not in their perfection, but in how they handle their imperfections.",
      character: "Urahara Kisuke"
    },
    {
      quote: "The moment you think of giving up, think of the reason why you held on so long.",
      character: "Hitsugaya Tōshirō"
    },
    {
      quote: "I'm not gonna run away, I never go back on my word! That's my nindō: my ninja way!",
      character: "Wait, wrong anime..."
    },
    {
      quote: "The moment you say you can't, you admit defeat. The moment you say you'll try, you're already halfway there.",
      character: "Yoruichi Shihōin"
    },
    {
      quote: "People's lives don't end when they die, it ends when they lose faith.",
      character: "Itachi... I mean, Aizen Sōsuke"
    },
    {
      quote: "We stand in awe before that which cannot be seen... and we respect, with every fiber, that which cannot be explained.",
      character: "Aizen Sōsuke"
    },
    {
      quote: "A warrior does not beg for his life.",
      character: "Ikkaku Madarame"
    },
    {
      quote: "If I don't wield the sword, I can't protect you. If I keep wielding the sword, I can't embrace you.",
      character: "Ichigo Kurosaki"
    },
    {
      quote: "That's just the way it is. Change is inevitable. Instead of resisting it, you're better served simply going with the flow.",
      character: "Aizen Sōsuke"
    },
    {
      quote: "Admiration is the furthest thing from understanding.",
      character: "Aizen Sōsuke"
    },
    {
      quote: "The betrayal you can see is trivial. What is truly frightening is the betrayal you don't see.",
      character: "Aizen Sōsuke"
    },
    {
      quote: "In the world of the living, there is no such thing as a coincidence. There is only necessity.",
      character: "Rukia Kuchiki"
    },
    {
      quote: "Don't use such strong words. It makes you look weak.",
      character: "Aizen Sōsuke"
    },
    {
      quote: "Every time you are able to find some humor in a difficult situation, you win.",
      character: "Urahara Kisuke"
    },
    {
      quote: "Remember that a sword held by someone who is about to die will never be able to protect anything.",
      character: "Zangetsu"
    },
    {
      quote: "Battle is not a matter of technique alone. It is a contest of wills.",
      character: "Kenpachi Zaraki"
    },
    {
      quote: "The tower of purification exists to help us purge impure thoughts from our hearts.",
      character: "Byakuya Kuchiki"
    },
    {
      quote: "Sanity? Sorry, I don't remember having such a useless thing in the first place.",
      character: "Kenpachi Zaraki"
    },
    {
      quote: "In battle, there is no such thing as chance. If you can't see an opening, you create one.",
      character: "Urahara Kisuke"
    },
    {
      quote: "I refuse to let my fear control me anymore.",
      character: "Orihime Inoue"
    },
    {
      quote: "The world isn't perfect. But it's there for us, trying the best it can. That's what makes it so damn beautiful.",
      character: "Roy Mustang... wait, that's Fullmetal Alchemist. Dammit."
    },
    {
      quote: "Those who do not know pain cannot possibly understand true peace.",
      character: "Pain from... oh come on, that's Naruto again!"
    },
    {
      quote: "Even if no one believes in you, stick out your best and scream your finest. That is the TRUE nature of the Soul Reaper.",
      character: "Renji Abarai"
    },
    {
      quote: "Revenge is just the path you took to escape your suffering.",
      character: "Rukia Kuchiki"
    },
    {
      quote: "A warrior who has forgotten fear has also forgotten his pride.",
      character: "Byakuya Kuchiki"
    },
    {
      quote: "We are all like fireworks. We climb, shine, and always go our separate ways and become further apart. But even if that time comes, let's not disappear like a firework and continue to shine forever.",
      character: "Hitsugaya Tōshirō"
    },
    {
      quote: "Big brothers... you know why they're born first? To protect the little ones that come after them!",
      character: "Shiba Kaien"
    },
    {
      quote: "In a battle, the ones who get in the way are not the ones that lack power. They are the ones that lack resolve.",
      character: "Aizen Sōsuke"
    },
    {
      quote: "Fear is not evil. It tells you what your weakness is. And once you know your weakness, you can become stronger as well as kinder.",
      character: "Gildarts Clive... DAMMIT THAT'S FAIRY TAIL!"
    },
    {
      quote: "If you're going to think like that, you might as well just give up. That's the same as admitting defeat before the fight even begins.",
      character: "Renji Abarai"
    },
    {
      quote: "Those who do not fear the sword they wield have no right to wield a sword at all.",
      character: "Shiba Kaien"
    },
    {
      quote: "Live a good long life. Grow old and die after me. And if you can remember me, then I can live forever.",
      character: "Hitsugaya Tōshirō"
    },
    {
      quote: "No matter what you do, what you try to achieve, there will always be someone who stands in your way. People exist to get in each other's way.",
      character: "Aizen Sōsuke"
    },
    {
      quote: "A conclusion reached without consideration for another perspective is merely self-indulgent.",
      character: "Byakuya Kuchiki"
    }
  ];

  const activateBankai = () => {
    setBankaiActivated(true);
    setTimeout(() => setBankaiActivated(false), 3000);
  };

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * bleachQuotes.length);
    setCurrentQuote(bleachQuotes[randomIndex]);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Swords className="text-gray-700" size={48} />
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600">
            BLEACH
          </h1>
          <Swords className="text-gray-700" size={48} />
        </div>
        <p className="text-xl text-gray-600 italic">
          "The difference in strength... What you seek... is there." - Kenpachi Zaraki
        </p>
      </div>

      {/* Bankai Activation Section */}
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black border-2 border-gray-700 rounded-lg p-8 mb-6 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r from-red-900 via-orange-900 to-yellow-900 opacity-0 transition-opacity duration-1000 ${bankaiActivated ? 'opacity-30' : ''}`}></div>
        
        <div className="relative z-10 text-center">
          <h2 className="text-2xl font-bold text-gray-300 mb-6">Spiritual Pressure Release</h2>
          <button
            onClick={activateBankai}
            disabled={bankaiActivated}
            className={`px-12 py-5 rounded-lg font-bold text-2xl transition-all transform hover:scale-105 active:scale-95 ${
              bankaiActivated
                ? 'bg-gradient-to-r from-red-700 via-orange-600 to-yellow-600 text-white shadow-2xl animate-pulse'
                : 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-100 shadow-lg hover:shadow-xl hover:from-gray-600 hover:to-gray-700'
            }`}
          >
            {bankaiActivated ? (
              <span className="flex items-center gap-3">
                <Zap size={28} />
                卍解！BANKAI!!!
                <Zap size={28} />
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <Swords size={24} />
                ACTIVATE BANKAI
                <Swords size={24} />
              </span>
            )}
          </button>
          {bankaiActivated && (
            <p className="mt-4 text-red-500 font-bold text-xl animate-bounce">
              SPIRITUAL PRESSURE INTENSIFIES
            </p>
          )}
        </div>
      </div>

      {/* Random Quote Generator */}
      <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-8 mb-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-200 mb-6 text-center">Random Quote Generator</h2>
        
        <div className="text-center mb-6">
          <button
            onClick={getRandomQuote}
            className="px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-gray-100 rounded-lg font-semibold text-lg hover:shadow-xl hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
          >
            <RefreshCw size={24} />
            Get Random Quote
          </button>
        </div>

        {currentQuote && (
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 border-l-4 border-gray-500 rounded-lg p-6 animate-fadeIn">
            <blockquote className="text-lg text-gray-200 italic mb-3">
              "{currentQuote.quote}"
            </blockquote>
            <p className="text-right text-gray-400 font-semibold">
              — {currentQuote.character}
            </p>
          </div>
        )}

        {!currentQuote && (
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg">Click the button above to get a random Bleach quote</p>
          </div>
        )}
      </div>

      {/* Soul Reaper Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-6">
          <h3 className="font-bold text-gray-200 mb-4 flex items-center gap-2 text-xl">
            <Flame size={24} className="text-red-600" />
            Your Soul Reaper Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Spiritual Pressure:</span>
              <span className="font-bold text-red-500">9,999 / 10,000</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-red-700 to-red-600 h-2 rounded-full" style={{ width: '99.9%' }}></div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-300">Zanpakutō Mastery:</span>
              <span className="font-bold text-orange-500">Captain Level</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-orange-700 to-orange-600 h-2 rounded-full" style={{ width: '95%' }}></div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-300">Flash Step (Shunpo):</span>
              <span className="font-bold text-purple-500">Maxed</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-700 to-purple-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-300">Kido Mastery:</span>
              <span className="font-bold text-blue-500">Hadō #90 Ready</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-700 to-blue-600 h-2 rounded-full" style={{ width: '88%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-6">
          <h3 className="font-bold text-gray-200 mb-4 flex items-center gap-2 text-xl">
            <Sparkles size={24} className="text-yellow-600" />
            Division Assignment
          </h3>
          <div className="space-y-3 text-lg">
            <div className="flex justify-between">
              <span className="text-gray-300">Squad:</span>
              <span className="font-bold text-gray-100">11th Division</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Captain:</span>
              <span className="font-bold text-red-500">Kenpachi Zaraki</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Lieutenant:</span>
              <span className="font-bold text-pink-500">Yachiru Kusajishi</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Combat Style:</span>
              <span className="font-bold text-orange-500">Aggressive</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Battle Record:</span>
              <span className="font-bold text-green-500">Undefeated</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Hollows Slain:</span>
              <span className="font-bold text-red-500">999+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-6 mb-6">
        <h3 className="font-bold text-gray-200 mb-4 text-xl text-center">Soul Reaper Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 text-center border-2 border-gray-600 hover:scale-105 hover:border-red-700 transition-all">
            <div className="text-sm font-semibold text-gray-200">Zanpakutō Awakened</div>
          </div>
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 text-center border-2 border-gray-600 hover:scale-105 hover:border-orange-700 transition-all">
            <div className="text-sm font-semibold text-gray-200">Bankai Master</div>
          </div>
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 text-center border-2 border-gray-600 hover:scale-105 hover:border-purple-700 transition-all">
            <div className="text-sm font-semibold text-gray-200">Hollow Slayer</div>
          </div>
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 text-center border-2 border-gray-600 hover:scale-105 hover:border-blue-700 transition-all">
            <div className="text-sm font-semibold text-gray-200">Kido Expert</div>
          </div>
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 text-center border-2 border-gray-600 hover:scale-105 hover:border-green-700 transition-all">
            <div className="text-sm font-semibold text-gray-200">Shunpo Speedster</div>
          </div>
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 text-center border-2 border-gray-600 hover:scale-105 hover:border-yellow-700 transition-all">
            <div className="text-sm font-semibold text-gray-200">Captain Rank</div>
          </div>
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 text-center border-2 border-gray-600 hover:scale-105 hover:border-pink-700 transition-all">
            <div className="text-sm font-semibold text-gray-200">Spiritual Pressure MAX</div>
          </div>
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 text-center border-2 border-gray-600 hover:scale-105 hover:border-red-600 transition-all">
            <div className="text-sm font-semibold text-gray-200">Legendary Warrior</div>
          </div>
        </div>
      </div>

      {/* Footer Message */}
      <div className="text-center p-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg border-2 border-gray-700">
        <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 text-2xl mb-3">
          Always Remember
        </p>
        <p className="text-gray-200 font-semibold text-lg mb-2">
          When in doubt, randomly scream
          <span className="text-3xl font-bold text-red-500 mx-2">
            "卍解！BANKAI!!!"
          </span>
        </p>
        <p className="text-sm text-gray-400 italic">
          Side effects may include: looking awesome, spiritual pressure overload, and destroying everything in a 10-mile radius
        </p>
      </div>
    </div>
  );
};

export default Bleach;
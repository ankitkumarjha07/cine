import React, { useMemo } from 'react';
import { Quote } from 'lucide-react';

const IMAGE_POOL = [
'https://images.unsplash.com/photo-1478720568477-152d9b164e26',
'https://images.unsplash.com/photo-1485846234645-a62644f84728',
'https://images.unsplash.com/photo-1440404653325-ab127d49abc1',
'https://images.unsplash.com/photo-1536440136628-849c177e76a1',
'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330',
'https://images.unsplash.com/photo-1493135637657-c2411b3497ad',
'https://images.unsplash.com/photo-1509248961158-e54f6934749c',
'https://images.unsplash.com/photo-1512070679279-8988d32161be'
];

const QUOTE_POOL = [
// Hindi
{ text: "बाबूमोशाय, ज़िंदगी बड़ी होनी चाहिए, लंबी नहीं.", movie: "Anand" },
{ text: "कभी कभी जीतने के लिए कुछ हारना पड़ता है.", movie: "Baazigar" },
{ text: "All is well.", movie: "3 Idiots" },
{ text: "डर के आगे जीत है.", movie: "Darr (inspired)" },
{ text: "Picture abhi baaki hai mere dost.", movie: "Om Shanti Om" },

// English classics
{ text: "Hope is a good thing, maybe the best of things.", movie: "Shawshank Redemption" },
{ text: "Carpe diem. Seize the day.", movie: "Dead Poets Society" },
{ text: "Why so serious?", movie: "The Dark Knight" },
{ text: "May the Force be with you.", movie: "Star Wars" },
{ text: "Great men are not born great, they grow great.", movie: "The Godfather" },
{ text: "It's only after we've lost everything that we're free.", movie: "Fight Club" },
{ text: "You talking to me?", movie: "Taxi Driver" },
{ text: "I’ll be back.", movie: "Terminator" },

// Emotional / modern tone
{ text: "Our lives are defined by opportunities, even the ones we miss.", movie: "Benjamin Button" },
{ text: "Some infinities are bigger than other infinities.", movie: "The Fault in Our Stars" },
{ text: "You can’t change your past, but you can learn from it.", movie: "Lion King (spirit)" },
{ text: "We accept the love we think we deserve.", movie: "Perks of Being a Wallflower" },
{ text: "Stories are how we make sense of the world.", movie: "Cinema Thought" },
// 🔥 Additional Quotes

// Hindi
{ text: "रिश्ते में तो हम तुम्हारे बाप लगते हैं.", movie: "Shahenshah" },
{ text: "डॉन को पकड़ना मुश्किल ही नहीं, नामुमकिन है.", movie: "Don" },
{ text: "मोगैम्बो खुश हुआ.", movie: "Mr. India" },
{ text: "तेजा मैं हूँ, मार्क इधर है.", movie: "Andaz Apna Apna" },
{ text: "कुछ कुछ होता है, तुम नहीं समझोगे.", movie: "Kuch Kuch Hota Hai" },
{ text: "पिक्चर अभी बाकी है मेरे दोस्त.", movie: "Om Shanti Om" },
{ text: "बड़े बड़े देशों में ऐसी छोटी छोटी बातें होती रहती हैं.", movie: "DDLJ" },
{ text: "मेरे पास माँ है.", movie: "Deewaar" },
{ text: "ये हाथ मुझे दे दे ठाकुर.", movie: "Sholay" },
{ text: "कितने आदमी थे?", movie: "Sholay" },
{ text: "जिंदगी जीने के दो ही तरीके होते हैं.", movie: "Dear Zindagi" },
{ text: "किसी चीज़ को दिल से चाहो...", movie: "Om Shanti Om" },
{ text: "दिल तो बच्चा है जी.", movie: "Ishqiya" },
{ text: "जिंदगी ना मिलेगी दोबारा.", movie: "ZNMD" },
{ text: "काबिल बनो, कामयाबी झक मार के पीछे आएगी.", movie: "3 Idiots" },
{ text: "मैं अपनी फेवरेट हूँ.", movie: "Jab We Met" },
{ text: "इतनी शिद्दत से मैंने तुम्हें पाने की कोशिश की है.", movie: "Om Shanti Om" },
{ text: "डर सबको लगता है.", movie: "Gully Boy" },
{ text: "अपना टाइम आएगा.", movie: "Gully Boy" },
{ text: "वक्त किसी के लिए नहीं रुकता.", movie: "Waqt" },
{ text: "जिंदगी बड़ी होनी चाहिए.", movie: "Anand" },
{ text: "कभी अलविदा ना कहना.", movie: "KANK" },
{ text: "नाम तो सुना होगा.", movie: "Dil To Pagal Hai" },
{ text: "एक बार जो मैंने कमिटमेंट कर दी...", movie: "Wanted" },
{ text: "हीरो बनने के लिए...", movie: "Raees" },

// English
{ text: "Here's looking at you, kid.", movie: "Casablanca" },
{ text: "To infinity and beyond!", movie: "Toy Story" },
{ text: "You can’t handle the truth!", movie: "A Few Good Men" },
{ text: "Life is like a box of chocolates.", movie: "Forrest Gump" },
{ text: "Say hello to my little friend!", movie: "Scarface" },
{ text: "I am your father.", movie: "Star Wars" },
{ text: "Just keep swimming.", movie: "Finding Nemo" },
{ text: "Why do we fall?", movie: "Batman Begins" },
{ text: "With great power comes great responsibility.", movie: "Spider-Man" },
{ text: "I see dead people.", movie: "The Sixth Sense" },
{ text: "This is Sparta!", movie: "300" },
{ text: "Wakanda forever!", movie: "Black Panther" },
{ text: "You either die a hero...", movie: "The Dark Knight" },
{ text: "Love means never having to say you're sorry.", movie: "Love Story" },
{ text: "Keep your friends close, but your enemies closer.", movie: "The Godfather II" },
{ text: "Nobody puts Baby in a corner.", movie: "Dirty Dancing" },
{ text: "I'm the king of the world!", movie: "Titanic" },
{ text: "We’re gonna need a bigger boat.", movie: "Jaws" },
{ text: "After all, tomorrow is another day.", movie: "Gone with the Wind" },
{ text: "I feel the need... the need for speed.", movie: "Top Gun" },
{ text: "The greatest trick the devil ever pulled...", movie: "Usual Suspects" },
{ text: "Get busy living or get busy dying.", movie: "Shawshank Redemption" },
{ text: "Do, or do not. There is no try.", movie: "Star Wars" },
{ text: "You had me at hello.", movie: "Jerry Maguire" },
{ text: "I wish I knew how to quit you.", movie: "Brokeback Mountain" }
];

const IconicQuoteOverlay = () => {

// 🔥 Instant randomization (no re-renders)
const { bg, quote } = useMemo(() => {
const bg = IMAGE_POOL[Math.floor(Math.random() * IMAGE_POOL.length)];
const quote = QUOTE_POOL[Math.floor(Math.random() * QUOTE_POOL.length)];
return { bg, quote };
}, []);

return ( <div className="
   relative w-full aspect-[21/10] min-h-[320px]
   rounded-[2.5rem] overflow-hidden
   bg-[#121217]
   border border-white/5
   shadow-2xl
   group
 ">


  {/* 🎬 Background */}
  <img
    src={`${bg}?q=80&w=1200&auto=format&fit=crop`}
    className="
      absolute inset-0 w-full h-full object-cover
      opacity-30 grayscale-[30%]
      group-hover:scale-105
      transition-transform duration-[4000ms] ease-out
    "
    alt="Cinema Background"
  />

  {/* 🎨 Cinematic Overlays */}
  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />

  {/* 🎬 Content */}
  <div className="relative h-full flex flex-col justify-center px-8 md:px-14">

    <div className="space-y-5">

      {/* Icon */}
      <Quote size={26} className="text-yellow-400/40" />

      {/* Quote */}
      <div className="max-w-[90%]">

        <p className="
          text-xl md:text-3xl
          font-medium
          text-white/90
          leading-[1.2]
          tracking-tight
        ">
          {quote.text}
        </p>

        {/* Movie */}
        <div className="flex items-center gap-3 mt-6">
          <div className="h-px w-8 bg-yellow-400/30" />
          <p className="
            text-[10px] md:text-xs
            uppercase tracking-[0.3em]
            text-yellow-400/60
            italic
          ">
            {quote.movie}
          </p>
        </div>

      </div>

    </div>

  </div>
</div>


);
};

export default IconicQuoteOverlay;

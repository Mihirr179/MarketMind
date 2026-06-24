import Link from "next/link";
import {
  TrendingUp,
  Shield,
  Newspaper,
  Briefcase,
  Users,
  PieChart,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-yellow-500/10 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-500/10 blur-[150px] rounded-full"></div>

      {/* Navbar */}
      <nav className="flex justify-between items-center px-12 py-6 border-b border-zinc-800">
        <h1 className="text-4xl font-bold">
          <span className="text-white">Market</span>
          <span className="text-yellow-400">Mind</span>
        </h1>

        <div className="flex gap-8 items-center">
  <Link href="/news" className="hover:text-yellow-400">
    News
  </Link>

  <Link href="/search" className="hover:text-yellow-400">
    Markets
  </Link>

  <Link href="/watchlist" className="hover:text-yellow-400">
    Watchlist
  </Link>

  <Link href="/ai" className="hover:text-yellow-400">
    AI Research
  </Link>

  <Link
    href="/login"
    className="border border-yellow-400 px-5 py-2 rounded-xl"
  >
    Login
  </Link>

  <Link
    href="/signup"
    className="bg-yellow-400 text-black px-5 py-2 rounded-xl font-bold"
  >
    Sign Up
  </Link>
</div>
      </nav>

      {/* Ticker */}
      <div className="border-b border-zinc-800 py-3 text-center text-yellow-400">
        AAPL +2.3% • TSLA +1.8% • NVDA +4.1% • MSFT +1.2%
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-10 py-24 grid lg:grid-cols-2 gap-20 items-center">

        <div>
          <h1 className="text-7xl lg:text-8xl font-bold leading-tight">
            Smarter
            <br />
            Insights.
            <br />
            Stronger{" "}
            <span className="text-yellow-400">
              Investments.
            </span>
          </h1>

          <p className="text-zinc-400 text-xl mt-8 max-w-xl">
MarketMind is your AI-powered stock analysis platform
            that helps you track markets, analyze trends, and build
            a winning portfolio.
          </p>

          <div className="flex gap-5 mt-10">
            <Link
              href="/signup"
              className="bg-yellow-400 text-black px-8 py-4 rounded-2xl font-bold"
            >
              Get Started →
            </Link>

            <Link
              href="/search"
              className="border border-yellow-400 text-yellow-400 px-8 py-4 rounded-2xl font-bold"
            >
              Explore Markets
            </Link>
          </div>

          <p className="text-zinc-500 mt-8">
            ✓ Secure &nbsp; ✓ Fast &nbsp; ✓ Reliable
          </p>
        </div>

        {/* Dashboard */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-yellow-500/20 rounded-3xl p-8 shadow-2xl">

          <h2 className="text-3xl font-bold mb-8">
            Market Overview
          </h2>

          <div className="grid grid-cols-2 gap-4">

            <div className="bg-zinc-800 p-5 rounded-2xl">
              <p className="text-zinc-400">Portfolio Value</p>
              <h3 className="text-4xl font-bold text-green-400 mt-2">
                $24,580
              </h3>
            </div>

            <div className="bg-zinc-800 p-5 rounded-2xl">
              <p className="text-zinc-400">Today&apos;s Gain</p>
              <h3 className="text-4xl font-bold text-green-400 mt-2">
                +$1,245
              </h3>
            </div>

            <div className="bg-zinc-800 p-5 rounded-2xl">
              <p className="text-zinc-400">Watchlist</p>
              <h3 className="text-4xl font-bold text-yellow-400 mt-2">
                12
              </h3>
            </div>

            <div className="bg-zinc-800 p-5 rounded-2xl">
              <p className="text-zinc-400">Accuracy</p>
              <h3 className="text-4xl font-bold text-green-400 mt-2">
                98%
              </h3>
            </div>

          </div>

          {/* Chart Mockup */}
          <div className="mt-8 h-56 bg-zinc-800 rounded-3xl flex items-end gap-3 p-6">
            <div className="bg-yellow-400 h-16 w-6 rounded"></div>
            <div className="bg-yellow-400 h-28 w-6 rounded"></div>
            <div className="bg-yellow-400 h-20 w-6 rounded"></div>
            <div className="bg-yellow-400 h-40 w-6 rounded"></div>
            <div className="bg-yellow-400 h-24 w-6 rounded"></div>
            <div className="bg-yellow-400 h-48 w-6 rounded"></div>
            <div className="bg-yellow-400 h-36 w-6 rounded"></div>
          </div>

        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-10 pb-16">
        <div className="grid md:grid-cols-4 gap-6">

          <div className="bg-zinc-900/80 backdrop-blur-xl p-6 rounded-2xl">
            <Users className="text-yellow-400 mb-3" />
            <h2 className="text-4xl font-bold">10K+</h2>
            <p className="text-zinc-400">Active Users</p>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-xl p-6 rounded-2xl">
            <TrendingUp className="text-yellow-400 mb-3" />
            <h2 className="text-4xl font-bold">50K+</h2>
            <p className="text-zinc-400">Stocks Analyzed</p>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-xl p-6 rounded-2xl">
            <PieChart className="text-yellow-400 mb-3" />
            <h2 className="text-4xl font-bold">98%</h2>
            <p className="text-zinc-400">Prediction Accuracy</p>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-xl p-6 rounded-2xl">
            <Shield className="text-yellow-400 mb-3" />
            <h2 className="text-4xl font-bold">100%</h2>
            <p className="text-zinc-400">Secure</p>
          </div>

        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-10 pb-24">
        <div className="grid md:grid-cols-4 gap-6">

          <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800 hover:border-yellow-400 hover:-translate-y-2 transition-all duration-300">
            <TrendingUp className="text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">
              Real-Time Market Data
            </h3>
            <p className="text-zinc-400">
              Live stock prices and updates.
            </p>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800 hover:border-yellow-400 hover:-translate-y-2 transition-all duration-300">
            <PieChart className="text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">
              AI Analysis
            </h3>
            <p className="text-zinc-400">
              Smart stock recommendations.
            </p>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800 hover:border-yellow-400 hover:-translate-y-2 transition-all duration-300">
            <Briefcase className="text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">
              Portfolio Tracking
            </h3>
            <p className="text-zinc-400">
              Monitor investments.
            </p>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800 hover:border-yellow-400 hover:-translate-y-2 transition-all duration-300">
            <Newspaper className="text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">
              Financial News
            </h3>
            <p className="text-zinc-400">
              Stay updated with market trends.
            </p>
          </div>

        </div>
      </section>
{/* Trusted By */}
<section className="max-w-7xl mx-auto px-10 pb-24 text-center">
  <p className="text-zinc-500 uppercase tracking-widest">
    Trusted By Investors Worldwide
  </p>

  <div className="flex flex-wrap justify-center gap-12 mt-10 text-3xl font-bold text-zinc-400">
    <span>NASDAQ</span>
    <span>Bloomberg</span>
    <span>Yahoo Finance</span>
    <span>CNBC</span>
  </div>
</section>

{/* Why Choose Us */}
<section className="max-w-7xl mx-auto px-10 pb-24">
  <h2 className="text-5xl font-bold text-center mb-16">
    Why Choose
    <span className="text-yellow-400"> MarketMind?</span>
  </h2>

  <div className="grid md:grid-cols-3 gap-8">
    <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800">
      <h3 className="text-2xl font-bold text-yellow-400">
        AI Predictions
      </h3>
      <p className="text-zinc-400 mt-4">
        Smart AI-powered buy and sell recommendations.
      </p>
    </div>

    <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800">
      <h3 className="text-2xl font-bold text-yellow-400">
        Live Market Data
      </h3>
      <p className="text-zinc-400 mt-4">
        Real-time stock prices and market movements.
      </p>
    </div>

    <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800">
      <h3 className="text-2xl font-bold text-yellow-400">
        Portfolio Tracking
      </h3>
      <p className="text-zinc-400 mt-4">
        Track investments, profits, and performance.
      </p>
    </div>
  </div>
</section>

{/* Testimonials */}
<section className="max-w-7xl mx-auto px-10 pb-24">
  <h2 className="text-5xl font-bold text-center mb-16">
    What Investors Say
  </h2>

  <div className="grid md:grid-cols-3 gap-8">
    <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800">
      <div className="text-yellow-400 text-xl">
        ★★★★★
      </div>

      <p className="mt-4 text-zinc-400">
        MarketMind helped me discover growth stocks
        before major rallies.
      </p>

      <h4 className="mt-4 font-bold">
        Rahul S.
      </h4>
    </div>

    <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800">
      <div className="text-yellow-400 text-xl">
        ★★★★★
      </div>

      <p className="mt-4 text-zinc-400">
        The AI recommendations are surprisingly
        accurate and easy to understand.
      </p>

      <h4 className="mt-4 font-bold">
        Priya M.
      </h4>
    </div>

    <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800">
      <div className="text-yellow-400 text-xl">
        ★★★★★
      </div>

      <p className="mt-4 text-zinc-400">
        One of the best stock analysis tools I have
        used.
      </p>

      <h4 className="mt-4 font-bold">
        Karan P.
      </h4>
    </div>
  </div>
</section>
{/* Call To Action */}
<section className="max-w-5xl mx-auto px-10 pb-24">
  <div className="bg-gradient-to-r from-yellow-500 to-yellow-300 text-black rounded-3xl p-12 text-center shadow-2xl">
    <h2 className="text-5xl font-bold">
      Ready to Invest Smarter?
    </h2>

    <p className="mt-4 text-lg">
      Join thousands of investors using MarketMind
      to analyze stocks and build stronger portfolios.
    </p>

    <Link
      href="/signup"
      className="inline-block mt-8 bg-black text-yellow-400 px-8 py-4 rounded-xl font-bold hover:bg-zinc-900/80 backdrop-blur-xl transition"
    >
      Get Started Today →
    </Link>
  </div>
</section>
{/* Footer */}
<footer className="border-t border-zinc-800 py-10 text-center">
  <h3 className="text-3xl font-bold text-yellow-400">
    MarketMind
  </h3>

  <div className="flex justify-center gap-8 mt-6 text-zinc-400">
    <Link href="/search" className="hover:text-yellow-400">
      Markets
    </Link>

    <Link href="/news" className="hover:text-yellow-400">
      News
    </Link>

    <Link href="/watchlist" className="hover:text-yellow-400">
      Watchlist
    </Link>

    <Link href="/portfolio" className="hover:text-yellow-400">
      Portfolio
    </Link>
  </div>

  <p className="text-zinc-600 mt-6">
    © 2026 MarketMind. All Rights Reserved.
  </p>
</footer>
    </main>
  );
}
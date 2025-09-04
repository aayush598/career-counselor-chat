import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-50 font-sans">
      {/* Hero Section */}
      <header className="relative w-full py-20 md:py-32 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url('/background-pattern.svg')" }}
        ></div>
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            Career Counselor AI: Unlock Your True Career Potential
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto mb-8 font-light">
            Get personalized, data-driven career advice tailored to your unique skills, interests,
            and aspirations. Your future starts here.
          </p>
          <Link href="/chat" legacyBehavior>
            <a className="inline-block px-8 py-4 text-lg font-semibold bg-white text-blue-600 rounded-full shadow-lg transform transition-transform duration-300 hover:scale-105 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50">
              Start Your Free Career Session
            </a>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-24 max-w-7xl">
        {/* How It Works Section */}
        <section className="mb-16 md:mb-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">How It Works in 3 Simple Steps</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-6 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="w-16 h-16 flex items-center justify-center bg-blue-500 text-white rounded-full mb-4 text-3xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Share Your Story</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tell our AI about your education, skills, and interests in a simple conversation.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="w-16 h-16 flex items-center justify-center bg-blue-500 text-white rounded-full mb-4 text-3xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Get Personalized Insights</h3>
              <p className="text-gray-600 dark:text-gray-400">
                The AI analyzes your profile against real-time job market data and industry trends.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="w-16 h-16 flex items-center justify-center bg-blue-500 text-white rounded-full mb-4 text-3xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Discover Your Path</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Receive tailored recommendations, skill-building resources, and actionable next
                steps.
              </p>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center p-6 text-center bg-gray-100 dark:bg-gray-800 rounded-xl shadow-sm">
              <Image
                src="/icons/career-path.svg"
                alt="Career Path Icon"
                width={64}
                height={64}
                className="mb-4"
              />
              <h4 className="text-xl font-bold mb-2">Dynamic Career Paths</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Recommendations that adapt to market trends and your evolving goals.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 text-center bg-gray-100 dark:bg-gray-800 rounded-xl shadow-sm">
              <Image
                src="/icons/skill-gap.svg"
                alt="Skill Gap Icon"
                width={64}
                height={64}
                className="mb-4"
              />
              <h4 className="text-xl font-bold mb-2">Skill Gap Analysis</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Identify the skills you need to learn to land your dream job.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 text-center bg-gray-100 dark:bg-gray-800 rounded-xl shadow-sm">
              <Image
                src="/icons/resume-prep.svg"
                alt="Resume Prep Icon"
                width={64}
                height={64}
                className="mb-4"
              />
              <h4 className="text-xl font-bold mb-2">Resume & Interview Prep</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Get instant feedback on your resume and practice for interviews.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 text-center bg-gray-100 dark:bg-gray-800 rounded-xl shadow-sm">
              <Image
                src="/icons/industry-insights.svg"
                alt="Industry Insights Icon"
                width={64}
                height={64}
                className="mb-4"
              />
              <h4 className="text-xl font-bold mb-2">Industry Insights</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Explore salary expectations, job growth, and required skills for any field.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            What Our Users Are Saying
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-blue-50 dark:bg-blue-950 rounded-lg shadow-md">
              <p className="italic text-gray-700 dark:text-gray-300">
                &#34;Career Counselor AI gave me the clarity I needed. It helped me pivot my career
                and find a path I&#39;m truly passionate about. The advice was spot-on and
                incredibly helpful.&#34;
              </p>
              <p className="mt-4 font-bold text-blue-600">- Alex, Career Changer</p>
            </div>
            <div className="p-6 bg-blue-50 dark:bg-blue-950 rounded-lg shadow-md">
              <p className="italic text-gray-700 dark:text-gray-300">
                &#34;As a recent graduate, I was lost. This chatbot not only recommended jobs but
                also taught me what skills I needed to stand out. It&#39;s like having a personal
                mentor 24/7.&#34;
              </p>
              <p className="mt-4 font-bold text-blue-600">- Sarah, Recent Graduate</p>
            </div>
            <div className="p-6 bg-blue-50 dark:bg-blue-950 rounded-lg shadow-md">
              <p className="italic text-gray-700 dark:text-gray-300">
                &#34;I&#39;ve been in my field for years, but wanted a change. The AI helped me see
                how my existing skills could transfer to new industries I hadn&#39;t even
                considered. A game-changer!&#34;
              </p>
              <p className="mt-4 font-bold text-blue-600">- Michael, Senior Engineer</p>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="text-center bg-blue-600 text-white py-16 rounded-xl shadow-lg">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Career?</h2>
          <p className="text-lg mb-8">
            Stop guessing. Start planning. Your personalized career path is just a click away.
          </p>
          <Link href="/chat" legacyBehavior>
            <a className="inline-block px-8 py-4 text-lg font-semibold bg-white text-blue-600 rounded-full shadow-lg transform transition-transform duration-300 hover:scale-105 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50">
              Chat with Career Counselor AI Now
            </a>
          </Link>
        </section>
      </main>

      <footer className="w-full text-center py-8 text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} Career Counselor AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

import React from "react";

export const metadata = {
  title: "About Us - Dream Generator",
  description: "Learn about Dream Generator and what it offers.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-20 pb-16">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-4">
            About Dream Generator
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Transform your creative vision into stunning visuals with the power of AI
          </p>
        </div>

        <div className="grid gap-8">
          <section className="glass-card p-8 animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-2xl shadow-lg">
                ✨
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">What We Offer</h2>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                  Dream Generator provides a simple, fast interface to transform your prompts and images
                  into AI-generated visuals using Google's powerful Gemini API. Our goal is to provide a
                  frictionless way to ideate and visualize concepts directly in your browser.
                </p>
                <ul className="grid gap-3">
                  <li className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">✓</span>
                    <span>Generate images from descriptive text prompts</span>
                  </li>
                  <li className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">✓</span>
                    <span>Upload reference images to influence style and variations</span>
                  </li>
                  <li className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">✓</span>
                    <span>Preview results in real time and download them instantly</span>
                  </li>
                  <li className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">✓</span>
                    <span>Access curated prompt library for inspiration</span>
                  </li>
                  <li className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">✓</span>
                    <span>Chat with AI assistant for prompt refinement</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="glass-card p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white text-2xl shadow-lg">
                🎯
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">Our Focus</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-primary-50 dark:bg-primary-950/30 rounded-lg border border-primary-100 dark:border-primary-900">
                    <h3 className="font-semibold text-primary-700 dark:text-primary-400 mb-2">⚡ Speed</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Minimize time-to-first-image with optimized processing and intuitive workflows
                    </p>
                  </div>
                  <div className="p-4 bg-accent-50 dark:bg-accent-950/30 rounded-lg border border-accent-100 dark:border-accent-900">
                    <h3 className="font-semibold text-accent-700 dark:text-accent-400 mb-2">🎨 Clarity</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Explicit validation and error messages keep you informed every step of the way
                    </p>
                  </div>
                  <div className="p-4 bg-primary-50 dark:bg-primary-950/30 rounded-lg border border-primary-100 dark:border-primary-900">
                    <h3 className="font-semibold text-primary-700 dark:text-primary-400 mb-2">♿ Accessibility</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Keyboard-friendly navigation and proper labels for inclusive design
                    </p>
                  </div>
                  <div className="p-4 bg-accent-50 dark:bg-accent-950/30 rounded-lg border border-accent-100 dark:border-accent-900">
                    <h3 className="font-semibold text-accent-700 dark:text-accent-400 mb-2">🛡️ Reliability</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Graceful handling of failures and timeouts ensures consistent experience
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card p-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Ready to Create?</h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Start transforming your ideas into stunning visuals today
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 shadow-lg shadow-primary-500/30 transition-all duration-300 transform hover:scale-105"
              >
                Get Started
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

import React from "react";

export const metadata = {
  title: "About Us - Dream Generator",
  description: "Learn about Dream Generator and what it offers.",
};

export default function AboutPage() {
  return (
    <main className="min-h-[60vh]">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">About Us</h1>
        <p className="mt-3 text-neutral-700 dark:text-neutral-300">
          Dream Generator is a simple, fast interface to transform your prompts and images
          into AI-generated visuals using Google&#39;s Gemini API. Our goal is to provide a
          frictionless way to ideate and visualize concepts in the browser.
        </p>

        <div className="mt-8 grid gap-6">
          <section>
            <h2 className="text-xl font-medium">What you can do</h2>
            <ul className="mt-2 list-disc pl-5 text-neutral-700 dark:text-neutral-300 space-y-1">
              <li>Generate images from text prompts.</li>
              <li>Upload reference images to influence style and variations.</li>
              <li>Preview results in real time and download them.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium">Our focus</h2>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              Speed, clarity, accessibility, and reliability. We aim to reduce time-to-first-image,
              provide explicit validation and error messages, ensure keyboard-friendly navigation,
              and handle failures gracefully.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

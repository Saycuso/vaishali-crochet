import React from "react";
import { Helmet } from "react-helmet-async";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Vaishali's Crochet | Our Story of Empowerment</title>
        <meta
          name="description"
          content="Discover the inspiring story behind Vaishali's Crochet — a journey of handmade art, resilience, and empowering women through creativity."
        />
      </Helmet>

      {/* 🌸 Background */}
      <div className="bg-gradient-to-b from-rose-50 to-pink-300 min-h-screen py-6">
        {/* 🌼 Header Banner */}
        <div className="relative w-full max-w-5xl mx-auto text-center px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            About <span className="text-rose-500">Vaishali's Crochet</span>
          </h1>
          <p className="text-lg text-gray-700 mt-3 font-medium">
            Handmade with love, crafted with purpose.
          </p>
        </div>

        {/* 🌿 Content Sections */}
        <div className="max-w-4xl mx-auto mt-12 space-y-12 px-6">
          {[
            {
              title: "Our Mission: More Than Just Thread",
              text1:
                "Vaishali's Crochet is built on a simple, powerful idea — women's empowerment. Our goal is to create beautiful, handmade products while building a community where every woman can be independent and celebrated for her skill.",
              text2:
                "This store is the next step in that mission — a platform to share our art and, as we grow, to employ and empower other women crocheters.",
            },
            {
              title: "Our Story: The Thread of Resilience",
              text1:
                "Our story begins with our founder, Vaishali. Her passion for crochet started in 1999, but like many women, she faced a traditional family system that put her dreams on hold.",
              text2:
                "In 2008, after moving to Mumbai, her resilience shined. To support her family, she started a successful tuition business, showing the same dedication she now pours into her craft. But the passion for crochet never faded.",
            },
            {
              title: "The Turning Point",
              text1:
                "In 2016, we launched a Facebook page to share her work. The real turning point came in 2021. After Vaishali posted a beautiful pineapple doily, she discovered another channel had posted her work under their own name.",
              text2:
                "We knew it was time for her to share her unique talent with the world in her own voice. In September 2021, the Vaishali's Crochet YouTube channel was born.",
            },
            {
              title: "From Passion to Purpose",
              text1:
                "Starting in Marathi and later shifting to Hindi, the channel grew rapidly. In 2023, it was monetized, and today, it's a thriving community with thousands of subscribers and trusted customers.",
              text2:
                "This store is the next step in that journey. Every item you see is part of a story that started in 1999 — a story of passion, resilience, and the belief that every woman deserves to follow her dreams.",
            },
          ].map((section, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-sm border border-rose-100 hover:shadow-md transition-all"
            >
              <h2 className="text-2xl md:text-3xl font-semibold text-rose-600 mb-4">
                {section.title}
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {section.text1}
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mt-4">
                {section.text2}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default About;

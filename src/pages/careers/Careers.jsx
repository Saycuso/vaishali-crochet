import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Careers = () => {
  return (
    <>
      {/* SEO */}
      <Helmet>
        <title>Join Our Team | Vaishali's Crochet</title>
        <meta
          name="description"
          content="We're building a team passionate about handmade art and women's empowerment. Learn about future opportunities at Vaishali's Crochet."
        />
      </Helmet>

      {/* 🌸 Background Section */}
      <div className="min-h-[80vh] bg-gradient-to-b from-amber-50 to-rose-300 flex items-center justify-center py-6 px-6">
        <div className="max-w-3xl text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-10 border border-rose-100">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6">
            Join Our <span className="text-rose-600">Mission</span>
          </h1>

          <p className="text-lg text-gray-700 leading-relaxed">
            Vaishali's Crochet is a growing brand with a powerful mission —
            empowering women through the timeless art of crochet.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed mt-4">
            While we’re <span className="font-semibold text-rose-500">not actively hiring</span> right now,
            our story is just beginning. We’ll soon be looking for passionate
            creators, crocheters, and designers who share our love for handmade artistry.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed mt-6 font-medium">
            Thank you for your interest in being part of our journey. Stay
            connected as the opportunities to collaborate and create with us are
            coming soon.
          </p>

          {/* CTA */}
          <div className="mt-10">
            <Link to="/contact">
              <Button
                size="lg"
                className="bg-rose-500 hover:bg-rose-600 text-white text-lg px-8 py-6 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Careers;

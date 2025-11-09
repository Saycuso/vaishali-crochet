import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

// This is a re-usable card component for this section
const LinkCard = ({ title, description, buttonText, linkTo }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col text-center items-center">
      <h3 className="text-3xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 text-lg mb-6 flex-1">{description}</p>
      <Button
        className="w-full max-w-xs bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8 py-3 text-lg"
        onClick={() => navigate(linkTo)}
      >
        {buttonText}
      </Button>
    </div>
  );
};

// This is the main component you'll import
const PageLinksSection = () => {
  return (
    <section className="w-full bg-pink-50 py-16 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <LinkCard
            title="About fds"
            description="Discover the story behind Vaishali's passion and our cozy creations."
            buttonText="Our Story"
            linkTo="/about"
          />
          
          <LinkCard
            title="Contact Us"
            description="Have a question or a custom request? We'd love to hear from you."
            buttonText="Get in Touch"
            linkTo="/contact"
          />
          
          <LinkCard
            title="Careers"
            description="Join our team and help spread the warmth of handmade crafts."
            buttonText="View Openings"
            linkTo="/careers"
          />

        </div>
      </div>
    </section>
  );
};

export default PageLinksSection;
import React from "react";
import { Phone, Mail, MessageCircle } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-orange-200 to-orange-300 px-4 py-14">
      <div className="w-full max-w-lg bg-white/90 backdrop-blur-sm border border-orange-100 rounded-2xl shadow-sm p-5 text-center">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-3">
          Get in <span className="text-orange-500">Touch</span>
        </h2>
        <p className="text-gray-600 text-base mb-8">
          We'd love to hear from you! Whether it’s about a custom crochet order,
          collaboration, or any query — just reach out. We’ll get back to you soon!
        </p>

        {/* Contact Info */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center gap-3 text-gray-700">
            <Phone className="w-5 h-5 text-orange-500" />
            <a
              href="tel:+917021645040"
              className="hover:text-orange-500 transition font-medium text-base"
            >
              +91 70216 45040
            </a>
          </div>

          <div className="flex items-center justify-center gap-3 text-gray-700">
            <Mail className="w-5 h-5 text-orange-500" />
            <a
              href="mailto:vaishaliscrochet@gmail.com"
              className="hover:text-orange-500 transition font-medium text-base"
            >
              vaishaliscrochet@gmail.com
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-orange-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-3 text-orange-400 font-semibold">
              OR
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <div>
          <a
            href="mailto:vaishaliscrochet@gmail.com"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full text-base font-medium shadow-md hover:shadow-lg transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            Send Us a Message
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;

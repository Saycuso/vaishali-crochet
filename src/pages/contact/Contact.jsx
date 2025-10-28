import React from "react";
import { Phone, Mail, MessageCircle } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-md p-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          Get in Touch
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          We'd love to hear from you! Whether you have a question about our handmade
          crochet items, orders, or anything else — feel free to reach out.
        </p>

        {/* Contact Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-center gap-2 text-gray-700">
            <Phone className="w-4 h-4 text-orange-500" />
            <a href="tel:+917021645040" className="hover:text-orange-500 transition text-sm">
              +91 70216 45040
            </a>
          </div>

          <div className="flex items-center justify-center gap-2 text-gray-700">
            <Mail className="w-4 h-4 text-orange-500" />
            <a
              href="mailto:vaishaliscrochet@gmail.com"
              className="hover:text-orange-500 transition text-sm"
            >
              vaishaliscrochet@gmail.com
            </a>
          </div>
        </div>

        {/* Optional message placeholder */}
        <div className="border-t border-gray-200 pt-5">
          <p className="text-sm text-gray-500 mb-3">
            Want to send us a message directly?
          </p>
          <a
            href="mailto:vaishaliscrochet@gmail.com"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <MessageCircle className="w-4 h-4" />
            Send Message
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;

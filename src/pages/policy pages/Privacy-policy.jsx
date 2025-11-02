import React from "react";

const PrivacyPolicyPage = () => {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">
        Privacy Policy for Vaishalis crochet
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Last Updated: October 28, 2025
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        1. Information Collection
      </h2>
      <p className="mb-4">
        We collect information about you from various sources.
      </p>

      <h3 className="text-xl font-semibold mb-2">
        A. Information You Directly Provide to Us
      </h3>
      <p>
        When you make a purchase, register an account, or contact us, you
        voluntarily provide the following personal information:
      </p>
      <ul className="list-disc list-inside ml-4 mt-2 mb-4 space-y-1">
        <li>
          <strong>Contact Details:</strong> Full Name, Email Address, Phone
          Number.
        </li>
        <li>
          <strong>Shipping & Billing:</strong> Shipping Address, Billing
          Address, and payment information (note: all card details are handled
          securely by our Payment Gateway, **Razorpay**, and we do not store
          them).
        </li>
        <li>
          <strong>Communication:</strong> Any information you include in
          customer support messages.
        </li>
      </ul>

      <h3 className="text-xl font-semibold mb-2">
        B. Information We Collect Automatically (Device Data)
      </h3>
      <p>
        When you access the Site, we automatically collect certain information
        about your device and interaction with our Site ("Device Information"):
      </p>
      <ul className="list-disc list-inside ml-4 mt-2 mb-4 space-y-1">
        <li>
          <strong>Usage Data:</strong> Browser type, IP address, time zone, and
          cookies installed on your device.
        </li>
        <li>
          <strong>Navigational Data:</strong> Pages viewed, referring websites,
          and how you interact with the Site.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        2. Use of Personal Information
      </h2>
      <p>We use your personal information for the following purposes:</p>
      <ul className="list-disc list-inside ml-4 mt-2 mb-4 space-y-1">
        <li>
          **Order Fulfillment:** To process your payment, fulfill your order,
          package, and ship your handmade crochet products, and send you
          confirmations and shipping updates.
        </li>
        <li>
          **Customer Support:** To provide customer support, manage returns, and
          respond to your inquiries.
        </li>
        <li>
          **Marketing & Communication:** To send you promotional emails (if you
          opt-in) about new products or sales.
        </li>
        <li>
          **Security & Fraud:** To screen orders for potential risk or fraud,
          and to comply with legal and regulatory obligations.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        3. Sharing and Disclosure
      </h2>
      <p>
        We share your Personal Information with the following third parties:
      </p>
      <ul className="list-disc list-inside ml-4 mt-2 mb-4 space-y-1">
        <li>
          **Service Providers:** We share necessary information with partners
          who perform functions on our behalf. These include: Payment Gateway
          (**Razorpay**), Hosting (**Netlify**), and Shipping Carriers ([e.g.,
          India Post, Delhivery, or local courier services]).
        </li>
        <li>
          **Legal Compliance:** We may disclose personal information to comply
          with applicable laws and regulations, respond to a subpoena, search
          warrant, or other lawful requests for information we receive, or
          otherwise protect our rights.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">4. Your Rights</h2>
      <p>
        You have the right to access the personal information we hold about you
        and ask that your personal information be corrected, updated, or
        deleted. If you wish to exercise these rights, please contact us using
        the information provided below.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        5. Contact Information
      </h2>
      <p>
        For more information about our privacy practices, if you have questions,
        or if you would like to make a complaint, please contact us by e-mail
        at: <strong>vaishaliscrochet@gmail.com</strong>
      </p>
    </div>
  );
};

export default PrivacyPolicyPage;

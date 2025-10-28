import React from "react";

const TermsAndConditionsPage = () => {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">
        Terms and Conditions for Vaishalis crochet
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Last Updated: October 28, 2025
      </p>

      <p className="mb-4">
        Please read these Terms and Conditions ("Terms") carefully before using
        the Vaishalis crochet website (the "Service," "Site") operated by [Your
        Name or Business Name] ("us," "we," or "our"). By accessing or using the
        Service, you agree to be bound by these Terms. If you disagree with any
        part of the terms, then you may not access the Service.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">1. Purchases</h2>
      <p>
        If you wish to purchase any product or service made available through
        the Service ("Purchase"), you may be asked to supply certain information
        relevant to your Purchase including, without limitation, your name,
        shipping address, and billing information.
      </p>
      <ul className="list-disc list-inside ml-4 mt-2 mb-4 space-y-1">
        <li>
          **Payment Processing:** All payment processing is handled by
          third-party payment processors, primarily **Razorpay**. We are not
          responsible for handling or storing your credit/debit card
          information; that is the responsibility of the payment gateway.
        </li>
        <li>
          **Order Acceptance:** We reserve the right to refuse or cancel your
          order at any time for reasons including, but not limited to: product
          availability, errors in the description or price of the product, or
          error in your order.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        2. Product Information and Handmade Disclaimer
      </h2>
      <ul className="list-disc list-inside ml-4 mt-2 mb-4 space-y-1">
        <li>
          **Handmade Variance:** All products sold on the Site are handmade
          crochet items. As a result, there may be slight variations in color,
          size, and pattern from the product images shown. These variations are
          inherent to the nature of handcrafted items and are not considered
          defects.
        </li>
        <li>
          **Material Accuracy:** We attempt to be as accurate as possible with
          our product descriptions and materials used (e.g., "acrylic yarn,"
          "cotton thread"). However, we do not warrant that product descriptions
          or other content of this Site are entirely error-free.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        3. Intellectual Property
      </h2>
      <p className="mb-4">
        The Service and its original content, features, and functionality are
        and will remain the exclusive property of [Your Name or Business Name]
        and its licensors. Our designs, including the "Crochet Rosebud Samai
        Rangoli" and "Snowflake Tealight Candle Holder," are our proprietary
        intellectual property. You may not use, copy, or reproduce these designs
        without express written permission.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        4. Links To Other Web Sites
      </h2>
      <p className="mb-4">
        Our Service may contain links to third-party web sites or services that
        are not owned or controlled by Vaishalis crochet. We have no control
        over, and assume no responsibility for, the content, privacy policies,
        or practices of any third-party web sites or services.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">5. Contact Us</h2>
      <p>If you have any questions about these Terms, please contact us:</p>
      <ul className="list-disc list-inside ml-4 mt-2 mb-4 space-y-1">
        <li>**By email:** vaishaliscrochet@gmail.com</li>
        <li>
          **By visiting this page on our website:** [Link to your separate
          Contact Us page]
        </li>
        <li>**By mail:** [Your Registered Business Address or Home Address]</li>
      </ul>
    </div>
  );
};

export default TermsAndConditionsPage;

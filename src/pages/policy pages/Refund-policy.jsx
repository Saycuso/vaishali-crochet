import React from "react";

const RefundPolicyPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen px-5 py-8 md:px-10">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
          Refund & Return Policy
        </h1>
        <p className="text-xs text-gray-500 mt-2">
          Last Updated: October 28, 2025
        </p>
        <p className="mt-3 text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
          This policy outlines the process and conditions for requesting a refund
          or return for purchases made on{" "}
          <span className="font-semibold text-orange-600">Vaishalis Crochet</span>.
        </p>
      </div>

      {/* Content Wrapper */}
      <div className="bg-white shadow-md rounded-2xl p-5 md:p-8 space-y-6 text-gray-700 leading-relaxed">
        {/* SECTION 1 - SHIPPING POLICY */}
        <section>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 border-b pb-2 mb-3">
            1. Shipping Policy & Delivery
          </h2>
          <ul className="space-y-3 text-sm md:text-base">
            <li>
              <span className="font-semibold text-gray-800">Processing Time:</span>{" "}
              All products are handmade. Orders typically take{" "}
              <span className="text-red-500 font-bold">3–7 business days</span> to
              prepare before shipping.
            </li>
            <li>
              <span className="font-semibold text-gray-800">Shipping Partners:</span>{" "}
              We use trusted carriers such as India Post, Delhivery, or Blue Dart for
              domestic delivery.
            </li>
            <li>
              <span className="font-semibold text-gray-800">Delivery Time:</span>{" "}
              Usually{" "}
              <span className="text-red-500 font-bold">3–5 business days</span> after
              dispatch.
            </li>
            <li>
              <span className="font-semibold text-gray-800">Tracking:</span>{" "}
              A tracking number will be emailed once shipped.
            </li>
            <li>
              <span className="font-semibold text-gray-800">Loss or Damage:</span>{" "}
              See refund terms below.
            </li>
          </ul>
        </section>

        {/* SECTION 2 - CANCELLATION POLICY */}
        <section>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 border-b pb-2 mb-3">
            2. Cancellation Policy
          </h2>
          <p className="text-red-600 font-bold mb-1">
            Vaishalis Crochet follows a strict NO CANCELLATION policy.
          </p>
          <p className="text-sm md:text-base">
            As all products are handmade, production begins right after an order is
            placed. Therefore, cancellations cannot be accepted once payment is
            confirmed.
          </p>
        </section>

        {/* SECTION 3 - REFUND POLICY */}
        <section>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 border-b pb-2 mb-3">
            3. Refund Policy (Returns)
          </h2>
          <p className="text-sm md:text-base mb-4">
            We take pride in our craftsmanship. Refunds or returns are only allowed
            under specific conditions mentioned below.
          </p>

          {/* A. ELIGIBILITY */}
          <div className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-4 mb-3">
            <h3 className="font-semibold text-gray-800 mb-2">A. Eligibility for Refund</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm md:text-base">
              <li>
                <span className="font-semibold">Damaged in Transit:</span> If a product
                arrives damaged, report it within{" "}
                <span className="text-red-500 font-bold">48 hours</span> of delivery.
              </li>
              <li>
                <span className="font-semibold">Incorrect Item:</span> If you receive a
                completely different product than ordered (e.g., different category or
                color).
              </li>
            </ol>
          </div>

          {/* B. INELIGIBLE */}
          <div className="bg-gray-50 border-l-4 border-gray-300 rounded-lg p-4 mb-3">
            <h3 className="font-semibold text-gray-800 mb-2">B. Ineligible for Refund</h3>
            <ul className="list-disc list-inside space-y-2 text-sm md:text-base">
              <li>Change of mind after purchase.</li>
              <li>
                Minor differences in size or color — handmade items may vary slightly.
              </li>
              <li>Incorrect or incomplete shipping address provided by the buyer.</li>
            </ul>
          </div>

          {/* C. PROCESS */}
          <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">C. Refund Process</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm md:text-base">
              <li>
                <span className="font-semibold">Report Issue:</span> Email us at{" "}
                <a
                  href="mailto:vaishaliscrochet@gmail.com"
                  className="text-orange-600 font-medium underline"
                >
                  vaishaliscrochet@gmail.com
                </a>{" "}
                within <span className="text-red-500 font-bold">48 hours</span> of
                delivery with order number and photos.
              </li>
              <li>
                <span className="font-semibold">Approval:</span> We’ll review your claim
                within <span className="font-semibold">2–3 business days</span> and
                inform you of next steps.
              </li>
              <li>
                <span className="font-semibold">Return Shipping:</span> We’ll share
                return instructions after approval. If the issue is verified, return
                shipping is covered by us.
              </li>
              <li>
                <span className="font-semibold">Refund Timeline:</span> Once we receive
                and verify the item, refunds are processed to your original payment
                method (Razorpay/Bank) within{" "}
                <span className="font-semibold">5–7 business days</span>.
              </li>
            </ol>
          </div>
        </section>

        {/* FOOTNOTE */}
        <section className="text-xs text-gray-500 border-t pt-3">
          <p>
            For further assistance, please contact us at{" "}
            <a
              href="mailto:vaishaliscrochet@gmail.com"
              className="text-orange-500 underline"
            >
              vaishaliscrochet@gmail.com
            </a>{" "}
            or call us at{" "}
            <a href="tel:+917021645040" className="text-orange-500 underline">
              +91 70216 45040
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
};

export default RefundPolicyPage;

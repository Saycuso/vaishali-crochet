import React from "react";

const RefundPolicyPage = () => {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">
        Refund and Return Policy for Vaishalis crochet
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Last Updated: October 28, 2025
      </p>

      <p className="mb-4">
        This policy outlines the process and conditions for requesting a refund
        or return for purchases made on the Vaishalis crochet website.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        1. Cancellation Policy
      </h2>
      <p className="font-bold text-lg mb-2 text-red-600">
        Vaishalis crochet has a NO CANCELLATION policy.
      </p>
      <p className="mb-4">
        Due to the custom and handcrafted nature of our products, production
        often begins immediately after an order is placed. Therefore, all sales
        are considered final immediately upon purchase, and we cannot
        accommodate order cancellations.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        2. Refund Policy (Returns)
      </h2>
      <p>
        We take pride in the quality and craftsmanship of our products. Returns
        and refunds are issued under specific, limited conditions:
      </p>

      <h3 className="text-xl font-semibold mb-2">A. Eligibility for Refund</h3>
      <p>A refund is **only** issued if:</p>
      <ol className="list-decimal list-inside ml-4 mt-2 mb-4 space-y-1">
        <li>
          **Item is Damaged in Transit:** The product arrives clearly damaged
          due to shipping negligence. You must report this within **48 hours**
          of delivery.
        </li>
        <li>
          **Incorrect Item Received:** You received a product or color that is
          fundamentally different from what you ordered (e.g., received a candle
          holder when you ordered a rangoli).
        </li>
      </ol>

      <h3 className="text-xl font-semibold mb-2">B. Ineligible for Refund</h3>
      <p>We **do not** offer refunds or returns for the following reasons:</p>
      <ul className="list-disc list-inside ml-4 mt-2 mb-4 space-y-1">
        <li>**Change of Mind:** You simply no longer want the product.</li>
        <li>
          **Minor Variance:** Small, natural variations in size, color, or
          pattern inherent to handmade items (as noted in the Terms &
          Conditions).
        </li>
        <li>
          **Incorrect Address:** The order was lost due to an incorrect or
          incomplete shipping address provided by the customer.
        </li>
      </ul>

      <h3 className="text-xl font-semibold mb-2">C. Refund Process</h3>
      <ol className="list-decimal list-inside ml-4 mt-2 mb-4 space-y-1">
        <li>
          **Report Damage/Error:** Send an email to
          **vaishaliscrochet@gmail.com** within **48 hours** of delivery,
          including: Your **Order Number**, Clear **photographs** of the damage
          to the item and the packaging, and a brief description of the issue.
        </li>
        <li>
          **Approval:** We will review your request within **[2-3] business
          days** and notify you of the approval or rejection of your refund.
        </li>
        <li>
          **Return Shipping:** If approved, we will provide instructions for
          returning the item. **[State clearly who pays for return shipping,
          e.g., "We will cover the cost of return shipping for damaged/incorrect
          items." OR "The customer is responsible for return shipping costs."]**
        </li>
        <li>
          **Refund Issue:** Once we receive the returned item and verify the
          damage or error, the refund will be processed to your original payment
          method (Razorpay/Bank Account) within **[5-7] business days**.
        </li>
      </ol>
    </div>
  );
};

export default RefundPolicyPage;

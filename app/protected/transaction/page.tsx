"use client"; // This ensures it's a Client Component

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { setUserToPremium } from "@/actions/user-actions";
import Breadcrumb from "@/components/custom/Breadcrumbs";

export default function TransactionClientPage() {
  const router = useRouter(); // Initialize router for navigation
  const [creditCard, setCreditCard] = useState("");
  const [cvc, setCvc] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [errors, setErrors] = useState({
    creditCard: "",
    cvc: "",
    expiryDate: "",
  });
  const [submitError, setSubmitError] = useState<string | null>(null); // Submit error state
  const [isSubmitted, setIsSubmitted] = useState(false); // Track submission success

  // Handle credit card input
  const handleCreditCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters

    if (value.length > 16) {
      value = value.slice(0, 16); // Limit to 16 digits
    }

    const formattedValue = value.replace(/(\d{4})(?=\d)/g, "$1 ").trim(); // Add a space after every 4 digits
    setCreditCard(formattedValue);

    setErrors((prevErrors) => ({
      ...prevErrors,
      creditCard:
        value.length === 16 ? "" : "Credit card number must be 16 digits.",
    }));
  };

  // Handle CVC input
  const handleCVCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters

    if (value.length > 3) {
      value = value.slice(0, 3); // Limit to 3 digits
    }

    setCvc(value);

    setErrors((prevErrors) => ({
      ...prevErrors,
      cvc: value.length === 3 ? "" : "CVC must be 3 digits.",
    }));
  };

  // Handle expiry date input
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters

    if (value.length > 4) {
      value = value.slice(0, 4); // Limit to 4 digits
    }

    let monthValid = true;

    // Validate month (first 2 digits between 01-12)
    if (value.length >= 2) {
      const month = parseInt(value.slice(0, 2), 10);
      if (month < 1 || month > 12) {
        monthValid = false;
      }
    }

    // Add a / after the first 2 digits for MM/YY format
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }

    setExpiryDate(value);

    setErrors((prevErrors) => ({
      ...prevErrors,
      expiryDate: !monthValid
        ? "Month must be between 01 and 12."
        : value.length === 5
          ? ""
          : "Expiry date must be in MM/YY format.",
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (
      !errors.creditCard &&
      !errors.cvc &&
      !errors.expiryDate &&
      creditCard.length === 19 && // Check for formatted length with spaces
      cvc.length === 3 &&
      expiryDate.length === 5
    ) {
      setSubmitError(null);
      await setUserToPremium();
      setIsSubmitted(true); // Mark as submitted
    } else {
      setSubmitError("Please fill out all fields correctly.");
      setIsSubmitted(false); // Ensure it's not marked as submitted if there's an error
    }
  };

  return (
    <>
      <Breadcrumb />
      <div className="flex-1 w-full flex flex-col gap-3 p-3 sm:p-4 max-w-md mx-auto">
        <header className="text-center mb-2">
          <h1 className="text-2xl font-bold">Transaction Page</h1>
        </header>

        {/* Display default image */}
        <div className="mb-4 text-center">
          <img
            src="/assets/mcvisa.png" // Path to the renamed default image
            alt="Default Image"
            className="mx-auto w-32 h-32 object-cover"
          />
        </div>

        {/* Credit Card Input */}
        <div className="mb-4">
          <label
            htmlFor="creditCard"
            className="block text-sm font-medium mb-1 text-black dark:text-white" // Text changes for theme
          >
            Card Number
          </label>
          <Input
            id="creditCard"
            type="text"
            placeholder="Enter 16-digit Credit Card Number"
            value={creditCard}
            onChange={handleCreditCardChange}
            className="mb-1"
          />
          {errors.creditCard && (
            <p className="text-red-500 text-sm">{errors.creditCard}</p>
          )}
        </div>

        {/* CVC Input */}
        <div className="mb-4">
          <label
            htmlFor="cvc"
            className="block text-sm font-medium mb-1 text-black dark:text-white" // Text changes for theme
          >
            CVC Number
          </label>
          <Input
            id="cvc"
            type="text"
            placeholder="Enter 3-digit CVC"
            value={cvc}
            onChange={handleCVCChange}
            className="mb-1"
          />
          {errors.cvc && <p className="text-red-500 text-sm">{errors.cvc}</p>}
        </div>

        {/* Expiry Date Input */}
        <div className="mb-4">
          <label
            htmlFor="expiryDate"
            className="block text-sm font-medium mb-1 text-black dark:text-white" // Text changes for theme
          >
            Card Expiration Date
          </label>
          <Input
            id="expiryDate"
            type="text"
            placeholder="MM/YY"
            value={expiryDate}
            onChange={handleExpiryDateChange}
            className="mb-1"
          />
          {errors.expiryDate && (
            <p className="text-red-500 text-sm">{errors.expiryDate}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button onClick={handleSubmit} className="mb-2">
          Submit Payment
        </Button>

        {/* Submit Error Message */}
        {submitError && (
          <p className="text-red-500 text-sm text-center">{submitError}</p>
        )}

        {/* Success Message and Return Button */}
        {isSubmitted && (
          <div className="text-center mt-4">
            <p className="text-green-500 text-lg font-medium">
              Payment Submitted Successfully! You Are Now A Premium User!
            </p>
            <Button
              variant="secondary"
              onClick={() => router.back()}
              className="mt-3"
            >
              Return to Previous Page
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

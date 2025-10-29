/**
 * Credits Page - Credit Management & Purchase
 * 
 * This page allows users to:
 * 1. View their current credit balance
 * 2. See transaction history
 * 3. Purchase more credits via Razorpay
 * 
 * The actual Image Generation and AI Chat features are on their respective pages (/ and /chat).
 * This page is focused solely on credit management and purchase.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/utils/supabase/auth/user";
import { User } from "@supabase/supabase-js";
import {
  getUserCredits,
  CREDIT_COSTS,
  CREDIT_PACKAGES,
  CreditPackage,
  getTransactionHistory,
  CreditTransaction,
} from "@/utils/supabase/credits";

// Declare Razorpay interface for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CreditsPage() {
  const router = useRouter();

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  // User authentication state
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Credit balance state - synced with Supabase
  const [credits, setCredits] = useState<number>(0);
  const [loadingCredits, setLoadingCredits] = useState(true);

  // Transaction history state
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [showTransactions, setShowTransactions] = useState(false);

  // Payment processing state
  const [processingPayment, setProcessingPayment] = useState(false);

  // ============================================
  // EFFECTS - Load user data and credits
  // ============================================

  /**
   * Effect 1: Check authentication and load user
   * Runs once on component mount
   */
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          // Redirect to sign-in if not authenticated
          router.push("/sign-in");
          return;
        }
        setUser(currentUser);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/sign-in");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  /**
   * Effect 2: Load credits from Supabase when user is available
   * This syncs the local state with the database
   */
  useEffect(() => {
    if (!user) return;

    const loadCredits = async () => {
      try {
        setLoadingCredits(true);
        const userCredits = await getUserCredits(user.id);
        setCredits(userCredits);
      } catch (error) {
        console.error("Failed to load credits:", error);
      } finally {
        setLoadingCredits(false);
      }
    };

    loadCredits();
  }, [user]);

  /**
   * Effect 3: Load transaction history when user is available
   */
  useEffect(() => {
    if (!user) return;

    const loadTransactions = async () => {
      try {
        const history = await getTransactionHistory(user.id, 20);
        setTransactions(history);
      } catch (error) {
        console.error("Failed to load transaction history:", error);
      }
    };

    loadTransactions();
  }, [user, credits]); // Reload when credits change

  /**
   * Effect 4: Load Razorpay script
   * This script is required for payment processing
   */
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  /**
   * Refresh credits from database
   * Used after purchases
   */
  const refreshCredits = async () => {
    if (!user) return;
    try {
      const userCredits = await getUserCredits(user.id);
      setCredits(userCredits);
    } catch (error) {
      console.error("Failed to refresh credits:", error);
    }
  };

  // ============================================
  // RAZORPAY PAYMENT LOGIC
  // ============================================

  /**
   * Initiate Razorpay payment for credit purchase
   * Creates order, opens Razorpay checkout, and handles payment verification
   */
  const handleBuyCredits = async (pkg: CreditPackage) => {
    if (!user || !window.Razorpay) return;

    try {
      setProcessingPayment(true);

      // Step 1: Create Razorpay order via our API
      const orderResponse = await fetch(
        "/api/payment/razorpay/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: pkg.price,
            credits: pkg.credits + pkg.bonus,
            packageId: pkg.id,
          }),
        }
      );

      if (!orderResponse.ok) {
        throw new Error("Failed to create payment order");
      }

      const orderData = await orderResponse.json();

      // Step 2: Configure Razorpay checkout options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Dream Generator",
        description: `${pkg.name} - ${pkg.credits + pkg.bonus} Credits`,
        order_id: orderData.orderId,
        prefill: {
          email: user.email || "",
        },
        theme: {
          color: "#6366f1", // Primary color
        },
        // Step 3: Handle successful payment
        handler: async function (response: any) {
          try {
            // Verify payment signature on server
            const verifyResponse = await fetch(
              "/api/payment/razorpay/verify-payment",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  credits: pkg.credits + pkg.bonus,
                  amount: pkg.price,
                  packageId: pkg.id,
                }),
              }
            );

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            const verifyData = await verifyResponse.json();

            // Payment successful and verified!
            alert(
              `✅ Payment successful! ${verifyData.credits} credits added to your account.`
            );

            // Refresh credit balance
            await refreshCredits();
          } catch (error) {
            console.error("Payment verification failed:", error);
            alert(
              "Payment completed but verification failed. Please contact support."
            );
          } finally {
            setProcessingPayment(false);
          }
        },
        // Step 4: Handle payment modal close
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
          },
        },
      };

      // Step 5: Open Razorpay checkout
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Failed to initiate payment. Please try again.");
      setProcessingPayment(false);
    }
  };

  // ============================================
  // RENDER - Loading State
  // ============================================

  if (loading || loadingCredits) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER - Main UI
  // ============================================

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-2">
            Credits Management
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            View your balance, transaction history, and purchase more credits
          </p>
        </div>

        {/* Credit Balance Display */}
        <div className="mb-8 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                Available Credits
              </p>
              <p className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                {credits}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                Use credits for image generation (5) and AI chat (1 per message)
              </p>
            </div>
            <button
              onClick={() => setShowTransactions(!showTransactions)}
              className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300 text-sm font-medium"
            >
              {showTransactions ? "Hide" : "View"} History
            </button>
          </div>

          {/* Transaction History */}
          {showTransactions && transactions.length > 0 && (
            <div className="mt-6 border-t border-neutral-200 dark:border-neutral-800 pt-6">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
                Recent Transactions
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {new Date(transaction.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          transaction.amount > 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Balance: {transaction.balance_after}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showTransactions && transactions.length === 0 && (
            <div className="mt-6 border-t border-neutral-200 dark:border-neutral-800 pt-6 text-center text-neutral-500 dark:text-neutral-400">
              <p>No transactions yet</p>
            </div>
          )}
        </div>

        {/* Quick Links to Use Credits */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/"
            className="p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  🎨 Generate Images
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Create stunning AI-generated images
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
                  Cost: <span className="font-semibold text-primary-600 dark:text-primary-400">5 credits</span> per image
                </p>
              </div>
              <svg className="w-6 h-6 text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/chat"
            className="p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 hover:border-accent-300 dark:hover:border-accent-700 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
                  💬 AI Chat
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Chat with our intelligent AI assistant
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
                  Cost: <span className="font-semibold text-accent-600 dark:text-accent-400">1 credit</span> per message
                </p>
              </div>
              <svg className="w-6 h-6 text-neutral-400 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Buy Credits Section */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6 border border-neutral-200 dark:border-neutral-800">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Purchase Credits
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Choose a package to add more credits to your account
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CREDIT_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                  pkg.popular
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-950/20 shadow-xl scale-105"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-primary-600 to-accent-600 text-white text-xs font-bold">
                      POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                    {pkg.name}
                  </h3>
                  <div className="mb-4">
                    <p className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                      {pkg.credits + pkg.bonus}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      credits
                      {pkg.bonus > 0 && (
                        <span className="block mt-1 text-green-600 dark:text-green-400 font-semibold">
                          +{pkg.bonus} bonus!
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                    ₹{pkg.price}
                  </p>
                  <button
                    onClick={() => handleBuyCredits(pkg)}
                    disabled={processingPayment}
                    className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      pkg.popular
                        ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:from-primary-500 hover:to-primary-600"
                        : "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {processingPayment ? "Processing..." : "Buy Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Credit Usage Info */}
          <div className="mt-8 p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              💡 How Credits Work
            </h3>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400 mt-1">
                  •
                </span>
                <span>
                  <strong>Image Generation:</strong> Each image costs 5 credits. Create stunning AI-generated artwork.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-600 dark:text-accent-400 mt-1">
                  •
                </span>
                <span>
                  <strong>AI Chat:</strong> Each message costs 1 credit. Have unlimited conversations with our AI.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 mt-1">
                  •
                </span>
                <span>
                  <strong>Welcome Bonus:</strong> New users receive 50 free credits to get started!
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 mt-1">
                  •
                </span>
                <span>
                  <strong>Bonus Credits:</strong> Get extra credits when you purchase larger packages.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">
                  •
                </span>
                <span>
                  <strong>Secure Payment:</strong> All payments are processed securely through Razorpay.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
// this tesing 
import React from "react";
import { useAuthRedux } from "../hooks/useAuthRedux";
import { SEOHead } from "@/components/SEO/SEOHead";
import { getSEOConfig } from "@/components/SEO/seoConfig";

const LiveChatHistory = () => {
  const { user } = useAuthRedux();

  return (
    <div className=" bg-gray-50 min-h-screen">
      <SEOHead {...getSEOConfig("/chat-history")} />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Live Chat History
        </h1>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Your Chat History
            </h2>
          </div>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900">Support Team</h3>
                <span className="text-sm text-gray-500">Today, 10:30 AM</span>
              </div>
              <p className="text-gray-600 mt-2">
                Hello! How can I help you today?
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900">Support Team</h3>
                <span className="text-sm text-gray-500">
                  Yesterday, 2:15 PM
                </span>
              </div>
              <p className="text-gray-600 mt-2">
                Thank you for your question. We've resolved your issue.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900">Support Team</h3>
                <span className="text-sm text-gray-500">Jan 15, 2024</span>
              </div>
              <p className="text-gray-600 mt-2">
                Your session has been scheduled for tomorrow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveChatHistory;

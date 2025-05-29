"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { API_BASE_URL, IMAGE_BASE_URL, setProjectId, getProjectId } from "../../../constants/index";

// Define interfaces for the API response data
interface BasicDetails {
  email: string;
  mobileNumber: string;
  logo: string;
  name: string;
}

interface AnalyticsDetails {
  gtmId: string;
  fbPixelId: string;
}

interface WebsiteData {
  basicDetails: BasicDetails;
  analyticsDetails: AnalyticsDetails;
  _id: string;
}

interface ApiResponse {
  message: string;
  data: WebsiteData;
}

export default function ProjectPage() {
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId; // Extract projectId from route

  // Log params for debugging
  console.log("Route params:", params);
  console.log("Extracted projectId:", projectId);

  // Fetch website data based on projectId
  useEffect(() => {
    async function fetchWebsiteData() {
      if (!projectId) {
        console.log("No projectId provided in route");
        setError("No project ID provided");
        setLoading(false);
        return;
      }

      console.log("Calling setProjectId with:", projectId);
      setProjectId(projectId); // Store projectId in constants
      console.log("Verifying stored projectId:", getProjectId()); // Verify immediately

      console.log("Fetching data for projectId:", projectId);

      try {
        const response = await fetch(
          `${API_BASE_URL}/website/auth/get-website-by-uid/${projectId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              // Add auth header if needed
              // "Authorization": `Bearer ${yourToken}`,
            },
          }
        );

        console.log("API Response Status:", response.status, response.statusText);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
        }

        const result: ApiResponse = await response.json();
        console.log("API Response Data:", result);

        if (result.message === "Website fetched successfully" && result.data) {
          setWebsiteData(result.data);
        } else {
          setError(`API Error: ${result.message || "Invalid response format"}`);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(`Error fetching website data: ${err instanceof Error ? err.message : "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    }

    fetchWebsiteData();
  }, [projectId]);

  // Handle card click to redirect to /:_id
  const handleCardClick = () => {
    if (websiteData?._id) {
      console.log("Redirecting to:", `/${websiteData._id}`);
      router.push(`/${websiteData._id}`);
    } else {
      console.log("No _id available for redirect");
    }
  };

  if (loading) {
    console.log("Rendering loading state");
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    console.log("Rendering error state:", error);
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  if (!websiteData) {
    console.log("Rendering no data state");
    return <div className="text-center mt-8">No data found</div>;
  }

  const { basicDetails, analyticsDetails, _id } = websiteData;
  console.log("Rendering card with data:", websiteData);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div
        className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
        onClick={handleCardClick}
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{basicDetails.name}</h2>
        {basicDetails.logo && (
          <div className="mb-4">
            <Image
              src={`${IMAGE_BASE_URL}${basicDetails.logo}`} // Use IMAGE_BASE_URL for logo
              alt={`${basicDetails.name} logo`}
              width={100}
              height={100}
              className="rounded-full"
              onError={() => console.error("Failed to load logo:", `${IMAGE_BASE_URL}${basicDetails.logo}`)}
            />
          </div>
        )}
        <p className="text-gray-600 mb-2">
          <span className="font-semibold">Email:</span> {basicDetails.email}
        </p>
        <p className="text-gray-600 mb-2">
          <span className="font-semibold">Mobile:</span> {basicDetails.mobileNumber}
        </p>
        {/* <p className="text-gray-600 mb-2">
          <span className="font-semibold">GTM ID:</span> {analyticsDetails.gtmId}
        </p>
        <p className="text-gray-600 mb-2">
          <span className="font-semibold">FB Pixel ID:</span> {analyticsDetails.fbPixelId}
        </p> */}
        <p className="text-gray-500 text-sm mt-4">Website ID: {_id}</p>
      </div>
    </div>
  );
}
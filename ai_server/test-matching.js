// Test script for Food Matching Agent
// Run with: node ai_server/test-matching.js

const testListing = {
  id: "test-123",
  title: "Fresh Bread Loaves",
  food_type: "bakery",
  quantity: "10 loaves",
  expiry_date: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
  location: "Downtown Bakery, 123 Main St",
  dietary_tags: ["Vegetarian"],
  description: "Freshly baked sourdough bread",
};

const testRecipients = [
  {
    id: "recipient-1",
    name: "Community Food Bank",
    role: "recipient",
    location: "Downtown, 456 Oak Ave",
  },
  {
    id: "recipient-2",
    name: "Homeless Shelter",
    role: "recipient",
    location: "Uptown, 789 Elm St",
  },
  {
    id: "recipient-3",
    name: "Senior Center",
    role: "recipient",
    location: "Downtown, 321 Pine Rd",
  },
];

async function testMatching() {
  try {
    console.log("🧪 Testing Food Matching Agent...\n");

    const response = await fetch("http://localhost:3001/api/match/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        listing: testListing,
        recipients: testRecipients,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log("✅ Success!\n");
    console.log("Recommendations:");
    console.log(JSON.stringify(data.recommendations, null, 2));
    console.log("\nRaw AI Response:");
    console.log(data.rawResponse);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testMatching();

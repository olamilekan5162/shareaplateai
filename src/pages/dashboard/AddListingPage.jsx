import { PageHeader } from "../../components/PageHeader";
import { Card, CardContent } from "../../components/Card";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListings } from "../../hooks/useListings";
import { supabase } from "../../lib/supabase";
import { FiUpload, FiX } from "react-icons/fi";
import { getLocationOptions, LOCATION_HINT } from "../../constants/locations";

export function AddListingPage() {
  const navigate = useNavigate();
  const { createListing } = useListings();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    food_type: "produce",
    quantity: "",
    expiry_date: "",
    location: "",
    description: "",
    dietary_tags: [],
  });

  // async function testing(prompt) {
  //   const res = await fetch("http://localhost:3001/generate", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ prompt }),
  //   });

  //   const data = await res.json();
  //   console.log(data);
  //   return data.text;
  // }

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    setUploading(true);
    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Math.random()
        .toString(36)
        .substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `food-listings/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("food-images")
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("food-images")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error("Upload error:", err);
      throw new Error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleTagToggle = (tag) => {
    setFormData((prev) => ({
      ...prev,
      dietary_tags: prev.dietary_tags.includes(tag)
        ? prev.dietary_tags.filter((t) => t !== tag)
        : [...prev.dietary_tags, tag],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Upload image first if provided
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const { data, error: submitError } = await createListing({
        title: formData.title,
        food_type: formData.food_type,
        quantity: formData.quantity,
        expiry_date: formData.expiry_date,
        location: formData.location,
        description: formData.description,
        dietary_tags: formData.dietary_tags,
        image_url: imageUrl,
        status: "available",
      });

      if (submitError) throw new Error(submitError);

      // ============================================
      // AUTONOMOUS AI MATCHING
      // ============================================
      if (data) {
        setSuccess(
          "✅ Listing posted successfully! AI is finding the best recipients..."
        );

        // Trigger AI matching in background
        const { data: recipients } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "recipient")
          .limit(10);

        if (recipients && recipients.length > 0) {
          try {
            const response = await fetch(
              `${
                import.meta.env.VITE_AI_SERVER_URL || "http://localhost:3001"
              }/api/match/recommend`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listing: data, recipients }),
              }
            );

            const result = await response.json();

            if (result.success && result.notifiedCount > 0) {
              setSuccess(
                `✅ Success! ${result.notifiedCount} recipients have been notified about your donation.`
              );
            } else {
              setSuccess("✅ Listing posted! AI matching complete.");
            }
          } catch (aiError) {
            console.error("AI matching error:", aiError);
            setSuccess("✅ Listing posted successfully!");
          }
        } else {
          setSuccess("✅ Listing posted successfully!");
        }

        // Redirect after showing success message
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    } catch (err) {
      setError(err.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  const dietaryOptions = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Dairy-Free",
    "Halal",
    "Kosher",
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="List Surplus Food"
        description="Share your food with the community."
      />

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="title"
              label="Food Item Name"
              placeholder="e.g., Sourdough Bread Loaves"
              value={formData.title}
              onChange={handleChange}
              required
            />

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Food Image (Optional)
              </label>

              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUpload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                id="food_type"
                label="Category"
                value={formData.food_type}
                onChange={handleChange}
                options={[
                  { value: "produce", label: "Fresh Produce" },
                  { value: "bakery", label: "Bakery" },
                  { value: "meals", label: "Prepared Meals" },
                  { value: "canned", label: "Canned Goods" },
                  { value: "dairy", label: "Dairy Products" },
                  { value: "other", label: "Other" },
                ]}
              />
              <Input
                id="quantity"
                label="Quantity"
                placeholder="e.g. 5 loaves"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="expiry_date"
                label="Expiry Date & Time"
                type="datetime-local"
                value={formData.expiry_date}
                onChange={handleChange}
                required
              />
              <div>
                <Select
                  id="location"
                  label="Pickup Location"
                  value={formData.location}
                  onChange={handleChange}
                  options={[
                    { value: "", label: "Select location" },
                    ...getLocationOptions(),
                  ]}
                  required
                />
                <p className="mt-1 text-xs text-neutral-muted">
                  {LOCATION_HINT}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Dietary Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      formData.dietary_tags.includes(tag)
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-neutral-text mb-1.5"
              >
                Description
              </label>
              <textarea
                id="description"
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary min-h-[100px]"
                placeholder="Any additional details about the food..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                {success}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                disabled={loading || uploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || uploading}
              >
                {uploading
                  ? "Uploading image..."
                  : loading
                  ? "Posting..."
                  : "Post Listing"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

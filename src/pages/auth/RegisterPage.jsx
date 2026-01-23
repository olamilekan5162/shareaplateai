import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../../components/Logo";
import { getLocationOptions, LOCATION_HINT } from "../../constants/locations";

export function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "donor",
    location: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const result = await register(
        formData.email,
        formData.password,
        formData.name,
        formData.role,
        formData.location
      );

      if (result) {
        // Check if email confirmation is required
        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setSuccess(
          "Please check your email to confirm your account before signing in."
        );
      }
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-neutral-text">
          Create your account
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              id="name"
              label="Organization / Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              id="email"
              label="Email address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Select
              id="role"
              label="I want to..."
              value={formData.role}
              onChange={handleChange}
              options={[
                { value: "donor", label: "Donate Food" },
                { value: "recipient", label: "Receive Food" },
                { value: "volunteer", label: "Volunteer for Pickups" },
              ]}
            />
            <div>
              <Select
                id="location"
                label="Location"
                value={formData.location}
                onChange={handleChange}
                options={[
                  { value: "", label: "Select your location" },
                  ...getLocationOptions(),
                ]}
                required
              />
              <p className="mt-1 text-xs text-neutral-muted">{LOCATION_HINT}</p>
            </div>
            <Input
              id="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6">
            <Link
              to="/login"
              className="text-primary hover:text-primary-dark font-medium text-sm flex justify-center"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

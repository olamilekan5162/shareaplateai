import { Button } from "../components/Button";
import { Card, CardContent } from "../components/Card";
import { Link } from "react-router-dom";
import { FiHeart, FiMapPin, FiTruck } from "react-icons/fi";

export function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-white py-20 lg:py-32 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-primary bg-primary/10 mb-8 animate-fade-in">
            <span>Fighting Hunger with Technology 🚀</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-neutral-text tracking-tight mb-6 leading-tight">
            Share Food, <br className="hidden md:block" />
            <span className="text-primary">Save the Planet</span>
          </h1>
          <p className="text-xl text-neutral-muted mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect with your local community to reduce food waste and help
            those in need. Join the movement to bridge the gap between abundance
            and need.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button
                size="lg"
                className="w-full sm:w-auto text-lg px-8 py-4 shadow-lg shadow-primary/20"
              >
                Start Sharing
              </Button>
            </Link>
            <Link to="/#how-it-works">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-lg px-8 py-4"
              >
                How it Works
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary/5 border-y border-primary/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-primary">2,500+</p>
              <p className="text-neutral-muted mt-1">Meals Shared</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">1,200kg</p>
              <p className="text-neutral-muted mt-1">CO₂ Prevented</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">850+</p>
              <p className="text-neutral-muted mt-1">Active Users</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-text">
              How ShareAplate Works
            </h2>
            <p className="text-neutral-muted mt-4 max-w-2xl mx-auto">
              We make it simple to donate surplus food or find meals for those
              in need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              icon={FiHeart}
              title="1. List Food"
              description="Donors list surplus food with details (quantity, expiry, location)."
            />
            <StepCard
              icon={FiMapPin}
              title="2. Connect"
              description="Recipients find available food nearby and claim it instantly."
            />
            <StepCard
              icon={FiTruck}
              title="3. Pickup"
              description="Coordinate pickup and enjoy. No waste, just shared goodness."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-neutral-900 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to make a difference?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join thousands of others making an impact in their community today.
          </p>
          <Link to="/register">
            <Button
              variant="primary"
              size="lg"
              className="bg-white text-neutral-900 hover:bg-gray-100"
            >
              Join Now - It's Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function StepCard({ icon: Icon, title, description }) {
  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="flex flex-col items-center text-center p-8">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
          <Icon size={32} />
        </div>
        <h3 className="text-xl font-bold text-neutral-text mb-3">{title}</h3>
        <p className="text-neutral-muted leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

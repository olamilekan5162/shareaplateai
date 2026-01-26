import { Card, CardContent, CardFooter } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { FiClock, FiMapPin, FiArchive } from "react-icons/fi";

export function ListingCard({
  listing,
  isDonor = false,
  onAction,
  actionDisabled = false,
  actionLabel,
}) {
  const { title, quantity, distance, expiry, tags, location, image_url } =
    listing;

  const defaultLabel = isDonor ? "Manage Listing" : "Claim Food";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
        {image_url ? (
          <img
            src={image_url}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <FiArchive size={48} />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          {tags?.map((tag) => (
            <Badge key={tag} variant="success" className="shadow-sm">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg text-neutral-text mb-1">{title}</h3>
        <p className="text-sm text-neutral-muted flex items-center gap-1 mb-3">
          <FiMapPin size={14} /> {location} {distance && `• ${distance}`}
        </p>

        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-1 text-neutral-text font-medium">
            <FiArchive className="text-primary" size={14} />
            {quantity} available
          </div>
          <div className="flex items-center gap-1 text-orange-600 font-medium">
            <FiClock size={14} />
            Expires {expiry}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-transparent border-t border-gray-100">
        <Button
          variant={isDonor ? "outline" : "primary"}
          className="w-full"
          onClick={() => onAction?.(listing)}
          disabled={actionDisabled}
        >
          {actionLabel || defaultLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}

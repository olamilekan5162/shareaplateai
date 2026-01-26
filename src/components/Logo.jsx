import { FiHexagon } from "react-icons/fi";
import { cn } from "../lib/utils";
import { Link } from "react-router-dom";

export function Logo({ className }) {
  return (
    <Link
      to="/"
      className={cn(
        "flex items-center gap-2 font-bold text-xl tracking-tight text-primary-dark",
        className
      )}
    >
      <FiHexagon className="h-8 w-8 fill-primary/20 text-primary" />
      <span>ShareAplate AI</span>
    </Link>
  );
}

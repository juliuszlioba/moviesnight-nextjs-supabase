import { notFound } from "next/navigation";

// There is no per-mediatype listing page (yet). Any single-segment path that
// doesn't match a real route (e.g. /movie, /foo) is a 404 instead of an empty page.
export default function MediatypePage() {
  notFound();
}

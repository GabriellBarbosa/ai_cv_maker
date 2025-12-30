export const mapServerErrorToFriendlyMessage = (message: string) => {
  const normalized = message.toLowerCase();

  if (normalized.includes("too short") || normalized.includes("minimum")) {
    return "The texts seem too short. Please add more context so we can personalize it better.";
  }

  if (normalized.includes("timeout")) {
    return "The generation timed out. The server took too long to respond. Please try again.";
  }

  if (normalized.includes("rate limit")) {
    return "Too many requests were made in a short period. Please wait a moment and try again.";
  }

  if (normalized.includes("unauthorized") || normalized.includes("forbidden")) {
    return "Your session has expired. Please refresh the page and try again.";
  }

  return (
    message ||
    "We couldn't generate the content right now. Please check your inputs or try again later."
  );
};

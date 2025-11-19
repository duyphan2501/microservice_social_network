function formatRelativeTime(dateInput, isLastActive = false) {
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return isLastActive ? "1 minute ago" : "Just now";
  if (diffMin < 2) return `${diffMin} minute ago`;
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHour < 24) return `${diffHour} hours ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} weeks ago`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} months ago`;
  return `${Math.floor(diffDay / 365)} years ago`;
}

export { formatRelativeTime };

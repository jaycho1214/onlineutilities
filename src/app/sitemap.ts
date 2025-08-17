import { MetadataRoute } from "next";
import { baseUrl, utilities } from "@/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
  ];

  // Dynamic utility pages
  const utilityPages = utilities.map((utility) => ({
    url: `${baseUrl}${utility.href}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Category pages (future implementation)
  const categories = [
    ...new Set(utilities.map((u) => u.category).filter(Boolean)),
  ];
  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/category/${category?.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...utilityPages, ...categoryPages];
}

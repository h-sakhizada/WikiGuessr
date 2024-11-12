"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const Breadcrumb = () => {
  const pathname = usePathname();

  const generateBreadcrumbs = () => {
    // Remove trailing slash and split path into segments
    const segments = pathname
      .replace(/\/$/, "")
      .split("/")
      .filter((segment) => segment !== "");

    // Generate array of breadcrumb items with paths
    return segments.map((segment, index) => {
      // Build the path for this breadcrumb
      const path = `/${segments.slice(0, index + 1).join("/")}`;

      // Convert kebab-case or snake_case to Title Case
      const label = segment
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

      return {
        label,
        path,
      };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="flex items-center space-x-2 text-primary rounded-lg shadow-sm  mb-4">
      <Link href="/" className="transition-colors flex items-center">
        <Home size={18} />
      </Link>

      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb.path}>
          <ChevronRight className="text-gray-400" size={16} />
          <Link
            href={breadcrumb.path}
            className={`${
              index === breadcrumbs.length - 1
                ? "text-purple-400 font-medium"
                : ""
            } transition-colors`}
          >
            {breadcrumb.label}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;

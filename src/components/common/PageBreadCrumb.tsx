import { Link } from "react-router";
import React from "react";

// Definisikan tipe untuk link perantara
interface BreadcrumbItem {
  label: string;
  to: string;
}

interface BreadcrumbProps {
  pageTitle?: string;
  pageCrumb?: string;
  items?: BreadcrumbItem[]; // Properti opsional untuk jenjang perantara
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle, pageCrumb, items = [] }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      {pageTitle && (
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {pageTitle}
        </h2>
      )}
      <nav>
        <ol className="flex items-center gap-1.5">
          {/* Selalu tampilkan Home di awal */}
          <li>
            <Link
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700"
              to="/"
            >
              Home
              <ChevronIcon />
            </Link>
          </li>

          {/* Looping untuk item perantara (seperti Employee List) */}
          {items.map((item, index) => (
            <li key={index}>
              <Link
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700"
                to={item.to}
              >
                {item.label}
                <ChevronIcon />
              </Link>
            </li>
          ))}

          {/* Halaman Aktif saat ini (tanpa Link) */}
          <li className="text-sm text-gray-800 dark:text-white/90 font-medium">
            {pageCrumb}
          </li>
        </ol>
      </nav>
    </div>
  );
};

// Komponen SVG dipisah agar kode lebih bersih
const ChevronIcon = () => (
  <svg
    className="stroke-current"
    width="17"
    height="16"
    viewBox="0 0 17 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default PageBreadcrumb;
import React from "react";
import { SearchX } from "lucide-react";

const NoDataFound = ({
  title = "No Data Found",
  message = "Try adjusting your search or filter criteria to find what you're looking for.",
  icon: Icon = SearchX,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {/* Icon Circle */}
      <div className="relative mb-6">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-orange-100 blur-xl opacity-60 scale-125" />
        {/* Icon container */}
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 flex items-center justify-center shadow-md">
          <Icon className="w-9 h-9 text-orange-400" strokeWidth={1.5} />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-700 mb-2 tracking-tight">
        {title}
      </h3>

      {/* Message */}
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
        {message}
      </p>

      {/* Decorative dots */}
      <div className="flex gap-1.5 mt-6">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-200" />
        <span className="w-1.5 h-1.5 rounded-full bg-orange-300" />
        <span className="w-1.5 h-1.5 rounded-full bg-orange-200" />
      </div>
    </div>
  );
};

export default NoDataFound;

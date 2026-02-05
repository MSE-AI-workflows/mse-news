import React from 'react';

// NCSU Logo - simplified block logo placeholder
export function NCSU_LOGO_SVG() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" fill="white" fillOpacity="0.2" rx="4" />
      <text
        x="20"
        y="26"
        fontSize="16"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
      >
        NC
      </text>
    </svg>
  );
}

export const FACULTIES = ['All Faculty', 'Materials Science', 'Engineering', 'Research'];


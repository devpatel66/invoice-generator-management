"use client";

export default function Footer() {
  return (
      <footer className="bg-pirate-oceanBlue">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <p className="text-center text-base leading-5 text-pirate-parchment">
              The Will of D. Lives On
            </p>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-base leading-5 text-pirate-parchment">
              &copy; 2025 Bill D. Invoice. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
  );
}
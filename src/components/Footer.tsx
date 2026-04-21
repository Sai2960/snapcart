"use client";
import React from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

// Inline SVGs for social icons (lucide-react doesn't have Facebook/Instagram/Twitter)
const FacebookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 hover:text-white transition"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 hover:text-white transition"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

const TwitterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 hover:text-white transition"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

function Footer() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-linear-to-r from-green-600 to-green-700 text-white mt-20"
    >
      <div className="w-[90%] md:w-[80%] mx-auto py-10 grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-green-500/40">
        <div>
          <h2 className="text-2xl font-bold mb-3">Snapcart</h2>
          <p className="text-sm text-green-100 leading-relaxed">
            Your one-stop online grocery store delivering freshness to your
            doorstep. Shop smart, eat fresh, and save more every day!
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Quick Links</h2>
          <ul className="space-y-2 text-green-100 text-sm">
            <li>
              <Link href="/" className="hover:text-white transition">
                Home
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-white transition">
                Cart
              </Link>
            </li>
            <li>
              <Link href="/my-orders" className="hover:text-white transition">
                My Orders
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
          <ul className="space-y-2 text-green-100 text-sm">
            <li className="flex items-center gap-2">
              <MapPin size={16} /> Mumbai, India
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} /> +91 0000000000
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} /> support@snapcart.in
            </li>
          </ul>

          {/* 🌐 Social Links */}
          <div className="flex gap-4 mt-4 text-green-100">
            <Link href="https://facebook.com" target="_blank">
              <FacebookIcon />
            </Link>
            <Link href="https://instagram.com" target="_blank">
              <InstagramIcon />
            </Link>
            <Link href="https://twitter.com" target="_blank">
              <TwitterIcon />
            </Link>
          </div>
        </div>
      </div>
      <div className="text-center py-4 text-sm text-green-100 bg-green-800/40">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold">Snapcart</span>. All rights reserved.
      </div>
    </motion.div>
  );
}

export default Footer;

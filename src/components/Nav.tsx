"use client";
import {
  Search,
  ShoppingCartIcon,
  Package,
  LogOut,
  X,
  Boxes,
  ClipboardCheck,
  PlusCircle,
  Menu,
  User,
} from "lucide-react";
import Link from "next/link";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { signOut } from "next-auth/react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";  

interface IUser {
  _id?: string
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role: "user" | "deliveryBoy" | "admin";
  image?: string;
}

function Nav({ user }: { user: IUser }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const profileDropDown = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartData } = useSelector((state: RootState) => state.cart);
  const [search, setSearch] = useState("");
  const router = useRouter();
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileDropDown.current &&
        !profileDropDown.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const query = search.trim();
    if (!query) {
      return router.push("/");
    }
    router.push(`/?q=${encodeURIComponent(query)}`);
    setSearch("");
    setSearchOpen(false);
  };
  const sideBar = menuOpen
    ? createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100 }}
            transition={{ type: "spring", stiffness: 100, damping: 14 }}
            className="fixed top-0 left-0 h-full w-[75%] sm:w-[60%] z-[9999]
                bg-linear-to-b from-green-800/90 via-green-700/80 to-green-900/90
                backdrop-blur-xl border-r border-green-400/20
                shadow-[0_0_50px_-10px_rgba(0,255,100,0.3)]
                flex flex-col p-6 text-white"
          >
            <div className="flex justify-between items-center mb-2">
              <h1 className="font-extrabold text-2xl tracking-wide text-white/90">
                Admin Panel
              </h1>
              <button
                className="text-white/80 hover:text-red-400 text-2xl font-bold transition"
                onClick={() => setMenuOpen(false)}
              >
                <X />
              </button>
            </div>

            <div
              className="flex items-center gap-3 p-3 mt-3 rounded-xl bg-white/10 hover:bg-white/15
transition-all shadow-inner"
            >
              <div
                className="relative w-12 h-12 rounded-full overflow-hidden border-2
    border-green-400/60 shadow-lg"
              >
                {" "}
                {user.image ? (
                  <Image
                    src={user.image}
                    alt="user"
                    fill
                    className="object-cover rounded-full"
                  />
                ) : (
                  <User />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {user.name}
                </h2>
                <p className="text-xs text-green-200 capitalize tracking-wide">
                  {user.role}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 font-medium mt-6">
              <Link
                href={"/admin/add-grocery"}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/10
    hover:bg-white/20 hover:pl-4 transition-all"
              >
                <PlusCircle className="w-5 h-5" /> Add Grocery
              </Link>
              <Link
                href={"/admin/view-grocery"}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/10
    hover:bg-white/20 hover:pl-4 transition-all"
              >
                <Boxes className="w-5 h-5" /> View Grocery
              </Link>
              <Link
                href={"/admin/manage-orders"}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/10
    hover:bg-white/20 hover:pl-4 transition-all"
              >
                <ClipboardCheck className="w-5 h-5" />
                Manage Orders
              </Link>
            </div>

            <div className="my-5 border-t border-white/20"></div>
            <div
              className="flex items-center gap-3 text-red-300 font-semibold mt-auto hover:bg-red-500/20 p-3
rounded-lg transition-all"
              onClick={async () => await signOut({ callbackUrl: "/" })}
            >
              <LogOut className="w-5 h-5 text-red-300" />
              Logout
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body,
      )
    : null;

  const avatarColors = [
    "bg-orange-500",
    "bg-pink-500",
    "bg-blue-500",
    "bg-purple-500",
  ];
  const avatarColor =
    avatarColors[user.name?.charCodeAt(0) % avatarColors.length];

  return (
    <div className="w-[95%] fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
      {sideBar}
      {/* Main Navbar */}
      <div className="bg-linear-to-r from-green-500 to-green-700 rounded-2xl shadow-lg shadow-black/30 flex justify-between items-center h-20 px-4 md:px-8">
        <Link
          href={"/"}
          className="text-white font-extrabold text-2xl sm:text-3xl tracking-wide hover:scale-105 transition-transform"
        >
          Snapcart
        </Link>
        {user.role == "user" && (
          <form
            className="hidden md:flex items-center bg-white rounded-full px-4 py-2 w-1/2 max-w-lg shadow-md"
            onSubmit={handleSearch}
          >
            <Search className="text-gray-500 w-5 h-5 mr-2" />
            <input
              type="text"
              placeholder="Search groceries..."
              className="w-full outline-none text-gray-700 placeholder-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        )}

        <div className="flex items-center gap-3 md:gap-6">
          {user.role == "user" && (
            <>
              {" "}
              {/* Mobile Search Toggle Button */}
              <button
                className="md:hidden bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-md hover:scale-105 transition"
                onClick={() => setSearchOpen((prev) => !prev)}
              >
                <Search className="text-green-600 w-5 h-5" />
              </button>
              {/* Cart */}
              <Link
                href={"/user/cart"}
                className="relative bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-md hover:scale-105 transition"
              >
                <ShoppingCartIcon className="text-green-600 w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-semibold shadow">
                  {cartData.length}
                </span>
              </Link>
            </>
          )}
          {user.role == "admin" && (
            <>
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href={"/admin/add-grocery"}
                  className="flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-full hover:bg-green-100 transition-all"
                >
                  <PlusCircle className="w-5 h-5" /> Add Grocery
                </Link>
                <Link
                  href={"/admin/view-grocery"}
                  className="flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-full hover:bg-green-100 transition-all"
                >
                  <Boxes className="w-5 h-5" /> View Grocery
                </Link>
                <Link
                  href={"/admin/manage-orders"}
                  className="flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-full hover:bg-green-100 transition-all"
                >
                  <ClipboardCheck className="w-5 h-5" /> Manage Orders
                </Link>
              </div>

              <div
                className="md:hidden bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md cursor-pointer"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <Menu className="text-green-600 w-6 h-6" />
              </div>
            </>
          )}

          {/* Avatar + Dropdown */}
          <div className="relative" ref={profileDropDown}>
            <div
              className="bg-white rounded-full w-11 h-11 flex items-center justify-center overflow-hidden shadow-md hover:scale-105 transition-transform cursor-pointer"
              onClick={() => setOpen((prev) => !prev)}
            >
              {user.image ? (
                <Image
                  src={user.image}
                  alt="user"
                  fill
                  className="object-cover rounded-full"
                />
              ) : (
                <span
                  className={`text-white font-bold text-lg ${avatarColor} w-full h-full flex items-center justify-center rounded-full`}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 z-[999]"
                >
                  {/* User Info */}
                  <div className="flex items-center gap-3 px-3 py-2 border-b border-gray-100">
                    <div
                      className={`w-10 h-10 relative rounded-full ${avatarColor} flex items-center justify-center overflow-hidden`}
                    >
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt="user"
                          fill
                          className="object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-white font-bold text-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-gray-800 font-semibold">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {user.role}
                      </div>
                    </div>
                  </div>

                  {user.role == "user" && (
                    <Link
                      href={"/user/my-orders"}
                      className="flex items-center gap-2 px-3 py-3 hover:bg-green-50 rounded-lg text-gray-700 font-medium"
                      onClick={() => setOpen(false)}
                    >
                      <Package className="w-5 h-5 text-green-600" />
                      My Orders
                    </Link>
                  )}

                  {/* Log Out */}
                  <button
                    className="flex items-center gap-2 w-full text-left px-3 py-3 hover:bg-red-50 rounded-lg text-gray-700 font-medium"
                    onClick={() => {
                      setOpen(false);
                      signOut({ callbackUrl: "/login" });
                    }}
                  >
                    <LogOut className="w-5 h-5 text-red-600" />
                    Log Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar — slides in below navbar with X inside */}
      <AnimatePresence>
        {searchOpen && (
          <motion.form
            ref={searchRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="md:hidden flex items-center bg-white rounded-2xl px-4 py-3 shadow-lg shadow-black/20"
          >
            <Search className="text-gray-500 w-5 h-5 mr-2" />
            <form className="grow" onSubmit={handleSearch}>
              <input
                type="text"
                className="w-full outline-none text-gray-700"
                placeholder="search groceries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
            <button onClick={() => setSearchOpen(false)}>
              <X className="text-gray-500 w-5 h-5" />
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Nav;

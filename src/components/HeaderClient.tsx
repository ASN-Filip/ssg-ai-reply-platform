"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function HeaderClient() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const menu = menuRef.current;
    const button = buttonRef.current;

    const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => (menu ? Array.from(menu.querySelectorAll<HTMLElement>(focusableSelector)) : []);

    const focusable = getFocusable();
    if (focusable.length > 0) focusable[0].focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }

      if (e.key === "Tab") {
        const els = getFocusable();
        if (els.length === 0) {
          e.preventDefault();
          return;
        }
        const first = els[0];
        const last = els[els.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (!menu || !button) return;
      if (!menu.contains(target) && !button.contains(target)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [open]);

  const [siteMap, setSiteMap] = useState<Array<{ path: string; label: string }>>([])

  useEffect(() => {
    let mounted = true
    fetch('/api/site-map')
      .then(r => r.json())
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return
        // Filter out dynamic routes (app router does not allow dynamic href like /products/[id])
        const filtered = data.filter((i: { path: string }) => !i.path.includes('[') && !i.path.includes(':'))
        setSiteMap(filtered)
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!open && buttonRef.current) buttonRef.current.focus();
  }, [open]);

  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }, [open]);

  return (
    <header className="w-full bg-white shadow-sm border-b">
      <nav className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Left: logo */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center" data-discover="true">
            <Image src="/assets/images/logo-samsung.svg" alt="Samsung Logo" width={140} height={28} className="h-5 md:h-6" />
          </Link>
        </div>

        {/* Center: desktop nav (dynamic) */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          {siteMap.length === 0 ? (
            <>
              <Link href="/" className="text-sm font-medium text-gray-700 hover:text-black">Home</Link>
              <Link href="/reviews" className="text-sm font-medium text-gray-700 hover:text-black">Reviews</Link>
              <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-black">Products</Link>
            </>
          ) : (
            siteMap.map(item => (
              <Link key={item.path} href={item.path} className="text-sm font-medium text-gray-700 hover:text-black">{item.label}</Link>
            ))
          )}
        </div>

        {/* Right: search & actions */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <label htmlFor="site-search" className="sr-only">Search</label>
            <input id="site-search" className="border rounded-md px-3 py-1 text-sm" placeholder="Search" />
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <button aria-label="Notifications" className="text-gray-600 hover:text-black">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 1.99-.9 1.99-2H10c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 10-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
            </button>
            <button aria-label="Account" className="text-gray-600 hover:text-black">Account</button>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <button
              ref={buttonRef}
              type="button"
              className="text-gray-700 focus:outline-none"
              aria-controls="mobile-menu"
              onClick={() => setOpen((s) => !s)}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu panel */}
      <div className={`md:hidden bg-white border-t ${open ? 'block' : 'hidden'}`}>
        <ul id="mobile-menu" ref={menuRef} className="flex flex-col space-y-1 px-4 py-3">
          {siteMap.length === 0 ? (
            <>
              <li><Link href="/" className="block px-2 py-2 text-gray-700">Home</Link></li>
              <li><Link href="/reviews" className="block px-2 py-2 text-gray-700">Reviews</Link></li>
              <li><Link href="/products" className="block px-2 py-2 text-gray-700">Products</Link></li>
              <li><Link href="/admin/users" className="block px-2 py-2 text-gray-700">Users</Link></li>
              <li><Link href="/admin/categories" className="block px-2 py-2 text-gray-700">Categories</Link></li>
            </>
          ) : (
            siteMap.map(item => (
              <li key={item.path}><Link href={item.path} className="block px-2 py-2 text-gray-700">{item.label}</Link></li>
            ))
          )}
        </ul>
      </div>
    </header>
  );
}

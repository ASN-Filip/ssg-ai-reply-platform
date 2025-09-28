"use client";

import React, { useEffect, useRef, useState } from "react";
// (previously imported usePathname here; removed as it's unused)
import type { Session } from 'next-auth'

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from 'next-auth/react'

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

  const { status, data: session } = useSession()
  const [adminOpen, setAdminOpen] = useState(false)
  const adminButtonRef = useRef<HTMLButtonElement | null>(null)
  const adminMenuRef = useRef<HTMLDivElement | null>(null)

  const Profile: React.FC<{ session: Session | null }> = ({ session }) => {
    const [dbUser, setDbUser] = useState<{ id: string; name?: string | null; email?: string | null; role?: string | null; image?: string | null } | null>(null)

    useEffect(() => {
      let mounted = true
      fetch('/api/users/me')
        .then(r => r.json())
        .then(data => {
          if (!mounted) return
          if (data?.user) setDbUser(data.user)
        })
        .catch(() => {})
      return () => { mounted = false }
    }, [])

    if (!session) return <></>
    const name = dbUser?.name ?? session.user?.name ?? session.user?.email ?? 'User'
    const role = dbUser?.role ?? session.user?.role ?? ''
    const image = dbUser?.image ?? session.user?.image ?? undefined

    return (
      <div className="flex items-center space-x-3">
        {image ? (
          <Image src={image} alt={name} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-600">{(name || 'U').charAt(0)}</div>
        )}
        <div className="text-sm text-gray-700">{name}</div>
        {role && <div className="text-xs text-gray-500">{role}</div>}
        <button onClick={() => signOut({ callbackUrl: '/signin' })} className="text-sm text-blue-600">Sign out</button>
      </div>
    )
  }

  // close admin dropdown on outside click / Escape
  useEffect(() => {
    if (!adminOpen) return
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node
      if (!adminMenuRef.current || !adminButtonRef.current) return
      if (!adminMenuRef.current.contains(t) && !adminButtonRef.current.contains(t)) {
        setAdminOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setAdminOpen(false)
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [adminOpen])

  // no runtime header guard needed now — layout was fixed to avoid duplicates

  // Read session at top-level so we can show role-based navigation
  if (status !== 'authenticated') return null

  

  const isAdmin = !!session?.user?.role && session.user.role === 'admin'
  
  // shared nav item type and builder so desktop and mobile stay in sync
  type NavItem = { path: string; label: string; admin?: boolean; icon?: React.ReactNode }

  const getNavItems = () => {
    const baseItems: NavItem[] = siteMap.length === 0 ? [
      { path: '/', label: 'Home' },
      { path: '/reviews', label: 'Reviews' },
      { path: '/products', label: 'Products' },
    ] : siteMap.map(i => ({ path: i.path, label: i.label }))

    const adminItems: NavItem[] = [
      { path: '/admin/users', label: 'Users', admin: true, icon: (
        <svg className="w-4 h-4 mr-2 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      ) },
      { path: '/admin/categories', label: 'Categories', admin: true, icon: (
        <svg className="w-4 h-4 mr-2 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>
      ) },
      { path: '/admin/locales', label: 'Locales', admin: true, icon: (
        <svg className="w-4 h-4 mr-2 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a7.5 7.5 0 0 0 0-6"/></svg>
      ) },
    ]
    return { baseItems, adminItems }
  }

  return (
    <header className="w-full bg-white shadow-sm border-b">
      <nav className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Left: logo */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center" data-discover="true">
            <Image src="/assets/images/logo-samsung.svg" alt="Samsung Logo" width={140} height={28} className="h-5 md:h-6 w-auto" />
          </Link>
        </div>

        {/* Center: desktop nav (dynamic) */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          {
            // build unified navItems: either use siteMap (if available) or defaults
          }
          {
            (() => {
              const { baseItems, adminItems } = getNavItems()
              const inline = baseItems
              const adminOnly = isAdmin ? adminItems : []

              return (
                <>
                  {inline.map(i => (
                    <Link key={i.path} href={i.path} className="text-sm font-medium text-gray-700 hover:text-black">{i.label}</Link>
                  ))}

                  {adminOnly.length > 0 && (
                    <div className="relative">
                      <button
                        ref={adminButtonRef}
                        onClick={() => setAdminOpen(v => !v)}
                        aria-haspopup="true"
                        aria-controls="admin-menu"
                        className="text-sm font-medium text-gray-700 hover:text-black flex items-center space-x-2"
                      >
                        <span>Admin</span>
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path d="M5.25 7.5l4.5 4.5 4.5-4.5"/></svg>
                      </button>

                      {adminOpen && (
                        <div id="admin-menu" ref={adminMenuRef} className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md py-2">
                          {adminOnly.map(i => (
                            <Link key={i.path} href={i.path} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              {i.icon ?? (
                                <svg className="w-4 h-4 mr-2 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h18"/><path d="M6 7v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7"/><path d="M9 3h6v4H9z"/></svg>
                              )}
                              {i.label}
                            </Link>
                          ))}
                          <div className="border-t mt-1" />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )
            })()
          }
        </div>

        {/* Right: search & actions */}
        <div className="flex items-center space-x-4">

          <div className="hidden md:flex items-center space-x-3">
            <button aria-label="Notifications" className="text-gray-600 hover:text-black">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 1.99-.9 1.99-2H10c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 10-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
            </button>
            <Profile session={session ?? null} />
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
          {
            // Build the same navItems used for desktop, but render as list items for mobile
            (() => {
              const { baseItems, adminItems } = getNavItems()

              return (
                <>
                  {baseItems.map(i => (
                    <li key={i.path}><Link href={i.path} className="block px-2 py-2 text-gray-700">{i.label}</Link></li>
                  ))}

                  {isAdmin && adminItems.length > 0 && (
                    <>
                      <li aria-hidden className="border-t my-2" />
                      {adminItems.map(i => (
                        <li key={i.path}>
                          <Link href={i.path} className="flex items-center px-2 py-2 text-gray-700">
                            {i.icon}
                            <span>{i.label}</span>
                          </Link>
                        </li>
                      ))}
                    </>
                  )}
                </>
              )
            })()
          }
        </ul>
      </div>
    </header>
  );
}

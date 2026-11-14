"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/lib/store";
import ConnectionBadge from "./ConnectionBadge";
import { IconClose, IconMenu } from "./Icons";

const HOME_FOR = { STUDENT: "/estudiante", ADMIN: "/admin" };

export default function Navbar() {
  const { role, setRole, user } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const switchRole = (next) => {
    setRole(next);
    setOpen(false);
    router.push(HOME_FOR[next]);
  };

  const links = [
    ["/", "Inicio"],
    [HOME_FOR[role], role === "ADMIN" ? "Panel de gestión" : "Mis solicitudes"],
  ];

  return (
    <header className="nav">
      <div className="container nav__inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand__mark" aria-hidden="true" />
          TrazaUni
        </Link>

        <button
          type="button"
          className="icon-btn nav__toggle"
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <IconClose /> : <IconMenu />}
        </button>

        <nav id="nav-menu" className={`nav__menu ${open ? "is-open" : ""}`} aria-label="Principal">
          <ul className="nav__links">
            {links.map(([href, label]) => (
              <li key={href}>
                <Link
                  href={href}
                  className={pathname === href ? "is-active" : ""}
                  aria-current={pathname === href ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav__tools">
            <ConnectionBadge />
            <div className="segmented" role="group" aria-label="Cambiar de perfil">
              <button type="button" aria-pressed={role === "STUDENT"} onClick={() => switchRole("STUDENT")}>
                Estudiante
              </button>
              <button type="button" aria-pressed={role === "ADMIN"} onClick={() => switchRole("ADMIN")}>
                Responsable
              </button>
            </div>
            <span className="nav__user" title={user.email}>
              <span className="avatar" aria-hidden="true">{user.name[0]}</span>
              {user.name}
            </span>
          </div>
        </nav>
      </div>
    </header>
  );
}

import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

export interface BottomNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

interface BottomNavProps {
  items: BottomNavItem[];
}

export function BottomNav({ items }: BottomNavProps) {
  return (
    <nav className="d-md-none border-top bg-white" aria-label="Mobile bottom navigation" style={{ position: 'sticky', bottom: 0, zIndex: 20 }}>
      <div className="container-fluid px-2 py-2">
        <div className="d-flex justify-content-around align-items-center">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `btn btn-link p-2 d-flex flex-column align-items-center text-decoration-none ${
                    isActive ? 'text-primary' : 'text-secondary'
                  }`
                }
              >
                <Icon size={18} />
                <span className="small mt-1">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

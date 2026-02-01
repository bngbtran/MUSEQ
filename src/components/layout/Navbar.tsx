import { NavLink } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/genre-detect", label: "Genre Detect" },
  { to: "/realtime", label: "Realtime EQ" },
]

export default function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full bg-[#050A16]/95 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-screen-2xl items-center px-6 text-white">
        <NavLink to="/" className="text-lg font-bold tracking-wide">
          MUSEQ
        </NavLink>

        <div className="absolute left-1/2 -translate-x-1/2">
          <NavigationMenu>
            <NavigationMenuList className="gap-10">
              {navItems.map(item => (
                <NavigationMenuItem key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "inline-flex h-9 items-center px-4 text-sm font-medium transition-all duration-200",
                        isActive
                          ? `
        text-lime-400
        drop-shadow-[0_0_12px_rgba(182,255,82,0.65)]
        drop-shadow-[0_0_24px_rgba(182,255,82,0.35)]
      `
                          : "text-white/80 hover:text-white"
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="ml-auto">
          <NavLink to="/create">
            <Button
              size="sm"
              className="
  bg-lime-400
  text-blue-950
  hover:bg-lime-300
  active:bg-[#A6EE42]
  shadow-[0_4px_20px_rgba(182,255,82,0.35)]
  transition-all
  duration-200
"
            >
              Create
            </Button>
          </NavLink>
        </div>
      </div>
    </header>
  )
}

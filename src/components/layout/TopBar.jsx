import { useState } from "react";
import { Search, ChevronDown, Bell, User as UserIcon, LogOut, Shield } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { logout } from "../../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";
const TopBar = ({ onOpenAuthModal, onOpenAlertsModal }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAppSelector((state) => state.auth);
  const isCustomer = Boolean(isAuthenticated && user && user.role === "CUSTOMER");
  const isStaff = Boolean(isAuthenticated && user && (user.role === "ADMINISTRATOR" || user.role === "STAFF"));
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("EN");
  return <div className="bg-surface border-b border-border text-xs text-foreground py-2 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {
    /* Left: Alert text in deep red */
  }
        <button
    onClick={onOpenAlertsModal}
    className="flex items-center gap-1.5 text-primary hover:text-primary-hover font-semibold transition cursor-pointer text-left"
  >
          <Bell size={13} className="text-primary animate-pulse" />
          <span>3 new alerts related to your trips</span>
        </button>

        {
    /* Right: Search, Language, Login */
  }
        <div className="flex items-center gap-3 md:gap-4">
          <ThemeToggle variant="ghost" />
          {
    /* Quick Search */
  }
          <div className="hidden sm:flex items-center relative">
            <input
    type="text"
    placeholder="Search flights, routes..."
    className="pl-3 pr-8 py-1 text-xs border border-border rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-36 lg:w-48 bg-background transition"
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        navigate(`/search?q=${e.target.value}`);
      }
    }}
  />
            <Search size={13} className="absolute right-2.5 text-muted pointer-events-none" />
          </div>

          {
    /* Language Selector */
  }
          <div className="relative">
            <button
    onClick={() => setLangMenuOpen(!langMenuOpen)}
    className="flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-surface-muted transition cursor-pointer text-foreground font-medium"
  >
              <span className="w-4 h-3 overflow-hidden rounded-xs inline-flex items-center justify-center">
                🇬🇧
              </span>
              <span>{selectedLang}</span>
              <ChevronDown size={12} className="text-muted" />
            </button>

            {langMenuOpen && <div className="absolute right-0 mt-1 w-28 bg-surface border border-border rounded-lg shadow-lg z-50 py-1 text-xs">
                <button
    onClick={() => {
      setSelectedLang("EN");
      setLangMenuOpen(false);
    }}
    className="w-full text-left px-3 py-1.5 hover:bg-surface-muted flex items-center gap-2"
  >
                  <span>🇬🇧</span> English
                </button>
                <button
    onClick={() => {
      setSelectedLang("HA");
      setLangMenuOpen(false);
    }}
    className="w-full text-left px-3 py-1.5 hover:bg-surface-muted flex items-center gap-2"
  >
                  <span>🇳🇬</span> Hausa
                </button>
                <button
    onClick={() => {
      setSelectedLang("YO");
      setLangMenuOpen(false);
    }}
    className="w-full text-left px-3 py-1.5 hover:bg-surface-muted flex items-center gap-2"
  >
                  <span>🇳🇬</span> Yoruba
                </button>
              </div>}
          </div>

          {
    /* User / Login Button */
  }
          {isCustomer && user ? <div className="relative">
              <button
    onClick={() => setUserMenuOpen(!userMenuOpen)}
    className="flex items-center gap-2 py-0.5 px-2 rounded-full hover:bg-surface-muted transition cursor-pointer border border-border"
  >
                <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="font-semibold text-foreground hidden md:inline truncate max-w-[120px]">
                  {user.name}
                </span>
                <ChevronDown size={12} className="text-muted" />
              </button>

              {userMenuOpen && <div className="absolute right-0 mt-1 w-48 bg-surface border border-border rounded-xl shadow-lg z-50 py-1.5 text-xs">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="text-muted text-[11px] truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Customer
                    </span>
                  </div>
                  <button
    onClick={() => {
      setUserMenuOpen(false);
      navigate("/my-trips");
    }}
    className="w-full text-left px-3 py-2 hover:bg-surface-muted flex items-center gap-2 text-foreground font-medium"
  >
                    <UserIcon size={14} className="text-muted" />
                    <span>My Trips</span>
                  </button>
                  <button
    onClick={() => {
      setUserMenuOpen(false);
      navigate("/manage-booking");
    }}
    className="w-full text-left px-3 py-2 hover:bg-surface-muted flex items-center gap-2 text-foreground font-medium"
  >
                    <UserIcon size={14} className="text-muted" />
                    <span>My Bookings</span>
                  </button>
                  <button
    onClick={() => {
      setUserMenuOpen(false);
      dispatch(logout());
    }}
    className="w-full text-left px-3 py-2 hover:bg-primary/10 text-red-600 flex items-center gap-2 font-medium border-t border-border mt-1"
  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>}
            </div> : isStaff && user ? <div className="flex items-center gap-2">
              <Link
    to="/admin"
    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-bold hover:bg-amber-100 transition"
  >
                <Shield size={12} className="text-amber-700" />
                <span>Ops: {user.name.split(" ")[0]}</span>
              </Link>
              <button
    onClick={() => dispatch(logout())}
    className="text-[11px] text-muted hover:text-red-600 underline cursor-pointer"
  >
                Sign Out
              </button>
            </div> : <button
    onClick={onOpenAuthModal}
    className="bg-primary hover:bg-primary-hover text-white px-3.5 py-1 rounded-md font-semibold text-xs transition duration-150 shadow-xs cursor-pointer"
  >
              Login
            </button>}
        </div>
      </div>
    </div>;
};
var stdin_default = TopBar;
export {
  TopBar,
  stdin_default as default
};

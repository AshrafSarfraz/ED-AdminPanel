// import { useNavigate, useLocation } from "react-router-dom";
// import { useState } from "react";
// import {
//   FaChartLine, FaBuilding, FaUsers, FaShoppingCart,
//   FaUndoAlt, FaBoxOpen, FaCodeBranch, FaTrophy,
//   FaCreditCard, FaDatabase, FaGlobe, FaList, FaBox, FaTag, FaCog
// } from "react-icons/fa";

// import logo from "../assets/Images/logo 6.png";

// export default function Navbar() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const me       = JSON.parse(localStorage.getItem("adminUser") || "{}");

//   const [masterOpen,  setMasterOpen]  = useState(
//     ["/countries", "/categories", "/items", "/Brands"].includes(location.pathname)
//   );
//   const [settingOpen, setSettingOpen] = useState(
//     ["/BiddingSettings"].includes(location.pathname)
//   );

//   const logout = () => {
//     localStorage.removeItem("adminToken");
//     localStorage.removeItem("adminUser");
//     navigate("/");
//   };

//   const navItems = [
//     { label: "Dashboard",        path: "/dashboard",     icon: <FaChartLine />,    roles: ["superadmin", "admin", "user"] },
//     { label: "Partner Requests", path: "/partners",      icon: <FaBoxOpen />,      roles: ["superadmin", "admin", "user"] },
//     { label: "Companies",        path: "/companies",     icon: <FaBuilding />,     roles: ["superadmin", "admin", "user"] },
//     { label: "Branch Requests",  path: "/branches",      icon: <FaCodeBranch />,   roles: ["superadmin", "admin", "user"] },
//     { label: "Orders",           path: "/AdminOrders",   icon: <FaShoppingCart />, roles: ["superadmin", "admin", "user"] },
//     { label: "Return Orders",    path: "/return-orders", icon: <FaUndoAlt />,      roles: ["superadmin", "admin", "user"] },
//     { label: "Bidding Results",  path: "/biddingList",   icon: <FaTrophy />,       roles: ["superadmin", "admin", "user"] },
//     { label: "Payments",         path: "/payments",      icon: <FaCreditCard />,   roles: ["superadmin", "admin", "user"] },
//     { label: "Admin Management", path: "/admins",        icon: <FaUsers />,        roles: ["superadmin", "admin"] },
//   ];

//   const masterItems = [
//     { label: "Countries",  path: "/countries",       icon: <FaGlobe /> },
//     { label: "Categories", path: "/categories",      icon: <FaList />  },
//     { label: "Brands",     path: "/Brands",          icon: <FaTag />   },
//     { label: "Items",      path: "/items",           icon: <FaBox />   },
//   ];

//   const settingItems = [
//     { label: "Bidding Settings", path: "/BiddingSettings", icon: <FaCog /> },
//     { label: "Commission Settings", path: "/CommissionSettings", icon: <FaCog /> },
//     { label: "Delivery Settings", path: "/DeliverySettings", icon: <FaCog /> },
    
//   ];

//   const masterActive  = masterItems.some(i => location.pathname === i.path);
//   const settingActive = settingItems.some(i => location.pathname === i.path);
//   const filtered      = navItems.filter(item => item.roles.includes(me.role));

//   const DropdownItem = ({ item }) => {
//     const active = location.pathname === item.path;
//     return (
//       <div
//         key={item.path}
//         onClick={() => navigate(item.path)}
//         className={`flex items-center h-6 rounded-md mb-1 cursor-pointer gap-3 px-3 transition-all duration-200
//           ${active ? "bg-brand-primary" : "hover:bg-brand-lighter"}`}
//       >
//         <span className={`text-[11px] shrink-0 ${active ? "text-brand-white" : "text-brand-gray"}`}>{item.icon}</span>
//         <span className={`text-[11px] font-medium whitespace-nowrap ${active ? "text-brand-white" : "text-brand-gray"}`}>{item.label}</span>
//       </div>
//     );
//   };

//   return (
//     <div className="fixed left-0 top-0 h-screen flex flex-col z-[100] bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white  shadow-[2px_0_12px_rgba(0,0,0,0.08)] w-[60px] md:w-[240px] transition-all duration-300">

//       {/* Logo */}
//       <div className="flex items-center justify-center md:justify-start gap-3 px-3 md:px-5 py-5 border-b border-brand-border mb-2">
//         <img src={logo} className="w-10 h-10 rounded-lg shrink-0" alt="logo" />
//         <span className="hidden md:block text-[13px] font-extrabold text-brand-dark tracking-wide whitespace-nowrap">
//           EL Distributor
//         </span>
//       </div>

//       {/* Nav Items */}
//       <nav className="flex-1 px-1 md:px-2 py-2 overflow-y-auto overflow-x-hidden">

//         {filtered.map(item => {
//           const active = location.pathname === item.path;
//           return (
//             <div
//               key={item.path}
//               title={item.label}
//               onClick={() => navigate(item.path)}
//               className={`flex items-center h-8 rounded-lg mb-1 cursor-pointer transition-all duration-200
//                 justify-center md:justify-start md:gap-[14px] md:px-4
//                 ${active ? "bg-brand-primary" : "hover:bg-brand-lighter"}`}
//             >
//               <span className={`text-[13px] shrink-0 ${active ? "text-brand-white" : "text-brand-gray"}`}>{item.icon}</span>
//               <span className={`hidden md:block text-[12px] font-medium whitespace-nowrap ${active ? "text-brand-white" : "text-brand-gray"}`}>
//                 {item.label}
//               </span>
//             </div>
//           );
//         })}

//         {/* Master Data */}
//         {["superadmin", "admin"].includes(me.role) && (
//           <div>
//             <div
//               title="Master Data"
//               onClick={() => setMasterOpen(p => !p)}
//               className={`flex items-center h-7 rounded-lg mb-1 cursor-pointer transition-all duration-200
//                 justify-center md:justify-start md:gap-[14px] md:px-4
//                 ${masterActive ? "bg-brand-primary" : "hover:bg-brand-lighter"}`}
//             >
//               <span className={`text-[13px] shrink-0 ${masterActive ? "text-brand-white" : "text-brand-gray"}`}><FaDatabase /></span>
//               <span className={`hidden md:flex flex-1 items-center justify-between text-[12px] font-medium whitespace-nowrap
//                 ${masterActive ? "text-brand-white" : "text-brand-gray"}`}>
//                 Master Data
//                 <span className={`text-[10px] mr-1 transition-transform duration-200 ${masterOpen ? "rotate-180" : ""}`}>▼</span>
//               </span>
//             </div>
//             {masterOpen && (
//               <div className="hidden md:block ml-4 border-l-2 border-brand-border pl-2 mb-1">
//                 {masterItems.map(item => <DropdownItem key={item.path} item={item} />)}
//               </div>
//             )}
//           </div>
//         )}

//         {/* Settings */}
//         {["superadmin", "admin"].includes(me.role) && (
//           <div>
//             <div
//               title="Settings"
//               onClick={() => setSettingOpen(p => !p)}
//               className={`flex items-center h-10 rounded-lg mb-1 cursor-pointer transition-all duration-200
//                 justify-center md:justify-start md:gap-[14px] md:px-4
//                 ${settingActive ? "bg-brand-primary" : "hover:bg-brand-lighter"}`}
//             >
//               <span className={`text-[15px] shrink-0 ${settingActive ? "text-brand-white" : "text-brand-gray"}`}><FaCog /></span>
//               <span className={`hidden md:flex flex-1 items-center justify-between text-[12px] font-medium whitespace-nowrap
//                 ${settingActive ? "text-brand-white" : "text-brand-gray"}`}>
//                 Settings
//                 <span className={`text-[10px] mr-1 transition-transform duration-200 ${settingOpen ? "rotate-180" : ""}`}>▼</span>
//               </span>
//             </div>
//             {settingOpen && (
//               <div className="hidden md:block ml-4 border-l-2 border-brand-border pl-2 mb-1">
//                 {settingItems.map(item => <DropdownItem key={item.path} item={item} />)}
//               </div>
//             )}
//           </div>
//         )}

//       </nav>

//       {/* Bottom */}
//       <div className="p-2  bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] md:p-3 border-t border-brand-border bg-brand-faint">
//         <div
//           className="flex items-center justify-center md:justify-start gap-3 cursor-pointer p-2 rounded-lg mb-2 md:mb-3"
//           onClick={() => navigate("/profile")}
//         >
//           <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-brand-white text-[15px] font-bold bg-brand-gradient shadow-[0_2px_8px_rgba(241,90,33,0.25)]">
//             {me.name?.charAt(0).toUpperCase()}
//           </div>
//           <div className="hidden md:block flex-1 min-w-0">
//             <div className="text-[12px] font-bold text-brand-dark truncate">{me.name}</div>
//             <div className="text-[11px] text-brand-muted capitalize truncate">{me.role}</div>
//           </div>
//         </div>

//         <button onClick={logout}
//           className="w-full py-2 rounded-lg text-brand-white text-[12px] font-bold cursor-pointer border-none bg-brand-gradient shadow-[0_2px_8px_rgba(241,90,33,0.2)] hidden md:flex items-center justify-center">
//           Logout
//         </button>

//         <button onClick={logout} title="Logout"
//           className="w-full flex items-center justify-center py-2 rounded-lg md:hidden border-none cursor-pointer bg-brand-gradient">
//           <FaUndoAlt color="#fff" size={14} />
//         </button>
//       </div>
//     </div>
//   );
// }






import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  FaChartLine, FaBuilding, FaUsers, FaShoppingCart,
  FaUndoAlt, FaBoxOpen, FaCodeBranch, FaTrophy,
  FaCreditCard, FaDatabase, FaGlobe, FaList, FaBox, FaTag, FaCog, FaMotorcycle
} from "react-icons/fa";

import logo from "../assets/Images/logo 6.png";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const me       = JSON.parse(localStorage.getItem("adminUser") || "{}");

  const [masterOpen,  setMasterOpen]  = useState(
    ["/countries", "/categories", "/items", "/Brands"].includes(location.pathname)
  );
  const [settingOpen, setSettingOpen] = useState(
    ["/BiddingSettings"].includes(location.pathname)
  );

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/");
  };

  const navItems = [
    { label: "Dashboard",        path: "/dashboard",     icon: <FaChartLine />,    roles: ["superadmin", "admin", "user"] },
    { label: "Partner Requests", path: "/partners",      icon: <FaBoxOpen />,      roles: ["superadmin", "admin", "user"] },
    { label: "Companies",        path: "/companies",     icon: <FaBuilding />,     roles: ["superadmin", "admin", "user"] },
    { label: "Branch Requests",  path: "/branches",      icon: <FaCodeBranch />,   roles: ["superadmin", "admin", "user"] },
    { label: "Orders",           path: "/AdminOrders",   icon: <FaShoppingCart />, roles: ["superadmin", "admin", "user"] },
    { label: "Return Orders",    path: "/return-orders", icon: <FaUndoAlt />,      roles: ["superadmin", "admin", "user"] },
    { label: "Rider Payments",   path: "/payments/rider-earnings", icon: <FaMotorcycle />, roles: ["superadmin", "admin", "user"] },
    { label: "Bidding Results",  path: "/biddingList",   icon: <FaTrophy />,       roles: ["superadmin", "admin", "user"] },
    { label: "Payments",         path: "/payments",      icon: <FaCreditCard />,   roles: ["superadmin", "admin", "user"] },
    { label: "Admin Management", path: "/admins",        icon: <FaUsers />,        roles: ["superadmin", "admin"] },
  ];

  const masterItems = [
    { label: "Countries",  path: "/countries",       icon: <FaGlobe /> },
    { label: "Categories", path: "/categories",      icon: <FaList />  },
    { label: "Brands",     path: "/Brands",          icon: <FaTag />   },
    { label: "Items",      path: "/items",           icon: <FaBox />   },
  ];

  const settingItems = [
    { label: "Bidding Settings", path: "/BiddingSettings", icon: <FaCog /> },
    { label: "Commission Settings", path: "/CommissionSettings", icon: <FaCog /> },
    { label: "Delivery Settings", path: "/DeliverySettings", icon: <FaCog /> },
    
  ];

  const masterActive  = masterItems.some(i => location.pathname === i.path);
  const settingActive = settingItems.some(i => location.pathname === i.path);
  const filtered      = navItems.filter(item => item.roles.includes(me.role));

  const DropdownItem = ({ item }) => {
    const active = location.pathname === item.path;
    return (
      <div
        key={item.path}
        onClick={() => navigate(item.path)}
        className={`flex items-center h-7 rounded-md mb-1 cursor-pointer gap-3 px-3 transition-all duration-200
          ${active ? "bg-brand-primary" : "hover:bg-brand-lighter"}`}
      >
        <span className={`text-[11px] shrink-0 ${active ? "text-brand-white" : "text-brand-gray"}`}>{item.icon}</span>
        <span className={`text-[11px] font-medium whitespace-nowrap ${active ? "text-brand-white" : "text-brand-gray"}`}>{item.label}</span>
      </div>
    );
  };

  return (
    <div className="fixed left-0 top-0 h-screen flex flex-col z-[100] bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white  shadow-[2px_0_12px_rgba(0,0,0,0.08)] w-[60px] md:w-[240px] transition-all duration-300">

      {/* Logo */}
      <div className="flex items-center justify-center md:justify-start gap-3 px-3 md:px-5 py-5 border-b border-brand-border mb-2">
        <img src={logo} className="w-10 h-10 rounded-lg shrink-0" alt="logo" />
        <span className="hidden md:block text-[13px] font-extrabold text-brand-dark tracking-wide whitespace-nowrap">
          EL Distributor
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-1 md:px-2 py-2 overflow-y-auto overflow-x-hidden">

        {filtered.map(item => {
          const active = location.pathname === item.path;
          return (
            <div
              key={item.path}
              title={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center h-10 rounded-lg mb-1 cursor-pointer transition-all duration-200
                justify-center md:justify-start md:gap-[14px] md:px-4
                ${active ? "bg-brand-primary" : "hover:bg-brand-lighter"}`}
            >
              <span className={`text-[15px] shrink-0 ${active ? "text-brand-white" : "text-brand-gray"}`}>{item.icon}</span>
              <span className={`hidden md:block text-[12px] font-medium whitespace-nowrap ${active ? "text-brand-white" : "text-brand-gray"}`}>
                {item.label}
              </span>
            </div>
          );
        })}

        {/* Master Data */}
        {["superadmin", "admin"].includes(me.role) && (
          <div>
            <div
              title="Master Data"
              onClick={() => setMasterOpen(p => !p)}
              className={`flex items-center h-10 rounded-lg mb-1 cursor-pointer transition-all duration-200
                justify-center md:justify-start md:gap-[14px] md:px-4
                ${masterActive ? "bg-brand-primary" : "hover:bg-brand-lighter"}`}
            >
              <span className={`text-[15px] shrink-0 ${masterActive ? "text-brand-white" : "text-brand-gray"}`}><FaDatabase /></span>
              <span className={`hidden md:flex flex-1 items-center justify-between text-[12px] font-medium whitespace-nowrap
                ${masterActive ? "text-brand-white" : "text-brand-gray"}`}>
                Master Data
                <span className={`text-[10px] mr-1 transition-transform duration-200 ${masterOpen ? "rotate-180" : ""}`}>▼</span>
              </span>
            </div>
            {masterOpen && (
              <div className="hidden md:block ml-4 border-l-2 border-brand-border pl-2 mb-1">
                {masterItems.map(item => <DropdownItem key={item.path} item={item} />)}
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {["superadmin", "admin"].includes(me.role) && (
          <div>
            <div
              title="Settings"
              onClick={() => setSettingOpen(p => !p)}
              className={`flex items-center h-10 rounded-lg mb-1 cursor-pointer transition-all duration-200
                justify-center md:justify-start md:gap-[14px] md:px-4
                ${settingActive ? "bg-brand-primary" : "hover:bg-brand-lighter"}`}
            >
              <span className={`text-[15px] shrink-0 ${settingActive ? "text-brand-white" : "text-brand-gray"}`}><FaCog /></span>
              <span className={`hidden md:flex flex-1 items-center justify-between text-[12px] font-medium whitespace-nowrap
                ${settingActive ? "text-brand-white" : "text-brand-gray"}`}>
                Settings
                <span className={`text-[10px] mr-1 transition-transform duration-200 ${settingOpen ? "rotate-180" : ""}`}>▼</span>
              </span>
            </div>
            {settingOpen && (
              <div className="hidden md:block ml-4 border-l-2 border-brand-border pl-2 mb-1">
                {settingItems.map(item => <DropdownItem key={item.path} item={item} />)}
              </div>
            )}
          </div>
        )}

      </nav>

      {/* Bottom */}
      <div className="p-2  bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] md:p-3 border-t border-brand-border bg-brand-faint">
        <div
          className="flex items-center justify-center md:justify-start gap-3 cursor-pointer p-2 rounded-lg mb-2 md:mb-3"
          onClick={() => navigate("/profile")}
        >
          <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-brand-white text-[15px] font-bold bg-brand-gradient shadow-[0_2px_8px_rgba(241,90,33,0.25)]">
            {me.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block flex-1 min-w-0">
            <div className="text-[12px] font-bold text-brand-dark truncate">{me.name}</div>
            <div className="text-[11px] text-brand-muted capitalize truncate">{me.role}</div>
          </div>
        </div>

        <button onClick={logout}
          className="w-full py-2 rounded-lg text-brand-white text-[12px] font-bold cursor-pointer border-none bg-brand-gradient shadow-[0_2px_8px_rgba(241,90,33,0.2)] hidden md:flex items-center justify-center">
          Logout
        </button>

        <button onClick={logout} title="Logout"
          className="w-full flex items-center justify-center py-2 rounded-lg md:hidden border-none cursor-pointer bg-brand-gradient">
          <FaUndoAlt color="#fff" size={14} />
        </button>
      </div>
    </div>
  );
}
import { Building2, MapPin, ShoppingCart, FileText, Coins, Handshake, Users, TrendingUp, Clock, CheckCircle, XCircle, ArrowLeftRight, Package, Star, Bell, Settings } from "lucide-react";

const iconMap = {
  building: Building2, mappin: MapPin, cart: ShoppingCart, file: FileText,
  coins: Coins, handshake: Handshake, users: Users, trending: TrendingUp,
  clock: Clock, check: CheckCircle, xcircle: XCircle, transfer: ArrowLeftRight,
  package: Package, star: Star, bell: Bell, settings: Settings,
};


  export default function StatCard({ icon, value, label, sub, subColor = "#f59e0b", active = false, onClick }) {
    const Icon = icon ? (iconMap[icon] || Building2) : null;
  
    return (
      <div
        onClick={onClick}
        className={`relative rounded-[18px] p-5 md:p-[22px] overflow-hidden cursor-pointer
                    transition-all duration-150 border-[1.5px] bg-brand-warm
                    ${Icon ? "min-h-[130px] md:min-h-[140px]" : "min-h-[80px] md:min-h-[90px]"}
                    ${active
                      ? "border-brand-primary shadow-[0_6px_18px_rgba(241,90,33,0.18)]"
                      : "border-transparent shadow-[0_4px_14px_rgba(241,90,33,0.08)]"}
                    hover:border-brand-primary hover:shadow-[0_6px_18px_rgba(241,90,33,0.18)]`}
      >
        {Icon && (
          <div className="w-[40px] h-[40px] md:w-[44px] md:h-[44px] rounded-[12px] bg-brand-primary flex items-center justify-center mb-3 md:mb-4">
            <Icon size={20} color="#fff" strokeWidth={2} />
          </div>
        )}
  
        <div className="relative z-10">
          <div className="text-[18px] md:text-[22px] font-extrabold text-brand-primary leading-none">{value}</div>
          <div className="text-[11px] md:text-[12px] font-medium text-brand-dark mt-[5px] md:mt-[6px]">{label}</div>
          {sub && <div className="text-[11px] font-semibold mt-[5px] md:mt-[6px]" style={{ color: subColor }}>{sub}</div>}
        </div>
      </div>
    );
  }

// export default function StatCard({ icon = "building", value, label, sub, subColor = "#f59e0b", active = false, onClick }) {
//   const Icon = iconMap[icon] || Building2;

//   return (
//     <div
//       onClick={onClick}
//       className={`relative min-h-[130px] md:min-h-[140px] rounded-[18px] p-5 md:p-[22px] overflow-hidden cursor-pointer
//                   transition-all duration-150 border-[1.5px] bg-brand-warm
//                   ${active
//                     ? "border-brand-primary shadow-[0_6px_18px_rgba(241,90,33,0.18)]"
//                     : "border-transparent shadow-[0_4px_14px_rgba(241,90,33,0.08)]"}
//                   hover:border-brand-primary hover:shadow-[0_6px_18px_rgba(241,90,33,0.18)]`}
//     >
//       {/* Icon Box */}
//       <div className="w-[40px] h-[40px] md:w-[44px] md:h-[44px] rounded-[12px] bg-brand-primary flex items-center justify-center mb-3 md:mb-4">
//         <Icon size={20} color="#fff" strokeWidth={2} />
//       </div>

//       {/* Text */}
//       <div className="relative z-10">
//         <div className="text-[18px] md:text-[22px] font-extrabold text-brand-primary leading-none">{value}</div>
//         <div className="text-[11px] md:text-[12px] font-medium text-brand-dark mt-[5px] md:mt-[6px]">{label}</div>
//         {sub && <div className="text-[11px] font-semibold mt-[5px] md:mt-[6px]" style={{ color: subColor }}>{sub}</div>}
//       </div>
//     </div>
//   );
// }
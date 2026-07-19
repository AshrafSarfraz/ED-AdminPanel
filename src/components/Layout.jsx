import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="flex bg-[#fafafa] min-h-screen">
      <Navbar />
      <div
        className="flex-1 min-h-screen bg-[#FAFAFA] ml-[60px] md:ml-[240px] px-4 pt-6 pb-6"
      >
        {children}
      </div>
    </div>
  );
}
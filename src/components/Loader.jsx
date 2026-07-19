// src/components/Loader.jsx
import { ClipLoader } from "react-spinners";

export default function Loader({ size = 40, fullScreen = true }) {
  if (fullScreen) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <ClipLoader color="#f15a21" size={size} />
      </div>
    );
  }

  return <ClipLoader color="#f15a21" size={size} />;
}
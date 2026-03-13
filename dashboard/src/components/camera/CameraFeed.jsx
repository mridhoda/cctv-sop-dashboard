import { Video, Wifi, WifiOff } from "lucide-react";
import { useCameraStream } from "../../hooks/useCameraStream";

export function CameraFeed({ cameraId, cameraName, onRemove }) {
  const { frame, detections, isConnected } = useCameraStream(cameraId);

  return (
    <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video group border border-slate-700">
      {/* Connection status badge */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
        {isConnected ? (
          <span className="flex items-center gap-1 bg-emerald-500/80 text-white text-[10px] px-2 py-0.5 rounded-full font-bold backdrop-blur">
            <Wifi size={10} /> LIVE
          </span>
        ) : (
          <span className="flex items-center gap-1 bg-rose-500/80 text-white text-[10px] px-2 py-0.5 rounded-full font-bold backdrop-blur">
            <WifiOff size={10} /> OFFLINE
          </span>
        )}
      </div>

      {/* Camera name */}
      {cameraName && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
          <p className="text-white text-xs font-semibold truncate">
            {cameraName}
          </p>
        </div>
      )}

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={() => onRemove(cameraId)}
          className="absolute top-2 right-2 z-10 bg-slate-800/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-rose-500"
          title="Hapus dari grid"
        >
          ✕
        </button>
      )}

      {/* Stream frame */}
      {frame ? (
        <img
          src={`data:image/jpeg;base64,${frame}`}
          alt={cameraName || "Camera Feed"}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
          <Video size={32} />
          <p className="text-xs">Menunggu stream...</p>
        </div>
      )}

      {/* Detection overlay (latest detection count) */}
      {detections.length > 0 && (
        <div className="absolute top-2 right-2 z-10 bg-amber-500/90 text-white text-[10px] px-2 py-0.5 rounded-full font-bold backdrop-blur">
          {detections.length} deteksi
        </div>
      )}
    </div>
  );
}

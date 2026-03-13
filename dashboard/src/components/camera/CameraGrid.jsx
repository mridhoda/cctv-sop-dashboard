import { Video, Plus } from "lucide-react";
import { useCameraLayout } from "../../contexts/CameraContext";
import { CameraFeed } from "./CameraFeed";

export function CameraGrid({ cameras = [] }) {
  const { layoutConfig, activeCameras, removeCamera, addCamera } =
    useCameraLayout();
  const emptySlots = Math.max(0, layoutConfig.max - activeCameras.length);

  // Build a lookup for camera names
  const cameraMap = {};
  const cameraList = Array.isArray(cameras) ? cameras : cameras?.data || [];
  for (const cam of cameraList) {
    cameraMap[cam.id] = cam.name || cam.camera_name || `Camera ${cam.id}`;
  }

  return (
    <div className={`grid ${layoutConfig.grid} gap-3`}>
      {activeCameras.map((cameraId) => (
        <CameraFeed
          key={cameraId}
          cameraId={cameraId}
          cameraName={cameraMap[cameraId] || `Camera ${cameraId}`}
          onRemove={removeCamera}
        />
      ))}

      {/* Empty slots — clickable to add cameras */}
      {Array.from({ length: emptySlots }).map((_, i) => (
        <EmptyCameraSlot
          key={`empty-${i}`}
          cameras={cameraList.filter((c) => !activeCameras.includes(c.id))}
          onSelect={addCamera}
        />
      ))}
    </div>
  );
}

function EmptyCameraSlot({ cameras, onSelect }) {
  return (
    <div className="relative rounded-xl bg-slate-800 aspect-video flex flex-col items-center justify-center border-2 border-dashed border-slate-600 group">
      {cameras.length > 0 ? (
        <div className="flex flex-col items-center gap-2">
          <Plus size={24} className="text-slate-500" />
          <select
            onChange={(e) => {
              if (e.target.value) onSelect(e.target.value);
            }}
            defaultValue=""
            className="bg-slate-700 text-white text-xs rounded-lg px-3 py-1.5 border border-slate-600 appearance-none cursor-pointer"
          >
            <option value="" disabled>
              Pilih kamera...
            </option>
            {cameras.map((cam) => (
              <option key={cam.id} value={cam.id}>
                {cam.name || cam.camera_name || `Camera ${cam.id}`}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <Video size={24} />
          <p className="text-xs">Tidak ada kamera</p>
        </div>
      )}
    </div>
  );
}

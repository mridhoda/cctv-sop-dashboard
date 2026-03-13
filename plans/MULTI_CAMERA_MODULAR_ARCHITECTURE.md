# 🧩 Modular Multi-Camera Architecture

## Overview

Arsitektur modular untuk fitur multi-camera CCTV-SOP System. Setiap kamera adalah module independen yang bisa di-deploy, update, dan scale secara terpisah.

---

## 📁 Directory Structure

```
V2_Project/
├── core/                          # Shared components (reusable)
│   ├── __init__.py
│   ├── camera_base.py             # Abstract base class
│   ├── detection_engine.py        # YOLO inference
│   ├── event_publisher.py         # WebSocket/Telegram
│   ├── config_manager.py          # Dynamic config
│   └── utils.py                   # Shared utilities
│
├── cameras/                       # Camera modules (plugin-based)
│   ├── __init__.py
│   ├── camera_001_produksi_a/
│   │   ├── __init__.py
│   │   ├── config.json
│   │   └── main.py
│   └── camera_002_gudang/
│       ├── __init__.py
│       ├── config.json
│       └── main.py
│
├── orchestrator/                  # Camera lifecycle manager
│   ├── __init__.py
│   ├── process_manager.py
│   ├── health_monitor.py
│   └── hot_reload.py
│
├── server/                        # API & WebSocket server
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── cameras.py
│   │   └── streams.py
│   └── websocket/
│       ├── __init__.py
│       ├── rooms.py
│       └── handlers.py
│
└── tests/
    ├── test_camera_module.py
    └── test_orchestrator.py
```

---

## 🔌 Plugin Interface

Setiap camera module mengimplementasikan interface:

```python
class CameraModule(ABC):
    @abstractmethod
    def initialize(self, config: dict) -> bool: pass

    @abstractmethod
    def start(self) -> None: pass

    @abstractmethod
    def stop(self) -> None: pass

    @abstractmethod
    def get_status(self) -> dict: pass

    @property
    @abstractmethod
    def camera_id(self) -> str: pass
```

---

## 🚀 Deployment Patterns

| Scenario      | Architecture                                            |
| ------------- | ------------------------------------------------------- |
| Single Server | All modules dalam 1 server, Orchestrator via subprocess |
| Multi Server  | Orchestrator di master, modules di workers via RPC      |
| Docker        | Each camera = 1 container                               |
| Kubernetes    | Camera modules as Deployments                           |

---

## ✅ Benefits

1. **Independent Deployment** - Update per kamera tanpa restart system
2. **Resource Isolation** - Memory/CPU limits per module
3. **Hot Reload** - Config changes tanpa restart
4. **Reusability** - Core components untuk project lain
5. **Testing** - Unit test per module

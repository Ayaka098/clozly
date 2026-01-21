export const imageStore = {
  async save(file: File) {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("clozly", 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("images")) {
          db.createObjectStore("images");
        }
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("images", "readwrite");
        tx.objectStore("images").put(file, "fullbody");
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
    });
  },
  async load(): Promise<File | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("clozly", 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("images")) {
          db.createObjectStore("images");
        }
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("images", "readonly");
        const getRequest = tx.objectStore("images").get("fullbody");
        getRequest.onsuccess = () => resolve((getRequest.result as File) ?? null);
        getRequest.onerror = () => reject(getRequest.error);
      };
    });
  },
  async clear() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("clozly", 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("images")) {
          db.createObjectStore("images");
        }
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("images", "readwrite");
        tx.objectStore("images").delete("fullbody");
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
    });
  }
};

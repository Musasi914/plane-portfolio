// Refの配列を管理するユーティリティ
export function getMap<T>(
  mapRef: React.RefObject<Map<number, T> | null>
): Map<number, T> {
  if (!mapRef.current) {
    mapRef.current = new Map();
  }
  return mapRef.current;
}

export function createRefCallback<T>(
  mapRef: React.RefObject<Map<number, T> | null>,
  index: number
) {
  return (node: T | null) => {
    const map = getMap(mapRef);
    if (node) {
      map.set(index, node);
    } else {
      map.delete(index);
    }
  };
}

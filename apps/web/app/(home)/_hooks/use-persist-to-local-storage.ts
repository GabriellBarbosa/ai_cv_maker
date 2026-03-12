import { useEffect, useState } from "react";
import { useWatch, type Control, type FieldValues } from "react-hook-form";

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function useRHFFormPersistence<T extends FieldValues>({
  control,
  storageKey,
  delay = 300,
}: {
  control: Control<T>;
  storageKey: string;
  delay?: number;
}) {
  const values = useWatch({ control }) as T;
  const debounced = useDebouncedValue(values, delay);

  useEffect(() => {
    try {
      if (debounced && Object.keys(debounced).length !== 0) {
        localStorage.setItem(storageKey, JSON.stringify(debounced));
      }
    } catch {
      console.error("Error saving professional profile");
    }
  }, [debounced, storageKey]);
}

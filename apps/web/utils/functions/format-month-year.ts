export const formatMonthYear = (rawValue: string) => {
  let value = rawValue.replace(/\D/g, "").slice(0, 6);

  if (value.length >= 3) {
    value = `${value.slice(0, 2)}/${value.slice(2)}`;
  }

  return value;
};

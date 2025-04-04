export const formatTime = (
  time: string,
  salahName?: string,
  isPm: boolean = true,
): string => {
  if (salahName === "fajar") {
    return time.replace(".", ":");
  }

  let [hours, minutes] = time.split(".");
  hours = hours === "12" ? "00" : hours;
  if (isPm) {
    hours = String(Number(hours) + 12);
  }
  return `${hours}:${minutes}`;
};

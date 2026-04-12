import { format, isValid } from "date-fns";

export const currencyFormat = (value: number) => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch (error) {
    console.log(error);
    return `₹${value.toFixed(0)}`;
  }
};

export const formatSubDate = (dateString: string) => {
  if (!dateString) return "Not provided";
  const date = new Date(dateString);
  return isValid(date) ? format(date, "MMM dd, yyyy") : "Invalid date";
};

export const formatSubStatus = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

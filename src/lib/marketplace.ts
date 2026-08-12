export const VEHICLE_CATEGORIES = ["Car","Truck","SUV","Luxury","RV","Camper van","Travel trailer","Boat","Jet ski","Motorcycle","ATV","UTV","Other"] as const;
export const QUICK_CATEGORIES = ["Car","SUV","Luxury","RV","Boat","Jet ski","Motorcycle","ATV","UTV","Travel trailer"] as const;
export const LUXURY_CATEGORIES = ["Luxury"] as const;
export function isLuxuryCategory(category: string){return (LUXURY_CATEGORIES as readonly string[]).includes(category)}
export function luxuryMinimumDeposit(pricePerDay: number){return Math.max(5000, Math.ceil(pricePerDay * 10))}
/** Stored as hundredths of a percent: 1000 = 10%, 1250 = 12.5%. */
export function marketplaceFeeRate(category: string, plus: boolean){if(isLuxuryCategory(category))return plus?1000:1250;return plus?750:1000}
export function marketplaceFeePercent(category: string, plus: boolean){return marketplaceFeeRate(category,plus)/100}

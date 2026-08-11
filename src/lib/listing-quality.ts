type QualityListing = { title:string;description:string;location:string;pricePerDay:number;securityDeposit:number;features:string[];rules:string[];deliveryOptions:string[];details:unknown;photos:{uploadedByOwner?:boolean;isRepresentative?:boolean}[];verification?:{status:string}|null };
export function listingQuality(listing:QualityListing){const d=(listing.details||{})as Record<string,string>;const checks=[
  {label:"Specific title",done:listing.title.length>=12},
  {label:"Detailed description",done:listing.description.length>=120},
  {label:"Make, model, and year",done:!!(d.make&&d.model&&d.year)},
  {label:"At least 3 actual photos",done:listing.photos.filter(p=>p.uploadedByOwner&&!p.isRepresentative).length>=3},
  {label:"Three or more features",done:listing.features.length>=3},
  {label:"Rental rules",done:listing.rules.length>=1},
  {label:"Pickup or delivery details",done:listing.deliveryOptions.length>=1},
  {label:"Security deposit set",done:listing.securityDeposit>0},
  {label:"Vehicle verification submitted",done:!!listing.verification&&listing.verification.status!=="UNVERIFIED"},
  {label:"Complete location and price",done:listing.location.length>=3&&listing.pricePerDay>0},
];return{score:Math.round(checks.filter(c=>c.done).length/checks.length*100),checks};}

export type DemoVehicle = {
  slug: string;
  category: string;
  title: string;
  location: string;
  price: number;
  image: string;
  source: string;
  description: string;
};

export const DEMO_FLEET: DemoVehicle[] = [
  { slug: "demo-porsche-911", category: "Car", title: "Porsche 911 Carrera", location: "San Diego, CA", price: 349, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Porsche_992_Carrera_S_coupe_IMG_5832.jpg/1280px-Porsche_992_Carrera_S_coupe_IMG_5832.jpg", source: "Wikimedia Commons", description: "A premium sports car sample listing." },
  { slug: "demo-ford-f150", category: "Truck", title: "Ford F-150 Lariat", location: "Austin, TX", price: 179, image: "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1400&q=85", source: "Unsplash", description: "A full-size pickup sample listing." },
  { slug: "demo-bronco", category: "SUV", title: "Ford Bronco Wildtrak", location: "San Diego, CA", price: 189, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/2022_Ford_Bronco_Wildtrak%2C_front_3.11.23.jpg/1280px-2022_Ford_Bronco_Wildtrak%2C_front_3.11.23.jpg", source: "Wikimedia Commons", description: "An adventure-ready SUV sample listing." },
  { slug: "demo-azimut-yacht", category: "Luxury", title: "Azimut 55 Flybridge Yacht", location: "San Diego, CA", price: 2499, image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1400&q=85", source: "Unsplash", description: "A luxury yacht sample listing for the Vayro Lux experience." },
  { slug: "demo-winnebago", category: "RV", title: "Winnebago View", location: "Los Angeles, CA", price: 289, image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1400&q=85", source: "Unsplash", description: "A motorhome sample listing." },
  { slug: "demo-solis", category: "Camper van", title: "Winnebago Solis Camper Van", location: "Los Angeles, CA", price: 229, image: "https://www.winnebago.com/Admin/Public/GetImage.ashx?Crop=1&DoNotUpscale=True&FillCanvas=False&Format=WebP&Height=900&Image=%2FFiles%2FImages%2FWinnebagoLife%2Fwinnebago-Solis-off-road.jpg&Quality=85", source: "Winnebago", description: "A pop-top camper van sample listing." },
  { slug: "demo-airstream", category: "Travel trailer", title: "Airstream Flying Cloud", location: "Joshua Tree, CA", price: 199, image: "https://a-us.storyblok.com/f/1023767/1920x1080/c1d7b53f91/1920x1080_flying-cloud-exterior-iso.png", source: "Airstream", description: "An aluminum travel trailer sample listing." },
  { slug: "demo-searay", category: "Boat", title: "Sea Ray Sundancer 320", location: "San Diego, CA", price: 599, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Sea_Ray_Sundancer_320%2C_Interboot_2020%2C_Friedrichshafen_%28IB200044%29.jpg/1280px-Sea_Ray_Sundancer_320%2C_Interboot_2020%2C_Friedrichshafen_%28IB200044%29.jpg", source: "Wikimedia Commons", description: "A coastal cruiser sample listing." },
  { slug: "demo-waverunner", category: "Jet ski", title: "Yamaha WaveRunner VX", location: "Mission Bay, CA", price: 119, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Yamaha_Waverunner_VX_-_Perissa_-_Santorini_-_Greece_-_01.jpg/1280px-Yamaha_Waverunner_VX_-_Perissa_-_Santorini_-_Greece_-_01.jpg", source: "Wikimedia Commons", description: "A personal watercraft sample listing." },
  { slug: "demo-ducati", category: "Motorcycle", title: "Ducati Scrambler Icon", location: "Palm Springs, CA", price: 139, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/2015_Ducati_Scrambler_Icon_right.JPG/1280px-2015_Ducati_Scrambler_Icon_right.JPG", source: "Wikimedia Commons", description: "A motorcycle sample listing." },
  { slug: "demo-sportsman", category: "ATV", title: "Polaris Sportsman 850 ATV", location: "Glamis, CA", price: 229, image: "https://images.unsplash.com/photo-1558980664-10ea2a24b6a7?auto=format&fit=crop&w=1400&q=85", source: "Unsplash", description: "A four-wheel trail vehicle sample listing." },
  { slug: "demo-rzr", category: "UTV", title: "Polaris RZR Pro XP", location: "Glamis, CA", price: 289, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/2021_Polaris_RZR_Pro_XP.jpg/1280px-2021_Polaris_RZR_Pro_XP.jpg", source: "Wikimedia Commons", description: "A side-by-side trail vehicle sample listing." },
  { slug: "demo-snowmobile", category: "Other", title: "Backcountry Snowmobile", location: "Bend, OR", price: 249, image: "https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=1400&q=85", source: "Unsplash", description: "An other recreational vehicle sample listing." },
];

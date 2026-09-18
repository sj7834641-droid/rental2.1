export interface VehiclePricing {
  "3Hr": number;
  "6Hr": number;
  "12Hr": number;
  "24Hr": number;
  "7Days": number;
}

export interface Vehicle {
  id: number;
  name: string;
  type: 'Scooty' | 'Bike';
  deposit: number;
  pricing: VehiclePricing;
  overtime: string;
  image: any;
  engineCc: string;
  mileage: string;
  fuelType: string;
  transmission: 'Automatic' | 'Manual';
  rating: number;
  tripCount: number;
  tag?: string;
  features: string[];
  description: string;
  fuelCapacity: string;
  topSpeed: string;
}

export const FLEET_DATA: Vehicle[] = [
  {
    id: 1,
    name: "Activa 3G",
    type: "Scooty",
    deposit: 500,
    pricing: { "3Hr": 120, "6Hr": 220, "12Hr": 350, "24Hr": 550, "7Days": 2100 },
    overtime: "50/Hr",
    image: require('../assets/vehicles/activa_3g.jpg'),
    engineCc: "110cc",
    mileage: "50 kmpl",
    fuelType: "Petrol",
    transmission: "Automatic",
    rating: 4.8,
    tripCount: 1840,
    tag: "Most Popular",
    features: ["Underseat Storage (18L)", "Combi Brake System (CBS)", "Tubeless Tyres", "Easy Kick & Self Start"],
    description: "India's beloved two-wheeler legend. Known for rock-solid reliability, smooth suspension, and effortless city handling. Perfect for Bangalore traffic, daily errands, and airport trips.",
    fuelCapacity: "5.3 Litres",
    topSpeed: "85 km/h"
  },
  {
    id: 2,
    name: "Jupiter/J-2",
    type: "Scooty",
    deposit: 1,
    pricing: { "3Hr": 120, "6Hr": 220, "12Hr": 350, "24Hr": 550, "7Days": 2100 },
    overtime: "50/Hr",
    image: require('../assets/vehicles/jupiter_j2.jpg'),
    engineCc: "110cc",
    mileage: "52 kmpl",
    fuelType: "Petrol",
    transmission: "Automatic",
    rating: 4.9,
    tripCount: 2310,
    tag: "₹1 Deposit Special!",
    features: ["External Fuel Fill", "EcoThrust FI Engine", "Largest 375mm Footboard", "Patented E-Z Center Stand"],
    description: "Maximum comfort with unbeatable ₹1 refundable deposit promotion. Features external fuel filling so you never have to get off at petrol pumps, plus a super cushioned seat.",
    fuelCapacity: "5.0 Litres",
    topSpeed: "85 km/h"
  },
  {
    id: 3,
    name: "Maestro Edge",
    type: "Scooty",
    deposit: 800,
    pricing: { "3Hr": 150, "6Hr": 280, "12Hr": 450, "24Hr": 620, "7Days": 2450 },
    overtime: "60/Hr",
    image: require('../assets/vehicles/maestro_edge.jpg'),
    engineCc: "110cc",
    mileage: "48 kmpl",
    fuelType: "Petrol",
    transmission: "Automatic",
    rating: 4.7,
    tripCount: 940,
    tag: "Sharp & Sporty",
    features: ["Digital-Analog Meter", "Integrated USB Mobile Charger", "LED Tail Lamp", "Titanium Alloy Wheels"],
    description: "A bold, aerodynamic scooter built with edgy styling, diamond-cut alloy wheels, and an integrated mobile charger for on-the-go connectivity across Bengaluru.",
    fuelCapacity: "5.0 Litres",
    topSpeed: "88 km/h"
  },
  {
    id: 4,
    name: "Maestro",
    type: "Scooty",
    deposit: 800,
    pricing: { "3Hr": 150, "6Hr": 280, "12Hr": 440, "24Hr": 620, "7Days": 2450 },
    overtime: "60/Hr",
    image: require('../assets/vehicles/maestro.jpg'),
    engineCc: "110cc",
    mileage: "47 kmpl",
    fuelType: "Petrol",
    transmission: "Automatic",
    rating: 4.6,
    tripCount: 820,
    tag: "Spacious Ride",
    features: ["Sturdy Metal-Composite Body", "Wide Contoured Seat", "Combined Braking", "High Ground Clearance"],
    description: "Engineered for riders who value a solid stance and ample legroom. Handles potholes and speed breakers with ease, ideal for two riders with luggage.",
    fuelCapacity: "5.3 Litres",
    topSpeed: "85 km/h"
  },
  {
    id: 5,
    name: "Avaitor",
    type: "Scooty",
    deposit: 800,
    pricing: { "3Hr": 150, "6Hr": 280, "12Hr": 450, "24Hr": 620, "7Days": 2450 },
    overtime: "60/Hr",
    image: require('../assets/vehicles/aviator.jpg'),
    engineCc: "110cc",
    mileage: "49 kmpl",
    fuelType: "Petrol",
    transmission: "Automatic",
    rating: 4.7,
    tripCount: 1120,
    tag: "Premium Executive",
    features: ["Front Disc Brake", "Telescopic Front Suspension", "Gleaming Metallic Finish", "Royal Riding Stance"],
    description: "Live your style with Honda's executive scooter. Features telescopic front suspension and a front disc brake for superior highway and arterial road braking control.",
    fuelCapacity: "6.0 Litres",
    topSpeed: "88 km/h"
  },
  {
    id: 6,
    name: "Activa 4G",
    type: "Scooty",
    deposit: 800,
    pricing: { "3Hr": 150, "6Hr": 270, "12Hr": 420, "24Hr": 620, "7Days": 2450 },
    overtime: "60/Hr",
    image: require('../assets/vehicles/activa_4g.jpg'),
    engineCc: "110cc",
    mileage: "51 kmpl",
    fuelType: "Petrol",
    transmission: "Automatic",
    rating: 4.8,
    tripCount: 1650,
    tag: "City Champion",
    features: ["BS-IV HET Engine", "Auto Headlamp On (AHO)", "Mobile Charging Socket", "Full Metal Body"],
    description: "Upgraded with Honda Eco Technology (HET) and Automatic Headlamp On for safety. Smooth linear throttle response and unmatched durability across city routes.",
    fuelCapacity: "5.3 Litres",
    topSpeed: "86 km/h"
  },
  {
    id: 7,
    name: "TVS Wego",
    type: "Scooty",
    deposit: 800,
    pricing: { "3Hr": 150, "6Hr": 280, "12Hr": 450, "24Hr": 620, "7Days": 3450 },
    overtime: "60/Hr",
    image: require('../assets/vehicles/tvs_wego.jpg'),
    engineCc: "110cc",
    mileage: "50 kmpl",
    fuelType: "Petrol",
    transmission: "Automatic",
    rating: 4.6,
    tripCount: 710,
    tag: "Body-Balance Tech",
    features: ["Patented Body-Balance Tech", "Full Metal Body", "Sync Braking Technology", "Golden Front Forks"],
    description: "The only scooter with patented Body-Balance technology that shifts center of gravity for effortless turns, stability at stop signals, and rider confidence.",
    fuelCapacity: "5.0 Litres",
    topSpeed: "84 km/h"
  },
  {
    id: 8,
    name: "Glamour",
    type: "Bike",
    deposit: 800,
    pricing: { "3Hr": 150, "6Hr": 270, "12Hr": 450, "24Hr": 620, "7Days": 2450 },
    overtime: "60/Hr",
    image: require('../assets/vehicles/glamour.jpg'),
    engineCc: "125cc",
    mileage: "55 kmpl",
    fuelType: "Petrol",
    transmission: "Manual",
    rating: 4.7,
    tripCount: 1380,
    tag: "Smooth Commuter",
    features: ["Hero i3S Idle Stop-Start", "125cc TORQ 9 Engine", "Digital-Analog Cluster", "5-Speed Smooth Gearbox"],
    description: "High torque 125cc commuter motorcycle featuring i3S smart start-stop tech for maximum fuel economy. Smooth gearing and plush upright seating posture.",
    fuelCapacity: "10.0 Litres",
    topSpeed: "95 km/h"
  },
  {
    id: 9,
    name: "Discover",
    type: "Bike",
    deposit: 800,
    pricing: { "3Hr": 150, "6Hr": 270, "12Hr": 450, "24Hr": 620, "7Days": 2450 },
    overtime: "60/Hr",
    image: require('../assets/vehicles/discover.jpg'),
    engineCc: "125cc",
    mileage: "58 kmpl",
    fuelType: "Petrol",
    transmission: "Manual",
    rating: 4.7,
    tripCount: 1210,
    tag: "Mileage King",
    features: ["DTS-i Twin Spark Ignition", "Nitrox Gas Shock Absorbers", "LED DRL Lights", "Lightweight Agility"],
    description: "Legendary fuel efficiency powered by Bajaj's patented DTS-i twin spark technology. Nitrox gas charged rear suspensions soak up the roughest roads with ease.",
    fuelCapacity: "8.0 Litres",
    topSpeed: "100 km/h"
  },
  {
    id: 10,
    name: "Ns Pulsar",
    type: "Bike",
    deposit: 1000,
    pricing: { "3Hr": 200, "6Hr": 360, "12Hr": 550, "24Hr": 860, "7Days": 3450 },
    overtime: "70/Hr",
    image: require('../assets/vehicles/ns_pulsar.jpg'),
    engineCc: "200cc",
    mileage: "36 kmpl",
    fuelType: "Petrol",
    transmission: "Manual",
    rating: 4.9,
    tripCount: 2950,
    tag: "Aggressive Streetfighter",
    features: ["200cc Liquid-Cooled 4V Engine", "Perimeter Frame Chassis", "Dual Disc ABS", "Underbelly Exhaust"],
    description: "Naked sports powerhouse producing 24.5 PS of raw adrenaline. Perimeter chassis and monoshock suspension give precision cornering for Nandi Hills weekend runs.",
    fuelCapacity: "12.0 Litres",
    topSpeed: "135 km/h"
  }
];

export const TOTAL_VEHICLE_COUNT = FLEET_DATA.length; // 10
export const SCOOTY_COUNT = FLEET_DATA.filter(v => v.type === 'Scooty').length; // 7
export const BIKE_COUNT = FLEET_DATA.filter(v => v.type === 'Bike').length; // 3
export const TOTAL_DEPOSIT_VALUE = FLEET_DATA.reduce((acc, v) => acc + v.deposit, 0); // 7101

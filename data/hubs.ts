export interface RentalHub {
  id: string;
  name: string;
  landmark: string;
  address: string;
  distance: string;
  operatingHours: string;
  availableBikes: number;
  latitude: number;
  longitude: number;
  phone: string;
}

export const BANGALORE_HUBS: RentalHub[] = [
  {
    id: "hub-koramangala",
    name: "Koramangala 5th Block Hub",
    landmark: "Near Sony World Signal, 80ft Road",
    address: "#482, 1st Cross, 5th Block, Koramangala, Bengaluru, Karnataka 560095",
    distance: "1.2 km away",
    operatingHours: "07:30 AM - 10:30 PM",
    availableBikes: 8,
    latitude: 12.9352,
    longitude: 77.6245,
    phone: "+91 80 4719 3201"
  },
  {
    id: "hub-indiranagar",
    name: "Indiranagar 100ft Hub",
    landmark: "Opposite Toit Brewpub, Metro Pillar 84",
    address: "#1208, 100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru 560038",
    distance: "3.5 km away",
    operatingHours: "07:00 AM - 11:00 PM",
    availableBikes: 6,
    latitude: 12.9719,
    longitude: 77.6412,
    phone: "+91 80 4719 3202"
  },
  {
    id: "hub-hsr",
    name: "HSR Layout Sector 1 Hub",
    landmark: "Next to Agara Lake Park entrance",
    address: "#19, 27th Main Rd, Sector 1, HSR Layout, Bengaluru 560102",
    distance: "2.8 km away",
    operatingHours: "07:30 AM - 10:30 PM",
    availableBikes: 7,
    latitude: 12.9121,
    longitude: 77.6446,
    phone: "+91 80 4719 3203"
  },
  {
    id: "hub-btm",
    name: "BTM Layout 2nd Stage Hub",
    landmark: "Near Udupi Garden Signal",
    address: "#73, 16th Main, 2nd Stage, BTM Layout, Bengaluru 560076",
    distance: "4.1 km away",
    operatingHours: "08:00 AM - 10:00 PM",
    availableBikes: 5,
    latitude: 12.9166,
    longitude: 77.6101,
    phone: "+91 80 4719 3204"
  },
  {
    id: "hub-whitefield",
    name: "Whitefield ITPL Hub",
    landmark: "Opposite Prestige Shantiniketan gate 2",
    address: "ITPL Main Rd, KIADB Export Promotion Zone, Whitefield, Bengaluru 560066",
    distance: "9.4 km away",
    operatingHours: "07:00 AM - 11:00 PM",
    availableBikes: 9,
    latitude: 12.9863,
    longitude: 77.7335,
    phone: "+91 80 4719 3205"
  },
  {
    id: "hub-marathahalli",
    name: "Marathahalli Bridge Hub",
    landmark: "Near Kalamandir Junction, Outer Ring Rd",
    address: "#56, Service Rd, Marathahalli, Bengaluru 560037",
    distance: "6.2 km away",
    operatingHours: "07:30 AM - 10:30 PM",
    availableBikes: 5,
    latitude: 12.9591,
    longitude: 77.6974,
    phone: "+91 80 4719 3206"
  },
  {
    id: "hub-mgroad",
    name: "MG Road Metro Station Hub",
    landmark: "Exit Gate 2, Trinity Circle junction",
    address: "Mahatma Gandhi Rd, Ashok Nagar, Bengaluru 560001",
    distance: "5.0 km away",
    operatingHours: "06:30 AM - 11:00 PM",
    availableBikes: 7,
    latitude: 12.9756,
    longitude: 77.6066,
    phone: "+91 80 4719 3207"
  }
];

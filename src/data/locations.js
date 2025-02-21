export const locations = [
  {
    lat: 1.3521,
    lng: 103.8198,
    name: "Singapore",
    content: "Singapore",
    mapUrl: "./assets/maps/singapore.png",
    mapMarkers: [
      {
        id: "marina-bay",
        name: "Marina Bay Sands",
        x: 56, // percentage from left
        y: 70, // percentage from top
        description:
          "Marina Bay Sands is an integrated resort fronting Marina Bay in Singapore.",
      },
      {
        id: "gardens-by-bay",
        name: "Gardens by the Bay",
        x: 57,
        y: 72,
        description:
          "Gardens by the Bay is a nature park spanning 101 hectares in central Singapore.",
      },
      // Add more markers as needed
    ],
  },
  {
    lat: 51.5074,
    lng: -0.1278,
    name: "London",
    content: "Testing",
    mapUrl: "./assets/maps/uk.png",
  },
  { lat: 22.3193, lng: 114.1694, name: "Hong Kong", content: "Hong Kong SAR" },
  { lat: 35.6762, lng: 139.6503, name: "Japan", content: "Tokyo, Japan" },
  { lat: 37.5665, lng: 126.978, name: "Korea", content: "Seoul, South Korea" },
  {
    lat: 52.3676,
    lng: 4.9041,
    name: "Netherlands",
    content: "Amsterdam, Netherlands",
  },
  { lat: 46.8182, lng: 8.2275, name: "Switzerland", content: "Switzerland" },
  { lat: 41.9028, lng: 12.4964, name: "Italy", content: "Rome, Italy" },
];

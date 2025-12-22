export interface Trip {
    title: string;
    location: string;
    date: string;
    description: string;
    img: string;
    tags: string[];
}

export const holidayTrips: Trip[] = [
    {
        title: "Sea, Sun & Spirit",
        location: "Lignano, Italy",
        date: "July 2025",
        description: "Barrierefreier Strandurlaub mit echtem italienischem Flair. Pizza, Gelato und ganz viel Adria.",
        img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200",
        tags: ["Strand", "Sonne", "Klassiker"]
    },
    {
        title: "Mountain Magic",
        location: "Schladming, Austria",
        date: "August 2025",
        description: "Raus aus der Stadt, rein in die Natur. Wir erkunden die steirischen Alpen – natürlich barrierefrei.",
        img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200",
        tags: ["Natur", "Heimat", "Aktiv"]
    },
    {
        title: "City Pulse Vienna",
        location: "Vienna, Austria",
        date: "September 2025",
        description: "Kultur, Kaffeehaus und Prater. Wir entdecken die Hauptstadt von ihrer inklusivsten Seite.",
        img: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=1200",
        tags: ["Kultur", "City", "Action"]
    }
];
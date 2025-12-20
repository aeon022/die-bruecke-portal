export interface TeamMember {
    name: string;
    role: string;
    img: string;
    type: 'board' | 'operative';
}

export const teamData: TeamMember[] = [
    // VORSTAND (Laut aktuellem Registerauszug)
    { 
        name: "Gerwin Weiher", 
        role: "Obmann", 
        img: "/images/team/weiher.jpg", 
        type: 'board' 
    },
    { 
        name: "Heinz Sailer", 
        role: "Obmann Stellvertreter", 
        img: "/images/team/sailer.jpg", 
        type: 'board' 
    },
    { 
        name: "Bibiana Fleps", 
        role: "Kassierin", 
        img: "/images/team/fleps.jpg", 
        type: 'board' 
    },
    { 
        name: "Oliver Haditsch", 
        role: "Schriftführer", 
        img: "/images/team/haditsch.jpg", 
        type: 'board' 
    },
    { 
        name: "Ruth Köppel", 
        role: "Schriftführer Stellvertreterin", 
        img: "/images/team/koeppel.jpg", 
        type: 'board' 
    },
    { 
        name: "Günther Kolman", 
        role: "Kassier Stellvertreter", 
        img: "/images/team/kolman.jpg", 
        type: 'board' 
    },
    // TEAM MITARBEITER
    { 
        name: "Team Member 1", 
        role: "Team FASS", 
        img: "/images/team/team2.jpg", 
        type: 'operative' 
    },
    { 
        name: "Team Member 2", 
        role: "Team FASS", 
        img: "/images/team/team2.jpg", 
        type: 'operative' 
    },
];
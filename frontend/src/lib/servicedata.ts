export const services = [
    {
        id: "fass",
        slug: "freizeitassistenz",
        title: "Freizeitassistenz (FASS)",
        programDownload: "/downloads/freizeitprogramm-dummy.pdf", 
        buttonText: "Aktuelles Programm (PDF)", // Optionaler Text
        description: "Die Freizeitassistenz unterstützt Menschen mit Behinderung...",
        features: [
            "Begleitung zu Freizeitaktivitäten & Sport",
            "Aufbau sozialer Kompetenzen",
            "Teilhabe am gesellschaftlichen Leben",
            "Abrechnung nach LEVO-StBHG möglich"
        ],
        subtitle: "Selbstbestimmt unterwegs.",
        icon: "fa-person-walking-luggage",
        color: "from-lime-500 to-green-600",
        image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1200",
        description: "Die Freizeitassistenz unterstützt Menschen mit Behinderung bei Aktivitäten außerhalb ihrer Wohnumgebung – sei es beim Sport, bei kulturellen Veranstaltungen oder im Kontakt mit Freund:innen.",
        features: [
            "Begleitung zu Freizeitaktivitäten & Sport",
            "Aufbau sozialer Kompetenzen",
            "Teilhabe am gesellschaftlichen Leben",
            "Abrechnung nach LEVO-StBHG möglich"
        ],
        content: `
            <p>Die Freizeitassistenz (FASS) unterstützt Menschen mit Behinderung bei Aktivitäten außerhalb ihrer Wohnumgebung. Ziel ist es, die Selbstbestimmung und gesellschaftliche Teilhabe im Alltag zu fördern.</p>
            <p>Dabei steht der Aufbau sozialer Kompetenzen und das Erleben von Selbstwirksamkeit im Vordergrund. Ob Kino, Marktbesuch oder Treffen mit Freund:innen – wir begleiten dort, wo das Leben stattfindet.</p>
        `
    },
    {
        id: "fed",
        slug: "familienentlastung",
        title: "Familienentlastung (FED)",
        subtitle: "Freiräume für Angehörige.",
        icon: "fa-hands-holding-child",
        color: "from-sky-500 to-blue-600",
        image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=1200",
        description: "Der Familienentlastungsdienst bietet Angehörigen eine temporäre Entlastung von Betreuungspflichten, während die betreute Person individuelle Zuwendung erhält.",
        features: [
            "Temporäre Entlastung für Angehörige",
            "Individuelle Zuwendung für die betreute Person",
            "Flexible Zeiteinteilung",
            "Schafft notwendige Freiräume im Alltag"
        ],
        content: `
            <p>Der Familienentlastungsdienst (FED) bietet Angehörigen eine temporäre Entlastung von Betreuungspflichten. Diese Dienste sind besonders wichtig für pflegende Angehörige, die oft über lange Zeiträume intensiv eingebunden sind.</p>
            <p>Während die Familie Zeit für sich nutzen kann, erhält die betreute Person individuelle Zuwendung und Unterstützung – zu Hause oder unterwegs.</p>
        `
    },
    {
        id: "wass",
        slug: "wohnassistenz",
        title: "Wohnassistenz (WASS)",
        subtitle: "Mein Leben. Meine Wohnung.",
        icon: "fa-house-chimney-user",
        color: "from-orange-500 to-red-500",
        image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=1200",
        description: "Die Wohnassistenz richtet sich an Menschen, die selbstständig leben. Wir unterstützen bei Alltagsorganisation, Haushaltsführung und Behördenwegen.",
        features: [
            // "Hilfe" -> "Unterstützung"
            "Unterstützung bei der Haushaltsführung", 
            "Begleitung bei Behördenwegen & Finanzen",
            "Organisation des Alltags",
            "Förderung der Selbstständigkeit"
        ],
        content: `
            <p>Die Wohnassistenz (WASS) richtet sich an Menschen mit Behinderung, die selbstständig oder in teilbetreuten Wohnformen leben. Die Assistenz umfasst Support bei der Alltagsorganisation, Haushaltsführung und Kommunikation mit Behörden.</p>
            <p>Ziel ist es, ein selbstbestimmtes Leben im eigenen Wohnraum zu ermöglichen und soziale Kontakte zu fördern.</p>
        `
    }
];
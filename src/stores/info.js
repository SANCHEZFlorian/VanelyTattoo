import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'

export const useInfoStore = defineStore('info', () => {
    // General Information
    const generalInfo = ref({
        address: "123 Rue du Tatouage, 75001 Paris",
        phone: "01 23 45 67 89",
        email: "contact@vanelytattoo.com",
        openingHours: {
            Lundi: {
                isOpen: true,
                morning: { start: "10:00", end: "13:00" },
                afternoon: { start: "14:00", end: "19:00" }
            },
            Mardi: {
                isOpen: true,
                morning: { start: "10:00", end: "13:00" },
                afternoon: { start: "14:00", end: "19:00" }
            },
            Mercredi: {
                isOpen: true,
                morning: { start: "10:00", end: "13:00" },
                afternoon: { start: "14:00", end: "19:00" }
            },
            Jeudi: {
                isOpen: true,
                morning: { start: "10:00", end: "13:00" },
                afternoon: { start: "14:00", end: "19:00" }
            },
            Vendredi: {
                isOpen: true,
                morning: { start: "10:00", end: "13:00" },
                afternoon: { start: "14:00", end: "19:00" }
            },
            Samedi: {
                isOpen: false,
                morning: { start: "10:00", end: "13:00" },
                afternoon: { start: "14:00", end: "18:00" }
            },
            Dimanche: {
                isOpen: false,
                morning: { start: "", end: "" },
                afternoon: { start: "", end: "" }
            }
        }
    })

    // Social Media Links
    const socials = ref({
        facebook: "https://facebook.com/vanelytattoo",
        instagram: "https://instagram.com/vanelytattoo",
        tiktok: "https://tiktok.com/@vanelytattoo"
    })

    // About Section
    const about = ref({
        title: "L'Art de l'Encre",
        description: "Passionnée par le tatouage depuis plus de 10 ans, je spécialise mon art dans les styles manga, gaming, et floral. Chaque projet est unique et réalisé avec le plus grand soin dans un environnement stérile et accueillant.",
        image: "/images/about_artist.png",
        style: [
            { name: "Personnages de manga et d'animé", icon: "fas fa-star" },
            { name: "Gaming & Pop Culture", icon: "fas fa-gamepad" },
            { name: "Personnages version cute", icon: "fas fa-heart" },
            { name: "Personnages version dark", icon: "fas fa-skull" }
        ],
        certifications: [
            "Formation Hygiène et Salubrité",
            "Artiste Tatoueuse Certifiée"
        ]
    })

    // Legal Pages
    const legal = ref({
        mentions: "Mentions légales par défaut...\n\nÉditeur du site : Vanely Tattoo\nAdresse : ...",
        cgv: "Conditions Générales de Vente par défaut...",
        privacy: "Politique de Confidentialité par défaut..."
    })

    // Process Steps (How it works)
    const steps = ref([
        {
            id: 1,
            title: "Contact & Projet",
            description: "Envoyez-moi votre idée via le formulaire de contact ou passez au shop pour en discuter.",
            icon: "chat",
            image: "/images/process_1.png"
        },
        {
            id: 2,
            title: "Design & Validation",
            description: "Je prépare un dessin unique basé sur vos références. On ajuste ensemble jusqu'à satisfaction.",
            icon: "draw",
            image: "/images/process_2.png"
        },
        {
            id: 3,
            title: "Séance Tatouage",
            description: "Le jour J ! Détendez-vous, on passe à l'encrage dans la bonne humeur et l'hygiène.",
            icon: "needle",
            image: "/images/process_3.png"
        },
        {
            id: 4,
            title: "Soins & Cicatrisation",
            description: "Je vous explique tout pour que votre tatouage cicatrise parfaitement.",
            icon: "bandage",
            image: "/images/process_4.png"
        }
    ])

    // Home Carousel
    const carousel = ref([
        {
            id: 1,
            image: "/images/carousel_1.jpg",
            title: "Bienvenue chez Vanely Tattoo",
            subtitle: "Votre projet unique, notre passion commune."
        },
        {
            id: 2,
            image: "/images/carousel_2.jpg",
            title: "Spécialiste Manga & Anime",
            subtitle: "Donnez vie à vos héros préférés."
        },
        {
            id: 3,
            image: "/images/carousel_3.jpg",
            title: "Flashs Disponibles",
            subtitle: "Découvrez nos designs prêts à être tatoués."
        }
    ])

    // Resources (Admin managed PDF links)
    const resources = ref([
        { id: 1, title: "Livret de soins", url: "#" },
        { id: 2, title: "Décharge de responsabilité", url: "#" }
    ])

    // Load from LocalStorage
    if (localStorage.getItem('vt_generalInfo')) generalInfo.value = JSON.parse(localStorage.getItem('vt_generalInfo'))
    if (localStorage.getItem('vt_socials')) socials.value = JSON.parse(localStorage.getItem('vt_socials'))
    if (localStorage.getItem('vt_about')) about.value = JSON.parse(localStorage.getItem('vt_about'))
    if (localStorage.getItem('vt_steps')) steps.value = JSON.parse(localStorage.getItem('vt_steps'))
    if (localStorage.getItem('vt_carousel')) carousel.value = JSON.parse(localStorage.getItem('vt_carousel'))
    if (localStorage.getItem('vt_legal')) legal.value = JSON.parse(localStorage.getItem('vt_legal'))
    if (localStorage.getItem('vt_resources')) resources.value = JSON.parse(localStorage.getItem('vt_resources'))

    // Watch and Persist
    watch(generalInfo, (newVal) => localStorage.setItem('vt_generalInfo', JSON.stringify(newVal)), { deep: true })
    watch(socials, (newVal) => localStorage.setItem('vt_socials', JSON.stringify(newVal)), { deep: true })
    watch(about, (newVal) => localStorage.setItem('vt_about', JSON.stringify(newVal)), { deep: true })
    watch(steps, (newVal) => localStorage.setItem('vt_steps', JSON.stringify(newVal)), { deep: true })
    watch(carousel, (newVal) => localStorage.setItem('vt_carousel', JSON.stringify(newVal)), { deep: true })
    watch(legal, (newVal) => localStorage.setItem('vt_legal', JSON.stringify(newVal)), { deep: true })
    watch(resources, (newVal) => localStorage.setItem('vt_resources', JSON.stringify(newVal)), { deep: true })

    // Helper for grouped hours
    const groupedOpeningHours = computed(() => {
        const hours = generalInfo.value.openingHours
        const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

        // 1. Get schedule for each day
        const daySchedules = dayNames.map(day => {
            const sched = hours[day]
            let timeStr = 'Fermé'
            if (sched && sched.isOpen) {
                const am = sched.morning && sched.morning.start && sched.morning.end
                    ? `${sched.morning.start}-${sched.morning.end}`
                    : ''
                const pm = sched.afternoon && sched.afternoon.start && sched.afternoon.end
                    ? `${sched.afternoon.start}-${sched.afternoon.end}`
                    : ''

                if (am && pm) timeStr = `${am} / ${pm}`
                else if (am) timeStr = am
                else if (pm) timeStr = pm
            }
            return { day, timeStr }
        })

        // 2. Group days by their schedule
        const groupsMap = new Map() // Using Map to preserve insertion order of schedules
        daySchedules.forEach(item => {
            if (!groupsMap.has(item.timeStr)) {
                groupsMap.set(item.timeStr, [])
            }
            groupsMap.get(item.timeStr).push(item.day)
        })

        // 3. Format result
        const result = []
        const shortDays = {
            'Lundi': 'Lun', 'Mardi': 'Mar', 'Mercredi': 'Mer', 'Jeudi': 'Jeu', 'Vendredi': 'Ven', 'Samedi': 'Sam', 'Dimanche': 'Dim'
        }

        groupsMap.forEach((days, time) => {
            let label = ''
            if (days.length === 7) {
                label = 'Tous les jours'
            } else {
                // Detect consecutive ranges
                const ranges = []
                let startIdx = 0

                for (let i = 0; i < days.length; i++) {
                    const currentDayName = days[i]
                    const nextDayName = days[i+1]
                    
                    const currentDayIdx = dayNames.indexOf(currentDayName)
                    const nextDayIdx = nextDayName ? dayNames.indexOf(nextDayName) : -1

                    // Check if next day is consecutive in the original dayNames array
                    if (nextDayIdx !== currentDayIdx + 1) {
                        const rangeDays = days.slice(startIdx, i + 1)
                        if (rangeDays.length >= 2) {
                            ranges.push(`${shortDays[rangeDays[0]]} - ${shortDays[rangeDays[rangeDays.length - 1]]}`)
                        } else {
                            ranges.push(shortDays[rangeDays[0]])
                        }
                        startIdx = i + 1
                    }
                }
                label = ranges.join(' / ')
            }
            result.push({ label, time })
        })

        return result
    })

    return {
        generalInfo,
        socials,
        about,
        steps,
        carousel,
        legal,
        resources,
        groupedOpeningHours
    }
})

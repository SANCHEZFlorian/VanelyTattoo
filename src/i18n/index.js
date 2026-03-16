import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    sidebar: {
      dashboard: 'Dashboard',
      flash: 'Flash Tattoos',
      gallery: 'Gallery',
      bookings: 'Bookings',
      calendar: 'Calendar',
      blog: 'Blog',
      settings: 'Settings'
    },
    flash: {
      title: 'Flash Tattoos',
      subtitle: 'Manage your flash tattoo catalog',
      addTitle: 'Add Flash',
      editTitle: 'Edit Flash',
      categories: 'Categories',
      filters: {
        search: 'Search...',
        allCategories: 'All Categories'
      },
      table: {
        image: 'Image',
        title: 'Title',
        category: 'Category',
        price: 'Price',
        views: 'Views',
        status: 'Status',
        actions: 'Actions'
      },
      form: {
        title: 'Title',
        category: 'Category',
        status: 'Status',
        price: 'Price',
        promo: 'Original Price',
        image: 'Images',
        description: 'Description'
      },
      deleteConfirm: 'Are you sure you want to delete this flash?',
      manageCategories: 'Manage Categories',
      newCategory: 'New Category',
      deleteCategoryConfirm: 'Delete category {cat}?'
    },
    dashboard: {
      title: 'Dashboard',
      stats: {
        totalFlashViews: 'Total Flash Views',
        totalGalleryViews: 'Total Gallery Views',
        pendingBookings: 'Pending Bookings'
      },
      mostVisited: 'Most Visited',
      lastBookings: 'Recent Bookings',
      table: {
        viewAll: 'View All',
        client: 'Client',
        project: 'Project',
        date: 'Date',
        status: 'Status'
      }
    },
    booking: {
      title: 'Bookings',
      filters: {
        all: 'All Statuses'
      },
      table: {
        client: 'Client',
        project: 'Project',
        date: 'Date',
        email: 'Email',
        status: 'Status',
        actions: 'Actions'
      }
    },
    gallery: {
      title: 'Gallery',
      subtitle: 'Manage your portfolio',
      addTitle: 'Add Item',
      editTitle: 'Edit Item',
      deleteConfirm: 'Delete this item?',
      form: {
        title: 'Title',
        category: 'Category',
        status: 'Status',
        image: 'Images'
      }
    },
    filters: {
      all: 'All Statuses'
    },
    settings: {
      save: 'Save Changes',
      saveSuccess: 'Settings saved correctly',
      sections: {
        general: 'General Info',
        socials: 'Social Networks',
        about: 'About',
        steps: 'Process',
        carousel: 'Carousel',
        legal: 'Legal Pages'
      },
      general: {
        address: 'Address',
        phone: 'Phone',
        email: 'Email',
        hours: 'Opening Hours'
      },
      socials: {
        facebook: 'Facebook URL',
        instagram: 'Instagram URL',
        tiktok: 'TikTok URL'
      },
      about: {
        title: 'Title',
        description: 'Description',
        style: 'Style',
        certifications: 'Certifications',
        image: 'Profile Image URL'
      },
      steps: {
        icon: 'Material Icon Name',
        title: 'Step Title',
        description: 'Description',
        add: 'Add New Step',
        addBtn: 'Add Step'
      },
      carousel: {
        add: 'Add New Slide',
        image: 'Image URL',
        title: 'Title',
        subtitle: 'Subtitle',
        addBtn: 'Add Slide'
      }
    },
    status: {
      active: 'Active',
      standby: 'Standby',
      pending: 'Pending',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
      completed: 'Completed'
    },
    general: {
      user: 'User',
      save: 'Save',
      cancel: 'Cancel',
      views: 'views'
    }
  },
  fr: {
    sidebar: {
      dashboard: 'Tableau de bord',
      flash: 'Flash Tattoos',
      gallery: 'Galerie',
      bookings: 'Réservations',
      calendar: 'Calendrier',
      messages: 'Messages',
      blog: 'Blog',
      settings: 'Paramètres'
    },
    flash: {
      title: 'Flash Tattoos',
      subtitle: 'Gérez votre catalogue de flashs',
      addTitle: 'Ajouter',
      editTitle: 'Modifier',
      categories: 'Catégories',
      filters: {
        search: 'Rechercher...',
        allCategories: 'Toutes catégories'
      },
      table: {
        image: 'Image',
        title: 'Titre',
        category: 'Catégorie',
        price: 'Prix',
        views: 'Vues',
        status: 'Statut',
        actions: 'Actions'
      },
      form: {
        title: 'Titre',
        category: 'Catégories',
        status: 'Statut',
        price: 'Prix',
        promo: 'Prix original',
        image: 'Images',
        description: 'Description'
      },
      deleteConfirm: 'Voulez-vous vraiment supprimer ce flash ?',
      manageCategories: 'Gérer les catégories',
      newCategory: 'Nouvelle catégorie',
      deleteCategoryConfirm: 'Supprimer la catégorie {cat} ?'
    },
    dashboard: {
      title: 'Tableau de bord',
      stats: {
        totalFlashViews: 'Vues Flash',
        totalGalleryViews: 'Vues Galerie',
        pendingBookings: 'Réservations en attente'
      },
      mostVisited: 'Les plus visités',
      lastBookings: 'Dernières réservations',
      table: {
        viewAll: 'Voir tout',
        client: 'Client',
        project: 'Projet',
        date: 'Date',
        status: 'Statut'
      },
    },
    booking: {
      title: 'Réservations',
      filters: {
        all: 'Tous les statuts'
      },
      table: {
        client: 'Client',
        project: 'Projet',
        date: 'Date',
        email: 'Email',
        status: 'Statut',
        actions: 'Actions'
      }
    },
    gallery: {
      title: 'Galerie',
      subtitle: 'Gérez votre portfolio',
      addTitle: 'Ajouter',
      editTitle: 'Modifier',
      deleteConfirm: 'Supprimer cet élément ?',
      form: {
        title: 'Titre',
        category: 'Catégorie',
        status: 'Statut',
        image: 'Images'
      }
    },
    filters: {
      all: 'Tous les statuts'
    },
    settings: {
      save: 'Enregistrer',
      saveSuccess: 'Paramètres enregistrés avec succès',
      sections: {
        general: 'Général',
        socials: 'Réseaux Sociaux',
        about: 'À propos',
        steps: 'Processus',
        carousel: 'Carrousel',
        legal: 'Pages Légales'
      },
      general: {
        address: 'Adresse',
        phone: 'Téléphone',
        email: 'Email',
        hours: 'Horaires d\'ouverture'
      },
      socials: {
        facebook: 'Lien Facebook',
        instagram: 'Lien Instagram',
        tiktok: 'Lien TikTok'
      },
      about: {
        title: 'Titre',
        description: 'Description',
        style: 'Style',
        certifications: 'Certifications',
        image: 'URL de l\'image'
      },
      steps: {
        icon: 'Nom de l\'icône (Material)',
        title: 'Titre de l\'étape',
        description: 'Description',
        add: 'Ajouter une étape',
        addBtn: 'Ajouter'
      },
      carousel: {
        add: 'Ajouter une slide',
        image: 'URL Image',
        title: 'Titre',
        subtitle: 'Sous-titre',
        addBtn: 'Ajouter'
      }
    },
    status: {
      active: 'Actif',
      standby: 'En attente',
      pending: 'En attente',
      confirmed: 'Confirmé',
      cancelled: 'Annulé',
      completed: 'Terminé'
    },
    general: {
      user: 'Utilisateur',
      save: 'Enregistrer',
      cancel: 'Annuler',
      views: 'vues'
    }
  }
}

export default createI18n({
  legacy: false,
  locale: 'fr',
  fallbackLocale: 'en',
  messages
})

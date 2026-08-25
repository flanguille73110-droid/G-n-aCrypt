import { FamilyTreeData } from '../types';

export const INITIAL_SAMPLE_TREE: FamilyTreeData = {
  version: '1.0',
  updatedAt: new Date().toISOString(),
  generalNotes: 'Arbre généalogique de la famille Dupont - Martin. Données de démonstration prêtes à l\'emploi.',
  auditLogs: [
    {
      id: 'log-init-1',
      timestamp: new Date().toISOString(),
      action: 'IMPORT',
      targetName: 'Famille Dupont-Martin',
      details: 'Création initiale de la structure généalogique de démonstration'
    }
  ],
  customEvents: [
    {
      id: 'event-mariage-1945',
      type: 'mariage',
      title: 'Mariage de Henri Dupont et Marie Bernard',
      date: '1945-06-16',
      place: 'Lyon',
      coords: [45.7640, 4.8357],
      personIds: ['p-henri', 'p-marie'],
      description: 'Célébration du mariage à la mairie du 6e arrondissement de Lyon après la guerre.'
    },
    {
      id: 'event-mariage-1975',
      type: 'mariage',
      title: 'Mariage de Jean-Marc Dupont et Sophie Martin',
      date: '1975-09-20',
      place: 'Bordeaux',
      coords: [44.8378, -0.5792],
      personIds: ['p-jeanmarc', 'p-sophie'],
      description: 'Mariage champêtre dans le vignoble bordelais.'
    }
  ],
  persons: [
    // Generation 1 (Great Grandparents)
    {
      id: 'p-henri',
      firstName: 'Henri',
      lastName: 'Dupont',
      gender: 'M',
      birthDate: '1920-03-14',
      birthPlace: 'Lyon',
      birthCoords: [45.7640, 4.8357],
      deathDate: '2005-11-02',
      deathPlace: 'Lyon',
      deathCoords: [45.7640, 4.8357],
      isDeceased: true,
      profession: 'Horloger',
      branch: 'paternal',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
      notes: 'Ancien artisan horloger de la Croix-Rousse, passionné de mécanique fine et d\'histoire locale.',
      spouseIds: ['p-marie'],
      unions: [
        {
          id: 'u-henri-marie',
          partnerId: 'p-marie',
          type: 'mariage',
          date: '1945-06-16',
          place: 'Lyon (69 - Rhône)',
          coords: [45.7640, 4.8357]
        }
      ],
      childrenIds: ['p-jeanmarc', 'p-claire'],
      documents: [
        {
          id: 'doc-1',
          title: 'Acte de Naissance Henri Dupont',
          category: 'acte_naissance',
          urlOrData: 'https://images.unsplash.com/photo-1583521214690-73421a1829a9?auto=format&fit=crop&q=80&w=600',
          date: '1920-03-15',
          notes: 'Extrait du registre de l\'état civil de Lyon 4e.'
        }
      ],
      successionInfo: {
        inheritanceNotes: 'Atelier d\'horlogerie transmis à Jean-Marc. Collection de montres anciennes conservée dans le coffre familial.',
        legalDocumentsNotes: 'Acte de notoriété dressé par Maître Brossard à Lyon.',
        willsLocation: 'Notaire Maître Brossard, Lyon 2e'
      },
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T10:00:00Z'
    },
    {
      id: 'p-marie',
      firstName: 'Marie',
      lastName: 'Dupont',
      maidenName: 'Bernard',
      gender: 'F',
      birthDate: '1923-08-22',
      birthPlace: 'Grenoble',
      birthCoords: [45.1885, 5.7245],
      deathDate: '2012-04-18',
      deathPlace: 'Lyon',
      deathCoords: [45.7640, 4.8357],
      isDeceased: true,
      profession: 'Institutrice',
      branch: 'paternal',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      notes: 'Enseignante dévouée pendant 35 ans à l\'école primaire des Brotteaux.',
      spouseIds: ['p-henri'],
      unions: [
        {
          id: 'u-marie-henri',
          partnerId: 'p-henri',
          type: 'mariage',
          date: '1945-06-16',
          place: 'Lyon (69 - Rhône)',
          coords: [45.7640, 4.8357]
        }
      ],
      childrenIds: ['p-jeanmarc', 'p-claire'],
      documents: [],
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T10:00:00Z'
    },
    {
      id: 'p-pierre',
      firstName: 'Pierre',
      lastName: 'Martin',
      gender: 'M',
      birthDate: '1922-01-05',
      birthPlace: 'Bordeaux',
      birthCoords: [44.8378, -0.5792],
      deathDate: '1998-09-30',
      deathPlace: 'Bordeaux',
      deathCoords: [44.8378, -0.5792],
      isDeceased: true,
      profession: 'Viticulteur',
      branch: 'maternal',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      notes: 'Fondateur du domaine familial Martin dans le Haut-Médoc.',
      spouseIds: ['p-jeanne'],
      unions: [
        {
          id: 'u-pierre-jeanne',
          partnerId: 'p-jeanne',
          type: 'mariage',
          date: '1948-04-12',
          place: 'Bordeaux (33 - Gironde)',
          coords: [44.8378, -0.5792]
        }
      ],
      childrenIds: ['p-sophie'],
      documents: [],
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T10:00:00Z'
    },
    {
      id: 'p-jeanne',
      firstName: 'Jeanne',
      lastName: 'Martin',
      maidenName: 'Lefebvre',
      gender: 'F',
      birthDate: '1925-05-19',
      birthPlace: 'Toulouse',
      birthCoords: [43.6047, 1.4442],
      deathDate: '2015-02-10',
      deathPlace: 'Bordeaux',
      deathCoords: [44.8378, -0.5792],
      isDeceased: true,
      profession: 'Comptable',
      branch: 'maternal',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
      notes: 'Gérait les comptes du vignoble.',
      spouseIds: ['p-pierre'],
      unions: [
        {
          id: 'u-jeanne-pierre',
          partnerId: 'p-pierre',
          type: 'mariage',
          date: '1948-04-12',
          place: 'Bordeaux (33 - Gironde)',
          coords: [44.8378, -0.5792]
        }
      ],
      childrenIds: ['p-sophie'],
      documents: [],
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T10:00:00Z'
    },

    // Generation 2 (Grandparents / Parents)
    {
      id: 'p-jeanmarc',
      firstName: 'Jean-Marc',
      lastName: 'Dupont',
      gender: 'M',
      birthDate: '1950-02-11',
      birthPlace: 'Lyon',
      birthCoords: [45.7640, 4.8357],
      isDeceased: false,
      profession: 'Ingénieur civil',
      branch: 'paternal',
      fatherId: 'p-henri',
      motherId: 'p-marie',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
      notes: 'Passiomé d\'astronomie et de randonnée en haute montagne.',
      spouseIds: ['p-sophie'],
      unions: [
        {
          id: 'u-jeanmarc-sophie',
          partnerId: 'p-sophie',
          type: 'mariage',
          date: '1975-09-20',
          place: 'Bordeaux (33 - Gironde)',
          coords: [44.8378, -0.5792]
        }
      ],
      childrenIds: ['p-alexandre', 'p-julie'],
      documents: [],
      successionInfo: {
        inheritanceNotes: 'Maison de campagne dans le Beaujolais.',
        legalDocumentsNotes: 'Donation au dernier vivant signée en 2010.'
      },
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T10:00:00Z'
    },
    {
      id: 'p-sophie',
      firstName: 'Sophie',
      lastName: 'Dupont',
      maidenName: 'Martin',
      gender: 'F',
      birthDate: '1953-06-25',
      birthPlace: 'Bordeaux',
      birthCoords: [44.8378, -0.5792],
      isDeceased: false,
      profession: 'Architecte d\'intérieur',
      branch: 'maternal',
      fatherId: 'p-pierre',
      motherId: 'p-jeanne',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
      notes: 'Peintre à ses heures perdues.',
      spouseIds: ['p-jeanmarc'],
      unions: [
        {
          id: 'u-sophie-jeanmarc',
          partnerId: 'p-jeanmarc',
          type: 'mariage',
          date: '1975-09-20',
          place: 'Bordeaux (33 - Gironde)',
          coords: [44.8378, -0.5792]
        }
      ],
      childrenIds: ['p-alexandre', 'p-julie'],
      documents: [],
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T10:00:00Z'
    },
    {
      id: 'p-claire',
      firstName: 'Claire',
      lastName: 'Dupont',
      gender: 'F',
      birthDate: '1955-11-08',
      birthPlace: 'Lyon',
      birthCoords: [45.7640, 4.8357],
      isDeceased: false,
      profession: 'Médecin pédiatre',
      branch: 'paternal',
      fatherId: 'p-henri',
      motherId: 'p-marie',
      photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
      notes: 'Tante de la branche lyonnaise.',
      spouseIds: [],
      childrenIds: [],
      documents: [],
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T10:00:00Z'
    },

    // Generation 3 (Current generation)
    {
      id: 'p-alexandre',
      firstName: 'Alexandre',
      lastName: 'Dupont',
      gender: 'M',
      birthDate: '1982-04-17',
      birthPlace: 'Paris',
      birthCoords: [48.8566, 2.3522],
      isDeceased: false,
      profession: 'Développeur logiciel',
      branch: 'paternal',
      fatherId: 'p-jeanmarc',
      motherId: 'p-sophie',
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300',
      notes: 'Créateur de la sauvegarde chiffrée de l\'arbre familial.',
      spouseIds: ['p-camille'],
      unions: [
        {
          id: 'u-alexandre-camille',
          partnerId: 'p-camille',
          type: 'pacs',
          date: '2010-06-18',
          place: 'Paris (75)',
          coords: [48.8566, 2.3522]
        }
      ],
      childrenIds: ['p-leo', 'p-emma'],
      documents: [],
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T10:00:00Z'
    },
    {
      id: 'p-camille',
      firstName: 'Camille',
      lastName: 'Dupont',
      maidenName: 'Rousseau',
      gender: 'F',
      birthDate: '1985-09-03',
      birthPlace: 'Nantes',
      birthCoords: [47.2184, -1.5536],
      isDeceased: false,
      profession: 'Journaliste',
      branch: 'inlaw',
      photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
      notes: 'Épouse d\'Alexandre.',
      spouseIds: ['p-alexandre'],
      unions: [
        {
          id: 'u-camille-alexandre',
          partnerId: 'p-alexandre',
          type: 'pacs',
          date: '2010-06-18',
          place: 'Paris (75)',
          coords: [48.8566, 2.3522]
        }
      ],
      childrenIds: ['p-leo', 'p-emma'],
      documents: [],
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T10:00:00Z'
    },
    {
      id: 'p-julie',
      firstName: 'Julie',
      lastName: 'Dupont',
      gender: 'F',
      birthDate: '1988-12-19',
      birthPlace: 'Paris',
      birthCoords: [48.8566, 2.3522],
      isDeceased: false,
      profession: 'Avocate',
      branch: 'paternal',
      fatherId: 'p-jeanmarc',
      motherId: 'p-sophie',
      photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=300',
      notes: 'Spécialisée en droit de la famille.',
      spouseIds: [],
      childrenIds: [],
      documents: [],
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T10:00:00Z'
    },

    // Generation 4 (Children)
    {
      id: 'p-leo',
      firstName: 'Léo',
      lastName: 'Dupont',
      gender: 'M',
      birthDate: '2014-05-10',
      birthPlace: 'Paris',
      birthCoords: [48.8566, 2.3522],
      isDeceased: false,
      branch: 'paternal',
      fatherId: 'p-alexandre',
      motherId: 'p-camille',
      photoUrl: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&q=80&w=300',
      notes: 'Aime le football et les Lego.',
      spouseIds: [],
      childrenIds: [],
      documents: [],
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T10:00:00Z'
    },
    {
      id: 'p-emma',
      firstName: 'Emma',
      lastName: 'Dupont',
      gender: 'F',
      birthDate: '2018-09-28',
      birthPlace: 'Paris',
      birthCoords: [48.8566, 2.3522],
      isDeceased: false,
      branch: 'paternal',
      fatherId: 'p-alexandre',
      motherId: 'p-camille',
      photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
      notes: 'Cadette de la famille.',
      spouseIds: [],
      childrenIds: [],
      documents: [],
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T10:00:00Z'
    }
  ]
};

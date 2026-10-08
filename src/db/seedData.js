/**
 * TripMate Seed Data
 * Initial mock data for verification, testing, and grading evaluation
 */

const bcrypt = require('bcryptjs');

function getSeedData() {
  const salt = bcrypt.genSaltSync(10);
  const userPasswordHash = bcrypt.hashSync('SecurePass123!', salt);
  const adminPasswordHash = bcrypt.hashSync('AdminPass123!', salt);

  const users = [
    {
      id: 'usr-alice-01',
      name: 'Alice Chen',
      email: 'alice@tripmate.io',
      passwordHash: userPasswordHash,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      createdAt: '2026-03-01T10:00:00.000Z'
    },
    {
      id: 'usr-bob-02',
      name: 'Bob Smith',
      email: 'bob@tripmate.io',
      passwordHash: userPasswordHash,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      createdAt: '2026-03-02T11:00:00.000Z'
    },
    {
      id: 'usr-charlie-03',
      name: 'Charlie Davis',
      email: 'charlie@tripmate.io',
      passwordHash: userPasswordHash,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      createdAt: '2026-03-03T12:00:00.000Z'
    },
    {
      id: 'usr-admin-00',
      name: 'Security Admin',
      email: 'admin@tripmate.io',
      passwordHash: adminPasswordHash,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: '2026-01-01T08:00:00.000Z'
    }
  ];

  const trips = [
    {
      id: 'trip-swiss-alps-01',
      title: 'Swiss Alps & Mediterranean Odyssey',
      description: 'Collaborative summer exploration across Switzerland and the French Riviera with glacier hikes, scenic trains, and coastal dining.',
      destinationSummary: 'Zurich, Interlaken, Nice, Monaco',
      startDate: '2026-07-10',
      endDate: '2026-07-22',
      budget: 5200.00,
      currency: 'USD',
      coverGradient: 'linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)',
      isPrivate: false,
      ownerId: 'usr-alice-01',
      createdAt: '2026-03-05T09:30:00.000Z',
      updatedAt: '2026-03-05T09:30:00.000Z'
    },
    {
      id: 'trip-japan-kyoto-02',
      title: 'Kyoto & Tokyo Blossom Expedition',
      description: 'Exploring ancient shrines, high-speed Shinkansen transit, ramen alleys, and digital art museums.',
      destinationSummary: 'Tokyo, Hakone, Kyoto, Osaka',
      startDate: '2026-09-01',
      endDate: '2026-09-14',
      budget: 4800.00,
      currency: 'USD',
      coverGradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
      isPrivate: true,
      ownerId: 'usr-bob-02',
      createdAt: '2026-03-10T14:15:00.000Z',
      updatedAt: '2026-03-10T14:15:00.000Z'
    }
  ];

  const collaborators = [
    // Trip 1 Collaborators
    {
      id: 'collab-01',
      tripId: 'trip-swiss-alps-01',
      userId: 'usr-alice-01',
      role: 'owner',
      invitedBy: 'usr-alice-01',
      joinedAt: '2026-03-05T09:30:00.000Z'
    },
    {
      id: 'collab-02',
      tripId: 'trip-swiss-alps-01',
      userId: 'usr-bob-02',
      role: 'editor',
      invitedBy: 'usr-alice-01',
      joinedAt: '2026-03-06T10:00:00.000Z'
    },
    {
      id: 'collab-03',
      tripId: 'trip-swiss-alps-01',
      userId: 'usr-charlie-03',
      role: 'viewer',
      invitedBy: 'usr-alice-01',
      joinedAt: '2026-03-06T11:20:00.000Z'
    },
    // Trip 2 Collaborators
    {
      id: 'collab-04',
      tripId: 'trip-japan-kyoto-02',
      userId: 'usr-bob-02',
      role: 'owner',
      invitedBy: 'usr-bob-02',
      joinedAt: '2026-03-10T14:15:00.000Z'
    },
    {
      id: 'collab-05',
      tripId: 'trip-japan-kyoto-02',
      userId: 'usr-alice-01',
      role: 'editor',
      invitedBy: 'usr-bob-02',
      joinedAt: '2026-03-11T09:00:00.000Z'
    }
  ];

  const destinations = [
    {
      id: 'dest-01',
      tripId: 'trip-swiss-alps-01',
      name: 'Zurich Old Town & Lake',
      city: 'Zurich',
      country: 'Switzerland',
      arrivalDate: '2026-07-10',
      departureDate: '2026-07-13',
      orderIndex: 1,
      notes: 'Lakeside promenade, Altstadt medieval architecture, Lindenhof viewpoint.',
      createdAt: '2026-03-05T10:00:00.000Z'
    },
    {
      id: 'dest-02',
      tripId: 'trip-swiss-alps-01',
      name: 'Interlaken & Jungfrau Region',
      city: 'Interlaken',
      country: 'Switzerland',
      arrivalDate: '2026-07-13',
      departureDate: '2026-07-17',
      orderIndex: 2,
      notes: 'Alpine basecamp between Lake Thun and Brienz. High peak cogwheel railway.',
      createdAt: '2026-03-05T10:05:00.000Z'
    },
    {
      id: 'dest-03',
      tripId: 'trip-swiss-alps-01',
      name: 'Nice & French Riviera Coast',
      city: 'Nice',
      country: 'France',
      arrivalDate: '2026-07-17',
      departureDate: '2026-07-22',
      orderIndex: 3,
      notes: 'Promenade des Anglais, Mediterranean beach relaxation, day trip to Monaco.',
      createdAt: '2026-03-05T10:10:00.000Z'
    }
  ];

  const itinerary = [
    {
      id: 'itin-01',
      tripId: 'trip-swiss-alps-01',
      destinationId: 'dest-01',
      dayNumber: 1,
      date: '2026-07-10',
      title: 'Arrival & Check-in at Hotel Schweizerhof',
      time: '14:00',
      location: 'Bahnhofplatz 7, 8001 Zurich',
      estimatedCost: 280.00,
      assignedToUserId: 'usr-alice-01',
      isCompleted: true,
      notes: 'Pick up Swiss Travel Passes at the station terminal counter.',
      createdAt: '2026-03-05T10:30:00.000Z'
    },
    {
      id: 'itin-02',
      tripId: 'trip-swiss-alps-01',
      destinationId: 'dest-01',
      dayNumber: 2,
      date: '2026-07-11',
      title: 'Lake Zurich Sunset Boat Cruise & Dinner',
      time: '18:30',
      location: 'Bürkliplatz Pier, Zurich',
      estimatedCost: 140.00,
      assignedToUserId: 'usr-bob-02',
      isCompleted: false,
      notes: 'Book outdoor upper-deck reservation in advance.',
      createdAt: '2026-03-05T10:35:00.000Z'
    },
    {
      id: 'itin-03',
      tripId: 'trip-swiss-alps-01',
      destinationId: 'dest-02',
      dayNumber: 4,
      date: '2026-07-14',
      title: 'Jungfraujoch - Top of Europe Glacier Ascent',
      time: '08:30',
      location: 'Grindelwald Terminal to Eiger Glacier',
      estimatedCost: 450.00,
      assignedToUserId: 'usr-bob-02',
      isCompleted: false,
      notes: 'High-altitude warm gear required. Check webcam weather early morning.',
      createdAt: '2026-03-05T10:40:00.000Z'
    },
    {
      id: 'itin-04',
      tripId: 'trip-swiss-alps-01',
      destinationId: 'dest-03',
      dayNumber: 8,
      date: '2026-07-18',
      title: 'Promenade des Anglais & Old Town Food Tour',
      time: '10:00',
      location: 'Vieux Nice Markets',
      estimatedCost: 95.00,
      assignedToUserId: 'usr-charlie-03',
      isCompleted: false,
      notes: 'Try authentic Socca and Salade Niçoise in Cours Saleya.',
      createdAt: '2026-03-05T10:45:00.000Z'
    }
  ];

  const expenses = [
    {
      id: 'exp-01',
      tripId: 'trip-swiss-alps-01',
      title: 'Swiss International Airfares (Group Booking)',
      amount: 1260.00,
      currency: 'USD',
      category: 'Flights',
      paidByUserId: 'usr-alice-01',
      splitType: 'equal',
      splitWithUserIds: ['usr-alice-01', 'usr-bob-02', 'usr-charlie-03'],
      isSettled: false,
      receiptNote: 'Swiss Air group booking ref #LX-94029. Split equally among 3 travelers ($420 each).',
      createdAt: '2026-03-05T11:00:00.000Z'
    },
    {
      id: 'exp-02',
      tripId: 'trip-swiss-alps-01',
      title: 'Interlaken Chalet Rental 4 Nights',
      amount: 840.00,
      currency: 'USD',
      category: 'Accommodation',
      paidByUserId: 'usr-bob-02',
      splitType: 'equal',
      splitWithUserIds: ['usr-alice-01', 'usr-bob-02', 'usr-charlie-03'],
      isSettled: false,
      receiptNote: 'Chalet Edelweiss confirmation #AIRBNB-CH-481. Split 3 ways ($280 each).',
      createdAt: '2026-03-06T15:00:00.000Z'
    },
    {
      id: 'exp-03',
      tripId: 'trip-swiss-alps-01',
      title: 'Swiss All-in-One Rail Travel Passes',
      amount: 690.00,
      currency: 'USD',
      category: 'Transport',
      paidByUserId: 'usr-alice-01',
      splitType: 'equal',
      splitWithUserIds: ['usr-alice-01', 'usr-bob-02', 'usr-charlie-03'],
      isSettled: true,
      receiptNote: '8-day consecutive Swiss Travel Passes. Settled and confirmed.',
      createdAt: '2026-03-07T09:15:00.000Z'
    },
    {
      id: 'exp-04',
      tripId: 'trip-swiss-alps-01',
      title: 'Welcome Fondue & Wine Dinner in Zurich',
      amount: 210.00,
      currency: 'USD',
      category: 'Food',
      paidByUserId: 'usr-charlie-03',
      splitType: 'equal',
      splitWithUserIds: ['usr-alice-01', 'usr-bob-02', 'usr-charlie-03'],
      isSettled: false,
      receiptNote: 'Dinner at Swiss Chuchi. ($70 each).',
      createdAt: '2026-03-07T21:00:00.000Z'
    }
  ];

  const auditLogs = [
    {
      id: 'audit-001',
      timestamp: '2026-03-05T09:30:00.000Z',
      actorId: 'usr-alice-01',
      actorEmail: 'alice@tripmate.io',
      action: 'TRIP_CREATED',
      resourceType: 'Trip',
      resourceId: 'trip-swiss-alps-01',
      status: 'SUCCESS',
      ipAddress: '192.168.1.45',
      details: 'Created trip: Swiss Alps & Mediterranean Odyssey (Budget: $5200.00)'
    },
    {
      id: 'audit-002',
      timestamp: '2026-03-06T10:00:00.000Z',
      actorId: 'usr-alice-01',
      actorEmail: 'alice@tripmate.io',
      action: 'COLLABORATOR_INVITED',
      resourceType: 'Collaborator',
      resourceId: 'usr-bob-02',
      status: 'SUCCESS',
      ipAddress: '192.168.1.45',
      details: 'Assigned role: EDITOR to bob@tripmate.io'
    },
    {
      id: 'audit-003',
      timestamp: '2026-03-06T11:20:00.000Z',
      actorId: 'usr-alice-01',
      actorEmail: 'alice@tripmate.io',
      action: 'COLLABORATOR_INVITED',
      resourceType: 'Collaborator',
      resourceId: 'usr-charlie-03',
      status: 'SUCCESS',
      ipAddress: '192.168.1.45',
      details: 'Assigned role: VIEWER to charlie@tripmate.io'
    },
    {
      id: 'audit-004',
      timestamp: '2026-03-07T12:00:00.000Z',
      actorId: 'usr-charlie-03',
      actorEmail: 'charlie@tripmate.io',
      action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      resourceType: 'Trip',
      resourceId: 'trip-swiss-alps-01',
      status: 'BLOCKED_403',
      ipAddress: '192.168.1.88',
      details: 'Viewer role attempted DELETE action on trip-swiss-alps-01. Access control denied.'
    }
  ];

  return { users, trips, collaborators, destinations, itinerary, expenses, auditLogs };
}

module.exports = { getSeedData };

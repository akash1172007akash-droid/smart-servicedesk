// In-memory demo store for GitHub Pages standalone presentation
export const MOCK_USERS = [
  { id: 1, fullName: 'Alex Vance (Admin)', email: 'admin@example.com', role: 'ADMIN', status: 'ACTIVE', createdAt: '2026-09-01T10:00:00' },
  { id: 2, fullName: 'John Miller (Support)', email: 'agent@example.com', role: 'SUPPORT_AGENT', status: 'ACTIVE', createdAt: '2026-09-02T11:00:00' },
  { id: 3, fullName: 'Sarah Jenkins (Support)', email: 'agent2@example.com', role: 'SUPPORT_AGENT', status: 'ACTIVE', createdAt: '2026-09-02T11:30:00' },
  { id: 4, fullName: 'David Chen', email: 'employee@example.com', role: 'EMPLOYEE', status: 'ACTIVE', createdAt: '2026-09-05T09:00:00' },
  { id: 5, fullName: 'Emily Watson', email: 'employee2@example.com', role: 'EMPLOYEE', status: 'ACTIVE', createdAt: '2026-09-06T14:00:00' },
  { id: 6, fullName: 'Marcus Brody', email: 'employee3@example.com', role: 'EMPLOYEE', status: 'ACTIVE', createdAt: '2026-09-07T16:00:00' },
];

export const MOCK_CATEGORIES = [
  { id: 1, name: 'Hardware', description: 'Physical computing equipment, monitors, peripherals', isActive: true, createdAt: '2026-09-01T09:00:00' },
  { id: 2, name: 'Software', description: 'Licensed application installations, upgrades, OS errors', isActive: true, createdAt: '2026-09-01T09:00:00' },
  { id: 3, name: 'Network', description: 'Office Wi-Fi, VPN connectivity, LAN routing', isActive: true, createdAt: '2026-09-01T09:00:00' },
  { id: 4, name: 'Email', description: 'Outlook configuration, distribution lists, spam filters', isActive: true, createdAt: '2026-09-01T09:00:00' },
  { id: 5, name: 'Account Access', description: 'SSO logins, Active Directory, MFA tokens', isActive: true, createdAt: '2026-09-01T09:00:00' },
  { id: 6, name: 'Security', description: 'Vulnerability reports, phishing flags, antivirus alerts', isActive: true, createdAt: '2026-09-01T09:00:00' },
  { id: 7, name: 'Printer', description: 'Network printer mapping, toner replacement', isActive: true, createdAt: '2026-09-01T09:00:00' },
  { id: 8, name: 'Other', description: 'General IT queries and service requests', isActive: true, createdAt: '2026-09-01T09:00:00' },
];

export const initialTickets = [
  {
    id: 1,
    ticketNumber: 'INC-2026-00001',
    title: 'Phishing email targeting finance department',
    description: 'Multiple finance team members received suspicious wire transfer requests disguised as vendor invoices.',
    category: MOCK_CATEGORIES[5],
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    createdBy: MOCK_USERS[3],
    assignedTo: MOCK_USERS[1],
    resolutionNotes: null,
    createdAt: '2026-09-24T08:30:00',
    updatedAt: '2026-09-24T09:15:00',
    resolvedAt: null,
    closedAt: null,
    comments: [
      { id: 1, user: MOCK_USERS[3], commentText: 'Attached the headers of the malicious email for reference.', createdAt: '2026-09-24T08:35:00' },
      { id: 2, user: MOCK_USERS[1], commentText: 'Identified spoofed domain. Blocked IP range at firewall level.', createdAt: '2026-09-24T09:15:00' }
    ],
    attachments: [],
    history: [
      { id: 1, performedBy: MOCK_USERS[3], action: 'Ticket Created', details: 'Ticket INC-2026-00001 created by David Chen', createdAt: '2026-09-24T08:30:00' },
      { id: 2, performedBy: MOCK_USERS[1], action: 'Ticket Assigned', details: 'Assigned to John Miller (Support)', createdAt: '2026-09-24T08:45:00' },
      { id: 3, performedBy: MOCK_USERS[1], action: 'Status Changed', details: 'Status changed from ASSIGNED to IN_PROGRESS', createdAt: '2026-09-24T09:00:00' }
    ]
  },
  {
    id: 2,
    ticketNumber: 'INC-2026-00002',
    title: 'Global VPN gateway timing out for remote engineering team',
    description: 'Engineers in the US-West region cannot authenticate to the staging Kubernetes cluster via OpenVPN.',
    category: MOCK_CATEGORIES[2],
    priority: 'HIGH',
    status: 'ASSIGNED',
    createdBy: MOCK_USERS[4],
    assignedTo: MOCK_USERS[2],
    resolutionNotes: null,
    createdAt: '2026-09-24T09:00:00',
    updatedAt: '2026-09-24T09:30:00',
    resolvedAt: null,
    closedAt: null,
    comments: [
      { id: 3, user: MOCK_USERS[2], commentText: 'Investigating LDAP sync latency on the gateway server.', createdAt: '2026-09-24T09:30:00' }
    ],
    attachments: [],
    history: [
      { id: 4, performedBy: MOCK_USERS[4], action: 'Ticket Created', details: 'Ticket created by Emily Watson', createdAt: '2026-09-24T09:00:00' },
      { id: 5, performedBy: MOCK_USERS[2], action: 'Ticket Assigned', details: 'Assigned to Sarah Jenkins (Support)', createdAt: '2026-09-24T09:15:00' }
    ]
  },
  {
    id: 3,
    ticketNumber: 'INC-2026-00003',
    title: 'Core switch flapping in Server Room B',
    description: 'Intermittent packet drop detected on rack 4. Uplink LED showing amber blinking state.',
    category: MOCK_CATEGORIES[0],
    priority: 'CRITICAL',
    status: 'OPEN',
    createdBy: MOCK_USERS[5],
    assignedTo: null,
    resolutionNotes: null,
    createdAt: '2026-09-24T10:00:00',
    updatedAt: '2026-09-24T10:00:00',
    resolvedAt: null,
    closedAt: null,
    comments: [],
    attachments: [],
    history: [
      { id: 6, performedBy: MOCK_USERS[5], action: 'Ticket Created', details: 'Ticket created by Marcus Brody', createdAt: '2026-09-24T10:00:00' }
    ]
  },
  {
    id: 4,
    ticketNumber: 'INC-2026-00004',
    title: 'IntelliJ IDEA Ultimate license key renewal required',
    description: 'My corporate license expired yesterday. Need renewal for backend Java microservices development.',
    category: MOCK_CATEGORIES[1],
    priority: 'MEDIUM',
    status: 'RESOLVED',
    createdBy: MOCK_USERS[3],
    assignedTo: MOCK_USERS[1],
    resolutionNotes: 'Assigned available seat from JetBrains corporate portal pool. Sent invite activation link.',
    createdAt: '2026-09-23T11:00:00',
    updatedAt: '2026-09-23T14:00:00',
    resolvedAt: '2026-09-23T14:00:00',
    closedAt: null,
    comments: [
      { id: 4, user: MOCK_USERS[1], commentText: 'License key allocated and tied to your corporate email.', createdAt: '2026-09-23T13:45:00' }
    ],
    attachments: [],
    history: [
      { id: 7, performedBy: MOCK_USERS[3], action: 'Ticket Created', details: 'Ticket created by David Chen', createdAt: '2026-09-23T11:00:00' },
      { id: 8, performedBy: MOCK_USERS[1], action: 'Status Changed', details: 'Marked as RESOLVED by John Miller', createdAt: '2026-09-23T14:00:00' }
    ]
  },
  {
    id: 5,
    ticketNumber: 'INC-2026-00005',
    title: 'Floor 3 East printer showing Paper Jam error',
    description: 'The HP LaserJet Enterprise printer in corridor 3B has a roller jam message despite empty tray.',
    category: MOCK_CATEGORIES[6],
    priority: 'LOW',
    status: 'CLOSED',
    createdBy: MOCK_USERS[4],
    assignedTo: MOCK_USERS[2],
    resolutionNotes: 'Cleared paper fragment stuck inside the fuser unit roller and ran test print alignment successfully.',
    createdAt: '2026-09-22T09:00:00',
    updatedAt: '2026-09-22T15:00:00',
    resolvedAt: '2026-09-22T14:00:00',
    closedAt: '2026-09-22T15:00:00',
    comments: [
      { id: 5, user: MOCK_USERS[2], commentText: 'On-site technician removed foreign object from tray 2.', createdAt: '2026-09-22T13:30:00' },
      { id: 6, user: MOCK_USERS[4], commentText: 'Confirmed print test passed. Closing ticket.', createdAt: '2026-09-22T15:00:00' }
    ],
    attachments: [],
    history: [
      { id: 9, performedBy: MOCK_USERS[4], action: 'Ticket Created', details: 'Ticket created by Emily Watson', createdAt: '2026-09-22T09:00:00' },
      { id: 10, performedBy: MOCK_USERS[4], action: 'Ticket Closed', details: 'Emily Watson confirmed resolution and closed ticket', createdAt: '2026-09-22T15:00:00' }
    ]
  }
];

class MockStore {
  constructor() {
    const saved = localStorage.getItem('demo_tickets');
    this.tickets = saved ? JSON.parse(saved) : initialTickets;
    this.users = [...MOCK_USERS];
    this.categories = [...MOCK_CATEGORIES];
  }

  save() {
    localStorage.setItem('demo_tickets', JSON.stringify(this.tickets));
  }

  getTickets(params = {}) {
    let list = [...this.tickets];
    if (params.status) list = list.filter(t => t.status === params.status);
    if (params.priority) list = list.filter(t => t.priority === params.priority);
    if (params.categoryId) list = list.filter(t => t.category?.id == params.categoryId);
    if (params.unassignedOnly) list = list.filter(t => !t.assignedTo);
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.ticketNumber.toLowerCase().includes(q));
    }
    const page = params.page || 0;
    const size = params.size || 10;
    const start = page * size;
    const content = list.slice(start, start + size);
    return {
      content,
      pageNumber: page,
      pageSize: size,
      totalElements: list.length,
      totalPages: Math.ceil(list.length / size) || 1,
      last: start + size >= list.length
    };
  }

  getTicketById(id) {
    const ticket = this.tickets.find(t => t.id == id);
    if (!ticket) return null;
    return {
      ticket,
      comments: ticket.comments || [],
      attachments: ticket.attachments || [],
      history: ticket.history || []
    };
  }

  createTicket(data, currentUser) {
    const category = this.categories.find(c => c.id == data.categoryId) || this.categories[0];
    const newId = this.tickets.length + 1;
    const newNumber = `INC-2026-${String(newId).padStart(5, '0')}`;
    const newTicket = {
      id: newId,
      ticketNumber: newNumber,
      title: data.title,
      description: data.description,
      category,
      priority: data.priority || 'MEDIUM',
      status: 'OPEN',
      createdBy: currentUser,
      assignedTo: null,
      resolutionNotes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
      closedAt: null,
      comments: [],
      attachments: [],
      history: [
        {
          id: Date.now(),
          performedBy: currentUser,
          action: 'Ticket Created',
          details: `Ticket ${newNumber} created by ${currentUser?.fullName || 'User'}`,
          createdAt: new Date().toISOString()
        }
      ]
    };
    this.tickets.unshift(newTicket);
    this.save();
    return newTicket;
  }

  updateStatus(id, newStatus, resolutionNotes, currentUser) {
    const ticket = this.tickets.find(t => t.id == id);
    if (!ticket) return null;
    const oldStatus = ticket.status;
    ticket.status = newStatus;
    ticket.updatedAt = new Date().toISOString();
    if (newStatus === 'RESOLVED') {
      ticket.resolutionNotes = resolutionNotes;
      ticket.resolvedAt = new Date().toISOString();
    } else if (newStatus === 'CLOSED') {
      ticket.closedAt = new Date().toISOString();
    }
    ticket.history.unshift({
      id: Date.now(),
      performedBy: currentUser,
      action: 'Status Changed',
      details: `${currentUser?.fullName || 'User'} changed status from ${oldStatus} to ${newStatus}`,
      createdAt: new Date().toISOString()
    });
    this.save();
    return ticket;
  }

  updatePriority(id, priority, currentUser) {
    const ticket = this.tickets.find(t => t.id == id);
    if (!ticket) return null;
    const oldP = ticket.priority;
    ticket.priority = priority;
    ticket.updatedAt = new Date().toISOString();
    ticket.history.unshift({
      id: Date.now(),
      performedBy: currentUser,
      action: 'Priority Changed',
      details: `${currentUser?.fullName || 'User'} changed priority from ${oldP} to ${priority}`,
      createdAt: new Date().toISOString()
    });
    this.save();
    return ticket;
  }

  assignTicket(id, agentId, currentUser) {
    const ticket = this.tickets.find(t => t.id == id);
    if (!ticket) return null;
    const agent = this.users.find(u => u.id == agentId) || currentUser;
    ticket.assignedTo = agent;
    if (ticket.status === 'OPEN') ticket.status = 'ASSIGNED';
    ticket.updatedAt = new Date().toISOString();
    ticket.history.unshift({
      id: Date.now(),
      performedBy: currentUser,
      action: 'Ticket Assigned',
      details: `${currentUser?.fullName || 'User'} assigned ticket to ${agent.fullName}`,
      createdAt: new Date().toISOString()
    });
    this.save();
    return ticket;
  }

  addComment(id, text, currentUser) {
    const ticket = this.tickets.find(t => t.id == id);
    if (!ticket) return null;
    const comment = {
      id: Date.now(),
      user: currentUser,
      commentText: text,
      createdAt: new Date().toISOString()
    };
    ticket.comments = ticket.comments || [];
    ticket.comments.push(comment);
    ticket.history.unshift({
      id: Date.now(),
      performedBy: currentUser,
      action: 'Comment Added',
      details: `${currentUser?.fullName || 'User'} added a comment`,
      createdAt: new Date().toISOString()
    });
    this.save();
    return comment;
  }

  getAdminDashboard() {
    const open = this.tickets.filter(t => t.status === 'OPEN').length;
    const inProgress = this.tickets.filter(t => t.status === 'IN_PROGRESS').length;
    const resolved = this.tickets.filter(t => t.status === 'RESOLVED').length;
    const closed = this.tickets.filter(t => t.status === 'CLOSED').length;
    const critical = this.tickets.filter(t => t.priority === 'CRITICAL' && t.status !== 'CLOSED').length;
    return {
      totalTickets: this.tickets.length,
      openTickets: open,
      inProgressTickets: inProgress,
      resolvedTickets: resolved,
      closedTickets: closed,
      criticalTickets: critical,
      totalUsers: this.users.length,
      activeAgents: 2,
      statusDistribution: [
        { name: 'OPEN', value: open },
        { name: 'ASSIGNED', value: this.tickets.filter(t => t.status === 'ASSIGNED').length },
        { name: 'IN_PROGRESS', value: inProgress },
        { name: 'RESOLVED', value: resolved },
        { name: 'CLOSED', value: closed }
      ],
      priorityDistribution: [
        { name: 'LOW', value: this.tickets.filter(t => t.priority === 'LOW').length },
        { name: 'MEDIUM', value: this.tickets.filter(t => t.priority === 'MEDIUM').length },
        { name: 'HIGH', value: this.tickets.filter(t => t.priority === 'HIGH').length },
        { name: 'CRITICAL', value: this.tickets.filter(t => t.priority === 'CRITICAL').length }
      ],
      categoryDistribution: this.categories.map(c => ({
        name: c.name,
        value: this.tickets.filter(t => t.category?.id === c.id).length
      })),
      trendData: [
        { name: 'Sep 19', value: 2 },
        { name: 'Sep 20', value: 4 },
        { name: 'Sep 21', value: 3 },
        { name: 'Sep 22', value: 6 },
        { name: 'Sep 23', value: 5 },
        { name: 'Sep 24', value: 8 },
        { name: 'Sep 25', value: 4 }
      ],
      recentTickets: this.tickets.slice(0, 5)
    };
  }

  getAgentDashboard(currentAgent) {
    const assigned = this.tickets.filter(t => t.assignedTo?.id == currentAgent?.id || t.assignedTo?.email == currentAgent?.email);
    const unassigned = this.tickets.filter(t => !t.assignedTo);
    return {
      assignedTickets: assigned.length,
      unassignedTickets: unassigned.length,
      openTickets: this.tickets.filter(t => t.status === 'OPEN').length,
      inProgressTickets: assigned.filter(t => t.status === 'IN_PROGRESS').length,
      highPriorityTickets: assigned.filter(t => t.priority === 'HIGH').length,
      criticalTickets: assigned.filter(t => t.priority === 'CRITICAL').length,
      myAssignedTickets: assigned,
      availableTickets: unassigned
    };
  }

  getEmployeeDashboard(currentEmployee) {
    const myTickets = this.tickets.filter(t => t.createdBy?.id == currentEmployee?.id || t.createdBy?.email == currentEmployee?.email);
    return {
      totalTickets: myTickets.length,
      openTickets: myTickets.filter(t => t.status === 'OPEN').length,
      inProgressTickets: myTickets.filter(t => t.status === 'IN_PROGRESS').length,
      resolvedTickets: myTickets.filter(t => t.status === 'RESOLVED').length,
      closedTickets: myTickets.filter(t => t.status === 'CLOSED').length,
      myTickets
    };
  }
}

export const mockStore = new MockStore();

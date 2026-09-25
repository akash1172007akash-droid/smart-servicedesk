package com.servicedesk.config;

import com.servicedesk.entity.*;
import com.servicedesk.repository.*;
import com.servicedesk.util.TicketNumberGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final TicketHistoryRepository historyRepository;
    private final PasswordEncoder passwordEncoder;
    private final TicketNumberGenerator ticketNumberGenerator;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           TicketRepository ticketRepository,
                           TicketCommentRepository commentRepository,
                           TicketHistoryRepository historyRepository,
                           PasswordEncoder passwordEncoder,
                           TicketNumberGenerator ticketNumberGenerator) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.historyRepository = historyRepository;
        this.passwordEncoder = passwordEncoder;
        this.ticketNumberGenerator = ticketNumberGenerator;
    }

    @Override
    public void run(String... args) {
        seedCategories();
        seedUsers();
        seedTickets();
    }

    private void seedCategories() {
        if (categoryRepository.count() > 0) return;

        List<Category> categories = Arrays.asList(
                new Category("Hardware", "Physical computing equipment, monitors, peripherals, laptops, docks", true),
                new Category("Software", "Licensed application installations, upgrades, OS errors, IDEs", true),
                new Category("Network", "Office Wi-Fi, VPN connectivity, LAN routing, firewall access", true),
                new Category("Email", "Outlook/Thunderbird configuration, distribution lists, spam filter issues", true),
                new Category("Account Access", "SSO logins, Active Directory accounts, password resets, MFA tokens", true),
                new Category("Security", "Vulnerability reports, phishing flags, antivirus alerts, compliance", true),
                new Category("Printer", "Network printer mapping, toner replacement, paper jam escalation", true),
                new Category("Other", "General IT queries and miscellaneous service requests", true)
        );

        categoryRepository.saveAll(categories);
        logger.info("Successfully seeded {} IT service categories.", categories.size());
    }

    private void seedUsers() {
        if (userRepository.count() > 0) return;

        List<User> users = Arrays.asList(
                new User("Alex Vance (Admin)", "admin@example.com", passwordEncoder.encode("Admin@123"), Role.ADMIN, UserStatus.ACTIVE),
                new User("John Miller (Support)", "agent@example.com", passwordEncoder.encode("Agent@123"), Role.SUPPORT_AGENT, UserStatus.ACTIVE),
                new User("Sarah Jenkins (Support)", "agent2@example.com", passwordEncoder.encode("Agent@123"), Role.SUPPORT_AGENT, UserStatus.ACTIVE),
                new User("David Chen", "employee@example.com", passwordEncoder.encode("Employee@123"), Role.EMPLOYEE, UserStatus.ACTIVE),
                new User("Emily Watson", "employee2@example.com", passwordEncoder.encode("Employee@123"), Role.EMPLOYEE, UserStatus.ACTIVE),
                new User("Marcus Brody", "employee3@example.com", passwordEncoder.encode("Employee@123"), Role.EMPLOYEE, UserStatus.ACTIVE),
                new User("Priya Sharma", "employee4@example.com", passwordEncoder.encode("Employee@123"), Role.EMPLOYEE, UserStatus.ACTIVE)
        );

        userRepository.saveAll(users);
        logger.info("Successfully seeded demo users with BCrypt credentials.");
    }

    private void seedTickets() {
        if (ticketRepository.count() > 0) return;

        User admin = userRepository.findByEmail("admin@example.com").orElse(null);
        User agent1 = userRepository.findByEmail("agent@example.com").orElse(null);
        User agent2 = userRepository.findByEmail("agent2@example.com").orElse(null);
        User emp1 = userRepository.findByEmail("employee@example.com").orElse(null);
        User emp2 = userRepository.findByEmail("employee2@example.com").orElse(null);
        User emp3 = userRepository.findByEmail("employee3@example.com").orElse(null);
        User emp4 = userRepository.findByEmail("employee4@example.com").orElse(null);

        Category catHardware = categoryRepository.findByName("Hardware").orElse(null);
        Category catSoftware = categoryRepository.findByName("Software").orElse(null);
        Category catNetwork = categoryRepository.findByName("Network").orElse(null);
        Category catEmail = categoryRepository.findByName("Email").orElse(null);
        Category catAccess = categoryRepository.findByName("Account Access").orElse(null);
        Category catSecurity = categoryRepository.findByName("Security").orElse(null);
        Category catPrinter = categoryRepository.findByName("Printer").orElse(null);

        if (admin == null || agent1 == null || emp1 == null || catHardware == null) {
            return;
        }

        // Ticket 1: Critical Security Incident - In Progress
        createSampleTicket(
                "Phishing email targeting finance department",
                "Multiple finance team members received suspicious wire transfer requests disguised as vendor invoices.",
                catSecurity, TicketPriority.CRITICAL, TicketStatus.IN_PROGRESS,
                emp1, agent1, null,
                Arrays.asList(
                        new CommentData(emp1, "Attached the headers of the malicious email for reference."),
                        new CommentData(agent1, "Identified spoofed domain. Blocked IP range at firewall level and purged from Exchange queues.")
                )
        );

        // Ticket 2: High Network VPN Issue - Assigned
        createSampleTicket(
                "Global VPN gateway timing out for remote engineering team",
                "Engineers in the US-West region cannot authenticate to the staging Kubernetes cluster via OpenVPN.",
                catNetwork, TicketPriority.HIGH, TicketStatus.ASSIGNED,
                emp2, agent2, null,
                Collections.singletonList(
                        new CommentData(agent2, "Investigating LDAP sync latency on the gateway server.")
                )
        );

        // Ticket 3: Critical Hardware Failure - Open (Unassigned)
        createSampleTicket(
                "Core switch flapping in Server Room B",
                "Intermittent packet drop detected on rack 4. Uplink LED showing amber blinking state.",
                catHardware, TicketPriority.CRITICAL, TicketStatus.OPEN,
                emp3, null, null,
                Collections.emptyList()
        );

        // Ticket 4: Medium Software License - Resolved
        createSampleTicket(
                "IntelliJ IDEA Ultimate license key renewal required",
                "My corporate license expired yesterday. Need renewal for backend Java microservices development.",
                catSoftware, TicketPriority.MEDIUM, TicketStatus.RESOLVED,
                emp4, agent1,
                "Assigned available seat from JetBrains corporate portal pool. Sent invite activation link to user.",
                Arrays.asList(
                        new CommentData(agent1, "License key allocated and tied to your corporate email."),
                        new CommentData(emp4, "Activated successfully! Thanks for the fast response.")
                )
        );

        // Ticket 5: Low Printer Issue - Closed
        createSampleTicket(
                "Floor 3 East printer showing Paper Jam error",
                "The HP LaserJet Enterprise printer in corridor 3B has a roller jam message despite empty tray.",
                catPrinter, TicketPriority.LOW, TicketStatus.CLOSED,
                emp1, agent2,
                "Cleared paper fragment stuck inside the fuser unit roller and ran test print alignment successfully.",
                Arrays.asList(
                        new CommentData(agent2, "On-site technician removed foreign object from tray 2."),
                        new CommentData(emp1, "Confirmed print test passed. Closing ticket.")
                )
        );

        // Ticket 6: High Account Access - In Progress
        createSampleTicket(
                "AWS IAM permissions required for S3 data analytics pipeline",
                "New data engineer onboarding: requires read-only access to analytics-raw-data-bucket.",
                catAccess, TicketPriority.HIGH, TicketStatus.IN_PROGRESS,
                emp2, agent1, null,
                Collections.singletonList(
                        new CommentData(agent1, "Security approval received from lead architect. Applying terraform policy.")
                )
        );

        // Ticket 7: Medium Email Issue - Open
        createSampleTicket(
                "Unable to send outbound emails to external domains",
                "Outgoing emails to non-company addresses bounce back with error 550 DKIM validation failed.",
                catEmail, TicketPriority.MEDIUM, TicketStatus.OPEN,
                emp3, null, null,
                Collections.emptyList()
        );

        // Ticket 8: Critical Production DB - In Progress
        createSampleTicket(
                "Customer portal login degradation - Latency spike",
                "API gateway reporting 504 gateway timeouts on /auth/oauth/token endpoint.",
                catSoftware, TicketPriority.CRITICAL, TicketStatus.IN_PROGRESS,
                emp4, agent2, null,
                Arrays.asList(
                        new CommentData(agent2, "Scaled connection pool size and restarted redis cache cluster.")
                )
        );

        // Ticket 9: Low Hardware Request - Resolved
        createSampleTicket(
                "Second external monitor and USB-C dock request",
                "Setting up hybrid workstation in Pod C. Requesting 27-inch Dell display and docking station.",
                catHardware, TicketPriority.LOW, TicketStatus.RESOLVED,
                emp1, agent1,
                "Delivered Dell U2723QE monitor and Thunderbolt 4 dock to desk C-14.",
                Collections.singletonList(
                        new CommentData(agent1, "Hardware delivered and checked for power/display output.")
                )
        );

        // Ticket 10: Medium Account Access - Closed
        createSampleTicket(
                "GitHub Organization invite for frontend repository",
                "Need write access to frontend-web repo to submit pull requests for sprint 14.",
                catAccess, TicketPriority.MEDIUM, TicketStatus.CLOSED,
                emp2, agent2,
                "Added user to engineering-frontend GitHub team with Member role.",
                Arrays.asList(
                        new CommentData(agent2, "Invitation sent to GitHub profile."),
                        new CommentData(emp2, "Accepted and repository cloned. Thanks!")
                )
        );

        // Ticket 11: Low Software Request - Open
        createSampleTicket(
                "Docker Desktop update failing on macOS Sonoma",
                "Docker daemon fails to start after auto-update. VirtioFS driver error.",
                catSoftware, TicketPriority.LOW, TicketStatus.OPEN,
                emp3, null, null,
                Collections.emptyList()
        );

        // Ticket 12: High Network Latency - In Progress
        createSampleTicket(
                "Conference Room 402 Zoom Room audio drops",
                "Microphone array cutting out every 5 minutes during executive board presentations.",
                catNetwork, TicketPriority.HIGH, TicketStatus.IN_PROGRESS,
                emp4, agent1, null,
                Collections.singletonList(
                        new CommentData(agent1, "Replacing CAT6 patch cable and updating PoE switch port profile.")
                )
        );

        logger.info("Successfully seeded 12 realistic IT tickets with full comments and audit logs.");
    }

    private static class CommentData {
        User user;
        String text;
        CommentData(User user, String text) {
            this.user = user;
            this.text = text;
        }
    }

    private void createSampleTicket(String title, String description, Category category,
                                    TicketPriority priority, TicketStatus status,
                                    User creator, User assignee, String resolutionNotes,
                                    List<CommentData> comments) {
        Ticket ticket = new Ticket();
        ticket.setTicketNumber(ticketNumberGenerator.generateNextTicketNumber());
        ticket.setTitle(title);
        ticket.setDescription(description);
        ticket.setCategory(category);
        ticket.setPriority(priority);
        ticket.setStatus(status);
        ticket.setCreatedBy(creator);
        ticket.setAssignedTo(assignee);
        ticket.setResolutionNotes(resolutionNotes);

        if (status == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now().minusHours(4));
        } else if (status == TicketStatus.CLOSED) {
            ticket.setResolvedAt(LocalDateTime.now().minusDays(1));
            ticket.setClosedAt(LocalDateTime.now().minusHours(2));
        }

        Ticket saved = ticketRepository.save(ticket);

        // Add history
        historyRepository.save(new TicketHistory(
                saved, creator, "Ticket Created",
                "Ticket " + saved.getTicketNumber() + " created by " + creator.getFullName()
        ));

        if (assignee != null) {
            historyRepository.save(new TicketHistory(
                    saved, assignee, "Ticket Assigned",
                    "Ticket assigned to " + assignee.getFullName()
            ));
        }

        if (status == TicketStatus.IN_PROGRESS) {
            historyRepository.save(new TicketHistory(
                    saved, assignee != null ? assignee : creator, "Status Changed",
                    "Status changed from ASSIGNED to IN_PROGRESS"
            ));
        } else if (status == TicketStatus.RESOLVED) {
            historyRepository.save(new TicketHistory(
                    saved, assignee != null ? assignee : creator, "Status Changed",
                    "Status changed to RESOLVED. Notes: " + resolutionNotes
            ));
        } else if (status == TicketStatus.CLOSED) {
            historyRepository.save(new TicketHistory(
                    saved, creator, "Ticket Closed",
                    creator.getFullName() + " verified resolution and closed ticket"
            ));
        }

        for (CommentData cd : comments) {
            TicketComment comment = new TicketComment(saved, cd.user, cd.text);
            commentRepository.save(comment);
            historyRepository.save(new TicketHistory(
                    saved, cd.user, "Comment Added",
                    cd.user.getFullName() + " added a comment"
            ));
        }
    }
}

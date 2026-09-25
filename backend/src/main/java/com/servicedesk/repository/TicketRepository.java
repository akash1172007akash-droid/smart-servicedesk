package com.servicedesk.repository;

import com.servicedesk.entity.Ticket;
import com.servicedesk.entity.TicketPriority;
import com.servicedesk.entity.TicketStatus;
import com.servicedesk.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Optional<Ticket> findByTicketNumber(String ticketNumber);

    boolean existsByTicketNumber(String ticketNumber);

    @Query("SELECT t FROM Ticket t WHERE " +
           "(:searchTerm IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           " OR LOWER(t.ticketNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           " OR LOWER(t.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:categoryId IS NULL OR t.category.id = :categoryId) AND " +
           "(:createdById IS NULL OR t.createdBy.id = :createdById) AND " +
           "(:assignedToId IS NULL OR t.assignedTo.id = :assignedToId) AND " +
           "(:unassignedOnly = false OR t.assignedTo IS NULL)")
    Page<Ticket> findWithFilters(
            @Param("searchTerm") String searchTerm,
            @Param("status") TicketStatus status,
            @Param("priority") TicketPriority priority,
            @Param("categoryId") Long categoryId,
            @Param("createdById") Long createdById,
            @Param("assignedToId") Long assignedToId,
            @Param("unassignedOnly") boolean unassignedOnly,
            Pageable pageable
    );

    long countByStatus(TicketStatus status);

    long countByPriority(TicketPriority priority);

    long countByCreatedBy(User user);

    long countByCreatedByAndStatus(User user, TicketStatus status);

    long countByAssignedTo(User user);

    long countByAssignedToAndStatus(User user, TicketStatus status);

    long countByAssignedToIsNull();

    long countByAssignedToIsNullAndStatus(TicketStatus status);

    long countByPriorityAndStatusNot(TicketPriority priority, TicketStatus status);

    long countByAssignedToAndPriorityAndStatusNot(User user, TicketPriority priority, TicketStatus status);

    List<Ticket> findTop10ByOrderByCreatedAtDesc();

    List<Ticket> findTop5ByCreatedByOrderByCreatedAtDesc(User user);

    List<Ticket> findTop5ByAssignedToOrderByCreatedAtDesc(User user);

    @Query("SELECT t.status, COUNT(t) FROM Ticket t GROUP BY t.status")
    List<Object[]> countTicketsByStatusGroup();

    @Query("SELECT t.priority, COUNT(t) FROM Ticket t GROUP BY t.priority")
    List<Object[]> countTicketsByPriorityGroup();

    @Query("SELECT t.category.name, COUNT(t) FROM Ticket t GROUP BY t.category.name")
    List<Object[]> countTicketsByCategoryGroup();

    @Query("SELECT t FROM Ticket t WHERE t.createdAt >= :startDate ORDER BY t.createdAt ASC")
    List<Ticket> findTicketsSince(@Param("startDate") LocalDateTime startDate);
}

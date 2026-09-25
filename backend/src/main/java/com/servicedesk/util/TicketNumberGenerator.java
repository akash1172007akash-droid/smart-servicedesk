package com.servicedesk.util;

import com.servicedesk.repository.TicketRepository;
import org.springframework.stereotype.Component;

import java.time.Year;

@Component
public class TicketNumberGenerator {

    private final TicketRepository ticketRepository;

    public TicketNumberGenerator(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public synchronized String generateNextTicketNumber() {
        int currentYear = Year.now().getValue();
        long count = ticketRepository.count() + 1;
        String ticketNumber = String.format("INC-%d-%05d", currentYear, count);

        // In the rare case of existing number, increment until unique
        while (ticketRepository.existsByTicketNumber(ticketNumber)) {
            count++;
            ticketNumber = String.format("INC-%d-%05d", currentYear, count);
        }

        return ticketNumber;
    }
}

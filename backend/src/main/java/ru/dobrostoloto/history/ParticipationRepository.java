package ru.dobrostoloto.history;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ParticipationRepository extends JpaRepository<Participation, Long> {

    List<Participation> findByUserIdOrderByDateDesc(Long userId);

    @Query("select p from Participation p where p.task.organizer = :organizer order by p.date desc")
    List<Participation> findByOrganizer(@Param("organizer") String organizer);

    List<Participation> findAll();

    @Query("select p from Participation p where p.date >= :from order by p.date asc")
    List<Participation> findSince(@Param("from") LocalDate from);

    @Query("select p from Participation p where p.user.id = :userId and p.date >= :from order by p.date asc")
    List<Participation> findSinceForUser(@Param("userId") Long userId, @Param("from") LocalDate from);

    @Query("select p from Participation p where p.task.organizer = :organizer and p.date >= :from order by p.date asc")
    List<Participation> findSinceForOrganizer(@Param("organizer") String organizer, @Param("from") LocalDate from);
}

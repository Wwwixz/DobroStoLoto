package ru.dobrostoloto.history;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ParticipationRepository extends JpaRepository<Participation, Long> {

    List<Participation> findByUserIdOrderByDateDesc(Long userId);

    List<Participation> findAll();

    @Query("select p from Participation p where p.date >= :from order by p.date asc")
    List<Participation> findSince(@Param("from") LocalDate from);
}

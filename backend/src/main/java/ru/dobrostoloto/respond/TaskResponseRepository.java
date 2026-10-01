package ru.dobrostoloto.respond;

import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskResponseRepository extends JpaRepository<TaskResponse, Long> {

    boolean existsByUserIdAndTaskId(Long userId, Long taskId);

    long deleteByUserIdAndTaskId(Long userId, Long taskId);

    List<TaskResponse> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("select r.task.id from TaskResponse r where r.user.id = :userId")
    Set<Long> findTaskIdsByUserId(@Param("userId") Long userId);
}

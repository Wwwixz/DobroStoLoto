package ru.dobrostoloto.user;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.dobrostoloto.common.CurrentUser;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final CurrentUser currentUser;

    public ProfileController(CurrentUser currentUser) {
        this.currentUser = currentUser;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public UserDto profile(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return UserDto.from(currentUser.resolve(userId));
    }
}

package org.banking.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.banking.user.model.dto.CreateUser;
import org.banking.user.model.dto.LoginRequest;
import org.banking.user.model.dto.UserDto;
import org.banking.user.model.dto.UserUpdate;
import org.banking.user.model.dto.UserUpdateStatus;
import org.banking.user.model.dto.response.LoginResponse;
import org.banking.user.model.dto.response.Response;
import org.banking.user.service.UserService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping({"/api/users", "/users"})
@Tag(name = "User Management", description = "APIs for user registration, authentication, profile management, and user queries")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "Register a new user", description = "Creates a new user in Keycloak and local database")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User created successfully"),
            @ApiResponse(responseCode = "409", description = "Email already registered", content = @Content(schema = @Schema(implementation = Response.class)))
    })
    @PostMapping("/register")
    public ResponseEntity<Response> createUser(@Valid @RequestBody CreateUser userDto) {
        log.info("creating user with: {}", userDto.toString());
        return ResponseEntity.ok(userService.createUser(userDto));
    }

    @Operation(summary = "User login", description = "Authenticates user and returns JWT token, user info and roles")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Authentication successful"),
            @ApiResponse(responseCode = "404", description = "Invalid email or credentials")
    })
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("User login attempt for: {}", loginRequest.getEmailId());
        return ResponseEntity.ok(userService.login(loginRequest));
    }

    @Operation(summary = "Get all users", description = "Retrieves all registered users (Admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of users retrieved successfully")
    })
    @GetMapping
    public ResponseEntity<List<UserDto>> readAllUsers() {
        return ResponseEntity.ok(userService.readAllUsers());
    }

    @Operation(summary = "Get user by Keycloak auth ID", description = "Retrieves user details by Keycloak authentication ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User found"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/auth/{authId}")
    public ResponseEntity<UserDto> readUserByAuthId(@Parameter(description = "Keycloak authentication ID") @PathVariable String authId) {
        log.info("reading user by authId");
        return ResponseEntity.ok(userService.readUser(authId));
    }

    @Operation(summary = "Update user status", description = "Updates user status (PENDING, APPROVED, REJECTED) - Admin only")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User status updated"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PatchMapping("/{id}")
    public ResponseEntity<Response> updateUserStatus(@Parameter(description = "User ID") @PathVariable Long id, @Valid @RequestBody UserUpdateStatus userUpdate) {
        log.info("updating the user with: {}", userUpdate.toString());
        return new ResponseEntity<>(userService.updateUserStatus(id, userUpdate), HttpStatus.OK);
    }

    @Operation(summary = "Update user profile", description = "Updates user profile information")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User profile updated"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Response> updateUser(@Parameter(description = "User ID") @PathVariable Long id, @Valid @RequestBody UserUpdate userUpdate) {
        return new ResponseEntity<>(userService.updateUser(id, userUpdate), HttpStatus.OK);
    }

    @Operation(summary = "Get user by ID", description = "Retrieves user details by internal user ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User found"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> readUserById(@Parameter(description = "Internal user ID") @PathVariable Long userId) {
        log.info("reading user by ID");
        return ResponseEntity.ok(userService.readUserById(userId));
    }

    @Operation(summary = "Get user by account ID", description = "Retrieves user associated with a bank account")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User found"),
            @ApiResponse(responseCode = "404", description = "User or account not found")
    })
    @GetMapping("/accounts/{accountId}")
    public ResponseEntity<UserDto> readUserByAccountId(@Parameter(description = "Bank account number") @PathVariable String accountId) {
        return ResponseEntity.ok(userService.readUserByAccountId(accountId));
    }
}
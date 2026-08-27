package org.banking.sequence.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.banking.sequence.model.entity.Sequence;
import org.banking.sequence.service.SequenceService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sequence")
@Tag(name = "Sequence Generator", description = "APIs for generating unique sequence numbers for accounts and transactions")
public class SequenceController {

    private final SequenceService sequenceService;

    @Operation(summary = "Generate next sequence number", description = "Generates and returns the next unique sequence number for account creation")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Sequence generated", content = @Content(schema = @Schema(implementation = Sequence.class))),
            @ApiResponse(responseCode = "500", description = "Failed to generate sequence")
    })
    @PostMapping
    public Sequence generateAccountNumber() {
        return sequenceService.create();
    }
}
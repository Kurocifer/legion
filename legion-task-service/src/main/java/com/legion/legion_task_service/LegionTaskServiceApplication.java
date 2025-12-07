package com.legion.legion_task_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class LegionTaskServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(LegionTaskServiceApplication.class, args);
	}

    @GetMapping("/")
    public String status() {
        return "Legion Task Service: Operational";
    }

}

package com.legion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class LegionServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(LegionServiceApplication.class, args);
	}

    @GetMapping("/")
    public String status() {
        return "Legion Task Service: Operational";
    }

}

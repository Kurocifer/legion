package com.legion.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Configuration
@ConfigurationProperties(prefix = "leion.task")
public class TaskConfig {

    private int creationRetryAttempts = 3;
    private long creationRetryDelayMs = 50;


}

# -------------------------------------------------------------
# Stage 1: Build the Spring Boot Application
# -------------------------------------------------------------
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production jar
COPY src ./src
RUN mvn clean package -DskipTests

# -------------------------------------------------------------
# Stage 2: Minimal Production Runtime
# -------------------------------------------------------------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create upload directory and non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    mkdir -p /app/uploads && chown -R appuser:appgroup /app

USER appuser

# Copy jar from build stage
COPY --from=build /app/target/smart-servicedesk-backend-1.0.0.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

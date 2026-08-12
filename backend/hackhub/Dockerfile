# ---- Runtime image for the HackHub backend (Spring Boot / Java 21) ----
# This Dockerfile assumes you have already run `mvn clean package` locally
# and a jar exists at: backend/hackhub/target/hackhub-0.0.1-SNAPSHOT.jar

FROM eclipse-temurin:21-jre-alpine

# Set working directory inside the container
WORKDIR /app

# Create a non-root user to run the app (security best practice)
RUN addgroup -S spring && adduser -S spring -G spring

# Copy the locally built jar into the image
# NOTE: build this from inside backend/hackhub/ so the path below resolves,
# OR adjust the source path to match where you run `docker build` from.
COPY target/hackhub-0.0.1-SNAPSHOT.jar app.jar

# Give ownership to the non-root user and switch to it
RUN chown spring:spring app.jar
USER spring

# The app reads PORT from env (defaults to 8080 in application.properties)
EXPOSE 8080

# Run the jar
ENTRYPOINT ["java", "-jar", "app.jar"]
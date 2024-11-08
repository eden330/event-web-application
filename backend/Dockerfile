FROM maven:3.8.4-openjdk-17-slim AS builder

WORKDIR /app
RUN apt-get update && apt-get install -y dos2unix wget unzip curl

COPY .mvn .mvn
COPY mvnw .
COPY pom.xml .
RUN dos2unix mvnw && chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

COPY src ./src
RUN ./mvnw clean package -DskipTests

FROM openjdk:17-jdk-alpine

WORKDIR /app

COPY --from=builder /app/target/web_event_application.jar .

EXPOSE 8080

CMD ["java", "-jar", "web_event_application.jar"]

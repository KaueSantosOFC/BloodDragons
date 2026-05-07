# Stage 1: Build com Maven
FROM maven:3.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copia apenas o POM primeiro para cache de dependências
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia código fonte e compila
COPY src ./src
RUN mvn package -DskipTests -q

# Stage 2: Runtime leve
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copia apenas o JAR final
COPY --from=build /app/target/*.jar app.jar

# Cria diretórios de dados e uploads
RUN mkdir -p /app/data /app/uploads

EXPOSE 8080

ENV JAVA_OPTS="-Xmx512m -Xms256m"

CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

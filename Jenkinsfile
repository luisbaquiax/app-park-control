pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Build Angular') {
            steps {
                // Ejecuta el build dentro de un contenedor Node con docker run
                sh 'docker run --rm -v $PWD:/app -w /app node:22 sh -c "npm ci && npm install -g @angular/cli && ng build --configuration=production"'
            }
        }
        stage('Deploy') {
            steps {
                sh 'docker compose down'
                sh 'docker compose up --build -d'
            }
        }
    }
}

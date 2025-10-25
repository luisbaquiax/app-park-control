pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Angular') {
            steps {
                sh 'npm ci'
                sh 'ng build --configuration=production'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker compose down'
                sh 'docker compose up --build -d'
                echo "Despliegue a producción exitoso"
            }
        }
    }
}

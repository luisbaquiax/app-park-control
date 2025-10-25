pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Build Angular') {
            steps {
                sh '''
                docker run --rm \
                    -v $WORKSPACE:/app \
                    -w /app \
                    node:22 sh -c "npm install && npm install -g @angular/cli && ng build --configuration=production"
                '''
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

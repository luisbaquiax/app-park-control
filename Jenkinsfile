pipeline {
    agent {
        docker { image 'node:22' }  // imagen oficial con Node 22
    }
    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Build Angular') {
            steps {
                sh 'npm ci'
                sh 'npm install -g @angular/cli'
                sh 'ng build --configuration=production'
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

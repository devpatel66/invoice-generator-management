pipeline {
    agent any

    tools {
        nodejs 'NodeJS_24' // Make sure this matches exactly with what's configured in Jenkins
    }

    stages {
        stage('Build') {
            steps {
                bat '''
                    dir
                    node -v
                    npm ci --legacy-peer-deps
                    npm run build
                    dir
                '''
            }
        }
    }
}

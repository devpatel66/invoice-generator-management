pipeline {
    agent any

    tools {
        nodejs 'NodeJS_24'
    }

    stages {
        stage('Build') {
            steps {
                bat '''
                    node -v
                    npm ci --legacy-peer-deps
                    npm run build
                    ls
                '''
            }
        }
    }
}

pipeline {
    agent any

    tools {
        nodejs 'NodeJS_24' 
    }

    stages {
        stage('Build') {
            steps {
                bat '''
                    call dir
                    call node -v

                    echo Installing...
                    call npm ci --legacy-peer-deps

                    echo Building...
                    call npm run build

                    call dir
                '''
            }
        }
    }
}

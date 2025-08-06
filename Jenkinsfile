pipeline{
    agent any
    stages{
        stage("build"){
            steps{
                sh '''
                    ls 
                    node --version
                   npm ci --legacy-peer-deps
                   npm run build
                   ls 
                '''
            }
        }
    }
}

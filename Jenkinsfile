pipeline{
    agent any
    stages{
        stage("build"){
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
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

pipeline {
    agent any
    
    triggers {
        // This listens for the webhook from your Deployment repo (cartify.git)
        githubPush()
    }

    options {
        timeout(time: 20, unit: 'MINUTES') 
        disableConcurrentBuilds() 
    }

    environment {
        APP_DIR = "/home/ubuntu/cartify"
        NETWORK_NAME = "cartify_cartify_network"
        // The sender email authenticated in your Jenkins settings
        AUTH_SENDER = "haris.laeeq0324@gmail.com"
        // Fallback receiver
        DEFAULT_RECEIVER = "harislaeeq2403@gmail.com"
    }

    stages {
        stage('System Cleanup') {
            steps {
                // Clear the workspace tests folder
                dir('tests') { deleteDir() }
                // Clean up Docker to save disk space on AWS
                sh "docker system prune -f || true"
            }
        }

        stage('Clone Test Repo') {
            steps {
                // Explicitly pull the tests from your secondary repository
                dir('tests') {
                    git branch: 'main', url: 'https://github.com/Haris0324/Cartify-Tests.git'
                }
            }
        }

        stage('Get Committer Email') {
            steps {
                script {
                    // This gets the email of the person who pushed the code
                    def email = sh(script: "cd tests && git log -1 --pretty=format:%ae", returnStdout: true).trim()
                    env.TARGET_EMAIL = email ?: "${env.DEFAULT_RECEIVER}"
                }
            }
        }

        stage('Deploy Application') {
            steps {
                sh """
                    cd ${APP_DIR}
                    docker-compose down --remove-orphans || true
                    docker-compose up -d --build
                    echo "Waiting 30 seconds for React frontend to start..."
                    sleep 30
                """
            }
        }

        stage('Run Selenium Tests') {
            steps {
                // --shm-size="2g" prevents the "Tab Crashed" error
                sh """
                    docker run --rm \
                      --network ${NETWORK_NAME} \
                      --shm-size="2g" \
                      -u \$(id -u):\$(id -g) \
                      -v ${WORKSPACE}/tests:/app \
                      -w /app \
                      maven:3.9.9-eclipse-temurin-21 \
                      mvn clean test -Dmaven.repo.local=/app/.m2/repository -DbaseUrl=http://frontend:5173 -DseleniumUrl=http://selenium:4444/wd/hub
                """
            }
        }
    }

    post {
        always {
            // Process the XML files for the email stats
            junit allowEmptyResults: true, testResults: 'tests/target/surefire-reports/*.xml'
            // Cleanup root-owned Maven files
            sh "rm -rf ${WORKSPACE}/tests/target ${WORKSPACE}/tests/.m2 || true"
        }

        success {
            emailext (
                subject: "✅ PASSED: Cartify Build #${BUILD_NUMBER}",
                to: "${env.TARGET_EMAIL}",
                from: "${env.AUTH_SENDER}",
                replyTo: "${env.AUTH_SENDER}",
                body: """
                    <h3>Build & Test Successful!</h3>
                    <p>The code change from <b>${env.TARGET_EMAIL}</b> passed all tests.</p>
                    <p><b>Test Summary:</b></p>
                    <ul>
                        <li>Total Tests: \${TEST_COUNTS, var="total"}</li>
                        <li>Passed: \${TEST_COUNTS, var="pass"}</li>
                        <li>Failed: \${TEST_COUNTS, var="fail"}</li>
                    </ul>
                    <p>Assignment Status: Application has been shut down successfully.</p>
                    <p>View Details: <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                """,
                mimeType: 'text/html'
            )
            // Shut down the deployment after success for assignment requirements
            sh "cd ${APP_DIR} && docker-compose down || true"
        }

        failure {
            emailext (
                subject: "❌ FAILED: Cartify Build #${BUILD_NUMBER}",
                to: "${env.TARGET_EMAIL}",
                from: "${env.AUTH_SENDER}",
                replyTo: "${env.AUTH_SENDER}",
                attachLog: true,
                body: """
                    <h3>Build Failed</h3>
                    <p>The test suite failed. Deployment has been shut down.</p>
                    <p><b>Test Summary:</b></p>
                    <ul>
                        <li>Total Tests: \${TEST_COUNTS, var="total"}</li>
                        <li>Passed: \${TEST_COUNTS, var="pass"}</li>
                        <li>Failed: \${TEST_COUNTS, var="fail"}</li>
                    </ul>
                """,
                mimeType: 'text/html'
            )
            // Shut down on failure as well
            sh "cd ${APP_DIR} && docker-compose down || true"
        }
    }
}pipeline {
    agent any
    
    triggers {
        githubPush()
    }

    options {
        timeout(time: 20, unit: 'MINUTES') 
        disableConcurrentBuilds() 
    }

    environment {
        APP_DIR = "/home/ubuntu/cartify"
        NETWORK_NAME = "cartify_cartify_network"
        // Authenticated sender from your settings
        AUTH_SENDER = "haris.laeeq0324@gmail.com"
        // Receiver (last committer)
        DEFAULT_RECEIVER = "harislaeeq2403@gmail.com"
    }

    stages {
        stage('System Cleanup') {
            steps {
                dir('tests') { deleteDir() }
                sh "docker system prune -f || true"
            }
        }

        stage('Clone Test Repo') {
            steps {
                dir('tests') {
                    git branch: 'main', url: 'https://github.com/Haris0324/Cartify-Tests.git'
                }
            }
        }

        stage('Get Committer Email') {
            steps {
                script {
                    def email = sh(script: "cd tests && git log -1 --pretty=format:%ae", returnStdout: true).trim()
                    env.TARGET_EMAIL = email ?: "${env.DEFAULT_RECEIVER}"
                }
            }
        }

        stage('Deploy Application') {
            steps {
                sh """
                    cd ${APP_DIR}
                    docker-compose down --remove-orphans || true
                    docker-compose up -d --build
                    echo "Waiting 30s for environment to be ready..."
                    sleep 30
                """
            }
        }

        stage('Run Selenium Tests') {
            steps {
                // The --shm-size="2g" fixes the "Tab Crashed" error
                sh """
                    docker run --rm \
                      --network ${NETWORK_NAME} \
                      --shm-size="2g" \
                      -u \$(id -u):\$(id -g) \
                      -v ${WORKSPACE}/tests:/app \
                      -w /app \
                      maven:3.9.9-eclipse-temurin-21 \
                      mvn clean test -Dmaven.repo.local=/app/.m2/repository -DbaseUrl=http://frontend:5173 -DseleniumUrl=http://selenium:4444/wd/hub
                """
            }
        }
    }

    post {
        always {
            // This is required for the email tokens below to work
            junit allowEmptyResults: true, testResults: 'tests/target/surefire-reports/*.xml'
            sh "rm -rf ${WORKSPACE}/tests/target ${WORKSPACE}/tests/.m2 || true"
        }

        success {
            emailext (
                subject: "✅ PASSED: Cartify Build #${BUILD_NUMBER}",
                to: "${env.TARGET_EMAIL}",
                from: "${env.AUTH_SENDER}",
                replyTo: "${env.AUTH_SENDER}",
                body: """
                    <h3>Build Successful!</h3>
                    <p>The application passed all quality gates.</p>
                    <p><b>Test Summary:</b></p>
                    <ul>
                        <li>Total Tests: \${TEST_COUNTS, var="total"}</li>
                        <li>Passed: \${TEST_COUNTS, var="pass"}</li>
                        <li>Failed: \${TEST_COUNTS, var="fail"}</li>
                    </ul>
                    <p>View Console: <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                """,
                mimeType: 'text/html'
            )
        }

        failure {
            emailext (
                subject: "❌ FAILED: Cartify Build #${BUILD_NUMBER}",
                to: "${env.TARGET_EMAIL}",
                from: "${env.AUTH_SENDER}",
                replyTo: "${env.AUTH_SENDER}",
                attachLog: true,
                body: """
                    <h3>Build Failed</h3>
                    <p>One or more tests failed. Check the attached logs for details.</p>
                    <p><b>Test Summary:</b></p>
                    <ul>
                        <li>Total Tests: \${TEST_COUNTS, var="total"}</li>
                        <li>Passed: \${TEST_COUNTS, var="pass"}</li>
                        <li>Failed: \${TEST_COUNTS, var="fail"}</li>
                    </ul>
                    <p>View Logs: <a href="${BUILD_URL}console">${BUILD_URL}console</a></p>
                """,
                mimeType: 'text/html'
            )
        }
    }
}pipeline {
    agent any
    
    triggers {
        // This listens for the webhook from your Deployment repo (cartify.git)
        githubPush()
    }

    options {
        timeout(time: 20, unit: 'MINUTES') 
        disableConcurrentBuilds() 
    }

    environment {
        APP_DIR = "/home/ubuntu/cartify"
        NETWORK_NAME = "cartify_cartify_network"
        // The sender email authenticated in your Jenkins settings
        AUTH_SENDER = "haris.laeeq0324@gmail.com"
        // Fallback receiver
        DEFAULT_RECEIVER = "harislaeeq2403@gmail.com"
    }

    stages {
        stage('System Cleanup') {
            steps {
                // Clear the workspace tests folder
                dir('tests') { deleteDir() }
                // Clean up Docker to save disk space on AWS
                sh "docker system prune -f || true"
            }
        }

        stage('Clone Test Repo') {
            steps {
                // Explicitly pull the tests from your secondary repository
                dir('tests') {
                    git branch: 'main', url: 'https://github.com/Haris0324/Cartify-Tests.git'
                }
            }
        }

        stage('Get Committer Email') {
            steps {
                script {
                    // This gets the email of the person who pushed the code
                    def email = sh(script: "cd tests && git log -1 --pretty=format:%ae", returnStdout: true).trim()
                    env.TARGET_EMAIL = email ?: "${env.DEFAULT_RECEIVER}"
                }
            }
        }

        stage('Deploy Application') {
            steps {
                sh """
                    cd ${APP_DIR}
                    docker-compose down --remove-orphans || true
                    docker-compose up -d --build
                    echo "Waiting 30 seconds for React frontend to start..."
                    sleep 30
                """
            }
        }

        stage('Run Selenium Tests') {
            steps {
                // --shm-size="2g" prevents the "Tab Crashed" error
                sh """
                    docker run --rm \
                      --network ${NETWORK_NAME} \
                      --shm-size="2g" \
                      -u \$(id -u):\$(id -g) \
                      -v ${WORKSPACE}/tests:/app \
                      -w /app \
                      maven:3.9.9-eclipse-temurin-21 \
                      mvn clean test -Dmaven.repo.local=/app/.m2/repository -DbaseUrl=http://frontend:5173 -DseleniumUrl=http://selenium:4444/wd/hub
                """
            }
        }
    }

    post {
        always {
            // Process the XML files for the email stats
            junit allowEmptyResults: true, testResults: 'tests/target/surefire-reports/*.xml'
            // Cleanup root-owned Maven files
            sh "rm -rf ${WORKSPACE}/tests/target ${WORKSPACE}/tests/.m2 || true"
        }

        success {
            emailext (
                subject: "✅ PASSED: Cartify Build #${BUILD_NUMBER}",
                to: "${env.TARGET_EMAIL}",
                from: "${env.AUTH_SENDER}",
                replyTo: "${env.AUTH_SENDER}",
                body: """
                    <h3>Build & Test Successful!</h3>
                    <p>The code change from <b>${env.TARGET_EMAIL}</b> passed all tests.</p>
                    <p><b>Test Summary:</b></p>
                    <ul>
                        <li>Total Tests: \${TEST_COUNTS, var="total"}</li>
                        <li>Passed: \${TEST_COUNTS, var="pass"}</li>
                        <li>Failed: \${TEST_COUNTS, var="fail"}</li>
                    </ul>
                    <p>Assignment Status: Application has been shut down successfully.</p>
                    <p>View Details: <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                """,
                mimeType: 'text/html'
            )
            // Shut down the deployment after success for assignment requirements
            sh "cd ${APP_DIR} && docker-compose down || true"
        }

        failure {
            emailext (
                subject: "❌ FAILED: Cartify Build #${BUILD_NUMBER}",
                to: "${env.TARGET_EMAIL}",
                from: "${env.AUTH_SENDER}",
                replyTo: "${env.AUTH_SENDER}",
                attachLog: true,
                body: """
                    <h3>Build Failed</h3>
                    <p>The test suite failed. Deployment has been shut down.</p>
                    <p><b>Test Summary:</b></p>
                    <ul>
                        <li>Total Tests: \${TEST_COUNTS, var="total"}</li>
                        <li>Passed: \${TEST_COUNTS, var="pass"}</li>
                        <li>Failed: \${TEST_COUNTS, var="fail"}</li>
                    </ul>
                """,
                mimeType: 'text/html'
            )
            // Shut down on failure as well
            sh "cd ${APP_DIR} && docker-compose down || true"
        }
    }
}pipeline {
    agent any
    
    triggers {
        githubPush()
    }

    options {
        timeout(time: 20, unit: 'MINUTES') 
        disableConcurrentBuilds() 
    }

    environment {
        APP_DIR = "/home/ubuntu/cartify"
        NETWORK_NAME = "cartify_cartify_network"
        // Authenticated sender from your settings
        AUTH_SENDER = "haris.laeeq0324@gmail.com"
        // Receiver (last committer)
        DEFAULT_RECEIVER = "harislaeeq2403@gmail.com"
    }

    stages {
        stage('System Cleanup') {
            steps {
                dir('tests') { deleteDir() }
                sh "docker system prune -f || true"
            }
        }

        stage('Clone Test Repo') {
            steps {
                dir('tests') {
                    git branch: 'main', url: 'https://github.com/Haris0324/Cartify-Tests.git'
                }
            }
        }

        stage('Get Committer Email') {
            steps {
                script {
                    def email = sh(script: "cd tests && git log -1 --pretty=format:%ae", returnStdout: true).trim()
                    env.TARGET_EMAIL = email ?: "${env.DEFAULT_RECEIVER}"
                }
            }
        }

        stage('Deploy Application') {
            steps {
                sh """
                    cd ${APP_DIR}
                    docker-compose down --remove-orphans || true
                    docker-compose up -d --build
                    echo "Waiting 30s for environment to be ready..."
                    sleep 30
                """
            }
        }

        stage('Run Selenium Tests') {
            steps {
                // The --shm-size="2g" fixes the "Tab Crashed" error
                sh """
                    docker run --rm \
                      --network ${NETWORK_NAME} \
                      --shm-size="2g" \
                      -u \$(id -u):\$(id -g) \
                      -v ${WORKSPACE}/tests:/app \
                      -w /app \
                      maven:3.9.9-eclipse-temurin-21 \
                      mvn clean test -Dmaven.repo.local=/app/.m2/repository -DbaseUrl=http://frontend:5173 -DseleniumUrl=http://selenium:4444/wd/hub
                """
            }
        }
    }

    post {
        always {
            // This is required for the email tokens below to work
            junit allowEmptyResults: true, testResults: 'tests/target/surefire-reports/*.xml'
            sh "rm -rf ${WORKSPACE}/tests/target ${WORKSPACE}/tests/.m2 || true"
        }

        success {
            emailext (
                subject: "✅ PASSED: Cartify Build #${BUILD_NUMBER}",
                to: "${env.TARGET_EMAIL}",
                from: "${env.AUTH_SENDER}",
                replyTo: "${env.AUTH_SENDER}",
                body: """
                    <h3>Build Successful!</h3>
                    <p>The application passed all quality gates.</p>
                    <p><b>Test Summary:</b></p>
                    <ul>
                        <li>Total Tests: \${TEST_COUNTS, var="total"}</li>
                        <li>Passed: \${TEST_COUNTS, var="pass"}</li>
                        <li>Failed: \${TEST_COUNTS, var="fail"}</li>
                    </ul>
                    <p>View Console: <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                """,
                mimeType: 'text/html'
            )
        }

        failure {
            emailext (
                subject: "❌ FAILED: Cartify Build #${BUILD_NUMBER}",
                to: "${env.TARGET_EMAIL}",
                from: "${env.AUTH_SENDER}",
                replyTo: "${env.AUTH_SENDER}",
                attachLog: true,
                body: """
                    <h3>Build Failed</h3>
                    <p>One or more tests failed. Check the attached logs for details.</p>
                    <p><b>Test Summary:</b></p>
                    <ul>
                        <li>Total Tests: \${TEST_COUNTS, var="total"}</li>
                        <li>Passed: \${TEST_COUNTS, var="pass"}</li>
                        <li>Failed: \${TEST_COUNTS, var="fail"}</li>
                    </ul>
                    <p>View Logs: <a href="${BUILD_URL}console">${BUILD_URL}console</a></p>
                """,
                mimeType: 'text/html'
            )
        }
    }
}pipeline {
    agent any
    
    triggers {
        // This listens for the webhook from your Deployment repo (cartify.git)
        githubPush()
    }

    options {
        timeout(time: 20, unit: 'MINUTES') 
        disableConcurrentBuilds() 
    }

    environment {
        APP_DIR = "/home/ubuntu/cartify"
        NETWORK_NAME = "cartify_cartify_network"
        // The sender email authenticated in your Jenkins settings
        AUTH_SENDER = "haris.laeeq0324@gmail.com"
        // Fallback receiver
        DEFAULT_RECEIVER = "harislaeeq2403@gmail.com"
    }

    stages {
        stage('System Cleanup') {
            steps {
                // Clear the workspace tests folder
                dir('tests') { deleteDir() }
                // Clean up Docker to save disk space on AWS
                sh "docker system prune -f || true"
            }
        }

        stage('Clone Test Repo') {
            steps {
                // Explicitly pull the tests from your secondary repository
                dir('tests') {
                    git branch: 'main', url: 'https://github.com/Haris0324/Cartify-Tests.git'
                }
            }
        }

        stage('Get Committer Email') {
            steps {
                script {
                    // This gets the email of the person who pushed the code
                    def email = sh(script: "cd tests && git log -1 --pretty=format:%ae", returnStdout: true).trim()
                    env.TARGET_EMAIL = email ?: "${env.DEFAULT_RECEIVER}"
                }
            }
        }

        stage('Deploy Application') {
            steps {
                sh """
                    cd ${APP_DIR}
                    docker-compose down --remove-orphans || true
                    docker-compose up -d --build
                    echo "Waiting 30 seconds for React frontend to start..."
                    sleep 30
                """
            }
        }

        stage('Run Selenium Tests') {
            steps {
                // --shm-size="2g" prevents the "Tab Crashed" error
                sh """
                    docker run --rm \
                      --network ${NETWORK_NAME} \
                      --shm-size="2g" \
                      -u \$(id -u):\$(id -g) \
                      -v ${WORKSPACE}/tests:/app \
                      -w /app \
                      maven:3.9.9-eclipse-temurin-21 \
                      mvn clean test -Dmaven.repo.local=/app/.m2/repository -DbaseUrl=http://frontend:5173 -DseleniumUrl=http://selenium:4444/wd/hub
                """
            }
        }
    }

    post {
        always {
            // Process the XML files for the email stats
            junit allowEmptyResults: true, testResults: 'tests/target/surefire-reports/*.xml'
            // Cleanup root-owned Maven files
            sh "rm -rf ${WORKSPACE}/tests/target ${WORKSPACE}/tests/.m2 || true"
        }

        success {
            emailext (
                subject: "✅ PASSED: Cartify Build #${BUILD_NUMBER}",
                to: "${env.TARGET_EMAIL}",
                from: "${env.AUTH_SENDER}",
                replyTo: "${env.AUTH_SENDER}",
                body: """
                    <h3>Build & Test Successful!</h3>
                    <p>The code change from <b>${env.TARGET_EMAIL}</b> passed all tests.</p>
                    <p><b>Test Summary:</b></p>
                    <ul>
                        <li>Total Tests: \${TEST_COUNTS, var="total"}</li>
                        <li>Passed: \${TEST_COUNTS, var="pass"}</li>
                        <li>Failed: \${TEST_COUNTS, var="fail"}</li>
                    </ul>
                    <p>Assignment Status: Application has been shut down successfully.</p>
                    <p>View Details: <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                """,
                mimeType: 'text/html'
            )
        }

        failure {
            emailext (
                subject: "❌ FAILED: Cartify Build #${BUILD_NUMBER}",
                to: "${env.TARGET_EMAIL}",
                from: "${env.AUTH_SENDER}",
                replyTo: "${env.AUTH_SENDER}",
                attachLog: true,
                body: """
                    <h3>Build Failed</h3>
                    <p>The test suite failed. Deployment has been shut down.</p>
                    <p><b>Test Summary:</b></p>
                    <ul>
                        <li>Total Tests: \${TEST_COUNTS, var="total"}</li>
                        <li>Passed: \${TEST_COUNTS, var="pass"}</li>
                        <li>Failed: \${TEST_COUNTS, var="fail"}</li>
                    </ul>
                """,
                mimeType: 'text/html'
            )
            // Shut down on failure as well
            sh "cd ${APP_DIR} && docker-compose down || true"
        }
    }
}

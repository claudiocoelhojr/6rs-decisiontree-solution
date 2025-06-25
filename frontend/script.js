import { decisionTree } from './decisiontree.js';

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');

    const loginView = document.getElementById('login-view');
    const signupView = document.getElementById('signup-view');
    const forgotPasswordView = document.getElementById('forgot-password-view');
    
    const showSignupLink = document.getElementById('show-signup-link');
    const showLoginLink = document.getElementById('show-login-link');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const backToLoginLink = document.getElementById('back-to-login-link');

    const centralContainer = document.querySelector('.central-container');
    const initialContainer = document.getElementById('initial-container');
    const restartButton = document.getElementById('restart-button');

    let processHistory = [];
    let currentNode = 'DC5';
    let currentApplicationName = ''; 
    let allProcesses = []; 
    const API_URL = 'https://sixrs-decisiontree-solution.onrender.com';

    const token = localStorage.getItem('authToken');
    if (token) {
        showMainAppView();
    }

    async function apiCall(endpoint, method, body = null) {
        const headers = { 'Content-Type': 'application/json' };
        const token = localStorage.getItem('authToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const config = { method: method, headers: headers };
        if (body) {
            config.body = JSON.stringify(body);
        }
        try {
            const response = await fetch(`${API_URL}${endpoint}`, config);
            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
            }
            return responseData;
        } catch (error) {
            alert(`API Error: ${error.message}`);
            throw error;
        }
    }

    showSignupLink.addEventListener('click', (e) => { e.preventDefault(); loginView.classList.add('hidden'); forgotPasswordView.classList.add('hidden'); signupView.classList.remove('hidden'); });
    showLoginLink.addEventListener('click', (e) => { e.preventDefault(); signupView.classList.add('hidden'); forgotPasswordView.classList.add('hidden'); loginView.classList.remove('hidden'); });
    forgotPasswordLink.addEventListener('click', (e) => { e.preventDefault(); loginView.classList.add('hidden'); signupView.classList.add('hidden'); forgotPasswordView.classList.remove('hidden'); });
    backToLoginLink.addEventListener('click', (e) => { e.preventDefault(); forgotPasswordView.classList.add('hidden'); signupView.classList.add('hidden'); loginView.classList.remove('hidden'); });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.textContent = 'LOGGING IN...';
        submitButton.disabled = true;

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            const data = await apiCall('/login', 'POST', { email, password });
            localStorage.setItem('authToken', data.token);
            showMainAppView();
        } catch (error) {
        } finally {
            submitButton.textContent = 'LOGIN';
            submitButton.disabled = false;
        }
    });

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }
        try {
            await apiCall('/signup', 'POST', { email, password });
            alert("Account created successfully! Please log in.");
            signupView.classList.add('hidden');
            loginView.classList.remove('hidden');
        } catch (error) {
        }
    });

    forgotPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('forgot-email').value;
        const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');
        submitButton.textContent = 'SENDING...';
        submitButton.disabled = true;

        try {
            const data = await apiCall('/forgot-password', 'POST', { email });
            alert(data.message);
            forgotPasswordView.classList.add('hidden');
            loginView.classList.remove('hidden');
        } catch (error) {
        } finally {
            submitButton.textContent = 'SEND RESET LINK';
            submitButton.disabled = false;
        }
    });

    function showMainAppView() {
        initialContainer.classList.add('hidden');
        centralContainer.classList.remove('hidden');
        centralContainer.innerHTML = '';
        centralContainer.style.flexDirection = 'column';
        centralContainer.style.justifyContent = 'center';
        centralContainer.style.alignItems = 'center';
    
        const welcomeTitle = document.createElement('h2');
        welcomeTitle.textContent = 'WELCOME!';
        welcomeTitle.className = 'main-menu-title';
    
        const appNameContainer = document.createElement('div');
        appNameContainer.className = 'input-group main-menu-input-group';
    
        const appNameLabel = document.createElement('label');
        appNameLabel.htmlFor = 'applicationName';
        appNameLabel.textContent = 'Enter Application Name:';
    
        const appNameInput = document.createElement('input');
        appNameInput.type = 'text';
        appNameInput.id = 'applicationName';
        appNameInput.placeholder = 'e.g., Legacy System Name';
    
        const errorMsg = document.createElement('p');
        errorMsg.className = 'error-message';
        errorMsg.style.display = 'none'; 
    
        appNameContainer.appendChild(appNameLabel);
        appNameContainer.appendChild(appNameInput);
        appNameContainer.appendChild(errorMsg);
    
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'main-menu-buttons';
    
        const startNewBtn = document.createElement('button');
        startNewBtn.textContent = 'Start New Process';
        startNewBtn.className = 'form-button';
        startNewBtn.disabled = true; 
    
        const viewHistoryBtn = document.createElement('button');
        viewHistoryBtn.textContent = 'View History';
        viewHistoryBtn.className = 'form-button';
        viewHistoryBtn.style.backgroundColor = '007BFF';
    
        appNameInput.addEventListener('input', () => {
            const appName = appNameInput.value.trim();
            if (appName.length >= 3) {
                startNewBtn.disabled = false;
                errorMsg.style.display = 'none';
                currentApplicationName = appName;
            } else {
                startNewBtn.disabled = true;
                errorMsg.textContent = 'Application name must be at least 3 characters long.';
                errorMsg.style.display = 'block';
                currentApplicationName = '';
            }
        });
    
        startNewBtn.onclick = () => {
            if (currentApplicationName) {
                processHistory = [];
                currentNode = 'DC5';
                renderNode(currentNode);
            }
        };
    
        viewHistoryBtn.onclick = showHistory;
    
        buttonContainer.appendChild(startNewBtn);
        buttonContainer.appendChild(viewHistoryBtn);
    
        centralContainer.appendChild(welcomeTitle);
        centralContainer.appendChild(appNameContainer);
        centralContainer.appendChild(buttonContainer);
    
        restartButton.textContent = "Logout";
        restartButton.disabled = false;
        restartButton.onclick = () => {
            localStorage.removeItem('authToken');
            location.reload();
        };
    }
    
    function renderHistoryList(processes) {
        const historyListContainer = document.getElementById('history-list-container');
        historyListContainer.innerHTML = ''; 

        if (processes.length === 0) {
            const noResultsText = document.createElement('p');
            noResultsText.textContent = "No matching processes found.";
            noResultsText.style.color = 'white';
            noResultsText.style.textAlign = 'center';
            noResultsText.style.marginTop = '20px';
            historyListContainer.appendChild(noResultsText);
        } else {
            processes.forEach(proc => {
                const procItem = document.createElement('div');
                procItem.className = 'history-item';

                const details = document.createElement('details');
                const summary = document.createElement('summary');
                summary.className = 'history-item-summary';

                const summaryContent = `
                    <div class="summary-info">
                        <span class="summary-app-name">${proc.application_name}</span>
                        <span class="summary-strategy">${proc.strategy_name}</span>
                    </div>
                    <span class="summary-date">${new Date(proc.created_at).toLocaleString()}</span>
                `;
                summary.innerHTML = summaryContent;

                const detailsContent = document.createElement('div');
                detailsContent.className = 'history-item-details';

                const questionsTitle = document.createElement('h4');
                questionsTitle.textContent = 'Responses:';
                detailsContent.appendChild(questionsTitle);
                
                const questions = proc.history.filter(item => item.type === 'question');
                
                questions.forEach(q => {
                    const questionElement = document.createElement('p');
                    questionElement.innerHTML = `<strong>${q.id}:</strong> ${q.text} <strong>Answer:</strong> ${q.answer}`;
                    detailsContent.appendChild(questionElement);
                });

                details.appendChild(summary);
                details.appendChild(detailsContent);
                procItem.appendChild(details);
                historyListContainer.appendChild(procItem);
            });
        }
    }

    async function showHistory() {
        try {
            const data = await apiCall('/processes', 'GET');
            allProcesses = data.processes; 

            centralContainer.innerHTML = '';
            const title = document.createElement('h2');
            title.textContent = "PREVIOUS RESULTS";
            title.className = 'history-title';
            centralContainer.appendChild(title);

            const filterContainer = document.createElement('div');
            filterContainer.className = 'filter-container';

            const appNameFilter = document.createElement('input');
            appNameFilter.type = 'text';
            appNameFilter.placeholder = 'Filter by application name...';
            appNameFilter.className = 'filter-input';
            
            const strategyFilter = document.createElement('input');
            strategyFilter.type = 'text';
            strategyFilter.placeholder = 'Filter by strategy name...';
            strategyFilter.className = 'filter-input';

            filterContainer.appendChild(appNameFilter);
            filterContainer.appendChild(strategyFilter);
            centralContainer.appendChild(filterContainer);

            const historyListContainer = document.createElement('div');
            historyListContainer.id = 'history-list-container'; 
            centralContainer.appendChild(historyListContainer);

            const applyFilters = () => {
                const appNameQuery = appNameFilter.value.toLowerCase();
                const strategyQuery = strategyFilter.value.toLowerCase();

                const filteredProcesses = allProcesses.filter(proc => {
                    const appMatch = proc.application_name.toLowerCase().includes(appNameQuery);
                    const strategyMatch = proc.strategy_name.toLowerCase().includes(strategyQuery);
                    return appMatch && strategyMatch;
                });
                renderHistoryList(filteredProcesses);
            };

            appNameFilter.addEventListener('keyup', applyFilters);
            strategyFilter.addEventListener('keyup', applyFilters);

            renderHistoryList(allProcesses);

            const backButton = document.createElement('button');
            backButton.textContent = 'Back to Main Menu';
            backButton.className = 'form-button';
            backButton.style.marginTop = '20px';
            backButton.style.width = 'auto';
            backButton.style.maxWidth = '300px';
            backButton.onclick = showMainAppView;
            centralContainer.appendChild(backButton);

        } catch (error) {
        }
    }


    const questions = {
        DC1: 'Does the solution depend on any software or package that is in a deprecated version?',
        DC2: 'Does the solution have coupled (on-premises) architecture?',
        DC3: 'Does the solution require integrations and be dependent on others that are in the on-premises infrastructure?',
        DC4: 'Does the system meet the acceptable latency level for integration and performance requirements?',
        DC5: 'Is the solution already using or capable of adopting modern architectural paradigms (e.g., microservices)?',
        DC6: 'Do the application and its dependencies have high complexity for scalability (e.g., mainframe)?',
        DC7: 'Is there a formal discontinuation plan for the software asset before the migration deadline?',
        DC8: 'Does the application generate revenue or hold strategic value for the company?',
        DC9: 'Is the application undergoing significant on-premises modernization?',
        DC10: 'Does the application support a hybrid approach, maintaining part of the system on-premises and part in the cloud?',
        DC11: 'Does the software have licensing or contractual restrictions that prevent its migration to a public cloud model?',
        DC12: 'Are the required packages available as a SaaS solution on a cloud platform?'
    };

    const strategyDescriptions = {
        REHOST: "This means moving applications to AWS with minimal changes, like 'lifting' a VM and 'shifting' it to Amazon EC2. It's the fastest migration method, ideal for quick wins and reducing immediate on-premises costs. Implementation: Use AWS Application Migration Service (AWS MGN) or CloudEndure Migration for automated server replication. This sets the foundation for future optimizations.",
        REPLATFORM: "Replatforming involves making minor cloud optimizations to an application without altering its core architecture. You're 'tinkering' to gain benefits like better performance or cost efficiency. Implementation: Replace self-managed components (e.g., databases) with AWS managed services (e.g., Amazon RDS, Elastic Beanstalk). This offers better ROI than rehosting with less complexity than a full rebuild.",
        REFACTOR: "Refactoring an application means modifying and optimizing its existing code and design to leverage cloud-native features, without fundamentally altering its core purpose or business logic. Think of it as fine-tuning your engine to run perfectly on a new, advanced fuel. This strategy improves agility, performance, and scalability by swapping out components for cloud-managed alternatives. You'd implement this by identifying parts of your application that can benefit from services like Amazon RDS (for databases), Amazon SQS (for messaging queues), or using containers with Amazon ECS/EKS. The goal is to gain significant cloud benefits with a targeted, evolutionary approach to your existing codebase.",
        REARCHITECT: "Rearchitecting an application means fundamentally rebuilding or redesigning it from the ground up to fully exploit cloud-native technologies and architectural patterns. This is about designing a brand new, high-performance vehicle specifically for the new terrain. It's ideal for applications that can't effectively scale or adapt to new business requirements within their current design. Implementation involves breaking down monolithic applications into independent microservices, adopting serverless computing with AWS Lambda, or using event-driven architectures. This strategy offers the greatest long-term benefits in terms of scalability, resilience, and cost efficiency, but it requires the most significant investment in time and resources.",
        RETIRE: " Retiring means decommissioning applications that are no longer useful, provide no business value, or are redundant. It's about cleaning up your IT environment. Implementation: Identify obsolete applications, map dependencies to avoid impact, archive or delete data as needed, and communicate changes. This reduces complexity, eliminates costs, and frees up resources for more valuable initiatives.",
        RETAIN: "This means keeping certain applications in their current environment (e.g., on-premises) for now. Reasons include critical dependencies, compliance, or recent investments. Implementation: Document the specific justifications for retaining. Establish a plan to revisit these applications later as conditions change. Ensure proper hybrid connectivity if applicable. It offers flexibility and focuses migration efforts on high-impact workloads.",
        REPURCHASE: "This strategy involves switching from an existing application to a different, usually cloud-based, SaaS solution. You 'drop' the old and 'shop' for a new, often more modern service. Implementation: Evaluate SaaS options (e.g., for CRM, ERP), plan data migration to a new platform, and consider necessary integrations. It simplifies management and converts CapEx to OpEx, often being a straightforward migration."
    };

    function formatNodeId(nodeId) {
        if (nodeId.startsWith('DC')) {
            const number = nodeId.substring(2);
            return `Decision Criteria n° ${number}`;
        }
        return nodeId;
    }

    function renderNode(nodeId) {
        const previousNodeId = currentNode;
        currentNode = nodeId;
        const nextNode = decisionTree[nodeId];

        centralContainer.innerHTML = '';
        centralContainer.style.flexDirection = 'column';
        centralContainer.style.alignItems = 'center';

        if (previousNodeId && questions[previousNodeId] && previousNodeId !== nodeId) {
            let answer = (decisionTree[previousNodeId]?.yes === currentNode) ? 'Yes' : 'No';
            processHistory.push({ type: 'question', id: previousNodeId, text: questions[previousNodeId], answer: answer });
        }

        if (!nextNode) {
            const finalStrategy = { type: 'strategy', id: nodeId, text: strategyDescriptions[nodeId] || 'No description available.', name: nodeId };
            processHistory.push(finalStrategy);
            
            centralContainer.style.flexDirection = 'row';
            centralContainer.style.alignItems = 'center'; 
            centralContainer.style.gap = '30px'; 
        
            const contentColumn = document.createElement('div');
            contentColumn.classList.add('results-content-column');
        
            const resultsContainer = document.createElement('div');
            resultsContainer.classList.add('results-container');
            resultsContainer.id = 'results-section-for-pdf';
            resultsContainer.style.flexDirection = 'column';
        
            const strategyOutputWrapper = document.createElement('div');
            strategyOutputWrapper.classList.add('strategy-output-wrapper');
        
            const strategyTitle = document.createElement('h3');
            strategyTitle.classList.add('strategy-title');
            strategyTitle.textContent = 'STRATEGY SUGGESTED';
        
            const strategyBox = document.createElement('div');
            strategyBox.classList.add('strategy-box');
            strategyBox.textContent = nodeId;
        
            strategyOutputWrapper.appendChild(strategyTitle);
            strategyOutputWrapper.appendChild(strategyBox);
        
            const descriptionWrapper = document.createElement('div');
            descriptionWrapper.classList.add('strategy-description-wrapper');
        
            const descriptionTitle = document.createElement('h3');
            descriptionTitle.classList.add('description-title');
            descriptionTitle.textContent = 'DESCRIPTION';
            
            const descriptionBox = document.createElement('p');
            descriptionBox.classList.add('strategy-description');
            descriptionBox.textContent = strategyDescriptions[nodeId] || 'No description available.';
        
            descriptionWrapper.appendChild(descriptionTitle);
            descriptionWrapper.appendChild(descriptionBox);
        
            resultsContainer.appendChild(strategyOutputWrapper);
            resultsContainer.appendChild(descriptionWrapper);
            contentColumn.appendChild(resultsContainer);
        
            const buttonColumn = document.createElement('div');
            buttonColumn.classList.add('results-button-column');
        
            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.flexDirection = 'column'; 
            buttonContainer.style.gap = '20px';
            buttonContainer.style.width = '100%';
        
            const saveButton = document.createElement('button');
            saveButton.textContent = 'Save Process';
            saveButton.className = 'form-button';
            saveButton.onclick = async () => {
                try {
                    await apiCall('/save_process', 'POST', { 
                        processHistory: processHistory,
                        applicationName: currentApplicationName 
                    });
                    alert('Process saved successfully!');
                    showMainAppView();
                } catch (error) {
                }
            };
        
            const generatePdfButton = document.createElement('button');
            generatePdfButton.textContent = 'Generate .PDF Report';
            generatePdfButton.className = 'form-button';
            generatePdfButton.style.backgroundColor = '#007BFF';
            generatePdfButton.onclick = generatePdfReport;
        
            const backButton = document.createElement('button');
            backButton.textContent = 'Menu (Don\'t Save)';
            backButton.className = 'form-button';
            backButton.style.backgroundColor = '#6c757d';
            backButton.onclick = showMainAppView;
        
            buttonContainer.appendChild(saveButton);
            buttonContainer.appendChild(generatePdfButton);
            buttonContainer.appendChild(backButton);
            buttonColumn.appendChild(buttonContainer);
        
            centralContainer.appendChild(contentColumn);
            centralContainer.appendChild(buttonColumn);
        
            return;
        }

        const title = document.createElement('h2');
        title.textContent = formatNodeId(nodeId);
        Object.assign(title.style, { color: 'white', textAlign: 'center', marginBottom: '15px', textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' });

        const box = document.createElement('div');
        box.textContent = questions[nodeId] || 'Question not defined';
        Object.assign(box.style, { backgroundColor: 'white', padding: '30px', borderRadius: '10px', textAlign: 'center', margin: '0 auto 20px auto', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', fontWeight: 'bold', maxWidth: '80%', fontSize: '1.5em', boxSizing: 'border-box' });

        const buttonContainer = document.createElement('div');
        Object.assign(buttonContainer.style, { display: 'flex', justifyContent: 'center', gap: '20px' });

        const yesBtn = document.createElement('button');
        yesBtn.textContent = 'Yes';
        yesBtn.classList.add('yes-button');
        yesBtn.onclick = () => renderNode(nextNode.yes);

        const noBtn = document.createElement('button');
        noBtn.textContent = 'No';
        noBtn.classList.add('no-button');
        noBtn.onclick = () => renderNode(nextNode.no);

        buttonContainer.appendChild(yesBtn);
        buttonContainer.appendChild(noBtn);
        centralContainer.appendChild(title);
        centralContainer.appendChild(box);
        centralContainer.appendChild(buttonContainer);
    }

    async function generatePdfReport() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        let yOffset = 10;
        
        doc.setFontSize(22);
        doc.text("6R's Decision Tree Report", 105, yOffset, null, null, "center");
        yOffset += 10;

        doc.setFontSize(14);
        doc.text(`Application: ${currentApplicationName}`, 10, yOffset);
        yOffset += 15;

        doc.text("Process History:", 10, yOffset);
        yOffset += 10;
        
        processHistory.forEach((item, index) => {
            if (yOffset > 270) { doc.addPage(); yOffset = 10; }
            if (item.type === 'question') {
                doc.setFontSize(12);
                const splitQuestion = doc.splitTextToSize(`Q: ${item.text}`, 180);
                doc.text(splitQuestion, 15, yOffset);
                yOffset += (splitQuestion.length * 5);
                doc.text(`A: ${item.answer}`, 15, yOffset + 3, { "font-style": "bold" });
                yOffset += 10;
            } else if (item.type === 'strategy') {
                doc.setFontSize(14);
                doc.text(`Final Strategy: ${item.name}`, 15, yOffset);
                yOffset += 8;
                doc.setFontSize(12);
                const splitDescription = doc.splitTextToSize(item.text, 180);
                doc.text(splitDescription, 20, yOffset);
                yOffset += (splitDescription.length * 5) + 10;
            }
        });
        doc.save(`${currentApplicationName.replace(/ /g, '_')}_Report.pdf`);
    }
});
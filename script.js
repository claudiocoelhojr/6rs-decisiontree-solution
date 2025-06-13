import { decisionTree } from './decisiontree.js'; // Mantenha esta linha se 'decisiontree.js' for um arquivo separado

document.addEventListener('DOMContentLoaded', function () {
    const startButton = document.getElementById('start-process');
    const infoButton = document.getElementById('more-info');
    const centralContainer = document.querySelector('.central-container');
    const restartButton = document.getElementById('restart-button');

    // Variável para armazenar o histórico de perguntas e respostas
    let processHistory = [];
    let currentNode = 'DC5'; // Ponto de partida do seu processo

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
        REPURCHASE: "This strategy involves switching from an existing application to a different, usually cloud-based, SaaS solution. You 'drop' the old and 'shop' for a new, often more modern service. Implementation: Evaluate SaaS options (e.g., for CRM, ERP), plan data migration to the new platform, and consider necessary integrations. It simplifies management and converts CapEx to OpEx, often being a straightforward migration."
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
            const questionText = questions[previousNodeId];
            let answer = '';
            if (decisionTree[previousNodeId]?.yes === currentNode) {
                answer = 'Yes';
            } else if (decisionTree[previousNodeId]?.no === currentNode) {
                answer = 'No';
            }
            processHistory.push({ type: 'question', id: previousNodeId, text: questionText, answer: answer });
        }


        if (!nextNode) {
            centralContainer.style.flexDirection = 'row';
            centralContainer.style.justifyContent = 'center';
            centralContainer.style.alignItems = 'center';
            centralContainer.style.gap = '30px';
            centralContainer.style.flexWrap = 'wrap';

            const finalStrategy = {
                type: 'strategy',
                id: nodeId,
                text: strategyDescriptions[nodeId] || 'No description available.',
                name: nodeId
            };
            processHistory.push(finalStrategy);

            const resultsContainer = document.createElement('div');
            resultsContainer.classList.add('results-container');
            resultsContainer.id = 'results-section-for-pdf';

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

            // NEW: Description Title
            const descriptionTitle = document.createElement('h3');
            descriptionTitle.classList.add('description-title');
            descriptionTitle.textContent = 'DESCRIPTION';
            descriptionWrapper.appendChild(descriptionTitle); // Add the title before the description box

            const descriptionBox = document.createElement('p');
            descriptionBox.classList.add('strategy-description');
            descriptionBox.textContent = strategyDescriptions[nodeId] || 'No description available.';
            descriptionWrapper.appendChild(descriptionBox);

            resultsContainer.appendChild(strategyOutputWrapper);
            resultsContainer.appendChild(descriptionWrapper);

            centralContainer.appendChild(resultsContainer);

            const generatePdfButton = document.createElement('button');
            generatePdfButton.textContent = 'Generate PDF Report';
            generatePdfButton.id = 'generate-pdf-button';
            generatePdfButton.style.marginTop = '20px';
            generatePdfButton.style.padding = '30px 25px';
            generatePdfButton.style.fontSize = '1.5em';
            generatePdfButton.style.fontWeight = 'bold';
            generatePdfButton.style.borderRadius = '8px';
            generatePdfButton.style.border = 'none';
            generatePdfButton.style.backgroundColor = '#007BFF';
            generatePdfButton.style.color = '#ffffff';
            generatePdfButton.style.cursor = 'pointer';
            generatePdfButton.style.transition = 'all 0.3s ease';
            generatePdfButton.style.boxShadow = '0px 4px 4px rgba(0, 0, 0, 0.25)';

            generatePdfButton.onmouseover = function() {
                this.style.backgroundColor = '#0056b3';
                this.style.transform = 'scale(1.05)';
            };
            generatePdfButton.onmouseout = function() {
                this.style.backgroundColor = '#007BFF';
                this.style.transform = 'scale(1)';
            };

            generatePdfButton.onclick = generatePdfReport;
            centralContainer.appendChild(generatePdfButton);

            return;
        }

        const title = document.createElement('h2');
        title.textContent = formatNodeId(nodeId);
        title.style.color = 'white';
        title.style.textAlign = 'center';
        title.style.marginBottom = '15px';
        title.style.textShadow = '0px 4px 4px rgba(0, 0, 0, 0.25)';

        const box = document.createElement('div');
        box.textContent = questions[nodeId] || 'Question not defined';
        box.style.backgroundColor = 'white';
        box.style.padding = '30px';
        box.style.borderRadius = '10px';
        box.style.textAlign = 'center';
        box.style.margin = '0 auto 20px auto';
        box.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        box.style.fontWeight = 'bold';
        box.style.maxWidth = '80%';
        box.style.fontSize = '1.5em';
        box.style.boxSizing = 'border-box';

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.gap = '20px';

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
        yOffset += 15;

        doc.setFontSize(14);
        doc.text("Process History:", 10, yOffset);
        yOffset += 10;

        processHistory.forEach((item, index) => {
            if (item.type === 'question') {
                doc.setFontSize(12);
                const splitQuestion = doc.splitTextToSize(item.text, 180);
                doc.text(`Question ${index + 1}:`, 15, yOffset);
                yOffset += 7;
                doc.text(splitQuestion, 20, yOffset);
                yOffset += (splitQuestion.length * 7);

                doc.text(`Answer: ${item.answer}`, 20, yOffset + 3);
                yOffset += 10;
            } else if (item.type === 'strategy') {
                doc.setFontSize(14);
                doc.text(`Final Strategy: ${item.name}`, 15, yOffset);
                yOffset += 8;
                doc.setFontSize(12);
                const splitDescription = doc.splitTextToSize(item.text, 180);
                doc.text(splitDescription, 20, yOffset);
                yOffset += (splitDescription.length * 7) + 10;
            }

            if (yOffset > 270) {
                doc.addPage();
                yOffset = 10;
            }
        });

        if (processHistory.length > 0 && processHistory[processHistory.length - 1].type === 'strategy') {
            if (yOffset > 100) {
                doc.addPage();
                yOffset = 10;
            } else {
                yOffset += 20;
            }

            doc.setFontSize(14);
            doc.text("Visual Representation of Final Strategy:", 10, yOffset);
            yOffset += 10;

            const resultsSection = document.getElementById('results-section-for-pdf');
            if (resultsSection) {
                const originalDisplay = resultsSection.style.display;
                resultsSection.style.display = 'block';

                await html2canvas(resultsSection, { scale: 2, logging: false }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const imgWidth = 190;
                    const pageHeight = doc.internal.pageSize.height;
                    const imgHeight = canvas.height * imgWidth / canvas.width;
                    let heightLeft = imgHeight;

                    let position = yOffset;

                    doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;

                    while (heightLeft >= 0) {
                        position = heightLeft - imgHeight;
                        doc.addPage();
                        doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                        heightLeft -= pageHeight;
                    }
                }).catch(error => {
                    console.error("Erro ao gerar canvas da seção de resultados:", error);
                });
                resultsSection.style.display = originalDisplay;
            }
        }

        doc.save('6Rs_Decision_Tree_Report.pdf');
    }

    startButton.addEventListener('click', () => {
        startButton.style.display = 'none';
        infoButton.style.display = 'none';
        restartButton.disabled = false;
        processHistory = [];
        renderNode(currentNode);
    });

    restartButton.addEventListener('click', function () {
        if (restartButton.disabled) return;
        processHistory = [];
        location.reload();
    });

    infoButton.addEventListener('click', function () {
        window.open(
            'https://aws.amazon.com/pt/blogs/enterprise-strategy/6-strategies-for-migrating-applications-to-the-cloud/',
            '_blank'
        );
    });
});
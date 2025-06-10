import { decisionTree } from './decisiontree.js';

document.addEventListener('DOMContentLoaded', function () {
  const startButton = document.getElementById('start-process');
  const infoButton = document.getElementById('more-info');
  const centralContainer = document.querySelector('.central-container');
  const restartButton = document.getElementById('restart-button');

  let currentNode = 'DC5';

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
  REHOST: 'Rehost (Lift-and-Shift): Move applications to the cloud with minimal changes. Useful for quick migrations when time is a constraint.',
  REPLATFORM: 'Replatform: Make a few cloud optimizations without changing the core architecture. Improves performance or cost without major refactoring.',
  REFACTOR: 'Refactor (Re-architect): Re-imagine how the application is architected and developed using cloud-native features.',
  REARCHITECT: 'Rearchitect: Modify or extend the application’s code base to scale and optimize it for the cloud.',
  RETIRE: 'Retire: Remove applications that are no longer useful, saving costs and simplifying the environment.',
  RETAIN: 'Retain: Keep applications on-premises for now, due to critical dependencies or compliance concerns.',
  REPURCHASE: 'Repurchase: Move to a different product, typically by dropping the existing application and subscribing to a SaaS solution.'
};


  function formatNodeId(nodeId) {
    if (nodeId.startsWith('DC')) {
      const number = nodeId.substring(2);
      return `Decision Criteria n° ${number}`;
    }
    return nodeId;
  }

  function renderNode(nodeId) {
    const nextNode = decisionTree[nodeId];
    centralContainer.innerHTML = '';
    centralContainer.style.flexDirection = 'column';
    centralContainer.style.alignItems = 'center';

    if (!nextNode) {
  centralContainer.innerHTML = '';
  centralContainer.style.display = 'flex';
  centralContainer.style.flexDirection = 'row';
  centralContainer.style.justifyContent = 'center';
  centralContainer.style.alignItems = 'center';
  centralContainer.style.gap = '30px';
  centralContainer.style.flexWrap = 'wrap';

  const strategyBox = document.createElement('div');
  strategyBox.textContent = nodeId;
  strategyBox.style.backgroundColor = 'white';
  strategyBox.style.padding = '25px';
  strategyBox.style.borderRadius = '10px';
  strategyBox.style.textAlign = 'center';
  strategyBox.style.fontWeight = 'bold';
  strategyBox.style.fontSize = '1.8em';
  strategyBox.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
  strategyBox.style.minWidth = '200px';

  const descriptionBox = document.createElement('div');
  descriptionBox.textContent = strategyDescriptions[nodeId] || 'No description available.';
  descriptionBox.style.padding = '20px';
  descriptionBox.style.textAlign = 'left';
  descriptionBox.style.fontSize = '1.7em';
  descriptionBox.style.maxWidth = '1000px';
  descriptionBox.style.fontWeight = 'bold';
  descriptionBox.style.color = 'white';

  centralContainer.appendChild(strategyBox);
  centralContainer.appendChild(descriptionBox);
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
    box.style.padding = '20px';
    box.style.borderRadius = '10px';
    box.style.textAlign = 'center';
    box.style.marginBottom = '20px';
    box.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    box.style.fontWeight = 'bold';
    box.style.maxWidth = '600px';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.gap = '20px';

    const yesBtn = document.createElement('button');
    yesBtn.textContent = 'Yes';
    yesBtn.classList.add('yes-button');
    yesBtn.style.backgroundColor = '#40ae40';
    yesBtn.style.color = '#fff';
    yesBtn.style.fontSize = '1.2em';
    yesBtn.style.fontWeight = 'bold';
    yesBtn.style.padding = '10px 20px';
    yesBtn.style.border = 'none';
    yesBtn.style.borderRadius = '8px';
    yesBtn.style.cursor = 'pointer';
    yesBtn.style.textShadow = '0px 4px 4px rgba(0, 0, 0, 0.25)';
    yesBtn.style.boxShadow = '0px 4px 4px rgba(0, 0, 0, 0.25)';
    yesBtn.onclick = () => renderNode(nextNode.yes);

    const noBtn = document.createElement('button');
    noBtn.textContent = 'No';
    noBtn.classList.add('no-button');
    noBtn.style.backgroundColor = '#d33';
    noBtn.style.color = '#fff';
    noBtn.style.fontSize = '1.2em';
    noBtn.style.fontWeight = 'bold';
    noBtn.style.padding = '10px 20px';
    noBtn.style.border = 'none';
    noBtn.style.borderRadius = '8px';
    noBtn.style.cursor = 'pointer';
    noBtn.style.textShadow = '0px 4px 4px rgba(0, 0, 0, 0.25)';
    noBtn.style.boxShadow = '0px 4px 4px rgba(0, 0, 0, 0.25)';
    noBtn.onclick = () => renderNode(nextNode.no);

    buttonContainer.appendChild(yesBtn);
    buttonContainer.appendChild(noBtn);

    centralContainer.appendChild(title);
    centralContainer.appendChild(box);
    centralContainer.appendChild(buttonContainer);
  }

  startButton.addEventListener('click', () => {
    startButton.style.display = 'none';
    infoButton.style.display = 'none';
    restartButton.disabled = false;
    renderNode(currentNode);
  });

  restartButton.addEventListener('click', function () {
    if (restartButton.disabled) return;
    location.reload(); // Recarrega para restaurar início
  });

  infoButton.addEventListener('click', function () {
    window.open(
      'https://aws.amazon.com/pt/blogs/enterprise-strategy/6-strategies-for-migrating-applications-to-the-cloud/',
      '_blank'
    );
  });
});
function removeRow(button) {
    const inputGroups = document.querySelectorAll('.input-group');
    if (inputGroups.length > 1) {
        button.parentElement.remove();
    }
}

document.getElementById("add-member").addEventListener("click", function () {
    const inputs = document.getElementById("inputs");

    const group = document.createElement("div");
    group.className = "input-group";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "name";
    nameInput.placeholder = "Name";

    const amountInput = document.createElement("input");
    amountInput.type = "number";
    amountInput.className = "amount";
    amountInput.placeholder = "Amount paid";
    amountInput.step = "0.01";

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "Remove";
    removeBtn.onclick = function() { removeRow(this); };

    group.appendChild(nameInput);
    group.appendChild(amountInput);
    group.appendChild(removeBtn);

    inputs.appendChild(group);
});

document.getElementById("calculate").addEventListener("click", function () {
    const names = document.querySelectorAll(".name");
    const amounts = document.querySelectorAll(".amount");
    const results = document.getElementById("results");
    results.innerHTML = "";

    let people = [];

    for (let i = 0; i < names.length; i++) {
        const name = names[i].value.trim();
        const amount = parseFloat(amounts[i].value.trim()) || 0;

        if (name) {
            people.push({ name, paid: amount });
        }
    }

    if (people.length === 0) {
        results.innerHTML = "<p>Please enter at least one valid name.</p>";
        return;
    }

    if (people.length === 1) {
        results.innerHTML = "<p>You need at least 2 people to split a bill!</p>";
        return;
    }

    const totalPaid = people.reduce((sum, person) => sum + person.paid, 0);
    const share = totalPaid / people.length;

    // Calculate each person's balance (positive = they're owed money, negative = they owe money)
    people = people.map(person => ({
        ...person,
        balance: parseFloat((person.paid - share).toFixed(2)),
        share: parseFloat(share.toFixed(2))
    }));

    // Create summary
    let summaryHTML = `
        <div class="summary">
            <h3>📊 Summary</h3>
            <p><strong>Total paid:</strong> $${totalPaid.toFixed(2)}</p>
            <p><strong>Each person's share:</strong> $${share.toFixed(2)}</p>
            <p><strong>Number of people:</strong> ${people.length}</p>
        </div>
    `;

    // Calculate direct person-to-person debts
    let resultsHTML = summaryHTML;

    for (let person of people) {
        resultsHTML += `<div class="person-section">`;
        resultsHTML += `<div class="person-name">${person.name}</div>`;
        resultsHTML += `<div class="person-summary">
            Paid: $${person.paid.toFixed(2)} | 
            Fair Share: $${person.share.toFixed(2)} | 
            Net Balance: <span class="${person.balance >= 0 ? 'balanced' : ''}">${person.balance >= 0 ? '+' : ''}$${person.balance.toFixed(2)}</span>
        </div>`;

        // Calculate what this person owes to or is owed by each other person
        resultsHTML += `<p><strong>Individual transactions for ${person.name}:</strong></p>`;
        resultsHTML += `<ul class="debt-list">`;
        
        let hasTransactions = false;
        
        for (let otherPerson of people) {
            if (otherPerson.name !== person.name) {
                // Calculate direct debt between these two people
                // Person A owes Person B the difference between what B paid for A minus what A paid for B
                const personPaidForOther = person.paid / people.length; // What this person paid that covers the other person
                const otherPaidForPerson = otherPerson.paid / people.length; // What the other person paid that covers this person
                
                const netDebt = otherPaidForPerson - personPaidForOther;
                
                if (Math.abs(netDebt) > 0.01) {
                    hasTransactions = true;
                    if (netDebt > 0) {
                        // This person owes the other person
                        resultsHTML += `<li class="debt-item">💸 ${person.name} owes ${otherPerson.name}: $${netDebt.toFixed(2)}</li>`;
                    } else {
                        // The other person owes this person
                        resultsHTML += `<li class="credit-item">💰 ${otherPerson.name} owes ${person.name}: $${Math.abs(netDebt).toFixed(2)}</li>`;
                    }
                }
            }
        }
        
        if (!hasTransactions) {
            resultsHTML += `<li class="balanced">✅ No transactions needed with anyone</li>`;
        }
        
        resultsHTML += `</ul>`;
        resultsHTML += `</div>`;
    }

    results.innerHTML = resultsHTML;
});
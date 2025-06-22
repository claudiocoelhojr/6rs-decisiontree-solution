document.addEventListener('DOMContentLoaded', function () {
    const resetForm = document.getElementById('reset-password-form');
    const API_URL = 'https://sixrs-decisiontree-solution.onrender.com';

    resetForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;
        const submitButton = this.querySelector('button[type="submit"]');

        if (newPassword !== confirmNewPassword) {
            alert('Passwords do not match.');
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
            alert('No reset token found. Please use the link from your email.');
            return;
        }

        submitButton.textContent = 'UPDATING...';
        submitButton.disabled = true;

        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    password: newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'An unknown error occurred.');
            }

            alert(data.message);
            window.location.href = 'index.html';

        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            submitButton.textContent = 'UPDATE PASSWORD';
            submitButton.disabled = false;
        }
    });
});
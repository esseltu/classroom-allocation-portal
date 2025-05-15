document.addEventListener('DOMContentLoaded', async () => {
  console.log('Settings script loaded'); // Log when the script is loaded

  const auth = JSON.parse(localStorage.getItem('auth'));
  console.log('Auth data:', auth); // Log the auth data

  if (!auth || !auth.isLoggedIn) {
    console.warn('User not logged in, redirecting to login page'); // Log redirection
    window.location.href = 'Login.html';
    return;
  }

  try {
    console.log('Fetching user details from backend...');
    const response = await fetch(`http://localhost:5001/api/user/${auth.userId}`);
    const userDetails = await response.json();
    console.log('User details fetched:', userDetails); // Log the fetched user details

    document.getElementById('full-name').value = userDetails.fullName || '';
    document.getElementById('email').value = userDetails.email || '';
    document.getElementById('department').value = userDetails.department || 'Computer Science';
    document.getElementById('level').value = userDetails.level || '300';
  } catch (error) {
    console.error('Error fetching user details:', error); // Log any errors
  }

  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const updatedDetails = {
      fullName: document.getElementById('full-name').value,
      email: document.getElementById('email').value,
      department: document.getElementById('department').value,
      level: document.getElementById('level').value,
    };

    try {
      const response = await fetch(`http://localhost:5001/api/user/${auth.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDetails),
      });

      if (response.ok) {
        alert('Profile updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  });

  document.getElementById('password-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    try {
      fetch(`http://localhost:5001/api/user/${auth.userId}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
      })
      .then(async (response) => {
        if (response.ok) {
        alert('Password changed successfully!');
        document.getElementById('password-form').reset();
        } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
        }
      })
      .catch((error) => {
        console.error('Error changing password:', error);
        alert('Failed to change password. Please try again.');
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  });
});
// Authentication functionality for Rigden Store
import { supabase, getCurrentUser, signUp, signIn, signOut } from './supabase.js';

// State variables
let isAuthenticated = false;
let currentUser = null;

// Function to check if user is authenticated on page load
async function checkAuth() {
  const user = await getCurrentUser();
  if (user) {
    isAuthenticated = true;
    currentUser = user;
    updateAuthUI(true);
    return true;
  } else {
    isAuthenticated = false;
    currentUser = null;
    updateAuthUI(false);
    return false;
  }
}

// Update UI based on authentication status
function updateAuthUI(isLoggedIn) {
  const authLinks = document.querySelectorAll('.auth-link');
  const profileLinks = document.querySelectorAll('.profile-link');
  const accountName = document.getElementById('account-name');
  
  if (isLoggedIn) {
    // Show profile links, hide auth links
    authLinks.forEach(link => link.style.display = 'none');
    profileLinks.forEach(link => link.style.display = 'block');
    
    // Update account name if element exists
    if (accountName && currentUser) {
      const firstName = currentUser.user_metadata?.first_name || '';
      accountName.textContent = `Hi, ${firstName}`;
    }
    
    // Show any user-specific elements
    document.querySelectorAll('.auth-only').forEach(el => {
      el.style.display = 'block';
    });
  } else {
    // Show auth links, hide profile links
    authLinks.forEach(link => link.style.display = 'block');
    profileLinks.forEach(link => link.style.display = 'none');
    
    // Hide any user-specific elements
    document.querySelectorAll('.auth-only').forEach(el => {
      el.style.display = 'none';
    });
  }
}

// Function to handle sign up
async function handleSignUp(event) {
  event.preventDefault();
  
  const form = event.target;
  const email = form.email.value;
  const password = form.password.value;
  const firstName = form.firstName?.value || '';
  const lastName = form.lastName?.value || '';
  
  // Basic validation
  if (!email || !password) {
    showAuthError('Please fill in all required fields');
    return;
  }
  
  // Show loading state
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Creating account...';
  
  // Attempt to sign up
  const result = await signUp(email, password, firstName, lastName);
  
  // Reset button state
  submitButton.disabled = false;
  submitButton.textContent = originalButtonText;
  
  if (result.success) {
    // Show success message and redirect to sign-in or confirmation page
    showAuthSuccess('Account created successfully! Please check your email for verification.');
    
    // Close modal if it exists
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('active');
    }
    
    // Optionally redirect
    // window.location.href = '/confirmation.html';
  } else {
    showAuthError(result.error || 'Failed to create account');
  }
}

// Function to handle sign in
async function handleSignIn(event) {
  event.preventDefault();
  
  const form = event.target;
  const email = form.email.value;
  const password = form.password.value;
  
  // Basic validation
  if (!email || !password) {
    showAuthError('Please enter your email and password');
    return;
  }
  
  // Show loading state
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Signing in...';
  
  // Attempt to sign in
  const result = await signIn(email, password);
  
  // Reset button state
  submitButton.disabled = false;
  submitButton.textContent = originalButtonText;
  
  if (result.success) {
    // Update authentication state
    isAuthenticated = true;
    currentUser = result.user;
    
    // Update UI
    updateAuthUI(true);
    
    // Show success message
    showAuthSuccess('Signed in successfully!');
    
    // Close modal if it exists
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('active');
    }
    
    // Refresh the page or redirect
    // window.location.reload();
  } else {
    showAuthError(result.error || 'Invalid email or password');
  }
}

// Function to handle sign out
async function handleSignOut(event) {
  if (event) event.preventDefault();
  
  const result = await signOut();
  
  if (result.success) {
    // Update authentication state
    isAuthenticated = false;
    currentUser = null;
    
    // Update UI
    updateAuthUI(false);
    
    // Show success message
    showAuthSuccess('Signed out successfully!');
    
    // Optionally redirect to home page
    // window.location.href = '/';
  } else {
    showAuthError(result.error || 'Failed to sign out');
  }
}

// Helper function to show auth errors
function showAuthError(message) {
  const errorElement = document.getElementById('auth-error');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Hide error after 5 seconds
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  } else {
    // Fallback to alert if error element doesn't exist
    alert(message);
  }
}

// Helper function to show auth success messages
function showAuthSuccess(message) {
  const successElement = document.getElementById('auth-success');
  if (successElement) {
    successElement.textContent = message;
    successElement.style.display = 'block';
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      successElement.style.display = 'none';
    }, 5000);
  } else {
    // Fallback to alert if success element doesn't exist
    alert(message);
  }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication status
  checkAuth();
  
  // Set up event listeners for auth forms
  const signUpForm = document.getElementById('signup-form');
  const signInForm = document.getElementById('signin-form');
  const signOutButtons = document.querySelectorAll('.signout-button');
  
  if (signUpForm) {
    signUpForm.addEventListener('submit', handleSignUp);
  }
  
  if (signInForm) {
    signInForm.addEventListener('submit', handleSignIn);
  }
  
  signOutButtons.forEach(button => {
    button.addEventListener('click', handleSignOut);
  });
  
  // Toggle between sign in and sign up forms if they exist
  const authToggleLinks = document.querySelectorAll('.auth-toggle');
  authToggleLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetForm = link.getAttribute('data-target');
      
      document.querySelectorAll('.auth-form').forEach(form => {
        form.style.display = 'none';
      });
      
      document.getElementById(targetForm).style.display = 'block';
    });
  });
});

// Export auth functions
export {
  isAuthenticated,
  currentUser,
  checkAuth,
  handleSignIn,
  handleSignUp,
  handleSignOut
};

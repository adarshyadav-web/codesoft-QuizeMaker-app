const quizzes = [];
const users = [];
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {

    let quizzes = [];
    let users = [];
    let currentUser = null;

    document.addEventListener('DOMContentLoaded', () => {
        // Load data from localStorage
        const storedUsers = localStorage.getItem('users');
        const storedQuizzes = localStorage.getItem('quizzes');
        const storedCurrentUser = localStorage.getItem('currentUser');

        if (storedUsers) {
            users = JSON.parse(storedUsers);
        }
        if (storedQuizzes) {
            quizzes = JSON.parse(storedQuizzes);
        }
        if (storedCurrentUser) {
            currentUser = storedCurrentUser;
        }
    });
})


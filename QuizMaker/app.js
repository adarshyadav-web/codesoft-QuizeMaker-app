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
    // Navigation links
    const homeLink = document.getElementById('home-link');
    const createQuizLink = document.getElementById('create-quiz-link');
    const takeQuizLink = document.getElementById('take-quiz-link');
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');

    // Sections
    const homeSection = document.getElementById('home-section');
    const createQuizSection = document.getElementById('create-quiz-section');
    const takeQuizSection = document.getElementById('take-quiz-section');
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');

    // Show section helper
    function showSection(section) {
        [homeSection, createQuizSection, takeQuizSection, loginSection, registerSection].forEach(sec => {
            sec.classList.add('hidden-section');
            sec.classList.remove('active-section');
        });
        section.classList.remove('hidden-section');
        section.classList.add('active-section');
    }

    // Navigation event listeners
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(homeSection);
    });

    createQuizLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert('Please login to create a quiz.');
            showSection(loginSection);
            return;
        }
        showSection(createQuizSection);
    });

    takeQuizLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(takeQuizSection);
        renderQuizList();
    });

    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(loginSection);
    });

    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(registerSection);
    });

    // Quiz creation form
    const createQuizForm = document.getElementById('create-quiz-form');
    const questionsContainer = document.getElementById('questions-container');
    const addQuestionBtn = document.getElementById('add-question-btn');

    addQuestionBtn.addEventListener('click', () => {
        addQuestionBlock();
    });

    let editingQuizId = null;

    function addQuestionBlock(questionData = null) {
        const questionIndex = questionsContainer.children.length;
        const questionBlock = document.createElement('div');
        questionBlock.classList.add('question-block');
        questionBlock.innerHTML = `
        <h4>Question ${questionIndex + 1}</h4>
        <input type="text" name="question" placeholder="Enter question" required value="${questionData ? questionData.question : ''}" />
        <div class="option-input">
            <input type="text" name="option1" placeholder="Option 1" required value="${questionData ? questionData.options[0] : ''}" />
            <label><input type="radio" name="correct${questionIndex}" value="0" required ${questionData && questionData.correctIndex === 0 ? 'checked' : ''} /> Correct</label>
        </div>
        <div class="option-input">
            <input type="text" name="option2" placeholder="Option 2" required value="${questionData ? questionData.options[1] : ''}" />
            <label><input type="radio" name="correct${questionIndex}" value="1" required ${questionData && questionData.correctIndex === 1 ? 'checked' : ''} /> Correct</label>
        </div>
        <div class="option-input">
            <input type="text" name="option3" placeholder="Option 3" required value="${questionData ? questionData.options[2] : ''}" />
            <label><input type="radio" name="correct${questionIndex}" value="2" required ${questionData && questionData.correctIndex === 2 ? 'checked' : ''} /> Correct</label>
        </div>
        <div class="option-input">
            <input type="text" name="option4" placeholder="Option 4" required value="${questionData ? questionData.options[3] : ''}" />
            <label><input type="radio" name="correct${questionIndex}" value="3" required ${questionData && questionData.correctIndex === 3 ? 'checked' : ''} /> Correct</label>
        </div>
        <button type="button" class="delete-question-btn">Delete Question</button>
    `;
        questionsContainer.appendChild(questionBlock);

        // Add event listener for delete button
        const deleteBtn = questionBlock.querySelector('.delete-question-btn');
        deleteBtn.addEventListener('click', () => {
            questionBlock.remove();
            updateQuestionHeaders();
        });
    }

    function updateQuestionHeaders() {
        const questionBlocks = questionsContainer.querySelectorAll('.question-block');
        questionBlocks.forEach((block, index) => {
            const header = block.querySelector('h4');
            header.textContent = `Question ${index + 1}`;
            // Update radio button names to keep them unique
            const radios = block.querySelectorAll('input[type="radio"]');
            radios.forEach(radio => {
                const value = radio.value;
                radio.name = `correct${index}`;
            });
        });
    }

    // Modify createQuizForm submit event to handle editing
    createQuizForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const questionBlocks = questionsContainer.querySelectorAll('.question-block');
        if (questionBlocks.length === 0) {
            alert('Please add at least one question.');
            return;
        }
        if (editingQuizId) {
            // Update existing quiz
            const quiz = quizzes.find(q => q.id === editingQuizId);
            if (!quiz) {
                alert('Quiz not found.');
                return;
            }
            const updatedQuestions = [];
            for (const block of questionBlocks) {
                const questionText = block.querySelector('input[name="question"]').value.trim();
                const options = [
                    block.querySelector('input[name="option1"]').value.trim(),
                    block.querySelector('input[name="option2"]').value.trim(),
                    block.querySelector('input[name="option3"]').value.trim(),
                    block.querySelector('input[name="option4"]').value.trim()
                ];
                const correctRadio = block.querySelector('input[type="radio"]:checked');
                if (!correctRadio) {
                    alert('Please select the correct answer for all questions.');
                    return;
                }
                const correctIndex = parseInt(correctRadio.value);
                updatedQuestions.push({
                    question: questionText,
                    options,
                    correctIndex
                });
            }
            quiz.questions = updatedQuestions;
            localStorage.setItem('quizzes', JSON.stringify(quizzes));
            alert('Quiz updated successfully!');
            editingQuizId = null;
            createQuizForm.reset();
            questionsContainer.innerHTML = '';
            showSection(homeSection);
        } else {
            // Create new quiz
            const quiz = {
                id: Date.now(),
                creator: currentUser,
                questions: []
            };
            for (const block of questionBlocks) {
                const questionText = block.querySelector('input[name="question"]').value.trim();
                const options = [
                    block.querySelector('input[name="option1"]').value.trim(),
                    block.querySelector('input[name="option2"]').value.trim(),
                    block.querySelector('input[name="option3"]').value.trim(),
                    block.querySelector('input[name="option4"]').value.trim()
                ];
                const correctRadio = block.querySelector('input[type="radio"]:checked');
                if (!correctRadio) {
                    alert('Please select the correct answer for all questions.');
                    return;
                }
                const correctIndex = parseInt(correctRadio.value);
                quiz.questions.push({
                    question: questionText,
                    options,
                    correctIndex
                });
            }
            quizzes.push(quiz);
            localStorage.setItem('quizzes', JSON.stringify(quizzes));
            alert('Quiz saved successfully!');
            createQuizForm.reset();
            questionsContainer.innerHTML = '';
            showSection(homeSection);
        }
    });

    // Add edit buttons to quiz list and implement editQuiz function
    function renderQuizList() {
        quizList.innerHTML = '';
        if (quizzes.length === 0) {
            quizList.innerHTML = '<li>No quizzes available.</li>';
            quizTakeContainer.classList.add('hidden-section');
            quizResults.classList.add('hidden-section');
            return;
        }
        quizzes.forEach(quiz => {
            const li = document.createElement('li');
            li.textContent = `Quiz by ${quiz.creator}`;
            li.dataset.quizId = quiz.id;

            // Add delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete Quiz';
            deleteBtn.style.marginRight = '10px';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this quiz?')) {
                    deleteQuiz(quiz.id);
                }
            });
            li.appendChild(deleteBtn);

            // Add edit button
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit Quiz';
            editBtn.style.marginLeft = '10px';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                editQuiz(quiz.id);
            });
            li.appendChild(editBtn);

            // Add click event to start quiz
            li.addEventListener('click', () => {
                startQuiz(quiz.id);
            });
            quizList.appendChild(li);
        });
        quizTakeContainer.classList.add('hidden-section');
        quizResults.classList.add('hidden-section');
    }

    function deleteQuiz(quizId) {
        const index = quizzes.findIndex(q => q.id === quizId);
        if (index !== -1) {
            quizzes.splice(index, 1);
            localStorage.setItem('quizzes', JSON.stringify(quizzes));
            alert('Quiz deleted successfully!');
            renderQuizList();
        } else {
            alert('Quiz not found.');
        }
    }

    function editQuiz(quizId) {
        const quiz = quizzes.find(q => q.id === quizId);
        if (!quiz) {
            alert('Quiz not found.');
            return;
        }
        editingQuizId = quizId;
        showSection(createQuizSection);
        createQuizForm.reset();
        questionsContainer.innerHTML = '';
        quiz.questions.forEach(q => {
            addQuestionBlock(q);
        });
    }


    createQuizForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const questionBlocks = questionsContainer.querySelectorAll('.question-block');
        if (questionBlocks.length === 0) {
            alert('Please add at least one question.');
            return;
        }
        const quiz = {
            id: Date.now(),
            creator: currentUser,
            questions: []
        };
        for (const block of questionBlocks) {
            const questionText = block.querySelector('input[name="question"]').value.trim();
            const options = [
                block.querySelector('input[name="option1"]').value.trim(),
                block.querySelector('input[name="option2"]').value.trim(),
                block.querySelector('input[name="option3"]').value.trim(),
                block.querySelector('input[name="option4"]').value.trim()
            ];
            const correctRadio = block.querySelector('input[type="radio"]:checked');
            if (!correctRadio) {
                alert('Please select the correct answer for all questions.');
                return;
            }
            const correctIndex = parseInt(correctRadio.value);
            quiz.questions.push({
                question: questionText,
                options,
                correctIndex
            });
        }
        quizzes.push(quiz);
        localStorage.setItem('quizzes', JSON.stringify(quizzes));
        alert('Quiz saved successfully!');
        createQuizForm.reset();
        questionsContainer.innerHTML = '';
        showSection(homeSection);
    });

    // Quiz taking
    const quizList = document.getElementById('quiz-list');
    const quizTakeContainer = document.getElementById('quiz-take-container');
    const quizTitle = document.getElementById('quiz-title');
    const quizForm = document.getElementById('quiz-form');
    const submitQuizBtn = document.getElementById('submit-quiz-btn');
    const quizResults = document.getElementById('quiz-results');
    const scoreDisplay = document.getElementById('score');
    const correctAnswersList = document.getElementById('correct-answers-list');

    function renderQuizList() {
        quizList.innerHTML = '';
        if (quizzes.length === 0) {
            quizList.innerHTML = '<li>No quizzes available.</li>';
            quizTakeContainer.classList.add('hidden-section');
            quizResults.classList.add('hidden-section');
            return;
        }
        quizzes.forEach(quiz => {
            const li = document.createElement('li');
            li.textContent = `Quiz by ${quiz.creator}`;
            li.dataset.quizId = quiz.id;
            li.addEventListener('click', () => {
                startQuiz(quiz.id);
            });
            quizList.appendChild(li);
        });
        quizTakeContainer.classList.add('hidden-section');
        quizResults.classList.add('hidden-section');
    }

    function startQuiz(quizId) {
        const quiz = quizzes.find(q => q.id == quizId);
        if (!quiz) return;
        quizTitle.textContent = `Quiz by ${quiz.creator}`;
        quizForm.innerHTML = '';
        quiz.questions.forEach((q, index) => {
            const div = document.createElement('div');
            div.classList.add('question');
            div.innerHTML = `
                <h4>Q${index + 1}: ${q.question}</h4>
                ${q.options.map((opt, i) => `
                    <label>
                        <input type="radio" name="q${index}" value="${i}" required />
                        ${opt}
                    </label><br/>
                `).join('')}
            `;
            quizForm.appendChild(div);
        });
        quizTakeContainer.classList.remove('hidden-section');
        submitQuizBtn.classList.remove('hidden-section');
        quizResults.classList.add('hidden-section');
    }

    submitQuizBtn.addEventListener('click', () => {
        const quizId = quizzes.find(q => q.creator === quizTitle.textContent.replace('Quiz by ', '')).id;
        const quiz = quizzes.find(q => q.id == quizId);
        if (!quiz) return;
        let score = 0;
        const total = quiz.questions.length;
        const correctAnswers = [];
        for (let i = 0; i < total; i++) {
            const selected = quizForm.querySelector(`input[name="q${i}"]:checked`);
            if (!selected) {
                alert('Please answer all questions.');
                return;
            }
            const answer = parseInt(selected.value);
            if (answer === quiz.questions[i].correctIndex) {
                score++;
                correctAnswers.push(`Q${i + 1}: Correct`);
            } else {
                correctAnswers.push(`Q${i + 1}: Incorrect (Correct: ${quiz.questions[i].options[quiz.questions[i].correctIndex]})`);
            }
        }
        scoreDisplay.textContent = `Your score: ${score} / ${total}`;
        correctAnswersList.innerHTML = '';
        correctAnswers.forEach(text => {
            const li = document.createElement('li');
            li.textContent = text;
            correctAnswersList.appendChild(li);
        });
        quizResults.classList.remove('hidden-section');
    });

    // User authentication (simple in-memory)
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            currentUser = user.username;
            localStorage.setItem('currentUser', currentUser);
            alert(`Welcome back, ${currentUser}!`);
            showSection(homeSection);
        } else {
            alert('Invalid email or password.');
        }
        loginForm.reset();
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();
        if (users.find(u => u.email === email)) {
            alert('Email already registered.');
            return;
        }
        users.push({ username, email, password });
        localStorage.setItem('users', JSON.stringify(users));
        alert('Registration successful! You can now log in.');
        registerForm.reset();
        showSection(loginSection);
    });
});

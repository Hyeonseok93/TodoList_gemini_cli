document.addEventListener('DOMContentLoaded', () => {
    const titleInput = document.getElementById('todo-title');
    const detailsInput = document.getElementById('todo-details');
    const saveButton = document.getElementById('save-button');
    const todoList = document.getElementById('todo-list');
    const taskStats = document.getElementById('task-stats');
    const clearCompletedButton = document.getElementById('clear-completed');
    const allButton = document.getElementById('all-button');
    
    // Modal Elements
    const modal = document.getElementById('custom-modal');
    const modalConfirm = document.getElementById('modal-confirm');
    const modalCancel = document.getElementById('modal-cancel');
    const modalMessage = document.getElementById('modal-message');

    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let nextId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;
    let newlyAddedId = null;

    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
        updateStats();
    };

    const updateStats = () => {
        const activeCount = todos.filter(t => !t.completed).length;
        taskStats.textContent = `${activeCount} Task${activeCount !== 1 ? 's' : ''} remaining`;
    };

    const renderTodos = () => {
        todoList.innerHTML = '';
        
        if (todos.length === 0) {
            todoList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="clipboard-list" class="empty-icon"></i>
                    <p>No tasks yet. Start by adding one above!</p>
                </div>
            `;
            lucide.createIcons();
            updateStats();
            return;
        }

        todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            if (todo.id === newlyAddedId) {
                li.classList.add('new-item');
            }
            li.setAttribute('data-id', todo.id);
            
            li.innerHTML = `
                <div class="todo-item-main">
                    <div class="custom-checkbox"></div>
                    <span class="todo-title">${todo.title}</span>
                    <div class="actions">
                        <button class="action-btn delete" title="Delete Task">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
                <div class="details-container">
                    <div class="details-content">
                        <span class="details-label">Notes</span>
                        <p>${todo.details || 'No additional notes provided.'}</p>
                    </div>
                </div>
            `;

            todoList.appendChild(li);
        });

        lucide.createIcons();
        updateStats();
        
        // Reset the newly added ID so it doesn't animate on next re-render
        newlyAddedId = null;
    };

    // Custom Modal Logic
    let onConfirmCallback = null;

    const showModal = (message, onConfirm) => {
        modalMessage.textContent = message;
        onConfirmCallback = onConfirm;
        modal.classList.add('active');
    };

    const hideModal = () => {
        modal.classList.remove('active');
        onConfirmCallback = null;
    };

    modalConfirm.addEventListener('click', () => {
        if (onConfirmCallback) onConfirmCallback();
        hideModal();
    });

    modalCancel.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });

    // Event Listeners
    saveButton.addEventListener('click', () => {
        const title = titleInput.value.trim();
        const details = detailsInput.value.trim();

        if (title === '') {
            titleInput.focus();
            return;
        }

        const newTodo = {
            id: nextId++,
            title,
            details,
            completed: false
        };

        newlyAddedId = newTodo.id;
        todos.unshift(newTodo);
        saveTodos();
        renderTodos();

        // Button effect
        saveButton.classList.add('success-pulse');
        setTimeout(() => saveButton.classList.remove('success-pulse'), 500);

        titleInput.value = '';
        detailsInput.value = '';
    });

    clearCompletedButton.addEventListener('click', () => {
        const completedCount = todos.filter(t => t.completed).length;
        if (completedCount === 0) return;
        
        showModal(
            `Are you sure you want to permanently delete ${completedCount} completed task(s)?`,
            () => {
                todos = todos.filter(t => !t.completed);
                saveTodos();
                renderTodos();
            }
        );
    });

    allButton.addEventListener('click', () => {
        if (todos.length === 0) return;
        const allCompleted = todos.every(t => t.completed);
        if (allCompleted) {
            todos.forEach(t => t.completed = false);
        } else {
            todos.forEach(t => t.completed = true);
        }
        saveTodos();
        renderTodos();
    });

    todoList.addEventListener('click', (e) => {
        const li = e.target.closest('.todo-item');
        if (!li) return;

        const todoId = parseInt(li.getAttribute('data-id'));
        const todoIndex = todos.findIndex(t => t.id === todoId);

        if (e.target.closest('.delete')) {
            e.stopPropagation();
            showModal("Are you sure you want to delete this task?", () => {
                todos.splice(todoIndex, 1);
                saveTodos();
                renderTodos();
            });
            return;
        }

        if (e.target.closest('.custom-checkbox')) {
            e.stopPropagation();
            todos[todoIndex].completed = !todos[todoIndex].completed;
            saveTodos();
            renderTodos();
            return;
        }

        if (e.target.closest('.todo-item-main')) {
            const isExpanded = li.classList.contains('expanded');
            document.querySelectorAll('.todo-item.expanded').forEach(item => {
                if (item !== li) item.classList.remove('expanded');
            });
            li.classList.toggle('expanded');
        }
    });

    renderTodos();
});

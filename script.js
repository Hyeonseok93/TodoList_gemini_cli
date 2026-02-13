document.addEventListener('DOMContentLoaded', () => {
    const titleInput = document.getElementById('todo-title');
    const detailsInput = document.getElementById('todo-details');
    const saveButton = document.getElementById('save-button');
    const todoList = document.getElementById('todo-list');

    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let nextId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;

    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
    };

    const renderTodos = () => {
        todoList.innerHTML = '';
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.setAttribute('data-id', todo.id);
            
            const titleSpan = document.createElement('span');
            titleSpan.textContent = todo.title;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '삭제';
            deleteButton.classList.add('delete-button');

            li.appendChild(titleSpan);
            li.appendChild(deleteButton);
            todoList.appendChild(li);
        });
    };

    saveButton.addEventListener('click', () => {
        const title = titleInput.value.trim();
        const details = detailsInput.value.trim();

        if (title === '') {
            alert('제목을 입력하세요.');
            return;
        }

        const newTodo = {
            id: nextId++,
            title,
            details
        };

        todos.push(newTodo);
        saveTodos();
        renderTodos();

        titleInput.value = '';
        detailsInput.value = '';
    });

    todoList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-button')) {
            const li = e.target.closest('li');
            const todoId = parseInt(li.getAttribute('data-id'));
            todos = todos.filter(todo => todo.id !== todoId);
            saveTodos();
            renderTodos();
        } else if (e.target.tagName === 'SPAN') {
            const li = e.target.closest('li');
            const todoId = parseInt(li.getAttribute('data-id'));
            const todo = todos.find(t => t.id === todoId);
            
            const existingDetails = li.querySelector('.details-view');
            if (existingDetails) {
                li.removeChild(existingDetails);
            } else {
                if (todo && todo.details) {
                    const detailsView = document.createElement('div');
                    detailsView.classList.add('details-view');
                    detailsView.textContent = todo.details;
                    li.appendChild(detailsView);
                }
            }
        }
    });

    renderTodos();
});
